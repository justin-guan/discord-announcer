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
const database = require(__dirname + '/libs/database.js');

const basicCommandFiles = fs.readdirSync(__dirname + '/commands/basic');
const adminCommandFiles = fs.readdirSync(__dirname + '/commands/admin');
client.commands = new Discord.Collection();
client.customCommands = new Discord.Collection();
client.cooldowns = new Discord.Collection();
client.collectors = new Discord.Collection();

for (const file of basicCommandFiles) {
  const command = require(`${__dirname}/commands/basic/${file}`);
  client.commands.set(command.name, command);
}

for (const file of adminCommandFiles) {
  const command = require(`${__dirname}/commands/admin/${file}`);
  client.commands.set(command.name, command);
}

(async function init() {
  const guilds = await database.getAllGuilds();
  for (const guild of guilds) {
    for (const command of guild.commands) {
      util.setUpCommand(client, command, guild._id);
    }
  }
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
  client.guilds.map((guild) => {
    client.cooldowns.set(guild.id, new Discord.Collection());
  });
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
    const guildId = msg.guild.id;
    const memberId = msg.member.id;
    const commandName = client.commands.get(command).name;
    const guildCooldowns = client.cooldowns.get(guildId);
    const cooldown = client.commands.get(command).cooldown * 1000;
    if (!client.cooldowns.get(guildId).has(memberId)) {
      guildCooldowns.set(memberId, new Discord.Collection());
    }
    if (client.cooldowns.get(guildId).get(memberId).has(commandName)) {
      const expiration = guildCooldowns.get(memberId).get(commandName);
      const timeLeft = (expiration + cooldown - Date.now()) / 1000;
      msg.reply(`Can't do this for another ${timeLeft} seconds`);
      return;
    }
    guildCooldowns.get(memberId).set(commandName, Date.now());
    setTimeout(() => guildCooldowns.get(memberId).delete(commandName),
      cooldown);
    client.commands.get(command).execute(msg, args);
  } catch (e) {
    LOGGER.warn(`Failed to execute command ${message.content}`);
    LOGGER.warn(e);
  }
});

client.on('message', async (message) => {
  const args = message.content.slice(config.get('command.trigger').length)
    .split(/\s+/);
  const command = args.shift().toLowerCase();
  if (message.guild === null || !validate.isValidCommand(message,
    command,
    client.customCommands.get(message.guild.id))) {
    return;
  }
  try {
    const msg = await message.delete();
    client.customCommands.get(message.guild.id).get(command).execute(msg);
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

client.on('guildCreate', (guild) => {
  client.user.setGame(`in ${client.guilds.size} servers`);
});

client.on('guildDelete', (guild) => {
  client.user.setGame(`in ${client.guilds.size} servers`);
});
