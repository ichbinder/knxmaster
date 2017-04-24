var gulp = require( 'gulp' );
var less = require('gulp-less');
var path = require('path');

var onError = require( '../utils' ).onError;

// var sourcemaps = require( "gulp-sourcemaps" );

var SRC_GLOB = './src/frontend/styles/**/*.less';

gulp.task( 'build:styles-less', function () {
  return gulp.src( SRC_GLOB )
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('build/frontend/styles'));
});

gulp.tasks[ 'build:styles-less' ].SRC_GLOB = SRC_GLOB;
