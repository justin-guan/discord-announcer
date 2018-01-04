const LOGGER = require(__dirname + '/../../libs/logger.js');
const config = require(__dirname + '/../../../config/config.js');
const Guild = require(__dirname + '/../../models/guild.js');

/**
 * _isDeletableCommand - Checks if the command is available for deletion
 * @param {String} command Name of the command to delete
 * @param {Message} message A Discord.js Message object
 * @return {Boolean} True if command is available to delete, false otherwise
 */
function _isDeletableCommand(command, message) {
  if (message.client.customCommands.has(message.guild.id) &&
    message.client.customCommands.get(message.guild.id).has(command)) {
      return true;
    }
    message.reply(`${config.get('command.trigger')}${command} either cannot ` +
        `be deleted or it does not exist`);
    return false;
}

/**
 * _isValidUsage - Checks if the command was used correctly
 *
 * @param {Message} message A Discord.js Message object
 * @param {String[]} args The arguments passed in for the command
 * @return {Boolean} True if used correctly, false otherwise
 */
function _isValidUsage(message, args) {
  if (!args[0]) {
    message.reply(
      'Invalid command usage\n' +
      `Usage: \`${config.get('command.trigger')}delete <Command Name>\``
    );
    return false;
  }
  return _isDeletableCommand(args[0], message);
}

/**
 * _getQueryGuild - Gets the query guild for a Mongoose query
 *
 * @param {String} id The guild id
 * @return {JSON} A JSON object with the query guild
 */
function _getQueryGuild(id) {
  return {
    _id: id
  };
}

/**
 * _getGuild - Gets the Mongoose guild object
 * @param {String} id The guild id
 * @return {Guild} A Mongoose Guild object corresponding to the given id
 */
async function _getGuild(id) {
  try {
    const queryGuild = _getQueryGuild(id);
    let guild = await Guild.findOne(queryGuild);
    if (guild === null) {
      guild = new Guild(queryGuild);
    }
    return guild;
  } catch (e) {
    throw e;
  }
}

/**
 * _removeCommand - Removes the command from MongoDB
 *
 * @param {String} command The name of the command to remove
 * @param {String} guildIdForCommand The id for the guild with the command
 */
async function _removeCommand(command, guildIdForCommand) {
  try {
    const guild = await _getGuild(guildIdForCommand);
    await guild.removeCommand(command);
    await guild.save();
  } catch (e) {
    throw e;
  }
}

module.exports = {
  name: 'delete',
  description: 'Delete a custom command ***beta***',
  async execute(message, args) {
    if (!_isValidUsage(message, args)) {
      return;
    }
    try {
      await _removeCommand(args[0], message.guild.id);
      message.client.customCommands.get(message.guild.id).delete(args[0]);
      LOGGER.info(`Deleted command ${args[0]} from ${message.guild.name}` +
        `(${message.guild.id})`);
      message.reply(`Deleted command ${args[0]}`);
    } catch (e) {
      LOGGER.error(`Failed to remove command \n${e}`);
    }
  },
};
