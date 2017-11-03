import express from 'express';
import low from 'lowdb';
import fs from 'fs';
import path from 'path';
import KNXConnector from '../knx/KNXConnector';
import KnxMap from '../knx/KNXMapWrapper';
import KNXScan from '../knx/KNXScan';

// dies ist die Log-Datei. Alles was in dieser Log-Datei geschrieben wird wird ans
// Scan PA Frontend gesendet.
const FILE_TO_WATCH = path.resolve( __dirname, '../log/knxscan.log' );

// Hier muss die IP des KNX-Routers eingetragen werden.
const IP = '141.45.187.222';
// const IP = '192.168.3.110';

// der Path zu den JSON-Datenbanken
const dbKnxBus = low( path.resolve( __dirname, '../db/knxbusDB.json' ) );
const apiDB = low( path.resolve( __dirname, '../db/apiDB.json' ) );

// Folgende DPT sind erlaubt
const dptTable = { DPT1: 0, DPT3: 3, DPT5: 7 };

// Inizialiesierung der JSON-Datenbanken
dbKnxBus.defaults( { pas: [] } )
  .write();

apiDB.defaults( { ga: [] } )
  .write();

export default function create( ) {
  const router = new express.Router();

  KNXConnector.create( IP )
    .then( ( connection ) => {
      /**
        * Mit dieser Route ist es möglich direckt mit dem KNX-Bus zu komunizieren.
        * connection.write - Etwas auf den KNX Bus senden
        * connection.on - auf dem KNX bus horchen ob etwas kommt als
        * GroupValue_Response nur zum testen.
        * connection.read - versucht eine Response ab zufangen, das klappt aber
        * er nur bei alten geräten
      **/
      router.post( '/writeDpt', ( req, res ) => {
        // console.log( req.body.ga, req.body.value, req.body.dpt );
        connection.write( req.body.ga, req.body.value, req.body.dpt );
        let timeOut = false;
        setTimeout( () => { timeOut = true; res.json( { error: 'no connection.' } ); }, 3000 );
        connection.on( 'GroupValue_Response', ( src, value ) => {
          console.log( 'src', src, 'valueDPT', value );
        } );
        connection.read( req.body.ga, ( src, valueDPT ) => {
          console.log( 'src', src, 'valueDPT', valueDPT );
          if ( !timeOut )
            res.json( {
              pa: src,
              value: valueDPT
            } );
          else {
            console.log( 'Timeout for:', req.body.ga,
              'DPT:', req.body.dpt, 'Value:', req.body.value );
          }
        } );
      } );

      /**
        * Dies ist der BusMonitor. Die daten werden per Websoket an die webseitet geschickt.
      **/
      router.ws( '/busMonitor', ( ws, req ) => {
        connection.on( 'event', ( evt, src, dest, value ) => {
          const hexValue = new Buffer( value, 'hex' ).toString( 'hex' );
          ws.send(
            `KNX EVENT: ${evt}, src: ${src}, dest: ${dest}, value: ${hexValue}`
          );
        } );
        ws.on( 'message', ( msg ) => {
          console.log( 'yes2!' );
          ws.send( msg );
        } );
        console.log( 'socket', req.testing );
      } );
    } )
    .catch( err => console.log( 'Error ws:', err ) );

  /**
    * Bei dieser Funktion wird die LogFile per Websoket an die webseite geschickt.
  **/
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
      console.log( 'yes1!' );
      ws.send( msg );
    } );
    console.log( 'socket', req.testing );
  } );

  /**
    * Hier wird der Scan Proces gestartet.
    * Erst wird  der Bus  mit knxScan.scan auf: GA, GO und DPT gescannt.
    * Als nächstes werden die gesamelten Daten verarbeitet in knxScan.generateGOInDB.
    * Dann wird die JSON-Datenbanken gereinigt von allten Daten in  knxScan.clearDB.
  **/
  router.post( '/scanKnx', ( req, res ) => {
    if ( ! req.body.phyAddress )
      res.send( 'error: pleas tip phyAddress.' );
    else {
      const knxConnect = new KnxMap( IP );
      const knxScan = new KNXScan( knxConnect, dbKnxBus, 'pas' );
      knxScan.scan( req.body.phyAddress )
        .then( ( ) => knxScan.generateGOInDB() )
        .then( ( ) => knxScan.clearDB() )
        .then( () => res.send( 'ok' ) )
        .catch( error => console.log( error ) );
    }
  } );

  /**
    * Es gibt zwei JSON-Datenbanken.
    * Eine für die gescannten Daten und eine für die eingeben der Benutzer.
    * In dieser Funktion werden beide JSON-Datenbanken zusammen gebracht und dann an den
    * Benutzer (Webseite) geschickt.
    * Dabei wird so vorgegangen. Erst wird geguckt ob es Daten zu einer bestimmten GR gibt
    * in der Benuter Datenbake und wenn nicht werden die unfolstendingen aus der Scan DB genommen.
  **/
  router.get( '/getAllGaOfDPT', ( req, res ) => {
    const arrayGA = [];
    const result = dbKnxBus.get( 'pas' )
      .map( 'gro' )
      .filter( Boolean )
      .value();
    for ( let i = 0; i < Object.keys( result ).length; i++ ) {
      const keys = Object.keys( result[i] );
      for ( let j = 0; j < keys.length; j++ ) {
        if ( result[i][keys[j]].DPT === parseInt( req.query.dpt, 10 ) ) {
          for ( let h = 0; h < result[i][keys[j]].ga.length; h++ )
            if ( arrayGA.indexOf( result[i][keys[j]].ga[h] ) === -1 )
              arrayGA.push( result[i][keys[j]].ga[h] );
        }
      }
    }
    const building = apiDB.get( 'ga' )
      .filter( Boolean )
      .value();

    const dptRaw = Object.keys( dptTable ).map( k => dptTable[k] );
    const buildingTmp = [];
    const dptKey = Object.keys( dptTable )[dptRaw.indexOf( parseInt( req.query.dpt, 10 ) )];
    const antiDuplikat = [];
    for ( let i = 0; i < building.length; i++ ) {
      if ( buildingTmp.indexOf( building[i] ) === -1 ) {
        if ( building[i].DPT === dptKey ) {
          buildingTmp.push( {
            ga: building[i].ga,
            DPT: building[i].DPT,
            gebaeude: building[i].gebaeude,
            raum: building[i].raum,
            funktion: building[i].funktion,
            kommentar: building[i].kommentar
          } );
          antiDuplikat.push( building[i].ga );
        }
      }
    }
    // console.log( Object.keys( dptTable )[parseInt( req.query.dpt, 10 )] );
    for ( let j = 0; j < arrayGA.length; j++ ) {
      if ( antiDuplikat.indexOf( arrayGA[j] ) === -1 ) {
        buildingTmp.push( {
          ga: arrayGA[j],
          DPT: Object.keys( dptTable )[dptRaw.indexOf( parseInt( req.query.dpt, 10 ) )],
          gebaeude: '',
          raum: '',
          funktion: '',
          kommentar: ''
        } );
      }
    }
    res.send( { building: buildingTmp } );
  } );

  /**
    * Hier werden die zusatz Daten in die Benutzer Datenbake gespeichert.
    * Gebaeude, Raum, Funktion, Kommentar, ga, DPT, werden gespeichert.
    * Dabie wird daruf geachtet ob es schon einen Beitrag gibt für die GA oder nicht.
    * Update oder Neu erstellen.
  **/
  router.post( '/saveGa', ( req, res ) => {
    const errorDB = { error: '' };
    if ( !req.body.ga )
      errorDB.error += ' Bitte ga eingeben. ';
    if ( !req.body.DPT )
      errorDB.error += ' Bitte DPT eingeben. ';
    if ( !req.body.gebaeude )
      errorDB.error += ' Bitte gebaeude eingeben. ';
    if ( !req.body.raum )
      errorDB.error += ' Bitte raum eingeben. ';
    if ( !req.body.funktion )
      errorDB.error += ' Bitte funktion eingeben. ';
    if ( !req.body.kommentar )
      req.body.kommentar = '';

    if ( errorDB.error === '' ) {
      if ( !apiDB.get( 'ga' ).find( { ga: req.body.ga } ).value() ) {
        apiDB.get( 'ga' )
          .push( {
            ga: req.body.ga,
            DPT: req.body.DPT,
            gebaeude: req.body.gebaeude,
            raum: req.body.raum,
            funktion: req.body.funktion,
            kommentar: req.body.kommentar
          } )
          .write();
      } else {
        apiDB.get( 'ga' )
          .find( { ga: req.body.ga } )
          .assign( {
            DPT: req.body.DPT,
            gebaeude: req.body.gebaeude,
            raum: req.body.raum,
            funktion: req.body.funktion,
            kommentar: req.body.kommentar
          } )
          .write();
      }

      res.json( { msg: 'save ok!' } );
    } else
      res.json( errorDB );
  } );

  return router;
}
