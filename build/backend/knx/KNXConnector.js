'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _knx = require('knx');

var _knx2 = _interopRequireDefault(_knx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

  _createClass(KNXConnector, [{
    key: 'connect',
    value: function connect() {
      var _this = this;

      return new Promise(function (resolve, reject) {
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