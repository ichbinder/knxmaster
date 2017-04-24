'use strict';

var knx = require('knx');

var connection = new knx.Connection({
  ipAddr: '192.168.3.100', // ip address of the KNX router or interface
  ipPort: 3671, // the UDP port of the router or interface
  physAddr: '1.1.251', // the KNX physical address we want to use
  debug: false, // print lots of debug output to the console
  // manualConnect: true, // do not automatically connect, but use connection.Connect() to establish connection
  minimumDelay: 10, // wait at least 10 millisec between each datagram
  handlers: {
    // wait for connection establishment before doing anything
    connected: function connected() {
      // Get a nice greeting when connected.
      console.log('Hurray, I can talk KNX!');
      // WRITE an arbitrary write request to a binary group address
      // connection.write("2/1/25", 0);
      // you also WRITE to an explicit datapoint type, eg. DPT9.001 is temperature Celcius
      // connection.write("1/1/7", 30, "DPT5");
      // you can also issue a READ request and pass a callback to capture the response
      // connection.read("1/0/1", (src, responsevalue) => { ... });
    },

    // get notified for all KNX events:
    event: function event(evt, src, dest, value) {
      console.log('event: %s, src: %j, dest: %j, value: %j', evt, src, dest, value);
    },

    // get notified on connection errors
    error: function error(connstatus) {
      console.log('**** ERROR: %j', connstatus);
    }
  }
});
// connection.on('DeviceDescriptor_Read', function ("1.1.251", "1.1.25", value) { ... });)