# discord-announcer
This is a node.js bot for discord that announces when a user enters or leaves a voice channel. This bot works using the Voice RSS API to generate announcements.

## Setting Up Discord.js
This bot is powered by <a href=https://github.com/hydrabolt/discord.js/>discord.js</a> to interact with discord. As a result, this bot requires FFMPEG in order to run.

### Linux Installation
FFMPEG can be installed via FFMPEG or avconv.
```bash
sudo apt-get install ffmpeg
```
or
```bash
sudo apt-get install libav-tools
```

### Windows & OSX
Please see FFMPEG's <a href=https://ffmpeg.org/>site</a> for more details about installing FFMPEG.

## Requirements
Please use Node v6.X or higher. This bot does use the Javascript ES6 standard. See <a href=https://nodejs.org/en/> the Nodejs website </a> for more details.

## Setting up Discord
1. First go to <a href=https://discordapp.com/developers/applications/me>Discord's Application Management page</a> to create a new application. Simply select "New Application".
2. Next, select the newly created application and choose to add a bot user to the application. This will create a bot user for the application.
3. A Token associated with the bot should be available now. This token will be necessary when running the bot.

## Setting up Voice RSS
1. Go to the <a href=http://www.voicerss.org/registration.aspx>Voice RSS website</a> and register for a Voice RSS account
2. After registering, an API Key will become available. This key will be necessary when running the bot.

## Running the Bot
1. Ensure that Node v6.X is installed. This can be checked by running `node --version`. See the <a href=https://nodejs.org/>node.js website</a> for more details on installing the latest version of node.
2. Run `npm install` to install all necessary dependencies. Some peer dependencies may be missing, these are not necessary to run the bot and can be ignored.
3. Export the Discord Bot Token and the Voice RSS API Key. This can be done as follows:
``` sh
export API_KEY=<VOICE_RSS_API_KEY>
export DISCORD_TOKEN=<DISCORD_TOKEN>
```
Or in Windows:
``` sh
set API_KEY=<VOICE_RSS_API_KEY>
set DISCORD_TOKEN=<DISCORD_TOKEN>
```
4. Type `npm start` to start the bot now

## Commands
* `!summon` - Summons the bot into the caller's voice channel
* `!banish` - Forces the bot to leave the voice channel it is connected to

## Notes
There is no support for moving the bot to another voice channel without using the banish and summoning commands. You **must** banish the bot before resummoning it. Moving the bot via drag and drop in the discord interface will cause the bot to become unresponsive.
