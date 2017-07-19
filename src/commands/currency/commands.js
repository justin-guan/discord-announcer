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

/**
 * mug - Steal from a user
 *
 * @param  {JSON} info A JSON object with the discord.js client and message that
 * the bot is replying to.
 */
async function mug(info) {
  const target = info.message.mentions.members.first();
  if (info.arguments.length != 1 || target === undefined) {
    info.message.reply(
      'Invalid command usage\n' +
      `Usage: \`${config.get('command.trigger')}mug <User>\``
    );
    return;
  }
  try {
    if (random(0, 100) >= 0) {
      let amountStolen = 0;
      const targetAmount = await currency.get(target);
      if (targetAmount > 0) {
        amountStolen = Math.round(random(0.01, 0.3) * targetAmount);
      }
      await currency.add(info.message.member, amountStolen);
      await currency.add(target, -1 * amountStolen);
      info.message.reply(`Mugged ${target.toString()} and got ${amountStolen}`);
      LOGGER.info(`${target.id} was mugged by ${info.message.member.id}`);
    } else {
      info.message.channel.send(`${target.toString()} repelled ` +
        `${info.message.member}'s mugging`);
      LOGGER.info(`${target.id} repelled ${info.message.member.id}`);
    }
  } catch (err) {
    LOGGER.error(err);
  }
}

/**
 * random - Generates a random number between min and max
 *
 * @param  {Number} min Lower bound for random number generation
 * @param  {Number} max Upper bound for random number generation
 * @return {Number}     A random number generated between the bounds
 */
function random(min, max) {
  return Math.random() * (max - min) + min;
}

exports.give = give;
exports.checkCurrency = checkCurrency;
exports.mug = mug;
