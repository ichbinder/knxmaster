var gulp = require( 'gulp' );

var onError = require( '../utils' ).onError;

// var sourcemaps = require( "gulp-sourcemaps" );

var SRC_GLOB = './src/backend/views/**/*.*';

gulp.task( 'build:views', function () {
  return gulp.src( SRC_GLOB )
             .pipe( gulp.dest( 'build/backend/views' ) );
} );

gulp.tasks[ 'build:views' ].SRC_GLOB = SRC_GLOB;
