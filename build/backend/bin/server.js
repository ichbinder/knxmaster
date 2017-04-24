'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _jsonServer = require('json-server');

var _jsonServer2 = _interopRequireDefault(_jsonServer);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _expressWs = require('express-ws');

var _expressWs2 = _interopRequireDefault(_expressWs);

var _rKnxapi = require('../routes/rKnxapi');

var _rKnxapi2 = _interopRequireDefault(_rKnxapi);

var _rFrontend = require('../routes/rFrontend');

var _rFrontend2 = _interopRequireDefault(_rFrontend);

var _rWebSocket = require('../routes/rWebSocket');

var _rWebSocket2 = _interopRequireDefault(_rWebSocket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var expressWs = (0, _expressWs2.default)((0, _express2.default)());
var app = expressWs.app;
// const app = express();

app.set('port', process.env.PORT || 8005);

// laden den bodyParser
app.use(_bodyParser2.default.urlencoded({ extended: true }));
app.use(_bodyParser2.default.json());

// View engine
app.set('views', '' + _path2.default.resolve(__dirname, '../views'));
app.set('view engine', 'pug');

// Lade die Statischen Datein in die Middleware
app.use(_express2.default.static('' + _path2.default.resolve(__dirname, '../../frontend')));

// Meine eigenen Routes werden hier bekoant gemacht
app.use('/api', (0, _rKnxapi2.default)());
app.use('/web', _rFrontend2.default);
app.use('/socket', (0, _rWebSocket2.default)());

app.use(_jsonServer2.default.defaults());
app.use(_jsonServer2.default.rewriter({}));
app.use(_jsonServer2.default.router('./apiDB.json'));

// Error Handling
app.use(function (req, res) {
  res.type('text/plain');
  res.status(404);
  res.send('404 - Not Found');
});

app.use(function (err, req, res) {
  console.error(err.stack);
  res.type('text/plain');
  res.status(500);
  res.send('500 - Internal error');
});

app.listen(app.get('port'), function () {
  console.log('Express ready on http://localhost:' + app.get('port'));
});