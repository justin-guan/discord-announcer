'use strict';
process.title = 'Discord Announcer';

const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const LOGGER = require(__dirname + '/libs/logger.js');
const announcer = require(__dirname + '/libs/announcer.js');
const config = require(__dirname + '/../config/config.js');
const util = require(__dirname + '/libs/util.js');
const validate = require(__dirname + '/libs/validate.js');

const basicCommandFiles = fs.readdirSync(__dirname + '/commands/basic');
client.commands = new Discord.Collection();

for (const file of basicCommandFiles) {
  const command = require(`${__dirname}/commands/basic/${file}`);
  client.commands.set(command.name, command);
}

(function init() {
  client.login(config.get('discord.token'))
    .then(LOGGER.info('Client login success'))
    .catch(LOGGER.error);
})();

process.on('SIGTERM', () => {
  util.shutdown(client);
});
process.on('SIGINT', () => {
  util.shutdown(client);
});
process.on('SIGQUIT', () => {
  util.shutdown(client);
});

client.on('ready', () => {
  client.user.setGame(`in ${client.guilds.size} servers`);
  util.reconnect(client)
    .catch(() => {
      LOGGER.warn('Failed to rejoin some channels...');
    })
    .then(() => {
      util.save(client);
      LOGGER.info('Client ready');
    });
});

client.on('message', async (message) => {
  const args = message.content.slice(config.get('command.trigger').length)
    .split(/\s+/);
  const command = args.shift().toLowerCase();
  if (!validate.isValidCommand(message, command, client.commands)) {
    return;
  }
  try {
    const msg = await message.delete();
    client.commands.get(command).execute(msg, args);
  } catch (e) {
    LOGGER.warn(`Failed to execute command ${message.content}`);
    LOGGER.warn(e);
  }
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
  if (newMember.id === client.user.id ||
    oldMember.voiceChannelID === newMember.voiceChannelID) {
    return;
  }
  if (newMember.voiceChannel && client.voiceConnections.exists(
      'channel', newMember.voiceChannel)) {
    LOGGER.info(
      `${newMember.id} joined voice channel ${newMember.voiceChannelID}`);
    announcer.sayJoin(newMember);
  } else if (oldMember.voiceChannel && client.voiceConnections.exists(
      'channel', oldMember.voiceChannel)) {
    LOGGER.info(
      `${oldMember.id} left voice channel ${oldMember.voiceChannelID}`);
    announcer.sayLeave(oldMember);
  }
});

client.on('warn', (info) => {
  LOGGER.warn(info);
});
