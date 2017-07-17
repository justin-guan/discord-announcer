const voicesynth = require(__dirname + '/voicesynth.js');
const LOGGER = require(__dirname + '/logger.js');

/**
 * sayJoin - Causes the bot to announce a member has joined the voice channel
 *
 * @param  {Member} member Discord.js Member object
 */
async function sayJoin(member) {
  const name = member.nickname ? member.nickname : member.user.username;
  const connection = member.voiceChannel.connection;
  try {
    const path = await voicesynth.synth(
      `${name} joined the channel`,
      __dirname + `/../../voice/join/${name}.mp3`);
    connection.playFile(path);
  } catch (err) {
    LOGGER.error(`Failed to synthesize join voice file for ${name}`);
  }
}

/**
 * sayLeave - Causes the bot to announce a member has left the voice channel
 *
 * @param  {Member} member Discord.js Member object
 */
async function sayLeave(member) {
  const name = member.nickname ? member.nickname : member.user.username;
  const connection = member.voiceChannel.connection;
  try {
      const path = await voicesynth.synth(
      `${name} left the channel`,
      __dirname + `/../../voice/leave/${name}.mp3`);
    connection.playFile(path);
  } catch (err) {
    LOGGER.error(`Failed to synthesize leave voice file for ${name}`);
  }
}

exports.sayJoin = sayJoin;
exports.sayLeave = sayLeave;
