'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _PAScanner = require('./PAScanner');

var _PAScanner2 = _interopRequireDefault(_PAScanner);

var _GroupAddressScanner = require('./GroupAddressScanner');

var _GroupAddressScanner2 = _interopRequireDefault(_GroupAddressScanner);

var _GroupObjectAssociationScanner = require('./GroupObjectAssociationScanner');

var _GroupObjectAssociationScanner2 = _interopRequireDefault(_GroupObjectAssociationScanner);

var _GroupObjectScanner = require('./GroupObjectScanner');

var _GroupObjectScanner2 = _interopRequireDefault(_GroupObjectScanner);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FILE_TO_WATCH = _path2.default.resolve(__dirname, '../log/knxscan.log');

var KNXScan = function () {
  function KNXScan(kNXMapWrapper, deviceDB, dbName) {
    _classCallCheck(this, KNXScan);

    this.kNXMapWrapper = kNXMapWrapper;
    this.db = deviceDB;
    this.dbName = dbName;
  }

  _createClass(KNXScan, [{
    key: 'scan',
    value: function scan(physicalAddresse) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var startScan = new _PAScanner2.default(_this.kNXMapWrapper, _this.db);
        startScan.scanKNXBus(physicalAddresse).then(function () {
          return new _GroupAddressScanner2.default(_this.kNXMapWrapper, _this.db).scanGroupAddress();
        }).then(function () {
          return new _GroupObjectAssociationScanner2.default(_this.kNXMapWrapper, _this.db).scanGrOAT();
        }).then(function () {
          return new _GroupObjectScanner2.default(_this.kNXMapWrapper, _this.db).scanGrOT();
        }).then(function () {
          return resolve(true);
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: 'generateGOInDB',
    value: function generateGOInDB() {
      var _this2 = this;

      return new Promise(function (resolve) {
        var result = _this2.db.get(_this2.dbName).filter(function (i) {
          if (i.ga) return i;
          return false;
        }).filter(function (i) {
          if (i.groat) return i;
          return false;
        }).filter(function (i) {
          if (i.grot) return i;
          return false;
        }).value();

        for (var i = 0; i < result.length; i++) {
          var GrO = {};
          for (var j = 0; j < Object.keys(result[i].groat).length; j++) {
            if (result[i].ga[result[i].groat[Object.keys(result[i].groat)[j]][0] - 1]) {
              var GrOTmp = Object.keys(result[i].groat)[j];
              GrO[GrOTmp] = {};
              GrO[GrOTmp].DPT = result[i].grot[Object.keys(result[i].groat)[j]];
              console.log(result[i].grot[Object.keys(result[i].groat)[j]]);
              for (var h = 0; h < result[i].groat[Object.keys(result[i].groat)[j]].length; h++) {
                if (!GrO[GrOTmp].ga) GrO[GrOTmp].ga = [];
                GrO[GrOTmp].ga.push(result[i].ga[result[i].groat[Object.keys(result[i].groat)[j]][h] - 1]);
              }
            }
          }
          _this2.db.get(_this2.dbName).find({ pa: result[i].pa }).assign({ gro: GrO }).write();
        }
        resolve(true);
      });
    }
  }, {
    key: 'clearDB',
    value: function clearDB() {
      var result = this.db.get(this.dbName).filter(function (i) {
        if (i.ga) return i;
        return false;
      }).filter(function (i) {
        if (i.groat) return i;
        return false;
      }).filter(function (i) {
        if (i.grot) return i;
        return false;
      }).value();

      for (var i = 0; i < result.length; i++) {
        this.db.get(this.dbName).find({ pa: result[i].pa }).unset('groat').write();
        this.db.get(this.dbName).find({ pa: result[i].pa }).unset('grot').write();
      }
      var logText = '\n    ################################################\n    ------------------------------------------------\n    -------------Scan fertig!!!---------------------\n    ------------------------------------------------\n    ################################################\n    ';
      console.log(logText);
      _fs2.default.writeFileSync(FILE_TO_WATCH, logText);
    }
  }]);

  return KNXScan;
}();

exports.default = KNXScan;