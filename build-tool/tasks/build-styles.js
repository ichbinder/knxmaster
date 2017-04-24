var gulp = require( 'gulp' );

var onError = require( '../utils' ).onError;

// var sourcemaps = require( "gulp-sourcemaps" );

var SRC_GLOB = './src/frontend/styles/**/*.css';

gulp.task( 'build:styles', function () {
  return gulp.src( SRC_GLOB )
             .pipe( gulp.dest( 'build/frontend/styles' ) );
} );

gulp.tasks[ 'build:styles' ].SRC_GLOB = SRC_GLOB;
