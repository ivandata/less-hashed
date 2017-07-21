'use strict';

import {expect, assert} from 'chai';
import lessHashed from '../lib/index';
import fs from 'fs-extra';

const stubs = `${process.cwd()}/test/stubs/`;

describe("Index", function () {

  let less_files_path = `${stubs}extensions/**/*.less`;
  let hash_file_path = `${stubs}hashes.json`;

  context('When save_sources_hashes_file is false', () => {
    let options = {
      save_sources_hashes_file: false
    };

    it("return files to compile", async () => {
      let result = await lessHashed(less_files_path, hash_file_path, options);
      expect(result)
        .to.eql([
          `${stubs}extensions/css-imports/file.less`,
          `${stubs}extensions/empty-imports/file.less`,
          `${stubs}extensions/empty-imports/imports/import-file.less`,
          `${stubs}extensions/less-imports/file.less`,
          `${stubs}extensions/less-imports/imports/import-file.less`,
          `${stubs}extensions/php-imports/file.less`,
          `${stubs}extensions/set-imports/file.less`,
          `${stubs}extensions/set-imports/imports/second-import-file.less`,
          `${stubs}extensions/set-imports/imports/third-import-file.less`
      ])
        .lengthOf(9);
    });

    it("Return Array", async () => {
      let result = await lessHashed(less_files_path, hash_file_path, options);
      assert.isArray(result, 'Index must return Array');
    });
  });

  context('When save_sources_hashes_file is true', () => {
    let options = {
      save_sources_hashes_file: true
    };

    beforeEach(async () => {
      await lessHashed(less_files_path, hash_file_path, options);
    });

    it("save hash file on disc", async () => {
      fs.existsSync(hash_file_path).should.be.true();
      fs.unlinkSync(hash_file_path);
    });

  });
});