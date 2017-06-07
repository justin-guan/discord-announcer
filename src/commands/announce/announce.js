'use strict';

const Promise = require('bluebird');

function summon(info) {
  if (!info.message.member.voiceChannel) {
    info.message.reply('You need to be in a voice channel to summon me');
    return Promise.reject();
  }
  return info.message.member.voiceChannel.join();
}

function banish(info) {
  for (let [k, vc] of info.client.voiceConnections) {
    if (vc.channel === info.message.member.voiceChannel) {
      vc.channel.leave();
      return;
    }
  }
  info.message.reply("I'm not in your voice channel!");
}

exports.summon = summon;
exports.banish = banish;
