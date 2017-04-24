var gulp = require( 'gulp' );
var babel = require( 'gulp-babel' );
var path = require( 'path' );

var webpack = require( 'webpack-stream' );

var onError = require( '../utils' ).onError;

// var sourcemaps = require( "gulp-sourcemaps" );

var SRC_GLOB = './src/frontend/**/*.js';

gulp.task( 'build:scripts-frontend', function () {
  return gulp.src( 'src/frontend/scripts/app.js' )
            //  .pipe( sourcemaps.init() )
             .pipe( webpack( {
               debug: true,
               devtool: 'source-map',
               watch: true,
               output: {
                 filename: 'scripts/app.js'
               },
               module: {
                 loaders: [ {
                   test: /\.js$/,
                   include: [ path.resolve( __dirname, '../../src/frontend/scripts' ) ],
                   loader: 'babel',
                   query: {
                     presets: ['react', 'es2015']
                   }
                 } ]
               }
             } ) )
             .on( 'error', onError )
            //  .pipe( sourcemaps.write( "." ) )
             .pipe( gulp.dest( 'build/frontend' ) );
} );

gulp.tasks[ 'build:scripts-frontend' ].SRC_GLOB = SRC_GLOB;
