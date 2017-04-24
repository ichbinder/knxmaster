import fs from 'fs';
import path from 'path';
import num from './NumberConverter';

const FILE_TO_WATCH = path.resolve( __dirname, '../log/knxscan.log' );

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
  '0020': 6,
  '0021': 6,
  '0701': 6,
  5705: 6
};

export default class GroupObjectAssociationScanner {
  constructor( kNXMapWrapper, deviceDB ) {
    this.kNXMapWrapper = kNXMapWrapper;
    this.db = deviceDB;
  }

  scanGrOAT() {
    return new Promise( ( resolve, reject ) => {
      let logText = `
      ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
      ,,,,,,,,,,,,,  start GrOAT scan ,,,,,,,,,,,,,
      ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
      `;
      console.log( logText );
      fs.writeFileSync( FILE_TO_WATCH, logText );
      const devPas = this.db.get( 'pas' )
        .filter( i => {
          if ( ! i.groat ) return i;
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
              return _this._realisationType6SystemB( _this, devPas[sum].pa )
                .then( () => loop( ( sum += 1 ), stop ) );
            } else if ( gaMask[devPas[sum].mask] === 6 ) {
              return _this._realisationType3GrOATEasy3( _this, devPas[sum].pa )
                .then( () => loop( ( sum += 1 ), stop ) );
            }
            return new Promise( ( resolveLoop ) => resolveLoop( true ) )
              .then( () => {
                logText = `keine GrOA für ${devPas[sum].pa} gefunden!!!`;
                console.log( logText );
                fs.writeFileSync( FILE_TO_WATCH, logText );
                return loop( ( sum += 1 ), stop );
              } );
          }
        } )( 0, devPas.length )
          .then( () => {
            console.log( 'GrOAT Done' );
            resolve( true );
          } )
          .catch( error => reject( error ) );
      } else {
        logText = 'GrOAT: keine pa musste bearbeitet werden.';
        console.log( logText );
        fs.writeFileSync( FILE_TO_WATCH, logText );
        resolve( false );
      }
    } );
  }

  _realisationType1( _this, devPa ) {
    return new Promise( ( resolve, reject ) => {
      let grAssocTabPtrTmp = null;
      return _this.kNXMapWrapper.memoryRead( devPa, '0x0111', 1 )
        .then( grAssocTabPtr => {
          grAssocTabPtrTmp = num.dez2hex( num.hex2dez( '100' ) + num.hex2dez( grAssocTabPtr ) );
          console.log( 'grAssocTabPtr:', grAssocTabPtr );
          if ( !grAssocTabPtr )
            return resolve( false );
          return _this.kNXMapWrapper
            .memoryRead(
              devPa,
              grAssocTabPtrTmp
            );
        } )
        .then( countGOA => {
          console.log( 'Typ1 countgoa:', countGOA );
          fs.writeFileSync( FILE_TO_WATCH, `Typ1 countgoa: ${countGOA}` );
          if ( !countGOA )
            return resolve( false );
          return _this._readGoatFromMemory(
            _this,
            _this._addMemoryAddress( grAssocTabPtrTmp, 1 ),
            num.hex2dez( countGOA ) * 2,
            devPa
          );
        } )
        .then( memoryGoatDump => {
          console.log( memoryGoatDump );
          if ( !memoryGoatDump )
            return resolve( false );
          _this._saveGoat( _this, memoryGoatDump, devPa, 4 );
          return resolve( true );
        } )
        .catch( error => reject( error ) );
    } );
  }

/**
  Man bekommet den Group Objekt Association Table Pointer (Goatp) in dem man
  die propertyValue 7 an der Stelle 2 ausliest.
  Dann kann man mit dem dem Goatp die grösse der Rable auslesen.
  Mit der gösse kann dann angefangen werden die Association aus zu lesen.
**/
  _realisationType6SystemB( _this, devPa ) {
    let goatMemoryAddressTmp = '';
    return _this.kNXMapWrapper.propertyValueRead( devPa, 7, 2 )
      .then( goatMemoryAddress => {
        if ( !goatMemoryAddress )
          return new Promise( ( resolve ) => resolve( false ) );
        goatMemoryAddressTmp = goatMemoryAddress;
        return _this.kNXMapWrapper
          .memoryRead( devPa, goatMemoryAddress, 2 );
      } )
      .then( countGa => {
        if ( !countGa )
          return new Promise( ( resolve ) => resolve( false ) );
        return _this._readGoatFromMemory(
          _this,
          _this._addMemoryAddress( goatMemoryAddressTmp, 2 ),
          num.hex2dez( countGa ) * 4,
          devPa
        );
      } )
      .then( memoryGoatDump => {
        console.log( memoryGoatDump );
        if ( !memoryGoatDump )
          return new Promise( ( resolve ) => resolve( false ) );
        _this._saveGoat( _this, memoryGoatDump, devPa, 8 );
        return new Promise( ( resolve ) => resolve( true ) );
      } );
  }

  _realisationType3GrOATEasy3( _this, devPa ) {
    let goatMemoryAddressTmp = '';
    return _this.kNXMapWrapper.propertyValueRead( devPa, 7, 2 )
      .then( goatMemoryAddress => {
        if ( !goatMemoryAddress )
          return new Promise( ( resolve ) => resolve( false ) );
        goatMemoryAddressTmp = goatMemoryAddress;
        return _this.kNXMapWrapper
          .memoryRead( devPa, goatMemoryAddress, 1 );
      } )
      .then( countGa => {
        if ( !countGa )
          return new Promise( ( resolve ) => resolve( false ) );
        return _this._readGoatFromMemory(
          _this,
          _this._addMemoryAddress( goatMemoryAddressTmp, 1 ),
          num.hex2dez( countGa ) * 2,
          devPa
        );
      } )
      .then( memoryGoatDump => {
        console.log( memoryGoatDump );
        if ( !memoryGoatDump )
          return new Promise( ( resolve ) => resolve( false ) );
        _this._saveGoat( _this, memoryGoatDump, devPa, 4 );
        return new Promise( ( resolve ) => resolve( true ) );
      } );
  }

  _readGoatFromMemory( _this, memAddress, addressCount, devPa ) {
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
                .then( memoryGoatDump => {
                  console.log( 'mehr als 12 memdump:', memoryGoatDump );
                  fs.writeFileSync( FILE_TO_WATCH, `mehr als 12 memdump: ${memoryGoatDump}` );
                  gaResolve += memoryGoatDump;
                  stop -= 12;
                  memAddress = _this._addMemoryAddress( memAddress, 12 );
                  return loop( sum, stop );
                } );
          return _this.kNXMapWrapper
            .memoryRead( devPa, memAddress, stop )
              .then( memoryGoatDump => {
                console.log( 'wehniger als 12 memdump:', memoryGoatDump );
                fs.writeFileSync( FILE_TO_WATCH, `wehniger als 12 memdump: ${memoryGoatDump}` );
                gaResolve += memoryGoatDump;
                stop -= 12;
                resolve( gaResolve );
                return loop( sum, stop );
              } );
        }
      } )( 0, addressCount )
        .then( () => console.log( 'Done' ) );
    } );
  }

  _saveGoat( _this, memoryGoatDump, devPa, splitter ) {
    const countGa = memoryGoatDump.length / splitter;
    const goatArray = {};
    for ( let i = 0; i < countGa; i += 1 ) {
      const goat = memoryGoatDump.substring( i * splitter, ( i + 1 ) * splitter );
      const GO = num.hex2dez( goat.substring( splitter / 2, splitter ) );
      const GA = num.hex2dez( goat.substring( 0, splitter / 2 ) );
      if ( !goatArray[ GO ] )
        goatArray[ GO ] = [];
      goatArray[ GO ].push( GA );
    }
    console.log( goatArray );
    _this.db.get( 'pas' )
      .find( { pa: devPa } )
      .assign( { groat: goatArray } )
      .write();
    fs.writeFileSync( FILE_TO_WATCH, `Die GOA wurde gespeicher: ${goatArray}` );
  }

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
