#!/usr/bin/env node

'use strict'

const argv = require('minimist')(process.argv.slice(2))
const inspect = require('util').inspect
const xtend = require('xtend')
const buildRequired = require('./build-required')
const triggerBuild = require('./trigger-build')

const defaultConfig = {
  //, jenkinsToken    : 'X'
  //, jenkinsJobUrl   : 'X'
  //, jenkinsCrumbUrl : 'X'
  //, githubAuthUser  : 'X'
  //, githubAuthToken : 'X'
  githubOrg: 'nodejs',
  githubRepo: 'node',
  githubScheme: 'https://github.com/',
  urlTypePrefix: ''
}

if (typeof argv.type !== 'string') { argv.type = 'nightly' }

let config = argv.config && require(argv.config)
config = xtend(defaultConfig, config)

if (!/^(nightly|v8-canary)$/.test(argv.type) ||
    typeof argv.ref !== 'string' ||
    typeof config.jenkinsToken !== 'string' ||
    typeof config.jenkinsJobUrl !== 'string' ||
    typeof config.jenkinsCrumbUrl !== 'string' ||
    typeof config.githubAuthToken !== 'string' ||
    typeof config.githubAuthUser !== 'string' ||
    typeof config.githubRepo !== 'string' ||
    typeof config.githubOrg !== 'string' ||
    typeof config.githubScheme !== 'string' ||
    typeof config.urlTypePrefix !== 'string'
) {
  console.error('Invalid arguments or config')
  console.error('Usage: nodejs-nightly-builder [--type <nightly|v8-canary>] --ref <git head ref> --config <config file> [--force]')
  process.exit(1)
}

buildRequired(argv.type, argv.ref, argv.force, config, (err, data) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  if (!data) {
    return console.log('No build required')
  }

  triggerBuild(xtend(data, config), (err, outp) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }

    console.log(`Build triggered: ${inspect(data)}`)
    if (outp) {
      console.log('Jenkins output:', outp.toString())
    }
  })
})
