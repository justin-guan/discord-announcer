'use strict';

const Promise = require('bluebird');
const MongoClient = require('mongodb').MongoClient;
const voicesynth = require(__dirname + '/voicesynth.js');
const config = require(__dirname + '/../config/config.js');
const LOGGER = require(__dirname + '/logger.js');

/**
 * sayJoin - Causes the bot to announce a member has joined the voice channel
 *
 * @param  {Member} member Discord.js Member object
 */
async function sayJoin(member) {
  const name = member.nickname ? member.nickname : member.user.username;
  const connection = member.voiceChannel.connection;
  try {
    const path = await voicesynth.synth(
      `${name} joined the channel`,
      __dirname + `/../voice/join/${name}.mp3`);
    connection.playFile(path);
  } catch (err) {
    LOGGER.error(`Failed to synthesize join voice file for ${name}`);
  }
}

/**
 * sayLeave - Causes the bot to announce a member has left the voice channel
 *
 * @param  {Member} member Discord.js Member object
 */
async function sayLeave(member) {
  const name = member.nickname ? member.nickname : member.user.username;
  const connection = member.voiceChannel.connection;
  try {
      const path = await voicesynth.synth(
      `${name} left the channel`,
      __dirname + `/../voice/leave/${name}.mp3`);
    connection.playFile(path);
  }
  catch (err) {
    LOGGER.error(`Failed to synthesize leave voice file for ${name}`);
  }
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
    result.connections = [];
    for (let vc of client.voiceConnections) {
      result.connections.push(vc[1].channel.id);
    }
    await db.collection('global_config').updateOne(setting, result);
    LOGGER.info('Connections saved!');
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
    let promises = [];
    for (let server of result.connections) {
      let def = Promise.defer();
      promises.push(def.promise);
      if (client.channels.get(server) === undefined) {
        LOGGER.warn(`${server} is not a joinable channel`);
        def.reject();
        continue;
      }
      client.channels.get(server).join()
      .then(() => {
        LOGGER.info(`Successfully joined ${server}`);
        def.resolve();
      })
      .catch(() => {
        LOGGER.warn(`Failed to join ${server}`);
        def.reject();
      });
    }
    return Promise.all(promises);
  } catch (err) {
    LOGGER.error(err);
    return Promise.reject();
  } finally {
    if (db) {
      db.close();
    }
  }
}


exports.sayJoin = sayJoin;
exports.sayLeave = sayLeave;
exports.shutdown = shutdown;
exports.save = save;
exports.reconnect = reconnect;
