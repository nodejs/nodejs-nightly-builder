"use strict"

const test         = require('tape')
    , latestCommit = require('./latest-commit')
    , listBuilds  = require('./list-builds')
    , ghauth       = require('ghauth')
    , appCfg       = require('application-config')
    , authOptions  = {
          configName : 'nodejs-nightly-builder'
        , scope      : []
        , note       : 'nodejs-nightly-builder tests'
      }

if (process.argv[2] == 'auth') {
  return ghauth(authOptions, function (err, authData) {
    if (err)
      throw err
    console.log('Saved authentication credentials, go forth and test')
  })
}


test('list-builds', function (t) {
  t.plan(7)
  let other = null


  function verify () {
    return function (err, data) {
      t.error(err, 'no error')
      t.ok(Array.isArray(data), 'is array')
      t.ok(data.length > 1, 'has data')
      let m = data[0].version && data[0].version.match(/v\d+\.\d+\.\d+-nightly20\d{6}\w{10,}/)
      t.ok(m, `version (${data[0].version}) looks correct`)
      t.ok(data[0].date < new Date(), `date (${data[0].date.toISOString()}) looks correct`)
      t.ok(data[0].commit && data[0].commit.length >= 10, `commit (${data[0].commit}) looks right`)
      t.notEqual(data[0].commit, other, 'commit not the same as other type of commit')
      other = data[0].commit // who's gonna be first??
    }
  }

  listBuilds('nightly', {}, verify())
})


test('list-builds v8-canary', function (t) {
  t.plan(7)
  let other = null


  function verify () {
    return function (err, data) {
      t.error(err, 'no error')
      t.ok(Array.isArray(data), 'is array')
      t.ok(data.length >= 1, 'has data')
      let m = data[0].version && data[0].version.match(/v\d+\.\d+\.\d+-v8-canary20\d{6}\w{10,}/)
      t.ok(m, `version (${data[0].version}) looks correct`)
      t.ok(data[0].date < new Date(), `date (${data[0].date.toISOString()}) looks correct`)
      t.ok(data[0].commit && data[0].commit.length >= 10, `commit (${data[0].commit}) looks right`)
      t.notEqual(data[0].commit, other, 'commit not the same as other type of commit')
      other = data[0].commit // who's gonna be first??
    }
  }

  listBuilds('v8-canary', {}, verify())
})


test('latest-commit', function (t) {
  t.plan(4)
  let other = null

  appCfg(authOptions.configName).read(function (err, config) {
    if (err) {
      console.error('You need GitHub authentication credentials saved first, run `node test.js auth` to set this up')
      return process.exit(1)
    }

    function verify () {
      return function (err, sha) {
        t.error(err, 'no error')
        t.equal(typeof sha, 'string', 'got sha')
        t.equal(sha.length, 40, `sha looks good (${sha})`)
        t.notEqual(sha, other, 'sha not the same as other type of sha')
        other = sha // who's gonna be first??
      }
    }

    latestCommit('nightly', 'heads/v5.x', {
        githubOrg       : 'nodejs'
      , githubRepo      : 'node'
      , githubAuthUser  : config.user
      , githubAuthToken : config.token
    }, verify())
  })
})


test('latest-commit v8-canary', function (t) {
  t.plan(4)
  let other = null

  appCfg(authOptions.configName).read(function (err, config) {
    if (err) {
      console.error('You need GitHub authentication credentials saved first, run `node test.js auth` to set this up')
      return process.exit(1)
    }

    function verify () {
      return function (err, sha) {
        t.error(err, 'no error')
        t.equal(typeof sha, 'string', 'got sha')
        t.equal(sha.length, 40, `sha looks good (${sha})`)
        t.notEqual(sha, other, 'sha not the same as other type of sha')
        other = sha // who's gonna be first??
      }
    }

    latestCommit('v8-canary', 'heads/canary', {
        githubOrg       : 'nodejs'
      , githubRepo      : 'node-v8'
      , githubAuthUser  : config.user
      , githubAuthToken : config.token
    }, verify())
  })
})
