const voicesynth = require(__dirname + '/../../libs/voicesynth.js');
const LOGGER = require(__dirname + '/../../libs/logger.js');
const util = require(__dirname + '/../../libs/util.js');
const config = require(__dirname + '/../../../config/config.js');

/**
 * Plays the on join audio if necessary
 * @param {Connection} connection A discord.js connection
 */
async function _playOnJoin(connection) {
  if (config.get('onJoinVoiceChannel')) {
    const path = await voicesynth.synth(
      `${config.get('onJoinVoiceChannel')}`,
      __dirname + `/../../../voice/onJoin.mp3`);
    connection.playFile(path);
  }
}

module.exports = {
  name: 'summon',
  description: 'Summons the bot to the user\'s voice channel.',
  async execute(message) {
    if (!message.member.voiceChannel) {
      message.reply('You need to be in a voice channel to summon me');
      return;
    }
    try {
      const connection = await message.member.voiceChannel.join();
      LOGGER.info(`Joined voice channel ${connection.channel.id}`);
      await _playOnJoin(connection);
    } catch (err) {
      LOGGER.error(err);
    } finally {
      util.save(message.client);
    };
  },
};
