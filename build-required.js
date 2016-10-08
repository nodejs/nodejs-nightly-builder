"use strict"

const strftime     = require('strftime').timezone(0)
    , after        = require('after')
    , listBuilds   = require('./list-builds')
    , latestCommit = require('./latest-commit')

const dateFormat = '%Y%m%d'


function timeString () {
  return strftime(dateFormat)
}


function buildRequired (type, ref, force, config, callback) {
  let done = after(2, onData)
    , builds
    , commit

  function onData (err) {
    if (err)
      return callback(err)

    commit = commit.substr(0, 10)

    if (!force && builds.some(function (b) { return b.commit.substr(0, 10) == commit }))
      return callback()

    return callback(null, { type: type, commit: commit, date: timeString() })
  }

  listBuilds(type, config, function (err, data) {
    builds = data
    done(err)
  })

  latestCommit(type, ref, config, function (err, data) {
    commit = data
    done(err)
  })
}


module.exports = buildRequired
