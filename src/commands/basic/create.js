const util = require(__dirname + '/../../libs/util.js');
const utils = require(__dirname + '/../helpers/util.js');
const currency = require(__dirname + '/../../libs/currency.js');
const LOGGER = require(__dirname + '/../../libs/logger.js');
const config = require(__dirname + '/../../../config/config.js');
const Guild = require(__dirname + '/../../models/guild.js');
const mongoose = require('mongoose');

mongoose.connect(config.get('mongodb.url'), {useMongoClient: true}, (err) => {
  if (err) {
    throw err;
  }
});

/**
 * _isValidName - Checks if the name has invalid characters
 *
 * @param {String} name The name of the command
 * @return {Boolean} Returns true if valid, false otherwise
 */
function _isValidName(name) {
  return name !== undefined && name.replace(/ /g, '') !== '';
}

/**
 * _commandAlreadyExists - Checks if a command with the name already exists
 *
 * @param {Message} msg A Discord.js Message object
 * @return {Boolean} Returns true if command already exists, false otherwise
 */
function _commandAlreadyExists(msg) {
  if (msg.client.commands.has(msg.content)) {
    msg.author.send('Invalid name. A command with this name already exists');
    return true;
  }
  return false;
}

/**
 * _isValidCommandName - Checks if the command name is valid
 *
 * @param {Message} msg A Discord.js Message object
 * @return {Boolean} Returns true if valid, false otherwise
 */
function _isValidCommandName(msg) {
  if (!_isValidName(msg.content)) {
    msg.author.send('Invalid name. Please enter a new one');
    return false;
  } else if (msg.content.includes(' ')) {
    msg.author.send('The name cannot contain spaces. Please enter a new one');
    return false;
  }
  return !_commandAlreadyExists(msg);
}

/**
 * _collectName - Collects the name for a custom command
 *
 * @param {Message} msg A Discord.js Message object
 * @return {String} The name of the custom command submitted by the user
 */
function _collectName(msg) {
  if (!_isValidCommandName(msg)) {
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
 * @return {String} The audio url if valid, null if cancel signal, or
 * undefined if neither
 */
function _isValidAudioAction(msg) {
  if (msg.content.toLowerCase() === 'cancel') {
    msg.author.send('Command creation cancelled');
    return null;
  }
  if (msg.attachments.first() === undefined) {
    msg.author.send('You need to upload an audio file');
    return undefined;
  }
  return msg.attachments.first().url;
}

/**
 * _isValidTextAction - Checks if the action given by the user is
 * valid for a text based command
 *
 * @param {Message} msg A Discord.js Message object
 * @return {String} The action if valid, undefined otherwise
 */
function _isValidTextAction(msg) {
  if (msg.content === undefined) {
    msg.author.send('Invalid text. Please enter something else.');
    return undefined;
  }
  return msg.content;
}

/**
 * _isValidAction - Checks if the action given by the user is valid
 *
 * @param {Message} msg A Discord.js Message object
 * @param {Integer} type The type of the custom command
 * @return {String} The action if valid, null if cancel signal (audio only), or
 * undefined if neither
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
  `Name: ${config.get('command.trigger')}${command.name}\n` +
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
  let result = _isValidAction(msg, type);
  if (result === undefined || result === null) {
    return result;
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
 * _saveCommand - Saves the command to MongoDB
 *
 * @param {String} id The guild id which the command will correspond to
 * @param {JSON} command The command info for the custom command. The JSON
 * object must contain name, type, description, and action.
 */
async function _saveCommand(id, command) {
  try {
    const guild = await _getGuild(id);
    await guild.addNewCommand(command);
    await guild.save();
  } catch (e) {
    throw e;
  }
}

/**
 * _setUpCommand - Sets up the command in the client handler and in database
 *
 * @param {Message} msg A Discord.js Message object
 * @param {JSON} command The command info for the custom command
 * @param {String} guildIdForCommand The guild id to save the command for
 */
async function _setUpCommand(msg, command, guildIdForCommand) {
  try {
    await _saveCommand(guildIdForCommand, command);
    util.setUpCommand(msg.client, command, guildIdForCommand);
    msg.author.send('Command successfully created!');
  } catch (e) {
    msg.reply('Failed to save the command, please try again later');
    LOGGER.error(`Failed to save command\n${e}`);
  }
}

/**
 * _createCommand - Creates the custom command.
 *
 * @param {Message} msg A Discord.js Message object
 * @param {JSON} command The command info for the custom command
 * @param {String} guildIdForCommand The guild id to save the command for
 * @return {Boolean} True if the collector should be destroyed, false
 * otherwise.
 */
function _createCommand(msg, command, guildIdForCommand) {
  let shouldDestroyCollector = false;
  if (_isValidConfirmation(msg)) {
    _setUpCommand(msg, command, guildIdForCommand);
    shouldDestroyCollector = true;
  } else {
    msg.author.send('Please choose Y/N');
  }
  return shouldDestroyCollector;
}

/**
 * _startCommandCreation - Collects information from the user about command
 * creation
 * @param {Channel} dmChannel A Discord.js DM Channel
 * @param {String} authorId The Discord ID number of the user
 * @param {String} guildIdForCommand The guild id for the command to apply to
 */
function _startCommandCreation(dmChannel, authorId, guildIdForCommand) {
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
        break;
      case 1: // Type
        command.type = _collectType(msg);
        if (command.type !== undefined) {
          step++;
        }
        break;
      case 2: // Description
        command.description = _collectDescription(msg, command.type);
        if (command.description !== undefined) {
          step++;
        }
        break;
      case 3: // Action
        command.action = _collectAction(msg, command.type, command);
        if (command.action === null) {
          msg.client.collectors.delete(msg.author.id);
          collector.stop();
        } else if (command.action !== undefined) {
          step++;
        }
        break;
      case 4: // Create
        if (_createCommand(msg, command, guildIdForCommand)) {
          collector.stop();
        }
        break;
    }
  });
}

/**
 * _shouldAllowCommandCreation - Check if the user is already currently in
 * the process of creating a command, and if the user has enough currency
 * to create a command
 * @param {Message} message A Discord.js Message object
 * @return {Boolean} True if the user meets all requirements, false otherwise
 */
async function _shouldAllowCommandCreation(message) {
  if (message.client.collectors.has(message.author.id)) {
    message.reply(
      `You're already creating a command. Please finish creating ` +
      'that command first. Check your DMs for a message from me about ' +
      'creating custom commands.'
    );
    return false;
  } else if (await currency.get(message.member) < module.exports.cost) {
    message.reply(`You don't have enough ` +
      `${await currency.getCurrencyType(message.guild)} to do this`);
    return false;
  }
  return true;
}

module.exports = {
  name: 'create',
  description: 'Create a custom command',
  cost: 10,
  async execute(message) {
    if (!await _shouldAllowCommandCreation(message)) {
      return;
    }
    try {
      const dm = await message.author.send(
        `Creating a command in ${message.guild.name}`);
      message.client.collectors.set(message.author.id, true);
      _startCommandCreation(dm.channel, message.author.id, message.guild.id);
    } catch (err) {
      LOGGER.error(err);
    }
  },
};
