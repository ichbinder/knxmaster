var gulp = require( 'gulp' );

var onError = require( '../utils' ).onError;

// var sourcemaps = require( "gulp-sourcemaps" );

var SRC_GLOB = './src/frontend/images/**/*.*';

gulp.task( 'build:images', function () {
  return gulp.src( SRC_GLOB )
             .pipe( gulp.dest( 'build/frontend/images' ) );
} );

gulp.tasks[ 'build:images' ].SRC_GLOB = SRC_GLOB;
