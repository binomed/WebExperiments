var SonicSocket = require('../lib/waterjef/sonic-socket.js');
var SonicServer = require('../lib/waterjef/sonic-server.js');
var SonicCoder = require('../lib/waterjef/sonic-coder.js');


document.addEventListener("DOMContentLoaded", function(event) { 
  //do work
	//var ALPHABET = '0123456789';
	//var MESSAGE = '1';

	var button = document.querySelector('#message');
	button.addEventListener('click', onButton);

	function onButton() {
		sendFreq();
	  //ssocket = new SonicSocket({alphabet: ALPHABET, charDuration: 10/*0.2*/});
	  //ssocket.send(MESSAGE);
	}

	// On some other machine:
	//sserver = new SonicServer({alphabet: ALPHABET});
	//sserver.on('message', function(message) {
	  // message is '31415'. Do something with it.
	//  console.log(message);
	//});
	//sserver.start();


	var audioContext = window.audioContext || new webkitAudioContext();


	function sendFreq(){

		context = audioContext;
		oscillator = context.createOscillator();
		oscillator.frequency.value = 19000;

		oscillator.connect(context.destination);

		oscillator.start(0);

		setTimeout(function() {
			oscillator.stop();
		}, 5000);

		/*var gainNode = audioContext.createGain();
		// Gain => Merger
		gainNode.gain.value = 1;

		gainNode.gain.setValueAtTime(1, 0);
		//gainNode.gain.linearRampToValueAtTime(1, startTime + this.rampDuration);
		//gainNode.gain.setValueAtTime(1, startTime + duration - this.rampDuration);
		//gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

		gainNode.connect(audioContext.destination);

		var osc = audioContext.createOscillator();
		osc.frequency.value = 19000;
		osc.connect(gainNode);

		osc.start(0);*/
	}

});


