(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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



}).call(this,require("VCmEsw"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_72b5fd44.js","/")
},{"../lib/waterjef/sonic-coder.js":3,"../lib/waterjef/sonic-server.js":4,"../lib/waterjef/sonic-socket.js":5,"VCmEsw":9,"buffer":6}],2:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
function RingBuffer(maxLength) {
  this.array = [];
  this.maxLength = maxLength;
}

RingBuffer.prototype.get = function(index) {
  if (index >= this.array.length) {
    return null;
  }
  return this.array[index];
};

RingBuffer.prototype.last = function() {
  if (this.array.length == 0) {
    return null;
  }
  return this.array[this.array.length - 1];
}

RingBuffer.prototype.add = function(value) {
  // Append to the end, remove from the front.
  this.array.push(value);
  if (this.array.length >= this.maxLength) {
    this.array.splice(0, 1);
  }
};

RingBuffer.prototype.length = function() {
  // Return the actual size of the array.
  return this.array.length;
};

RingBuffer.prototype.clear = function() {
  this.array = [];
};

RingBuffer.prototype.copy = function() {
  // Returns a copy of the ring buffer.
  var out = new RingBuffer(this.maxLength);
  out.array = this.array.slice(0);
  return out;
};

RingBuffer.prototype.remove = function(index, length) {
  //console.log('Removing', index, 'through', index+length);
  this.array.splice(index, length);
};

module.exports = RingBuffer;

}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../lib/waterjef/ring-buffer.js","/../lib/waterjef")
},{"1YiZ5S":9,"buffer":6}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * A simple sonic encoder/decoder for [a-z0-9] => frequency (and back).
 * A way of representing characters with frequency.
 */
var ALPHABET = '\n abcdefghijklmnopqrstuvwxyz0123456789,.!?@*';

function SonicCoder(params) {
  params = params || {};
  this.freqMin = params.freqMin || 18500;
  this.freqMax = params.freqMax || 19500;
  this.freqError = params.freqError || 50;
  this.alphabetString = params.alphabet || ALPHABET;
  this.startChar = params.startChar || '^';
  this.endChar = params.endChar || '$';
  // Make sure that the alphabet has the start and end chars.
  this.alphabet = this.startChar + this.alphabetString + this.endChar;
}

/**
 * Given a character, convert to the corresponding frequency.
 */
SonicCoder.prototype.charToFreq = function(char) {
  // Get the index of the character.
  var index = this.alphabet.indexOf(char);
  if (index == -1) {
    // If this character isn't in the alphabet, error out.
    console.error(char, 'is an invalid character.');
    index = this.alphabet.length - 1;
  }
  // Convert from index to frequency.
  var freqRange = this.freqMax - this.freqMin;
  var percent = index / this.alphabet.length;
  var freqOffset = Math.round(freqRange * percent);
  return this.freqMin + freqOffset;
};

/**
 * Given a frequency, convert to the corresponding character.
 */
SonicCoder.prototype.freqToChar = function(freq) {
  // If the frequency is out of the range.
  if (!(this.freqMin < freq && freq < this.freqMax)) {
    // If it's close enough to the min, clamp it (and same for max).
    if (this.freqMin - freq < this.freqError) {
      freq = this.freqMin;
    } else if (freq - this.freqMax < this.freqError) {
      freq = this.freqMax;
    } else {
      // Otherwise, report error.
      console.error(freq, 'is out of range.');
      return null;
    }
  }
  // Convert frequency to index to char.
  var freqRange = this.freqMax - this.freqMin;
  var percent = (freq - this.freqMin) / freqRange;
  var index = Math.round(this.alphabet.length * percent);
  return this.alphabet[index];
};

module.exports = SonicCoder;

}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../lib/waterjef/sonic-coder.js","/../lib/waterjef")
},{"1YiZ5S":9,"buffer":6}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var RingBuffer = require('./ring-buffer.js');
var SonicCoder = require('./sonic-coder.js');

var audioContext = new (window.audioContext || window.webkitAudioContext)();
/**
 * Extracts meaning from audio streams.
 *
 * (assumes audioContext is a WebAudioContext global variable.)
 *
 * 1. Listen to the microphone.
 * 2. Do an FFT on the input.
 * 3. Extract frequency peaks in the ultrasonic range.
 * 4. Keep track of frequency peak history in a ring buffer.
 * 5. Call back when a peak comes up often enough.
 */
function SonicServer(params) {
  params = params || {};
  this.peakThreshold = params.peakThreshold || -65;
  this.minRunLength = params.minRunLength || 2;
  this.coder = params.coder || new SonicCoder(params);
  // How long (in ms) to wait for the next character.
  this.timeout = params.timeout || 300;
  this.debug = !!params.debug;

  this.peakHistory = new RingBuffer(16);
  this.peakTimes = new RingBuffer(16);

  this.callbacks = {};

  this.buffer = '';
  this.state = State.IDLE;
  this.isRunning = false;
  this.iteration = 0;
}

var State = {
  IDLE: 1,
  RECV: 2
};

/**
 * Start processing the audio stream.
 */
SonicServer.prototype.start = function() {
  // Start listening for microphone. Continue init in onStream.
  var constraints = {
    audio: { optional: [{ echoCancellation: false }] }
  };
  navigator.getUserMedia = ( navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);
  navigator.getUserMedia(constraints,
      this.onStream_.bind(this), this.onStreamError_.bind(this));
};

/**
 * Stop processing the audio stream.
 */
SonicServer.prototype.stop = function() {
  this.isRunning = false;
  this.stream.stop();
};

SonicServer.prototype.on = function(event, callback) {
  if (event == 'message') {
    this.callbacks.message = callback;
  }
};

SonicServer.prototype.setDebug = function(value) {
  this.debug = value;

  var canvas = document.querySelector('canvas');
  if (canvas) {
    // Remove it.
    canvas.parentElement.removeChild(canvas);
  }
};

SonicServer.prototype.fire_ = function(callback, arg) {
  callback(arg);
};

SonicServer.prototype.onStream_ = function(stream) {
  this.stream = stream;
  // Setup audio graph.
  var input = audioContext.createMediaStreamSource(stream);
  var analyser = audioContext.createAnalyser();
  input.connect(analyser);
  // Create the frequency array.
  this.freqs = new Float32Array(analyser.frequencyBinCount);
  // Save the analyser for later.
  this.analyser = analyser;
  this.isRunning = true;
  // Do an FFT and check for inaudible peaks.
  //this.raf_(this.loop.bind(this));
  this.raf_(this.customLoop.bind(this));
};

SonicServer.prototype.onStreamError_ = function(e) {
  console.error('Audio input error:', e);
};

/**
 * Given an FFT frequency analysis, return the peak frequency in a frequency
 * range.
 */
SonicServer.prototype.getPeakFrequency = function() {
  // Find where to start.
  var start = this.freqToIndex(this.coder.freqMin);
  // TODO: use first derivative to find the peaks, and then find the largest peak.
  // Just do a max over the set.
  var max = -Infinity;
  var index = -1;
  for (var i = start; i < this.freqs.length; i++) {
    if (this.freqs[i] > max) {
      max = this.freqs[i];
      index = i;
    }
  }
  // Only care about sufficiently tall peaks.
  if (max > this.peakThreshold) {
    console.log("Max : "+max+", for freq : "+this.indexToFreq(index));
    return this.indexToFreq(index);
  }
  return null;
};

/**
 * Given an FFT frequency analysis, return the peak frequency in a frequency
 * range.
 */
SonicServer.prototype.getCustomPeakFrequency = function() {
  // Find where to start.
  var start = this.freqToIndex(this.coder.freqMin);
  // TODO: use first derivative to find the peaks, and then find the largest peak.
  // Just do a max over the set.
  var max = -Infinity;
  var index = -1;
  for (var i = start; i < this.freqs.length; i++) {
    if (this.freqs[i] > max) {
      max = this.freqs[i];
      index = i;
    }
  }
  // Only care about sufficiently tall peaks.
  console.log("Max : "+max+", for freq : "+this.indexToFreq(index));
  if (max > this.peakThreshold) {    
    return {
      freq: this.indexToFreq(index),
      power : max
    };
  }
  return null;
};

SonicServer.prototype.customLoop = function(){
  this.analyser.getFloatFrequencyData(this.freqs);
  // Sanity check the peaks every 5 seconds.
  if ((this.iteration + 1) % (60 * 5) == 0) {
    this.restartServerIfSanityCheckFails();
  }
  // Calculate peaks, and add them to history.
  var res = this.getCustomPeakFrequency();
  if (res) {
    if (this.state = State.IDLE){
      this.state = State.RECV;
      //console.log('Recieve Freq ! '+freq);
    }
    this.fire_(this.callbacks.message, res);

    //this.peakTimes.add(new Date());
  } else {
    this.state = State.IDLE;
  }
  // DEBUG ONLY: Draw the frequency response graph.
  if (this.debug) {
    this.debugDraw_();
  }
  if (this.isRunning) {
    this.raf_(this.customLoop.bind(this));
  }
  this.iteration += 1;
}

SonicServer.prototype.loop = function() {
  this.analyser.getFloatFrequencyData(this.freqs);
  // Sanity check the peaks every 5 seconds.
  if ((this.iteration + 1) % (60 * 5) == 0) {
    this.restartServerIfSanityCheckFails();
  }
  // Calculate peaks, and add them to history.
  var freq = this.getPeakFrequency();
  if (freq) {
    var char = this.coder.freqToChar(freq);
    // DEBUG ONLY: Output the transcribed char.
    if (this.debug) {
      console.log('Transcribed char: ' + char);
    }
    this.peakHistory.add(char);
    this.peakTimes.add(new Date());
  } else {
    // If no character was detected, see if we've timed out.
    var lastPeakTime = this.peakTimes.last();
    if (lastPeakTime && new Date() - lastPeakTime > this.timeout) {
      // Last detection was over 300ms ago.
      this.state = State.IDLE;
      if (this.debug) {
        console.log('Token', this.buffer, 'timed out');
      }
      this.peakTimes.clear();
    }
  }
  // Analyse the peak history.
  this.analysePeaks();
  // DEBUG ONLY: Draw the frequency response graph.
  if (this.debug) {
    this.debugDraw_();
  }
  if (this.isRunning) {
    this.raf_(this.loop.bind(this));
  }
  this.iteration += 1;
};

SonicServer.prototype.indexToFreq = function(index) {
  var nyquist = audioContext.sampleRate/2;
  return nyquist/this.freqs.length * index;
};

SonicServer.prototype.freqToIndex = function(frequency) {
  var nyquist = audioContext.sampleRate/2;
  return Math.round(frequency/nyquist * this.freqs.length);
};

/**
 * Analyses the peak history to find true peaks (repeated over several frames).
 */
SonicServer.prototype.analysePeaks = function() {
  // Look for runs of repeated characters.
  var char = this.getLastRun();
  if (!char) {
    return;
  }
  if (this.state == State.IDLE) {
    // If idle, look for start character to go into recv mode.
    if (char == this.coder.startChar) {
      this.buffer = '';
      this.state = State.RECV;
    }
  } else if (this.state == State.RECV) {
    // If receiving, look for character changes.
    if (char != this.lastChar &&
        char != this.coder.startChar && char != this.coder.endChar) {
      this.buffer += char;
      this.lastChar = char;
    }
    // Also look for the end character to go into idle mode.
    if (char == this.coder.endChar) {
      this.state = State.IDLE;
      this.fire_(this.callbacks.message, this.buffer);
      this.buffer = '';
    }
  }
};

SonicServer.prototype.getLastRun = function() {
  var lastChar = this.peakHistory.last();
  var runLength = 0;
  // Look at the peakHistory array for patterns like ajdlfhlkjxxxxxx$.
  for (var i = this.peakHistory.length() - 2; i >= 0; i--) {
    var char = this.peakHistory.get(i);
    if (char == lastChar) {
      runLength += 1;
    } else {
      break;
    }
  }
  if (runLength > this.minRunLength) {
    // Remove it from the buffer.
    this.peakHistory.remove(i + 1, runLength + 1);
    return lastChar;
  }
  return null;
};

/**
 * DEBUG ONLY.
 */
SonicServer.prototype.debugDraw_ = function() {
  var canvas = document.querySelector('canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
  }
  canvas.width = document.body.offsetWidth;
  canvas.height = 480;
  drawContext = canvas.getContext('2d');
  // Plot the frequency data.
  for (var i = 0; i < this.freqs.length; i++) {
    var value = this.freqs[i];
    // Transform this value (in db?) into something that can be plotted.
    var height = value + 400;
    var offset = canvas.height - height - 1;
    var barWidth = canvas.width/this.freqs.length;
    drawContext.fillStyle = 'black';
    drawContext.fillRect(i * barWidth, offset, 1, 1);
  }
};

/**
 * A request animation frame shortcut. This one is intended to work even in
 * background pages of an extension.
 */
SonicServer.prototype.raf_ = function(callback) {
  var isCrx = !!(window.chrome && chrome.extension);
  if (isCrx) {
    setTimeout(callback, 1000/60);
  } else {
    requestAnimationFrame(callback);
  }
};

SonicServer.prototype.restartServerIfSanityCheckFails = function() {
  // Strange state 1: peaks gradually get quieter and quieter until they
  // stabilize around -800.
  if (this.freqs[0] < -300) {
    console.error('freqs[0] < -300. Restarting.');
    this.restart();
    return;
  }
  // Strange state 2: all of the peaks are -100. Check just the first few.
  var isValid = true;
  for (var i = 0; i < 10; i++) {
    if (this.freqs[i] == -100) {
      isValid = false;
    }
  }
  if (!isValid) {
    console.error('freqs[0:10] == -100. Restarting.');
    this.restart();
  }
}

SonicServer.prototype.restart = function() {
  //this.stop();
  //this.start();
  window.location.reload();
};


module.exports = SonicServer;

}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../lib/waterjef/sonic-server.js","/../lib/waterjef")
},{"./ring-buffer.js":2,"./sonic-coder.js":3,"1YiZ5S":9,"buffer":6}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var SonicCoder = require('./sonic-coder.js');

var audioContext = new (window.audioContext || window.webkitAudioContext)();

/**
 * Encodes text as audio streams.
 *
 * 1. Receives a string of text.
 * 2. Creates an oscillator.
 * 3. Converts characters into frequencies.
 * 4. Transmits frequencies, waiting in between appropriately.
 */
function SonicSocket(params) {
  params = params || {};
  this.coder = params.coder || new SonicCoder();
  this.charDuration = params.charDuration || 0.2;
  this.coder = params.coder || new SonicCoder(params);
  this.rampDuration = params.rampDuration || 0.001;
}


SonicSocket.prototype.send = function(input, opt_callback) {
  // Surround the word with start and end characters.
  input = this.coder.startChar + input + this.coder.endChar;
  // Use WAAPI to schedule the frequencies.
  for (var i = 0; i < input.length; i++) {
    var char = input[i];
    var freq = this.coder.charToFreq(char);
    var time = audioContext.currentTime + this.charDuration * i;
    this.scheduleToneAt(freq, time, this.charDuration);
  }

  // If specified, callback after roughly the amount of time it would have
  // taken to transmit the token.
  if (opt_callback) {
    var totalTime = this.charDuration * input.length;
    setTimeout(opt_callback, totalTime * 1000);
  }
};

SonicSocket.prototype.scheduleToneAt = function(freq, startTime, duration) {
  var gainNode = audioContext.createGain();
  // Gain => Merger
  gainNode.gain.value = 0;

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(1, startTime + this.rampDuration);
  gainNode.gain.setValueAtTime(1, startTime + duration - this.rampDuration);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

  gainNode.connect(audioContext.destination);

  var osc = audioContext.createOscillator();
  osc.frequency.value = freq;
  osc.connect(gainNode);

  osc.start(startTime);
};

module.exports = SonicSocket;

}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../lib/waterjef/sonic-socket.js","/../lib/waterjef")
},{"./sonic-coder.js":3,"1YiZ5S":9,"buffer":6}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/index.js","/../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer")
},{"1YiZ5S":9,"base64-js":7,"buffer":6,"ieee754":8}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib/b64.js","/../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib")
},{"1YiZ5S":9,"buffer":6}],8:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/ieee754/index.js","/../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/ieee754")
},{"1YiZ5S":9,"buffer":6}],9:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/gulp-browserify/node_modules/browserify/node_modules/process/browser.js","/../node_modules/gulp-browserify/node_modules/browserify/node_modules/process")
},{"1YiZ5S":9,"buffer":6}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBTb25pY1NvY2tldCA9IHJlcXVpcmUoJy4uL2xpYi93YXRlcmplZi9zb25pYy1zb2NrZXQuanMnKTtcbnZhciBTb25pY1NlcnZlciA9IHJlcXVpcmUoJy4uL2xpYi93YXRlcmplZi9zb25pYy1zZXJ2ZXIuanMnKTtcbnZhciBTb25pY0NvZGVyID0gcmVxdWlyZSgnLi4vbGliL3dhdGVyamVmL3NvbmljLWNvZGVyLmpzJyk7XG5cblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZnVuY3Rpb24oZXZlbnQpIHsgXG4gIC8vZG8gd29ya1xuXHQvL3ZhciBBTFBIQUJFVCA9ICcwMTIzNDU2Nzg5Jztcblx0Ly92YXIgTUVTU0FHRSA9ICcxJztcblxuXHR2YXIgYnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lc3NhZ2UnKTtcblx0YnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25CdXR0b24pO1xuXHR2YXIgYnV0dG9uU3RvcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzdG9wJyk7XG5cdGJ1dHRvblN0b3AuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbkJ1dHRvblN0b3ApO1xuXG5cdHZhciBzbGlkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2xpZGVyJyk7XG5cdHNsaWRlci5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBvbkNoYW5nZSk7XG5cblx0dmFyIHN0YXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3N0YXRlJyk7XG5cdHZhciB2YWx1ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN2YWx1ZScpO1xuXG5cdGZ1bmN0aW9uIG9uQnV0dG9uKCkge1xuXHRcdHN0YXRlLmlubmVySFRNTCA9ICdFbW1pc3Npb24nO1xuXHRcdHNlbmRGcmVxKCk7ICBcblx0fVxuXG5cdGZ1bmN0aW9uIG9uQnV0dG9uU3RvcCgpIHtcblx0XHRpZiAob3NjaWxsYXRvcil7XG5cdFx0XHRvc2NpbGxhdG9yLnN0b3AoKTtcblx0XHRcdHN0YXRlLmlubmVySFRNTCA9ICdTdG9wIEVtbWlzc2lvbic7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gb25DaGFuZ2UoKXtcblx0XHR2YWx1ZS5pbm5lckhUTUwgPSBzbGlkZXIudmFsdWU7XG5cdH1cblxuXHQvLyBPbiBzb21lIG90aGVyIG1hY2hpbmU6XG5cdC8vc3NlcnZlciA9IG5ldyBTb25pY1NlcnZlcih7YWxwaGFiZXQ6IEFMUEhBQkVUfSk7XG5cdC8vc3NlcnZlci5vbignbWVzc2FnZScsIGZ1bmN0aW9uKG1lc3NhZ2UpIHtcblx0ICAvLyBtZXNzYWdlIGlzICczMTQxNScuIERvIHNvbWV0aGluZyB3aXRoIGl0LlxuXHQvLyAgY29uc29sZS5sb2cobWVzc2FnZSk7XG5cdC8vfSk7XG5cdC8vc3NlcnZlci5zdGFydCgpO1xuXG5cblx0dmFyIGF1ZGlvQ29udGV4dCA9IHdpbmRvdy5hdWRpb0NvbnRleHQgfHwgbmV3IHdlYmtpdEF1ZGlvQ29udGV4dCgpO1xuXG5cblx0ZnVuY3Rpb24gc2VuZEZyZXEoKXtcblxuXHRcdGNvbnRleHQgPSBhdWRpb0NvbnRleHQ7XG5cdFx0b3NjaWxsYXRvciA9IGNvbnRleHQuY3JlYXRlT3NjaWxsYXRvcigpO1xuXHRcdG9zY2lsbGF0b3IuZnJlcXVlbmN5LnZhbHVlID0gc2xpZGVyLnZhbHVlO1xuXG5cdFx0b3NjaWxsYXRvci5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuXG5cdFx0b3NjaWxsYXRvci5zdGFydCgwKTtcblxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRvc2NpbGxhdG9yLnN0b3AoKTtcblx0XHRcdHN0YXRlLmlubmVySFRNTCA9ICdTdG9wIEVtbWlzc2lvbic7XG5cdFx0fSwgMTAwMDApO1xuXG5cdFx0Lyp2YXIgZ2Fpbk5vZGUgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuXHRcdC8vIEdhaW4gPT4gTWVyZ2VyXG5cdFx0Z2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IDE7XG5cblx0XHRnYWluTm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKDEsIDApO1xuXHRcdC8vZ2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgxLCBzdGFydFRpbWUgKyB0aGlzLnJhbXBEdXJhdGlvbik7XG5cdFx0Ly9nYWluTm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKDEsIHN0YXJ0VGltZSArIGR1cmF0aW9uIC0gdGhpcy5yYW1wRHVyYXRpb24pO1xuXHRcdC8vZ2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBzdGFydFRpbWUgKyBkdXJhdGlvbik7XG5cblx0XHRnYWluTm9kZS5jb25uZWN0KGF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XG5cblx0XHR2YXIgb3NjID0gYXVkaW9Db250ZXh0LmNyZWF0ZU9zY2lsbGF0b3IoKTtcblx0XHRvc2MuZnJlcXVlbmN5LnZhbHVlID0gMTkwMDA7XG5cdFx0b3NjLmNvbm5lY3QoZ2Fpbk5vZGUpO1xuXG5cdFx0b3NjLnN0YXJ0KDApOyovXG5cdH1cblxufSk7XG5cblxuIl0sImZpbGUiOiJtYWluLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=