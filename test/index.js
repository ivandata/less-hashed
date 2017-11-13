'use strict';

import {expect, assert} from 'chai';
import lessHashed from '../lib/index';
import fs from 'fs-extra';

const stubs = `${process.cwd()}/test/stubs`;

describe("Index", function () {

  let less_files_path = `${stubs}/extensions/**/*.less`;
  let hash_file_path = `${stubs}/`;
  let hash_file_name = 'hashes.json';

  context('Without options', () => {

    it("return files to compile", async () => {
      let result = await lessHashed(less_files_path);
      expect(result)
        .to.eql([
        `${stubs}/extensions/css-imports/file.less`,
        `${stubs}/extensions/empty-imports/file.less`,
        `${stubs}/extensions/empty-imports/imports/import-file.less`,
        `${stubs}/extensions/less-imports/file.less`,
        `${stubs}/extensions/less-imports/imports/import-file.less`,
        `${stubs}/extensions/php-imports/file.less`,
        `${stubs}/extensions/set-imports/file.less`,
        `${stubs}/extensions/set-imports/imports/second-import-file.less`,
        `${stubs}/extensions/set-imports/imports/third-import-file.less`
      ])
        .lengthOf(9);
    });

    it("return Array", async () => {
      let result = await lessHashed(less_files_path);
      assert.isArray(result, 'Index must return Array');
    });

    it("does not save the file with hashes to disk", () => {
      fs.existsSync(hash_file_path + hash_file_name).should.be.false();
    });

  });

  describe('With options', () => {
    context('With hashPath and without hashName', () => {

      let options = {
        hashPath: hash_file_path
      };

      beforeEach(async () => {
        await lessHashed(less_files_path, options);
      });

      it("save hash file on disc", () => {
        fs.existsSync(hash_file_path + hash_file_name).should.be.true();
        fs.unlinkSync(hash_file_path + hash_file_name);
        fs.existsSync(hash_file_path + hash_file_name).should.be.false();
      });

      it("hash name must be hashes.json", () => {
        fs.existsSync(hash_file_path + hash_file_name).should.be.true();
        fs.unlinkSync(hash_file_path + hash_file_name);
        fs.existsSync(hash_file_path + hash_file_name).should.be.false();
      });

    });

    context('With hashPath and hashName', () => {

      const hash_file_name = 'test.json';
      let options = {
        hashPath: hash_file_path,
        hashName: hash_file_name
      };

      beforeEach(async () => {
        await lessHashed(less_files_path, options);
      });

      it("save hash file on disc", () => {
        fs.existsSync(hash_file_path + hash_file_name).should.be.true();
        fs.unlinkSync(hash_file_path + hash_file_name);
        fs.existsSync(hash_file_path + hash_file_name).should.be.false();
      });

      it("hash name must be hashName", () => {
        fs.existsSync(hash_file_path + hash_file_name).should.be.true();
        fs.unlinkSync(hash_file_path + hash_file_name);
        fs.existsSync(hash_file_path + hash_file_name).should.be.false();
      });

    });

  });

});