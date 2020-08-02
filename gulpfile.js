var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    browserSync = require('browser-sync').create(),
    sass = require('gulp-sass');
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    mqpacker = require('css-mqpacker'),
    //cssnano = require('cssnano'),
    notify  = require('gulp-notify'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps');

var path = {
  src: 'src/assets',
  dst: 'www/htdocs'
};

/*
## browser sync
*/

gulp.task('browser-sync', function(done){
  browserSync.init({
    //proxy: 'html5-skeleton.lcl:8888'
    baseDir: path.dst
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
  return gulp.src(path.src + '/scss/**/*.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
      mqpacker(),
      //cssnano({ autoprefixer: false }),
    ]))
    .pipe(gulp.dest(path.dst + '/assets/css'));
});



/*
## JavaScript
*/

gulp.task('js_common', function(){
  gulp.src([
      path.src + '/js/common/110_header.js',
      path.src + '/js/common/310_SmoothScroll.js',
      path.src + '/js/common/800_app.js',
      path.src + '/js/common/990_footer.js'
    ])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('common.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.dst + '/assets/js'))
    .pipe(browserSync.stream());
});



/*
## watch
*/

gulp.task('watch', function(done){
  
  gulp.watch(path.dst + '/**/*.html', gulp.task('bs-reload'));
  gulp.watch(path.dst + '/**/*.php', gulp.task('bs-reload'));
  gulp.watch(path.dst + '/**/*.css', gulp.task('bs-reload'));
  gulp.watch(path.dst + '/**/*.js', gulp.task('bs-reload'));
  
  gulp.watch(path.src + '/scss/**/*.scss', gulp.series('sass'));
  gulp.watch(path.src + '/js/common/**/*.js', gulp.series('js_common'));
  
  done();
});


gulp.task('default', gulp.series('browser-sync', 'watch'));

