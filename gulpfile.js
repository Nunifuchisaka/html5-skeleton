var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    compass = require('gulp-compass'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    livereload = require('gulp-livereload'),
    sourcemaps = require('gulp-sourcemaps');


gulp.task('default', ['watch']);



/*
## StyleSheet
*/

gulp.task('compass_compile', function(){
  gulp.src('src/assets/pc/scss/**/*.scss')
    .pipe(plumber())
    .pipe(compass({
      config_file: 'src/assets/config.rb',
      style: 'compressed',//expanded
      comments : false,
      css : 'dst/htdocs/assets/css',
      sass: 'src/assets/scss',
      sourcemap: false
    }));
});



/*
## JavaScript
*/

gulp.task('js_common_compile', function() {
  gulp.src([
      'src/assets/js/common/110_header.js',
      'src/assets/js/common/310_SmoothScroll.js',
      'src/assets/js/common/710_Analytics.js',
      'src/assets/js/common/800_app.js',
      'src/assets/js/common/990_footer.js'
    ])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('common.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dst/htdocs/assets/js'));
});



/*
## watch
*/

gulp.task('watch', function(){
  
  livereload.listen();
  
  gulp.watch('src/assets/scss/**/*.scss', function(event){
    gulp.run('compass_compile');
  });
  
  gulp.watch('src/assets/js/common/**/*.js', ['js_common_compile']);
  
  gulp.watch([
    'dst/htdocs/**/*.html',
    'dst/htdocs/**/*.php',
    'dst/htdocs/**/*.js',
    'dst/htdocs/**/*.css'
  ]).on('change', livereload.changed);
  
});
