module.exports = {
  name: 'ping',
  description: 'Ping!',
  execute(client, message) {
    message.reply('pong');
  },
};
