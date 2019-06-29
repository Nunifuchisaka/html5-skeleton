var gulp = require('gulp');
var cache  = require('gulp-cached');
var plumber = require('gulp-plumber');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var gcmq = require('gulp-group-css-media-queries');
var notify  = require('gulp-notify');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');


/*
## browser sync
*/

gulp.task('browser-sync', function(done){
  browserSync.init({
    proxy: 'html5-skeleton.lcl:8888'
  });
  done();
});

gulp.task('bs-reload', function(done){
  browserSync.reload();
  done();
});



/*
## StyleSheet
*/

gulp.task('sass', function(){
  return gulp.src('src/assets/scss/**/*.scss')
    //.pipe(cache('sass'))
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(sass())
    .pipe(gcmq())
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(gulp.dest('www/htdocs/assets/css'));
});



/*
## JavaScript
*/

gulp.task('js_common', function(){
  gulp.src([
      'src/assets/js/common/110_header.js',
      'src/assets/js/common/310_SmoothScroll.js',
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

gulp.task('watch', function(done){
  
  gulp.watch('htdocs/**/*.html', gulp.task('bs-reload'));
  gulp.watch('htdocs/**/*.php', gulp.task('bs-reload'));
  gulp.watch('htdocs/**/*.css', gulp.task('bs-reload'));
  gulp.watch('htdocs/**/*.js', gulp.task('bs-reload'));
  
  gulp.watch('src/assets/scss/**/*.scss', gulp.series('sass'));
  gulp.watch('src/assets/js/common/**/*.js', gulp.series('js_common'));
  
  done();
});

gulp.task('default', gulp.series('browser-sync', 'watch', function(done){
  done();
}));
