'use strict';

const fs = require('fs');
const path = require('path');
const rgx = require("./helpers").rgx;

module.exports = {
    compare: compareHash,
    paths: getFileImportsFullPaths,
    imports: getFilesImportedInByFilesImports,
    files: getFilesWithDependencies
};

/**
 * Compare two hashes and return Object with difference
 * @param {Object} old_hashes — { "file name": "old hash", ... }
 * @param {Object} new_hashes — { "file name": "new hash", ... }
 * @returns {Object}
 */

function compareHash(old_hashes, new_hashes) {
    let diff = {};

    Object.keys(new_hashes).forEach(function (file_name) {
        if (old_hashes[file_name] !== new_hashes[file_name]) {
            diff[file_name] = new_hashes[file_name];
        }
    }, {});

    return diff;
}

/**
 * Corrects a relative file path in rule of @imports in absolute
 * @param {String} file — file path
 * @returns {Array}
 */
function getFileImportsFullPaths(file) {
    let less_data = fs.readFileSync(file, 'utf8');
    let import_array = rgx(less_data);
    let file_path = file.substring(0, file.lastIndexOf("/")) + '/';

    import_array.forEach(function (import_string, index) {
        if (path.isAbsolute(import_string)) return;
        import_array[index] = './' + path.join(file_path, import_string);
    });
    return import_array;
}

/**
 * Inverts the file tree with @imports in them
 * @param {Object} files_imports_obj — { "file name": {"dependencies"}, ... }
 * @returns {Object}
 */
function getFilesImportedInByFilesImports(files_imports_obj) {
    let files_imported_in_obj = {};

    for (let key in files_imports_obj) {
        if (!files_imports_obj.hasOwnProperty(key)) continue;
        if (!files_imported_in_obj[key]) {
            files_imported_in_obj[key] = {};
        }
        for (let item of files_imports_obj[key]) {
            if (!files_imported_in_obj[item]) {
                files_imported_in_obj[item] = {};
            }
            files_imported_in_obj[item][key] = 1;
        }
    }

    return files_imported_in_obj;
}

/**
 * Builds a tree of compiled files of the dependencies
 * @param {Object} files — changed_files {"file"}
 * @param {Object} file_imported_in_tree — dependency tree { "dependence": {"file names"}, ... }
 * @returns {Object}
 */
function getFilesWithDependencies(files, file_imported_in_tree) {
    let compiled_files = {};

    for (let changed_file in files) {
        if (!files.hasOwnProperty(changed_file)) continue;

        compiled_files[changed_file] = 1;

        if (Object.keys(file_imported_in_tree[changed_file]).length > 0) {
            let dependencies_files = getFilesWithDependencies(file_imported_in_tree[changed_file], file_imported_in_tree);
            for (let dependence_file in dependencies_files) {
                if (!dependencies_files.hasOwnProperty(dependence_file)) continue;

                compiled_files[dependence_file] = 1;
            }
        }
    }

    return compiled_files;
}