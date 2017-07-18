'use strict';

const config = require(__dirname + '/../../../config/config.js');
const currency = require(__dirname + '/../currency/currency.js');
const LOGGER = require(__dirname + '/../../libs/logger.js');

/**
 * _isAdmin - Check if a member is an Admin
 *
 * @param  {Message} message A Discord.js Message object
 * @return {Boolean}        True if Admin, false otherwise
 */
function _isAdmin(message) {
  const adminRole = message.guild.roles.find('name', 'Admin');
  if (!message.member.roles.has(adminRole.id)) {
    message.reply('You must be an Admin to use this command');
    return false;
  }
  return true;
}

/**
 * give - An administrator command to give currency to a user
 *
 * @param  {JSON} info A JSON object with the discord.js client and message that
 * the bot is replying to.
 * @return {void}
 */
async function give(info) {
  if (!_isAdmin(info.message)) {
    return;
  }
  const member = info.message.mentions.members.first();
  if (info.arguments.length != 2 || isNaN(parseInt(info.arguments[1])) ||
      member === undefined) {
    info.message.reply(
      'Invalid command usage\n' +
      `Usage: \`${config.get('command.trigger')}give <User> <Number>\``
    );
    return;
  }
  try {
    await currency.add(member, parseInt(info.arguments[1]));
    const name = member.nickname ? member.nickname : member.user.username;
    info.message.reply(`Gave ${name} ${info.arguments[1]} ` +
      `${await currency.getCurrencyType(member.guild)}\n` +
      `${name} now has ${await currency.get(member)} ` +
      `${await currency.getCurrencyType(member.guild)}`);
    LOGGER.info(`Gave ${name} ${info.arguments[1]} ` +
      `${await currency.getCurrencyType(member.guild)}`);
  } catch (err) {
    info.message.reply('Something went wrong. Try again later.');
    LOGGER.error(err);
  }
}

/**
 * setCurrency - Sets the guild currency
 *
 * @param  {JSON} info A JSON object with the discord.js client and message that
 * the bot is replying to.
 */
async function setCurrency(info) {
  if (!_isAdmin(info.message)) {
    return;
  }
  if (info.arguments.length != 1) {
    info.message.reply(
      'Invalid command usage\n' +
      `Usage: \`${config.get('command.trigger')}setCurrency <String>\``
    );
    return;
  }
  try {
    await currency.setCurrencyType(info.message.guild, info.arguments[0]);
    info.message.reply(`The currency is now ${info.arguments[0]}`);
    LOGGER.info(`Changed guild ${info.message.guild.id} currency ` +
      `to ${info.arguments[0]}`);
  } catch (err) {
    info.message.reply('Something went wrong. Try again later.');
    LOGGER.error(err);
  }
}

exports.give = give;
exports.setCurrency = setCurrency;
