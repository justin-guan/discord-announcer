'use strict';

const Promise = require('bluebird');
const fs = require('fs-extra');
const Dropbox = require('dropbox');
const config = require(__dirname + '/../config/config.js');
const dbx = new Dropbox({accessToken: config.get('storage.dropbox.token')});
const LOGGER = require(__dirname + '/logger.js');

/**
 * uploadToDropbox - Uploads a file to dropbox
 *
 * @param  {String} path The path to the file that will be uploaded
 * @return {Promise}      Resolve on successful upload, reject otherwise
 */
async function uploadToDropbox(path) {
  let contents;
  try {
    contents = await fs.readFile(path, 'utf8');
  } catch (err) {
    LOGGER.error(`Failed to read file at ${path}\n${err}`);
    return Promise.reject(err);
  }
  try {
    await dbx.filesUpload({
      path: config.get('storage.dropbox.saveLocation'),
      contents: contents
    });
  } catch (err) {
    LOGGER.error(`Failed to save file to dropbox\n${err}`);
    return Promise.reject(err);
  }
  return Promise.resolve();
}

/**
 * deleteFromDropbox - Deletes a file from dropbox
 *
 * @return {Promise}  Resolve on successful delete, reject otherwise
 */
async function deleteFromDropbox() {
  try {
    await dbx.filesDelete({
      path: config.get('storage.dropbox.backupLocation')
    });
    return Promise.resolve(true);
  } catch (err) {
    if (err.error.error_summary.startsWith('path_lookup/not_found/')) {
      return Promise.resolve(false);
    }
    LOGGER.error(
      'Failed to delete previous version of connections.json from dropbox');
    return Promise.reject(err);
  }
}

/**
 * createBackup - Creates a backup of connections.json in dropbox
 *
 * @return {Promise}  Resolve on successful creation, reject otherwise
 */
async function createBackup() {
  try {
    await dbx.filesMove({
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

/**
 * saveToDropbox - Save a file to dropbox, and convert the old copy to backup
 *
 * @param  {String} path Path to the file that will be uploaded
 */
function saveToDropbox(path) {
  deleteFromDropbox()
  .then((found) => {
    if (found) {
      createBackup();
    }
  })
  .then(() => {
    return uploadToDropbox(path);
  })
  .catch((err) => {
    LOGGER.error(err);
    return Promise.reject(err);
  });
}

/**
 * importFromDropbox - Downloads the connections.json file from Dropbox
 *
 * @return {Promise}  Resolve on successful download, reject otherwise
 */
function importFromDropbox() {
  return dbx.filesDownload({
      path: config.get('storage.dropbox.saveLocation')
    })
    .then((data) => {
      fs.writeFileSync(`${__dirname}/${data.name}`, data.fileBinary, 'binary');
    })
    .catch((err) => {
      LOGGER.error(err);
    });
}


exports.saveToDropbox = saveToDropbox;
exports.importFromDropbox = importFromDropbox;
