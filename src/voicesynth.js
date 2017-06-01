'use strict';
const request = require('request');
const fs = require('fs-extra');
const LOGGER = require(__dirname + '/logger.js');
const config = require(__dirname + '/../config/config.js');

const voicesynth = function(text, path, callback) {
  const writable = fs.createWriteStream(path);
  writable.on('finish', () => {
    if (typeof(callback) === 'function') {
      callback();
    }
  });
  request
    .get(config.get('voiceRSS.url') + text)
    .on('error', LOGGER.error)
    .pipe(writable);
};

exports.voicesynth = voicesynth;
