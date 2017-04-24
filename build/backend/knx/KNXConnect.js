'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _knx = require('knx');

var _knx2 = _interopRequireDefault(_knx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var KNXConnector = function KNXConnector(kNXMapWrapper, deviceDB) {
  _classCallCheck(this, KNXConnector);

  this.kNXMapWrapper = kNXMapWrapper;
  this.db = deviceDB;
};

exports.default = KNXConnector;


function knxCon() {
  return new Promise(function (resolve, reject) {
    var connection = new _knx2.default.Connection({
      ipAddr: '192.168.3.100', // ip address of the KNX router or interface
      ipPort: 3671, // the UDP port of the router or interface
      physAddr: '1.1.145', // the KNX physical address we want to use
      minimumDelay: 10, // wait at least 10 millisec between each datagram
      handlers: {
        // wait for connection establishment before doing anything
        connected: function connected() {
          // Get a nice greeting when connected.
          console.log('Hay, I can talk KNX!');
          resolve(connection);
        },

        // get notified on connection errors
        error: function error(connstatus) {
          console.log('**** ERROR: %j', connstatus);
          reject(connstatus);
        }
      }
    });
  });
}

knxCon().then(function (connection) {
  var binaryStatus = new _knx2.default.Datapoint({ ga: '1/2/3', dpt: 'DPT1.001', autoread: true });
  var binaryControl = new _knx2.default.Datapoint({ ga: '1/2/3', dpt: 'DPT1.001' });
  binaryStatus.bind(connection);
  binaryStatus.write(false); // or false!
  // send a read request, and fire the callback upon response
  binaryStatus.read(function (src, value) {
    console.log('KNX response:', src, 'Value:', value);
  });
}).catch(function (error) {
  return console.log(error);
});