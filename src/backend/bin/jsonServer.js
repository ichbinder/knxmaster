import jsonServer from 'json-server';
import path from 'path';
import express from 'express';
import rKnxAPI from '../routes/rKnxapi';

const server = jsonServer.create();
const router = jsonServer.router( 'knxbusDB.json' );
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors and no-cache)
server.use( middlewares );
server.set( 'views', `${path.resolve( __dirname, '../views' )}` );
server.set( 'view engine', 'pug' );

server.use( express.static( `${path.resolve( __dirname, '../../frontend' )}` ) );

server.set( 'port', process.env.PORT || 8007 );

// Add custom routes before JSON Server router
server.get( '/echo', ( req, res ) => {
  res.jsonp( req.query );
} );

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use( jsonServer.bodyParser );

// Use default router
server.use( router );
server.use( '/knxapi', rKnxAPI );

// Error Handling
server.use( ( req, res ) => {
  res.type( 'text/plain' );
  res.status( 404 );
  res.send( '404 - Not Found' );
} );

server.use( ( err, req, res ) => {
  console.error( err.stack );
  res.type( 'text/plain' );
  res.status( 500 );
  res.send( '500 - Internal error' );
} );

server.listen( server.get( 'port' ), () => {
  console.log( `Express ready on http://localhost:${server.get( 'port' )}` );
} );
