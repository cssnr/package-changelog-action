[![GitHub Tag Major](https://img.shields.io/github/v/tag/cssnr/package-changelog-action?sort=semver&filter=!v*.*&logo=git&logoColor=white&labelColor=585858&label=%20)](https://github.com/cssnr/package-changelog-action/tags)
[![GitHub Tag Minor](https://img.shields.io/github/v/tag/cssnr/package-changelog-action?sort=semver&filter=!v*.*.*&logo=git&logoColor=white&labelColor=585858&label=%20)](https://github.com/cssnr/package-changelog-action/releases)
[![GitHub Release Version](https://img.shields.io/github/v/release/cssnr/package-changelog-action?logo=git&logoColor=white&labelColor=585858&label=%20)](https://github.com/cssnr/package-changelog-action/releases/latest)
[![GitHub Dist Size](https://img.shields.io/github/size/cssnr/package-changelog-action/dist%2Findex.js?logo=bookstack&logoColor=white&label=dist%20size)](https://github.com/cssnr/package-changelog-action/blob/master/src/index.js)
[![Workflow Release](https://img.shields.io/github/actions/workflow/status/cssnr/package-changelog-action/release.yaml?logo=cachet&label=release)](https://github.com/cssnr/package-changelog-action/actions/workflows/release.yaml)
[![Workflow Lint](https://img.shields.io/github/actions/workflow/status/cssnr/package-changelog-action/lint.yaml?logo=cachet&label=lint)](https://github.com/cssnr/package-changelog-action/actions/workflows/lint.yaml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=cssnr_package-changelog-action&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=cssnr_package-changelog-action)
[![GitHub Last Commit](https://img.shields.io/github/last-commit/cssnr/package-changelog-action?logo=github&label=updated)](https://github.com/cssnr/package-changelog-action/pulse)
[![Codeberg Last Commit](https://img.shields.io/gitea/last-commit/cssnr/package-changelog-action/master?gitea_url=https%3A%2F%2Fcodeberg.org%2F&logo=codeberg&logoColor=white&label=updated)](https://codeberg.org/cssnr/package-changelog-action)
[![GitHub Contributors](https://img.shields.io/github/contributors/cssnr/package-changelog-action?logo=github)](https://github.com/cssnr/package-changelog-action/graphs/contributors)
[![GitHub Repo Size](https://img.shields.io/github/repo-size/cssnr/package-changelog-action?logo=bookstack&logoColor=white&label=repo%20size)](https://github.com/cssnr/package-changelog-action?tab=readme-ov-file#readme)
[![GitHub Top Language](https://img.shields.io/github/languages/top/cssnr/package-changelog-action?logo=htmx)](https://github.com/cssnr/package-changelog-action?tab=readme-ov-file#readme)
[![GitHub Forks](https://img.shields.io/github/forks/cssnr/package-changelog-action?style=flat&logo=github)](https://github.com/cssnr/package-changelog-action/forks)
[![GitHub Discussions](https://img.shields.io/github/discussions/cssnr/package-changelog-action?logo=github)](https://github.com/cssnr/package-changelog-action/discussions)
[![GitHub Repo Stars](https://img.shields.io/github/stars/cssnr/package-changelog-action?style=flat&logo=github)](https://github.com/cssnr/package-changelog-action/stargazers)
[![GitHub Org Stars](https://img.shields.io/github/stars/cssnr?style=flat&logo=github&label=org%20stars)](https://cssnr.github.io/)
[![Discord](https://img.shields.io/discord/899171661457293343?logo=discord&logoColor=white&label=discord&color=7289da)](https://discord.gg/wXy6m2X8wY)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-72a5f2?logo=kofi&label=support)](https://ko-fi.com/cssnr)

# Package Changelog Action

- [Inputs](#Inputs)
  - [Permissions](#Permissions)
  - [Changelog Options](#Changelog-Options)
  - [Changelog Examples](#Changelog-Examples)
- [Outputs](#Outputs)
- [Examples](#Examples)
- [Tags](#Tags)
- [Features](#Features)
  - [Planned](#Planned)
- [Support](#Support)
- [Contributing](#Contributing)

Action to Generate Package Changelog. View some [Changelog Examples](#Changelog-Examples).

On a release, this action will parse the differences in the provided `package-lock.json` file
between the current and previous release and update the release notes with a table of changes.

On a prerelease it compares with the previous release, on a non-prerelease release,
it compares with the previous non-prerelease.

Packages get sorted into the following categories and columns:

| Name        | ❔  | Operation  | Before   | After   |
| :---------- | :-: | :--------- | :------- | :------ |
| @added      | 🆕  | Added      |          | current |
| @upgrade    | ✅  | Upgraded   | previous | current |
| @downgraded | ⚠️  | Downgraded | previous | current |
| @removed    | ⛔  | Removed    | previous |         |
| @unknown    | ❓  | Unknown    | previous | current |
| @unchanged  | 🔘  | Unchanged  | previous | current |

> [!TIP]  
> Both Columns and Section Order and Visibility can be Customized!  
> See [Changelog Options](#Changelog-Options) and [Changelog Examples](#Changelog-Examples) for more...

## Inputs

| Input    | Req. | Default&nbsp;Value           | Input&nbsp;Description                              |
| :------- | :--: | :--------------------------- | :-------------------------------------------------- |
| path     |  -   | `package-lock.json`          | Location of Lock File                               |
| update   |  -   | `true`                       | Update Release Notes [⤵️](#Changelog-Examples)      |
| heading  |  -   | `### Package Changes`        | Release Notes Heading [⤵️](#Changelog-Options)      |
| toggle   |  -   | `Click Here to View Changes` | Toggle Text for Summary [⤵️](#Changelog-Options)    |
| open     |  -   | `false`                      | Summary Open by Default [⤵️](#Changelog-Options)    |
| empty    |  -   | `false`                      | Add Summary on No Changes [⤵️](#Changelog-Options)  |
| columns  |  -   | `n,i,t,b,a`                  | Customize Table Columns [⤵️](#Changelog-Options)    |
| sections |  -   | `a,u,d,r,k`                  | Customize Package Sections [⤵️](#Changelog-Options) |
| max      |  -   | `30`                         | Max Releases to Process                             |
| summary  |  -   | `true`                       | Add Workflow Job Summary                            |
| token    |  -   | `github.token`               | For use with a PAT                                  |

You can add this to your release workflow with no inputs.

```yaml
- name: 'Package Changelog Action'
  continue-on-error: true
  uses: cssnr/package-changelog-action@v1
```

Note: `continue-on-error: true` is set here so your release workflow won't fail if processing the changelog fails.

See the [Changelog Options](#Changelog-Options) to customize the results.

### Permissions

This action requires the following permissions to update release notes:

```yaml
permissions:
  contents: write
```

Permissions documentation for [Workflows](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/controlling-permissions-for-github_token) and [Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication).

### Changelog Options

**update:** Set this to `false` if you only want to use the [Outputs](#Outputs).

**heading:** You can customize the `heading` or set to an empty string to remove it.

**toggle:** The `toggle` must be set to a non-empty string if changing this input.

**open:** Set summary to be open by default (note the first example below is open).

**empty:** Set this to `true` to update release notes when no changes are detected.

**columns:** Customize column visibility and order.
This must be a perfectly formatted CSV with any combination of these keys:

Default value: `n,i,t,b,a`

| Key | Column       | Column&nbsp;Description |
| :-: | :----------- | :---------------------- |
| `n` | Package Name | Name of the package     |
| `i` | ❔           | Icon of the outcome     |
| `t` | Outcome      | Text of the outcome     |
| `b` | Before       | Version before change   |
| `a` | After        | Version after change    |

**sections:** Customize section visibility and order.
This must be a perfectly formatted CSV with any combination of these keys:

Default value: `a,u,d,r,k`

| Key | Section    | Section&nbsp;Description    |
| :-: | :--------- | :-------------------------- |
| `a` | Added      | Newly added package         |
| `u` | Upgraded   | Updated package version     |
| `d` | Downgraded | Downgraded package version  |
| `r` | Removed    | Removed package             |
| `k` | Unknown    | Invalid semantic version    |
| `n` | Unchanged  | Package version not changed |

Note: Enabling Unchanged `n` packages can produce a very long list.

<details><summary>View the Column and Section Maps</summary>

```javascript
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
```

</details>

### Changelog Examples

💡 _Click on an example heading to expand or collapse the example._

_Note: Examples are generated with an empty header and default values._

<details open><summary>🔷 Default Example</summary>

---

<details open><summary>Click Here to View Changes</summary>

Changes for: [package-lock.json](package-lock.json)

| Package&nbsp;Name                            | ❔  | Before | After  |
| :------------------------------------------- | :-: | :----- | :----- |
| @eslint/config-helpers                       | 🆕  |        | 0.1.0  |
| @eslint-community/eslint-utils               | ✅  | 4.4.1  | 4.5.1  |
| @eslint/core                                 | ✅  | 0.11.0 | 0.12.0 |
| @eslint/eslintrc                             | ✅  | 3.2.0  | 3.3.0  |
| @eslint/js                                   | ✅  | 9.20.0 | 9.22.0 |
| @eslint/plugin-kit                           | ✅  | 0.2.5  | 0.2.7  |
| @humanwhocodes/retry                         | ✅  | 0.4.1  | 0.4.2  |
| @octokit/endpoint                            | ✅  | 9.0.5  | 9.0.6  |
| @octokit/graphql                             | ✅  | 7.1.0  | 7.1.1  |
| @octokit/plugin-paginate-rest                | ✅  | 9.2.1  | 9.2.2  |
| @octokit/request                             | ✅  | 8.4.0  | 8.4.1  |
| @octokit/request-error                       | ✅  | 5.1.0  | 5.1.1  |
| acorn                                        | ✅  | 8.14.0 | 8.14.1 |
| eslint                                       | ✅  | 9.20.1 | 9.22.0 |
| eslint-scope                                 | ✅  | 8.2.0  | 8.3.0  |
| flatted                                      | ✅  | 3.3.2  | 3.3.3  |
| prettier                                     | ✅  | 3.5.0  | 3.5.3  |
| @eslint/plugin-kit/node_modules/@eslint/core | ⛔  | 0.10.0 |        |

</details>

---

</details>
<details><summary>🔷 Example with No Changes</summary>

---

No changes detected in: [package-lock.json](package-lock.json)

---

</details>

More Changelog Examples Coming Soon...

For more options, see the [Changelog Options](#Changelog-Options).

## Outputs

| Output   | Output&nbsp;Description |
| :------- | :---------------------- |
| json     | Chnages JSON Object     |
| markdown | Changes Markdown Table  |

This outputs the changes `json` object and the `markdown` table.

```yaml
- name: 'Package Changelog Action'
  id: changelog
  uses: cssnr/package-changelog-action@v1

- name: 'Echo Output'
  env:
    JSON: ${{ steps.changelog.outputs.json }}
    MARKDOWN: ${{ steps.changelog.outputs.markdown }}
  run: |
    echo "json: '${{ env.JSON }}'"
    echo "markdown: '${{ env.MARKDOWN }}'"
```

Note: due to the way `${{}}` expressions are evaluated, multi-line output gets executed in a run block.

<details><summary>JSON Schema</summary>

```json
{
  "added": [{ "name": "", "after": "" }],
  "downgraded": [{ "name": "", "before": "", "after": "" }],
  "removed": [{ "name": "", "before": "" }],
  "unchanged": [{ "name": "", "before": "", "after": "" }],
  "unknown": [{ "name": "", "before": "", "after": "" }],
  "upgraded": [{ "name": "", "before": "", "after": "" }]
}
```

</details>

More Output Examples Coming Soon...

## Examples

💡 _Click on an example heading to expand or collapse the example._

<details open><summary>Custom Heading</summary>

```yaml
- name: 'Package Changelog Action'
  uses: cssnr/package-changelog-action@v1
  with:
    heading: '**NPM Changelog**'
```

</details>
<details><summary>Custom Column Order</summary>

```yaml
- name: 'Package Changelog Action'
  uses: cssnr/package-changelog-action@v1
  with:
    columns: 'n,t,b,a'
```

This removes the icon column.

</details>
<details><summary>Custom Section Order</summary>

```yaml
- name: 'Package Changelog Action'
  uses: cssnr/package-changelog-action@v1
  with:
    sections: 'u,a,d,r,k'
```

This changes the section order to put Updated before Added.

</details>
<details><summary>Use Outputs Only</summary>

```yaml
- name: 'Package Changelog Action'
  id: changelog
  uses: cssnr/package-changelog-action@v1
  with:
    update: false

- name: 'Echo Output'
  env:
    JSON: ${{ steps.changelog.outputs.json }}
    MARKDOWN: ${{ steps.changelog.outputs.markdown }}
  run: |
    echo "json: '${{ env.JSON }}'"
    echo "markdown: '${{ env.MARKDOWN }}'"
```

</details>
<details><summary>Full Workflow Example</summary>

```yaml
name: 'Release'

on:
  release:
    types: [published]

jobs:
  release:
    name: 'Release'
    runs-on: ubuntu-latest
    timeout-minutes: 5
    permissions:
      contents: write

    steps:
      - name: 'Package Changelog Action'
        uses: cssnr/package-changelog-action@v1
        continue-on-error: true
```

</details>

For more examples, you can check out other projects using this action:  
https://github.com/cssnr/package-changelog-action/network/dependents

## Tags

The following rolling [tags](https://github.com/cssnr/package-changelog-action/tags) are maintained.

| Version&nbsp;Tag                                                                                                                                                                                                                 | Rolling | Bugs | Feat. |   Name    |  Target  | Example  |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: | :--: | :---: | :-------: | :------: | :------- |
| [![GitHub Tag Major](https://img.shields.io/github/v/tag/cssnr/package-changelog-action?sort=semver&filter=!v*.*&style=for-the-badge&label=%20&color=44cc10)](https://github.com/cssnr/package-changelog-action/releases/latest) |   ✅    |  ✅  |  ✅   | **Major** | `vN.x.x` | `vN`     |
| [![GitHub Tag Minor](https://img.shields.io/github/v/tag/cssnr/package-changelog-action?sort=semver&filter=!v*.*.*&style=for-the-badge&label=%20&color=blue)](https://github.com/cssnr/package-changelog-action/releases/latest) |   ✅    |  ✅  |  ❌   | **Minor** | `vN.N.x` | `vN.N`   |
| [![GitHub Release](https://img.shields.io/github/v/release/cssnr/package-changelog-action?style=for-the-badge&label=%20&color=red)](https://github.com/cssnr/package-changelog-action/releases/latest)                           |   ❌    |  ❌  |  ❌   | **Micro** | `vN.N.N` | `vN.N.N` |

You can view the release notes for each version on the [releases](https://github.com/cssnr/package-changelog-action/releases) page.

The **Major** tag is recommended. It is the most up-to-date and always backwards compatible.
Breaking changes would result in a **Major** version bump. At a minimum you should use a **Minor** tag.

## Features

- Automatically parse differences between package-lock.json changes between releases.
- Sorts into sections: Added, Upgraded, Downgraded, Removed, Unknown, Unchanged.
- Option to customize sections visibility and sections order.
- Option to customize columns visibility and columns order.
- Option to display results expanded or collapsed.
- Outputs changes in JSON and markdown.

### Planned

- Work on Pull Requests
- Work on Workflow Dispatch
- Custom Column Alignment
- Custom Column Titles
- Custom Section Icons
- Custom Section Text

Want to show outdated packages on a pull request? Check out: [cssnr/npm-outdated-action](https://github.com/cssnr/npm-outdated-action?tab=readme-ov-file#readme)  
Want to automatically updated tags on release? Check out: [cssnr/update-version-tags-action](https://github.com/cssnr/update-version-tags-action?tab=readme-ov-file#readme)

If you would like to see a new feature, please [submit a feature request](https://github.com/cssnr/package-changelog-action/discussions/categories/feature-requests).

# Support

For general help or to request a feature, see:

- Q&A Discussion: https://github.com/cssnr/package-changelog-action/discussions/categories/q-a
- Request a Feature: https://github.com/cssnr/package-changelog-action/discussions/categories/feature-requests

If you are experiencing an issue/bug or getting unexpected results, you can:

- Report an Issue: https://github.com/cssnr/package-changelog-action/issues
- Chat with us on Discord: https://discord.gg/wXy6m2X8wY
- Provide General Feedback: [https://cssnr.github.io/feedback/](https://cssnr.github.io/feedback/?app=Update%20Release%20Notes)

For more information, see the CSSNR [SUPPORT.md](https://github.com/cssnr/.github/blob/master/.github/SUPPORT.md#support).

# Contributing

Please consider making a donation to support the development of this project
and [additional](https://cssnr.com/) open source projects.

[![Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/cssnr)

If you would like to submit a PR, please review the [CONTRIBUTING.md](#contributing-ov-file).

Additionally, you can support other GitHub Actions I have published:

- [Stack Deploy Action](https://github.com/cssnr/stack-deploy-action?tab=readme-ov-file#readme)
- [Portainer Stack Deploy](https://github.com/cssnr/portainer-stack-deploy-action?tab=readme-ov-file#readme)
- [VirusTotal Action](https://github.com/cssnr/virustotal-action?tab=readme-ov-file#readme)
- [Mirror Repository Action](https://github.com/cssnr/mirror-repository-action?tab=readme-ov-file#readme)
- [Update Version Tags Action](https://github.com/cssnr/update-version-tags-action?tab=readme-ov-file#readme)
- [Update JSON Value Action](https://github.com/cssnr/update-json-value-action?tab=readme-ov-file#readme)
- [Parse Issue Form Action](https://github.com/cssnr/parse-issue-form-action?tab=readme-ov-file#readme)
- [Cloudflare Purge Cache Action](https://github.com/cssnr/cloudflare-purge-cache-action?tab=readme-ov-file#readme)
- [Mozilla Addon Update Action](https://github.com/cssnr/mozilla-addon-update-action?tab=readme-ov-file#readme)
- [Docker Tags Action](https://github.com/cssnr/docker-tags-action?tab=readme-ov-file#readme)
- [Package Changelog Action](https://github.com/cssnr/package-changelog-action?tab=readme-ov-file#readme)
- [NPM Outdated Check Action](https://github.com/cssnr/npm-outdated-action?tab=readme-ov-file#readme)
- [Label Creator Action](https://github.com/cssnr/label-creator-action?tab=readme-ov-file#readme)
- [Algolia Crawler Action](https://github.com/cssnr/algolia-crawler-action?tab=readme-ov-file#readme)
- [Upload Release Action](https://github.com/cssnr/upload-release-action?tab=readme-ov-file#readme)
- [Check Build Action](https://github.com/cssnr/check-build-action?tab=readme-ov-file#readme)
- [Web Request Action](https://github.com/cssnr/web-request-action?tab=readme-ov-file#readme)

<details><summary>❔ Unpublished Actions</summary>

These actions are not published on the Marketplace, but may be useful.

Generic Actions:

- [cssnr/draft-release-action](https://github.com/cssnr/draft-release-action) - Keep a draft release ready to publish.
- [cssnr/env-json-action](https://github.com/cssnr/env-json-action) - Convert env file to json or vice versa.
- [cssnr/get-commit-action](https://github.com/cssnr/get-commit-action) - Get the current commit with full details.

Specific Actions:

- [cssnr/push-artifacts-action](https://github.com/cssnr/push-artifacts-action) - Sync's artifacts to a remote host.
- [smashedr/update-release-notes-action](https://github.com/smashedr/update-release-notes-action) - Update release notes.

---

</details>

<details><summary>📝 Template Actions</summary>

These are basic action templates that I use for creating new actions.

- [js-test-action](https://github.com/smashedr/js-test-action?tab=readme-ov-file#readme) - JavaScript
- [py-test-action](https://github.com/smashedr/py-test-action?tab=readme-ov-file#readme) - Python
- [ts-test-action](https://github.com/smashedr/ts-test-action?tab=readme-ov-file#readme) - TypeScript
- [docker-test-action](https://github.com/smashedr/docker-test-action?tab=readme-ov-file#readme) - Docker Image

Note: The `docker-test-action` builds, runs and pushes images to [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry).

---

</details>

For a full list of current projects visit: [https://cssnr.github.io/](https://cssnr.github.io/)
