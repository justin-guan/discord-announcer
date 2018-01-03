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
  const member = message.mentions.members.first();
  if (isNaN(parseInt(args[1])) || member === undefined) {
    message.reply(
      'Invalid command usage\n' +
      `Usage: \`${config.get('command.trigger')}${module.exports.name} ` +
      `<User> <Integer>\``
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
  admin: true,
  name: 'admin-give',
  description: 'An admin command to give currency to a user',
  async execute(message, args) {
    if (!_isValidUsage(message, args)) {
      return;
    }
    const member = message.mentions.members.first();
    try {
      await currency.add(member, parseInt(args[1]));
      const name = utils.getName(member);
      const recvAmount = await currency.get(member);
      const currencyType = await currency.getCurrencyType(member.guild);
      message.reply(`Gave ${name} ${args[1]} ${currencyType}\n` +
        `${name} now has ${recvAmount} ${currencyType}`);
      LOGGER.info(`Gave ${name} (${member.id}) ${args[1]} ${currencyType} in ` +
        `server ${message.guild.name} (${message.guild.id})`);
    } catch (err) {
      message.reply('Something went wrong. Try again later.');
      LOGGER.error(`Failed to give ${args[1]} to ${utils.getName(member)}` +
        `(${member.id})\n${err}`);
    }
  },
};
