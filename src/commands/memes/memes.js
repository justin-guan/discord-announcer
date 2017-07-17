'use strict';

const LOGGER = require(__dirname + '/../../lib/logger.js');

/**
 * playFile - Plays a music file to the user who invoked the command's voice
 * channel.
 *
 * @param  {JSON} info A JSON object with the discord.js client and user's
 * message.
 * @param  {String} path Path to the audio file that will be played.
 */
async function playFile(info, path) {
  try {
    const connection = await info.message.member.voiceChannel.join();
    connection.playFile(path);
  } catch (e) {
    LOGGER.error(e);
  }
}

/**
 * errorCheck - Checks that the user who called playFile() is in an voice
 * channel. If they are not, reply with an error message.
 *
 * @param  {JSON} info A JSON object with the discord.js client and user's
 * message.
 * @return {boolean}      Returns true if the user who sent the message is
 * in a voice channel, and false otherwise.
 */
function errorCheck(info) {
  if (!info.message.member.voiceChannel) {
    info.message.reply('You need to be in a voice channel to summon me');
    return false;
  }
  return true;
}

/**
 * dead - Plays all_dead.wav
 *
 * @param  {JSON} info A JSON object with the discord.js client and user's
 * message.
 */
function dead(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/all_dead.wav');
  }
}

/**
 * crybaby - Plays crybaby.wav
 *
 * @param  {JSON} info A JSON object with the discord.js client and user's
 * message.
 */
function crybaby(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/crybaby.wav');
  }
}

/**
 * disastah - Plays disastah.wav
 *
 * @param  {JSON} info A JSON object with the discord.js client and user's
 * message.
 */
function disastah(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/disastah.wav');
  }
}

/**
 * patience - Plays patience.wav
 *
 * @param  {JSON} info A JSON object with the discord.js client and user's
 * message.
 */
function patience(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/patience.wav');
  }
}

/**
 * wow - Plays wow.wav
 *
 * @param  {JSON} info A JSON object with the discord.js client and user's
 * message.
 */
function wow(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/wow.wav');
  }
}

/**
 * theplay - Plays theplay.wav
 *
 * @param  {JSON} info A JSON object with the discord.js client and user's
 * message.
 */
function theplay(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/theplay.wav');
  }
}

/**
 * noone - Plays noone.wav
 *
 * @param  {JSON} info A JSON object with the discord.js client and user's
 * message.
 */
function noone(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/noone.wav');
  }
}

/**
 * price - Plays price.wav
 *
 * @param  {JSON} info A JSON object with the discord.js client and user's
 * message.
 */
function price(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/price.wav');
  }
}

/**
 * duel - Plays duel.wav
 *
 * @param  {JSON} info A JSON object with the discord.js client and user's
 * message.
 */
function duel(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/duel.wav');
  }
}

/**
 * free - Plays free.wav
 *
 * @param  {JSON} info A JSON object with the discord.js client and user's
 * message.
 */
function free(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/free.wav');
  }
}

/**
 * cyka - Plays cyka.wav
 *
 * @param  {JSON} info A JSON object with the discord.js client and user's
 * message.
 */
function cyka(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/cyka.wav');
  }
}

/**
 * wtf - Plays wtf.wav
 *
 * @param  {JSON} info A JSON object with the discord.js client and user's
 * message.
 */
function wtf(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/wtf.wav');
  }
}

/**
 * maple - Plays maple.wav
 *
 * @param  {JSON} info A JSON object with the discord.js client and user's
 * message.
 */
function maple(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/maple.wav');
  }
}

/**
 * shut - Plays shut.wav
 *
 * @param  {JSON} info A JSON object with the discord.js client and user's
 * message.
 */
function shut(info) {
  if (errorCheck(info)) {
    playFile(info, __dirname + '/../../../memes/shut.wav');
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
exports.maple = maple;
exports.shut = shut;
