const utils = require(__dirname + '/../helpers/util.js');
const currency = require(__dirname + '/../../libs/currency.js');
const LOGGER = require(__dirname + '/../../libs/logger.js');
const config = require(__dirname + '/../../../config/config.js');

/**
 * _isValidUsage - Checks if the command was used correctly
 *
 * @param {Message} message A Discord.js Message object
 * @param {String[]} args The arguments passed in for the command
 * @return {Boolean} True if used correctly, false otherwise
 */
function _isValidUsage(message, args) {
  const receiver = message.mentions.members.first();
  const amount = parseInt(args[1]);
  if (isNaN(amount) || receiver === undefined || amount <= 0) {
    message.reply(
      'Invalid command usage\n' +
      `Usage: \`${config.get('command.trigger')}give <User> <Positive Num>\``
    );
    return false;
  }
  return true;
}

/**
 * _hasEnoughCurrency - Checks if the user has enough currency to send
 *
 * @param {Integer} amount The amount that is to be sent
 * @param {Member} sender A Discord.js Member object
 * @return {Boolean} True if the user has enough currency, false otherwise
 */
async function _hasEnoughCurrency(amount, sender) {
  try {
    const total = await currency.get(sender);
    return _isValidTransfer(amount, total);
  } catch (err) {
    LOGGER.error(`Failed to get ${utils.getName(sender)}` +
      `(${sender.id}) currency`);
    return false;
  }
}

/**
 * _isValidTransfer - Check if the transfer amounts are valid
 *
 * @param {Integer} amount The amount that is to be sent
 * @param {Integer} total The total amount that the sender has
 * @return {Boolean} True if the user has enough currency to send
 */
function _isValidTransfer(amount, total) {
  return amount <= total && total >= 0;
}

/**
 * _doTransaction - Does the transfer transaction
 *
 * @param {Member} sender A Discord.js Guild Member who will send currency
 * @param {Member} receiver A Discord.js Guild Member who will receive currency
 * @param {Integer} sendAmount The amount that sender is sending
 * @param {Message} message A Discord.js Message object
 */
async function _doTransaction(sender, receiver, sendAmount, message) {
  const currencyType = await currency.getCurrencyType(sender.guild);  
  if (!await _hasEnoughCurrency(sendAmount, sender)) {
    message.reply(`You don't have enough ${currencyType}`);
    return;
  }
  await currency.add(sender, -1 * sendAmount);
  await currency.add(receiver, sendAmount);
  const rName = utils.getName(receiver);
  const sName = utils.getName(sender);
  message.channel.send(
    `${sName} gave ${rName} ${sendAmount} ${currencyType}\n` +
    `${rName} now has ${await currency.get(receiver)} ${currencyType}\n` +
    `${sName} now has ${await currency.get(sender)} ${currencyType}`
  );
}

module.exports = {
  name: 'give',
  description: 'Give guild currency to another user',
  async execute(message, args) {
    if (!_isValidUsage(message, args)) {
      return;
    }
    const sender = message.member;
    const receiver = message.mentions.members.first();
    const amount = parseInt(args[1]);
    try {
      await _doTransaction(sender, receiver, amount, message);
    } catch (err) {
      message.reply('Something went wrong. Try again later.');
      LOGGER.error(`${utils.getName(sender)} failed to send ` +
        `${utils.getName(receiver)} ${amount}\n${err}`);
    }
  },
};
