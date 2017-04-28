'use strict';

import { expect, assert } from 'chai';
import fs from 'fs';
import { rgx } from '../lib/helpers';

let getFileContent = (file) => { return fs.readFileSync(file, 'utf8'); };

describe("Get paths from @imports directive", function() {

    let css_extension = getFileContent('./test/imports-cases/extensions/css-imports/file.less');
    it("Return full paths from .css extension", function (done) {
        expect(rgx(css_extension)).to.eql(['imports/import-file.css']);
        done();
    });

    let empty_extension = getFileContent('./test/imports-cases/extensions/empty-imports/file.less');
    it("Return full paths from NO extension", function (done) {
        expect(rgx(empty_extension)).to.eql(['imports/import-file.less']);
        done();
    });

    let less_extension = getFileContent('./test/imports-cases/extensions/less-imports/file.less');
    it("Return full paths from .less extension", function (done) {
        expect(rgx(less_extension)).to.eql(['imports/import-file.less']);
        done();
    });

    let php_extension = getFileContent('./test/imports-cases/extensions/php-imports/file.less');
    it("Return full paths from .php extension", function (done) {
        expect(rgx(php_extension)).to.eql(['imports/import-file.php']);
        done();
    });

    let set_extensions = getFileContent('./test/imports-cases/extensions/set-imports/file.less');
    it("Return full paths from set of extensions", function (done) {
        expect(rgx(set_extensions))
            .have.members([
                'imports/first-import-file.css',
                'imports/third-import-file.less',
                'imports/fourth-import-file.php',
                'imports/second-import-file.less'
            ])
            .lengthOf(4);
        done();
    });

    it("Return Array", function (done) {
        assert.isArray(rgx(set_extensions), 'parseImportedFilesFromFileContent function must return Array');
        done();
    });
});
