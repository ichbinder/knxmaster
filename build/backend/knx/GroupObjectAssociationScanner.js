'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _NumberConverter = require('./NumberConverter');

var _NumberConverter2 = _interopRequireDefault(_NumberConverter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
  * Das auslesen der einzelenen GOA der Busteilnehmer wird in der Master arbeit genuaer
  * erleutert. (Kapitel 4.6.3.3)
**/

// dies ist die Log-Datei. Alles was in dieser Log-Datei geschrieben wird wird ans
// Scan PA Frontend gesendet.
var FILE_TO_WATCH = _path2.default.resolve(__dirname, '../log/knxscan.log');

// die KNX-Busteilnehmer Mask's die gescannt werden können auf GOAT.
var gaMask = {
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
  '0020': 6,
  '0021': 6,
  '0701': 6,
  5705: 6
};

/**
  * Diese Klasse Scannt den KAX-Busteilnehmer auf
  * Gruppen Objekt Association Tabels und wertet diese aus ums sie in die JSON-Datenbanken
  * zu Speicher.
  * @param kNXMapWrapper ist die verbindung über KnxMap zum KNX-Busteilnehmer
  * @param deviceDB die JSON-Datenbanken in die die Ergebnisse gespeichert werdne soll.
**/

var GroupObjectAssociationScanner = function () {
  function GroupObjectAssociationScanner(kNXMapWrapper, deviceDB) {
    _classCallCheck(this, GroupObjectAssociationScanner);

    this.kNXMapWrapper = kNXMapWrapper;
    this.db = deviceDB;
  }

  /**
    * Diese Methode Iteriert über alle gefunden PA und öffnet die Jeweileige Methode
    * um die GOAT aus den Jeweileige Speicherblöcken der Busteilnehmer zu hollen.
  **/


  _createClass(GroupObjectAssociationScanner, [{
    key: 'scanGrOAT',
    value: function scanGrOAT() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var logText = '\n      ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\n      ,,,,,,,,,,,,,  start GrOAT scan ,,,,,,,,,,,,,\n      ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\n      ';
        console.log(logText);
        _fs2.default.writeFileSync(FILE_TO_WATCH, logText);
        var devPas = _this2.db.get('pas').filter(function (i) {
          if (!i.groat) return i;
          return false;
        }).value();

        if (devPas.length > 0) {
          var _this = _this2;
          (function loop(sum, stop) {
            if (sum < stop) {
              logText = '\n            ################################################\n            -------------PA: ' + devPas[sum].pa + '--------------\n            -------------Mask: ' + devPas[sum].mask + '--------------\n            -------------Typ: ' + gaMask[devPas[sum].mask] + '--------------\n            ################################################\n            ';
              console.log(logText);
              _fs2.default.writeFileSync(FILE_TO_WATCH, logText);
              if (gaMask[devPas[sum].mask] === 1) {
                return _this._realisationType1(_this, devPas[sum].pa).then(function () {
                  return loop(sum += 1, stop);
                });
              } else if (gaMask[devPas[sum].mask] === 4) {
                return _this._realisationType6SystemB(_this, devPas[sum].pa).then(function () {
                  return loop(sum += 1, stop);
                });
              } else if (gaMask[devPas[sum].mask] === 6) {
                return _this._realisationType3GrOATEasy3(_this, devPas[sum].pa).then(function () {
                  return loop(sum += 1, stop);
                });
              }
              return new Promise(function (resolveLoop) {
                return resolveLoop(true);
              }).then(function () {
                logText = 'keine GrOA f\xFCr ' + devPas[sum].pa + ' gefunden!!!';
                console.log(logText);
                _fs2.default.writeFileSync(FILE_TO_WATCH, logText);
                return loop(sum += 1, stop);
              });
            }
          })(0, devPas.length).then(function () {
            console.log('GrOAT Done');
            resolve(true);
          }).catch(function (error) {
            return reject(error);
          });
        } else {
          logText = 'GrOAT: keine pa musste bearbeitet werden.';
          console.log(logText);
          _fs2.default.writeFileSync(FILE_TO_WATCH, logText);
          resolve(false);
        }
      });
    }

    /**
      * Realisation Type 1 werdne auf GOA gescant
    **/

  }, {
    key: '_realisationType1',
    value: function _realisationType1(_this, devPa) {
      return new Promise(function (resolve, reject) {
        var grAssocTabPtrTmp = null;
        return _this.kNXMapWrapper.memoryRead(devPa, '0x0111', 1).then(function (grAssocTabPtr) {
          grAssocTabPtrTmp = _NumberConverter2.default.dez2hex(_NumberConverter2.default.hex2dez('100') + _NumberConverter2.default.hex2dez(grAssocTabPtr));
          console.log('grAssocTabPtr:', grAssocTabPtr);
          if (!grAssocTabPtr) return resolve(false);
          return _this.kNXMapWrapper.memoryRead(devPa, grAssocTabPtrTmp);
        }).then(function (countGOA) {
          console.log('Typ1 countgoa:', countGOA);
          _fs2.default.writeFileSync(FILE_TO_WATCH, 'Typ1 countgoa: ' + countGOA);
          if (!countGOA) return resolve(false);
          return _this._readGoatFromMemory(_this, _this._addMemoryAddress(grAssocTabPtrTmp, 1), _NumberConverter2.default.hex2dez(countGOA) * 2, devPa);
        }).then(function (memoryGoatDump) {
          console.log(memoryGoatDump);
          if (!memoryGoatDump) return resolve(false);
          _this._saveGoat(_this, memoryGoatDump, devPa, 4);
          return resolve(true);
        }).catch(function (error) {
          return reject(error);
        });
      });
    }

    /**
      Man bekommet den Group Objekt Association Table Pointer (Goatp) in dem man
      die propertyValue 7 an der Stelle 2 ausliest.
      Dann kann man mit dem dem Goatp die grösse der Rable auslesen.
      Mit der gösse kann dann angefangen werden die Association aus zu lesen.
    **/

  }, {
    key: '_realisationType6SystemB',
    value: function _realisationType6SystemB(_this, devPa) {
      var goatMemoryAddressTmp = '';
      return _this.kNXMapWrapper.propertyValueRead(devPa, 7, 2).then(function (goatMemoryAddress) {
        if (!goatMemoryAddress) return new Promise(function (resolve) {
          return resolve(false);
        });
        goatMemoryAddressTmp = goatMemoryAddress;
        return _this.kNXMapWrapper.memoryRead(devPa, goatMemoryAddress, 2);
      }).then(function (countGa) {
        if (!countGa) return new Promise(function (resolve) {
          return resolve(false);
        });
        return _this._readGoatFromMemory(_this, _this._addMemoryAddress(goatMemoryAddressTmp, 2), _NumberConverter2.default.hex2dez(countGa) * 4, devPa);
      }).then(function (memoryGoatDump) {
        console.log(memoryGoatDump);
        if (!memoryGoatDump) return new Promise(function (resolve) {
          return resolve(false);
        });
        _this._saveGoat(_this, memoryGoatDump, devPa, 8);
        return new Promise(function (resolve) {
          return resolve(true);
        });
      });
    }

    /**
      * Realisation Type 3 GrOATEasy 3 werdne auf GOA gescant
    **/

  }, {
    key: '_realisationType3GrOATEasy3',
    value: function _realisationType3GrOATEasy3(_this, devPa) {
      var goatMemoryAddressTmp = '';
      return _this.kNXMapWrapper.propertyValueRead(devPa, 7, 2).then(function (goatMemoryAddress) {
        if (!goatMemoryAddress) return new Promise(function (resolve) {
          return resolve(false);
        });
        goatMemoryAddressTmp = goatMemoryAddress;
        return _this.kNXMapWrapper.memoryRead(devPa, goatMemoryAddress, 1);
      }).then(function (countGa) {
        if (!countGa) return new Promise(function (resolve) {
          return resolve(false);
        });
        return _this._readGoatFromMemory(_this, _this._addMemoryAddress(goatMemoryAddressTmp, 1), _NumberConverter2.default.hex2dez(countGa) * 2, devPa);
      }).then(function (memoryGoatDump) {
        console.log(memoryGoatDump);
        if (!memoryGoatDump) return new Promise(function (resolve) {
          return resolve(false);
        });
        _this._saveGoat(_this, memoryGoatDump, devPa, 4);
        return new Promise(function (resolve) {
          return resolve(true);
        });
      });
    }

    /**
      * Hier werden die GOAT aus dem Speicher der jeweiligen KNX-Busteilnehmer gelesen,
      * da offt nur 12 HEX Strings auf einmal aus einem KNX-Busteilnehmer gelesen werden
      * können, muss die zu lesende Megen aufgeteilt werden und geschaut werden ob
      * sie grösser ist als 12.
    **/

  }, {
    key: '_readGoatFromMemory',
    value: function _readGoatFromMemory(_this, memAddress, addressCount, devPa) {
      return new Promise(function (resolve) {
        var gaResolve = '';
        console.log('addressCount', addressCount);
        _fs2.default.writeFileSync(FILE_TO_WATCH, 'addressCount: ' + addressCount);
        if (!(addressCount > 0) || addressCount === null) return resolve(false);
        (function loop(sum, stop) {
          if (sum < stop) {
            if (stop > 12) return _this.kNXMapWrapper.memoryRead(devPa, memAddress, 12).then(function (memoryGoatDump) {
              console.log('mehr als 12 memdump:', memoryGoatDump);
              _fs2.default.writeFileSync(FILE_TO_WATCH, 'mehr als 12 memdump: ' + memoryGoatDump);
              gaResolve += memoryGoatDump;
              stop -= 12;
              memAddress = _this._addMemoryAddress(memAddress, 12);
              return loop(sum, stop);
            });
            return _this.kNXMapWrapper.memoryRead(devPa, memAddress, stop).then(function (memoryGoatDump) {
              console.log('wehniger als 12 memdump:', memoryGoatDump);
              _fs2.default.writeFileSync(FILE_TO_WATCH, 'wehniger als 12 memdump: ' + memoryGoatDump);
              gaResolve += memoryGoatDump;
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
    key: '_saveGoat',
    value: function _saveGoat(_this, memoryGoatDump, devPa, splitter) {
      var countGa = memoryGoatDump.length / splitter;
      var goatArray = {};
      for (var i = 0; i < countGa; i += 1) {
        var goat = memoryGoatDump.substring(i * splitter, (i + 1) * splitter);
        var GO = _NumberConverter2.default.hex2dez(goat.substring(splitter / 2, splitter));
        var GA = _NumberConverter2.default.hex2dez(goat.substring(0, splitter / 2));
        if (!goatArray[GO]) goatArray[GO] = [];
        goatArray[GO].push(GA);
      }
      console.log(goatArray);
      _this.db.get('pas').find({ pa: devPa }).assign({ groat: goatArray }).write();
      _fs2.default.writeFileSync(FILE_TO_WATCH, 'Die GOA wurde gespeicher: ' + goatArray);
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

  return GroupObjectAssociationScanner;
}();

exports.default = GroupObjectAssociationScanner;