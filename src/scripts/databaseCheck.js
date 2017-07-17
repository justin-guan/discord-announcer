'use strict';

const MongoClient = require('mongodb').MongoClient;
const LOGGER = require(__dirname + '/../logger.js');
const config = require(__dirname + '/../../config/config.js');


/**
 * _createCollection - Creates the global_config collection in MongoDB
 */
async function _createCollection() {
  try {
    let db = await MongoClient.connect(config.get('mongodb.url'));
    await db.createCollection('global_config');
    db.close();
  } catch (err) {
    LOGGER.error('Failed to create global_config collection!');
    process.exit(1);
  }
}

/**
 * createGlobalConfig - Creates the connections setting file in MongoDB
 */
async function _createGlobalConfig() {
  try {
    let db = await MongoClient.connect(config.get('mongodb.url'));
    let setting = {
      'Setting': 'connections',
    };
    let result = await db.collection('global_config').findOne(setting);
    if (!result) {
      LOGGER.info('Connections setting not found...');
      LOGGER.info('Creating connections setting file...');
      setting.connections = [];
      await db.collection('global_config').insertOne(setting);
      LOGGER.info('Connections setting file created!');
    } else {
      LOGGER.info('Connections setting already exists!');
    }
    db.close();
  } catch (err) {
    LOGGER.error('Failed to create the connections setting file!');
    process.exit(1);
  }
}

/**
 * createConnectionsDocument - Create connections document in MongoDB under the
 * global_config collection
 */
async function createConnectionsDocument() {
  try {
    await _createCollection();
    await _createGlobalConfig();
  } catch (err) {
    LOGGER.error('Failed to create connections document!');
  }
}

createConnectionsDocument();
