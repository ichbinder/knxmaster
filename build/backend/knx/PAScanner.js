'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sleep = require('sleep');

var _sleep2 = _interopRequireDefault(_sleep);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
  * Die Klasse Scannt den Bus auf Busteilnehmer
  * @param kNXMapWrapper das verbindungs Objekt zum KNX-Bus
  * @param deviceDB die JSON-Datenbak
**/
var PAScanner = function () {
  function PAScanner(kNXMapWrapper, db) {
    _classCallCheck(this, PAScanner);

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


  _createClass(PAScanner, [{
    key: 'scanKNXBus',
    value: function scanKNXBus(physicalAddresse) {
      var _this2 = this;

      var _this = this;
      this.pa = physicalAddresse;
      return new Promise(function (resolve, reject) {
        _this2.kNXMapWrapper.scanKNXBus(_this2.pa).then(function (listOfPa) {
          (function loop(sum, stop) {
            if (sum < stop) {
              return _this.kNXMapWrapper.devDescriptorRead(listOfPa[sum]).then(function (paMask) {
                // sleep.msleep( 300 );
                if (!_this.db.get('pas').find({ pa: listOfPa[sum] }).value()) _this.db.get('pas').push({
                  pa: listOfPa[sum],
                  mask: paMask
                }).write();
                sum += 1;
                return loop(sum, stop);
              });
            }
          })(0, listOfPa.length).then(function () {
            console.log('Done');
            if (listOfPa) {
              _this.apa = listOfPa;
              resolve(listOfPa);
            }
          });
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: 'getPA',
    value: function getPA() {
      return this.apa;
    }
  }, {
    key: 'getDB',
    value: function getDB() {
      return this.db;
    }
  }]);

  return PAScanner;
}();

exports.default = PAScanner;