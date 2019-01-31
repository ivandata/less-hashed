# less-hashed
> True incremental build — compile only changed LESS files without watcher.

[![Build Status](https://travis-ci.org/ivandata/less-hashed.svg?branch=master)](https://travis-ci.org/ivandata/less-hashed)
[![dependencies Status](https://david-dm.org/ivandata/less-hashed/status.svg)](https://david-dm.org/ivandata/less-hashed)
[![devDependencies Status](https://david-dm.org/ivandata/less-hashed/dev-status.svg)](https://david-dm.org/ivandata/less-hashed?type=dev)

less-hashed compares the hash of the less files and their dependencies, and returns a tree of only the changed files with their dependencies, to save wasting time regenerating output.

Can be useful:
* For incremental, when you need to compile only changed files and their dependencies. Builds when compiling less with gulp without a watcher, when you deploy for example.
* Simple to calculate and output the dependency tree.


## Install
```
npm install less-hashed --save-dev
```

## Gulp example
Used [gulp-filter](https://github.com/sindresorhus/gulp-filter) for filter exclude files.
```javascript
'use strict';

const gulp = require('gulp');
const less = require('gulp-less');
const filter = require('gulp-filter');
const lessHashed = require('less-hashed');

const config = {
  base: './assets/less/',
  src: './assets/less/**/*.less',
  include: '**/*.less',
  exclude: '!**/_*.less',
  destination: './build/css/',
  settings: {
    relativeUrls: true
  }
};

gulp.task('default', function () {
  const includes = lessHashed(
    config.src,
    {
      hashPath: config.destination,
      force:  process.argv.indexOf('--force') > -1
    }
  );

  return gulp
    .src(includes, { base: config.base })
    .pipe(filter([ config.include, config.exclude ]))
    .pipe(less(config.settings))
    .pipe(gulp.dest(config.destination));
});
```
## Absolute paths
```javascript
'use strict';

const gulp = require('gulp');
const less = require('gulp-less');
const filter = require('gulp-filter');
const lessHashed = require('less-hashed');

const config = {
  base: './assets/less/',
  src: './assets/less/**/*.less',
  include: '**/*.less',
  exclude: '!**/_*.less',
  destination: './build/css/',
  settings: {
    paths: ['./assets']
  }
};

gulp.task('default', function () {
  const includes = lessHashed(
    config.src,
    {
      hashPath: config.destination,
      force:  process.argv.indexOf('--force') > -1,
      base: config.settings.paths[0]
    }
  );

  return gulp
    .src(includes, { base: config.base })
    .pipe(filter([ config.include, config.exclude ]))
    .pipe(less(config.settings))
    .pipe(gulp.dest(config.destination));
});
```
## API
### lessChanged(pathToFiles, [options]);

#### pathToFiles
Type: `String`

Path to less files. Use *glob* patterns. For example `'./**/*.less'`. See [node-glob](https://github.com/isaacs/node-glob) for more info and examples.

#### options
Type: `Object`

##### hashPath
Type: `String`

Path to save hash file. If undefined — SAVE HASH mode disabled. It's mean files will not be hashed.

##### hashName
Type: `string`  
Default: `hashes.json`

Hash file name.

##### force
Type: `boolean`  
Default: `false`

Make new hash file and return full tree of less files and their dependencies.
