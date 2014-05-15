var gulp = require('gulp');
var p = require('gulp-load-plugins')();

gulp.task('clean-doc', function() {
  return gulp.src('doc')
    .pipe(p.clean());
});

gulp.task('bower', function() {
  return p.bower()
    .pipe(gulp.dest('doc/bower_components'));
});

gulp.task('copy-docco', function() {
  return gulp.src('docgen/public/**')
    .pipe(gulp.dest('doc/public'));
});

gulp.task('copy', ['bower', 'copy-docco'], function() {
  return gulp.src(['docgen/public/**'])
    .pipe(gulp.dest('doc/public'));
});

gulp.task('doc', ['copy'], function() {
  return gulp.src(['./routes/tasks.js'])
    .pipe(p.docco({  template: 'docgen/docco.jst' }))
    .pipe(gulp.dest('doc'));
});

gulp.task('default', ['doc'], function() {
});
