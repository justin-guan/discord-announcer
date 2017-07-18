'use strict';
process.title = 'Discord Announcer';

const Discord = require('discord.js');
const client = new Discord.Client();
const LOGGER = require(__dirname + '/libs/logger.js');
const announcer = require(__dirname + '/libs/announcer.js');
const config = require(__dirname + '/../config/config.js');
const util = require(__dirname + '/libs/util.js');

// Commands
const admin = require(__dirname + '/commands/admin/admin.js');
const help = require(__dirname + '/commands/help/help.js');
const announce = require(__dirname + '/commands/announce/announce.js');
const memes = require(__dirname + '/commands/memes/memes.js');

const commands = new Map();

(function init() {
  commands.set(config.get('command.trigger') + 'give', admin.give);
  commands.set(config.get('command.trigger') + 'setCurrency', admin.setCurrency);
  commands.set(config.get('command.trigger') + 'help', help.showHelp);
  commands.set(config.get('command.trigger') + 'commands', help.commands);
  commands.set(config.get('command.trigger') + 'summon', announce.summon);
  commands.set(config.get('command.trigger') + 'banish', announce.banish);
  commands.set(config.get('command.trigger') + 'ld', memes.dead);
  commands.set(config.get('command.trigger') + 'tucker', memes.crybaby);
  commands.set(config.get('command.trigger') + 'tobi', memes.disastah);
  commands.set(config.get('command.trigger') + 'zhou', memes.patience);
  commands.set(config.get('command.trigger') + 'waow', memes.wow);
  commands.set(config.get('command.trigger') + 'theplay', memes.theplay);
  commands.set(config.get('command.trigger') + 'noone', memes.noone);
  commands.set(config.get('command.trigger') + 'price', memes.price);
  commands.set(config.get('command.trigger') + 'duel', memes.duel);
  commands.set(config.get('command.trigger') + 'free', memes.free);
  commands.set(config.get('command.trigger') + 'cyka', memes.cyka);
  commands.set(config.get('command.trigger') + 'wtf', memes.wtf);
  commands.set(config.get('command.trigger') + 'maple', memes.maple);
  commands.set(config.get('command.trigger') + 'shut', memes.shut);
  commands.set(config.get('command.trigger') + 'minorities', memes.minorities);
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
  client.user.setGame('with Node.js');
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
  const split = message.content.split(/\s+/g);
  if (message.author.bot || message.channel.type === "dm" || !commands.get(split[0])) {
    return;
  }
  try {
    const msg = await message.delete();
    commands.get(split[0])({
      'client': client,
      'message': msg,
      'arguments': split.slice(1)
    });
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
