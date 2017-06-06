'use strict';
process.title = 'Discord Announcer';

const Discord = require('discord.js');
const client = new Discord.Client();
const Promise = require('bluebird');
const voicesynth = require(__dirname + '/voicesynth.js');
const LOGGER = require(__dirname + '/logger.js');
const config = require(__dirname + '/../config/config.js');

const commands = new Map();
const sayJoinAsync = Promise.promisify(sayJoin);
const sayLeaveAsync = Promise.promisify(sayLeave);

(function init() {
  commands.set(config.get('command.trigger') + 'help', showHelp);
  commands.set(config.get('command.trigger') + 'test', test);
  commands.set(config.get('command.trigger') + 'summon', summon);
  client.login(config.get('discord.token'))
    .then(LOGGER.info('Client login success'))
    .catch(LOGGER.error);
})();

process.on('SIGTERM', cleanUp);
process.on('SIGINT', cleanUp);
process.on('SIGQUIT', cleanUp);

client.on('ready', () => {
  LOGGER.info('Client ready');
});

client.on('message', (message) => {
  if (message.author.bot || !commands.get(message.content)) {
    return;
  }
  message.delete().then(() => {
    commands.get(message.content)(message);
  });
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
  if (!newMember.voiceChannel || newMember.id === client.user.id) {
    return;
  }
  /*
  sayJoinAsync(newMember).then(() => {
    sayLeaveAsync(oldMember);
  });
  */
 sayJoin(newMember);
});

function sayJoin(member) {
  let name = member.nickname ? member.nickname : member.user.username;
  let connection;
  member.voiceChannel.join().then(c => {
    console.log(c);
    c.playFile(__dirname + `/../voice/join/${name}.mp3`);
  });
/*
  member.voiceChannel.join()
  .then(c => {
    connection = c;
    voicesynth.synth(`${name} joined the channel`,
        __dirname + `/../voice/join/${name}.mp3`);
  })
  .then(() => {
    connection.playFile(
      __dirname + `/../voice/join/${name}.mp3`);
  })
  .then(() => {
    connection.disconnect();
  });
  */
}

function sayLeave(member) {
  let name = member.nickname ? member.nickname : member.user.username;
  let connection;
  member.voiceChannel.join()
  .then(c => {
    connection = c;
    voicesynth.synth(`${name} joined the channel`,
        __dirname + `/../voice/leave/${name}.mp3`);
    LOGGER.info('Created mp3');
  })
  .then(() => {
    LOGGER.info('Playing File');
    connection.playFile(
      __dirname + `/../voice/leave/${name}.mp3`);
  })
  .then(() => {
    LOGGER.info('Disconnecting');
    connection.disconnect();
  });
}


function showHelp(message) {
  message.reply("Help documentation coming soon...");
}

let cx;
function summon(message) {
  message.delete().then(msg => {
    if (!msg.member.voiceChannel) {
      msg.reply('You need to be in a voice channel to summon me!');
      return;
    } else {
      msg.member.voiceChannel.join().then(connection => {
        cx = connection;
      });
    }
  })
}

function test(message) {
  message.delete().then(msg => {
    cx.playFile(__dirname + `/../voice/hello.mp3`);
  });
}

function cleanUp() {
  LOGGER.warn('Termination detected! Attempting to save process state...');
  client.destroy()
    .then(process.exit(0))
    .catch(process.exit(1));
}
