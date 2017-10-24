import knx from 'knx';

/**
  * Diese Klasse stelt eine Verbindung zum KNX-Router her, um narichten auf den
  * Bus zu versenden und um den Bus zu monitoren.
  * @param ipAddr hier muss die IP zum KNX-Router angegeben werden
  * @param ipPort der Port für den KNX-Router
  * @param die PA die diese Connection haben soll im KNX-Bus
  * @param minimumDelay die verzögerung zwischen dem senden von Telegrammen
**/
export default class KNXConnector {
  constructor( ipAddr, ipPort = 3671, pa = '1.1.250', minimumDelay = 10 ) {
    this.ipAddr = ipAddr;
    this.ipPort = ipPort;
    this.physAddr = pa;
    this.minimumDelay = minimumDelay;
  }

  /**
  * erstellt ein Objekt dieser Klasse
  * @param ipAddr hier muss die IP zum KNX-Router angegeben werden
  * @param ipPort der Port für den KNX-Router
  * @param die PA die diese Connection haben soll im KNX-Bus
  * @param minimumDelay die verzögerung zwischen dem senden von Telegrammen
  **/
  static create( ipAddr, ipPort = 3671, pa = '1.1.250', minimumDelay = 10 ) {
    const kNXConnector = new KNXConnector( ipAddr, ipPort, pa, minimumDelay );
    return kNXConnector.connect();
  }

  /**
    * Metode zum aufbau der verbindung
  **/
  connect() {
    return new Promise( ( resolve, reject ) => {
      console.log( 'test_after_knxconn!' );
      const connection = new knx.Connection( {
        ipAddr: this.ipAddr,
        ipPort: this.ipPort,
        physAddr: this.physAddr,
        minimumDelay: this.minimumDelay,
        handlers: {
          // wait for connection establishment before doing anything
          connected() {
            // Get a nice greeting when connected.
            console.log( 'Hay, I can talk KNX!' );
            this.connection = connection;
            resolve( connection );
          },
          // get notified on connection errors
          error( connstatus ) {
            console.log( '**** ERROR: %j', connstatus );
            reject( connstatus );
          }
        }
      } );
    } );
  }

 /**
  * Sendet eine Gruppenadresse mit dem DPT 1 auf den Bus.
**/
  dpt1Write( groupAddr, value ) {
    return new Promise( ( resolve ) => {
      const binaryStatus = new knx.Datapoint(
        {
          ga: groupAddr,
          dpt: 'DPT1.001',
          autoread: true
        },
        this.connection
      );
      binaryStatus.write( value );
      binaryStatus.read( ( src, valueDPT ) => {
        resolve( {
          srcPa: src,
          value: valueDPT
        } );
      } );
    } );
  }
}
