const gulp  = require("gulp");
const sass  = require('gulp-sass');
const fractal = require('./fractal.js');
const logger = fractal.cli.console;
const sassGlob = require('gulp-sass-glob');
const cleanCSS = require('gulp-clean-css');
const merge = require('merge-stream');
const concat = require('gulp-concat');
const terser = require('gulp-terser');

sass.compiler = require('node-sass');

/*
  generate the css with sass
*/
gulp.task('css', function () {

    return gulp.src('patterns/assets/scss/**/*.scss')
        .pipe(sassGlob())
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanCSS())
        .pipe(gulp.dest('patterns/public/css'));

});

gulp.task('copy-assets', function(){

    let copyCSS = gulp.src('patterns/public/css/**/*')
    .pipe(gulp.dest('./_content/assets/css'));

    let copyJavaScript = gulp.src('patterns/public/js/**/*')
    .pipe(gulp.dest('./_content/assets/js'));

    return merge(copyCSS, copyJavaScript);

});

gulp.task('scripts', function() {
    return gulp.src(['patterns/assets/js/**/*.js','patterns/components/**/*.js'])
      .pipe(concat('all.js'))
      .pipe(terser())
      .pipe(gulp.dest('patterns/public/js'));
  });

/*
Watch folders for changes
*/
gulp.task("watch", function() {
    return gulp.watch([
        'patterns/components/**/*.scss',
        'patterns/assets/scss/**/*.scss'
    ], gulp.series('css', 'scripts', 'copy-assets'));
});


gulp.task('fractal:start', function () {
    const server = fractal.web.server({
        sync: true
    });
    server.on('error', err => logger.error(err.message));
    return server.start().then(() => {
        logger.success(`Fractal server is now running at ${server.url}`);
    });
});


/*
Let's build this sucker.
*/
gulp.task('build', gulp.series(
    'css',
    'scripts',
    'copy-assets'
));

/*
Start the pattern library
*/
gulp.task('patterns', gulp.series(
    'css',
    'scripts',
    'copy-assets',
    'fractal:start'
));