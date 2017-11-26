const config = require(__dirname + '/../../config/config.js');

/**
 * isValidCommand - Check if the message is a valid command
 *
 * @param {Message} message A discord.js Message
 * @param {String} command The name of the command
 * @param {Collection} commandList A Discord.js collection of commands
 * @return {Boolean} True if is valid, false otherwise
 */
function isValidCommand(message, command, commandList) {
  return _messageCanBeCommand(message) && _isCommand(command, commandList);
}

/**
 * _isCommand - Checks if the command is defined
 *
 * @param {String} command The name of the command
 * @param {Collection} commandList A Discord.js collection of commands
 * @return {Boolean} True if is valid, false otherwise
 */
function _isCommand(command, commandList) {
  return commandList.has(command);
}

/**
 * _messageCanBeCommand - Check if the message can be a command
 *
 * @param {Message} message A discord.js Message
 * @return {Boolean} True if is valid, false otherwise
 */
function _messageCanBeCommand(message) {
  return message.content.startsWith(config.get('command.trigger')) &&
  !message.author.bot && message.channel.type !== 'dm';
}

exports.isValidCommand = isValidCommand;
