import knx from 'knx';

export default class KNXConnector {
  constructor( ipAddr, ipPort = 3671, pa = '1.1.250', minimumDelay = 10 ) {
    this.ipAddr = ipAddr;
    this.ipPort = ipPort;
    this.physAddr = pa;
    this.minimumDelay = minimumDelay;
  }

  static create( ipAddr, ipPort = 3671, pa = '1.1.250', minimumDelay = 10 ) {
    const kNXConnector = new KNXConnector( ipAddr, ipPort, pa, minimumDelay );
    return kNXConnector.connect();
  }

  connect() {
    return new Promise( ( resolve, reject ) => {
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
