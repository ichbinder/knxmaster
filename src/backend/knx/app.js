import low from 'lowdb';
// import KNXConnector from './KNXConnector';
import KNXScan from './KNXScan';
import KnxMap from './KNXMapWrapper';


const IP = '141.45.187.88';
const db = low( './knxbusDB.json' );

db.defaults( { pas: [], building: [] } )
  .write();


const text = `
-----------------------------------------
---------------- jakob war hier ---------
-----------------------------------------
`;
console.log( text );

// KNXConnector.create( IP )
//   .then( ( connection ) => {
//     connection.write( '2/1/19', 1, 'DPT1' );
//     connection.read( ( src, valueDPT ) => {
//       console.log( src, valueDPT );
//       return ( valueDPT );
//     } );
//   } )
//   .catch( err => console.log( 'hoho', err ) );


// KNXConnector.create( IP )
//   .then( connection => {
//     console.log( KNXConnector.dpt1Write( '1/2/3', true ) );
//   } )
//   .catch( error => console.log( error ) );

// const knxBus = new KnxMap( IP );
// const knx = new KNXScan( knxBus, db, 'pas' );

// knx.scan( '1.1.0-1.1.6' )
//   .catch( error => console.log( error ) );
// knx.generateGOInDB()
//   .then( () => console.log( 'done' ) )
//   .catch( error => console.log( error ) );
// knx.clearDB();
