'use strict';
process.title = 'Discord Announcer';

const Discord = require('discord.js');
const client = new Discord.Client();
const Promise = require('bluebird');
const voicesynth = require(__dirname + '/voicesynth.js');
const LOGGER = require(__dirname + '/logger.js');
const config = require(__dirname + '/../config/config.js');

const commands = new Map();

(function init() {
  commands.set(config.get('command.trigger') + 'help', showHelp);
  client.login(config.get('discord.token'))
    .then(LOGGER.info('Client login success'))
    .catch(LOGGER.error);
})();

process.on('SIGTERM', cleanUp);
process.on('SIGINT', cleanUp);
process.on('SIGQUIT', cleanUp);

client.on('ready', () => {
  client.user.setGame('with Node.js');
  LOGGER.info('Client ready');
});

client.on('message', async (message) => {
  if (message.author.bot || !commands.get(message.content)) {
    return;
  }
  const msg = await message.delete();
  commands.get(message.content)(msg);
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
  if (!newMember.voiceChannel || newMember.id === client.user.id) {
    return;
  }
  sayJoin(newMember, () => {
    sayLeave(oldMember);
  });
});

async function sayJoin(member, callback) {
  let name = member.nickname ? member.nickname : member.user.username;
  const connection = await member.voiceChannel.join();
  const path = await voicesynth.synth(
    `${name} joined the channel`,
    __dirname + `/../voice/join/${name}.mp3`);
  const dispatcher = await connection.playFile(path);
  dispatcher.on('end', () => {
    connection.disconnect();
    if (typeof callback === 'function') {
      callback();
    }
  });
}

async function sayLeave(member, callback) {
  let name = member.nickname ? member.nickname : member.user.username;
  const connection = await member.voiceChannel.join();
  const path = await voicesynth.synth(
    `${name} left the channel`,
    __dirname + `/../voice/leave/${name}.mp3`);
  const dispatcher = await connection.playFile(path);
  dispatcher.on('end', () => {
    connection.disconnect();
    if (typeof callback === 'function') {
      callback();
    }
  });
}

function showHelp(message) {
  message.reply("Help documentation coming soon...");
}

function cleanUp() {
  LOGGER.warn('Termination signal detected! Exiting...');
  client.destroy()
    .then(process.exit(0))
    .catch(process.exit(1));
}
