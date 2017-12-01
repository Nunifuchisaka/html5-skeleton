var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    browserSync = require("browser-sync").create(),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps');


/*
## browser sync
*/

gulp.task("browser-sync", function(){
  browserSync.init({
    proxy: "html5-skeleton.local:8888"
  });
});

gulp.task("bs-reload", function(){
  browserSync.reload();
});



/*
## StyleSheet
*/

gulp.task("scss", function(){
  return gulp.src('src/assets/scss/**/*.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 version', 'iOS >= 8.1', 'Android >= 4.4'],
      cascade: false
    }))
    .pipe(gulp.dest('www/static/assets/css'))
    .pipe(browserSync.stream());
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
    .pipe(gulp.dest('www/static/assets/js'))
    .pipe(browserSync.stream());
});



/*
## watch
*/

gulp.task("default", ["browser-sync"], function(){
  
  gulp.watch('src/assets/scss/**/*.scss', ['scss']);
  
  gulp.watch('src/assets/js/common/**/*.js', ['js_common_compile']);
  
  gulp.watch('www/static/**/*.html', ['bs-reload']);
  gulp.watch('www/static/**/*.php', ['bs-reload']);
  //gulp.watch('www/static/**/*.css', ['bs-reload']);
  //gulp.watch('www/static/**/*.js', ['bs-reload']);
});
