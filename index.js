'use strict';
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const tts = require(__dirname + '/text-to-mp3.js');

const commandModifier = '!';
let channel;

client.on('ready', () => {
  console.log('Ready!');
});

client.on('message', (message) => {
  if (message.content.startsWith(commandModifier + 'summon')) {
    (message.member.voiceChannel).join()
      .then(connection => {
        console.log(`Connected: ${connection.ready}`);
        channel = connection.channel;
        tts.tts(`Hello World!`, `voice/hello.mp3`, () => {
          connection.playFile(__dirname + '/voice/hello.mp3');
        });
      })
      .catch(console.log);
  } else if (message.content.startsWith(commandModifier + 'unsummon')) {
    if (channel) {
      channel.connection.disconnect();
    }
  }
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
  if (newMember.user.client === client && newMember.user.bot) { //Bot got moved
    channel = newMember.voiceChannel;
    console.log('I got moved to a new channel');
  } else if (oldMember.mute !== newMember.mute || oldMember.deafen !== newMember.deafen) {
    return; // No notification on mute and deafen
  } else if (newMember.voiceChannel !== channel) { // No voiceChannelID implies that the user has left
    console.log(`${oldMember.user.username} has left the channel`);
    tts.tts(`${oldMember.user.username} has left the channel`, `voice/leave/${oldMember.user.username}.mp3`, () => {
      channel.connection.playFile(__dirname + `/voice/leave/${oldMember.user.username}.mp3`);
    });
  } else { // User has joined some channel
    console.log(`${newMember.user.username} has joined the channel`);
    tts.tts(`${newMember.user.username} has joined the channel`, `voice/join/${newMember.user.username}.mp3`, () => {
      channel.connection.playFile(__dirname + `/voice/join/${newMember.user.username}.mp3`);
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

client.login(process.env.DISCORD_KEY);
