'use strict'

const fs = require('fs-extra')
const LOGGER = require(__dirname + '/logger.js')

function initializeDirectory(path) {
  fs.mkdir(path).catch(() => {
    LOGGER.info(`Directory ${path} already exists`)
  })
}

initializeDirectory(__dirname + '/../voice')
initializeDirectory(__dirname + '/../voice/join')
initializeDirectory(__dirname + '/../voice/leave')
initializeDirectory(__dirname + '/../logs')
