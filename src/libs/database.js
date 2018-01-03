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
 * getAllGuilds - Gets a list of all the guilds stored in MongoDB
 * @return {Array} Returns a collection of guilds from MongoDB
 */
async function getAllGuilds() {
  return await Guild.find({});
}

exports.getAllGuilds = getAllGuilds;
