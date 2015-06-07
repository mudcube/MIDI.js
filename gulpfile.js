var gulp = require('gulp'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify');

gulp.task('build', function() {
	gulp.src('./js/**')
		// This will output the non-minified version
		.pipe(concat('MIDI.js'))
		.pipe(gulp.dest('build/'))
		// This will minify and rename to foo.min.js
		.pipe(uglify())
		.pipe(rename({extname: '.min.js'}))
		.pipe(gulp.dest('build/'));
});

gulp.task('default', ['build']);