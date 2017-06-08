'use strict';

const Promise = require('bluebird');
const fs = require('fs-extra');
const Dropbox = require('dropbox');
const config = require(__dirname + '/../config/config.js');
const dbx = new Dropbox({accessToken: config.get('storage.dropbox.token')});
const LOGGER = require(__dirname + '/logger.js');

async function uploadToDropbox(path) {
  let contents, resp;
  try {
    contents = await fs.readFile(__dirname + '/connections.json', 'utf8');
  } catch (err) {
    LOGGER.error(`Failed to read file at ${path}\n${err}`);
    return Promise.reject(err);
  }
  try {
    resp = await dbx.filesUpload({
      path: config.get('storage.dropbox.saveLocation'),
      contents: contents
    });
  } catch (err) {
    LOGGER.error(`Failed to save file to dropbox\n${err}`);
    return Promise.reject(err);
  }
  return Promise.resolve();
}

async function deleteFromDropbox() {
  let resp;
  try {
    resp = await dbx.filesDelete({
      path: config.get('storage.dropbox.backupLocation')
    });
    return Promise.resolve(true);
  } catch (err) {
    if (err.error.error_summary.startsWith('path_lookup/not_found/')) {
      return Promise.resolve(false);
    }
    LOGGER.error(`Failed to delete previous version of connections.json from dropbox`);
    return Promise.reject(err);
  }
}

async function createBackup() {
  let resp;
  try {
    resp = await dbx.filesMove({
      from_path: config.get('storage.dropbox.saveLocation'),
      to_path: config.get('storage.dropbox.backupLocation'),
      allow_shared_folder: true,
      autorename: true
    });
    return Promise.resolve();
  } catch (err) {
    LOGGER.error(err);
    return Promise.reject(err);
  }
}

function saveToDropbox(path) {
  deleteFromDropbox()
  .then(found => {
    if (found) {
      createBackup();
    }
  })
  .then(() => {
    return uploadToDropbox(path);
  })
  .catch(err => {
    LOGGER.error(err);
    return Promise.reject(err);
  });
}

function importFromDropbox() {
  return dbx.filesDownload({
      path: config.get('storage.dropbox.saveLocation')
    })
    .then(data => {
      fs.writeFileSync(`${__dirname}/${data.name}`, data.fileBinary, 'binary');
    })
    .catch(err => {
      LOGGER.error(err);
    });
}


exports.saveToDropbox = saveToDropbox;
exports.importFromDropbox = importFromDropbox;
