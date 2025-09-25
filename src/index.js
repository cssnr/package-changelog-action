const core = require('@actions/core')
const github = require('@actions/github')

const PackageLockParser = require('snyk-nodejs-lockfile-parser/dist/parsers/package-lock-parser')
const semverCompare = require('semver/functions/compare')
const semverValid = require('semver/functions/valid')

const { Base64 } = require('js-base64')
const { markdownTable } = require('markdown-table')

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

        // Get Inputs
        const inputs = getInputs()
        core.startGroup('Parsed Inputs')
        console.log(inputs)
        core.endGroup() // Get Inputs
        if (!inputs.max || inputs.max > 100) {
            return core.setFailed('The max must be between 1 and 100.')
        }

        // Set Variables
        const octokit = github.getOctokit(inputs.token)
        const packageLockParser = new PackageLockParser.PackageLockParser()

        // STAGE 1 - Parsing Event and Current/Previous Tags

        // Process Releases
        core.startGroup(`Processing: ${github.context.payload.release.id}`)
        const [current, previous] = await getReleases(inputs, octokit)
        core.endGroup() // Processing

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

        // STAGE 2 - Processing Lock Files

        // currentLock
        const currentFile = await getLock(inputs, octokit, current.tag_name)
        const currentLock = packageLockParser.parseLockFile(currentFile)
        // console.log('currentLock:', currentLock)

        // prevLock
        const prevFile = await getLock(inputs, octokit, previous.tag_name)
        const prevLock = packageLockParser.parseLockFile(prevFile)
        // console.log('prevLock:', prevLock)

        // STAGE 3 - Process Results

        // Parse Changes
        core.startGroup('Processing Results')
        const data = diffLocks(prevLock, currentLock)
        // console.log('data:', data)
        const tableData = genTable(inputs, data)
        // console.log('tableData:', tableData)
        const markdown = genMarkdown(inputs, tableData)
        // console.log('markdown:', markdown)
        core.endGroup() // Processing Results

        if (!tableData.length) {
            core.info('No Changes Found!')
        }

        // Update Release
        if (inputs.update && (tableData.length || inputs.empty)) {
            core.startGroup('Current Release Body')
            core.info(current.body)
            core.endGroup() // Current Release Body
            const body = `${current.body}\n\n${markdown}\n`
            core.startGroup('Updated Release Body')
            console.log(body)
            core.endGroup() // Updated Release Body

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
        core.setOutput('json', JSON.stringify(data))
        core.setOutput('markdown', markdown)

        // Summary
        if (inputs.summary) {
            core.info('📝 Writing Job Summary')
            try {
                await addSummary(inputs, markdown)
            } catch (e) {
                console.log(e)
                core.error(`Error writing Job Summary ${e.message}`)
            }
        }

        core.info(`✅ \u001b[32;1mFinished Success`)
    } catch (e) {
        core.debug(e)
        core.info(e.message)
        core.setFailed(e.message)
    }
})()

/**
 * Generate Markdown
 * @param {Inputs} inputs
 * @param {String[]} array
 * @return {String}
 */
function genMarkdown(inputs, array) {
    const [cols, align] = [[], []]
    inputs.columns.forEach((c) => cols.push(maps.col[c].col))
    inputs.columns.forEach((c) => align.push(maps.col[c].align))
    console.log('cols, align:', cols, align)

    const table = markdownTable([cols, ...array], { align })
    console.log('table:', table)
    let result = `${inputs.heading}\n\n`
    if (array.length) {
        const open = inputs.open ? ' open' : ''
        result +=
            `<details${open}><summary>${inputs.toggle}</summary>\n\n` +
            `Changes for: [${inputs.path}](${inputs.path})\n\n${table}\n\n</details>\n`
    } else {
        result += `No changes detected in: [${inputs.path}](${inputs.path})`
    }
    return result
}

/**
 * Get Table Array
 * @param {Inputs} inputs
 * @param {{downgraded: *[], unchanged: *[], upgraded: *[], added: *[], removed: *[], unknown: *[]}} data
 * @return {*[]}
 */
function genTable(inputs, data) {
    const sections = []
    inputs.sections.forEach((s) => sections.push(maps.sec[s]))
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
            inputs.columns.forEach((k) => result.push(pkg[k]))
            // console.log('result:', result)
            results.push(result)
        }
    }
    // console.log('results:', results)
    return results
}

/**
 * Get Lock File Content
 * @param {Inputs} inputs
 * @param {InstanceType<typeof github.GitHub>} octokit
 * @param {String} ref
 * @return {Promise<String>}
 */
async function getLock(inputs, octokit, ref) {
    const lockData = await octokit.rest.repos.getContent({
        ...github.context.repo,
        path: inputs.path,
        ref,
    })
    if (!lockData.data?.content) {
        console.log('lockData:', lockData)
        throw new Error('Unable to parse lock file content.')
    }
    return Base64.decode(lockData.data.content)
}

/**
 * Diff Lock Files
 * @param {Object} previous
 * @param {Object} current
 * @return {{downgraded: *[], unchanged: *[], upgraded: *[], added: *[], removed: *[], unknown: *[]}}
 */
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
            if (!semverValid(data.version) || !semverValid(previousData.version)) {
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
 * Get Current/Previous Releases
 * @param {Inputs} inputs
 * @param {InstanceType<typeof github.GitHub>} octokit
 * @return {Promise<[Object|undefined, Object|undefined]>}
 */
async function getReleases(inputs, octokit) {
    const releases = await octokit.rest.repos.listReleases({
        ...github.context.repo,
        per_page: inputs.max,
    })
    // core.startGroup('Releases')
    // console.log(releases.data)
    // core.endGroup() // Releases

    let previous
    let current
    for (const release of releases.data) {
        console.debug(`--- Processing ${release.id}:`, release.tag_name)
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
 * @param {Inputs} inputs
 * @param {String} markdown
 * @return {Promise<void>}
 */
async function addSummary(inputs, markdown) {
    core.summary.addRaw('## Package Changelog Action\n\n')
    // core.summary.addRaw('<details><summary>Changelog</summary>')
    // core.summary.addRaw(`\n\n${markdown}\n\n`)
    // core.summary.addRaw('</details>\n')
    core.summary.addRaw(`---\n\n${markdown}\n\n---\n\n`)

    delete inputs.token
    const yaml = Object.entries(inputs)
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
        .join('\n')
    core.summary.addRaw('<details><summary>Inputs</summary>')
    core.summary.addCodeBlock(yaml, 'yaml')
    core.summary.addRaw('</details>\n')

    const text = 'View Documentation, Report Issues or Request Features'
    const link = 'https://github.com/cssnr/package-changelog-action'
    core.summary.addRaw(`\n[${text}](${link}?tab=readme-ov-file#readme)\n\n---`)
    await core.summary.write()
}

/**
 * Get Inputs
 * @typedef {Object} Inputs
 * @property {String} path
 * @property {Boolean} update
 * @property {String} heading
 * @property {String} toggle
 * @property {Boolean} open
 * @property {Boolean} empty
 * @property {Array} columns
 * @property {Array} sections
 * @property {Number} max
 * @property {Boolean} summary
 * @property {String} token
 * @return {Inputs}
 */
function getInputs() {
    return {
        path: core.getInput('path', { required: true }),
        update: core.getBooleanInput('update'),
        heading: core.getInput('heading'),
        toggle: core.getInput('toggle', { required: true }),
        open: core.getBooleanInput('open'),
        empty: core.getBooleanInput('empty'),
        columns: core.getInput('columns', { required: true }).split(','),
        sections: core.getInput('sections', { required: true }).split(','),
        max: parseInt(core.getInput('max', { required: true })),
        summary: core.getBooleanInput('summary'),
        token: core.getInput('token', { required: true }),
    }
}
