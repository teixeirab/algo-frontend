var gulp = require('gulp')
var rename = require('gulp-rename');
var template = require('gulp-template');
var argv = require('yargs').argv;

gulp.task('build', function(done) {
    mode = argv.mode || 'local';
    configs = require('./panel/client/js/configs/' + mode);
    return gulp.src(['./panel/client/js/configs/index.js'])
      .pipe(template(configs))
      .pipe(rename({basename: 'config'}))
      .pipe(gulp.dest('./panel/client/js/'));
});
