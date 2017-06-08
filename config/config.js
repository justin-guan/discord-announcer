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
  },
  storage: {
    type: {
      doc: "The storage type. Either local or dropbox",
      default: "local",
      env: "STORAGE_TYPE"
    },
    dropbox: {
      token: {
        doc: "The dropbox access token. Required if storage type is dropbox",
        default: "",
        env: "DROPBOX_TOKEN"
      },
      saveLocation: {
        doc: "The path to save connections.json",
        default: "/connections.json",
        env: "DROPBOX_SAVE_LOCATION"
      },
      backupLocation: {
        doc: "The path to save connections.bak",
        default: "/connections.bak",
        env: "DROPBOX_BAK_LOCATION"
      }
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

if (conf.get('storage.type') !== 'dropbox' || conf.get('storage.type') !== 'local') {
  conf.set('storage.type', 'local');
}

if (conf.get('storage.type') === 'dropbox' && !conf.get('storage.dropbox.token')) {
  LOGGER.error('Storage type dropbox selected, but no dropbox token provided');
  process.exit(1);
}

let url = conf.get('voiceRSS.url').replace('[VOICE_KEY]', conf.get('voiceRSS.key'))
conf.set('voiceRSS.url', url);

conf.validate();

module.exports = conf;
