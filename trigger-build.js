'use strict'

const hyperquest = require('hyperquest')
const jsonist = require('jsonist')
const bl = require('bl')
const qs = require('querystring')

function triggerBuild (options, callback) {
  const url = `${options.jenkinsJobUrl}/build?token=${options.jenkinsToken}`
  const auth = `${options.githubAuthUser}:${options.githubAuthToken}`
  const data = {
    token: options.jenkinsToken,
    parameter: [
      {
        name: 'repository',
        value: `${options.githubScheme}${options.githubOrg}/${options.githubRepo}.git`
      },
      {
        name: 'commit',
        value: options.commit
      },
      {
        name: 'datestring',
        value: options.date
      },
      {
        name: 'disttype',
        value: options.type
      },
      {
        name: 'rc',
        value: '0'
      }
    ]
  }

  let cookies

  const requestTrigger = (crumb) => {
    const postData = {
      token: options.jenkinsToken,
      json: JSON.stringify(data)
    }

    postData[crumb.crumbRequestField] = crumb.crumb
    const post = qs.encode(postData)

    const headers = { 'content-type': 'application/x-www-form-urlencoded' }

    if (cookies) {
      headers.cookie = cookies
    }

    const req = hyperquest(url, { method: 'post', auth, headers })
    req.end(post)
    req.pipe(bl(callback))
  }

  if (!options.jenkinsCrumbUrl) {
    return requestTrigger()
  }

  const jr = jsonist.get(options.jenkinsCrumbUrl, { auth }, (err, data) => {
    if (err) {
      return callback(err)
    }

    cookies = jr.response.headers['set-cookie'] &&
      jr.response.headers['set-cookie'].map((c) => c.split(';')[0])
        .join(';')

    requestTrigger(data)
  })
}

module.exports = triggerBuild
