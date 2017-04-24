var gulp = require( 'gulp' );

var onError = require( '../utils' ).onError;

// var sourcemaps = require( "gulp-sourcemaps" );

var SRC_GLOB = './src/backend/*.yaml';

gulp.task( 'build:config', function () {
  return gulp.src( SRC_GLOB )
             .pipe( gulp.dest( 'build/backend' ) );
} );

gulp.tasks[ 'build:config' ].SRC_GLOB = SRC_GLOB;
