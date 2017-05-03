'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _GroupAddressConverter = require('./GroupAddressConverter');

var _GroupAddressConverter2 = _interopRequireDefault(_GroupAddressConverter);

var _NumberConverter = require('./NumberConverter');

var _NumberConverter2 = _interopRequireDefault(_NumberConverter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
  * Das auslesen der einzelenen GA der Busteilnehmer wird in der Master arbeit genuaer
  * erleutert. (Kapitel 4.6.3.1)
**/

// dies ist die Log-Datei. Alles was in dieser Log-Datei geschrieben wird wird ans
// Scan PA Frontend gesendet.
var FILE_TO_WATCH = _path2.default.resolve(__dirname, '../log/knxscan.log');

// die KNX-Busteilnehmer Mask's die gescannt werden können auf GA.
var gaStartAddress = {
  '0010': 1,
  '0011': 1,
  '0012': 1,
  '0013': 1,
  1012: 1,
  1013: 1,
  3012: 1,
  4012: 1,
  '07b0': 4,
  '07B0': 4,
  '0020': 5,
  '0021': 5,
  '0701': 5
};

/**
  * Diese Klasse Scannt den KAX-Busteilnehmer auf GA
  * @param kNXMapWrapper ist die verbindung über KnxMap zum KNX-Busteilnehmer
  * @param deviceDB die JSON-Datenbanken in die die Ergebnisse gespeichert werdne soll.
**/

var GoupAddressScaner = function () {
  function GoupAddressScaner(kNXMapWrapper, deviceDB) {
    _classCallCheck(this, GoupAddressScaner);

    this.kNXMapWrapper = kNXMapWrapper;
    this.db = deviceDB;
  }

  /**
    * Diese Methode Iteriert über alle gefunden PA und öffnet die Jeweileige Methode
    * um die GA aus den Jeweileige Speicherblöcken der Busteilnehmer zu hollen.
  **/


  _createClass(GoupAddressScaner, [{
    key: 'scanGroupAddress',
    value: function scanGroupAddress() {
      var _this2 = this;

      return new Promise(function (resolve) {
        var logText = '\n      ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\n      ,,,,,,,,,,,,,  start GAT scan ,,,,,,,,,,,,,\n      ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\n      ';
        console.log(logText);
        _fs2.default.writeFileSync(FILE_TO_WATCH, logText);
        var devPas = _this2.db.get('pas').filter(function (i) {
          if (!i.ga) return i;
          return false;
        }).value();
        if (devPas.length > 0) {
          var _this = _this2;
          (function loop(sum, stop) {
            if (sum < stop) {
              logText = '\n            ################################################\n            -------------PA: ' + devPas[sum].pa + '--------------\n            -------------Mask: ' + devPas[sum].mask + '--------------\n            -------------Typ: ' + gaStartAddress[devPas[sum].mask] + '--------------\n            ################################################\n            ';
              console.log(logText);
              _fs2.default.writeFileSync(FILE_TO_WATCH, logText);
              if (gaStartAddress[devPas[sum].mask] === 1) {
                return _this._realisationType1Until5(_this, devPas[sum].pa).then(function () {
                  return loop(sum += 1, stop);
                });
              } else if (gaStartAddress[devPas[sum].mask] === 4) {
                return _this._realisationType7(_this, devPas[sum].pa).then(function () {
                  return loop(sum += 1, stop);
                });
              } else if (gaStartAddress[devPas[sum].mask] === 5) {
                return _this._realisationType3GrATEasy2(_this, devPas[sum].pa).then(function () {
                  return loop(sum += 1, stop);
                });
              }
              return new Promise(function (resolveLoop) {
                return resolveLoop(true);
              }).then(function () {
                logText = 'keine GrA f\xFCr ' + devPas[sum].pa + ' gefunden!!!';
                console.log(logText);
                _fs2.default.writeFileSync(FILE_TO_WATCH, logText);
                return loop(sum += 1, stop);
              });
            }
          })(0, devPas.length).then(function () {
            console.log('GrATDone');
            resolve(true);
          });
        } else {
          logText = 'GrA: keine pa musste bearbeitet werden.';
          console.log(logText);
          _fs2.default.writeFileSync(FILE_TO_WATCH, logText);
          resolve(false);
        }
      });
    }

    /**
      * Realisation Type 1 bis 5 werdne auf GA gescant
    **/

  }, {
    key: '_realisationType1Until5',
    value: function _realisationType1Until5(_this, devPa) {
      return _this.kNXMapWrapper.memoryRead(devPa, '0x0116', 1).then(function (countGa) {
        console.log('Typ1 countga:', countGa);
        _fs2.default.writeFileSync(FILE_TO_WATCH, 'Typ1 countga: ' + countGa);
        if (!countGa) return new Promise(function (resolve) {
          return resolve(false);
        });
        return _this.kNXMapWrapper.memoryRead(devPa, _this._addMemoryAddress('0x0116', 3), (_NumberConverter2.default.hex2dez(countGa) - 1) * 2);
      }).then(function (memoryGaDump) {
        if (!memoryGaDump) return new Promise(function (resolve) {
          return resolve(false);
        });
        _this._saveGa(_this, memoryGaDump, devPa);
        return new Promise(function (resolve) {
          return resolve(true);
        });
      });
    }

    /**
      * Realisation Type 3 GrATEasy 2 werdne auf GA gescant
    **/

  }, {
    key: '_realisationType3GrATEasy2',
    value: function _realisationType3GrATEasy2(_this, devPa) {
      var gaMemoryAddressTmp = '';
      return _this.kNXMapWrapper.propertyValueRead(devPa, 7, 1).then(function (gaMemoryAddress) {
        gaMemoryAddressTmp = gaMemoryAddress;
        console.log('gaMemoryAddress', gaMemoryAddress);
        if (!gaMemoryAddress) return new Promise(function (resolve) {
          return resolve(false);
        });
        return _this.kNXMapWrapper.memoryRead(devPa, gaMemoryAddress, 1);
      }).then(function (countGa) {
        console.log('Typ3 countGa', countGa);
        if (!countGa) return new Promise(function (resolve) {
          return resolve(false);
        });
        return _this._readGaFromMemory(_this, _this._addMemoryAddress(gaMemoryAddressTmp, 3), (_NumberConverter2.default.hex2dez(countGa) - 1) * 2, devPa);
      }).then(function (memoryGaDump) {
        console.log(memoryGaDump);
        if (!memoryGaDump) return new Promise(function (resolve) {
          return resolve(false);
        });
        _this._saveGa(_this, memoryGaDump, devPa);
        return new Promise(function (resolve) {
          return resolve(true);
        });
      });
    }

    /**
      * Realisation Type 7 werdne auf GA gescant
    **/

  }, {
    key: '_realisationType7',
    value: function _realisationType7(_this, devPa) {
      return new Promise(function (resolve, reject) {
        var gaMemoryAddressTmp = '';
        _this.kNXMapWrapper.propertyValueRead(devPa, 7, 1).then(function (gaMemoryAddress) {
          gaMemoryAddressTmp = gaMemoryAddress;
          if (!gaMemoryAddress) return resolve(false);
          return _this.kNXMapWrapper.memoryRead(devPa, gaMemoryAddress, 2);
        }).then(function (countGa) {
          console.log('Anzahl der GA:', countGa);
          _fs2.default.writeFileSync(FILE_TO_WATCH, 'Anzahl der GA: ' + countGa);
          if (!countGa) return resolve(false);
          return _this._readGaFromMemory(_this, _this._addMemoryAddress(gaMemoryAddressTmp, 2), _NumberConverter2.default.hex2dez(countGa) * 2, devPa);
        }).then(function (memoryGaDump) {
          console.log(memoryGaDump);
          if (!memoryGaDump) return resolve(false);
          _this._saveGa(_this, memoryGaDump, devPa);
          return resolve(true);
        }).catch(function (error) {
          return reject(error);
        });
      });
    }

    /**
      * Hier werden die GA aus dem Speicher der jeweiligen KNX-Busteilnehmer gelesen,
      * da offt nur 12 HEX Strings auf einmal aus einem KNX-Busteilnehmer gelesen werden
      * können, muss die zu lesende Megen aufgeteilt werden und geschaut werden ob
      * sie grösser ist als 12.
    **/

  }, {
    key: '_readGaFromMemory',
    value: function _readGaFromMemory(_this, memAddress, addressCount, devPa) {
      return new Promise(function (resolve) {
        var gaResolve = '';
        console.log('addressCount', addressCount);
        _fs2.default.writeFileSync(FILE_TO_WATCH, 'addressCount: ' + addressCount);
        if (!(addressCount > 0) || addressCount === null) return resolve(false);
        (function loop(sum, stop) {
          if (sum < stop) {
            if (stop > 12) return _this.kNXMapWrapper.memoryRead(devPa, memAddress, 12).then(function (memoryGaDump) {
              console.log('mehr als 12 memdump:', memoryGaDump);
              _fs2.default.writeFileSync(FILE_TO_WATCH, 'mehr als 12 memdump: ' + memoryGaDump);
              gaResolve += memoryGaDump;
              stop -= 12;
              memAddress = _this._addMemoryAddress(memAddress, 12);
              return loop(sum, stop);
            });
            return _this.kNXMapWrapper.memoryRead(devPa, memAddress, stop).then(function (memoryGaDump) {
              console.log('wehniger als 12 memdump:', memoryGaDump);
              _fs2.default.writeFileSync(FILE_TO_WATCH, 'wehniger als 12 memdump: ' + memoryGaDump);
              gaResolve += memoryGaDump;
              stop -= 12;
              resolve(gaResolve);
              return loop(sum, stop);
            });
          }
        })(0, addressCount).then(function () {
          return console.log('Done');
        });
      });
    }

    /**
      * Die gelesenen GA des jeweileigen KNX-Busteilnehmers werden in die Scann JSON-Datenbanken
      * gespeichert.
    **/

  }, {
    key: '_saveGa',
    value: function _saveGa(_this, memoryGaDump, devPa) {
      console.log('memoryGaDump to length:', memoryGaDump.length / 4);
      var countGa = memoryGaDump.length / 4;
      var gaArray = [];
      for (var i = 0; i < countGa; i += 1) {
        var ga = _GroupAddressConverter2.default.hexToGa(memoryGaDump.substring(i * 4, (i + 1) * 4));
        gaArray.push(ga);
      }
      console.log(gaArray);
      _this.db.get('pas').find({ pa: devPa }).assign({ ga: gaArray }).write();
      _fs2.default.writeFileSync(FILE_TO_WATCH, 'Die GA wurde gespeicher: ' + gaArray);
    }

    /**
      * Adiert zu einem Memory Adresse eine wert um zu einer anderen Memory adresse zu kommen.
    **/

  }, {
    key: '_addMemoryAddress',
    value: function _addMemoryAddress(memAddress, dez) {
      console.log('memAddress:', memAddress);
      _fs2.default.writeFileSync(FILE_TO_WATCH, 'memAddress: ' + memAddress);
      console.log('memAddress + dez:', _NumberConverter2.default.hex2dez(memAddress) + dez);
      console.log('memAddress + dez -> hex:', _NumberConverter2.default.dez2hex(_NumberConverter2.default.hex2dez(memAddress) + dez));
      _fs2.default.writeFileSync(FILE_TO_WATCH, 'memAddress + dez -> hex: ' + _NumberConverter2.default.dez2hex(_NumberConverter2.default.hex2dez(memAddress) + dez));
      return _NumberConverter2.default.dez2hex(_NumberConverter2.default.hex2dez(memAddress) + dez);
    }
  }]);

  return GoupAddressScaner;
}();

exports.default = GoupAddressScaner;