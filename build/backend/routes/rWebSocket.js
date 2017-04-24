'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = create;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FILE_TO_WATCH = _path2.default.resolve(__dirname, '../log/knxscan.log');

function create() {
  var router = new _express2.default.Router();
  router.ws('/getScanResoult', function (ws, req) {
    console.log('New connection has opened!');
    _fs2.default.watch(FILE_TO_WATCH, function (eventType, filename) {
      if (filename) {
        _fs2.default.readFile(FILE_TO_WATCH, 'utf8', function (err, data) {
          if (err) {
            console.log('err:', err);
          }
          ws.send(data);
        });
      } else {
        console.log(filename);
      }
    });
    ws.on('message', function (msg) {
      console.log('yes!');
      ws.send(msg);
    });
    console.log('socket', req.testing);
  });
  return router;
}