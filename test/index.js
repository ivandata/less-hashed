'use strict';

import {expect, assert} from 'chai';
import lessHashed from '../lib/index';
import fs from 'fs-extra';

const stubs = `test/stubs`;

describe("Index", function () {

  const less_files_path = `${stubs}/extensions/**/*.less`;
  const hash_file_path = `${stubs}/`;
  const hash_file_name = 'hashes.json';

  context('Without options', () => {
    it("must return files to compile", async () => {
      const result = await lessHashed(less_files_path);
      expect(result)
        .to.eql([
        `${stubs}/extensions/css-imports/file.less`,
        `${stubs}/extensions/empty-imports/file.less`,
        `${stubs}/extensions/empty-imports/imports/import-file.less`,
        `${stubs}/extensions/less-imports/base/import-file.less`,
        `${stubs}/extensions/less-imports/file.less`,
        `${stubs}/extensions/less-imports/imports/import-file.less`,
        `${stubs}/extensions/php-imports/file.less`,
        `${stubs}/extensions/set-imports/file.less`,
        `${stubs}/extensions/set-imports/imports/second-import-file.less`,
        `${stubs}/extensions/set-imports/imports/third-import-file.less`
      ])
        .lengthOf(10);
    });

    it("must return Array", async () => {
      const result = await lessHashed(less_files_path);
      assert.isArray(result, 'Index must return Array');
    });

    it("must do not save the file with hashes to disk", () => {
      fs.existsSync(hash_file_path + hash_file_name).should.be.false();
    });
  });

  describe('With options', () => {
    context('With hashPath and without hashName', () => {
      const options = {
        hashPath: hash_file_path
      };

      beforeEach(async () => {
        await lessHashed(less_files_path, options);
      });

      it("must save hash file on disc", () => {
        fs.existsSync(hash_file_path + hash_file_name).should.be.true();
        fs.unlinkSync(hash_file_path + hash_file_name);
        fs.existsSync(hash_file_path + hash_file_name).should.be.false();
      });

      it("must be hashes.json", () => {
        fs.existsSync(hash_file_path + hash_file_name).should.be.true();
        fs.unlinkSync(hash_file_path + hash_file_name);
        fs.existsSync(hash_file_path + hash_file_name).should.be.false();
      });
    });

    context('With hashPath and hashName', () => {
      const hash_file_name = 'test.json';
      const options = {
        hashPath: hash_file_path,
        hashName: hash_file_name
      };

      beforeEach(async () => {
        await lessHashed(less_files_path, options);
      });

      it("must save hash file on disc", () => {
        fs.existsSync(hash_file_path + hash_file_name).should.be.true();
        fs.unlinkSync(hash_file_path + hash_file_name);
        fs.existsSync(hash_file_path + hash_file_name).should.be.false();
      });

      it("must be hashName", () => {
        fs.existsSync(hash_file_path + hash_file_name).should.be.true();
        fs.unlinkSync(hash_file_path + hash_file_name);
        fs.existsSync(hash_file_path + hash_file_name).should.be.false();
      });
    });

    context('With base path', () => {
      it("must return files to compile with base path", async () => {
        const options = {
          base: stubs
        };
        const result = await lessHashed(less_files_path, options);
        expect(result)
          .to.eql([
          `${stubs}/extensions/css-imports/file.less`,
          `${stubs}/extensions/empty-imports/file.less`,
          `${stubs}/extensions/empty-imports/imports/import-file.less`,
          `${stubs}/extensions/less-imports/base/import-file.less`,
          `${stubs}/extensions/less-imports/file.less`,
          `${stubs}/extensions/less-imports/imports/import-file.less`,
          `${stubs}/extensions/php-imports/file.less`,
          `${stubs}/extensions/set-imports/file.less`,
          `${stubs}/extensions/set-imports/imports/second-import-file.less`,
          `${stubs}/extensions/set-imports/imports/third-import-file.less`
        ])
          .lengthOf(10);
      });
    });

  });

});
