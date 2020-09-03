'use strict'

const test = require('tape')
const after = require('after')
const latestCommit = require('./latest-commit')
const listBuilds = require('./list-builds')
const ghauth = require('ghauth')
const AppCfg = require('application-config')
const authOptions = {
  configName: 'nodejs-nightly-builder',
  scope: [],
  note: 'nodejs-nightly-builder tests'
}

if (process.argv[2] === 'auth') {
  ghauth(authOptions, (err, authData) => {
    if (err) {
      throw err
    }
    console.log('Saved authentication credentials, go forth and test')
  })
} else {
  test('list-builds', (t) => {
    t.plan(7)
    let other = null

    const verify = () => {
      return (err, data) => {
        t.error(err, 'no error')
        t.ok(Array.isArray(data), 'is array')
        t.ok(data.length > 1, 'has data')
        const m = data[0].version && data[0].version.match(/v\d+\.\d+\.\d+-nightly20\d{6}\w{10,}/)
        t.ok(m, `version (${data[0].version}) looks correct`)
        t.ok(data[0].date < new Date(), `date (${data[0].date.toISOString()}) looks correct`)
        t.ok(data[0].commit && data[0].commit.length >= 10, `commit (${data[0].commit}) looks right`)
        t.notEqual(data[0].commit, other, 'commit not the same as other type of commit')
        other = data[0].commit // who's gonna be first??
      }
    }

    listBuilds('nightly', {}, verify())
  })

  test('list-builds chakracore-nightly', (t) => {
    t.plan(6)
    let data1
    let data2

    const verify = () => {
      return (err) => {
        t.error(err, 'no error')
        t.ok(Array.isArray(data1), ' data1 is array')
        t.ok(data1.length > 1, 'data1 has data')
        t.ok(Array.isArray(data2), 'data2 is array')
        t.ok(data2.length > 1, 'data2 has data')
        t.notDeepEqual(data1, data2, 'different data with and without urlTypePrefix')
      }
    }

    const done = after(2, verify())

    listBuilds('nightly', {}, (err, data) => {
      data1 = data
      done(err)
    })

    listBuilds('nightly', { urlTypePrefix: 'chakracore-' }, (err, data) => {
      data2 = data
      done(err)
    })
  })

  test('list-builds v8-canary', (t) => {
    t.plan(7)
    let other = null

    const verify = () => {
      return (err, data) => {
        t.error(err, 'no error')
        t.ok(Array.isArray(data), 'is array')
        t.ok(data.length >= 1, 'has data')
        const m = data[0].version && data[0].version.match(/v\d+\.\d+\.\d+-v8-canary20\d{6}\w{10,}/)
        t.ok(m, `version (${data[0].version}) looks correct`)
        t.ok(data[0].date < new Date(), `date (${data[0].date.toISOString()}) looks correct`)
        t.ok(data[0].commit && data[0].commit.length >= 10, `commit (${data[0].commit}) looks right`)
        t.notEqual(data[0].commit, other, 'commit not the same as other type of commit')
        other = data[0].commit // who's gonna be first??
      }
    }

    listBuilds('v8-canary', {}, verify())
  })

  test('latest-commit', (t) => {
    t.plan(4)
    let other = null

    new AppCfg(authOptions.configName).read()
      .catch(() => {
        console.error('You need GitHub authentication credentials saved first, run `node test.js auth` to set this up')
        return process.exit(1)
      }).then((config) => {
        const verify = () => {
          return (err, sha) => {
            t.error(err, 'no error')
            t.equal(typeof sha, 'string', 'got sha')
            t.equal(sha.length, 40, `sha looks good (${sha})`)
            t.notEqual(sha, other, 'sha not the same as other type of sha')
            other = sha // who's gonna be first??
          }
        }

        latestCommit('nightly', 'heads/v5.x', {
          githubOrg: 'nodejs',
          githubRepo: 'node',
          githubAuthUser: config.user,
          githubAuthToken: config.token
        }, verify())
      })
  })

  test('latest-commit v8-canary', (t) => {
    t.plan(4)
    let other = null

    new AppCfg(authOptions.configName).read()
      .catch(() => {
        console.error('You need GitHub authentication credentials saved first, run `node test.js auth` to set this up')
        return process.exit(1)
      })
      .then((config) => {
        const verify = () => {
          return (err, sha) => {
            t.error(err, 'no error')
            t.equal(typeof sha, 'string', 'got sha')
            t.equal(sha.length, 40, `sha looks good (${sha})`)
            t.notEqual(sha, other, 'sha not the same as other type of sha')
            other = sha // who's gonna be first??
          }
        }

        latestCommit('v8-canary', 'heads/canary', {
          githubOrg: 'nodejs',
          githubRepo: 'node-v8',
          githubAuthUser: config.user,
          githubAuthToken: config.token
        }, verify())
      })
  })
}
