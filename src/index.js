'use strict';
process.title = 'Discord Announcer';

const Discord = require('discord.js');
const client = new Discord.Client();
const Promise = require('bluebird');
const tts = require(__dirname + '/text-to-mp3.js');
const LOGGER = require(__dirname + '/logger.js');

const commandModifier = '?';
let channel, banished = true;

client.login(process.env.DISCORD_TOKEN)
  .then(() => {
    LOGGER.info(`Client login success`);
  })
  .catch((err) => {
    LOGGER.error(`${err}`);
  });

client.on('ready', () => {
  LOGGER.info(`Client ready`);
});

client.on('message', (message) => {
  if (!message.content.startsWith(commandModifier) || message.author.bot) {
    return;
  }
  if (message.content.startsWith(commandModifier + 'summon')) {
    summon(message);
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

function summon(message) {
  message.delete()
    .then(msg => {
      if (!msg.member.voiceChannel) {
        msg.reply('You need to be in a voice channel to summon me!');
        return;
      }
      (msg.member.voiceChannel).join()
        .then(connection => {
          banished = false;
          LOGGER.info(`Joined ${msg.member.voiceChannel.name}`);
          channel = connection.channel;
          tts.tts(`Hello World!`, __dirname + `/../voice/hello.mp3`, () => {
            connection.playFile(__dirname + '/../voice/hello.mp3');
          });
        })
        .catch((err) => {
          LOGGER.error(`${err}`);
        });
    })
    .catch((err) => {
      LOGGER.warn(`${err}`);
    });
}

client.on('voiceStateUpdate', (oldMember, newMember) => {
  if (!channel || banished) { // Bot is not connected
    return;
  }
  if (newMember.user.id === client.user.id && oldMember.voiceChannelID !== newMember.voiceChannelID) { // Bot voiceStateUpdate
    LOGGER.error(`Bot was incorrectly moved. Recovering from unhandled error by exitting...`);
    process.exit(1); // No support for moving a bot to another channel without banishing and resummoning
  } else if (oldMember.voiceChannelID !== channel.id && newMember.voiceChannelID === channel.id) {
    LOGGER.info(`${newMember.user.username} has joined the channel`);
    tts.tts(`${newMember.user.username} has joined the channel`, __dirname + `/../voice/join/${newMember.user.username}.mp3`, () => {
      channel.connection.playFile(__dirname + `/../voice/join/${newMember.user.username}.mp3`);
    });
  } else if (oldMember.voiceChannelID === channel.id && newMember.voiceChannelID !== channel.id) {
    LOGGER.info(`${oldMember.user.username} has left the channel`);
    tts.tts(`${oldMember.user.username} has left the channel`, __dirname + `/../voice/leave/${oldMember.user.username}.mp3`, () => {
      channel.connection.playFile(__dirname + `/../voice/leave/${oldMember.user.username}.mp3`);
    });
  }
});

process.on('SIGTERM', () => {
  cleanUp();
});

process.on('SIGINT', () => {
  cleanUp();
});

process.on('SIGQUIT', () => {
  cleanUp();
});

function cleanUp() {
  LOGGER.warn(`SIGTERM detected! Attempting to save process state...`);
  client.destroy();
}
