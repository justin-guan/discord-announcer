'use strict';
process.title = 'Discord Announcer';

const Discord = require('discord.js');
const client = new Discord.Client();
const Promise = require('bluebird');
const LOGGER = require(__dirname + '/logger.js');
const config = require(__dirname + '/../config/config.js');
const util = require(__dirname + '/util.js');

//Commands
const help = require(__dirname + '/commands/help/help.js');
const announcer = require(__dirname + '/commands/announce/announce.js');

const commands = new Map();

(function init() {
  commands.set(config.get('command.trigger') + 'help', help.showHelp);
  commands.set(config.get('command.trigger') + 'summon', announcer.summon);
  commands.set(config.get('command.trigger') + 'banish', announcer.banish);
  client.login(config.get('discord.token'))
    .then(LOGGER.info('Client login success'))
    .catch(LOGGER.error);
})();

process.on('SIGTERM', () => {util.shutdown(client);});
process.on('SIGINT', () => {util.shutdown(client);});
process.on('SIGQUIT', () => {util.shutdown(client);});

client.on('ready', () => {
  client.user.setGame('with Node.js');
  LOGGER.info('Client ready');
});

client.on('message', async (message) => {
  if (message.author.bot || !commands.get(message.content)) {
    return;
  }
  const msg = await message.delete();
  commands.get(message.content)({
    "client": client,
    "message": msg
  });
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
  if (newMember.id === client.user.id ||
    oldMember.voiceChannelID === newMember.voiceChannelID) {
    return;
  }
  if (newMember.voiceChannel && client.voiceConnections.exists('channel', newMember.voiceChannel)) {
    LOGGER.info(`${newMember.id} joined voice channel ${newMember.voiceChannelID}`);
    util.sayJoin(newMember);
  } else if (oldMember.voiceChannel && client.voiceConnections.exists('channel', oldMember.voiceChannel)) {
    LOGGER.info(`${oldMember.id} left voice channel ${oldMember.voiceChannelID}`);
    util.sayLeave(oldMember);
  }
});
