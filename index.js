'use strict';
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const tts = require(__dirname + '/text-to-mp3.js');

const commandModifier = '!';
let channel, banished = true;

client.on('ready', () => {
  console.log('Ready!');
});

client.on('message', (message) => {
  if (!message.content.startsWith(commandModifier) || message.author.bot) {
    return;
  }
  if (message.content.startsWith(commandModifier + 'summon')) {
    if (!message.member.voiceChannel) {
      message.reply("You need to be in a voice channel to summon me!");
      return;
    }
    (message.member.voiceChannel).join()
      .then(connection => {
        banished = false;
        console.log(`Connected: ${connection.ready}`);
        channel = connection.channel;
        tts.tts(`Hello World!`, `voice/hello.mp3`, () => {
          connection.playFile(__dirname + '/voice/hello.mp3');
        });
      })
      .catch(console.log);
  } else if (message.content.startsWith(commandModifier + 'banish')) {
    if (channel) {
      banished = true;
      channel.connection.disconnect(() => {
        channel = undefined;
      });
    }
  }
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
  if (!channel || banished) { // Bot is not connected
    return;
  }
  if (newMember.user.id === client.user.id && oldMember.voiceChannelID !== newMember.voiceChannelID) { // Bot voiceStateUpdate
    process.exit(1); // No support for moving a bot to another channel without banishing and resummoning
  } else if (oldMember.voiceChannelID !== channel.id && newMember.voiceChannelID === channel.id) {
    console.log(`${newMember.user.username} has joined the channel`);
    tts.tts(`${newMember.user.username} has joined the channel`, `voice/join/${newMember.user.username}.mp3`, () => {
      channel.connection.playFile(__dirname + `/voice/join/${newMember.user.username}.mp3`);
    });
  } else if (oldMember.voiceChannelID === channel.id && newMember.voiceChannelID !== channel.id) {
    console.log(`${oldMember.user.username} has left the channel`);
    tts.tts(`${oldMember.user.username} has left the channel`, `voice/leave/${oldMember.user.username}.mp3`, () => {
      channel.connection.playFile(__dirname + `/voice/leave/${oldMember.user.username}.mp3`);
    });
  }
});

if (!fs.existsSync(__dirname + '/voice')) {
  fs.mkdirSync(__dirname + '/voice');
}
if (!fs.existsSync(__dirname + '/voice/join')) {
  fs.mkdirSync(__dirname + '/voice/join');
}
if (!fs.existsSync(__dirname + '/voice/leave')) {
  fs.mkdirSync(__dirname + '/voice/leave');
}

client.login(process.env.DISCORD_TOKEN);
