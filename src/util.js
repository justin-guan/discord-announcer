'use strict';

const Promise = require('bluebird');
const MongoClient = require('mongodb').MongoClient;
const _ = require('lodash');
const voicesynth = require(__dirname + '/voicesynth.js');
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
async function save(client) {
  let db;
  try {
    db = await MongoClient.connect(config.get('mongodb.url'));
    let setting = {
      'Setting': 'connections'
    };
    let result = await db.collection('global_config').findOne(setting);
    result.connections = _.values(client.voiceConnections);
    await db.collection('global_config').updateOne(setting, result);
  } catch (err) {
    LOGGER.error(`Failed to save connections\n${err}`);
  } finally {
    if (db) {
      db.close();
    }
  }
}

/**
 * reconnect - Connect to all voice channels in connections.json
 *
 * @param  {Client} client Discord.js Client object
 * @return {Promise}        Resolve on all connections successfully established,
 * reject otherwise.
 */
async function reconnect(client) {
  let db;
  try {
    db = await MongoClient.connect(config.get('mongodb.url'));
    let setting = {
      'Setting': 'connections'
    };
    let result = await db.collection('global_config').findOne(setting);
    for (let server of result.connections) {
      if (client.channels.get(server) === undefined) {
        LOGGER.warn(`${server} is not a joinable channel`);
        continue;
      }
      await client.channels.get(server).join();
      LOGGER.info(`Successfully joined ${server}`);
    }
    return Promise.resolve();
  } catch (err) {
    LOGGER.error(err);
  } finally {
    if (db) {
      db.close();
    }
  }
  /*
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
  */
}


exports.sayJoin = sayJoin;
exports.sayLeave = sayLeave;
exports.shutdown = shutdown;
exports.save = save;
exports.reconnect = reconnect;
