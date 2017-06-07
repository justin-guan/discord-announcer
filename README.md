# discord-announcer
This is a node.js bot for discord that announces when a user enters or leaves a voice channel. This bot works using the Voice RSS API to generate announcements. As of v2.0.0, this bot has multi server support.

* [Requirements](#requirements)
 * [Setting up Discord](#discord)
 * [Setting up VoiceRSS](#voiceRSS)
* [Running the Bot](#running)
* [Commands](#commands)

<a name="requirements"></a>
## Requirements
Please use Node v8.0.0 or higher. This bot uses features that are only available in Node v8.0.0 and up. See <a href=https://nodejs.org/en/> the Nodejs website </a> for more details on Node.js installation.

In order to host this bot, you must also set up a [discord bot](#discord). Additionally, a [VoiceRSS](#voiceRSS) API key is required in order to do voice announcements.

<a name="discord"></a>
### Setting up Discord
1. First go to <a href=https://discordapp.com/developers/applications/me>Discord's Application Management page</a> to create a new application. Simply select "New Application".
2. Next, select the newly created application and choose to add a bot user to the application. This will create a bot user for the application.
3. A token associated with the bot should be available now. This token will be necessary when running the bot.

<a name="voiceRSS"></a>
### Setting up Voice RSS
1. Go to the <a href=http://www.voicerss.org/registration.aspx>Voice RSS website</a> and register for a Voice RSS account
2. After registering, an API Key will become available. This key will be necessary when running the bot.

<a name="running"></a>
## Running the Bot
1. Ensure that Node v8.0.0 or higher is installed. This can be checked by running `node -v`. See the <a href=https://nodejs.org/>node.js website</a> for more details on installing the latest version of node.
2. Run `npm install` to install all necessary dependencies. Some peer dependencies may be missing, these are not necessary to run the bot and can be ignored.
3. Export the Discord Bot Token and the Voice RSS API Key. This can be done as follows:
``` sh
export VOICE_KEY=<VOICE_RSS_API_KEY>
export DISCORD_TOKEN=<DISCORD_TOKEN>
```
Or in Windows:
``` sh
set VOICE_KEY=<VOICE_RSS_API_KEY>
set DISCORD_TOKEN=<DISCORD_TOKEN>
```
4. Type `npm start` to start the bot now

<a name="commands"></a>
## Commands
* `!summon` - Summons the bot into the caller's voice channel
* `!banish` - Forces the bot to leave the voice channel it is connected to
