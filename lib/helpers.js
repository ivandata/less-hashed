'use strict';

/**
 * Get paths from @imports directive and return Array with paths
 * @param {String} file_content — file content
 * @returns {Array}
 */

function parseImportedFilesFromFileContent(file_content) {
    file_content.toString();

    let import_string_arr = [];
    let filtered_string;
    let import_regex = /@import(\s+?|\s*?\([^)]+\)\s*?)['"]([^'"]+)['"]/ig;

    while ((filtered_string = import_regex.exec(file_content)) != null) {
        if (filtered_string[2].search(/^((?:\.\.|)[^'".]+)$/) != -1) {
            import_string_arr.push(filtered_string[2] + '.less');
        } else {
            import_string_arr.push(filtered_string[2]);
        }
    }

    return import_string_arr;
}

export { parseImportedFilesFromFileContent as rgx };