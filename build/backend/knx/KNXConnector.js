'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _knx = require('knx');

var _knx2 = _interopRequireDefault(_knx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
  * Diese Klasse stelt eine Verbindung zum KNX-Router her, um narichten auf den
  * Bus zu versenden und um den Bus zu monitoren.
  * @param ipAddr hier muss die IP zum KNX-Router angegeben werden
  * @param ipPort der Port für den KNX-Router
  * @param die PA die diese Connection haben soll im KNX-Bus
  * @param minimumDelay die verzögerung zwischen dem senden von Telegrammen
**/
var KNXConnector = function () {
  function KNXConnector(ipAddr) {
    var ipPort = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3671;
    var pa = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '1.1.250';
    var minimumDelay = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 10;

    _classCallCheck(this, KNXConnector);

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


  _createClass(KNXConnector, [{
    key: 'connect',


    /**
      * Metode zum aufbau der verbindung
    **/
    value: function connect() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        console.log('test_after_knxconn!');
        var connection = new _knx2.default.Connection({
          ipAddr: _this.ipAddr,
          ipPort: _this.ipPort,
          physAddr: _this.physAddr,
          minimumDelay: _this.minimumDelay,
          handlers: {
            // wait for connection establishment before doing anything
            connected: function connected() {
              // Get a nice greeting when connected.
              console.log('Hay, I can talk KNX!');
              this.connection = connection;
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

    /**
     * Sendet eine Gruppenadresse mit dem DPT 1 auf den Bus.
    **/

  }, {
    key: 'dpt1Write',
    value: function dpt1Write(groupAddr, value) {
      var _this2 = this;

      return new Promise(function (resolve) {
        var binaryStatus = new _knx2.default.Datapoint({
          ga: groupAddr,
          dpt: 'DPT1.001',
          autoread: true
        }, _this2.connection);
        binaryStatus.write(value);
        binaryStatus.read(function (src, valueDPT) {
          resolve({
            srcPa: src,
            value: valueDPT
          });
        });
      });
    }
  }], [{
    key: 'create',
    value: function create(ipAddr) {
      var ipPort = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3671;
      var pa = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '1.1.250';
      var minimumDelay = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 10;

      var kNXConnector = new KNXConnector(ipAddr, ipPort, pa, minimumDelay);
      return kNXConnector.connect();
    }
  }]);

  return KNXConnector;
}();

exports.default = KNXConnector;