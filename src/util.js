'use strict';

const fs = require('fs-extra');
const voicesynth = require(__dirname + '/voicesynth.js');
const LOGGER = require(__dirname + '/logger.js');

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

function shutdown(client) {
  LOGGER.warn('Termination signal detected! Exiting...');
  client.destroy()
    .then(process.exit(0))
    .catch(process.exit(1));
}

function save(client) {
  let data = {};
  for (let [k, vc] of client.voiceConnections) {
    data[vc.channel.id] = true;
  }
  fs.writeFile(__dirname + '/connections.json', JSON.stringify(data), 'utf8')
    .then(() => {
      LOGGER.info('Connections saved');
    })
    .catch(e => {
      LOGGER.error(`Failed to save connections\n${e}`);
    });
}


exports.sayJoin = sayJoin;
exports.sayLeave = sayLeave;
exports.shutdown = shutdown;
exports.save = save;
