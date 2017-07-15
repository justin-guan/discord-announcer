'use strict';


/**
 * showHelp - Replies to a user that invokes the help command with help
 * documentation.
 *
 * @param  {JSON} info A JSON object with the discord.js client and message that
 * the bot is replying to.
 */
function showHelp(info) {
  info.message.reply('See documentation here: https://github.com/justin-guan/discord-announcer#commands');
}

exports.showHelp = showHelp;
