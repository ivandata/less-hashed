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