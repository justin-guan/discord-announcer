const Discord = require('discord.js');
const utils = require(__dirname + '/../helpers/util.js');
const currency = require(__dirname + '/../../libs/currency.js');
const LOGGER = require(__dirname + '/../../libs/logger.js');
const config = require(__dirname + '/../../../config/config.js');

/**
 * playFile - Plays an audio file to the user who invoked the command's voice
 * channel
 *
 * @param {Message} message A Discord.js Message
 * @param {String} path Path to the audio file that will be played
 */
async function playFile(message, path) {
  try {
    const connection = await message.member.voiceChannel.join();
    connection.playFile(path);
  } catch (err) {
    LOGGER.error(`Failed to play audio at ${path}\n${err}`);
  }
}

/**
 * _isValidUsage - checks if the command was used correctly
 *
 * @param {Message} message A Discord.js Message object
 * @param {String[]} args The arguments passed in for the command
 * @return {Boolean} True if used correctly, false otherwise
 */
function _isValidUsage(message, args) {
  if (args.length != 1 || message.attachments.first() === undefined) {
    message.reply(
      `Invalid command usage\n` +
      `Usage: \`${config.get('command.trigger')}create-voice <String>\`` +
      'There must be an audio file attached to the message'
    )
    return false;
  }
  return true;
}

function _commandAlreadyExists(message, args) {
  const commands = message.client.commands;
  if (commands.has(args[0])) {
    message.reply('This command already exists');
    return false;
  }
  return true;
}

/**
 * _collectName - collects the name for a custom command
 *
 * @param {Message} msg A Discord.js Message object
 * @return {String} The name of the custom command submitted by the user
 */
function _collectName(msg) {
  if (msg.content === undefined || msg.content === ' ') {
    msg.author.send('Invalid name. Please enter a new one');
    return undefined;
  }
  msg.author.send(
    'What type of command will this be?\n' +
    '1. Voice (Sends audio to a voice channel)\n' +
    '2. Text (Sends text to a text channel)'
  );
  return msg.content;
}

/**
 * _isValidType - Checks if the type is a valid selection
 *
 * @param {Integer} selection The user's selected type
 * @return {Boolean} True if valid, false if invalid
 */
function _isValidType(selection) {
  return !isNaN(selection) && selection < 2 && selection > 1;
}
/**
 * _collectType - Collects the type for a custom command
 *
 * @param {Message} msg A Discord.js Message object
 * @return {Integer} Returns 1 if voice command, and 2 if text command
 */
function _collectType(msg) {
  const selection = parseInt(msg.content);
  if (_isValidType(selection)) {
    msg.author.send('Invalid type. Please choose 1 or 2');
    return undefined;
  }
  msg.author.send('Please enter a description for the command');
  return selection;
}

/**
 * _promptForAction - Prompts the user for either audio for audio based
 * commands, or text for text based commands
 *
 * @param {Message} msg A Discord.js Message object
 * @param {Integer} type The type of command that is being created
 */
function _promptForAction(msg, type) {
  if (type === 1) {
    msg.author.send(
      'Please send me the audio you want to use\n' +
      'You can do this by dragging and dropping the audio file into ' +
      'Discord\n' + 'Type "cancel" to cancel creation'
    );
  } else {
    msg.author.send(
      'What do you want this text command to say?'
    );
  }
}

/**
 * _collectDescription - Collects the description for a custom command
 *
 * @param {Message} msg A Discord.js Message object
 * @param {Integer} type The type of the custom command
 * @return {String} The description for the custom command
 */
function _collectDescription(msg, type) {
  if (msg.content === undefined) {
    msg.author.send('Invalid description. Please enter a description.');
    return undefined;
  }
  _promptForAction(msg, type);
  return msg.content;
}

/**
 * _isValidAudioAction - Checks if the action given by the user is
 * valid for an audio based command
 *
 * @param {Message} msg A Discord.js Message object
 * @return {Boolean} True if valid, false otherwise
 */
function _isValidAudioAction(msg) {
  if (msg.attachments.first() === undefined) {
    msg.author.send('You need to upload an audio file');
    return false;
  }
  return true;
}

/**
 * _isValidTextAction - Checks if the action given by the user is
 * valid for a text based command
 *
 * @param {Message} msg A Discord.js Message object
 * @return {Boolean} True if valid, false otherwise
 */
function _isValidTextAction(msg) {
  if (msg.content === undefined) {
    msg.author.send('Invalid text. Please enter something else.');
    return false;
  }
  return true;
}

/**
 * _isValidAction - Checks if the action given by the user is valid
 *
 * @param {Message} msg A Discord.js Message object
 * @param {Integer} type The type of the custom command
 * @return {Boolean} True if valid, false otherwise
 */
function _isValidAction(msg, type) {
  if (type === 1) {
    return _isValidAudioAction(msg);
  } else {
    return _isValidTextAction(msg);
  }
}

/**
 * _getAction - Gets the action based on the type
 *
 * @param {Message} msg A Discord.js Message object
 * @param {Integer} type The type of the custom command
 * @param {JSON} command The JSON object containing the custom command
 * @return {String} Returns a url for an audio based command, or a
 * string reply for a text based command
 */
function _getAction(msg, type, command) {
  let action;
  let reply = 'Creating a voice command\n' +
  `Name: ${command.name}\n` +
  `Description: ${command.description}\n`;
  if (type === 1) {
    action = msg.attachments.first().url;
    reply = reply +
      `Plays audio located at \n${action}`;
  } else {
    action = msg.content;
    reply = reply +
      `Sends the following text:\n` +
      '```\n' +
      `${action}\n` +
      '```';
  }
  msg.author.send(
    reply + '\n' +
    'Is this ok? <Y/N>'
  );
  return action;
}

/**
 * _collectAction - Collects either the audio for an audio based command
 * or the text for a text based command
 *
 * @param {Message} msg A Discord.js Message object
 * @param {Integer} type The type of the custom command
 * @param {JSON} command The JSON object containing the custom command
 * @return {String} Returns the url for the audio to play for the command,
 * or the text for the command
 */
function _collectAction(msg, type, command) {
  if (!_isValidAction(msg, type)) {
    return undefined;
  }
  return _getAction(msg, type, command);
}

/**
 * _isValidConfirmation - Checks if the user's confirmation to create a
 * command is valid or not.
 *
 * @param {Message} msg A Discord.js Message object
 * @return {Boolean} True if the user's confirmation is valid, false otherwise
 */
function _isValidConfirmation(msg) {
  let valid = false;
  if (msg.content.toLowerCase().replace(/\s/g, '') === 'y') {
    msg.author.send('We did it!');
    msg.client.collectors.delete(msg.author.id);
    valid = true;
  } else if (msg.content.toLowerCase().replace(/\s/g, '') === 'n') {
    msg.author.send('Command creation cancelled.');
    msg.client.collectors.delete(msg.author.id);
    valid = true;
  }
  return valid;
}

/**
 * _createCommand - Creates the custom command.
 *
 * @param {Message} msg A Discord.js Message object
 * @param {Integer} type The type of the custom command
 * @return {Boolean} True if the collector should be destroyed, false
 * otherwise.
 */
function _createCommand(msg, type) {
  let shouldDestroyCollector = false;
  if (_isValidConfirmation(msg)) {
    shouldDestroyCollector = true;
  } else {
    msg.author.send('Please choose Y/N');
  }
  return shouldDestroyCollector;
}

/**
 * _collectInfo - Collects information from the user about command creation
 * @param {Channel} dmChannel A Discord.js DM Channel
 * @param {String} authorId The Discord ID number of the user
 */
function _collectInfo(dmChannel, authorId) {
  const collector = dmChannel.createMessageCollector(
    (m) => m.author.id === authorId
  );
  let command = {};
  let step = 0;
  dmChannel.send('Please enter a name for your command');
  collector.on('collect', (msg) =>{
    switch (step) {
      case 0: // Name
        command.name = _collectName(msg);
        if (command.name !== undefined) {
          step++;
        }
        return;
      case 1: // Type
        command.type = _collectType(msg);
        if (command.type !== undefined) {
          step++;
        }
        return;
      case 2: // Description
        command.description = _collectDescription(msg, command.type);
        if (command.description !== undefined) {
          step++;
        }
        return;
      case 3: // Action
        command.action = _collectAction(msg, command.type, command);
        if (command.action !== undefined) {
          step++;
        }
        return;
      case 4: // Create
        if (_createCommand(msg, command.type)) {
          collector.stop();
        }
        return;
    }
  });
}

module.exports = {
  name: 'create',
  description: 'Create a custom command',
  async execute(message) {
    if (message.client.collectors.has(message.author.id)) {
      message.reply(
        `You're already creating a command. Please finish creating ` +
        'that command first. Check your DMs for a message from me about' +
        'creating custom commands.'
      );
      return;
    }
    try {
      const dm = await message.author.send(
        `Creating a command in ${message.guild.name}`);
      message.client.collectors.set(message.author.id, true);
      _collectInfo(dm.channel, message.author.id);
    } catch (err) {
      LOGGER.error(err);
    }
  },
};
