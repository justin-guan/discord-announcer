'use strict';

const currency = require(__dirname + '/currency.js');
const config = require(__dirname + '/../../../config/config.js');
const LOGGER = require(__dirname + '/../../libs/logger.js');

/**
 * give - Give guild currency to another user
 *
 * @param  {JSON} info A JSON object with the discord.js client and message that
 * the bot is replying to.
 */
async function give(info) {
  const receiver = info.message.mentions.members.first();
  const amount = parseInt(info.arguments[1]);
  if (info.arguments.length != 2 || isNaN(amount) || receiver === undefined ||
      amount <= 0) {
    info.message.reply(
      'Invalid command usage\n' +
      `Usage: \`${config.get('command.trigger')}give <User> <Positive Num>\``
    );
    return;
  }
  try {
    const senderAmount = await currency.get(info.message.member);
    if (senderAmount < amount || senderAmount <= 0) {
      info.message.reply(`You don't have enough ` +
        `${await currency.getCurrencyType(info.message.member.guild)}`);
      return;
    }
    if (await currency.add(info.message.member, -1 * amount)) {
      await currency.add(receiver, amount);
    };
    const name = receiver.nickname ? receiver.nickname : receiver.user.username;
    const senderName = info.message.member.nickname ?
              info.message.member.nickname : info.message.member.user.username;
    info.message.channel.send(`${senderName} gave ${name} ${amount} ` +
      `${await currency.getCurrencyType(receiver.guild)}\n` +
      `${name} now has ${await currency.get(receiver)} ` +
      `${await currency.getCurrencyType(receiver.guild)}\n` +
      `${senderName} now has ${await currency.get(info.message.member)} ` +
      `${await currency.getCurrencyType(info.message.member.guild)}`);
  } catch (err) {
    info.message.reply('Something went wrong. Try again later.');
    LOGGER.error(err);
  }
}

/**
 * checkCurrency - Check the amount of guild currency the caller has
 *
 * @param  {JSON} info A JSON object with the discord.js client and message that
 * the bot is replying to.
 */
async function checkCurrency(info) {
  try {
    info.message.reply(`You have ${await currency.get(info.message.member)} ` +
      `${await currency.getCurrencyType(info.message.member.guild)}`);
  } catch (err) {
    info.message.reply('Something went wrong. Try again later');
    LOGGER.error(err);
  }
}

exports.give = give;
exports.checkCurrency = checkCurrency;
