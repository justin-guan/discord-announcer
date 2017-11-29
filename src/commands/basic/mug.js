const utils = require(__dirname + '/../helpers/util.js');
const currency = require(__dirname + '/../../libs/currency.js');
const LOGGER = require(__dirname + '/../../libs/logger.js');
const config = require(__dirname + '/../../../config/config.js');


/**
 * _isValidUsage - Checks if the command was used corectly
 * @param {Message} message A Discord.js Message object
 * @param {String[]} args The arguments passed in for the command
 * @return {Boolean} True if valid, false otherwise
 */
function _isValidUsage(message, args) {
  const target = message.mentions.members.first();
  if (args.length != 1 || target === undefined) {
    message.reply(
      'Invalid command usage\n' +
      `Usage: \`${config.get('command.trigger')}mug <User>\``
    );
    return false;
  }
  return true;
}

/**
 * _onSuccessfulMug - Does the transaction for a successful mugging
 * @param {Member} target A Discord.js Member object
 * @param {Message} message A Discord.js Message object
 */
async function _onSuccessfulMug(target, message) {
  const mugger = message.member;
  try {
    let amountStolen = 0;
    const targetTotal = await currency.get(target);
    if (targetTotal > 0) {
      amountStolen = Math.round(utils.random(0.01, 0.3) * targetTotal);
    }
    await currency.add(mugger, amountStolen);
    await currency.add(target, -1 * amountStolen);
    message.reply(`Mugged ${utils.getName(target)} and got ${amountStolen} `+
    `${await currency.getCurrencyType(target.guild)}`);
    LOGGER.info(`${utils.getName(target)} (${target.id}) was mugged by ` +
      `${utils.getName(mugger)} (${mugger.id}`);
  } catch (err) {
    message.reply('Something went wrong. Try again later.');
    LOGGER.error(`Something went wrong when ${utils.getName(mugger)}` +
      `(${mugger.id}) mugged ${utils.getName(target)} (${target.id})\n${err}`);
  }
}

/**
 * _onUnsuccessfulMug - Handles an unsuccessful mugging
 * @param {Member} target A Discord.js Member object
 * @param {Message} message A Discord.js Message object
 */
function _onUnsuccessfulMug(target, message) {
  const mugger = message.member;
  message.channel.send(`${utils.getName(target)} repelled ` +
  `${mugger.member}'s mugging`);
  LOGGER.info(`${utils.getName(target)} (${target.id}) repelled ` +
    `${utils.getName(mugger)}(${mugger.id})`);
}

/**
 * _doMugging - Tries mugging a user. There is 15% chance to steal up to 30%
 * of the target's total currency.
 * @param {Member} target A Discord.js Member object
 * @param {Message} message A Discord.js Message object
 */
function _doMugging(target, message) {
  if (utils.random(0, 100) >= 85) {
    _onSuccessfulMug(target, message);
  } else {
    _onUnsuccessfulMug(target, message);
  }
}

module.exports = {
  name: 'mug',
  description: 'Commit crime by mugging someone...',
  async execute(message, args) {
    if (!_isValidUsage(message, args)) {
      return;
    }
    const target = message.mentions.members.first();
    _doMugging(target, message);
  },
};
