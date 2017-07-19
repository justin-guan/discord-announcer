'use strict';

const config = require(__dirname + '/../../../config/config.js');

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

/**
 * commands - Replies to a user that invokes the commands command with commands
 *
 * @param  {JSON} info A JSON object with the discord.js client and message that
 * the bot is replying to.
 */
function commands(info) {
  const trigger = config.get('command.trigger');
  const commandList =
  '\n***Basic Commands***' +
  '```' +
  `${trigger}summon     Summons the bot into the caller's voice channel\n` +
  `${trigger}banish     Banish the bot from the caller's voice channel\n` +
  `${trigger}give <User> <Positive Num> \t`
                        + `Give guild currency to user\n` +
  `${trigger}mug <User> Attempts to steal guild currency from a user\n` +
  `${trigger}currency   Check current guild currency\n` +
  `${trigger}ld         Plays "They're all dead!"\n` +
  `${trigger}tucker     Plays crybaby\n` +
  `${trigger}tobi       Plays "It's a disastah!"\n` +
  `${trigger}zhou       Plays "Patience from zhou"\n` +
  `${trigger}waow       Plays "WAOW!"\n` +
  `${trigger}theplay    Plays beginning of The Play\n` +
  `${trigger}noone      Plays noone.wav\n` +
  `${trigger}price      Plays beginning of the Price is Right theme song\n` +
  `${trigger}duel       Plays "It's time to duel"\n` +
  `${trigger}free       Plays "Free game so no bitching"\n` +
  `${trigger}cyka       Plays cyka.wav\n` +
  `${trigger}wtf        Plays wtf.wav\n` +
  `${trigger}shut       Plays shut.wav\n` +
  `${trigger}minorities Plays minorities.wav` +
  '```' +
  '***Admin Commands***' +
  '```' +
  `${trigger}adminGive <User> <Integer>    Gives guild currency to a user\n` +
  `${trigger}setCurrency <String>     Sets the name of the guild currency\n` +
  '```';
  info.message.reply(commandList);
}

exports.showHelp = showHelp;
exports.commands = commands;
