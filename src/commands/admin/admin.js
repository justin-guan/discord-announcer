'use strict';

const config = require(__dirname + '/../../../config/config.js');

/**
 * give - An administrator command to give currency to a user
 *
 * @param  {JSON} info A JSON object with the discord.js client and message that
 * the bot is replying to.
 * @return {void}
 */
function give(info) {
  const adminRole = info.message.guild.roles.find('name', 'Admin');
  if (!info.message.member.roles.has(adminRole.id)) {
    info.message.reply('You must be an Admin to use this command');
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
  const name = member.nickname ? member.nickname : member.user.username;
  info.message.reply(`Gave ${name} ${info.arguments[1]} shekels`);
}

exports.give = give;
