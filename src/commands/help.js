const config = require(__dirname + '/../../config/config.js');
const trigger = config.get('command.trigger');

module.exports = {
  name: 'help',
  description: 'Command for help/commands',
  execute(message) {
    const commands = [];
    commands.push('***Basic Commands***');
    commands.push('```');
    message.client.commands.map((command) => {
      commands.push(`${trigger}${command.name}\n${command.description}\n`);
    });
    commands.push('```');
    message.author.send(commands, {split: true});
  },
};
