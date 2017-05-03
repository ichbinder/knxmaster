import fs from 'fs';
import path from 'path';
import num from './NumberConverter';

/**
  * Das auslesen der einzelenen GO der Busteilnehmer wird in der Master arbeit genuaer
  * erleutert. (Kapitel 4.6.3.2)
**/

// dies ist die Log-Datei. Alles was in dieser Log-Datei geschrieben wird wird ans
// Scan PA Frontend gesendet.
const FILE_TO_WATCH = path.resolve( __dirname, '../log/knxscan.log' );

// die KNX-Busteilnehmer Mask's die gescannt werden können auf GOAT.
const gaMask = {
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
  '0701': 6,
  5705: 6
};

/**
  * Diese Klasse Scannt den KAX-Busteilnehmer auf
  * Gruppen Objekt Tabels und wertet diese aus ums sie in die JSON-Datenbanken
  * zu Speicher.
  * @param kNXMapWrapper ist die verbindung über KnxMap zum KNX-Busteilnehmer
  * @param deviceDB die JSON-Datenbanken in die die Ergebnisse gespeichert werdne soll.
**/
export default class GroupObjectScanner {
  constructor( kNXMapWrapper, deviceDB ) {
    this.kNXMapWrapper = kNXMapWrapper;
    this.db = deviceDB;
  }

  /**
    * Diese Methode Iteriert über alle gefunden PA und öffnet die Jeweileige Methode
    * um die GOT aus den Jeweileige Speicherblöcken der Busteilnehmer zu hollen.
  **/
  scanGrOT() {
    return new Promise( ( resolve ) => {
      let logText = `
      ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
      ,,,,,,,,,,,,,  start GrOT scan ,,,,,,,,,,,,,
      ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
      `;
      console.log( logText );
      fs.writeFileSync( FILE_TO_WATCH, logText );
      const devPas = this.db.get( 'pas' )
        .filter( i => {
          if ( ! i.grot ) return i;
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
            -------------Typ: ${gaMask[devPas[sum].mask]}--------------
            ################################################
            `;
            console.log( logText );
            fs.writeFileSync( FILE_TO_WATCH, logText );
            if ( gaMask[devPas[sum].mask] === 1 ) {
              return _this._realisationType1( _this, devPas[sum].pa )
                .then( () => loop( ( sum += 1 ), stop ) );
            } else if ( gaMask[devPas[sum].mask] === 4 ) {
              return _this._realisationType7( _this, devPas[sum].pa )
                .then( () => loop( ( sum += 1 ), stop ) );
            } else if ( gaMask[devPas[sum].mask] === 5 ) {
              return _this._realisationType3GrOTEasy2( _this, devPas[sum].pa )
                .then( () => loop( ( sum += 1 ), stop ) );
            } else if ( gaMask[devPas[sum].mask] === 6 ) {
              return _this._realisationType3GrOTEasy3( _this, devPas[sum].pa )
                .then( () => loop( ( sum += 1 ), stop ) );
            }
            return new Promise( ( resolveLoop ) => resolveLoop( true ) )
              .then( () => {
                logText = `keine GrO für ${devPas[sum].pa} gefunden!!!`;
                console.log( logText );
                fs.writeFileSync( FILE_TO_WATCH, logText );
                return loop( ( sum += 1 ), stop );
              } );
          }
        } )( 0, devPas.length )
          .then( () => {
            console.log( 'GrOT Done' );
            resolve( true );
          } );
      } else {
        logText = 'GrOT: keine pa musste bearbeitet werden.';
        console.log( logText );
        fs.writeFileSync( FILE_TO_WATCH, logText );
        resolve( false );
      }
    } );
  }

  /**
    * Realisation Type 1 werdne auf GO gescant
  **/
  _realisationType1( _this, devPa ) {
    let grAssocTabPtrTmp = null;
    return _this.kNXMapWrapper.memoryRead( devPa, '0x0112', 1 )
      .then( grAssocTabPtr => {
        grAssocTabPtrTmp = num.dez2hex( num.hex2dez( '100' ) + num.hex2dez( grAssocTabPtr ) );
        console.log( 'grAssocTabPtr:', grAssocTabPtr );
        if ( !grAssocTabPtr )
          return new Promise( ( resolve ) => resolve( false ) );
        return _this.kNXMapWrapper
          .memoryRead(
            devPa,
            grAssocTabPtrTmp
          );
      } )
      .then( countGO => {
        console.log( 'countGO:', countGO );
        console.log( 'Typ1 countgo:', countGO );
        fs.writeFileSync( FILE_TO_WATCH, `Typ1 countgo: ${countGO}` );
        if ( !countGO )
          return new Promise( ( resolve ) => resolve( false ) );
        return _this._readGotFromMemory(
          _this,
          _this._addMemoryAddress( grAssocTabPtrTmp, 2 ),
          num.hex2dez( countGO ) * 3,
          devPa
        );
      } )
      .then( memoryGrotDump => {
        console.log( memoryGrotDump );
        if ( !memoryGrotDump )
          return new Promise( ( resolve ) => resolve( false ) );
        const splitter = 6;
        const countGOT = memoryGrotDump.length / splitter;
        const grotArray = [];
        for ( let i = 0; i < countGOT; i += 1 ) {
          const grot = memoryGrotDump.substring( i * splitter, ( i + 1 ) * splitter );
          const bitGrot = num.hex2bin( grot.substring( 4, splitter ) );
          const DPT = num.bin2dez( bitGrot.substring( 2, 8 ) );
          grotArray.push( DPT );
        }
        console.log( grotArray );
        _this.db.get( 'pas' )
          .find( { pa: devPa } )
          .assign( { grot: grotArray } )
          .write();
        return new Promise( ( resolve ) => resolve( true ) );
      } );
  }

  /**
    * Realisation Type 7 werdne auf GOA gescant
  **/
  _realisationType7( _this, devPa ) {
    let gotMemoryAddressTmp = '';
    return _this.kNXMapWrapper.propertyValueRead( devPa, 7, 3 )
      .then( grotMemoryAddress => {
        gotMemoryAddressTmp = grotMemoryAddress;
        if ( !grotMemoryAddress )
          return new Promise( ( resolve ) => resolve( false ) );
        return _this.kNXMapWrapper
          .memoryRead( devPa, grotMemoryAddress, 2 );
      } )
      .then( countGOT => {
        if ( !countGOT )
          return new Promise( ( resolve ) => resolve( false ) );
        return _this._readGotFromMemory(
          _this,
          _this._addMemoryAddress( gotMemoryAddressTmp, 2 ),
          num.hex2dez( countGOT ) * 2,
          devPa
        );
      } )
      .then( memoryGrotDump => {
        console.log( memoryGrotDump );
        if ( !memoryGrotDump )
          return new Promise( ( resolve ) => resolve( false ) );
        _this._saveGot( _this, memoryGrotDump, devPa, 4 );
        return new Promise( ( resolve ) => resolve( true ) );
      } );
  }

  /**
    * Realisation Type 3 GrOTEasy 2 werdne auf GO gescant
  **/
  _realisationType3GrOTEasy2( _this, devPa ) {
    let gaMemoryAddressTmp = '';
    return _this.kNXMapWrapper.propertyValueRead( devPa, 7, 3 )
      .then( gaMemoryAddress => {
        gaMemoryAddressTmp = gaMemoryAddress;
        if ( !gaMemoryAddress )
          return new Promise( ( resolve ) => resolve( false ) );
        return _this.kNXMapWrapper
          .memoryRead( devPa, gaMemoryAddress, 1 );
      } )
      .then( countGa => {
        if ( !countGa )
          return new Promise( ( resolve ) => resolve( false ) );
        return _this._readGotFromMemory(
          _this,
          _this._addMemoryAddress( gaMemoryAddressTmp, 2 ),
          num.hex2dez( countGa ) * 3,
          devPa
        );
      } )
      .then( memoryGrotDump => {
        console.log( memoryGrotDump );
        if ( !memoryGrotDump )
          return new Promise( ( resolve ) => resolve( false ) );
        const splitter = 6;
        const countGOT = memoryGrotDump.length / splitter;
        const grotArray = [];
        for ( let i = 0; i < countGOT; i += 1 ) {
          const grot = memoryGrotDump.substring( i * splitter, ( i + 1 ) * splitter );
          const bitGrot = num.hex2bin( grot.substring( 4, splitter ) );
          const DPT = num.bin2dez( bitGrot.substring( 2, 8 ) );
          grotArray.push( DPT );
        }
        console.log( grotArray );
        _this.db.get( 'pas' )
          .find( { pa: devPa } )
          .assign( { grot: grotArray } )
          .write();
        return new Promise( ( resolve ) => resolve( true ) );
      } );
  }

  /**
    * Realisation Type 3 GrOTEasy 3 werdne auf GO gescant
  **/
  _realisationType3GrOTEasy3( _this, devPa ) {
    return new Promise( ( resolve, reject ) => {
      let gaMemoryAddressTmp = '';
      return _this.kNXMapWrapper.propertyValueRead( devPa, 7, 3 )
        .then( gaMemoryAddress => {
          gaMemoryAddressTmp = gaMemoryAddress;
          if ( !gaMemoryAddress )
            return resolve( false );
          return _this.kNXMapWrapper
            .memoryRead( devPa, gaMemoryAddress, 1 );
        } )
        .then( countGa => {
          console.log( 'countGa', countGa );
          if ( !countGa )
            return resolve( false );
          return _this._readGotFromMemory(
            _this,
            _this._addMemoryAddress( gaMemoryAddressTmp, 3 ),
            num.hex2dez( countGa ) * 4,
            devPa
          );
        } )
        .then( memoryGrotDump => {
          console.log( 'memoryGrotDump', memoryGrotDump );
          if ( !memoryGrotDump )
            return resolve( false );
          const splitter = 8;
          const countGOT = memoryGrotDump.length / splitter;
          const grotArray = [];
          for ( let i = 0; i < countGOT; i += 1 ) {
            const grot = memoryGrotDump.substring( i * splitter, ( i + 1 ) * splitter );
            const bitGrot = num.hex2bin( grot.substring( 6, splitter ) );
            const DPT = num.bin2dez( bitGrot.substring( 2, 8 ) );
            grotArray.push( DPT );
          }
          console.log( grotArray );
          _this.db.get( 'pas' )
            .find( { pa: devPa } )
            .assign( { grot: grotArray } )
            .write();
          return resolve( true );
        } )
        .catch( err => reject( err ) );
    } );
  }

  /**
    * Hier werden die GOT aus dem Speicher der jeweiligen KNX-Busteilnehmer gelesen,
    * da offt nur 12 HEX Strings auf einmal aus einem KNX-Busteilnehmer gelesen werden
    * können, muss die zu lesende Megen aufgeteilt werden und geschaut werden ob
    * sie grösser ist als 12.
  **/
  _readGotFromMemory( _this, memAddress, addressCount, devPa ) {
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
                .then( memoryGrotDump => {
                  console.log( 'mehr als 12 memdump:', memoryGrotDump );
                  fs.writeFileSync( FILE_TO_WATCH, `mehr als 12 memdump: ${memoryGrotDump}` );
                  gaResolve += memoryGrotDump;
                  stop -= 12;
                  memAddress = _this._addMemoryAddress( memAddress, 12 );
                  return loop( sum, stop );
                } );
          return _this.kNXMapWrapper
            .memoryRead( devPa, memAddress, stop )
              .then( memoryGrotDump => {
                console.log( 'wehniger als 12 memdump:', memoryGrotDump );
                fs.writeFileSync( FILE_TO_WATCH, `wehniger als 12 memdump: ${memoryGrotDump}` );
                gaResolve += memoryGrotDump;
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
    * Die gelesenen GO des jeweileigen KNX-Busteilnehmers werden in die Scann JSON-Datenbanken
    * gespeichert.
  **/
  _saveGot( _this, memoryGrotDump, devPa, splitter ) {
    const countGOT = memoryGrotDump.length / splitter;
    const grotArray = [];
    for ( let i = 0; i < countGOT; i += 1 ) {
      const grot = memoryGrotDump.substring( i * splitter, ( i + 1 ) * splitter );
      const DPT = num.hex2dez( grot.substring( splitter / 2, splitter ) );
      grotArray.push( DPT );
    }
    console.log( grotArray );
    _this.db.get( 'pas' )
      .find( { pa: devPa } )
      .assign( { grot: grotArray } )
      .write();
    fs.writeFileSync( FILE_TO_WATCH, `Die GO wurde gespeicher: ${grotArray}` );
  }

  /**
    * Die gelesenen GA aus einem RT1 des jeweileigen KNX-Busteilnehmers werden
    * in die Scann JSON-Datenbanken gespeichert.
  **/
  _saveGotRT1( _this, memoryGrotDump, devPa, splitter ) {
    const countGOT = memoryGrotDump.length / splitter;
    const grotArray = [];
    for ( let i = 0; i < countGOT; i += 1 ) {
      const grot = memoryGrotDump.substring( i * splitter, ( i + 1 ) * splitter );
      const DPT = num.hex2dez( grot.substring( splitter / 2, splitter ) );
      grotArray.push( DPT );
    }
    console.log( grotArray );
    _this.db.get( 'pas' )
      .find( { pa: devPa } )
      .assign( { grot: grotArray } )
      .write();
    fs.writeFileSync( FILE_TO_WATCH, `Die GO wurde gespeicher: ${grotArray}` );
  }

  /**
    * Adiert zu einem Memory Adresse eine wert um zu einer anderen Memory adresse zu kommen.
  **/
  _addMemoryAddress( memAddress, dez ) {
    console.log( 'memAddress:', memAddress );
    fs.writeFileSync( FILE_TO_WATCH, `memAddress: ${memAddress}` );
    console.log( 'memAddress + dez -> hex:', num.dez2hex( num.hex2dez( memAddress ) + dez ) );
    fs.writeFileSync( FILE_TO_WATCH,
      `memAddress + dez -> hex: ${num.dez2hex( num.hex2dez( memAddress ) + dez )}` );
    return num.dez2hex( num.hex2dez( memAddress ) + dez );
  }
}
