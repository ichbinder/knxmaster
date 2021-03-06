'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = new _express2.default.Router();

router
/**
  * Rendern von dem Frontend
**/
.get('/', function (req, res) {
  res.render('pIndex');
})
/**
  * Rendern von dem Frontend
**/
.get('/apitsday', function (req, res) {
  res.render('pCarsten');
}).get('/raum113', function (req, res) {
  res.render('pRaum113');
});

module.exports = router;