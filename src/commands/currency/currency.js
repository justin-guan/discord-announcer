'use strict';

const MongoClient = require('mongodb').MongoClient;
const config = require(__dirname + '/../../../config/config.js');
const LOGGER = require(__dirname + '/../../libs/logger.js');

/**
 * add - Add to a user's currency amount in MongoDB
 *
 * @param  {Member} member   A Discord.js Member object
 * @param  {Integer} amount The amount of currency to add
 */
async function add(member, amount) {
  let db;
  try {
    db = await MongoClient.connect(config.get('mongodb.url'));
    let guild = {
      'Guild': member.guild.id
    };
    let result = await db.collection('guilds').findOne(guild);
    if (!result) {
      await _createDefaultGuild(member.guild);
      result = await db.collection('guilds').findOne(guild);
    }
    if (result.hasOwnProperty(member.id)) {
      result[member.id] += amount;
    } else {
      result[member.id] = amount;
    }
    await db.collection('guilds').updateOne(guild, result);
  } catch (err) {
    LOGGER.error(err);
  } finally {
    if (db) {
      db.close();
    }
  }
}

/**
 * get - Get the amount of currency for a member
 *
 * @param  {Member} member A Discord.js Member object
 * @return {Integer}        The amount of currency a member has
 */
async function get(member) {
  let db;
  try {
    db = await MongoClient.connect(config.get('mongodb.url'));
    let guild = {
      'Guild': member.guild.id
    };
    let result = await db.collection('guilds').findOne(guild);
    if (!result) {
      await _createDefaultGuild(member.guild);
      return 0;
    } else if (result.hasOwnProperty(member.id)) {
      return result[member.id];
    }
  } catch (err) {
    LOGGER.error(err);
    return null;
  } finally {
    if (db) {
      db.close();
    }
  }
}

/**
 * getCurrencyType - Gets the currency type for a guild
 *
 * @param  {Guild} guild A Discord.js Guild object
 * @return {String}       The currency name the guild is using
 */
async function getCurrencyType(guild) {
  let db;
  try {
    db = await MongoClient.connect(config.get('mongodb.url'));
    let g = {
      'Guild': guild.id
    };
    let result = await db.collection('guilds').findOne(g);
    if (!result) {
      await _createDefaultGuild(guild);
      result = await db.collection('guilds').findOne(g);
    }
    return result.currency;
  } catch (err) {
    LOGGER.error(err);
    return null;
  } finally {
    if (db) {
      db.close();
    }
  }
}

/**
 * setCurrencyType - Changes the name of the currency used in a guild
 *
 * @param  {Guild} guild A Discord.js Guild object
 * @param  {String} type  The name of the new currenct to use
 */
async function setCurrencyType(guild, type) {
  let db;
  try {
    db = await MongoClient.connect(config.get('mongodb.url'));
    let g = {
      'Guild': guild.id
    };
    let result = await db.collection('guilds').findOne(g);
    if (!result) {
      await _createDefaultGuild(guild);
      result = await db.collection('guilds').findOne(g);
    }
    result.currency = type;
    await db.collection('guilds').updateOne(g, result);
  } catch (err) {
    LOGGER.error(err);
  } finally {
    if (db) {
      db.close();
    }
  }
}

/**
 * createDefaultGuild - Creates a default document for a guild in MongoDB
 *
 * @param  {Guild} g A Discord.js Guild object
 */
async function _createDefaultGuild(g) {
  let db;
  try {
    db = await MongoClient.connect(config.get('mongodb.url'));
    let guild = {
      'Guild': g.id
    };
    let result = await db.collection('guilds').findOne(guild);
    if (!result) {
      result = guild;
      result.currency = 'gold';
      await db.collection('guilds').insertOne(guild, result);
    }
  } catch (err) {
    LOGGER.error(err);
  } finally {
    if (db) {
      db.close();
    }
  }
}

exports.add = add;
exports.get = get;
exports.getCurrencyType = getCurrencyType;
exports.setCurrencyType = setCurrencyType;
