'use strict';
const request = require('request');
const fs = require('fs');

const tts = function(text, path, callback) {
  const writable = fs.createWriteStream(path);
  writable.on('finish', () => {
    if (typeof(callback) === 'function') {
      callback();
    }
  });
  request
    .get(`http://api.voicerss.org/?key=${process.env.API_KEY}&hl=en-us&src=${text}&c=mp3&f=ulaw_44khz_stereo&r=1`)
    .on('error', function(err) {
      console.error(err);
    })
    .pipe(writable)
}

exports.tts = tts;
