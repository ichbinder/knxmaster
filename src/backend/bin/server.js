import express from 'express';
import jsonServer from 'json-server';
import bodyParser from 'body-parser';
import path from 'path';
import eWs from 'express-ws';
import rKnxAPI from '../routes/rKnxapi';
import rFrontend from '../routes/rFrontend';

/**
  * Dies ist der Express-Server. Hiermit wird eine Rest-HTTP-API aufgebaut.
  * Die wichtigsten Einträge hier sind die Routen.
  * Die Route rKnxapi beinhaltet alles wichtige das die KNX API umsetzt.
  * Die rFrontend läde das Frontend also alles was mit React zu tun hat.
  **/


const expressWs = eWs( express() );
const app = expressWs.app;

// Lade Statik Datei
app.use( express.static( path.resolve( __dirname, '../static' ) ) );
app.set( 'port', process.env.PORT || 8020 );

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

// Lade JSON-Server
app.use( jsonServer.defaults() );
app.use( jsonServer.rewriter( {
  '/funktion/:search': '/ga?funktion=:search',
  '/suche/:search': '/ga?q=:search',
  '/dpt/:search': '/ga?DPT=:search',
  '/:bId/:rId': '/ga?gebaeude=:bId&raum=:rId',
  '/:bId': '/ga?gebaeude=:bId'
} ) );
app.use( jsonServer.router( path.resolve( __dirname, '../db/apiDB.json' ) ) );

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
