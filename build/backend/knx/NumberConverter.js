"use strict";

exports.hex2dez = function (hex) {
  return Number(parseInt(hex, 16).toString(10));
};

exports.dez2hex = function (dez) {
  return parseInt(dez, 10).toString(16);
};

exports.bin2dez = function (bin) {
  return Number(parseInt(bin, 2).toString(10));
};

exports.hex2bin = function (hex) {
  var hexLength = hex.length;
  var binTmp = parseInt(hex, 16).toString(2);
  var binLength = binTmp.length;
  if (hexLength * 4 > binLength) {
    for (var i = 0; i < hexLength * 4 - binLength; i += 1) {
      binTmp = "" + 0 + binTmp;
    }
  }
  return binTmp;
};

exports.bin2hex = function (bin) {
  var binLength = bin.length;
  var hexTmp = parseInt(bin, 2).toString(16);
  var hexLength = hexTmp.length;
  if (binLength / 4 > hexLength) {
    for (var i = 0; i < binLength / 4 - hexLength; i += 1) {
      hexTmp = "" + 0 + hexTmp;
    }
  }
  return hexTmp;
};