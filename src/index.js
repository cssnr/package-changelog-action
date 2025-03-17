const fs = require('fs')
const path = require('path')

const core = require('@actions/core')
const github = require('@actions/github')

const { Base64 } = require('js-base64')
const PackageLockParser =
    require('snyk-nodejs-lockfile-parser/dist/parsers/package-lock-parser').PackageLockParser
const semverCompare = require('semver/functions/compare')

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
        console.log('github.context.ref:', github.context.ref)
        console.log('github.context.eventName:', github.context.eventName)
        console.log('github.context.payload.repo:', github.context.repo)
        core.endGroup() // Debug

        if (github.context.eventName !== 'release') {
            return core.warning(`Skipping event: ${github.context.eventName}`)
        }
        // if (github.context.payload.release.prerelease) {
        //     return core.warning(`Skipping prerelease.`)
        // }

        // Get Config
        const config = getConfig()
        core.startGroup('Parsed Config')
        console.log(config)
        core.endGroup() // Config

        // Set Variables
        const octokit = github.getOctokit(config.token)
        const packageLockParser = new PackageLockParser()

        // Get Releases
        console.log('config.release_id:', config.release_id)
        const [current, previous] = await getReleases(config, octokit)
        core.startGroup('Current Releases')
        console.log(current)
        core.endGroup() // Current Releases
        core.startGroup('Previous Releases')
        console.log(previous)
        core.endGroup() // Previous Releases
        if (!current) {
            return core.setFailed('Current Release Not Found!')
        }
        if (!previous) {
            return core.error('No Previous Release. Nothing to do...')
        }
        console.log('Current Tag:', current.tag_name)
        console.log('Previous Tag:', previous.tag_name)

        // Parse lockPath
        console.log('config.path:', config.path)
        const lockPath = path.resolve(process.cwd(), config.path)
        console.log('lockPath:', lockPath)
        if (!fs.existsSync(lockPath)) {
            return core.setFailed(`Unable to find lock file: ${config.path}`)
        }

        // CURRENT
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
        // CURRENT LOCK FILE - parseLockFile
        const currentLock = packageLockParser.parseLockFile(currentLockContent)
        // console.log('currentLock:', currentLock)

        // PREVIOUS
        const prevLockData = await octokit.rest.repos.getContent({
            ...github.context.repo,
            // path: getBasePath(config.path),
            path: config.path,
            ref: previous.tag_name,
            // ref: `refs/tags/v1.0.2`,
        })
        // console.log('prevLockData:', prevLockData)
        if (!prevLockData.data?.content) {
            return core.setFailed('Unable to parse base lock file.')
        }
        const prevLockContent = Base64.decode(prevLockData.data.content)
        // console.log('prevLockContent:', prevLockContent)
        // OLD LOCK FILE - prevLock
        const prevLock = packageLockParser.parseLockFile(prevLockContent)
        // console.log('prevLock:', prevLock)

        // Parse Changes
        const lockChanges = diffLocks(prevLock, currentLock)
        // console.log('lockChanges:', lockChanges)
        const table = genTable(lockChanges)
        // console.log('table:', table)
        const markdown = markdownTable(
            [['Package', '❔', 'Before', 'After'], ...table],
            { align: ['l', 'c', 'l', 'l'] }
        )
        // console.log('markdown:', markdown)

        core.startGroup('Current Release Body')
        core.info(current.body)
        core.endGroup() // Current Release Body

        // Make Changes
        core.startGroup('Updated Release Body')
        const body = `${current.body}\n\n${config.heading}\n${markdown}\n`
        console.log(body)
        core.endGroup() // Updated Release Body

        // Update Release
        if (config.update) {
            await octokit.rest.repos.updateRelease({
                ...github.context.repo,
                release_id: config.release_id,
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

function genTable(data) {
    const sections = [
        { key: 'added', head: 'Added', icon: '🆕' },
        { key: 'upgraded', head: 'Upgraded', icon: '✅' },
        { key: 'downgraded', head: 'Downgraded', icon: '⚠️' },
        { key: 'removed', head: 'Removed', icon: '⛔' },
    ]
    const results = []
    for (const sect of sections) {
        for (const item of data[sect.key]) {
            console.log(`${sect.head}:`, item)
            let name = item.name
            if (item.name.startsWith('node_modules/')) {
                name = name.slice(13)
            }
            results.push([name, sect.icon, item.before, item.after])
        }
    }
    // console.log('results:', results)
    return results
}

function diffLocks(previous, current) {
    // console.log('previous:', previous)
    // console.log('previous.packages:', previous.packages)
    // console.log('current:', current)
    // console.log('current.packages:', current.packages)
    if (!previous.packages || !current.packages) {
        throw new Error('No previous or current packages.')
    }
    const results = {
        downgraded: [], // -1
        unchanged: [], // 0
        upgraded: [], // 1
        added: [], // 2
        removed: [], // 3
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
    })
    core.startGroup('Last 30 Releases (debugging)')
    console.log(releases.data)
    core.endGroup() // Releases

    let previous
    let current
    let found = 0
    for (const release of releases.data) {
        // console.debug('release:', release)
        if (found) {
            previous = release
            break
        }
        if (release.id === config.release_id) {
            current = release
            found = 1
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
    core.summary.addRaw('🚀 We Did It Red It!\n\n')

    core.summary.addRaw('<details><summary>Changelog</summary>')
    core.summary.addRaw(markdown)
    core.summary.addRaw('</details>\n')

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

/**
 * Get Config
 * @return {{ path: string, update: boolean, heading: string, summary: boolean, token: string, release_id: number }}
 */
function getConfig() {
    return {
        path: core.getInput('path'),
        update: core.getBooleanInput('update'),
        heading: core.getInput('heading'),
        summary: core.getBooleanInput('summary'),
        token: core.getInput('token', { required: true }),
        release_id: github.context.payload.release.id,
    }
}
