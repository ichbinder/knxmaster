import fs from 'fs';
import path from 'path';
import PAScanner from './PAScanner';
import GaScanner from './GroupAddressScanner';
import GOAScanner from './GroupObjectAssociationScanner';
import GOScanner from './GroupObjectScanner';

// dies ist die Log-Datei. Alles was in dieser Log-Datei geschrieben wird wird ans
// Scan PA Frontend gesendet.
const FILE_TO_WATCH = path.resolve( __dirname, '../log/knxscan.log' );

/**
  * Diese Klasse Ist für das Scannen und die Zusamfügungn der gewonnenen Daten
  * in einer JSON-Datenbak verantwortlich. Hier vereinen sich die ganzen Klassen
  * um den KNX-Bus zu Scannen.
  @param kNXMapWrapper das verbindungs Objekt zum KNX-Bus
  @param deviceDB die JSON-Datenbak
  @param dbName Datenbank-Name in der JSON
**/
export default class KNXScan {
  constructor( kNXMapWrapper, deviceDB, dbName ) {
    this.kNXMapWrapper = kNXMapWrapper;
    this.db = deviceDB;
    this.dbName = dbName;
  }

  /**
    * Hier wird der Scan Proces gestartet.
    * Erst wird  der Bus  mit PAScanner auf PA's gescannt
    * GaScanner Scannt nach GA
    * GOAScanner Scannt nach GOA
    * GOScanner Scannt nach GA
    * @param physicalAddresse die KNX-Busteilnehmers die gescannt werden solen
    * @return true wenn es geklapt hat
  **/
  scan( physicalAddresse ) {
    return new Promise( ( resolve, reject ) => {
      const startScan = new PAScanner( this.kNXMapWrapper, this.db );
      startScan.scanKNXBus( physicalAddresse )
        .then( () => new GaScanner( this.kNXMapWrapper, this.db ).scanGroupAddress() )
        .then( () => new GOAScanner( this.kNXMapWrapper, this.db ).scanGrOAT() )
        .then( () => new GOScanner( this.kNXMapWrapper, this.db ).scanGrOT() )
        .then( () => resolve( true ) )
        .catch( error => reject( error ) );
    } );
  }

  /**
    * Die gescannten GA, GO, GOA und DPT werden verknüpft und gepeichert
  **/
  generateGOInDB() {
    return new Promise( ( resolve ) => {
      const result = this.db.get( this.dbName )
        .filter( i => {
          if ( i.ga ) return i;
          return false;
        } )
        .filter( i => {
          if ( i.groat ) return i;
          return false;
        } )
        .filter( i => {
          if ( i.grot ) return i;
          return false;
        } )
        .value();

      for ( let i = 0; i < result.length; i++ ) {
        const GrO = {};
        for ( let j = 0; j < Object.keys( result[i].groat ).length; j++ ) {
          if ( result[i].ga[result[i].groat[Object.keys( result[i].groat )[j]][0] - 1] ) {
            const GrOTmp = Object.keys( result[i].groat )[j];
            GrO[GrOTmp] = {};
            GrO[GrOTmp].DPT = result[i].grot[Object.keys( result[i].groat )[j]];
            console.log( result[i].grot[Object.keys( result[i].groat )[j]] );
            for ( let h = 0; h < result[i].groat[Object.keys( result[i].groat )[j]].length; h++ ) {
              if ( ! GrO[GrOTmp].ga ) GrO[GrOTmp].ga = [];
              GrO[GrOTmp].ga.push(
                result[i].ga[result[i].groat[Object.keys( result[i].groat )[j]][h] - 1]
              );
            }
          }
        }
        this.db.get( this.dbName )
          .find( { pa: result[i].pa } )
          .assign( { gro: GrO } )
          .write();
      }
      resolve( true );
    } );
  }

  /**
    * hiermit kann die Datenbank aufgereumt werden. Nach dem Scannen und dem Verküpfen
    * beiben unüze reste in der Datenbank die gläscht werden können.
  **/
  clearDB() {
    const result = this.db.get( this.dbName )
      .filter( i => {
        if ( i.ga ) return i;
        return false;
      } )
      .filter( i => {
        if ( i.groat ) return i;
        return false;
      } )
      .filter( i => {
        if ( i.grot ) return i;
        return false;
      } )
      .value();

    for ( let i = 0; i < result.length; i++ ) {
      this.db.get( this.dbName )
        .find( { pa: result[i].pa } )
        .unset( 'groat' )
        .write();
      this.db.get( this.dbName )
        .find( { pa: result[i].pa } )
        .unset( 'grot' )
        .write();
    }
    const logText = `
    ################################################
    ------------------------------------------------
    -------------Scan fertig!!!---------------------
    ------------------------------------------------
    ################################################
    `;
    console.log( logText );
    fs.writeFileSync( FILE_TO_WATCH, logText );
  }
}
