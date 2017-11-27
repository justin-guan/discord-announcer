const config = require(__dirname + '/../../config/config.js');
const trigger = config.get('command.trigger');

module.exports = {
  name: 'help',
  description: 'Command for help/commands',
  execute(message) {
    const commands = [];
    // TODO: Formatting
    commands.push('***Basic Commands***');
    commands.push('```');
    message.client.commands.map((command) => {
      commands.push(`${trigger}${command.name}\n${command.description}\n`);
    });
    commands.push('```');
    message.reply(commands, {split: true});
  },
};
