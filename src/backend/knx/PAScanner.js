import sleep from 'sleep';


/**
  * Die Klasse Scannt den Bus auf Busteilnehmer
  * @param kNXMapWrapper das verbindungs Objekt zum KNX-Bus
  * @param deviceDB die JSON-Datenbak
**/
export default class PAScanner {
  constructor( kNXMapWrapper, db ) {
    this.kNXMapWrapper = kNXMapWrapper;
    this.db = db;
    this.pa = null;
    this.apa = null;
  }

  /**
    * Die Methonde Scannt den Bus auf Busteilnehmer und wenn sie Welche gefunden hat
    * speichert sie sie in die Dankenbank.
    * @param physicalAddresse die Pa's die gescannt werden sollen
  **/
  scanKNXBus( physicalAddresse ) {
    const _this = this;
    this.pa = physicalAddresse;
    return new Promise( ( resolve, reject ) => {
      this.kNXMapWrapper.scanKNXBus( this.pa )
        .then( listOfPa => {
          ( function loop( sum, stop ) {
            if ( sum < stop ) {
              return _this.kNXMapWrapper.devDescriptorRead( listOfPa[sum] )
                .then( paMask => {
                  // sleep.msleep( 300 );
                  if ( ! _this.db.get( 'pas' ).find( { pa: listOfPa[sum] } ).value() )
                    _this.db.get( 'pas' )
                    .push( {
                      pa: listOfPa[sum],
                      mask: paMask
                    } )
                    .write();
                  sum += 1;
                  return loop( sum, stop );
                } );
            }
          } )( 0, listOfPa.length )
              .then( () => {
                console.log( 'Done' );
                if ( listOfPa ) {
                  _this.apa = listOfPa;
                  resolve( listOfPa );
                }
              } );
        } )
        .catch( error => reject( error ) );
    } );
  }

  getPA() {
    return this.apa;
  }

  getDB() {
    return this.db;
  }
}
