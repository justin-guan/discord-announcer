'use strict';

const Promise = require('bluebird');
const MongoClient = require('mongodb').MongoClient;
const voicesynth = require(__dirname + '/voicesynth.js');
const config = require(__dirname + '/../../config/config.js');
const LOGGER = require(__dirname + '/logger.js');

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
      .then(async (connection) => {
        LOGGER.info(`Successfully joined ${server}`);
        try {
          if (config.get('onJoinVoiceChannel')) {
            const path = await voicesynth.synth(
              `${config.get('onJoinVoiceChannel')}`,
              __dirname + `/../../voice/onJoin.mp3`);
            connection.playFile(path);
          }
        } catch (err) {
          LOGGER.error(`Failed to synthesize onJoin.mp3`);
          LOGGER.error(err);
        }
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


exports.shutdown = shutdown;
exports.save = save;
exports.reconnect = reconnect;
