// const fs = require('fs')
// const path = require('path')

const core = require('@actions/core')
const github = require('@actions/github')

const { Base64 } = require('js-base64')
const PackageLockParser =
    require('snyk-nodejs-lockfile-parser/dist/parsers/package-lock-parser').PackageLockParser
const semverCompare = require('semver/functions/compare')
const semverValid = require('semver/functions/valid')

import { markdownTable } from 'markdown-table'

// main
;(async () => {
    try {
        core.info(`🏳️ Starting Package Changelog Action`)

        // // Extra Debug
        // core.startGroup('Debug: github.context')
        // console.log(github.context)
        // core.endGroup() // Debug github.context
        // core.startGroup('Debug: process.env')
        // console.log(process.env)
        // core.endGroup() // Debug process.env

        // Debug
        core.startGroup('Debug')
        console.log('github.context.payload.repo:', github.context.repo)
        console.log('github.context.eventName:', github.context.eventName)
        console.log('github.context.ref:', github.context.ref)
        core.endGroup() // Debug

        if (github.context.eventName !== 'release') {
            return core.warning(`Skipping event: ${github.context.eventName}`)
        }

        // Get Config
        const config = getConfig()
        core.startGroup('Parsed Config')
        console.log(config)
        core.endGroup() // Config

        if (!config.max || config.max > 100) {
            return core.setFailed('The max must be between 1 and 100.')
        }

        // Set Variables
        const octokit = github.getOctokit(config.token)
        const packageLockParser = new PackageLockParser()

        // STAGE 1 - Parsing Event and Current/Previous Tags (may have to use hashes)

        // Process Releases Event
        console.log('release_id:', github.context.payload.release.id)
        const [current, previous] = await getReleases(config, octokit)

        // core.startGroup('Current Releases')
        // console.log(current)
        // core.endGroup() // Current Releases
        // core.startGroup('Previous Releases')
        // console.log(previous)
        // core.endGroup() // Previous Releases

        if (!current) {
            return core.setFailed('Current Release Not Found!')
        }
        if (!previous) {
            return core.error('No Previous Release. Nothing to do...')
        }
        console.log('Current Tag:', current.tag_name)
        console.log('Previous Tag:', previous.tag_name)

        // STAGE 2 - Processing Lock Files

        // Current
        const currentLockData = await octokit.rest.repos.getContent({
            ...github.context.repo,
            // path: getBasePath(config.path),
            path: config.path,
            ref: current.tag_name,
            // ref: `refs/tags/v1.0.1`,
        })
        // console.log('currentLockData:', currentLockData)
        if (!currentLockData.data?.content) {
            return core.setFailed('Unable to parse current lock file.')
        }
        const currentLockContent = Base64.decode(currentLockData.data.content)
        // console.log('lockContent:', lockContent)
        // Current - parseLockFile
        const currentLock = packageLockParser.parseLockFile(currentLockContent)
        // console.log('currentLock:', currentLock)

        // Previous
        const prevLockData = await octokit.rest.repos.getContent({
            ...github.context.repo,
            // path: getBasePath(config.path),
            path: config.path,
            ref: previous.tag_name,
            // ref: `refs/tags/v1.0.2`,
        })
        // console.log('prevLockData:', prevLockData)
        if (!prevLockData.data?.content) {
            return core.setFailed('Unable to parse previous lock file.')
        }
        const prevLockContent = Base64.decode(prevLockData.data.content)
        // console.log('prevLockContent:', prevLockContent)
        // Previous - prevLock
        const prevLock = packageLockParser.parseLockFile(prevLockContent)
        // console.log('prevLock:', prevLock)

        // // For use with pull_request events
        // // Parse lockPath
        // console.log('config.path:', config.path)
        // const lockPath = path.resolve(process.cwd(), config.path)
        // console.log('lockPath:', lockPath)
        // if (!fs.existsSync(lockPath)) {
        //     return core.setFailed(`Unable to find lock file: ${config.path}`)
        // }

        // STAGE 3 - Process Results

        // Parse Changes
        const lockChanges = diffLocks(prevLock, currentLock)
        // console.log('lockChanges:', lockChanges)
        const tableData = genTable(config, lockChanges)
        // console.log('tableData:', tableData)
        const markdown = genMarkdown(config, tableData)
        console.log('markdown:', markdown)

        core.startGroup('Current Release Body')
        core.info(current.body)
        core.endGroup() // Current Release Body

        // Make Changes
        core.startGroup('Updated Release Body')
        const body = `${current.body}\n\n${markdown}\n`
        console.log(body)
        core.endGroup() // Updated Release Body

        // Update Release
        if (config.update) {
            core.info('⌛ \u001b[33;1mUpdating Release Now...')
            await octokit.rest.repos.updateRelease({
                ...github.context.repo,
                release_id: github.context.payload.release.id,
                body,
            })
        } else {
            core.info('⏩ \u001b[33;1mSkipping Release Notes Update')
        }

        // Outputs
        core.info('📩 Setting Outputs')
        core.setOutput('json', lockChanges)
        core.setOutput('markdown', markdown)
        // core.setOutput('notes', notes)

        // Summary
        if (config.summary) {
            core.info('📝 Writing Job Summary')
            await addSummary(config, markdown)
        }

        core.info(`✅ \u001b[32;1mFinished Success`)
    } catch (e) {
        core.debug(e)
        core.info(e.message)
        core.setFailed(e.message)
    }
})()

function genMarkdown(config, data) {
    const cols = []
    const align = []
    config.columns.forEach((c) => cols.push(maps.col[c].col))
    config.columns.forEach((c) => align.push(maps.col[c].align))
    console.log('cols:', cols)
    console.log('align:', align)

    const table = markdownTable([cols, ...data], { align })
    console.log('table:', table)
    let result = `${config.heading}\n\n`
    if (data.length) {
        const open = config.open ? ' open' : ''
        result +=
            `<details${open}><summary>${config.toggle}</summary>\n\n` +
            `Changes for: [${config.path}](${config.path})\n\n${table}\n\n</details>\n`
    } else {
        result += `No changes detected in: [${config.path}](${config.path})`
    }
    return result
}

function genTable(config, data) {
    const sections = []
    config.sections.forEach((s) => sections.push(maps.sec[s]))
    console.log('sections:', sections)
    const results = []
    for (const section of sections) {
        console.log('Processing section:', section)
        for (const item of data[section.key]) {
            // console.log('item:', item)
            let name = item.name
            if (item.name.startsWith('node_modules/')) {
                name = name.slice(13)
            }
            // console.log('name:', name)
            const pkg = {
                n: name,
                i: section.icon,
                t: section.text,
                b: item.before,
                a: item.after,
            }
            // console.log('pkg:', pkg)
            const result = []
            config.columns.forEach((k) => result.push(pkg[k]))
            // console.log('result:', result)
            results.push(result)
        }
    }
    // console.log('results:', results)
    return results
}

function diffLocks(previous, current) {
    // console.log('previous.packages:', previous.packages)
    // console.log('current.packages:', current.packages)
    if (!previous.packages || !current.packages) {
        console.log('previous:', previous)
        console.log('current:', current)
        throw new Error('No previous or current packages.')
    }
    const results = {
        downgraded: [], // -1
        unchanged: [], // 0
        upgraded: [], // 1
        added: [], // 2
        removed: [], // 3
        unknown: [], // 4
    }
    for (const [name, data] of Object.entries(current.packages)) {
        if (!name) {
            continue
        }
        // console.log('name:', name)
        // console.log('data:', data)
        const previousData = previous.packages[name]
        // console.log('previousData:', previousData)
        if (previousData) {
            if (
                !semverValid(data.version) ||
                !semverValid(previousData.version)
            ) {
                addResults(results, 4, name, data)
            }
            const cmp = semverCompare(data.version, previousData.version)
            addResults(results, cmp, name, data, previousData)
        } else {
            addResults(results, 2, name, data)
        }
    }
    for (const [name, data] of Object.entries(previous.packages)) {
        if (!name) {
            continue
        }
        if (!current.packages[name]) {
            addResults(results, 3, name, null, data)
        }
    }
    return results
}

function addResults(results, type, name, current, previous) {
    // console.log('current:', current)
    // console.log('previous:', previous)
    const status = {
        '-1': 'downgraded',
        0: 'unchanged',
        1: 'upgraded',
        2: 'added',
        3: 'removed',
        4: 'unknown',
    }
    results[status[type]].push({
        name,
        before: previous?.version,
        after: current?.version,
    })
}

/**
 * Get Current and Previous Release
 * @param config
 * @param octokit
 * @return {Promise<[Object|undefined, Object|undefined]>}
 */
async function getReleases(config, octokit) {
    const releases = await octokit.rest.repos.listReleases({
        ...github.context.repo,
        per_page: config.max,
    })
    // core.startGroup('Releases')
    // console.log(releases.data)
    // core.endGroup() // Releases

    let previous
    let current
    for (const release of releases.data) {
        console.debug('--- Processing:', release.tag_name)
        if (current) {
            if (current.prerelease) {
                console.log('Previous Release:', release.tag_name)
                previous = release
                break
            }
            if (release.prerelease) {
                continue
            }
            console.log('Previous Release:', release.tag_name)
            previous = release
            break
        }
        if (release.id === github.context.payload.release.id) {
            console.log('Current Release:', release.tag_name)
            current = release
        }
    }
    return [current, previous]
}

/**
 * Add Summary
 * @param {Object} config
 * @param {String} markdown
 * @return {Promise<void>}
 */
async function addSummary(config, markdown) {
    core.summary.addRaw('## Package Changelog Action\n\n')
    // core.summary.addRaw('<details><summary>Changelog</summary>')
    // core.summary.addRaw(`\n\n${markdown}\n\n`)
    // core.summary.addRaw('</details>\n')
    core.summary.addRaw(`---\n\n${markdown}\n\n---\n\n`)

    delete config.token
    const yaml = Object.entries(config)
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
        .join('\n')
    core.summary.addRaw('<details><summary>Config</summary>')
    core.summary.addCodeBlock(yaml, 'yaml')
    core.summary.addRaw('</details>\n')

    const text = 'View Documentation, Report Issues or Request Features'
    const link = 'https://github.com/smashedr/package-changelog-action'
    core.summary.addRaw(`\n[${text}](${link}?tab=readme-ov-file#readme)\n\n---`)
    await core.summary.write()
}

const maps = {
    col: {
        n: { align: 'l', col: 'Package&nbsp;Name' },
        i: { align: 'c', col: '❔' },
        t: { align: 'c', col: 'Operation' },
        b: { align: 'l', col: 'Before' },
        a: { align: 'l', col: 'After' },
    },
    sec: {
        a: { icon: '🆕', text: 'Added', key: 'added' },
        u: { icon: '✅', text: 'Upgraded', key: 'upgraded' },
        d: { icon: '⚠️', text: 'Downgraded', key: 'downgraded' },
        r: { icon: '⛔', text: 'Removed', key: 'removed' },
        k: { icon: '❓', text: 'Unknown', key: 'unknown' },
        n: { icon: '🔘', text: 'Unchanged', key: 'unchanged' },
    },
}

/**
 * Get Config
 * @return {{ path: string, update: boolean, heading: string, toggle: string, open: boolean, columns: array, sections: array, max: number, summary: boolean, token: string }}
 */
function getConfig() {
    return {
        path: core.getInput('path', { required: true }),
        update: core.getBooleanInput('update'),
        heading: core.getInput('heading'),
        toggle: core.getInput('toggle', { required: true }),
        open: core.getBooleanInput('open'),
        columns: core.getInput('columns', { required: true }).split(','),
        sections: core.getInput('sections', { required: true }).split(','),
        max: parseInt(core.getInput('max', { required: true })),
        summary: core.getBooleanInput('summary'),
        token: core.getInput('token', { required: true }),
    }
}
