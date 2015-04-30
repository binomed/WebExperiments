var SonicSocket = require('../lib/waterjef/sonic-socket.js');
var SonicServer = require('../lib/waterjef/sonic-server.js');
var SonicCoder = require('../lib/waterjef/sonic-coder.js');


document.addEventListener("DOMContentLoaded", function(event) { 
  //do work
	var ALPHABET = '0123456789';
	//var MESSAGE = '1'; 

	
	// On some other machine:
	sserver = new SonicServer({alphabet: ALPHABET, peakThreshold: -50});
	/*sserver.on('message', function(message) {
	  // message is '31415'. Do something with it.
	  console.log(message);
	});*/
	sserver.setDebug(true);
	sserver.start();
	
});


