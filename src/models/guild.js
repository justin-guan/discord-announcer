const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const guildSchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  currency: {
    type: {
      type: String,
      required: true,
      default: 'gold'
    }
  },
  users: [{
    _id: String,
    currencyAmount: Number
  }],
  commands: [{
    name: String,
    description: String,
    type: {type: Number},
    action: String
  }]
});

guildSchema.methods.addUserCurrency = function(memberId, amount) {
  for (user of this.users) {
    if (user._id === memberId.toString()) {
      user.currencyAmount += amount;
      return;
    }
  }
  this.users.push({
    _id: memberId,
    currencyAmount: amount
  });
};

guildSchema.methods.getUserCurrency = function(memberId) {
  for (user of this.users) {
    if (user._id === memberId.toString()) {
      return user.currencyAmount;
    }
  }
  return 0;
};

guildSchema.methods.addNewCommand = function(newCommand) {
  for (command of this.commands) {
    if (command.name === newCommand.name) {
      throw new Error(`Tried adding already existing command: ${newCommand}`);
    }
  }
  this.commands.push(newCommand);
};

module.exports = mongoose.model('Guild', guildSchema);
