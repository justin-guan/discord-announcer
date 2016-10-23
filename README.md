# discord-announcer
This is a node.js bot for discord that announces when a user enters or leaves a voice channel. This bot works using the Voice RSS API to generate announcements. This is still a work in progress!

## Requirements
This bot is powered by <a href=https://github.com/hydrabolt/discord.js/>discord.js</a> to interact with discord. As a result, this bot requires FFMPEG (or avconv) in order to run. During development, this bot was tested using `avconv`, which can be installed as follows:
```bash
sudo apt-get install libav-tools
```
Please see FFMPEG's <a href=https://ffmpeg.org/>site</a> for more details about installing FFMPEG.

Please use Node v6.9.1 or higher. This bot does use the Javascript ES6 standard.

## Setting up Discord
1. First go to <a href=https://discordapp.com/developers/applications/me>Discord's Application Management page</a> to create a new application. Simply select "New Application".
2. Next, select the newly created application and choose to add a bot user to the application. This will create a bot user for the application.
3. A Token associated with the bot should be available now. This token will be necessary when running the bot.

## Setting up Voice RSS
1. Go to the <a href=http://www.voicerss.org/registration.aspx>Voice RSS website</a> and register for a Voice RSS account
2. After registering, an API Key will become available. This key will be necessary when running the bot.

## Running the Bot
1. Ensure that Node v6.9.1 or greater is installed. This can be checked by running `node --version`. See the <a href=https://nodejs.org/>node.js website</a> for more details on installing the latest version of node.
2. Run `npm install` to install all necessary dependencies.
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
* `!unsummon` - Forces the bot to leave the voice channel it is connected to
