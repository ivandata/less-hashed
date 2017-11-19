'use strict';

import {expect, assert} from 'chai';
import {
  getFileHash,
  compareHash,
  getImportsPaths,
  correctRelativePaths,
  invertFilesTree,
  getFilesToCompile
} from '../lib/utils';

describe('Utils', function () {
  context("Compare two hashes", function () {

    const old_hash = {
      "less/base.less": "1ee4355eba05a8cb5daa7ab72d74a958766200b7",
      "less/components.less": "fd28a5fc8e2d3624b1dcaf7e07e0984f509dced4",
      "less/pages/page.less": "578cf46f907c707cd6eccb4e131ac3bc8bb36163"
    };

    const new_hash = {
      "less/base.less": "63a14e41ab171c6530d0e43131fb71324e077807",
      "less/components.less": "fd28a5fc8e2d3624b1dcaf7e07e0984f509dced4",
      "less/pages/page.less": "b7f631511b5962f42922ff5de02b26a992ac746c"
    };

    it("Return difference", function (done) {
      expect(compareHash(old_hash, new_hash)).to.deep.equal({
        "less/pages/page.less": "b7f631511b5962f42922ff5de02b26a992ac746c",
        "less/base.less": "63a14e41ab171c6530d0e43131fb71324e077807",
      });
      done();
    });

    it("Return Object", function (done) {
      assert.isObject(compareHash(old_hash, new_hash), 'compareHash function must return Object');
      done();
    });

  });

  context("Get paths from @imports directive", function () {

    const css_extension = './test/stubs/extensions/css-imports/file.less';
    it("Return full paths from .css extension", function (done) {
      expect(getImportsPaths(css_extension)).to.eql(['imports/import-file.css']);
      done();
    });

    const empty_extension = './test/stubs/extensions/empty-imports/file.less';
    it("Return full paths from NO extension", function (done) {
      expect(getImportsPaths(empty_extension)).to.eql(['imports/import-file.less']);
      done();
    });

    const less_extension = './test/stubs/extensions/less-imports/file.less';
    it("Return full paths from .less extension", function (done) {
      expect(getImportsPaths(less_extension)).to.eql(['imports/import-file.less']);
      done();
    });

    const php_extension = './test/stubs/extensions/php-imports/file.less';
    it("Return full paths from .php extension", function (done) {
      expect(getImportsPaths(php_extension)).to.eql(['imports/import-file.php']);
      done();
    });

    const set_extensions = './test/stubs/extensions/set-imports/file.less';
    it("Return full paths from set of extensions", function (done) {
      expect(getImportsPaths(set_extensions))
        .to.eql([
        'imports/first-import-file.css',
        'imports/second-import-file.less',
        'imports/third-import-file.less',
        'imports/fourth-import-file.php'
      ])
        .lengthOf(4);
      done();
    });

    it("Return Array", function (done) {
      assert.isArray(getImportsPaths(set_extensions), 'getImportsPaths function must return Array');
      done();
    });
  });

  context("Correct a relative @import file paths in absolute", function () {
    it('Return absolute files paths from array of relative paths with relative file path', async function () {
      const path = './files/level/one/file.less';
      const imports = [
        'file.less',
        './file.less',
        '../file.less',
        '../../file.less',
        '../../../file.less'
      ];
      const result = await correctRelativePaths(path, imports);
      expect(result)
        .to.eql([
        './files/level/one/file.less',
        './files/level/one/file.less',
        './files/level/file.less',
        './files/file.less',
        './file.less'
      ]);
    });

    it('Return absolute files paths from array of relative paths with absolute file path', async function () {
      const path = '/files/level/one/file.less';
      const imports = [
        'file.less',
        './file.less',
        '../file.less',
        '../../file.less',
        '../../../file.less'
      ];
      const result = await correctRelativePaths(path, imports);
      expect(result)
        .to.eql([
        '/files/level/one/file.less',
        '/files/level/one/file.less',
        '/files/level/file.less',
        '/files/file.less',
        '/file.less'
      ]);
    });

    it("Return Array", async function () {
      const path = '/files/level/one/file.less';
      const imports = [
        'file.less',
        './file.less',
        '../file.less',
        '../../file.less',
        '../../../file.less'
      ];
      const result = await correctRelativePaths(path, imports);
      assert.isArray(result, 'correctRelativePaths function must return Array');
    });
  });

  context("Inverts the file tree with @imports in them", function () {

    const file_tree = {
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
      expect(invertFilesTree(file_tree)).to.deep.equal({
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

  context("Builds a tree of compiled files of the dependencies", function () {

    const changed_files = {
      "./assets/dependency_1.less": "1ee4355eba05a8cb5daa7ab72d74a958766200b7",
      "./assets/other_file.less": "63a14e41ab171c6530d0e43131fb71324e077807"
    };

    const file_imported_in_tree = {
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
      expect(getFilesToCompile(changed_files, file_imported_in_tree)).to.deep.equal({
        "./assets/dependency_1.less": 1,
        "./assets/file.less": 1,
        "./assets/other_file.less": 1
      });
      done();
    });

  });

  context("Get hash of file by using mtime", function () {
    const path_to_file = './test/stubs/extensions/css-imports/file.less';

    it("Return hash of file", function (done) {
      const result = getFileHash(path_to_file);
      assert.isString(result, 'getFileHash function must return String');
      done();
    });

  });
});