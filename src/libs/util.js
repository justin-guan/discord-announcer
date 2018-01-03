'use strict';

const Promise = require('bluebird');
const mongoose = require('mongoose');
const Discord = require('discord.js');
const GlobalConfig = require(__dirname + '/../models/config.js');
const voicesynth = require(__dirname + '/voicesynth.js');
const config = require(__dirname + '/../../config/config.js');
const LOGGER = require(__dirname + '/logger.js');

mongoose.connect(config.get('mongodb.url'), {useMongoClient: true}, (err) => {
  if (err) {
    throw err;
  }
});

/**
 * @return {GlobalConfig} The Mongoose object that corresponds to the global
 * config
 */
async function _getGlobalConfig() {
  try {
    let globalConfig = await GlobalConfig.findOne({setting: 'connections'});
    if (globalConfig === null) {
      globalConfig = new GlobalConfig();
    }
    return globalConfig;
  } catch (e) {
    throw e;
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
  try {
    const globalConfig = await _getGlobalConfig();
    let connections = [];
    for (let vc of client.voiceConnections) {
      connections.push(vc[1].channel.id);
    }
    await globalConfig.updateConnections(connections);
    await globalConfig.save();
  } catch (e) {
    throw e;
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
    let result = await _getGlobalConfig();
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

/**
 * _playFile - Plays a music file to the user who invoked the command's voice
 * channel.
 *
 * @param  {Message} message A Discord.js Message object
 * @param  {String} url Path to the audio file that will be played.
 */
async function _playFile(message, url) {
  try {
    if (!message.member.voiceChannel) {
      message.reply('You need to be in a voice channel to summon me');
    } else {
      const connection = await message.member.voiceChannel.join();
      connection.playStream(url);
    }
  } catch (e) {
    LOGGER.error(e);
  }
}

/**
 * _setUpCommandJsonExecuteForAudio - Wraps the execute command for an
 * audio command in JSON
 *
 * @param {JSON} command The command info for the custom command
 * @return {JSON} Returns the JSON object for the custom command with only the
 * execute function in it
 */
function _setUpCommandJsonExecuteForAudio(command) {
  return {
    execute(message) {
      _playFile(message, command.action);
    },
  };
}

/**
 * _setUpCommandJsonExecuteForText - Wraps the execute command for a
 * text command in JSON
 *
 * @param {JSON} command The command info for the custom command
 * @return {JSON} Returns the JSON object for the custom command with only the
 * execute function in it
 */
function _setUpCommandJsonExecuteForText(command) {
  return {
    execute(message) {
      message.reply(command.action);
    },
  };
}

/**
 * _setUpCommandJson - Sets up the JSON structure to store in the client
 * for the command
 *
 * @param {JSON} command The command info for the custom command
 * @return {JSON} Returns the JSON object for the command that will be stored
 * in the client
 */
function _setUpCommandJson(command) {
  let json;
  if (command.type === 1) {
    json = _setUpCommandJsonExecuteForAudio(command);
  } else {
    json = _setUpCommandJsonExecuteForText(command);
  }
  json.name = command.name;
  json.description = command.description;
  return json;
}

/**
 * setUpCommand - Sets up the command in the client handler and in database
 *
 * @param {Client} client A Discord.js Client object
 * @param {JSON} command The command info for the custom command. The JSON
 * object must contain name, type, description, and action.
 * @param {String} guildId The guild id to add the command for
 */
function setUpCommand(client, command, guildId) {
  const customCommand = _setUpCommandJson(command);
  if (!client.customCommands.has(guildId)) {
    client.customCommands.set(guildId, new Discord.Collection());
  }
  client.customCommands.get(guildId).set(command.name, customCommand);
}

exports.shutdown = shutdown;
exports.save = save;
exports.reconnect = reconnect;
exports.setUpCommand = setUpCommand;
