'use strict';

import { expect, assert } from 'chai';
import lessHashed from '../lib/index';

describe("Index", function () {

    let less_files_path = './test/imports-cases/extensions/**/*.less';
    let hash_file_path = './test/';
    let options = {
        save_sources_hashes_file: false
    };

    it("Return files to compile", function (done) {
        expect(lessHashed(less_files_path, hash_file_path, options))
            .to.eql([
                './test/imports-cases/extensions/css-imports/file.less',
                './test/imports-cases/extensions/empty-imports/file.less',
                './test/imports-cases/extensions/empty-imports/imports/import-file.less',
                './test/imports-cases/extensions/less-imports/file.less',
                './test/imports-cases/extensions/less-imports/imports/import-file.less',
                './test/imports-cases/extensions/php-imports/file.less',
                './test/imports-cases/extensions/set-imports/file.less',
                './test/imports-cases/extensions/set-imports/imports/second-import-file.less',
                './test/imports-cases/extensions/set-imports/imports/third-import-file.less'
            ])
            .lengthOf(9);
        done();
    });

    it("Return Array", function (done) {
        assert.isArray(lessHashed(less_files_path, hash_file_path, options), 'Index must return Array');
        done();
    });

});