var gulp = require('gulp');
var p = require('gulp-load-plugins')();

gulp.task('clean-doc', function() {
  return gulp.src('doc')
    .pipe(p.clean());
});

gulp.task('doc', ['clean-doc'], function() {
  return gulp.src(['!node_modules/**/*.js', '**/*.js'])
    .pipe(p.docco({ layout : 'linear' }))
    .pipe(gulp.dest('doc'));
});

gulp.task('default', ['doc'], function() {
});
