# nodejs-nightly-builder

**An application to trigger nightly builds of Node.js for distribution at nodejs.org _if_ there is new code available on a given branch**

## Usage

```text
$ nodejs-nightly-builder [--type <nightly|next-nightly>] --ref <git head ref> --config <config file> [--force]
```

* **type**: `nightly` vs `next-nightly` is a remnant of io.js and not used in current Node.js builds, it is therefore optional and defaults to `nightly`.
* **ref**: normally points to a git branch, e.g. `heads/v6.x` or `heads/master`
* **force**: can force a build even if one is not strictly required
* **config**: a config file for finding and authorising access to the appropriate GitHub repo via the GitHub API. The config file is in JSON format and must contain the following entries:
  - ***"githubOrg"*** (optional, defaults to "nodejs"): the GitHub org or user for the repository being checked
  - ***"githubRepo"*** (optional, defaults to "node"): the GitHub repository name being checked
  - ***"githubScheme"*** (optional, defaults to "https://github.com/"): the scheme for accessing the GitHub repository, including host and other components up to the "org/repo"
  - ***"githubAuthUser"***: the user for which the GitHub API is being accessed by
  - ***"githubAuthToken"***: the authentication token for accessing the API for the given user (e.g. obtained with https://github.com/rvagg/ghauth)
  - ***"jenkinsToken"***: the token entered in the Jenkins job for building distributables, required to authenticate API triggered access
  - ***"jenkinsJobUrl"***: URL of the job being accessed, as you would as a normal user, e.g. "https://ci.nodejs.org/job/node-release"
  - ***"jenkinsCrumbUrl"***: the Jenkins API endpoint for obtaining a crumb for bypassing XSS checks during API access, e.g. "https://ci.nodejs.org/crumbIssuer/api/json"

The GitHub API is used to check HEAD commits which is why an authentication token is required.

When run, `nodejs-nightly-builder` will first check whether a build is required. It does this by checking the file at `https://nodejs.org/download/{type}/index.json`, where `type` is provided on the commandline, e.g. `https://nodejs.org/download/nightly/index.json`. Nightly builds contain a commit sha that can be decoded from their version string. The HEAD commit is also pulled from GitHub for the `ref` (branch) provided on the commandline. If the latest build does not match the HEAD commit, a new nightly build is required. Nightly builds are triggered with Jenkins.

-----------------------------------

Managed under the governance of the Node.js [Build Working Group](https://github.com/nodejs/build).

Copyright (c) 2016 Node.js Foundation. All rights reserved.

Licensed under MIT, see the LICENSE.md file for details

