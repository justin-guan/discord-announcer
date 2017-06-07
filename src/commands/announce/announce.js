'use strict';

const LOGGER = require(__dirname + '/../../logger.js');
const util = require(__dirname + '/../../util.js');

function summon(info) {
  if (!info.message.member.voiceChannel) {
    info.message.reply('You need to be in a voice channel to summon me');
    return;
  }
  info.message.member.voiceChannel.join()
    .then(connection => {
      util.save(info.client);
    })
    .catch(() => {
      LOGGER.error(`Summoning failed`);
    });
}

function banish(info) {
  if (info.message.member.voiceChannel && info.client.voiceConnections.exists('channel', info.message.member.voiceChannel)) {
    info.message.member.voiceChannel.leave();
    util.save(info.client);
    return;
  }
  info.message.reply("I'm not in your voice channel!");
}


exports.summon = summon;
exports.banish = banish;
