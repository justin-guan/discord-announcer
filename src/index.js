'use strict';
process.title = 'Discord Announcer';

const Discord = require('discord.js');
const client = new Discord.Client();
const Promise = require('bluebird');
const voicesynth = require(__dirname + '/voicesynth.js');
const LOGGER = require(__dirname + '/logger.js');
const config = require(__dirname + '/../config/config.js');

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
    sayJoin(newMember);
  } else if (oldMember.voiceChannel && client.voiceConnections.exists('channel', oldMember.voiceChannel)) {
    LOGGER.info(`${oldMember.id} left voice channel ${oldMember.voiceChannelID}`);
    sayLeave(oldMember);
  }
});

async function sayJoin(member) {
  const name = member.nickname ? member.nickname : member.user.username;
  const connection = member.voiceChannel.connection;
  const path = await voicesynth.synth(
    `${name} joined the channel`,
    __dirname + `/../voice/join/${name}.mp3`);
  await connection.playFile(path);
}

async function sayLeave(member) {
  const name = member.nickname ? member.nickname : member.user.username;
  const connection = member.voiceChannel.connection;
  const path = await voicesynth.synth(
    `${name} left the channel`,
    __dirname + `/../voice/leave/${name}.mp3`);
  await connection.playFile(path);
}

function cleanUp() {
  LOGGER.warn('Termination signal detected! Exiting...');
  client.destroy()
    .then(process.exit(0))
    .catch(process.exit(1));
}
