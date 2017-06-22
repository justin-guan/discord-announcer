'use strict';

const LOGGER = require(__dirname + '/../../logger.js');

async function playFile(info, path) {
  const connection = await info.message.member.voiceChannel.join();
  try {
    connection.playFile(path);
  } catch (e) {
    LOGGER.error(e);
  }
}

function errorCheck(info) {
  if (!info.message.member.voiceChannel) {
    info.message.reply('You need to be in a voice channel to summon me');
    return false;
  }
  return true;
}

function dead(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/all_dead.wav');
  }
}

function crybaby(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/crybaby.wav');
  }
}

function disastah(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/disastah.wav');
  }
}

function patience(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/patience.wav');
  }
}

function wow(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/wow.wav');
  }
}

function theplay(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/theplay.wav');
  }
}

function noone(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/noone.wav');
  }
}

function price(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/price.wav');
  }
}

function duel(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/duel.wav');
  }
}

function free(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/free.wav');
  }
}

function cyka(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/cyka.wav');
  }
}

function wtf(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/wtf.wav');
  }
}

function godlike(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/godlike.wav');
  }
}


exports.dead = dead;
exports.crybaby = crybaby;
exports.disastah = disastah;
exports.patience = patience;
exports.wow = wow;
exports.theplay = theplay;
exports.noone = noone;
exports.price = price;
exports.duel = duel;
exports.free = free;
exports.cyka = cyka;
exports.wtf = wtf;
exports.godlike=godlile;
