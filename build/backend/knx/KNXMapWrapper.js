'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodeCmd = require('node-cmd');

var _nodeCmd2 = _interopRequireDefault(_nodeCmd);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var KNXMapWrapper = function () {
  function KNXMapWrapper(ipAddress) {
    var knxmapPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'knxmap';

    _classCallCheck(this, KNXMapWrapper);

    this.ip = ipAddress;
    this.knxmap = knxmapPath;
  }

  _createClass(KNXMapWrapper, [{
    key: 'scanKNXBus',
    value: function scanKNXBus(pa) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        console.log(_this.knxmap + ' scan ' + _this.ip + ' ' + pa);
        _nodeCmd2.default.get(_this.knxmap + ' scan ' + _this.ip + ' ' + pa, function (data, err, stderr) {
          if (err) reject('err: ' + err + ' stderr: ' + stderr);
          var tmp = data.split('Bus Devices:')[1];
          if (tmp) resolve(tmp.replace(/ /g, '').split(/\n/).filter(Boolean));else resolve(null);
        });
      });
    }
  }, {
    key: 'devDescriptorRead',
    value: function devDescriptorRead(pa) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _nodeCmd2.default.get(_this2.knxmap + ' apci ' + _this2.ip + ' ' + pa + ' DeviceDescriptor_Read', function (data, err, stderr) {
          if (err) reject('err: ' + err + ' stderr: ' + stderr);
          if (stderr) resolve(stderr.replace(/\s/g, '').replace(/^b/g, '').replace(/'/g, ''));else resolve(null);
        });
      });
    }
  }, {
    key: 'memoryRead',
    value: function memoryRead(pa, memoryAddress) {
      var _this3 = this;

      var readCount = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

      return new Promise(function (resolve, reject) {
        _nodeCmd2.default.get(_this3.knxmap + ' apci ' + _this3.ip + ' ' + pa + ' Memory_Read         --memory-address ' + memoryAddress + '         --read-count ' + readCount, function (data, err, stderr) {
          if (err) reject('err: ' + err + ' stderr: ' + stderr);
          if (stderr) resolve(stderr.replace(/\s/g, '').replace(/^b/g, '').replace(/'/g, ''));else resolve(null);
        });
      });
    }
  }, {
    key: 'propertyValueRead',
    value: function propertyValueRead(pa, pid) {
      var oid = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      var _this4 = this;

      var sid = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
      var elements = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;

      return new Promise(function (resolve, reject) {
        _nodeCmd2.default.get(_this4.knxmap + ' apci ' + _this4.ip + ' ' + pa + ' PropertyValue_Read         --property-id ' + pid + '         --object-index ' + oid + '         --elements ' + elements + '         --start-index ' + sid, function (data, err, stderr) {
          if (err) reject('err: ' + err + ' stderr: ' + stderr);
          if (stderr) resolve(stderr.replace(/\s/g, '').replace(/^b/g, '').replace(/'/g, ''));else resolve(null);
        });
      });
    }
  }]);

  return KNXMapWrapper;
}();

exports.default = KNXMapWrapper;