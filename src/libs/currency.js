const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Guild = require(__dirname + '/../models/guild.js');
const config = require(__dirname + '/../../config/config.js');

mongoose.connect(config.get('mongodb.url'), {useMongoClient: true}, (err) => {
  if (err) {
    throw err;
  }
});

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
 * add - Add to a user's currency amount in MongoDB
 *
 * @param {Member} member A Discord.js Member object
 * @param {Integer} amount The amount of currency to add
 */
async function add(member, amount) {
  try {
    const guild = await _getGuild(member.guild.id);
    await guild.addUserCurrency(member.id, amount);
    await guild.save();
  } catch (e) {
    throw e;
  }
}

/**
 * transfer - Transfer currency from the sender to receiver
 * @param {Member} sender The Discord.js Member that is the sender
 * @param {Member} receiver The Discord.js Member that is the receiver
 * @param {Integer} amount The amount of currency to send to the receiver
 */
async function transfer(sender, receiver, amount) {
  try {
    const guild = await _getGuild(sender.guild.id);
    await guild.addUserCurrency(sender.id, -1 * amount);
    await guild.addUserCurrency(receiver.id, amount);
    await guild.save();
  } catch (e) {
    throw e;
  }
}

/**
 * get - Get the user's currency amount in MongoDB
 *
 * @param {Member} member A Discord.js Member object
 * @return {Integer} The amount of currency a user has
 */
async function get(member) {
  try {
    const guild = await _getGuild(member.guild.id);
    await guild.save();
    return guild.getUserCurrency(member.id);
  } catch (e) {
    throw e;
  }
}

/**
 * getCurrencyType - Gets the currency type for a guild
 *
 * @param  {Guild} g A Discord.js Guild object
 * @return {String}       The currency name the guild is using
 */
async function getCurrencyType(g) {
  try {
    const guild = await _getGuild(g.id);
    await guild.save();
    return guild.currency.type;
  } catch (e) {
    throw e;
  }
}

/**
 * setCurrencyType - Changes the name of the currency used in a guild
 *
 * @param  {Guild} g A Discord.js Guild object
 * @param  {String} type  The name of the new currenct to use
 */
async function setCurrencyType(g, type) {
  try {
    const guild = await _getGuild(g.id);
    guild.currency.type = type;
    await guild.save();
  } catch (e) {
    throw e;
  }
}

exports.add = add;
exports.get = get;
exports.transfer = transfer;
exports.getCurrencyType = getCurrencyType;
exports.setCurrencyType = setCurrencyType;
