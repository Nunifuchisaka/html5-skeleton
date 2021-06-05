var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    browserSync = require('browser-sync').create(),
    sass = require('gulp-sass');
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    notify  = require('gulp-notify');

var path = {
  src: 'src',
  dst: 'htdocs/hoge'
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

gulp.task('default', function(){
  
  browserSync.init({
    https: true,
    proxy: 'hoge.lcl',
    //server: { baseDir: 'htdocs' },
    startPath: 'hoge',
  });
  
  //https://hoge.lcl/hoge/
  
  gulp.watch(path.dst + '/**/*.html', gulp.task('bs-reload'));
  gulp.watch(path.dst + '/**/*.css', gulp.task('bs-reload'));
  gulp.watch(path.dst + '/**/*.js', gulp.task('bs-reload'));
  
  gulp.watch(path.src + '/scss/**/*.scss', gulp.task('sass'));
  
});
