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

var FILE_TO_WATCH = _path2.default.resolve(__dirname, '../log/knxscan.log');

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
  '0020': 5,
  '0021': 5,
  '0701': 6,
  5705: 6
};

var GroupObjectScanner = function () {
  function GroupObjectScanner(kNXMapWrapper, deviceDB) {
    _classCallCheck(this, GroupObjectScanner);

    this.kNXMapWrapper = kNXMapWrapper;
    this.db = deviceDB;
  }

  _createClass(GroupObjectScanner, [{
    key: 'scanGrOT',
    value: function scanGrOT() {
      var _this2 = this;

      return new Promise(function (resolve) {
        var logText = '\n      ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\n      ,,,,,,,,,,,,,  start GrOT scan ,,,,,,,,,,,,,\n      ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\n      ';
        console.log(logText);
        _fs2.default.writeFileSync(FILE_TO_WATCH, logText);
        var devPas = _this2.db.get('pas').filter(function (i) {
          if (!i.grot) return i;
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
                return _this._realisationType7(_this, devPas[sum].pa).then(function () {
                  return loop(sum += 1, stop);
                });
              } else if (gaMask[devPas[sum].mask] === 5) {
                return _this._realisationType3GrOTEasy2(_this, devPas[sum].pa).then(function () {
                  return loop(sum += 1, stop);
                });
              } else if (gaMask[devPas[sum].mask] === 6) {
                return _this._realisationType3GrOTEasy3(_this, devPas[sum].pa).then(function () {
                  return loop(sum += 1, stop);
                });
              }
              return new Promise(function (resolveLoop) {
                return resolveLoop(true);
              }).then(function () {
                logText = 'keine GrO f\xFCr ' + devPas[sum].pa + ' gefunden!!!';
                console.log(logText);
                _fs2.default.writeFileSync(FILE_TO_WATCH, logText);
                return loop(sum += 1, stop);
              });
            }
          })(0, devPas.length).then(function () {
            console.log('GrOT Done');
            resolve(true);
          });
        } else {
          logText = 'GrOT: keine pa musste bearbeitet werden.';
          console.log(logText);
          _fs2.default.writeFileSync(FILE_TO_WATCH, logText);
          resolve(false);
        }
      });
    }
  }, {
    key: '_realisationType1',
    value: function _realisationType1(_this, devPa) {
      var grAssocTabPtrTmp = null;
      return _this.kNXMapWrapper.memoryRead(devPa, '0x0112', 1).then(function (grAssocTabPtr) {
        grAssocTabPtrTmp = _NumberConverter2.default.dez2hex(_NumberConverter2.default.hex2dez('100') + _NumberConverter2.default.hex2dez(grAssocTabPtr));
        console.log('grAssocTabPtr:', grAssocTabPtr);
        if (!grAssocTabPtr) return new Promise(function (resolve) {
          return resolve(false);
        });
        return _this.kNXMapWrapper.memoryRead(devPa, grAssocTabPtrTmp);
      }).then(function (countGO) {
        console.log('countGO:', countGO);
        console.log('Typ1 countgo:', countGO);
        _fs2.default.writeFileSync(FILE_TO_WATCH, 'Typ1 countgo: ' + countGO);
        if (!countGO) return new Promise(function (resolve) {
          return resolve(false);
        });
        return _this._readGotFromMemory(_this, _this._addMemoryAddress(grAssocTabPtrTmp, 2), _NumberConverter2.default.hex2dez(countGO) * 3, devPa);
      }).then(function (memoryGrotDump) {
        console.log(memoryGrotDump);
        if (!memoryGrotDump) return new Promise(function (resolve) {
          return resolve(false);
        });
        var splitter = 6;
        var countGOT = memoryGrotDump.length / splitter;
        var grotArray = [];
        for (var i = 0; i < countGOT; i += 1) {
          var grot = memoryGrotDump.substring(i * splitter, (i + 1) * splitter);
          var bitGrot = _NumberConverter2.default.hex2bin(grot.substring(4, splitter));
          var DPT = _NumberConverter2.default.bin2dez(bitGrot.substring(2, 8));
          grotArray.push(DPT);
        }
        console.log(grotArray);
        _this.db.get('pas').find({ pa: devPa }).assign({ grot: grotArray }).write();
        return new Promise(function (resolve) {
          return resolve(true);
        });
      });
    }
  }, {
    key: '_realisationType7',
    value: function _realisationType7(_this, devPa) {
      var gotMemoryAddressTmp = '';
      return _this.kNXMapWrapper.propertyValueRead(devPa, 7, 3).then(function (grotMemoryAddress) {
        gotMemoryAddressTmp = grotMemoryAddress;
        if (!grotMemoryAddress) return new Promise(function (resolve) {
          return resolve(false);
        });
        return _this.kNXMapWrapper.memoryRead(devPa, grotMemoryAddress, 2);
      }).then(function (countGOT) {
        if (!countGOT) return new Promise(function (resolve) {
          return resolve(false);
        });
        return _this._readGotFromMemory(_this, _this._addMemoryAddress(gotMemoryAddressTmp, 2), _NumberConverter2.default.hex2dez(countGOT) * 2, devPa);
      }).then(function (memoryGrotDump) {
        console.log(memoryGrotDump);
        if (!memoryGrotDump) return new Promise(function (resolve) {
          return resolve(false);
        });
        _this._saveGot(_this, memoryGrotDump, devPa, 4);
        return new Promise(function (resolve) {
          return resolve(true);
        });
      });
    }
  }, {
    key: '_realisationType3GrOTEasy2',
    value: function _realisationType3GrOTEasy2(_this, devPa) {
      var gaMemoryAddressTmp = '';
      return _this.kNXMapWrapper.propertyValueRead(devPa, 7, 3).then(function (gaMemoryAddress) {
        gaMemoryAddressTmp = gaMemoryAddress;
        if (!gaMemoryAddress) return new Promise(function (resolve) {
          return resolve(false);
        });
        return _this.kNXMapWrapper.memoryRead(devPa, gaMemoryAddress, 1);
      }).then(function (countGa) {
        if (!countGa) return new Promise(function (resolve) {
          return resolve(false);
        });
        return _this._readGotFromMemory(_this, _this._addMemoryAddress(gaMemoryAddressTmp, 2), _NumberConverter2.default.hex2dez(countGa) * 3, devPa);
      }).then(function (memoryGrotDump) {
        console.log(memoryGrotDump);
        if (!memoryGrotDump) return new Promise(function (resolve) {
          return resolve(false);
        });
        var splitter = 6;
        var countGOT = memoryGrotDump.length / splitter;
        var grotArray = [];
        for (var i = 0; i < countGOT; i += 1) {
          var grot = memoryGrotDump.substring(i * splitter, (i + 1) * splitter);
          var bitGrot = _NumberConverter2.default.hex2bin(grot.substring(4, splitter));
          var DPT = _NumberConverter2.default.bin2dez(bitGrot.substring(2, 8));
          grotArray.push(DPT);
        }
        console.log(grotArray);
        _this.db.get('pas').find({ pa: devPa }).assign({ grot: grotArray }).write();
        return new Promise(function (resolve) {
          return resolve(true);
        });
      });
    }
  }, {
    key: '_realisationType3GrOTEasy3',
    value: function _realisationType3GrOTEasy3(_this, devPa) {
      return new Promise(function (resolve, reject) {
        var gaMemoryAddressTmp = '';
        return _this.kNXMapWrapper.propertyValueRead(devPa, 7, 3).then(function (gaMemoryAddress) {
          gaMemoryAddressTmp = gaMemoryAddress;
          if (!gaMemoryAddress) return resolve(false);
          return _this.kNXMapWrapper.memoryRead(devPa, gaMemoryAddress, 1);
        }).then(function (countGa) {
          console.log('countGa', countGa);
          if (!countGa) return resolve(false);
          return _this._readGotFromMemory(_this, _this._addMemoryAddress(gaMemoryAddressTmp, 3), _NumberConverter2.default.hex2dez(countGa) * 4, devPa);
        }).then(function (memoryGrotDump) {
          console.log('memoryGrotDump', memoryGrotDump);
          if (!memoryGrotDump) return resolve(false);
          var splitter = 8;
          var countGOT = memoryGrotDump.length / splitter;
          var grotArray = [];
          for (var i = 0; i < countGOT; i += 1) {
            var grot = memoryGrotDump.substring(i * splitter, (i + 1) * splitter);
            var bitGrot = _NumberConverter2.default.hex2bin(grot.substring(6, splitter));
            var DPT = _NumberConverter2.default.bin2dez(bitGrot.substring(2, 8));
            grotArray.push(DPT);
          }
          console.log(grotArray);
          _this.db.get('pas').find({ pa: devPa }).assign({ grot: grotArray }).write();
          return resolve(true);
        }).catch(function (err) {
          return reject(err);
        });
      });
    }
  }, {
    key: '_readGotFromMemory',
    value: function _readGotFromMemory(_this, memAddress, addressCount, devPa) {
      return new Promise(function (resolve) {
        var gaResolve = '';
        console.log('addressCount', addressCount);
        _fs2.default.writeFileSync(FILE_TO_WATCH, 'addressCount: ' + addressCount);
        if (!(addressCount > 0) || addressCount === null) return resolve(false);
        (function loop(sum, stop) {
          if (sum < stop) {
            if (stop > 12) return _this.kNXMapWrapper.memoryRead(devPa, memAddress, 12).then(function (memoryGrotDump) {
              console.log('mehr als 12 memdump:', memoryGrotDump);
              _fs2.default.writeFileSync(FILE_TO_WATCH, 'mehr als 12 memdump: ' + memoryGrotDump);
              gaResolve += memoryGrotDump;
              stop -= 12;
              memAddress = _this._addMemoryAddress(memAddress, 12);
              return loop(sum, stop);
            });
            return _this.kNXMapWrapper.memoryRead(devPa, memAddress, stop).then(function (memoryGrotDump) {
              console.log('wehniger als 12 memdump:', memoryGrotDump);
              _fs2.default.writeFileSync(FILE_TO_WATCH, 'wehniger als 12 memdump: ' + memoryGrotDump);
              gaResolve += memoryGrotDump;
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
  }, {
    key: '_saveGot',
    value: function _saveGot(_this, memoryGrotDump, devPa, splitter) {
      var countGOT = memoryGrotDump.length / splitter;
      var grotArray = [];
      for (var i = 0; i < countGOT; i += 1) {
        var grot = memoryGrotDump.substring(i * splitter, (i + 1) * splitter);
        var DPT = _NumberConverter2.default.hex2dez(grot.substring(splitter / 2, splitter));
        grotArray.push(DPT);
      }
      console.log(grotArray);
      _this.db.get('pas').find({ pa: devPa }).assign({ grot: grotArray }).write();
      _fs2.default.writeFileSync(FILE_TO_WATCH, 'Die GO wurde gespeicher: ' + grotArray);
    }
  }, {
    key: '_saveGotRT1',
    value: function _saveGotRT1(_this, memoryGrotDump, devPa, splitter) {
      var countGOT = memoryGrotDump.length / splitter;
      var grotArray = [];
      for (var i = 0; i < countGOT; i += 1) {
        var grot = memoryGrotDump.substring(i * splitter, (i + 1) * splitter);
        var DPT = _NumberConverter2.default.hex2dez(grot.substring(splitter / 2, splitter));
        grotArray.push(DPT);
      }
      console.log(grotArray);
      _this.db.get('pas').find({ pa: devPa }).assign({ grot: grotArray }).write();
      _fs2.default.writeFileSync(FILE_TO_WATCH, 'Die GO wurde gespeicher: ' + grotArray);
    }
  }, {
    key: '_addMemoryAddress',
    value: function _addMemoryAddress(memAddress, dez) {
      console.log('memAddress:', memAddress);
      _fs2.default.writeFileSync(FILE_TO_WATCH, 'memAddress: ' + memAddress);
      console.log('memAddress + dez -> hex:', _NumberConverter2.default.dez2hex(_NumberConverter2.default.hex2dez(memAddress) + dez));
      _fs2.default.writeFileSync(FILE_TO_WATCH, 'memAddress + dez -> hex: ' + _NumberConverter2.default.dez2hex(_NumberConverter2.default.hex2dez(memAddress) + dez));
      return _NumberConverter2.default.dez2hex(_NumberConverter2.default.hex2dez(memAddress) + dez);
    }
  }]);

  return GroupObjectScanner;
}();

exports.default = GroupObjectScanner;