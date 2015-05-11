var SonicSocket = require('../lib/waterjef/sonic-socket.js');
var SonicServer = require('../lib/waterjef/sonic-server.js');
var SonicCoder = require('../lib/waterjef/sonic-coder.js');


document.addEventListener("DOMContentLoaded", function(event) { 
  //do work
	//var ALPHABET = '0123456789';
	//var MESSAGE = '1';

	var button = document.querySelector('#message');
	button.addEventListener('click', onButton);
	var buttonStop = document.querySelector('#stop');
	buttonStop.addEventListener('click', onButtonStop);

	var slider = document.querySelector('#slider');
	slider.addEventListener('change', onChange);

	var state = document.querySelector('#state');
	var value = document.querySelector('#value');

	function onButton() {
		state.innerHTML = 'Emmission';
		sendFreq(); 
	}

	function onButtonStop() {
		if (oscillator){
			oscillator.stop();
			state.innerHTML = 'Stop Emmission';
		}
	}

	function onChange(){
		value.innerHTML = slider.value;
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
		oscillator.frequency.value = slider.value;

		oscillator.connect(context.destination);

		oscillator.start(0);

		setTimeout(function() {
			oscillator.stop();
			state.innerHTML = 'Stop Emmission';
		}, 10000);

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


