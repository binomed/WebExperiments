var SonicSocket = require('../lib/waterjef/sonic-socket.js');
var SonicServer = require('../lib/waterjef/sonic-server.js');
var SonicCoder = require('../lib/waterjef/sonic-coder.js');


document.addEventListener("DOMContentLoaded", function(event) { 
  //do work
	var ALPHABET = '0123456789';
	//var MESSAGE = '1'; 

	var showMe = document.getElementById('showMe');
	showMe.style.display = 'none';
	var freq = document.getElementById('freq');
	var power = document.getElementById('power');
	
	// On some other machine:
	sserver = new SonicServer({alphabet: ALPHABET, peakThreshold: -150});
	sserver.setDebug(true);
	sserver.on('message', function(message){

		if (showMe.style.display === 'none'){
			showMe.style.display = '';
		}
		freq.innerHTML = message.freq+"Mhz";
		power.innerHTML = message.power+"db";
		console.info('Recieve message : %d Mhz, %d db',message.freq, message.power);
	});
	sserver.start();
	
});


