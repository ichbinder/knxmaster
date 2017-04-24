import express from 'express';
import jsonServer from 'json-server';
import bodyParser from 'body-parser';
import path from 'path';
import eWs from 'express-ws';
import rKnxAPI from '../routes/rKnxapi';
import rFrontend from '../routes/rFrontend';
import rWebSocket from '../routes/rWebSocket';

const expressWs = eWs( express() );
const app = expressWs.app;
// const app = express();

app.set( 'port', process.env.PORT || 8006 );

// laden den bodyParser
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );

// View engine
app.set( 'views', `${path.resolve( __dirname, '../views' )}` );
app.set( 'view engine', 'pug' );

// Lade die Statischen Datein in die Middleware
app.use( express.static( `${path.resolve( __dirname, '../../frontend' )}` ) );

// Meine eigenen Routes werden hier bekoant gemacht
app.use( '/api', rKnxAPI() );
app.use( '/web', rFrontend );
app.use( '/socket', rWebSocket() );

app.use( jsonServer.defaults() );
app.use( jsonServer.rewriter( {
  '/:bId/:rId': '/funktion?buildingId=:bId&roomId=:rId'
} ) );
app.use( jsonServer.router( './apiDB.json' ) );

// Error Handling
app.use( ( req, res ) => {
  res.type( 'text/plain' );
  res.status( 404 );
  res.send( '404 - Not Found' );
} );

app.use( ( err, req, res ) => {
  console.error( err.stack );
  res.type( 'text/plain' );
  res.status( 500 );
  res.send( '500 - Internal error' );
} );

app.listen( app.get( 'port' ), () => {
  console.log( `Express ready on http://localhost:${app.get( 'port' )}` );
} );
