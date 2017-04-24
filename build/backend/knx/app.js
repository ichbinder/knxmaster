'use strict';

var _lowdb = require('lowdb');

var _lowdb2 = _interopRequireDefault(_lowdb);

var _KNXScan = require('./KNXScan');

var _KNXScan2 = _interopRequireDefault(_KNXScan);

var _KNXMapWrapper = require('./KNXMapWrapper');

var _KNXMapWrapper2 = _interopRequireDefault(_KNXMapWrapper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import KNXConnector from './KNXConnector';
var IP = '141.45.187.88';
var db = (0, _lowdb2.default)('./knxbusDB.json');

db.defaults({ pas: [], building: [] }).write();

var text = '\n-----------------------------------------\n---------------- jakob war hier ---------\n-----------------------------------------\n';
console.log(text);

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