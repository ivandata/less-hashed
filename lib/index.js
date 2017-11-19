'use strict';

import glob from "glob";
import fs from 'fs';
import colors from 'colors/safe';
import mkdirp from 'mkdirp';

import {
  getFileHash,
  compareHash,
  getImportsPaths,
  correctRelativePaths,
  invertFilesTree,
  getFilesToCompile
} from './utils';


module.exports = function (pathToFiles, options = {}) {
  const HASH_PATH = options.hashPath !== undefined ? options.hashPath : false;
  const HASH_NAME = options.hashName !== undefined ? options.hashName : 'hashes.json';
  const FORCE_MODE = options.force !== undefined ? options.force : false;

  const MODES = {
    hash: "SAVE HASH mode",
    force: "FORCE COMPILE mode"
  };
  const files = glob.sync(pathToFiles);

  let new_hashes = {};
  let dependencies_tree = {};

  for (let file of files) {
    let import_path = getImportsPaths(file);
    new_hashes[file] = getFileHash(file);
    dependencies_tree[file] = correctRelativePaths(file, import_path);
  }

  let changed_files;
  if (HASH_PATH) {

    const hash_dir = HASH_PATH.endsWith('/') ? HASH_PATH : `${HASH_PATH}/`;

    if (fs.existsSync(hash_dir)) {

      if (fs.existsSync(hash_dir + HASH_NAME)) {

        const old_hashes = JSON.parse(fs.readFileSync(hash_dir + HASH_NAME, 'utf8'));
        changed_files = compareHash(old_hashes, new_hashes);

      } else {
        changed_files = new_hashes;
      }

    } else {

      mkdirp(hash_dir, (err) => {
        if (err) throw new Error(err);
        changed_files = new_hashes;
      });

    }

    fs.writeFileSync(hash_dir + HASH_NAME,
      JSON.stringify(new_hashes, "", 4));

  } else {

    console.log(colors.black.bgYellow(`${MODES.hash} disabled`));
    changed_files = new_hashes;

  }

  const imported_files = invertFilesTree(dependencies_tree);
  const files_to_compile = getFilesToCompile(changed_files, imported_files);

  let result = [];
  for (let file in files_to_compile) {
    if (!files_to_compile.hasOwnProperty(file)) continue;
    result.push(file);
  }

  if (FORCE_MODE) {
    console.log(colors.black.bgYellow(`${MODES.force} enabled`));
    return files;
  } else {
    return result;
  }

};