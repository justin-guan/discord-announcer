'use strict';

const convict = require('convict');
const LOGGER = require(__dirname + '/../src/logger.js');

const conf = convict({
  env: {
    doc: "The applicaton environment.",
    format: ["production", "development", "test"],
    default: "development",
    env: "NODE_ENV"
  },
  voiceRSS: {
    key: {
      doc: "The VoiceRSS API key",
      default: "",
      env: "VOICE_KEY"
    },
    url: {
      doc: "The VoiceRSS API url",
      default: "" // Provided by config.json
    }
  },
  discord: {
    token: {
      doc: "The Discord Bot Token",
      default: "",
      env: "DISCORD_TOKEN"
    }
  },
  command: {
    trigger: {
      doc: "The trigger prefix for a command",
      default: "!",
      env: "TRIGGER_PREFIX"
    }
  }
});

conf.loadFile(__dirname + '/config.json');

if (!conf.get('voiceRSS.key') || !conf.get('discord.token')) {
  LOGGER.error('An API key is missing!');
  process.exit(1);
}

let url = conf.get('voiceRSS.url').replace('[VOICE_KEY]', conf.get('voiceRSS.key'))
conf.set('voiceRSS.url', url);

conf.validate();

module.exports = conf;
