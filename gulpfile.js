/*!
 * gulp
 * $ npm install gulp-ruby-sass gulp-autoprefixer gulp-minify-css gulp-jshint gulp-concat gulp-uglify gulp-imagemin gulp-notify gulp-rename gulp-livereload gulp-cache del --save-dev
 */

// Load plugins
var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    htmlreplace = require('gulp-html-replace'); // need
    del = require('del');
    source = require('vinyl-source-stream');
    browserify = require('browserify');
    watchify = require('watchify');
    reactify = require('reactify');
    streamify = require('gulp-streamify');
    babel = require('gulp-babel');
// var gulpLoadPlugins = require('gulp-load-plugins'),
//     plugins = gulpLoadPlugins({lazy: false});
//     console.log(Object.keys(plugins));

var srcPath = {
  SRC : 'src',
  ENTRY_POINT: './src/scripts/app.js',
  HTML: 'src/index.html',
  SCSS: 'src/styles/*.scss',
  STYLES : 'dist/styles',
  SCRIPTS : 'src/scripts/**/*.js',
  IMAGES : 'src/images/**/*'
}
var destPath = {
  MINIFIED_OUT: 'build.min.js',
  OUT: 'build.js',
  DEST: 'dist',
  BUILD: 'dist/build',
  DEST_FILES : 'dist/**/*',
  HTML: 'dist/index.html',
  STYLES : 'dist/styles',
  SCRIPTS : 'dist/scripts',
  IMAGES : 'dist/images'
}



//html
gulp.task('html', function() {
  return gulp.src(srcPath.HTML)
             // .pipe(htmlreplace({
             //      'haha': ['js/haha.min.js', 'dylan.css']
             //  }))
             .pipe(gulp.dest(destPath.DEST));
});
// Styles
gulp.task('styles', function() {
  return sass(srcPath.SCSS, { style: 'expanded' })
    .pipe(autoprefixer('last 2 version'))
    .pipe(gulp.dest(destPath.STYLES))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest(destPath.STYLES))
    .pipe(notify({ message: 'Styles task complete' }));
});

 
// gulp.task('test', () => {
//   return gulp.src(srcPath.ENTRY_POINT)
//     .pipe(babel({
//       presets: ['es2015', 'react']
//     }))
//     .pipe(gulp.dest(destPath.DEST));
// });
// Scripts
gulp.task('scripts', function() {
  return gulp.src(srcPath.SCRIPTS)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest(destPath.SCRIPTS))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest(destPath.SCRIPTS))
    .pipe(notify({ message: 'Scripts task complete' }));
});

// Images
gulp.task('images', function() {
  return gulp.src(srcPath.IMAGES)
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest(destPath.IMAGES))
    .pipe(notify({ message: 'Images task complete' }));
});

// Clean
gulp.task('clean', function() {
  return del(destPath.DEST_FILES);
});



// Watch
gulp.task('watch', function() {

  


  gulp.watch(srcPath.HTML, ['html']);
  // Watch .scss files
  gulp.watch(srcPath.SCSS, ['styles']);

  // Watch .js files
  // gulp.watch(srcPath.SCRIPTS, ['scripts']);

  // Watch image files
  gulp.watch(srcPath.IMAGES, ['images']);

  // Create LiveReload server
  livereload.listen();

  // Watch any files in dist/, reload on change
  gulp.watch([destPath.DEST_FILES]).on('change', livereload.changed);

  var watcher  = watchify(browserify({
    entries: [srcPath.ENTRY_POINT],
    transform: [reactify],
    debug: true,
    cache: {}, packageCache: {}, fullPaths: true
  }));
  return watcher.on('update', function () {
    watcher.bundle()
           .pipe(source(destPath.OUT))
           .pipe(gulp.dest(destPath.BUILD))
    console.log('Updated');
  })
    .bundle()
    .pipe(source(destPath.OUT))
    .pipe(gulp.dest(destPath.BUILD))

});

gulp.task('build', function(){
  browserify({
    entries: [srcPath.ENTRY_POINT],
    transform: [reactify],
  })
    .bundle()
    .pipe(source(destPath.MINIFIED_OUT))
    .pipe(streamify(uglify(destPath.MINIFIED_OUT)))
    .pipe(gulp.dest(destPath.BUILD));
});

gulp.task('replaceHTML', function(){
  gulp.src(srcPath.HTML)
    .pipe(htmlreplace({
      'js': destPath.BUILD + destPath.MINIFIED_OUT
    }))
    .pipe(gulp.dest(destPath.DEST));
});
// Default task
gulp.task('default', ['clean'], function() {
  gulp.start('styles', 'images', 'html', 'watch'); //, 'scripts'
});
gulp.task('production', ['replaceHTML', 'build']);