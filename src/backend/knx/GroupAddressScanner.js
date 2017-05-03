import fs from 'fs';
import path from 'path';
import gac from './GroupAddressConverter';
import num from './NumberConverter';

/**
  * Das auslesen der einzelenen GA der Busteilnehmer wird in der Master arbeit genuaer
  * erleutert. (Kapitel 4.6.3.1)
**/

// dies ist die Log-Datei. Alles was in dieser Log-Datei geschrieben wird wird ans
// Scan PA Frontend gesendet.
const FILE_TO_WATCH = path.resolve( __dirname, '../log/knxscan.log' );

// die KNX-Busteilnehmer Mask's die gescannt werden können auf GA.
const gaStartAddress = {
  '0010': 1,
  '0011': 1,
  '0012': 1,
  '0013': 1,
  1012: 1,
  1013: 1,
  3012: 1,
  4012: 1,
  '07b0': 4,
  '07B0': 4,
  '0020': 5,
  '0021': 5,
  '0701': 5
};

/**
  * Diese Klasse Scannt den KAX-Busteilnehmer auf GA
  * @param kNXMapWrapper ist die verbindung über KnxMap zum KNX-Busteilnehmer
  * @param deviceDB die JSON-Datenbanken in die die Ergebnisse gespeichert werdne soll.
**/
export default class GoupAddressScaner {
  constructor( kNXMapWrapper, deviceDB ) {
    this.kNXMapWrapper = kNXMapWrapper;
    this.db = deviceDB;
  }

/**
  * Diese Methode Iteriert über alle gefunden PA und öffnet die Jeweileige Methode
  * um die GA aus den Jeweileige Speicherblöcken der Busteilnehmer zu hollen.
**/
  scanGroupAddress() {
    return new Promise( ( resolve ) => {
      let logText = `
      ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
      ,,,,,,,,,,,,,  start GAT scan ,,,,,,,,,,,,,
      ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
      `;
      console.log( logText );
      fs.writeFileSync( FILE_TO_WATCH, logText );
      const devPas = this.db.get( 'pas' )
        .filter( i => {
          if ( ! i.ga ) return i;
          return false;
        } )
        .value();
      if ( devPas.length > 0 ) {
        const _this = this;
        ( function loop( sum, stop ) {
          if ( sum < stop ) {
            logText = `
            ################################################
            -------------PA: ${devPas[sum].pa}--------------
            -------------Mask: ${devPas[sum].mask}--------------
            -------------Typ: ${gaStartAddress[devPas[sum].mask]}--------------
            ################################################
            `;
            console.log( logText );
            fs.writeFileSync( FILE_TO_WATCH, logText );
            if ( gaStartAddress[devPas[sum].mask] === 1 ) {
              return _this._realisationType1Until5( _this, devPas[sum].pa )
                .then( () => loop( ( sum += 1 ), stop ) );
            } else if ( gaStartAddress[devPas[sum].mask] === 4 ) {
              return _this._realisationType7( _this, devPas[sum].pa )
                .then( () => loop( ( sum += 1 ), stop ) );
            } else if ( gaStartAddress[devPas[sum].mask] === 5 ) {
              return _this._realisationType3GrATEasy2( _this, devPas[sum].pa )
                .then( () => loop( ( sum += 1 ), stop ) );
            }
            return new Promise( ( resolveLoop ) => resolveLoop( true ) )
              .then( () => {
                logText = `keine GrA für ${devPas[sum].pa} gefunden!!!`;
                console.log( logText );
                fs.writeFileSync( FILE_TO_WATCH, logText );
                return loop( ( sum += 1 ), stop );
              } );
          }
        } )( 0, devPas.length ).then( () => {
          console.log( 'GrATDone' );
          resolve( true );
        } );
      } else {
        logText = 'GrA: keine pa musste bearbeitet werden.';
        console.log( logText );
        fs.writeFileSync( FILE_TO_WATCH, logText );
        resolve( false );
      }
    } );
  }

  /**
    * Realisation Type 1 bis 5 werdne auf GA gescant
  **/
  _realisationType1Until5( _this, devPa ) {
    return _this.kNXMapWrapper.memoryRead( devPa, '0x0116', 1 )
        .then( countGa => {
          console.log( 'Typ1 countga:', countGa );
          fs.writeFileSync( FILE_TO_WATCH, `Typ1 countga: ${countGa}` );
          if ( !countGa )
            return new Promise( ( resolve ) => resolve( false ) );
          return _this.kNXMapWrapper
            .memoryRead(
              devPa,
              _this._addMemoryAddress( '0x0116', 3 ),
              ( num.hex2dez( countGa ) - 1 ) * 2
            );
        } )
        .then( memoryGaDump => {
          if ( !memoryGaDump )
            return new Promise( ( resolve ) => resolve( false ) );
          _this._saveGa( _this, memoryGaDump, devPa );
          return new Promise( ( resolve ) => resolve( true ) );
        } );
  }

  /**
    * Realisation Type 3 GrATEasy 2 werdne auf GA gescant
  **/
  _realisationType3GrATEasy2( _this, devPa ) {
    let gaMemoryAddressTmp = '';
    return _this.kNXMapWrapper.propertyValueRead( devPa, 7, 1 )
      .then( gaMemoryAddress => {
        gaMemoryAddressTmp = gaMemoryAddress;
        console.log( 'gaMemoryAddress', gaMemoryAddress );
        if ( !gaMemoryAddress )
          return new Promise( ( resolve ) => resolve( false ) );
        return _this.kNXMapWrapper
          .memoryRead( devPa, gaMemoryAddress, 1 );
      } )
      .then( countGa => {
        console.log( 'Typ3 countGa', countGa );
        if ( !countGa )
          return new Promise( ( resolve ) => resolve( false ) );
        return _this._readGaFromMemory(
          _this,
          _this._addMemoryAddress( gaMemoryAddressTmp, 3 ),
          ( num.hex2dez( countGa ) - 1 ) * 2,
          devPa
        );
      } )
      .then( memoryGaDump => {
        console.log( memoryGaDump );
        if ( !memoryGaDump )
          return new Promise( ( resolve ) => resolve( false ) );
        _this._saveGa( _this, memoryGaDump, devPa );
        return new Promise( ( resolve ) => resolve( true ) );
      } );
  }

  /**
    * Realisation Type 7 werdne auf GA gescant
  **/
  _realisationType7( _this, devPa ) {
    return new Promise( ( resolve, reject ) => {
      let gaMemoryAddressTmp = '';
      _this.kNXMapWrapper.propertyValueRead( devPa, 7, 1 )
        .then( gaMemoryAddress => {
          gaMemoryAddressTmp = gaMemoryAddress;
          if ( !gaMemoryAddress )
            return resolve( false );
          return _this.kNXMapWrapper
            .memoryRead( devPa, gaMemoryAddress, 2 );
        } )
        .then( countGa => {
          console.log( 'Anzahl der GA:', countGa );
          fs.writeFileSync( FILE_TO_WATCH, `Anzahl der GA: ${countGa}` );
          if ( !countGa )
            return resolve( false );
          return _this._readGaFromMemory(
            _this,
            _this._addMemoryAddress( gaMemoryAddressTmp, 2 ),
            num.hex2dez( countGa ) * 2,
            devPa
          );
        } )
        .then( memoryGaDump => {
          console.log( memoryGaDump );
          if ( !memoryGaDump )
            return resolve( false );
          _this._saveGa( _this, memoryGaDump, devPa );
          return resolve( true );
        } )
        .catch( error => reject( error ) );
    } );
  }

  /**
    * Hier werden die GA aus dem Speicher der jeweiligen KNX-Busteilnehmer gelesen,
    * da offt nur 12 HEX Strings auf einmal aus einem KNX-Busteilnehmer gelesen werden
    * können, muss die zu lesende Megen aufgeteilt werden und geschaut werden ob
    * sie grösser ist als 12.
  **/
  _readGaFromMemory( _this, memAddress, addressCount, devPa ) {
    return new Promise( ( resolve ) => {
      let gaResolve = '';
      console.log( 'addressCount', addressCount );
      fs.writeFileSync( FILE_TO_WATCH, `addressCount: ${addressCount}` );
      if ( !( addressCount > 0 ) || addressCount === null )
        return resolve( false );
      ( function loop( sum, stop ) {
        if ( sum < stop ) {
          if ( stop > 12 )
            return _this.kNXMapWrapper
              .memoryRead( devPa, memAddress, 12 )
                .then( memoryGaDump => {
                  console.log( 'mehr als 12 memdump:', memoryGaDump );
                  fs.writeFileSync( FILE_TO_WATCH, `mehr als 12 memdump: ${memoryGaDump}` );
                  gaResolve += memoryGaDump;
                  stop -= 12;
                  memAddress = _this._addMemoryAddress( memAddress, 12 );
                  return loop( sum, stop );
                } );
          return _this.kNXMapWrapper
            .memoryRead( devPa, memAddress, stop )
              .then( memoryGaDump => {
                console.log( 'wehniger als 12 memdump:', memoryGaDump );
                fs.writeFileSync( FILE_TO_WATCH, `wehniger als 12 memdump: ${memoryGaDump}` );
                gaResolve += memoryGaDump;
                stop -= 12;
                resolve( gaResolve );
                return loop( sum, stop );
              } );
        }
      } )( 0, addressCount )
        .then( () => console.log( 'Done' ) );
    } );
  }

  /**
    * Die gelesenen GA des jeweileigen KNX-Busteilnehmers werden in die Scann JSON-Datenbanken
    * gespeichert.
  **/
  _saveGa( _this, memoryGaDump, devPa ) {
    console.log( 'memoryGaDump to length:', memoryGaDump.length / 4 );
    const countGa = memoryGaDump.length / 4;
    const gaArray = [];
    for ( let i = 0; i < countGa; i += 1 ) {
      const ga = gac.hexToGa( memoryGaDump.substring( i * 4, ( i + 1 ) * 4 ) );
      gaArray.push( ga );
    }
    console.log( gaArray );
    _this.db.get( 'pas' )
      .find( { pa: devPa } )
      .assign( { ga: gaArray } )
      .write();
    fs.writeFileSync( FILE_TO_WATCH, `Die GA wurde gespeicher: ${gaArray}` );
  }

  /**
    * Adiert zu einem Memory Adresse eine wert um zu einer anderen Memory adresse zu kommen.
  **/
  _addMemoryAddress( memAddress, dez ) {
    console.log( 'memAddress:', memAddress );
    fs.writeFileSync( FILE_TO_WATCH, `memAddress: ${memAddress}` );
    console.log( 'memAddress + dez:', num.hex2dez( memAddress ) + dez );
    console.log( 'memAddress + dez -> hex:', num.dez2hex( num.hex2dez( memAddress ) + dez ) );
    fs.writeFileSync( FILE_TO_WATCH,
      `memAddress + dez -> hex: ${num.dez2hex( num.hex2dez( memAddress ) + dez )}` );
    return num.dez2hex( num.hex2dez( memAddress ) + dez );
  }
}
