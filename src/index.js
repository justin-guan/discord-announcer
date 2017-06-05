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
  client.login(config.get('discord.token'))
    .then(LOGGER.info('Client login success'))
    .catch(LOGGER.error);
})();

client.on('ready', () => {
  LOGGER.info('Client ready');
});

client.on('message', (message) => {
  if (message.author.bot || !commands.get(message.content)) {
    return;
  }
  commands.get(message.content)(message);
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
 sayJoinAsync(newMember);
});

function sayJoin(member, callback) {
  let name = member.nickname ? member.nickname : member.user.username;
  member.voiceChannel.join().then((connection) => {
    voicesynth.synth(`${name} joined the channel`,
        __dirname + `/../voice/join/${name}.mp3`)
      .then(() => {
        return connection.playFile(
          __dirname + `/../voice/join/${name}.mp3`);
      })
      .then(() => {
        connection.disconnect();
      })
      .then(() => {
        if (typeof callback === 'function') {
          callback();
        }
      });
  });
}

function sayLeave(member, callback) {
  let name = member.nickname ? member.nickname : member.user.username;
  member.voiceChannel.join().then((connection) => {
    voicesynth.synth(`${name} left the channel`,
        __dirname + `/../voice/leave/${name}.mp3`)
      .then(() => {
        connection.playFile(
          __dirname + `/../voice/leave/${name}.mp3`);
      })
      .then(() => {
        connection.disconnect();
      })
      .then(() => {
        if (typeof callback === 'function') {
          callback();
        }
      });
  });
}

process.on('SIGTERM', cleanUp);
process.on('SIGINT', cleanUp);
process.on('SIGQUIT', cleanUp);

function showHelp(message) {
  message.reply("Help documentation coming soon...");
}

function test(message) {
  message.delete()
    .then(msg => {
      if (!msg.member.voiceChannel) {
        msg.reply('You need to be in a voice channel to summon me!');
        return;
      }
      (msg.member.voiceChannel).join()
        .then(connection => {
          LOGGER.info(`Joined ${msg.member.voiceChannel.name}`);
          connection.playFile(__dirname + '/../voice/hello.mp3');
        })
        .then(connection => {
          connection.disconnect();
        })
        .catch((err) => {
          LOGGER.error(`${err}`);
        });
    })
    .catch((err) => {
      LOGGER.warn(`${err}`);
    });
}

function cleanUp() {
  LOGGER.warn('Termination detected! Attempting to save process state...');
  client.destroy()
    .then(process.exit(0))
    .catch(process.exit(1));
}
