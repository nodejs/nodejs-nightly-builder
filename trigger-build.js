"use strict";

const hyperquest = require('hyperquest')
    , jsonist    = require('jsonist')
    , bl         = require('bl')
    , qs         = require('querystring')



function triggerBuild(options, callback) {
  let url  = `${options.jenkinsJobUrl}/build?token=${options.jenkinsToken}`
    , auth = `${options.githubAuthUser}:${options.githubAuthToken}`
    , data = {
          token     : options.jenkinsToken
        , parameter : [
              {
                  name  : 'repository'
                , value : `${options.githubScheme}${options.githubOrg}/${options.githubRepo}.git`
              }
            , {
                  name  : 'commit'
                , value : options.commit
              }
            , {
                  name  : 'datestring'
                , value : options.date
              }
            , {
                  name  : 'disttype'
                , value : options.type
              }
            , {
                  name  : 'rc'
                , value : '0'
              }
          ]
      }

  if (!options.jenkinsCrumbUrl)
    return requestTrigger()

  let cookies

  const jr = jsonist.get(options.jenkinsCrumbUrl, { auth: auth }, function (err, data) {
    if (err)
      return callback(err)

    cookies = jr.response.headers['set-cookie'] &&
      jr.response.headers['set-cookie'].map((c) => c.split(';')[0])
        .join(';')

    requestTrigger(data)
  })

  function requestTrigger (crumb) {
    let postData = {
            token    : options.jenkinsToken
          , json     : JSON.stringify(data)
        }
      , post
      , req

    postData[crumb.crumbRequestField] = crumb.crumb
    post = qs.encode(postData)

    const headers = { 'content-type' : 'application/x-www-form-urlencoded' }

    if (cookies) {
      headers.cookie = cookies
    }

    req = hyperquest(url, { method: 'post', auth, headers })
    req.end(post)
    req.pipe(bl(callback))
  }
}


module.exports = triggerBuild
