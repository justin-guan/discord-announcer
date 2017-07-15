'use strict';

const fs = require('fs-extra');
const Promise = require('bluebird');
const voicesynth = require(__dirname + '/voicesynth.js');
const dropbox = require(__dirname + '/dropbox.js');
const LOGGER = require(__dirname + '/logger.js');

/**
 * sayJoin - Causes the bot to announce a member has joined the voice channel
 *
 * @param  {Member} member Discord.js Member object
 */
async function sayJoin(member) {
  const name = member.nickname ? member.nickname : member.user.username;
  const connection = member.voiceChannel.connection;
  const path = await voicesynth.synth(
    `${name} joined the channel`,
    __dirname + `/../voice/join/${name}.mp3`);
  connection.playFile(path);
}

/**
 * sayLeave - Causes the bot to announce a member has left the voice channel
 *
 * @param  {Member} member Discord.js Member object
 */
async function sayLeave(member) {
  const name = member.nickname ? member.nickname : member.user.username;
  const connection = member.voiceChannel.connection;
  const path = await voicesynth.synth(
    `${name} left the channel`,
    __dirname + `/../voice/leave/${name}.mp3`);
  connection.playFile(path);
}

/**
 * shutdown - Safely shutdown bot
 *
 * @param  {Client} client Discord.js Client object
 */
function shutdown(client) {
  LOGGER.warn('Termination signal detected! Exiting...');
  client.destroy()
    .then(process.exit(0))
    .catch(process.exit(1));
}

/**
 * save - Saves the bot's currently joined voice channels. This is done in case
 * the bot is restarted or crashes.
 *
 * @param  {Client} client Discord.js Client object
 */
function save(client) {
  let data = {};
  // eslint-disable-next-line
  for (let [k, vc] of client.voiceConnections) {
    data[vc.channel.id] = true;
  }
  fs.writeFile(__dirname + '/connections.json', JSON.stringify(data), 'utf8')
    .then(() => {
      LOGGER.info('Connections saved');
      dropbox.saveToDropbox(__dirname + '/connections.json');
    })
    .catch((e) => {
      LOGGER.error(`Failed to save connections\n${e}`);
    });
}

/**
 * establishConnections - Connect to all voice channels in connections.json
 *
 * @param  {Client} client Discord.js Client object
 * @return {Promise}        Resolve on all connections successfully established,
 * reject otherwise.
 */
function establishConnections(client) {
  let promises = [];
  // eslint-disable-next-line
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
    .catch((err) => {
      LOGGER.warn(`Failed to join voice channel ${id}`);
      def.reject();
    });
  }
  return Promise.all(promises);
}

/**
 * reconnect - Download connections.json from dropbox and then establish
 * connections to all saved connections.
 *
 * @param  {Client} client Discord.js Client object
 * @return {Promise}        Resolve on successful download and connection
 * establishment, reject otherwise.
 */
function reconnect(client) {
  /*
  This mess seems to be due to a bug in the dropbox module not properly handling
  the .catch() and .finally() methods for Promises.
   */
  return new Promise((resolve, reject) => {
    dropbox.importFromDropbox()
      .then(() => {
        establishConnections(client)
          .then(() => {
            resolve();
          })
          .catch(() => {
            reject();
          });
      });
  });
}


exports.sayJoin = sayJoin;
exports.sayLeave = sayLeave;
exports.shutdown = shutdown;
exports.save = save;
exports.reconnect = reconnect;
