const utils = require(__dirname + '/../helpers/util.js');
const currency = require(__dirname + '/../../libs/currency.js');
const LOGGER = require(__dirname + '/../../libs/logger.js');
const config = require(__dirname + '/../../../config/config.js');

/**
 * _checkArguments - Checks if the arguments are valid
 *
 * @param {Message} message A Discord.js Message object
 * @param {String[]} args The arguments passed in for the command
 * @return {Boolean} True if the arguments are valid, false othewise
 */
function _checkArguments(message, args) {
  if (typeof(args[0]) !== 'string') {
    message.reply(
      'Invalid command usage\n' +
      `Usage: \`${config.get('command.trigger')}${module.exports.name} ` +
      `<String>\``
    );
    return false;
  }
  return true;
}

/**
 * _isValidUsage - Checks if the command was used correctly
 *
 * @param {Message} message A Discord.js Message object
 * @param {String[]} args The arguments passed in for the command
 * @return {Boolean} True if used correctly, false otherwise
 */
function _isValidUsage(message, args) {
  if (!utils.isAdmin(message.member, message.guild)) {
    message.reply('You are not an Admin');
    return false;
  }
  return _checkArguments(message, args);
}

module.exports = {
  name: 'set-currency',
  description: 'An admin command to set the name of the guild currency',
  async execute(message, args) {
    if (!_isValidUsage(message, args)) {
      return;
    }
    try {
      await currency.setCurrencyType(message.guild, args[0]);
      message.reply(`The currency is now ${args[0]}`);
      LOGGER.info(`Changed guild ${message.guild.name} (${message.guild.id}) ` +
        `currency to ${args[0]}`);
    } catch (err) {
      message.reply('Something went wrong. Try again later.');
      LOGGER.error(`Failed to change guild ${message.guild.name} ` +
        `(${message.guild.id}) currency to ${args[0]}\n${err}`);
    }
  }
};
