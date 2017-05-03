var gulp = require( 'gulp' );
var utils = require( '../utils.js' );

require( './build-scripts-backend' );
require( './build-scripts-frontend' );
require( './build-styles' );
require( './build-styles-less' );
require( './build-images' );
require( './build-views' );
require( './build-config' );
require( './build-static' );
require( './build-db' );


gulp.task( 'build', [ 'build:config', 'build:images', 'build:styles', 'build:styles-less', 'build:static', 'build:views', 'build:scripts-backend', 'build:scripts-frontend'] );

gulp.task( 'build-and-watch', ['build', 'watch:build'] );

gulp.task( 'watch:build', function ( ) {
  utils.watchTask( 'build:images' );
  utils.watchTask( 'build:styles' );
  utils.watchTask( 'build:styles-less' );
  utils.watchTask( 'build:views' );
  utils.watchTask( 'build:scripts-backend' );
  utils.watchTask( 'build:scripts-frontend' );
  utils.watchTask( 'build:config' );
  utils.watchTask( 'build:static' );
} );
