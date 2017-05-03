'use strict';

var _NumberConverter = require('./NumberConverter');

var _NumberConverter2 = _interopRequireDefault(_NumberConverter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
  * Diese Funktioen erstellt Lesbare GA aus einem HEX String.
**/
exports.hexToGa = function (hexGa) {
  var binGa = _NumberConverter2.default.hex2bin(hexGa);
  var mainGroup = binGa.substr(1, 4);
  var meddelGroup = binGa.substr(5, 3);
  var underGroup = binGa.substr(8, 8);
  return _NumberConverter2.default.bin2dez(mainGroup) + '/' + _NumberConverter2.default.bin2dez(meddelGroup) + '/' + _NumberConverter2.default.bin2dez(underGroup);
};

/**
  * Diese Funktioen erstellt Lesbare GA aus einem bit Wert.
**/
exports.binToGa = function (binGa) {
  var mainGroup = binGa.substr(1, 4);
  var meddelGroup = binGa.substr(5, 3);
  var underGroup = binGa.substr(8, 8);
  return _NumberConverter2.default.bin2dez(mainGroup) + '/' + _NumberConverter2.default.bin2dez(meddelGroup) + '/' + _NumberConverter2.default.bin2dez(underGroup);
};