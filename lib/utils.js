'use strict';

import fs from 'fs';
import path from 'path';

/**
 * Compare two hashes and return Object with difference
 * @param {Object} old_hashes — { "file name": "old hash", ... }
 * @param {Object} new_hashes — { "file name": "new hash", ... }
 * @returns {Object}
 */
function compareHash(old_hashes, new_hashes) {
    let diff = {};

    Object.keys(new_hashes).forEach(file_name => {
        if (old_hashes[file_name] !== new_hashes[file_name]) {
            diff[file_name] = new_hashes[file_name];
        }
    }, {});

    return diff;
}

/**
 * Get paths from @imports directive and return Array with paths
 * @param {String} file — file path
 * @returns {Array}
 */

function getImportsPaths(file) {
    let less_data = fs.readFileSync(file, 'utf8');
    let import_arr = [];
    let filtered_string;
    let import_regex = /@import(\s+?|\s*?\([^)]+\)\s*?)['"]([^'"]+)['"]/ig;

    less_data.toString();

    while ((filtered_string = import_regex.exec(less_data)) !== null) {
        if (filtered_string[2].search(/^((?:\.\.|)[^'".]+)$/) !== -1) {
            import_arr.push(filtered_string[2] + '.less');
        } else {
            import_arr.push(filtered_string[2]);
        }
    }

    return import_arr;
}

/**
 * Corrects a relative file path in rule of @imports in absolute
 * @param {String} file — file path
 * @param {Array} imports - imports paths
 * @returns {Array}
 */
function correctRelativePaths(file, imports) {
    let file_path = file.substring(0, file.lastIndexOf("/")) + '/';

    imports.forEach((import_string, index) => {
        if (path.isAbsolute(import_string)) return;
        imports[index] = './' + path.join(file_path, import_string);
    });
    return imports;
}

/**
 * Inverts the file tree with @imports in them
 * @param {Object} files_imports — { "file name": ["dependencies"], ... }
 * @returns {Object}
 */
function invertFilesTree(files_imports) {
    let imported_files = {};

    for (let key in files_imports) {
        if (!files_imports.hasOwnProperty(key)) continue;
        if (!imported_files[key]) {
            imported_files[key] = {};
        }
        for (let item of files_imports[key]) {
            if (!imported_files[item]) {
                imported_files[item] = {};
            }
            imported_files[item][key] = 1;
        }
    }

    return imported_files;
}

/**
 * Builds a tree of compiled files of the dependencies
 * @param {Object} files — changed_files {"file"}
 * @param {Object} imported_file — dependency tree { "dependence": {"file names"}, ... }
 * @returns {Object}
 */
function getFilesToCompile(files, imported_file) {
    let compiled_files = {};

    for (let changed_file in files) {
        if (!files.hasOwnProperty(changed_file)) continue;

        compiled_files[changed_file] = 1;

        if (Object.keys(imported_file[changed_file]).length > 0) {
            let dependencies = getFilesToCompile(imported_file[changed_file], imported_file);
            for (let dependence_file in dependencies) {
                if (!dependencies.hasOwnProperty(dependence_file)) continue;

                compiled_files[dependence_file] = 1;
            }
        }
    }

    return compiled_files;
}

export {
    compareHash,
    getImportsPaths,
    correctRelativePaths,
    invertFilesTree,
    getFilesToCompile
}