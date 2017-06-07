'use strict';

function summon(info) {
  if (!info.message.member.voiceChannel) {
    info.message.reply('You need to be in a voice channel to summon me');
    return;
  }
  info.message.member.voiceChannel.join();
}

function banish(info) {
  if (info.message.member.voiceChannel && info.client.voiceConnections.exists('channel', info.message.member.voiceChannel)) {
    info.message.member.voiceChannel.leave();
    return;
  }
  info.message.reply("I'm not in your voice channel!");
}

exports.summon = summon;
exports.banish = banish;
