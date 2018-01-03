const utils = require(__dirname + '/../helpers/util.js');
const currency = require(__dirname + '/../../libs/currency.js');
const LOGGER = require(__dirname + '/../../libs/logger.js');

module.exports = {
  name: 'currency',
  description: 'Check the amount of guild currency you own',
  async execute(message) {
    try {
      message.reply(`You have ${await currency.get(message.member)} ` +
        `${await currency.getCurrencyType(message.member.guild)}`);
    } catch (err) {
      message.reply('Something went wrong. Try again later');
      LOGGER.error(`${utils.getName(message.member)} (${message.member.id}) ` +
        `currency check failed\n${err}`);
    }
  },
};
