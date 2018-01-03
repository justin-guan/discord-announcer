const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const globalConfigSchema = new Schema({
  setting: {
    type: String,
    default: 'connections',
    required: true
  },
  connections: [String]
});

globalConfigSchema.methods.addConnection = function(connection) {
  if (this.connections.indexOf(connection) === -1) {
    this.connections.push(connection);
  }
};

globalConfigSchema.methods.removeConnection = function(connection) {
  this.connections = this.connections.filter((saved) => saved !== connection);
};

globalConfigSchema.methods.updateConnections = function(connections) {
  this.connections = connections;
};

module.exports = mongoose.model('Global Config', globalConfigSchema);
