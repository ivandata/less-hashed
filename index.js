'use strict';

import hashFiles from 'hash-files';
import glob from "glob";
import fs from 'fs';
import colors from 'colors/safe';
import mkdirp from 'mkdirp';
import { compare, paths, imports, files } from './lib/utils';

export default function (less_files_path, hash_file_path, options = {}) {

    const FORCE_COMPILE_ALL =  options.force_compile_all !== undefined ?  options.force_compile_all: false;
    const DEBUG_MODE = options.debug_mode !== undefined ? options.debug_mode: false;
    const SAVE_SOURCES_HASHES_FILE = options.save_sources_hashes_file !== undefined ? options.save_sources_hashes_file: true;

    const MODES = {
        hash: "SAVE HASHES mode",
        force: "FORCE COMPILE mode",
        debug: "DEBUG mode"
    };

    let sendEnableModeMessage = (mode) => {
        return console.log(
            colors.black.bgYellow(`${mode} enabled`)
        );
    };

    let sendDisabledModeMessage = (mode) => {
        return console.log(
            colors.black.bgYellow(`${mode} disabled`)
        );
    };

    let less_files = glob.sync(less_files_path);

    let less_files_new_hashes = {};
    let less_files_dependencies_tree = {};
    for (let file of less_files) {
        less_files_new_hashes[file] = hashFiles.sync({ files: file });
        less_files_dependencies_tree[file] = paths(file);
    }

    if (FORCE_COMPILE_ALL && !DEBUG_MODE) {
        sendEnableModeMessage(MODES.force);
        writeHashAndDebugFiles();
        return less_files;
    }

    let changed_less_files;
    if (SAVE_SOURCES_HASHES_FILE) {
        if (fs.existsSync(hash_file_path)) {
            let less_files_old_hashes = JSON.parse(fs.readFileSync(hash_file_path, 'utf8'));
            changed_less_files = compare(less_files_old_hashes, less_files_new_hashes);
        }
    } else {
        changed_less_files = less_files_new_hashes;
    }
    
    let less_files_imported_in_tree = imports(less_files_dependencies_tree);
    let less_files_to_compile = files(changed_less_files, less_files_imported_in_tree);

    let result = [];
    for (let file_to_compile in less_files_to_compile) {
        if (!less_files_to_compile.hasOwnProperty(file_to_compile)) continue;
        result.push(file_to_compile);
    }

    if (SAVE_SOURCES_HASHES_FILE) {
        let hash_file_dir = hash_file_path.substring(0, hash_file_path.lastIndexOf("/")) + '/';
        if (fs.existsSync(hash_file_dir)) {
            writeHashAndDebugFiles();
        } else {
            mkdirp(hash_file_dir, (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
                writeHashAndDebugFiles();
            });
        }
    }

    /**
     * Saves to disk the file hashes and logs: dependencies, changed files, compile and result in debug mode
     */
    function writeHashAndDebugFiles() {
        if (DEBUG_MODE) {
            fs.writeFileSync(hash_file_dir + '_less_files_dependencies_tree.json',
                JSON.stringify(less_files_dependencies_tree, "", 4));
            fs.writeFileSync(hash_file_dir + '_less_files_imported_in_tree.json',
                JSON.stringify(less_files_imported_in_tree, "", 4));
            fs.writeFileSync(hash_file_dir + '_changed_less_files.json',
                JSON.stringify(changed_less_files, "", 4));
            fs.writeFileSync(hash_file_dir + '_less_files_to_compile.json',
                JSON.stringify(less_files_to_compile, "", 4));
            fs.writeFileSync(hash_file_dir + '_result.json',
                JSON.stringify(result, "", 4));

            sendEnableModeMessage(MODES.debug);
        }
        if (SAVE_SOURCES_HASHES_FILE) {
            fs.writeFileSync(hash_file_path,
                JSON.stringify(less_files_new_hashes, "", 4));
        } else {
            sendDisabledModeMessage(MODES.hash);
        }
    }

    if (FORCE_COMPILE_ALL) {
        sendEnableModeMessage(MODES.force);
        return less_files;
    } else {
        return result;
    }

};