const config = require(__dirname + '/../../../config/config.js');
const trigger = config.get('command.trigger');

module.exports = {
  name: 'help',
  description: 'Command for help/commands',
  execute(message) {
    const commands = [];
    commands.push('\n***__Basic Commands__***');
    message.client.commands.map((command) => {
      if (!command.admin) {
        commands.push(`**${trigger}${command.name}** - ${command.description}`);
      }
    });
    commands.push('\n***__Custom Commands__***');
    message.client.customCommands.get(message.guild.id).map((command) => {
      commands.push(`**${trigger}${command.name}** - ${command.description}`);
    });
    message.channel.send(commands, {split: true});
  },
};
