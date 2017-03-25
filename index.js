'use strict';
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const http = require('http');
const moment = require('moment');
const Promise = require('bluebird');
const tts = require(__dirname + '/text-to-mp3.js');
const LOGGER = require(__dirname + '/logger.js');

const commandModifier = '!';
let channel, banished = true;

if (!fs.existsSync(__dirname + '/voice')) {
  fs.mkdirSync(__dirname + '/voice');
}
if (!fs.existsSync(__dirname + '/voice/join')) {
  fs.mkdirSync(__dirname + '/voice/join');
}
if (!fs.existsSync(__dirname + '/voice/leave')) {
  fs.mkdirSync(__dirname + '/voice/leave');
}
if (!fs.existsSync(__dirname + '/logs')) {
  fs.mkdirSync(__dirname + '/logs');
}

client.login(process.env.DISCORD_TOKEN).then(()=> {
  LOGGER.info(`${moment().format()}: Client login success`);
});

client.on('ready', () => {
  LOGGER.info(`${moment().format()}: Client ready`);
});

client.on('message', (message) => {
  if (!message.content.startsWith(commandModifier) || message.author.bot) {
    return;
  }
  if (message.content.startsWith(commandModifier + 'summon')) {
    message.delete()
      .then(msg => {
        if (!msg.member.voiceChannel) {
          msg.reply("You need to be in a voice channel to summon me!");
          return;
        }
        (msg.member.voiceChannel).join()
          .then(connection => {
            banished = false;
            LOGGER.info(`${moment().format()}: Joined ${msg.member.voiceChannel.name}`);
            channel = connection.channel;
            tts.tts(`Hello World!`, `voice/hello.mp3`, () => {
              connection.playFile(__dirname + '/voice/hello.mp3');
            });
          })
          .catch((err) => {
            LOGGER.error(`${moment().format()}: ${err}`);
          });
      });
  } else if (message.content.startsWith(commandModifier + 'banish')) {
    message.delete()
      .then(msg => {
        if (!banished) {
          banished = true;
          channel.connection.disconnect(() => {
            channel = undefined;
          });
        } else {
          msg.reply("I'm not in a voice channel right now!");
        }
      });
  }
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
  if (!channel || banished) { // Bot is not connected
    return;
  }
  if (newMember.user.id === client.user.id && oldMember.voiceChannelID !== newMember.voiceChannelID) { // Bot voiceStateUpdate
    process.exit(1); // No support for moving a bot to another channel without banishing and resummoning
  } else if (oldMember.voiceChannelID !== channel.id && newMember.voiceChannelID === channel.id) {
    LOGGER.info(`${moment().format()}: ${newMember.user.username} has joined the channel`);
    tts.tts(`${newMember.user.username} has joined the channel`, `voice/join/${newMember.user.username}.mp3`, () => {
      channel.connection.playFile(__dirname + `/voice/join/${newMember.user.username}.mp3`);
    });
  } else if (oldMember.voiceChannelID === channel.id && newMember.voiceChannelID !== channel.id) {
    LOGGER.info(`${moment().format()}: ${oldMember.user.username} has left the channel`);
    tts.tts(`${oldMember.user.username} has left the channel`, `voice/leave/${oldMember.user.username}.mp3`, () => {
      channel.connection.playFile(__dirname + `/voice/leave/${oldMember.user.username}.mp3`);
    });
  }
});

setInterval(function() {
  http.get("http://discord-announcer.herokuapp.com");
}, 300000); // every 5 minutes (300000)
