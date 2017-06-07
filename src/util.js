'use strict';

const fs = require('fs-extra');
const Promise = require('bluebird');
const voicesynth = require(__dirname + '/voicesynth.js');
const LOGGER = require(__dirname + '/logger.js');

async function sayJoin(member) {
  const name = member.nickname ? member.nickname : member.user.username;
  const connection = member.voiceChannel.connection;
  const path = await voicesynth.synth(
    `${name} joined the channel`,
    __dirname + `/../voice/join/${name}.mp3`);
  connection.playFile(path);
}

async function sayLeave(member) {
  const name = member.nickname ? member.nickname : member.user.username;
  const connection = member.voiceChannel.connection;
  const path = await voicesynth.synth(
    `${name} left the channel`,
    __dirname + `/../voice/leave/${name}.mp3`);
  connection.playFile(path);
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

function reconnect(client) {
  let promises = [];
  for (let id in JSON.parse(fs.readFileSync(__dirname + '/connections.json'))) {
    let def = Promise.defer();
    promises.push(def.promise);
    LOGGER.info(`Trying to reconnect to voice channel ${id}...`);
    if (client.channels.get(id) === undefined) {
      LOGGER.warn(`${id} is not a channel`);
      def.reject();
      continue;
    }
    client.channels.get(id).join()
    .then(() => {
      LOGGER.info(`Successfully joined voice channel ${id}!`);
      def.resolve();
    })
    .catch(err => {
      LOGGER.warn(`Failed to join voice channel ${id}`);
      def.reject();
    });
  }
  return Promise.all(promises);
}


exports.sayJoin = sayJoin;
exports.sayLeave = sayLeave;
exports.shutdown = shutdown;
exports.save = save;
exports.reconnect = reconnect;
