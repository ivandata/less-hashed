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

const
  gulp = require('gulp'),
  less = require('gulp-less'),
  filter = require('gulp-filter'),
  lessHashed = require('less-hashed');

let paths = {
  src: './assets/less/**/*.less',
  include: '**/*.less',
  exclude: '!**/_*.less',
  destination: './build/css/'
};

gulp.task('default', function () {

  let includes, force_compile_all, debug_mode;
  if (process.argv.indexOf('--force') > -1) { force_compile_all = true; }
  if (process.argv.indexOf('--debug') > -1) { debug_mode = true; }
  includes = lessHashed(
    paths.src,
    paths.destination + '/hashes.json',
    {
      force_compile_all:  force_compile_all,
      debug_mode: debug_mode
    }
  );

  return gulp
    .src(includes, { base: './assets/less/' })
    .pipe(filter([ paths.include, paths.exclude ]))
    .pipe(less({ relativeUrls: true })
    .pipe(gulp.dest(paths.destination));
});
```
## API
### lessChanged(less_files_path, hash_file_path, [options]);

#### less_files_path
Type: `String`

Path to less files. Use *glob* patterns. For example `'./**/*.less'`. See [node-glob](https://github.com/isaacs/node-glob) for more info and examples.

#### hash_file_path
Type: `String`

Path to save hash and debug files.

### options
Type: `Object`

#### force_compile_all
Type: `boolean`  
Default: `false`

Make new hash file and return full tree of less files and their dependencies.

#### debug_mode
Type: `boolean`  
Default: `false`

Save to disk the files hashes and logs: dependencies, changed files, compile and result.

#### save_sources_hashes_file
Type: `boolean`  
Default: `true`

Save hash file or not.