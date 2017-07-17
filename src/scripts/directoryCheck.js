'use strict';

const fs = require('fs-extra');
const LOGGER = require(__dirname + '/../lib/logger.js');

/**
 * initializeDirectory - Create a directory at path
 *
 * @param  {String} path The path to create a directory at
 */
function initializeDirectory(path) {
  fs.mkdir(path)
  .then(() => {
    LOGGER.info(`Directory ${path} created`);
  })
  .catch(() => {
    LOGGER.info(`Directory ${path} already exists`);
  });
}

initializeDirectory(__dirname + '/../../voice');
initializeDirectory(__dirname + '/../../voice/join');
initializeDirectory(__dirname + '/../../voice/leave');
initializeDirectory(__dirname + '/../../logs');
