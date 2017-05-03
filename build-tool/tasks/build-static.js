var gulp = require( 'gulp' );

var onError = require( '../utils' ).onError;

// var sourcemaps = require( "gulp-sourcemaps" );

var SRC_GLOB = './src/backend/static/**/*.*';

gulp.task( 'build:static', function () {
  return gulp.src( SRC_GLOB )
             .pipe( gulp.dest( 'build/backend/static' ) );
} );

gulp.tasks[ 'build:static' ].SRC_GLOB = SRC_GLOB;
