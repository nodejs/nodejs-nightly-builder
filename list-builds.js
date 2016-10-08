"use strict"

const jsonist = require('jsonist')

const indexUrl = '{releaseUrlBase}{type}/index.json'


function listBuilds (type, config, callback) {
  let url = indexUrl
              .replace(/\{type\}/, type)
              .replace(/\{releaseUrlBase\}/, config.releaseUrlBase)

  function onGet (err, data) {
    if (err)
      return callback(err)

    if (!data || !Array.isArray(data) || !data.length)
      return callback(new Error(`no builds for "${type}"`))

    data = data.map(function (d) {
      let m      = d.version.match(/nightly(20\d\d)(\d\d)(\d\d)([0-9a-f]{7,})/)
        , date   = new Date(m && `${m[1]}-${m[2]}-${m[3]}` || d.date)
        , commit = m && m[4]

      if (m && commit) {
        return {
            version : d.version
          , date    : date
          , commit  : commit
        }
      }
    })

    callback(null, data)
  }

  jsonist.get(url, onGet)
}


module.exports = listBuilds

if (require.main == module) {
  listBuilds('nightly', function (err, data) {
    if (err)
      throw err

    console.log('data', data)
  })
}
