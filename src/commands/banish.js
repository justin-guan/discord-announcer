const LOGGER = require(__dirname + '/../libs/logger.js');
const util = require(__dirname + '/../libs/util.js');

module.exports = {
  name: 'banish',
  description: 'Banish the bot from the channel that the user is in',
  async execute(client, message) {
    if (message.member.voiceChannel && client.voiceConnections.exists(
      'channel', message.member.voiceChannel)) {
        message.member.voiceChannel.leave();
        LOGGER.info(`Left voice channel ${message.member.voiceChannel.id}`);
        util.save(client);
        return;
    }
    message.reply('I\'m not in your voice channel');
  },
};
