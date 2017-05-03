var gulp = require( 'gulp' );

var onError = require( '../utils' ).onError;

// var sourcemaps = require( "gulp-sourcemaps" );

var SRC_GLOB = './src/backend/db/**/*.*';

gulp.task( 'build:db', function () {
  return gulp.src( SRC_GLOB )
             .pipe( gulp.dest( 'build/backend/db' ) );
} );

gulp.tasks[ 'build:db' ].SRC_GLOB = SRC_GLOB;
