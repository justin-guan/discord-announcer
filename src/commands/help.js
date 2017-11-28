const config = require(__dirname + '/../../config/config.js');
const trigger = config.get('command.trigger');

module.exports = {
  name: 'help',
  description: 'Command for help/commands',
  execute(message) {
    const commands = [];
    commands.push('\n***Basic Commands***\n');
    message.client.commands.map((command) => {
      commands.push(`**${trigger}${command.name}** - ${command.description}`);
    });
    message.channel.send(commands, {split: true});
  },
};
