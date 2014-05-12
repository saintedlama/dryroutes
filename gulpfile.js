var gulp = require('gulp');
var p = require('gulp-load-plugins')();

gulp.task('clean-doc', function() {
  return gulp.src('doc')
    .pipe(p.clean());
});

// TODO: Base directory got wrong here!
gulp.task('copy-assets', function() {
  return gulp.src(['docgen/public/**', 'docgen/bower_components/**', 'docgen/public/docco.css'])
    .pipe(gulp.dest('doc/public'));
});

gulp.task('doc', ['copy-assets'], function() {
  return gulp.src(['./routes/tasks.js'])
    .pipe(p.docco({  template: 'docgen/docco.jst' }))
    .pipe(gulp.dest('doc'));
});

gulp.task('default', ['doc'], function() {
});
