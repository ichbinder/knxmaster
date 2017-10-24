'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = create;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _lowdb = require('lowdb');

var _lowdb2 = _interopRequireDefault(_lowdb);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _KNXConnector = require('../knx/KNXConnector');

var _KNXConnector2 = _interopRequireDefault(_KNXConnector);

var _KNXMapWrapper = require('../knx/KNXMapWrapper');

var _KNXMapWrapper2 = _interopRequireDefault(_KNXMapWrapper);

var _KNXScan = require('../knx/KNXScan');

var _KNXScan2 = _interopRequireDefault(_KNXScan);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// dies ist die Log-Datei. Alles was in dieser Log-Datei geschrieben wird wird ans
// Scan PA Frontend gesendet.
var FILE_TO_WATCH = _path2.default.resolve(__dirname, '../log/knxscan.log');

// Hier muss die IP des KNX-Routers eingetragen werden.
var IP = '141.45.187.222';
// const IP = '192.168.3.110';

// der Path zu den JSON-Datenbanken
var dbKnxBus = (0, _lowdb2.default)(_path2.default.resolve(__dirname, '../db/knxbusDB.json'));
var apiDB = (0, _lowdb2.default)(_path2.default.resolve(__dirname, '../db/apiDB.json'));

// Folgende DPT sind erlaubt
var dptTable = { DPT1: 0, DPT3: 3, DPT5: 7 };

// Inizialiesierung der JSON-Datenbanken
dbKnxBus.defaults({ pas: [] }).write();

apiDB.defaults({ ga: [] }).write();

function create() {
  var router = new _express2.default.Router();
  console.log('test_for!');

  _KNXConnector2.default.create(IP).then(function (connection) {
    /**
      * Mit dieser Route ist es möglich direckt mit dem KNX-Bus zu komunizieren.
      * connection.write - Etwas auf den KNX Bus senden
      * connection.on - auf dem KNX bus horchen ob etwas kommt als
      * GroupValue_Response nur zum testen.
      * connection.read - versucht eine Response ab zufangen, das klappt aber
      * er nur bei alten geräten
    **/
    console.log('test_after!  ', connection);
    router.post('/writeDpt', function (req, res) {
      console.log('jojo');
      console.log(req.body.ga, req.body.value, req.body.dpt);
      connection.write(req.body.ga, req.body.value, req.body.dpt);
      var timeOut = false;
      setTimeout(function () {
        timeOut = true;res.json({ error: 'no connection.' });
      }, 3000);
      connection.on('GroupValue_Response', function (src, value) {
        console.log('src', src, 'valueDPT', value);
      });
      connection.read(req.body.ga, function (src, valueDPT) {
        console.log('src', src, 'valueDPT', valueDPT);
        if (!timeOut) res.json({
          pa: src,
          value: valueDPT
        });else {
          console.log('Timeout for:', req.body.ga, 'DPT:', req.body.dpt, 'Value:', req.body.value);
        }
      });
    });

    /**
      * Dies ist der BusMonitor. Die daten werden per Websoket an die webseitet geschickt.
    **/
    router.ws('/busMonitor', function (ws, req) {
      connection.on('event', function (evt, src, dest, value) {
        var hexValue = new Buffer(value, 'hex').toString('hex');
        ws.send('KNX EVENT: ' + evt + ', src: ' + src + ', dest: ' + dest + ', value: ' + hexValue);
      });
      ws.on('message', function (msg) {
        console.log('yes2!');
        ws.send(msg);
      });
      console.log('socket', req.testing);
    });
  }).catch(function (err) {
    return console.log('Error:', err);
  });

  /**
    * Bei dieser Funktion wird die LogFile per Websoket an die webseite geschickt.
  **/
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
      console.log('yes1!');
      ws.send(msg);
    });
    console.log('socket', req.testing);
  });

  /**
    * Hier wird der Scan Proces gestartet.
    * Erst wird  der Bus  mit knxScan.scan auf: GA, GO und DPT gescannt.
    * Als nächstes werden die gesamelten Daten verarbeitet in knxScan.generateGOInDB.
    * Dann wird die JSON-Datenbanken gereinigt von allten Daten in  knxScan.clearDB.
  **/
  router.post('/scanKnx', function (req, res) {
    if (!req.body.phyAddress) res.send('error: pleas tip phyAddress.');else {
      var knxConnect = new _KNXMapWrapper2.default(IP);
      var knxScan = new _KNXScan2.default(knxConnect, dbKnxBus, 'pas');
      knxScan.scan(req.body.phyAddress).then(function () {
        return knxScan.generateGOInDB();
      }).then(function () {
        return knxScan.clearDB();
      }).then(function () {
        return res.send('ok');
      }).catch(function (error) {
        return console.log(error);
      });
    }
  });

  /**
    * Es gibt zwei JSON-Datenbanken.
    * Eine für die gescannten Daten und eine für die eingeben der Benutzer.
    * In dieser Funktion werden beide JSON-Datenbanken zusammen gebracht und dann an den
    * Benutzer (Webseite) geschickt.
    * Dabei wird so vorgegangen. Erst wird geguckt ob es Daten zu einer bestimmten GR gibt
    * in der Benuter Datenbake und wenn nicht werden die unfolstendingen aus der Scan DB genommen.
  **/
  router.get('/getAllGaOfDPT', function (req, res) {
    var arrayGA = [];
    var result = dbKnxBus.get('pas').map('gro').filter(Boolean).value();
    for (var i = 0; i < Object.keys(result).length; i++) {
      var keys = Object.keys(result[i]);
      for (var j = 0; j < keys.length; j++) {
        if (result[i][keys[j]].DPT === parseInt(req.query.dpt, 10)) {
          for (var h = 0; h < result[i][keys[j]].ga.length; h++) {
            if (arrayGA.indexOf(result[i][keys[j]].ga[h]) === -1) arrayGA.push(result[i][keys[j]].ga[h]);
          }
        }
      }
    }
    var building = apiDB.get('ga').filter(Boolean).value();

    var dptRaw = Object.keys(dptTable).map(function (k) {
      return dptTable[k];
    });
    var buildingTmp = [];
    var dptKey = Object.keys(dptTable)[dptRaw.indexOf(parseInt(req.query.dpt, 10))];
    var antiDuplikat = [];
    for (var _i = 0; _i < building.length; _i++) {
      if (buildingTmp.indexOf(building[_i]) === -1) {
        if (building[_i].DPT === dptKey) {
          buildingTmp.push({
            ga: building[_i].ga,
            DPT: building[_i].DPT,
            gebaeude: building[_i].gebaeude,
            raum: building[_i].raum,
            funktion: building[_i].funktion,
            kommentar: building[_i].kommentar
          });
          antiDuplikat.push(building[_i].ga);
        }
      }
    }
    // console.log( Object.keys( dptTable )[parseInt( req.query.dpt, 10 )] );
    for (var _j = 0; _j < arrayGA.length; _j++) {
      if (antiDuplikat.indexOf(arrayGA[_j]) === -1) {
        buildingTmp.push({
          ga: arrayGA[_j],
          DPT: Object.keys(dptTable)[dptRaw.indexOf(parseInt(req.query.dpt, 10))],
          gebaeude: '',
          raum: '',
          funktion: '',
          kommentar: ''
        });
      }
    }
    res.send({ building: buildingTmp });
  });

  /**
    * Hier werden die zusatz Daten in die Benutzer Datenbake gespeichert.
    * Gebaeude, Raum, Funktion, Kommentar, ga, DPT, werden gespeichert.
    * Dabie wird daruf geachtet ob es schon einen Beitrag gibt für die GA oder nicht.
    * Update oder Neu erstellen.
  **/
  router.post('/saveGa', function (req, res) {
    var errorDB = { error: '' };
    if (!req.body.ga) errorDB.error += ' Bitte ga eingeben. ';
    if (!req.body.DPT) errorDB.error += ' Bitte DPT eingeben. ';
    if (!req.body.gebaeude) errorDB.error += ' Bitte gebaeude eingeben. ';
    if (!req.body.raum) errorDB.error += ' Bitte raum eingeben. ';
    if (!req.body.funktion) errorDB.error += ' Bitte funktion eingeben. ';
    if (!req.body.kommentar) req.body.kommentar = '';

    if (errorDB.error === '') {
      if (!apiDB.get('ga').find({ ga: req.body.ga }).value()) {
        apiDB.get('ga').push({
          ga: req.body.ga,
          DPT: req.body.DPT,
          gebaeude: req.body.gebaeude,
          raum: req.body.raum,
          funktion: req.body.funktion,
          kommentar: req.body.kommentar
        }).write();
      } else {
        apiDB.get('ga').find({ ga: req.body.ga }).assign({
          DPT: req.body.DPT,
          gebaeude: req.body.gebaeude,
          raum: req.body.raum,
          funktion: req.body.funktion,
          kommentar: req.body.kommentar
        }).write();
      }

      res.json({ msg: 'save ok!' });
    } else res.json(errorDB);
  });

  return router;
}