'use strict';

var _jsonServer = require('json-server');

var _jsonServer2 = _interopRequireDefault(_jsonServer);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _rKnxapi = require('../routes/rKnxapi');

var _rKnxapi2 = _interopRequireDefault(_rKnxapi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var server = _jsonServer2.default.create();
var router = _jsonServer2.default.router('knxbusDB.json');
var middlewares = _jsonServer2.default.defaults();

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);
server.set('views', '' + _path2.default.resolve(__dirname, '../views'));
server.set('view engine', 'pug');

server.use(_express2.default.static('' + _path2.default.resolve(__dirname, '../../frontend')));

server.set('port', process.env.PORT || 8007);

// Add custom routes before JSON Server router
server.get('/echo', function (req, res) {
  res.jsonp(req.query);
});

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(_jsonServer2.default.bodyParser);

// Use default router
server.use(router);
server.use('/knxapi', _rKnxapi2.default);

// Error Handling
server.use(function (req, res) {
  res.type('text/plain');
  res.status(404);
  res.send('404 - Not Found');
});

server.use(function (err, req, res) {
  console.error(err.stack);
  res.type('text/plain');
  res.status(500);
  res.send('500 - Internal error');
});

server.listen(server.get('port'), function () {
  console.log('Express ready on http://localhost:' + server.get('port'));
});