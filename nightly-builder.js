#!/usr/bin/env node

'use strict'

const argv          = require('minimist')(process.argv.slice(2))
    , inspect       = require('util').inspect
    , xtend         = require('xtend')
    , buildRequired = require('./build-required')
    , triggerBuild  = require('./trigger-build')

    , defaultConfig = {
        //, jenkinsToken    : 'X'
        //, jenkinsJobUrl   : 'X'
        //, jenkinsCrumbUrl : 'X'
        //, githubAuthUser  : 'X'
        //, githubAuthToken : 'X'
          githubOrg       : 'nodejs'
        , githubRepo      : 'node'
        , githubScheme    : 'https://github.com/'
        , releaseUrlBase  : 'https://nodejs.org/download/'
      }

if (typeof argv.type != 'string')
  argv.type = 'nightly'

let config = argv.config && require(argv.config)
config = xtend(defaultConfig, config)

if (!/^(nightly|next-nightly)$/.test(argv.type)
    || typeof argv.ref != 'string'
    || typeof config.jenkinsToken    != 'string'
    || typeof config.jenkinsJobUrl   != 'string'
    || typeof config.jenkinsCrumbUrl != 'string'
    || typeof config.githubAuthToken != 'string'
    || typeof config.githubAuthUser  != 'string'
    || typeof config.githubRepo      != 'string'
    || typeof config.githubOrg       != 'string'
    || typeof config.githubScheme    != 'string'
    || typeof config.releaseUrlBase  != 'string'
  ) {

  console.error('Invalid arguments or config')
  console.error('Usage: nodejs-nightly-builder [--type <nightly|next-nightly>] --ref <git head ref> --config <config file> [--force]')
  return process.exit(1)
}

buildRequired(argv.type, argv.ref, argv.force, config, function (err, data) {
  if (err)
    throw err

  if (!data)
    return console.log('No build required')

  triggerBuild(xtend(data, config), function (err, outp) {
    if (err)
      throw err

    console.log(`Build triggered: ${inspect(data)}`)
    if (outp)
      console.log('Jenkins output:', outp.toString())
  })
})
