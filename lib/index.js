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

module.exports = async (less_files_path, options = {}) => {

  options.modes = {};

  const HASH_PATH = options.hashPath !== undefined ? options.hashPath : false;
  const HASH_NAME = options.hashName !== undefined ? options.hashName : 'hashes.json';

  const FORCE_MODE = options.modes.force !== undefined ? options.modes.force : false;
  const DEBUG_MODE = options.modes.debug !== undefined ? options.modes.debug : false;
  // const SAVE_HASH = options.modes.hash !== undefined ? options.modes.hash : true;

  // switch modes

  const MODES = {
    hash: "SAVE HASH mode",
    force: "FORCE COMPILE mode",
    debug: "DEBUG mode"
  };

  let sendEnableModeMessage = mode => console.log(colors.black.bgYellow(`${mode} enabled`));
  let sendDisabledModeMessage = mode => console.log(colors.black.bgYellow(`${mode} disabled`));

  // function isHashPath(HASH_PATH) {
  //   if (!HASH_PATH) {
  //     throw new Error('No hash path')
  //   } else {
  //     return true;
  //   }
  // }
  // if hash_file_path is false
  // if hash_file_path is dir

  let files = await glob.sync(less_files_path);

  let new_hashes = {};
  let dependencies_tree = {};

  for (let file of files) {
    let import_path = await getImportsPaths(file);
    new_hashes[file] = await hashFiles.sync({files: file});
    dependencies_tree[file] = await correctRelativePaths(file, import_path);
  }
  
  let changed_files;
  let hash_dir;
  if (HASH_PATH) {
    hash_dir = HASH_PATH.endsWith('/') ? HASH_PATH : `${HASH_PATH}/`;

    if (fs.existsSync(hash_dir)) {
      if (fs.existsSync(hash_dir + HASH_NAME)) {
        let old_hashes = await JSON.parse(fs.readFileSync(hash_dir + HASH_NAME, 'utf8'));
        changed_files = await compareHash(old_hashes, new_hashes);
      } else {
        changed_files = await new_hashes;
      }
    } else {
      mkdirp(hash_dir, async (err) => {
        if (err) throw new Error(err);
        changed_files = await new_hashes;
      });
    }

    fs.writeFileSync(hash_dir + HASH_NAME,
      JSON.stringify(changed_files, "", 4));

  } else {
    // sendDisabledModeMessage(MODES.hash);
    changed_files = await new_hashes;
  }

  let imported_files = await invertFilesTree(dependencies_tree);
  let files_to_compile = await getFilesToCompile(changed_files, imported_files);

  let result = [];
  for (let file in files_to_compile) {
    if (!files_to_compile.hasOwnProperty(file)) continue;
    result.push(file);
  }

  /**
   * Saves to disk the file hashes and logs: dependencies, changed files, compile and result in debug mode
   */
  // function writeHashAndDebugFiles() {
  //   if (DEBUG_MODE) {
  //     fs.writeFileSync(hash_file_dir + '_dependencies_tree.json',
  //       JSON.stringify(dependencies_tree, "", 4));
  //     fs.writeFileSync(hash_file_dir + '_imported_files.json',
  //       JSON.stringify(imported_files, "", 4));
  //     fs.writeFileSync(hash_file_dir + '_changed_files.json',
  //       JSON.stringify(changed_files, "", 4));
  //     fs.writeFileSync(hash_file_dir + '_files_to_compile.json',
  //       JSON.stringify(files_to_compile, "", 4));
  //     fs.writeFileSync(hash_file_dir + '_result.json',
  //       JSON.stringify(result, "", 4));
  //
  //     sendEnableModeMessage(MODES.debug);
  //   } else {
  //     sendDisabledModeMessage(MODES.hash);
  //   }
  // }

  if (FORCE_MODE) {
    sendEnableModeMessage(MODES.force);
    return files;
  } else {
    return await result;
  }

};