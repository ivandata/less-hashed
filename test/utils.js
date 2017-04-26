'use strict';

const should = require('chai').should;
const assert = require('chai').assert;
const expect = require('chai').expect;
const utils = require('../lib/utils');
const compare = utils.compare;
const paths = utils.paths;
const imports = utils.imports;
const files = utils.files;
const colors = require('colors/safe');

describe("Compare two hashes", function() {

    let old_hash = {
        "less/base.less": "aaa",
        "less/components.less": "aaa",
        "less/pages/page.less": "aaa"
    };

    let new_hash = {
        "less/base.less": "bbb",
        "less/components.less": "aaa",
        "less/pages/page.less": "ccc"
    };

    it("Return Object with difference", function (done) {
        expect(compare(old_hash, new_hash)).to.eql({
            "less/base.less": "bbb",
            "less/pages/page.less": "ccc"
        });
        done();
    });

});

describe("Inverts the file tree with @imports in them", function() {

    let file_tree = {
        "./assets/file.less": [
            "./assets/dependency_1.less"
        ],
        "./assets/other_file.less": [
            "./assets/dependency_1.less",
            "./assets/dependency_2.less",
            "./assets/dependency_3.less",
            "./assets/dependency_4.less",
            "./assets/dependency_5.less",
            "./assets/dependency_6.less",
            "./assets/dependency_7.less"
        ]
    };

    it("Return Object with files imported in tree", function (done) {
        expect(imports(file_tree)).to.eql({
            "./assets/dependency_1.less": {
                "./assets/file.less": 1,
                "./assets/other_file.less": 1
            },
            "./assets/dependency_2.less": {
                "./assets/other_file.less": 1
            },
            "./assets/dependency_3.less": {
                "./assets/other_file.less": 1
            },
            "./assets/dependency_4.less": {
                "./assets/other_file.less": 1
            },
            "./assets/dependency_5.less": {
                "./assets/other_file.less": 1
            },
            "./assets/dependency_6.less": {
                "./assets/other_file.less": 1
            },
            "./assets/dependency_7.less": {
                "./assets/other_file.less": 1
            },
            "./assets/file.less": {},
            "./assets/other_file.less": {}
        });
        done();
    });

});
