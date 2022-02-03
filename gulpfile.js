var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    browserSync = require('browser-sync').create(),
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer');

var path = {
  src: 'src',
  dst: 'www/htdocs'
};


/*
## browser sync
*/

gulp.task('bs-reload', function(done){
  browserSync.reload();
  done();
});


/*
## StyleSheet
*/

gulp.task('sass', function(){
  return gulp.src(path.src + '/scss/**/*.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
    ]))
    .pipe(gulp.dest(path.dst + '/assets/css'));
});


/*
## watch
*/

gulp.task('default', function(done){
  
  browserSync.init({
    //proxy: 'html5-skeleton.lcl:8888'
    https: true,
    server: { baseDir: path.dst },
    //startPath: ''
  });
  
  gulp.watch(path.dst + '/**/*.html', gulp.task('bs-reload'));
  gulp.watch(path.dst + '/**/*.php', gulp.task('bs-reload'));
  gulp.watch(path.dst + '/**/*.css', gulp.task('bs-reload'));
  gulp.watch(path.dst + '/**/*.js', gulp.task('bs-reload'));
  
  gulp.watch(path.src + '/scss/**/*.scss', gulp.task('sass'));
  
  done();
});
