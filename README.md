[![GitHub Tag Major](https://img.shields.io/github/v/tag/smashedr/package-changelog-action?sort=semver&filter=!v*.*&logo=git&logoColor=white&labelColor=585858&label=%20)](https://github.com/smashedr/package-changelog-action/tags)
[![GitHub Tag Minor](https://img.shields.io/github/v/tag/smashedr/package-changelog-action?sort=semver&filter=!v*.*.*&logo=git&logoColor=white&labelColor=585858&label=%20)](https://github.com/smashedr/package-changelog-action/tags)
[![GitHub Release Version](https://img.shields.io/github/v/release/smashedr/package-changelog-action?logo=git&logoColor=white&label=latest)](https://github.com/smashedr/package-changelog-action/releases/latest)
[![GitHub Dist Size](https://img.shields.io/github/size/smashedr/package-changelog-action/dist%2Findex.js?label=dist%20size)](https://github.com/smashedr/package-changelog-action/blob/master/src/index.js)
[![Workflow Release](https://img.shields.io/github/actions/workflow/status/smashedr/package-changelog-action/release.yaml?logo=github&label=release)](https://github.com/smashedr/package-changelog-action/actions/workflows/release.yaml)
[![Workflow Test](https://img.shields.io/github/actions/workflow/status/smashedr/package-changelog-action/test.yaml?logo=github&label=test)](https://github.com/smashedr/package-changelog-action/actions/workflows/test.yaml)
[![Workflow lint](https://img.shields.io/github/actions/workflow/status/smashedr/package-changelog-action/lint.yaml?logo=github&label=lint)](https://github.com/smashedr/package-changelog-action/actions/workflows/lint.yaml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=smashedr_package-changelog-action&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=smashedr_package-changelog-action)
[![GitHub Last Commit](https://img.shields.io/github/last-commit/smashedr/package-changelog-action?logo=github&label=updated)](https://github.com/smashedr/package-changelog-action/graphs/commit-activity)
[![Codeberg Last Commit](https://img.shields.io/gitea/last-commit/shaner/package-changelog-action/master?gitea_url=https%3A%2F%2Fcodeberg.org%2F&logo=codeberg&logoColor=white&label=updated)](https://codeberg.org/shaner/package-changelog-action)
[![GitHub Top Language](https://img.shields.io/github/languages/top/smashedr/package-changelog-action?logo=htmx)](https://github.com/smashedr/package-changelog-action)
[![GitHub Forks](https://img.shields.io/github/forks/smashedr/package-changelog-action?style=flat&logo=github)](https://github.com/smashedr/package-changelog-action/forks)
[![GitHub Repo Stars](https://img.shields.io/github/stars/smashedr/package-changelog-action?style=flat&logo=github)](https://github.com/smashedr/package-changelog-action/stargazers)
[![GitHub Org Stars](https://img.shields.io/github/stars/cssnr?style=flat&logo=github&label=org%20stars)](https://cssnr.github.io/)
[![Discord](https://img.shields.io/discord/899171661457293343?logo=discord&logoColor=white&label=discord&color=7289da)](https://discord.gg/wXy6m2X8wY)

# Package Changelog Action

- [Inputs](#Inputs)
  - [Permissions](#Permissions)
- [Outputs](#Outputs)
- [Examples](#Examples)
- [Tags](#Tags)
- [Features](#Features)
  - [Planned](#Planned)
- [Support](#Support)
- [Contributing](#Contributing)

Action to Generate Package Changelog.

On a release, this action will parse the differences in the provided `package-lock.json` file
between the current and previous release and update the release notes with a table of changes.

On a prerelease it compares with the previous release, on a non-prerelease release,
it compares with the previous non-prerelease.

Packages get sorted into the following categories:

| Package    | ❔  | Before   | After   |
| :--------- | :-: | :------- | :------ |
| Added      | 🆕  |          | current |
| Upgraded   | ✅  | previous | current |
| Downgraded | ⚠️  | previous | current |
| Removed    | ⛔  | previous |         |
| Unknown    | ❓  |          |         |
| Unchanged  | 🔘  | previous | current |

Unchanged is disabled by default and Unknown happens when a semantic version is invalid.

## Inputs

| Input     | Req. | Default&nbsp;Value           | Input&nbsp;Description     |
| :-------- | :--: | :--------------------------- | :------------------------- |
| path      |  -   | `package-lock.json`          | Location of Lock file      |
| update    |  -   | `true`                       | Update Release Notes \*    |
| heading   |  -   | `### Package Changes`        | Release Notes Heading \*   |
| text      |  -   | `Click Here to View Changes` | Summary Toggle Text \*     |
| open      |  -   | `false`                      | Summary Open by Default    |
| unchanged |  -   | `false`                      | Include Unchanged Packages |
| max       |  -   | `30`                         | Max Releases to Process    |
| summary   |  -   | `true`                       | Add Summary to Job         |
| token     |  -   | `github.token`               | For use with a PAT [^1]    |

**update:** Set this to `false` if you only want to use the [Outputs](#Outputs).

**heading/text:** You can set the `heading` to an empty string to remove it.
The `text` must be set to a non-empty string if setting.

**summary:** Will add the results to the job summary in the workflow results.

<details><summary>View an Example Release Notes Update</summary>

---

### Package Changes

<details open><summary>Click Here to View Changes</summary>

Changes for: [package-lock.json](package-lock.json)

| Package                                      | ❔  | Before | After  |
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

<details><summary>Example Release Notes Update with No Changes</summary>

---

### Package Changes

No changes detected in: [package-lock.json](package-lock.json)

---

</details>

With no inputs this will append a link to report issues.

```yaml
- name: 'Package Changelog Action'
  uses: smashedr/package-changelog-action@master
```

### Permissions

This action requires the following permissions to update release notes:

```yaml
permissions:
  contents: write
```

## Outputs

| Output   | Output&nbsp;Description |
| :------- | :---------------------- |
| json     | Chnages JSON Object     |
| markdown | Changes Markdown Table  |

This outputs the changes `json` object and the `markdown` table.

Output examples coming soon...

```yaml
- name: 'Package Changelog Action'
  id: changelog
  uses: smashedr/package-changelog-action@master

- name: 'Echo Output'
  env:
    JSON: ${{ steps.test.outputs.json }}
    MARKDOWN: ${{ steps.test.outputs.markdown }}
  run: |
    echo "json: '${{ env.JSON }}'"
    echo "markdown: '${{ env.MARKDOWN }}'"
```

Note: due to the way `${{}}` expressions are evaluated, multi-line output gets executed in a run block.

## Examples

💡 _Click on an example heading to expand or collapse the example._

<details open><summary>Custom Heading</summary>

```yaml
- name: 'Package Changelog Action'
  uses: smashedr/package-changelog-action@master
  with:
    heading: '**NPM Changelog**'
```

</details>
<details><summary>Detailed Custom Heading</summary>

```yaml
- name: 'Package Changelog Action'
  uses: smashedr/package-changelog-action@master
  with:
    heading: |
      ---

      # Package Changes
```

</details>
<details><summary>Use Outputs Only</summary>

```yaml
- name: 'Package Changelog Action'
  id: changelog
  uses: smashedr/package-changelog-action@master
  with:
    update: false

- name: 'Echo Output'
  run: |
    echo "json: '${{ steps.changelog.outputs.json }}'"
    echo "markdown: '${{ steps.changelog.outputs.markdown }}'"
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
        uses: smashedr/package-changelog-action@master
        continue-on-error: true
```

</details>

More Examples Coming Soon...

## Tags

The following rolling [tags](https://github.com/smashedr/package-changelog-action/tags) are maintained.

| Version&nbsp;Tag                                                                                                                                                                                                                       | Rolling | Bugs | Feat. |   Name    |  Target  | Example  |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: | :--: | :---: | :-------: | :------: | :------- |
| [![GitHub Tag Major](https://img.shields.io/github/v/tag/smashedr/package-changelog-action?sort=semver&filter=!v*.*&style=for-the-badge&label=%20&color=44cc10)](https://github.com/smashedr/package-changelog-action/releases/latest) |   ✅    |  ✅  |  ✅   | **Major** | `vN.x.x` | `vN`     |
| [![GitHub Tag Minor](https://img.shields.io/github/v/tag/smashedr/package-changelog-action?sort=semver&filter=!v*.*.*&style=for-the-badge&label=%20&color=blue)](https://github.com/smashedr/package-changelog-action/releases/latest) |   ✅    |  ✅  |  ❌   | **Minor** | `vN.N.x` | `vN.N`   |
| [![GitHub Release](https://img.shields.io/github/v/release/smashedr/package-changelog-action?style=for-the-badge&label=%20&color=red)](https://github.com/smashedr/package-changelog-action/releases/latest)                           |   ❌    |  ❌  |  ❌   | **Micro** | `vN.N.N` | `vN.N.N` |

You can view the release notes for each version on the [releases](https://github.com/cssnr/cloudflare-purge-cache-action/releases) page.

The **Major** tag is recommended. It is the most up-to-date and always backwards compatible.
Breaking changes would result in a **Major** version bump. At a minimum you should use a **Minor** tag.

## Features

- Automatically parse differences between package-lock.json changes between releases.
- Sorts into 5 categories: Added, Upgraded, Downgraded, Removed, Unknown, Unchanged.
- Option to include Unchanged packages (disabled by default).
- Option to display results initially expanded or collapsed.
- Option to customize the heading and toggle text.
- Outputs changes in JSON and markdown.

### Planned

- Work on Pull Requests.
- Work on Workflow Dispatch.
- Custom Category Order.
- Custom Section Icons.

# Support

For general help or to request a feature, see:

- Q&A Discussion: https://github.com/smashedr/package-changelog-action/discussions/categories/q-a
- Request a Feature: https://github.com/smashedr/package-changelog-action/discussions/categories/feature-requests

If you are experiencing an issue/bug or getting unexpected results, you can:

- Report an Issue: https://github.com/smashedr/package-changelog-action/issues
- Chat with us on Discord: https://discord.gg/wXy6m2X8wY
- Provide General Feedback: [https://cssnr.github.io/feedback/](https://cssnr.github.io/feedback/?app=Update%20Release%20Notes)

# Contributing

Currently, the best way to contribute to this project is to star this project on GitHub.

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

For a full list of current projects to support visit: [https://cssnr.github.io/](https://cssnr.github.io/)
