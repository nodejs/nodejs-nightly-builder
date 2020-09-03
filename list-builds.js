'use strict'

const jsonist = require('jsonist')

const indexUrl = 'https://nodejs.org/download/{type}/index.json'

function listBuilds (type, config, callback) {
  const url = indexUrl.replace(/\{type\}/, `${config.urlTypePrefix || ''}${type}`)

  jsonist.get(url, (err, data) => {
    if (err) {
      return callback(err)
    }

    if (!data || !Array.isArray(data) || !data.length) {
      return callback(new Error(`no builds for "${type}"`))
    }

    data = data.map((d) => {
      const m = d.version.match(/(?:nightly|v8-canary)(20\d\d)(\d\d)(\d\d)([0-9a-f]{7,})/)
      const date = new Date((m && `${m[1]}-${m[2]}-${m[3]}`) || d.date)
      const commit = m && m[4]

      if (m && commit) {
        return {
          version: d.version,
          date: date,
          commit: commit
        }
      }
    })

    callback(null, data)
  })
}

module.exports = listBuilds

if (require.main === module) {
  listBuilds(process.argv[2] || 'nightly', (err, data) => {
    if (err) {
      throw err
    }
    console.log('data', data)
  })
}
