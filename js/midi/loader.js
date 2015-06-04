/*
	----------------------------------------------------------
	MIDI.Plugin : 2015-06-04
	----------------------------------------------------------
	https://github.com/mudcube/MIDI.js
	----------------------------------------------------------
	Inspired by javax.sound.midi (albeit a super simple version): 
		http://docs.oracle.com/javase/6/docs/api/javax/sound/midi/package-summary.html
	----------------------------------------------------------
	Technologies
	----------------------------------------------------------
		Web MIDI API - no native support yet (jazzplugin)
		Web Audio API - firefox 25+, chrome 10+, safari 6+, opera 15+
		HTML5 Audio Tag - ie 9+, firefox 3.5+, chrome 4+, safari 4+, opera 9.5+, ios 4+, android 2.3+
	----------------------------------------------------------
*/

if (typeof MIDI === 'undefined') MIDI = {};

MIDI.Soundfont = MIDI.Soundfont || {};
MIDI.player = MIDI.player || {};

(function(MIDI) { 'use strict';

	if (typeof console !== 'undefined' && console.log) {
		console.log('%c♥ MIDI.js 0.4.2 ♥', 'color: red;');
	}

	MIDI.DEBUG = true;
	MIDI.USE_XHR = true;
	MIDI.soundfontUrl = './soundfont/';

	/*
		MIDI.loadPlugin({
			audioFormat: 'mp3', // optionally can force to use MP3 (for instance on mobile networks)
			onsuccess: function() { },
			onprogress: function(state, percent) { },
			instrument: 'acoustic_grand_piano', // or 1 (default)
			instruments: [ 'acoustic_grand_piano', 'acoustic_guitar_nylon' ] // or multiple instruments
		});
	*/

	MIDI.loadPlugin = function(opts, onsuccess, onerror, onprogress) {
		if (typeof opts === 'function') opts = {onsuccess: opts};
		opts = opts || {};
		opts.api = opts.api || MIDI.__api;
		
		function onDetect(supports) {
			var hash = location.hash;
			var api = '';

			/// use the most appropriate plugin if not specified
			if (supports[opts.api]) {
				api = opts.api;
			} else if (supports[hash.substr(1)]) {
				api = hash.substr(1);
			} else if (supports.webmidi) {
				api = 'webmidi';
			} else if (window.AudioContext) { // Chrome
				api = 'webaudio';
			} else if (window.Audio) { // Firefox
				api = 'audiotag';
			}

			if (connect[api]) {
				/// use audio/ogg when supported
				if (opts.audioFormat) {
					var audioFormat = opts.audioFormat;
				} else { // use best quality
					var audioFormat = supports['audio/ogg'] ? 'ogg' : 'mp3';
				}

				/// load the specified plugin
				MIDI.__api = api;
				MIDI.__audioFormat = audioFormat;
				MIDI.supports = supports;
				MIDI.loadProgram(opts);
			}
		};

		///		
		if (opts.soundfontUrl) {
			MIDI.soundfontUrl = opts.soundfontUrl;
		}

		/// Detect the best type of audio to use
		if (MIDI.supports) {
			onDetect(MIDI.supports);
		} else {
			MIDI.audioDetect(onDetect);
		}
	};

	/*
		MIDI.loadProgram('banjo', onsuccess, onerror, onprogress);
		MIDI.loadProgram({
			instrument: 'banjo',
			onsuccess: function(){},
			onerror: function(){},
			onprogress: function(state, percent){}
		})
	*/

	MIDI.loadProgram = (function() {

		function asList(opts) {
			var res = opts.instruments || opts.instrument || MIDI.channels[0].program;
			if (typeof res !== 'object') {
				if (res === undefined) {
					res = [];
				} else {
					res = [res];
				}
			}
			/// program number -> id
			for (var i = 0; i < res.length; i ++) {
				var instrument = res[i];
				if (instrument === +instrument) { // is numeric
					if (MIDI.GM.byId[instrument]) {
						res[i] = MIDI.GM.byId[instrument].id;
					}
				}
			}
			return res;
		};

		return function(opts, onsuccess, onerror, onprogress) {
			opts = opts || {};
			if (typeof opts !== 'object') opts = {instrument: opts};
			if (onerror) opts.onerror = onerror;
			if (onprogress) opts.onprogress = onprogress;
			if (onsuccess) opts.onsuccess = onsuccess;
			///
			opts.format = MIDI.__audioFormat;
			opts.instruments = asList(opts);
			///
			connect[MIDI.__api](opts);
		};
	})();
	
	var connect = {
		webmidi: function(opts) {
			// cant wait for this to be standardized!
			MIDI.WebMIDI.connect(opts);
		},
		audiotag: function(opts) {
			// works ok, kinda like a drunken tuna fish, across the board
			// http://caniuse.com/audio
			requestQueue(opts, 'AudioTag');
		},
		webaudio: function(opts) {
			// works awesome! safari, chrome and firefox support
			// http://caniuse.com/web-audio
			requestQueue(opts, 'WebAudio');
		}
	};

	function requestQueue(opts, context) {
		var audioFormat = opts.format;
		var instruments = opts.instruments;
		var onprogress = opts.onprogress;
		var onerror = opts.onerror;
		///
		var length = instruments.length;
		var pending = length;
		///
		function onEnd() {
			onprogress && onprogress('load', 1.0);
			MIDI[context].connect(opts);
		};
		///
		if (length) {
			for (var i = 0; i < length; i ++) {
				var programId = instruments[i];
				if (MIDI.Soundfont[programId]) { // already loaded
					!--pending && onEnd();
				} else { // needs to be requested
					sendRequest(instruments[i], audioFormat, function(evt, progress) {
						var fileProgress = progress / length;
						var queueProgress = (length - pending) / length;
						onprogress && onprogress('load', fileProgress + queueProgress, programId);
					}, function() {
						!--pending && onEnd();
					}, onerror);
				}
			}
		} else {
			onEnd();
		}
	};

	function sendRequest(programId, audioFormat, onprogress, onsuccess, onerror) {
		var soundfontPath = MIDI.soundfontUrl + programId + '-' + audioFormat + '.js';
		if (MIDI.USE_XHR) {
			galactic.util.request({
				url: soundfontPath,
				format: 'text',
				onerror: onerror,
				onprogress: onprogress,
				onsuccess: function(event, responseText) {
					var script = document.createElement('script');
					script.language = 'javascript';
					script.type = 'text/javascript';
					script.text = responseText;
					document.body.appendChild(script);
					onsuccess();
				}
			});
		} else {
			dom.loadScript.add({
				url: soundfontPath,
				verify: 'MIDI.Soundfont["' + programId + '"]',
				onerror: onerror,
				onsuccess: function() {
					onsuccess();
				}
			});
		}
	};

	MIDI.setDefaultPlugin = function(midi) {
		for (var key in midi) {
			MIDI[key] = midi[key];
		}
	};

})(MIDI);