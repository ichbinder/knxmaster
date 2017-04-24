import express from 'express';
import fs from 'fs';
import path from 'path';

const FILE_TO_WATCH = path.resolve( __dirname, '../log/knxscan.log' );

export default function create( ) {
  const router = new express.Router();
  router.ws( '/getScanResoult', ( ws, req ) => {
    console.log( 'New connection has opened!' );
    fs.watch( FILE_TO_WATCH, ( eventType, filename ) => {
      if ( filename ) {
        fs.readFile( FILE_TO_WATCH, 'utf8', ( err, data ) => {
          if ( err ) {
            console.log( 'err:', err );
          }
          ws.send( data );
        } );
      } else {
        console.log( filename );
      }
    } );
    ws.on( 'message', ( msg ) => {
      console.log( 'yes!' );
      ws.send( msg );
    } );
    console.log( 'socket', req.testing );
  } );
  return router;
}
