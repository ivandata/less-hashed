# less-hashed
> True incremental build — compile only changed LESS files without watcher.

less-hashed compares the hash of the less files and their dependencies, and returns a tree of only the changed files with their dependencies, to save wasting time regenerating output.

Can be useful:
* When you need to compile only changed files and their dependencies:
    *  For incremental builds when compiling less with gulp without a watcher, when you deploy for example.
    * On the server, for example express.js or koa.js
* Simple to calculate and output the dependency tree.


## Install
```
npm install less-hashed --save-dev
```

## Examples
### With Gulp
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
### With express.js

## API
**lessChanged(less_files_path, hash_file_path, {options});**
* **less_files_path** — path to less files. Use *glob* patterns. For example `'./**/*.less'`. See [node-glob](https://github.com/isaacs/node-glob) for more info and examples.
* **hash_file_path** — path to save hash and debug files.
### options
* **force_compile_all** — make new hash file and return full tree of less files and their dependencies. Default is `false`.
* **debug_mode** — save to disk the files hashes and logs: dependencies, changed files, compile and result. Default is `false`.
* **save_sources_hashes_file** — save hash file or not. Default is `true`.

## License
Copyright (c) 2017 Ivan Malov

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.