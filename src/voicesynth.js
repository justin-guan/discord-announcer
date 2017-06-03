'use strict';

const request = require('request');
const fs = require('fs');
const Promise = require('bluebird');
const LOGGER = require(__dirname + '/logger.js');
const config = require(__dirname + '/../config/config.js');

const synth = function(text, path) {
  return new Promise((resolve, reject) => {
    const writable = fs.createWriteStream(path);
    writable.on('error', (err) => {
      reject(err);
    });
    writable.on('finish', () => {
      resolve();
    });
    request
      .get(config.get('voiceRSS.url') + text)
      .on('error', LOGGER.error)
      .pipe(writable);
  });
};

exports.synth = synth;
