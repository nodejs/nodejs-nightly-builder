'use strict'

const strftime = require('strftime').timezone(0)
const after = require('after')
const listBuilds = require('./list-builds')
const latestCommit = require('./latest-commit')

const dateFormat = '%Y%m%d'

function timeString () {
  return strftime(dateFormat)
}

function buildRequired (type, ref, force, config, callback) {
  let builds
  let commit

  const done = after(2, (err) => {
    if (err) {
      return callback(err)
    }

    commit = commit.substr(0, 10)

    if (!force && builds.some((b) => b.commit.substr(0, 10) === commit)) {
      return callback()
    }

    return callback(null, { type, commit, date: timeString() })
  })

  listBuilds(type, config, (err, data) => {
    builds = data
    done(err)
  })

  latestCommit(type, ref, config, (err, data) => {
    commit = data
    done(err)
  })
}

module.exports = buildRequired
