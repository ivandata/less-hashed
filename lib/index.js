'use strict';

import hashFiles from 'hash-files';
import glob from "glob";
import fs from 'fs';
import colors from 'colors/safe';
import mkdirp from 'mkdirp';
import {
  compareHash,
  getImportsPaths,
  correctRelativePaths,
  invertFilesTree,
  getFilesToCompile
} from './utils';

module.exports = async function (less_files_path, hash_file_path, modes = {}) {

  const FORCE_MODE = modes.force_mode !== undefined ? modes.force_mode : false;
  const DEBUG_MODE = modes.debug_mode !== undefined ? modes.debug_mode : false;
  const SAVE_HASH_FILE = modes.save_hash_file !== undefined ? modes.save_hash_file : true;
  const HASH_DIR = hash_file_path.substring(0, hash_file_path.lastIndexOf("/")) + '/';

  // if hash_file_path is false
  // if hash_file_path is dir

  const MODES = {
    hash: "SAVE HASHES mode",
    force: "FORCE COMPILE mode",
    debug: "DEBUG mode"
  };

  let sendEnableModeMessage = mode => console.log(colors.black.bgYellow(`${mode} enabled`));
  let sendDisabledModeMessage = mode => console.log(colors.black.bgYellow(`${mode} disabled`));

  let files = await glob.sync(less_files_path);

  let new_hashes = {};
  let dependencies_tree = {};

  for (let file of files) {
    let import_path = await getImportsPaths(file);
    new_hashes[file] = await hashFiles.sync({files: file});
    dependencies_tree[file] = await correctRelativePaths(file, import_path);
  }

  // let hash_file_dir = await hash_file_path.substring(0, hash_file_path.lastIndexOf("/")) + '/';

  let changed_files;
  if (SAVE_HASH_FILE) {
    if (fs.existsSync(hash_file_path)) {
      let old_hashes = await JSON.parse(fs.readFileSync(hash_file_path, 'utf8'));
      changed_files = await compareHash(old_hashes, new_hashes);
    } else {

      changed_files = new_hashes;
      mkdirp(HASH_DIR, (err) => {
        if (err) {
          console.error(err);
          throw new Error(err);
        }
      });

    }

    fs.writeFileSync(hash_file_path,
      JSON.stringify(new_hashes, "", 4));

  } else {
    changed_files = new_hashes;
  }

  let imported_files = invertFilesTree(dependencies_tree);
  let files_to_compile = getFilesToCompile(changed_files, imported_files);

  let result = [];
  for (let file in files_to_compile) {
    if (!files_to_compile.hasOwnProperty(file)) continue;
    result.push(file);
  }

  /**
   * Saves to disk the file hashes and logs: dependencies, changed files, compile and result in debug mode
   */
  function writeHashAndDebugFiles() {
    if (DEBUG_MODE) {
      fs.writeFileSync(hash_file_dir + '_dependencies_tree.json',
        JSON.stringify(dependencies_tree, "", 4));
      fs.writeFileSync(hash_file_dir + '_imported_files.json',
        JSON.stringify(imported_files, "", 4));
      fs.writeFileSync(hash_file_dir + '_changed_files.json',
        JSON.stringify(changed_files, "", 4));
      fs.writeFileSync(hash_file_dir + '_files_to_compile.json',
        JSON.stringify(files_to_compile, "", 4));
      fs.writeFileSync(hash_file_dir + '_result.json',
        JSON.stringify(result, "", 4));

      sendEnableModeMessage(MODES.debug);
    } else {
      sendDisabledModeMessage(MODES.hash);
    }
  }

  if (FORCE_MODE) {
    sendEnableModeMessage(MODES.force);
    return files;
  } else {
    return await result;
  }

};