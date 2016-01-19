'use strict'

//----------------------------------------------------------
// modules
//----------------------------------------------------------
// npm
const watchify = require('watchify')
const browserify = require('browserify')
const gulp = require('gulp')
const source = require('vinyl-source-stream')
const gutil = require('gulp-util')
const autoImport = require('auto-import')
const babelify = require('babelify')
const buffer = require('vinyl-buffer')
const sourcemaps = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')

//----------------------------------------------------------
// fns
//----------------------------------------------------------
const browserifyStream = browserify(
  { entries: ['src/app.js']
  , transform: [babelify.configure({presets: ['es2015']})]
  , cache: {}
  , packageCache: {}
  , debug: true
  })

browserifyStream.on('log', txt => gutil.log(`Browserify: ${txt}`))

const consume = stream => {
  stream.bundle()
    .on('error', err => console.log(err.stack))
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'))
}

function watch() {
  const watchifyStream = watchify(browserifyStream)
  consume(watchifyStream)
  watchifyStream.on('update', () => consume(watchifyStream))
  gulp.watch('src/*/**/*.js', ['imports'])
}

gulp.task('scripts', ['imports'], () => consume(browserifyStream))
gulp.task('imports', () => autoImport('src'))
gulp.task('watch', cb => watch())
