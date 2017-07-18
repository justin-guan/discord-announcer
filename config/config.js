'use strict';

const convict = require('convict');
const LOGGER = require(__dirname + '/../src/libs/logger.js');

const conf = convict({
  voiceRSS: {
    key: {
      doc: 'The VoiceRSS API key',
      default: '',
      env: 'VOICE_KEY'
    },
    url: {
      doc: 'The VoiceRSS API url',
      default: '' // Provided by config.json
    }
  },
  discord: {
    token: {
      doc: 'The Discord Bot Token',
      default: '',
      env: 'DISCORD_TOKEN'
    }
  },
  command: {
    trigger: {
      doc: 'The trigger prefix for a command',
      default: '!',
      env: 'TRIGGER_PREFIX'
    }
  },
  mongodb: {
    url: {
      doc: 'The MongoDB url to connect to',
      default: '',
      env: 'MONGODB_URL'
    }
  }
});

conf.loadFile(__dirname + '/config.json');

if (!conf.get('discord.token')) {
  LOGGER.error('Discord Token missing!');
  process.exit(1);
}

if (!conf.get('voiceRSS.key')) {
  LOGGER.error('VoiceRSS API key missing!');
  process.exit(1);
}

if (!conf.get('mongodb.url')) {
  LOGGER.error('MongoDB url not provided!');
  process.exit(1);
}

let url = conf.get('voiceRSS.url')
              .replace('[VOICE_KEY]', conf.get('voiceRSS.key'));
conf.set('voiceRSS.url', url);

conf.validate();

module.exports = conf;
