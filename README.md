Compare hashes
Make tree of files with dependencies
Return only changed files

## Example
### With gulp
```javascript
'use strict';

const
    gulp = require('gulp'),
	less = require('gulp-less'),
	lesshashed = require('less-hashed');

let paths = {
        src: './assets/less/**/*.less',
        include: '**/*.less',
    	exclude: '!**/_*.less',
        destination: './build/css/'
    };

gulp.task('less', (success) => {

	let includes, force_compile_all, debug_mode;
	if (process.argv.indexOf('--force') > -1) { force_compile_all = true; }
	if (process.argv.indexOf('--debug') > -1) { debug_mode = true; }
	includes = lesshashed(
		paths.src,
		paths.destination + '/hashes.json',
    	{
        	force_compile_all:  force_compile_all,
        	debug_mode: debug_mode
		}
	);

    return gulp
	.src(includes, { base: './assets/less/' })
	.pipe(filter(paths.include, paths.exclude]))
	.pipe(less({
        relativeUrls: true
    })
	.pipe(gulp.dest(paths.destination))
	.on('end', () => {
		console.log('Build LESS!');
	}, success);
}
```