'use strict';

const request = require('request');
const fs = require('fs');
const Promise = require('bluebird');
const LOGGER = require(__dirname + '/logger.js');
const config = require(__dirname + '/../config/config.js');

/**
 * const synth - Synthesize an audio file from the given text
 *
 * @param  {String} text Text to convert to audio
 * @param  {String} path Path at which to save the audio file
 * @return {Promise}      Resolve on successful synthesis, reject otherwise
 */
const synth = function(text, path) {
  if (fs.existsSync(path)) {
    return Promise.resolve(path);
  }
  return new Promise((resolve, reject) => {
    const writable = fs.createWriteStream(path);
    writable.on('error', (err) => {
      LOGGER.error(`Failed to create file at ${path}`);
      reject(err);
    });
    writable.on('finish', () => {
      LOGGER.info(`New file created at ${path}`);
      resolve(path);
    });
    request
      .get(config.get('voiceRSS.url') + text)
      .on('error', LOGGER.error)
      .pipe(writable);
  });
};

exports.synth = synth;
