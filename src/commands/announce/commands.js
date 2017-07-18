'use strict';

const voicesynth = require(__dirname + '/../../libs/voicesynth.js');
const LOGGER = require(__dirname + '/../../libs/logger.js');
const util = require(__dirname + '/../../libs/util.js');

/**
 * summon - Summons the bot to user's voice channel. Replies with an error if
 * the user is not in a voice channel.
 *
 * @param  {JSON} info A JSON object with the discord.js client and user's
 * message.
 */
function summon(info) {
  if (!info.message.member.voiceChannel) {
    info.message.reply('You need to be in a voice channel to summon me');
    return;
  }
  info.message.member.voiceChannel.join()
    .then(async (connection) => {
      LOGGER.info(`Joined voice channel ${connection.channel.id}`);
      try {
        const path = await voicesynth.synth(
          `woof woof`, __dirname + `/../../../voice/woof.mp3`);
        connection.playFile(path);
      } catch (err) {
        LOGGER.error(`Failed to synthesize woof`);
      }
      util.save(info.client);
    })
    .catch(() => {
      LOGGER.error(`Summoning failed`);
    });
}

/**
 * banish - The bot leaves the channel that the user is in. An error message is
 * replied if no they are not in the same voice channel.
 *
 * @param  {JSON} info A JSON object with the discord.js client and user's
 * message.
 */
function banish(info) {
  if (info.message.member.voiceChannel && info.client.voiceConnections.exists(
      'channel', info.message.member.voiceChannel)) {
    info.message.member.voiceChannel.leave();
    LOGGER.info(`Left voice channel ${info.message.member.voiceChannel.id}`);
    util.save(info.client);
    return;
  }
  info.message.reply('I\'m not in your voice channel!');
}


exports.summon = summon;
exports.banish = banish;
