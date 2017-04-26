'use strict';

const expect = require('chai').expect;
const utils = require('../lib/utils');
const compare = utils.compare;
const paths = utils.paths;
const imports = utils.imports;
const files = utils.files;
const colors = require('colors/safe');

describe("Compare two hashes", function () {

    let old_hash = {
        "less/base.less": "1ee4355eba05a8cb5daa7ab72d74a958766200b7",
        "less/components.less": "fd28a5fc8e2d3624b1dcaf7e07e0984f509dced4",
        "less/pages/page.less": "578cf46f907c707cd6eccb4e131ac3bc8bb36163"
    };

    let new_hash = {
        "less/base.less": "63a14e41ab171c6530d0e43131fb71324e077807",
        "less/components.less": "fd28a5fc8e2d3624b1dcaf7e07e0984f509dced4",
        "less/pages/page.less": "b7f631511b5962f42922ff5de02b26a992ac746c"
    };

    it("Return Object with difference", function (done) {
        expect(compare(old_hash, new_hash)).to.eql({
            "less/base.less": "63a14e41ab171c6530d0e43131fb71324e077807",
            "less/pages/page.less": "b7f631511b5962f42922ff5de02b26a992ac746c"
        });
        done();
    });

});

describe("Inverts the file tree with @imports in them", function () {

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

describe("Builds a tree of compiled files of the dependencies", function () {

    let changed_files = {
        "./assets/dependency_1.less": "1ee4355eba05a8cb5daa7ab72d74a958766200b7",
        "./assets/other_file.less": "63a14e41ab171c6530d0e43131fb71324e077807"
    };

    let file_imported_in_tree = {
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
    };

    it("Return Object with files to compile", function (done) {
        expect(files(changed_files, file_imported_in_tree)).to.eql({
            "./assets/dependency_1.less": 1,
            "./assets/file.less": 1,
            "./assets/other_file.less": 1
        });
        done();
    });

});