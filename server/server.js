var Cylon     = require('cylon');
var fs        = require('fs');
var mqtt      = require('mqtt');
var hasValue  = require('has-value');

// Things io settings etc. Use your own ThingToken, you can find it at your dashboard
var thingToken    = 'paste your thing token here'
var thingTopic    = 'v2/things/'+thingToken

// Intermediate and root certificates chain to validate *.thethings.io domain
var CA_INTERM = [
    fs.readFileSync(__dirname + '/certs/COMODORSAOrganizationValidationSecureServerCA.pem')
    , fs.readFileSync(__dirname + '/certs/COMODORSAAddTrustCA.pem')
    , fs.readFileSync(__dirname + '/certs/AddTrustExternalCARoot.crt')
]

// MQTT client
var client = mqtt.connect({
    port: 8883,
    protocol : 'mqtts',
    host: 'mqtt.thethings.io',
    ca : CA_INTERM,
    rejectUnauthorized: true,
    will: {
        topic: thingTopic,
        payload: JSON.stringify({values:[{key:'device_is_down',value:true}]})
    }
})

// Subscribe
client.on('connect', function(){
    console.log('Connected to thethings.io')
    client.subscribe(thingTopic, function(err, granted){
        console.log(err, granted)
    })
})

// API
Cylon.api({
  host: "0.0.0.0",
  port: "8090",
  //ssl: {
  //  cert: './certs/server.crt',
  //  key: './certs/server.key'
  //},
  ssl: 'false'
});

// Initialize the robot
Cylon.robot({

  name: "arduino",

  // Available commands
  commands: function() {
    return {
      toggle_led_1: this.toggle_led_1,
      toggle_led_2: this.toggle_led_2,
      toggle_led_3: this.toggle_led_3
    };
  },

  // Connections (MQTT/devices etc.)
  connections: {
    arduino: { adaptor: 'firmata', port: '/dev/tty.usbserial-AL00TXWF' } // the port will be different on various platforms. On linux it usually is: /dev/ttyUSBx on Macos it will be /dev/tty.usbserial-AL00TXWF
  },

  devices: {
    led_1:        { connection: 'arduino', driver: 'led', pin: 7 },
    led_2:        { connection: 'arduino', driver: 'led', pin: 8 },
    led_3:        { connection: 'arduino', driver: 'led', pin: 9 }
    //relay:        { connection: 'arduino', driver: 'relay', pin: 10, type: "open" },
  },

  // Led notification animations
  toggle_led_1: function() {
    var led = this.led_1
    led.toggle();
  },
  toggle_led_2: function() {
    var led = this.led_2
    led.toggle();
  },
  toggle_led_3: function() {
    var led = this.led_3
    led.toggle();
  },

  work: function(my) {
 
    // Do something on specific MQTT messages with a component. In this case the leds!
    client.on('message',function(topic, message){
      // Toggle leds!
      var led_1 = JSON.stringify([{"key":"led_1","value":"toggle"}])
      if(message == led_1) {
        my.toggle_led_1();
      } else {
        // Handle your error here
      }
      var led_2 = JSON.stringify([{"key":"led_2","value":"toggle"}])
      if(message == led_2) {
        my.toggle_led_2();
      } else {
        // Handle your error here
      }
      var led_3 = JSON.stringify([{"key":"led_3","value":"toggle"}])
      if(message == led_3) {
        my.toggle_led_3();
      } else {
        // Handle your error here
      }

    })

    client.on('error',function(err){
      console.error('client error', err)
    })
    // end MQTT messages

    after((1).seconds(), function() {

    });
    
    every((2).seconds(), function() {
    
    });

  }

}).start();