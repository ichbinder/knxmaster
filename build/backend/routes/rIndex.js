'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _lowdb = require('lowdb');

var _lowdb2 = _interopRequireDefault(_lowdb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = new _express2.default.Router();
var db = (0, _lowdb2.default)(__dirname, '/wlanDB.json');

db.defaults({ wlanproblems: [] }).write();

router.post('/getprob', function (req, res) {
  var wlanproblems = req.body.wlanproblems;
  if (!wlanproblems) {
    res.json({
      message: 'Es gab ein Problem, die Wlan Informationen sind lehr.',
      error: true
    });
  } else {
    wlanproblems.id = db.get('wlanproblems').size() + 1;
    db.get('wlanproblems').push(wlanproblems).write();
    res.json({
      message: 'Danke für deine mithilfe!',
      error: false
    });
  }
});

router.get('/getdb', function (req, res) {
  res.json(db.get('wlanproblems').value());
});

router.get('/', function (req, res) {
  res.render('pIndex');
});

module.exports = router;