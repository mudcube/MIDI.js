/*
	----------------------------------------------------------
	MIDI.audioDetect : 2015-05-16
	----------------------------------------------------------
	https://github.com/mudcube/MIDI.js
	----------------------------------------------------------
	Probably, Maybe, No... Absolutely!
	Test to see what types of <audio> MIME types are playable by the browser.
	----------------------------------------------------------
*/

if (typeof MIDI === 'undefined') MIDI = {};

(function(root) { 'use strict';

	var supports = {}; // object of supported file types
	var pending = 0; // pending file types to process
	///
	function canPlayThrough(src) { // check whether format plays through
		pending ++;
		///
		var body = document.body;
		var audio = new Audio();
		var mime = src.split(';')[0];
		audio.id = 'audio';
		audio.setAttribute('preload', 'auto');
		audio.setAttribute('audiobuffer', true);
		audio.addEventListener('error', function() {
			body.removeChild(audio);
			supports[mime] = false;
			pending --;
		}, false);
		audio.addEventListener('canplaythrough', function() {
			body.removeChild(audio);
			supports[mime] = true;
			pending --;
		}, false);
		audio.src = 'data:' + src;
		body.appendChild(audio);
	};

	root.audioDetect = function(onsuccess) {

		/// detect midi plugin
		if (navigator.requestMIDIAccess) {
			var toString = Function.prototype.toString;
			var isNative = toString.call(navigator.requestMIDIAccess).indexOf('[native code]') !== -1;
			if (isNative) { // has native midi support
				supports['webmidi'] = true;
			} else { // check for jazz plugin support
				for (var n = 0; navigator.plugins.length > n; n ++) {
					var plugin = navigator.plugins[n];
					if (plugin.name.indexOf('Jazz-Plugin') >= 0) {
						supports['webmidi'] = true;
					}
				}
			}
		}

		/// check whether <audio> tag is supported
		if (typeof Audio === 'undefined') {
			onsuccess(supports);
			return;
		} else {
			supports['audiotag'] = true;

			/// check for webaudio api support
			if (window.AudioContext || window.webkitAudioContext) {
				supports['webaudio'] = true;
			}

			/// check whether canPlayType is supported
			var audio = new Audio();
			if (audio.canPlayType) {

				/// see what we can learn from the browser
				var vorbis = audio.canPlayType('audio/ogg; codecs="vorbis"');
				vorbis = (vorbis === 'probably' || vorbis === 'maybe');
				var mpeg = audio.canPlayType('audio/mpeg');
				mpeg = (mpeg === 'probably' || mpeg === 'maybe');

				// maybe nothing is supported
				if (!vorbis && !mpeg) {
					onsuccess(supports);
					return;
				}

				/// or maybe something is supported
				if (vorbis) canPlayThrough('audio/ogg;base64,T2dnUwACAAAAAAAAAADqnjMlAAAAAOyyzPIBHgF2b3JiaXMAAAAAAUAfAABAHwAAQB8AAEAfAACZAU9nZ1MAAAAAAAAAAAAA6p4zJQEAAAANJGeqCj3//////////5ADdm9yYmlzLQAAAFhpcGguT3JnIGxpYlZvcmJpcyBJIDIwMTAxMTAxIChTY2hhdWZlbnVnZ2V0KQAAAAABBXZvcmJpcw9CQ1YBAAABAAxSFCElGVNKYwiVUlIpBR1jUFtHHWPUOUYhZBBTiEkZpXtPKpVYSsgRUlgpRR1TTFNJlVKWKUUdYxRTSCFT1jFloXMUS4ZJCSVsTa50FkvomWOWMUYdY85aSp1j1jFFHWNSUkmhcxg6ZiVkFDpGxehifDA6laJCKL7H3lLpLYWKW4q91xpT6y2EGEtpwQhhc+211dxKasUYY4wxxsXiUyiC0JBVAAABAABABAFCQ1YBAAoAAMJQDEVRgNCQVQBABgCAABRFcRTHcRxHkiTLAkJDVgEAQAAAAgAAKI7hKJIjSZJkWZZlWZameZaouaov+64u667t6roOhIasBACAAAAYRqF1TCqDEEPKQ4QUY9AzoxBDDEzGHGNONKQMMogzxZAyiFssLqgQBKEhKwKAKAAAwBjEGGIMOeekZFIi55iUTkoDnaPUUcoolRRLjBmlEluJMYLOUeooZZRCjKXFjFKJscRUAABAgAMAQICFUGjIigAgCgCAMAYphZRCjCnmFHOIMeUcgwwxxiBkzinoGJNOSuWck85JiRhjzjEHlXNOSuekctBJyaQTAAAQ4AAAEGAhFBqyIgCIEwAwSJKmWZomipamiaJniqrqiaKqWp5nmp5pqqpnmqpqqqrrmqrqypbnmaZnmqrqmaaqiqbquqaquq6nqrZsuqoum65q267s+rZru77uqapsm6or66bqyrrqyrbuurbtS56nqqKquq5nqq6ruq5uq65r25pqyq6purJtuq4tu7Js664s67pmqq5suqotm64s667s2rYqy7ovuq5uq7Ks+6os+75s67ru2rrwi65r66os674qy74x27bwy7ouHJMnqqqnqq7rmarrqq5r26rr2rqmmq5suq4tm6or26os67Yry7aumaosm64r26bryrIqy77vyrJui67r66Ys67oqy8Lu6roxzLat+6Lr6roqy7qvyrKuu7ru+7JuC7umqrpuyrKvm7Ks+7auC8us27oxuq7vq7It/KosC7+u+8Iy6z5jdF1fV21ZGFbZ9n3d95Vj1nVhWW1b+V1bZ7y+bgy7bvzKrQvLstq2scy6rSyvrxvDLux8W/iVmqratum6um7Ksq/Lui60dd1XRtf1fdW2fV+VZd+3hV9pG8OwjK6r+6os68Jry8ov67qw7MIvLKttK7+r68ow27qw3L6wLL/uC8uq277v6rrStXVluX2fsSu38QsAABhwAAAIMKEMFBqyIgCIEwBAEHIOKQahYgpCCKGkEEIqFWNSMuakZM5JKaWUFEpJrWJMSuaclMwxKaGUlkopqYRSWiqlxBRKaS2l1mJKqcVQSmulpNZKSa2llGJMrcUYMSYlc05K5pyUklJrJZXWMucoZQ5K6iCklEoqraTUYuacpA46Kx2E1EoqMZWUYgupxFZKaq2kFGMrMdXUWo4hpRhLSrGVlFptMdXWWqs1YkxK5pyUzDkqJaXWSiqtZc5J6iC01DkoqaTUYiopxco5SR2ElDLIqJSUWiupxBJSia20FGMpqcXUYq4pxRZDSS2WlFosqcTWYoy1tVRTJ6XFklKMJZUYW6y5ttZqDKXEVkqLsaSUW2sx1xZjjqGkFksrsZWUWmy15dhayzW1VGNKrdYWY40x5ZRrrT2n1mJNMdXaWqy51ZZbzLXnTkprpZQWS0oxttZijTHmHEppraQUWykpxtZara3FXEMpsZXSWiypxNhirLXFVmNqrcYWW62ltVprrb3GVlsurdXcYqw9tZRrrLXmWFNtBQAADDgAAASYUAYKDVkJAEQBAADGMMYYhEYpx5yT0ijlnHNSKucghJBS5hyEEFLKnINQSkuZcxBKSSmUklJqrYVSUmqttQIAAAocAAACbNCUWByg0JCVAEAqAIDBcTRNFFXVdX1fsSxRVFXXlW3jVyxNFFVVdm1b+DVRVFXXtW3bFn5NFFVVdmXZtoWiqrqybduybgvDqKqua9uybeuorqvbuq3bui9UXVmWbVu3dR3XtnXd9nVd+Bmzbeu2buu+8CMMR9/4IeTj+3RCCAAAT3AAACqwYXWEk6KxwEJDVgIAGQAAgDFKGYUYM0gxphhjTDHGmAAAgAEHAIAAE8pAoSErAoAoAADAOeecc84555xzzjnnnHPOOeecc44xxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY0wAwE6EA8BOhIVQaMhKACAcAABACCEpKaWUUkoRU85BSSmllFKqFIOMSkoppZRSpBR1lFJKKaWUIqWgpJJSSimllElJKaWUUkoppYw6SimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaVUSimllFJKKaWUUkoppRQAYPLgAACVYOMMK0lnhaPBhYasBAByAwAAhRiDEEJpraRUUkolVc5BKCWUlEpKKZWUUqqYgxBKKqmlklJKKbXSQSihlFBKKSWUUkooJYQQSgmhlFRCK6mEUkoHoYQSQimhhFRKKSWUzkEoIYUOQkmllNRCSB10VFIpIZVSSiklpZQ6CKGUklJLLZVSWkqpdBJSKamV1FJqqbWSUgmhpFZKSSWl0lpJJbUSSkklpZRSSymFVFJJJYSSUioltZZaSqm11lJIqZWUUkqppdRSSiWlkEpKqZSSUmollZRSaiGVlEpJKaTUSimlpFRCSamlUlpKLbWUSkmptFRSSaWUlEpJKaVSSksppRJKSqmllFpJKYWSUkoplZJSSyW1VEoKJaWUUkmptJRSSymVklIBAEAHDgAAAUZUWoidZlx5BI4oZJiAAgAAQABAgAkgMEBQMApBgDACAQAAAADAAAAfAABHARAR0ZzBAUKCwgJDg8MDAAAAAAAAAAAAAACAT2dnUwAEAAAAAAAAAADqnjMlAgAAADzQPmcBAQA=');
				if (mpeg) canPlayThrough('audio/mpeg;base64,/+MYxAAAAANIAUAAAASEEB/jwOFM/0MM/90b/+RhST//w4NFwOjf///PZu////9lns5GFDv//l9GlUIEEIAAAgIg8Ir/JGq3/+MYxDsLIj5QMYcoAP0dv9HIjUcH//yYSg+CIbkGP//8w0bLVjUP///3Z0x5QCAv/yLjwtGKTEFNRTMuOTeqqqqqqqqqqqqq/+MYxEkNmdJkUYc4AKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');

				/// lets find out!
				var startTime = Date.now();
				var interval = setInterval(function() {
					var maxExecution = Date.now() - startTime > 5000;
					if (!pending || maxExecution) {
						clearInterval(interval);
						onsuccess(supports);
					}
				}, 1);
			} else {
				onsuccess(supports);
				return;
			}
		}
	};

})(MIDI);
/*
	----------------------------------------------------------
	GeneralMIDI : 2012-01-06
	----------------------------------------------------------
*/

(function(MIDI) { 'use strict';

	function asId(name) {
		return name.replace(/[^a-z0-9_ ]/gi, '').
				    replace(/[ ]/g, '_').
				    toLowerCase();
	};
	
	var GM = (function(arr) {
		var res = {};
		var byCategory = res.byCategory = {};
		var byId = res.byId = {};
		var byName = res.byName = {};
		///
		for (var key in arr) {
			var list = arr[key];
			for (var n = 0, length = list.length; n < length; n++) {
				var instrument = list[n];
				if (instrument) {
					var id = parseInt(instrument.substr(0, instrument.indexOf(' ')), 10);
					var name = instrument.replace(id + ' ', '');
					var nameId = asId(name);
					var categoryId = asId(key);
					///
					var spec = {
						id: nameId,
						name: name,
						program: --id,
						category: key
					};
					///
					byId[id] = spec;
					byName[nameId] = spec;
					byCategory[categoryId] = byCategory[categoryId] || [];
					byCategory[categoryId].push(spec);
				}
			}
		}
		return res;
	})({
		'Piano': ['1 Acoustic Grand Piano', '2 Bright Acoustic Piano', '3 Electric Grand Piano', '4 Honky-tonk Piano', '5 Electric Piano 1', '6 Electric Piano 2', '7 Harpsichord', '8 Clavinet'],
		'Chromatic Percussion': ['9 Celesta', '10 Glockenspiel', '11 Music Box', '12 Vibraphone', '13 Marimba', '14 Xylophone', '15 Tubular Bells', '16 Dulcimer'],
		'Organ': ['17 Drawbar Organ', '18 Percussive Organ', '19 Rock Organ', '20 Church Organ', '21 Reed Organ', '22 Accordion', '23 Harmonica', '24 Tango Accordion'],
		'Guitar': ['25 Acoustic Guitar (nylon)', '26 Acoustic Guitar (steel)', '27 Electric Guitar (jazz)', '28 Electric Guitar (clean)', '29 Electric Guitar (muted)', '30 Overdriven Guitar', '31 Distortion Guitar', '32 Guitar Harmonics'],
		'Bass': ['33 Acoustic Bass', '34 Electric Bass (finger)', '35 Electric Bass (pick)', '36 Fretless Bass', '37 Slap Bass 1', '38 Slap Bass 2', '39 Synth Bass 1', '40 Synth Bass 2'],
		'Strings': ['41 Violin', '42 Viola', '43 Cello', '44 Contrabass', '45 Tremolo Strings', '46 Pizzicato Strings', '47 Orchestral Harp', '48 Timpani'],
		'Ensemble': ['49 String Ensemble 1', '50 String Ensemble 2', '51 Synth Strings 1', '52 Synth Strings 2', '53 Choir Aahs', '54 Voice Oohs', '55 Synth Choir', '56 Orchestra Hit'],
		'Brass': ['57 Trumpet', '58 Trombone', '59 Tuba', '60 Muted Trumpet', '61 French Horn', '62 Brass Section', '63 Synth Brass 1', '64 Synth Brass 2'],
		'Reed': ['65 Soprano Sax', '66 Alto Sax', '67 Tenor Sax', '68 Baritone Sax', '69 Oboe', '70 English Horn', '71 Bassoon', '72 Clarinet'],
		'Pipe': ['73 Piccolo', '74 Flute', '75 Recorder', '76 Pan Flute', '77 Blown Bottle', '78 Shakuhachi', '79 Whistle', '80 Ocarina'],
		'Synth Lead': ['81 Lead 1 (square)', '82 Lead 2 (sawtooth)', '83 Lead 3 (calliope)', '84 Lead 4 (chiff)', '85 Lead 5 (charang)', '86 Lead 6 (voice)', '87 Lead 7 (fifths)', '88 Lead 8 (bass + lead)'],
		'Synth Pad': ['89 Pad 1 (new age)', '90 Pad 2 (warm)', '91 Pad 3 (polysynth)', '92 Pad 4 (choir)', '93 Pad 5 (bowed)', '94 Pad 6 (metallic)', '95 Pad 7 (halo)', '96 Pad 8 (sweep)'],
		'Synth Effects': ['97 FX 1 (rain)', '98 FX 2 (soundtrack)', '99 FX 3 (crystal)', '100 FX 4 (atmosphere)', '101 FX 5 (brightness)', '102 FX 6 (goblins)', '103 FX 7 (echoes)', '104 FX 8 (sci-fi)'],
		'Ethnic': ['105 Sitar', '106 Banjo', '107 Shamisen', '108 Koto', '109 Kalimba', '110 Bagpipe', '111 Fiddle', '112 Shanai'],
		'Percussive': ['113 Tinkle Bell', '114 Agogo', '115 Steel Drums', '116 Woodblock', '117 Taiko Drum', '118 Melodic Tom', '119 Synth Drum', '129 Percussion'],
		'Sound effects': ['120 Reverse Cymbal', '121 Guitar Fret Noise', '122 Breath Noise', '123 Seashore', '124 Bird Tweet', '125 Telephone Ring', '126 Helicopter', '127 Applause', '128 Gunshot']
	});
	
	GM.getProgramSpec = function(program) {
		var spec;
		if (typeof program === 'string') {
			spec = GM.byName[asId(program)];
		} else {
			spec = GM.byId[program];
		}
		if (spec) {
			return spec;
		} else {
			MIDI.handleError('invalid program', arguments);
		}
	};


	/* getProgram | programChange
	--------------------------------------------------- */
	MIDI.getProgram = function(channelId) {
		return getParam('program', channelId);
	};

	MIDI.programChange = function(channelId, program, delay) {
		var spec = GM.getProgramSpec(program);
		if (spec && isFinite(program = spec.program)) {
			setParam('program', channelId, program, delay);
		}
	};


	/* getMono | setMono
	--------------------------------------------------- */
	MIDI.getMono = function(channelId) {
		return getParam('mono', channelId);
	};

	MIDI.setMono = function(channelId, truthy, delay) {
		if (isFinite(truthy)) {
			setParam('mono', channelId, truthy, delay);
		}
	};


	/* getOmni | setOmni
	--------------------------------------------------- */
	MIDI.getOmni = function(channelId) {
		return getParam('omni', channelId);
	};

	MIDI.setOmni = function(channelId, truthy, delay) {
		if (isFinite(truthy)) {
			setParam('omni', channelId, truthy, delay);
		}
	};


	/* getSolo | setSolo
	--------------------------------------------------- */
	MIDI.getSolo = function(channelId) {
		return getParam('solo', channelId);
	};

	MIDI.setSolo = function(channelId, truthy, delay) {
		if (isFinite(truthy)) {
			setParam('solo', channelId, truthy, delay);
		}
	};
	
	function getParam(param, channelId) {
		var channel = channels[channelId];
		if (channel) {
			return channel[param];
		}
	};

	function setParam(param, channelId, value, delay) {
		var channel = channels[channelId];
		if (channel) {
			if (delay) {
				setTimeout(function() { //- is there a better option?
					channel[param] = value;
				}, delay);
			} else {
				channel[param] = value;
			}
			///
			var wrapper = MIDI.messageHandler[param] || messageHandler[param];
			if (wrapper) {
				wrapper(channelId, value, delay);
			}
		}
	};


	/* channels
	--------------------------------------------------- */
	var channels = (function() {
		var res = {};
		for (var number = 0; number <= 15; number++) {
			res[number] = {
				number: number,
				program: number,
				pitchBend: 0,
				mute: false,
				mono: false,
				omni: false,
				solo: false
			};
		}
		return res;
	})();


	/* note conversions
	--------------------------------------------------- */
	MIDI.keyToNote = {}; // C8  == 108
	MIDI.noteToKey = {}; // 108 ==  C8

	(function() {
		var A0 = 0x15; // first note
		var C8 = 0x6C; // last note
		var number2key = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
		for (var n = A0; n <= C8; n++) {
			var octave = (n - 12) / 12 >> 0;
			var name = number2key[n % 12] + octave;
			MIDI.keyToNote[name] = n;
			MIDI.noteToKey[n] = name;
		}
	})();
	

	/* expose
	--------------------------------------------------- */
	MIDI.channels = channels;
	MIDI.GM = GM;
	

	/* handle message
	--------------------------------------------------- */
	MIDI.messageHandler = {}; // overrides
	
	var messageHandler = { // defaults
		program: function(channelId, program, delay) {
			if (MIDI.__api) {
				if (MIDI.player.isPlaying) {
					MIDI.player.pause();
					MIDI.loadProgram(program, MIDI.player.play);
				} else {
					MIDI.loadProgram(program);
				}
			}
		}
	};


	/* handle errors
	--------------------------------------------------- */
	MIDI.handleError = function(type, args) {
		if (console && console.error) {
			console.error(type, args);
		}
	};

})(MIDI);
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
/*
	----------------------------------------------------------
	MIDI.player : 2015-05-16
	----------------------------------------------------------
	https://github.com/mudcube/MIDI.js
	----------------------------------------------------------
*/

if (typeof MIDI === 'undefined') MIDI = {};
if (typeof MIDI.player === 'undefined') MIDI.player = {};

(function() { 'use strict';

var player = MIDI.player;
player.currentTime = 0; // current time within current song
player.duration = 0; // duration of current song
player.isPlaying = false;
///
player.BPM = null; // beats-per-minute override
player.timeDelay = 0; // in seconds
player.timeWarp = 1.0; // warp beats-per-minute
player.transpose = 0; // transpose notes up or down


/* Playback
---------------------------------------------------------- */
player.play =
player.start = function(onsuccess) {
	player.currentTime = clamp(0, player.duration, player.currentTime);
    startAudio(player.currentTime, null, onsuccess);
};

player.stop = function() {
	stopAudio();
	player.currentTime = 0;
};

player.pause = function() {
	stopAudio();
};

player.toggle = function() {
	if (player.isPlaying) {
		player.pause();
	} else {
		player.play();
	}
};


/* Listeners
---------------------------------------------------------- */
player.on =
player.addListener = function(onsuccess) {
	onPacketListener = onsuccess;
};

player.off =
player.removeListener = function() {
	onPacketListener = undefined;
};

player.clearAnimation = function() {
	player.frameId && cancelAnimationFrame(player.frameId);
};

player.setAnimation = function(callback) {
	var currentTime = 0;
	var nowSys = 0;
	var nowMidi = 0;
	//
	player.clearAnimation();
	///
	requestAnimationFrame(function frame() {
		player.frameId = requestAnimationFrame(frame);
		///
		if (player.duration) {
			if (player.isPlaying) {
				currentTime = (nowMidi === player.currentTime) ? nowSys - Date.now() : 0;
				///
				if (player.currentTime === 0) {
					currentTime = 0;
				} else {
					currentTime = player.currentTime - currentTime;
				}
				if (nowMidi !== player.currentTime) {
					nowSys = Date.now();
					nowMidi = player.currentTime;
				}
			} else {
				currentTime = player.currentTime;
			}
			///
			var duration = player.duration;
			var percent = currentTime / duration;
			var total = currentTime / 1000;
			var minutes = total / 60;
			var seconds = total - (minutes * 60);
			var t1 = minutes * 60 + seconds;
			var t2 = (duration / 1000);
			if (t2 - t1 < -1.0) {
				return;
			} else {
				var progress = Math.min(1.0, t1 / t2);
				if (progress !== callback.progress) {
					callback.progress = progress;
					callback({
						progress: progress,
						currentTime: t1,
						duration: t2
					});
				}
			}
		}
	});
};


/* Load File - accepts base64 or url to MIDI File
---------------------------------------------------------- */
player.loadFile = (function() {

	function getInstrumentList() {
		var GM = MIDI.GM;
		var instruments = {};
		var programChange = {};
		var packets = player.packets;
		for (var n = 0; n < packets.length; n ++) {
			var event = packets[n][0].event;
			if (event.type === 'channel') {
				var channel = event.channel;
				switch(event.subtype) {
					case 'programChange':
						programChange[channel] = event.programNumber;
						break;
					case 'noteOn':
						var program = programChange[channel];
						if (program === +program) {
							if (handleEvent.programChange) {
								var gm = GM.byId[program];
							} else {
								var channel = MIDI.channels[channel];
								var gm = GM.byId[channel.program];
							}
							instruments[gm.id] = true;
						}
						break;
				}
			}
		}
		///
		var res = [];
		for (var key in instruments) {
			res.push(key);
		}
		return res;
	};

	function loadFile(onsuccess, onprogress, onerror) {
		try {
			player.replayer = new Replayer(MidiFile(player.currentData), 1.0 / player.timeWarp, null, player.BPM);
			player.packets = player.replayer.getData();
			player.duration = getLength();
			///
			MIDI.loadPlugin({
				instruments: getInstrumentList(),
				onsuccess: onsuccess,
				onprogress: onprogress,
				onerror: onerror
			});
		} catch(err) {
			onerror && onerror(err);
		}
	};
	
	function toBase64(data) {
		var res = [];
		var fromCharCode = String.fromCharCode;
		for (var i = 0, length = data.length; i < length; i++) {
			res[i] = fromCharCode(data.charCodeAt(i) & 255);
		}
		return res.join('');
	};

	return function(opts, onsuccess, onprogress, onerror) {
		if (typeof opts === 'string') opts = {src: opts};
		var src = opts.src;
		var onsuccess = onsuccess || opts.onsuccess;
		var onerror = onerror || opts.onerror;
		var onprogress = onprogress || opts.onprogress;
		///
		player.stop();
		///
		if (src.indexOf('base64,') !== -1) {
			player.currentData = atob(src.split(',')[1]);
			loadFile(onsuccess, onprogress, onerror);
		} else {
			var fetch = new XMLHttpRequest();
			fetch.open('GET', src);
			fetch.overrideMimeType('text/plain; charset=x-user-defined');
			fetch.onreadystatechange = function() {
				if (this.readyState === 4) {
					if (this.status === 200 && this.responseText) {
						player.currentData = toBase64(this.responseText);
						loadFile(onsuccess, onprogress, onerror);
					} else {
						onerror && onerror('Unable to load MIDI file.');
					}
				}
			};
			fetch.send();
		}
	};
})();


/* Scheduling
---------------------------------------------------------- */
var packetQueue = []; // hold events to be triggered
var packetOn = {};
///
var onPacketListener = undefined; // listener
var startTime = 0; // to measure time elapse
///
player.packets = {}; // get event for requested note

function scheduleTracking(event, note, currentTime, offset) {
	return setTimeout(function() {
		onPacketListener && onPacketListener(event);
		///
		player.currentTime = currentTime;
		///
		packetQueue.shift();
		///
		var sid = event.channel + 'x' + event.noteNumber;
		var subtype = event.subtype;
		if (subtype === 'noteOn') {
			packetOn[sid] = event;
		} else if (subtype === 'noteOff') {
			delete packetOn[sid];
		}
		///
		if (OFFSET < player.duration) {
			if (packetQueue.length < 1000) { // fill queue
				startAudio(OFFSET, true);
			} else if (player.currentTime === OFFSET) { // grab next sequence
				startAudio(OFFSET, true);
			}
		}
	}, currentTime - offset);
};


/* Start Audio
---------------------------------------------------------- */
var IDX;
var OFFSET;
function startAudio(currentTime, isPlaying, onsuccess) {
	if (!isPlaying) {
		player.isPlaying && stopAudio();
		player.isPlaying = true;
		player.packets = player.replayer.getData();
		player.duration = getLength();
	}
	///
	var messages = 0;
	var packets = player.packets;
	var length = packets.length;
	///
	var interval = packetQueue[0] && packetQueue[0].interval || 0;
	var foffset = currentTime - player.currentTime;
	///
	var now;
	var ctx = getContext();
	if (MIDI.api !== 'webaudio') {
		now = getNow();
		NOW = NOW || now;
		ctx.currentTime = (now - NOW) / 1000;
	}
	///
	startTime = ctx.currentTime;
	///
	if (isPlaying) {
		var packetIdx = IDX;
		var offset = OFFSET;
	} else {
		var obj = seekPacket(currentTime);
		var packetIdx = obj.idx;
		var offset = OFFSET = obj.offset;
	}

	while(packetIdx < length && messages <= 100) {
		var packet = packets[packetIdx];
		///
		IDX = ++ packetIdx;
		OFFSET += packet[1];
		currentTime = OFFSET - offset;
		///
		var event = packet[0].event;
		if (event.type === 'channel') {
			var subtype = event.subtype;
			if (!handleEvent[subtype]) {
				continue;
			}
			///
			var channelId = event.channel;
			var channel = MIDI.channels[channelId];
			var delay = ctx.currentTime + ((currentTime + foffset) / 1000);
			var delayMIDI = Math.max(0, delay + player.timeDelay);
			var queueTime = OFFSET - offset;
			///
			switch(subtype) {
				case 'controller':
					MIDI.setController(channelId, event.controllerType, event.value, delayMIDI);
					break;
				case 'programChange':
					MIDI.programChange(channelId, event.programNumber, delayMIDI);
					break;
				case 'pitchBend':
					MIDI.pitchBend(channelId, event.value, delayMIDI);
					break;
				case 'noteOn':
					if (!channel.mute) {
						var note = clamp(0, 127, event.noteNumber + player.transpose);
						packetQueue.push({
							event: event,
							time: queueTime,
							source: MIDI.noteOn(channelId, note, event.velocity, delayMIDI),
							interval: scheduleTracking(event, note, OFFSET, offset - foffset)
						});
						messages++;
					}
					break;
				case 'noteOff':
					if (!channel.mute) {
						var note = clamp(0, 127, event.noteNumber + player.transpose);
						packetQueue.push({
							event: event,
							time: queueTime,
							source: MIDI.noteOff(channelId, note, delayMIDI),
							interval: scheduleTracking(event, note, OFFSET, offset - foffset)
						});
						messages++;
					}
					break;
				default:
					break;
			}
		}
	}
	onsuccess && onsuccess(packetQueue);
};

function seekPacket(seekTime) {
	var packets = player.packets;
	var length = packets.length;
	for (var idx = 0, offset = 0; idx < length; idx++) {
		var packet = packets[idx];
		var packetTime = packet[1];
		if (offset + packetTime < seekTime) {
			offset += packetTime;
		} else {
			break;
		}
	}
	return {
		idx: idx,
		offset: offset
	};
};


/* Stop Audio
---------------------------------------------------------- */
function stopAudio() {
	if (player.isPlaying) {
		player.isPlaying = false;
		///
		var ctx = getContext();
		player.currentTime += (ctx.currentTime - startTime) * 1000;

		/// stop the audio, and intervals
		while(packetQueue.length) {
			var packet = packetQueue.pop();
			if (packet) {
				if (packet.source) {
					if (typeof packet.source === 'number') { // HTML5 Audio
						clearTimeout(packet.source);
					} else { // WebAudioAPI
						packet.source.disconnect(0);
					}
				}
				///
				clearTimeout(packet.interval);
			}
		}
		
		for (var sid in packetOn) {
			var event = packetOn[sid];
			onPacketListener({
				channel: event.channel,
				noteNumber: event.noteNumber,
				status: event.status - 16,
				subtype: 'noteOff',
				type: 'channel'
			});
		}
	}
};


/* Helpers
---------------------------------------------------------- */
function clamp(min, max, value) {
	return (value < min) ? min : ((value > max) ? max : value);
};

function getContext() {
	if (MIDI.api === 'webaudio') {
		return MIDI.WebAudio.getContext();
	} else {
		player.ctx = {currentTime: 0};
	}
	return player.ctx;
};

function getLength() {
	var packets =  player.packets;
	var length = packets.length;
	var totalTime = 0.0;
	for (var n = 0; n < length; n++) {
		totalTime += packets[n][1];
	}
	return totalTime;
};

var NOW;
function getNow() {
    if (window.performance && performance.now) {
        return performance.now();
    } else {
		return Date.now();
	}
};


/* Toggle event handling
---------------------------------------------------------- */
var handleEvent = {
    controller: true,
    noteOff: true,
    noteOn: true,
    pitchBend: true,
    programChange: true
};

player.handleEvent = function(type, truthy) {
	handleEvent[type] = truthy;
};

})();
/*
	----------------------------------------------------------------------
	AudioTag <audio> - OGG or MPEG Soundbank
	----------------------------------------------------------------------
	http://dev.w3.org/html5/spec/Overview.html#the-audio-element
	----------------------------------------------------------------------
*/

(function(MIDI) { 'use strict';

	window.Audio && (function() {
		var midi = MIDI.AudioTag = { api: 'audiotag' };
		var noteToKey = {};
		var channelVolume = (function() {
			var res = [];
			for (var i = 0; i < 16; i ++) {
				res[i] = 127;
			}
			return res;
		})();
		///
		var buffer_nid = -1; // current channel
		var audioBuffers = []; // the audio channels
		var notesOn = []; // instrumentId + noteId that is currently playing in each 'channel', for routing noteOff/chordOff calls
		var notes = {}; // the piano keys
		for (var nid = 0; nid < 12; nid ++) {
			audioBuffers[nid] = new Audio();
		}

		function playChannel(channelId, note) {
			if (!MIDI.channels[channelId]) return;
			var instrument = MIDI.channels[channelId].program;
			var instrumentId = MIDI.GM.byId[instrument].id;
			var note = notes[note];
			if (note) {
				var instrumentNoteId = instrumentId + '' + note.id;
				var nid = (buffer_nid + 1) % audioBuffers.length;
				var audio = audioBuffers[nid];
				notesOn[ nid ] = instrumentNoteId;
				if (!MIDI.Soundfont[instrumentId]) {
					MIDI.DEBUG && console.log('404', instrumentId);
					return;
				}
				audio.src = MIDI.Soundfont[instrumentId][note.id];
				audio.volume = channelVolume[channelId] / 127;
				audio.play();
				buffer_nid = nid;
			}
		};

		function stopChannel(channelId, note) {
			if (!MIDI.channels[channelId]) return;
			var instrument = MIDI.channels[channelId].program;
			var instrumentId = MIDI.GM.byId[instrument].id;
			var note = notes[note];
			if (note) {
				var instrumentNoteId = instrumentId + '' + note.id;
				for (var i = 0, len = audioBuffers.length; i < len; i++) {
				    var nid = (i + buffer_nid + 1) % len;
				    var cId = notesOn[nid];
				    if (cId && cId == instrumentNoteId) {
				        audioBuffers[nid].pause();
				        notesOn[nid] = null;
				        return;
				    }
				}
			}
		};
		///
		midi.audioBuffers = audioBuffers;
		midi.messageHandler = {};
		///
		midi.send = function(data, delay) { };
		midi.setController = function(channelId, type, value, delay) { };
		midi.setVolume = function(channelId, volume) {
			if (volume === +volume) {
				channelVolume[channelId] = volume;
			}
		};

		midi.pitchBend = function(channelId, program, delay) { };

		midi.noteOn = function(channelId, note, velocity, delay) {
			var id = noteToKey[note];
			if (notes[id]) {
				if (delay) {
					return setTimeout(function() {
						playChannel(channelId, id);
					}, delay * 1000);
				} else {
					playChannel(channelId, id);
				}
			}
		};
	
		midi.noteOff = function(channelId, note, delay) {
// 			var id = noteToKey[note];
// 			if (notes[id]) {
// 				if (delay) {
// 					return setTimeout(function() {
// 						stopChannel(channelId, id);
// 					}, delay * 1000)
// 				} else {
// 					stopChannel(channelId, id);
// 				}
// 			}
		};
	
		midi.chordOn = function(channelId, chord, velocity, delay) {
			for (var idx = 0; idx < chord.length; idx ++) {
				var n = chord[idx];
				var id = noteToKey[n];
				if (notes[id]) {
					if (delay) {
						return setTimeout(function() {
							playChannel(channelId, id);
						}, delay * 1000);
					} else {
						playChannel(channelId, id);
					}
				}
			}
		};
	
		midi.chordOff = function(channelId, chord, delay) {
			for (var idx = 0; idx < chord.length; idx ++) {
				var n = chord[idx];
				var id = noteToKey[n];
				if (notes[id]) {
					if (delay) {
						return setTimeout(function() {
							stopChannel(channelId, id);
						}, delay * 1000);
					} else {
						stopChannel(channelId, id);
					}
				}
			}
		};
	
		midi.stopAllNotes = function() {
			for (var nid = 0, length = audioBuffers.length; nid < length; nid++) {
				audioBuffers[nid].pause();
			}
		};
	
		midi.connect = function(opts) {
			MIDI.setDefaultPlugin(midi);
			///
			for (var key in MIDI.keyToNote) {
				noteToKey[MIDI.keyToNote[key]] = key;
				notes[key] = {id: key};
			}
			///
			opts.onsuccess && opts.onsuccess();
		};
	})();

})(MIDI);
/*
	----------------------------------------------------------
	Web Audio API - OGG | MPEG Soundbank
	----------------------------------------------------------
	http://webaudio.github.io/web-audio-api/
	----------------------------------------------------------
*/

(function(MIDI) { 'use strict';

	window.AudioContext && (function() {

		var audioContext = null; // new AudioContext();
		var useStreamingBuffer = false; // !!audioContext.createMediaElementSource;
		var midi = MIDI.WebAudio = {api: 'webaudio'};
		var ctx; // audio context
		var sources = {};
		var effects = {};
		var audioBuffers = {};
		///
		var channelVolume = (function() {
			var res = [];
			for (var i = 0; i < 16; i ++) {
				res[i] = 127;
			}
			return res;
		})();
		///
		midi.audioBuffers = audioBuffers;
		midi.messageHandler = {};
		///
		midi.send = function(data, delay) {
		
		};

		midi.setController = function(channelId, type, value, delay) {
		
		};

		midi.setVolume = function(channelId, volume, delay) {
			if (volume === +volume) {
				if (delay) {
					setTimeout(function() {
						channelVolume[channelId] = volume;
					}, delay * 1000);
				} else {
					channelVolume[channelId] = volume;
				}
			} else {
				console.warn('Volume is not finite');
			}
		};

		midi.pitchBend = function(channelId, bend, delay) {
			var channel = MIDI.channels[channelId];
			if (channel) {
				if (delay) {
					setTimeout(function() {
						channel.pitchBend = bend;
					}, delay);
				} else {
					channel.pitchBend = bend;
				}
			}
		};

		midi.noteOn = function(channelId, noteId, velocity, delay) {
			delay = delay || 0;

			/// check whether the note exists
			var channel = MIDI.channels[channelId];
			var instrumentId = channel.program;
			var bufferId = instrumentId + 'x' + noteId;
			var buffer = audioBuffers[bufferId];
			if (buffer) {
				/// convert relative delay to absolute delay
				if (delay < ctx.currentTime) {
					delay += ctx.currentTime;
				}
		
				/// create audio buffer
				if (useStreamingBuffer) {
					var source = ctx.createMediaElementSource(buffer);
				} else { // XMLHTTP buffer
					var source = ctx.createBufferSource();
					source.buffer = buffer;
				}

				/// add gain + pitchShift
				var gain = (velocity / 127) * (channelVolume[channelId] / 127) * 2.0;
				source.playbackRate.value = 1; // pitch shift 
				source.gainNode = ctx.createGain(); // gain
				source.gainNode.connect(ctx.destination);
				source.gainNode.gain.value = Math.min(1.0, Math.max(-1.0, gain));
				source.connect(source.gainNode);
				
				/// add effects to buffer
				if (effects) {
					var chain = source.gainNode;
					for (var key in effects) {
						chain.connect(effects[key].input);
						chain = effects[key];
					}
				}
				if (useStreamingBuffer) {
					if (delay) {
						return setTimeout(function() {
							buffer.currentTime = 0;
							buffer.play()
						}, delay * 1000);
					} else {
						buffer.currentTime = 0;
						buffer.play()
					}
				} else {
					source.start(delay || 0);
				}
				///
				var sourceId = channelId + 'x' + noteId;
				sources[sourceId] = source;
				return source;
			} else {
				MIDI.handleError('no buffer', arguments);
			}
		};

		midi.noteOff = function(channelId, noteId, delay) {
			delay = delay || 0;

			/// check whether the note exists
			var channel = MIDI.channels[channelId];
			var instrumentId = channel.program;
			var bufferId = instrumentId + 'x' + noteId;
			var buffer = audioBuffers[bufferId];
			if (buffer) {
				if (delay < ctx.currentTime) {
					delay += ctx.currentTime;
				}
				///
				var sourceId = channelId + 'x' + noteId;
				var source = sources[sourceId];
				if (source) {
					if (source.gainNode) {
						// @Miranet: 'the values of 0.2 and 0.3 could of course be used as 
						// a 'release' parameter for ADSR like time settings.'
						// add { 'metadata': { release: 0.3 } } to soundfont files
						var gain = source.gainNode.gain;
						gain.linearRampToValueAtTime(gain.value, delay);
						gain.linearRampToValueAtTime(0.0, delay + 0.3);
					}
					if (useStreamingBuffer) {
						if (delay) {
							setTimeout(function() {
								buffer.pause();
							}, delay * 1000);
						} else {
							buffer.pause();
						}
					} else {
						if (source.noteOff) {
							source.noteOff(delay + 0.5);
						} else {
							source.stop(delay + 0.5);
						}
					}
					///
					delete sources[sourceId];
					return source;
				}
			}
		};

		midi.chordOn = function(channel, chord, velocity, delay) {
			var res = {};
			for (var n = 0, note, len = chord.length; n < len; n++) {
				res[note = chord[n]] = midi.noteOn(channel, note, velocity, delay);
			}
			return res;
		};

		midi.chordOff = function(channel, chord, delay) {
			var res = {};
			for (var n = 0, note, len = chord.length; n < len; n++) {
				res[note = chord[n]] = midi.noteOff(channel, note, delay);
			}
			return res;
		};

		midi.stopAllNotes = function() {
			for (var sid in sources) {
				var delay = 0;
				if (delay < ctx.currentTime) {
					delay += ctx.currentTime;
				}
				var source = sources[sid];
				source.gain.linearRampToValueAtTime(1, delay);
				source.gain.linearRampToValueAtTime(0, delay + 0.3);
				if (source.noteOff) { // old api
					source.noteOff(delay + 0.3);
				} else { // new api
					source.stop(delay + 0.3);
				}
				delete sources[sid];
			}
		};

		midi.setEffects = function(list) {
			if (ctx.tunajs) {
				for (var n = 0; n < list.length; n ++) {
					var data = list[n];
					var effect = new ctx.tunajs[data.type](data);
					effect.connect(ctx.destination);
					effects[data.type] = effect;
				}
			} else {
				MIDI.handleError('effects not installed.', arguments);
				return;
			}
		};

		midi.connect = function(opts) {
			MIDI.setDefaultPlugin(midi);
			midi.setContext(ctx || createAudioContext(), opts.onsuccess);
		};
	
		midi.getContext = function() {
			return ctx;
		};
	
		midi.setContext = function(newCtx, onsuccess, onprogress, onerror) {
			ctx = newCtx;

			/// tuna.js effects module - https://github.com/Dinahmoe/tuna
			if (typeof Tuna !== 'undefined') {
				if (!(ctx.tunajs instanceof Tuna)) {
					ctx.tunajs = new Tuna(ctx);
				}
			}
		
			/// loading audio files
			var urls = [];
			var notes = MIDI.keyToNote;
			for (var key in notes) {
				urls.push(key);
			}
			///
			function waitForEnd(instrument) {
				for (var key in bufferPending) { // has pending items
					if (bufferPending[key]) {
						return;
					}
				}
				if (onsuccess) { // run onsuccess once
					onsuccess();
					onsuccess = null;
				}
			};

			function requestAudio(soundfont, programId, index, key) {
				var url = soundfont[key];
				if (url) {
					bufferPending[programId] ++;
					loadAudio(url, function(buffer) {
						buffer.id = key;
						var noteId = MIDI.keyToNote[key];
						audioBuffers[programId + 'x' + noteId] = buffer;
						///
						if (--bufferPending[programId] === 0) {
							var percent = index / 87;
							soundfont.isLoaded = true;
							MIDI.DEBUG && console.log('loaded: ', instrument);
							waitForEnd(instrument);
						}
					}, function() {
						MIDI.handleError('audio could not load', arguments);
					});
				}
			};
			///
			var bufferPending = {};
			var soundfonts = MIDI.Soundfont;
			for (var instrument in soundfonts) {
				var soundfont = soundfonts[instrument];
				if (soundfont.isLoaded) {
					continue;
				} else {
					var spec = MIDI.GM.byName[instrument];
					if (spec) {
						var programId = spec.program;
						///
						bufferPending[programId] = 0;
						///
						for (var index = 0; index < urls.length; index++) {
							var key = urls[index];
							requestAudio(soundfont, programId, index, key);
						}
					}
				}
			}
			///
			setTimeout(waitForEnd, 1);
		};


		/* Load audio file: streaming | base64 | arraybuffer
		---------------------------------------------------------------------- */
		function loadAudio(url, onsuccess, onerror) {
			if (useStreamingBuffer) {
				var audio = new Audio();
				audio.src = url;
				audio.controls = false;
				audio.autoplay = false;
				audio.preload = false;
				audio.addEventListener('canplay', function() {
					onsuccess && onsuccess(audio);
				});
				audio.addEventListener('error', function(err) {
					onerror && onerror(err);
				});
				document.body.appendChild(audio);
			} else if (url.indexOf('data:audio') === 0) { // Base64 string
				var base64 = url.split(',')[1];
				var buffer = Base64Binary.decodeArrayBuffer(base64);
				ctx.decodeAudioData(buffer, onsuccess, onerror);
			} else { // XMLHTTP buffer
				var request = new XMLHttpRequest();
				request.open('GET', url, true);
				request.responseType = 'arraybuffer';
				request.onload = function() {
					ctx.decodeAudioData(request.response, onsuccess, onerror);
				};
				request.send();
			}
		};
		
		function createAudioContext() {
			return new (window.AudioContext || window.webkitAudioContext)();
		};
	})();
})(MIDI);
/*
	----------------------------------------------------------------------
	Web MIDI API - Native Soundbanks
	----------------------------------------------------------------------
	http://webaudio.github.io/web-midi-api/
	----------------------------------------------------------------------
*/

(function(MIDI) { 'use strict';

	var output = null;
	var channels = [];
	var midi = MIDI.WebMIDI = {api: 'webmidi'};

	midi.messageHandler = {};
	midi.messageHandler.program = function(channelId, program, delay) { // change patch (instrument)
		output.send([0xC0 + channelId, program], delay * 1000);
	};

	midi.send = function(data, delay) {
		output.send(data, delay * 1000);
	};

	midi.setController = function(channelId, type, value, delay) {
		output.send([channelId, type, value], delay * 1000);
	};

	midi.setVolume = function(channelId, volume, delay) { // set channel volume
		output.send([0xB0 + channelId, 0x07, volume], delay * 1000);
	};

	midi.pitchBend = function(channelId, program, delay) { // pitch bend
		output.send([0xE0 + channelId, program], delay * 1000);
	};

	midi.noteOn = function(channelId, note, velocity, delay) {
		output.send([0x90 + channelId, note, velocity], delay * 1000);
	};

	midi.noteOff = function(channelId, note, delay) {
		output.send([0x80 + channelId, note, 0], delay * 1000);
	};

	midi.chordOn = function(channelId, chord, velocity, delay) {
		for (var n = 0; n < chord.length; n ++) {
			var note = chord[n];
			output.send([0x90 + channelId, note, velocity], delay * 1000);
		}
	};

	midi.chordOff = function(channelId, chord, delay) {
		for (var n = 0; n < chord.length; n ++) {
			var note = chord[n];
			output.send([0x80 + channelId, note, 0], delay * 1000);
		}
	};

	midi.stopAllNotes = function() {
		output.cancel();
		for (var channelId = 0; channelId < 16; channelId ++) {
			output.send([0xB0 + channelId, 0x7B, 0]);
		}
	};

	midi.connect = function(opts) {
		var onsuccess = opts.onsuccess;
		var onerror = opts.onerror;
		///
		MIDI.setDefaultPlugin(midi);
		///
		function errFunction(err) { // well at least we tried.
			onerror && onerror(err);
			///
			if (window.AudioContext) { // Chrome
				opts.api = 'webaudio';
			} else if (window.Audio) { // Firefox
				opts.api = 'audiotag';
			} else { // no support
				return;
			}
			///
			MIDI.loadPlugin(opts);
		};
		///
		navigator.requestMIDIAccess().then(function(access) {
			var pluginOutputs = access.outputs;
			if (typeof pluginOutputs == 'function') { // Chrome pre-43
				output = pluginOutputs()[0];
			} else { // Chrome post-43
				output = pluginOutputs[0];
			}
			if (output === undefined) { // no outputs
				errFunction();
			} else {
				onsuccess && onsuccess();
			}
		}, onerror);
	};

})(MIDI);
/*
	----------------------------------------------------------
	MIDI.Synesthesia : 2015-05-30
	----------------------------------------------------------
	Peacock		“Instruments to perform color-music: Two centuries of technological experimentation,” Leonardo, 21 (1988), 397-406.
	Gerstner	Karl Gerstner, The Forms of Color 1986.
	Klein		Colour-Music: The art of light, London: Crosby Lockwood and Son, 1927.
	Jameson		“Visual music in a visual programming language,” IEEE Symposium on Visual Languages, 1999, 111-118.
	Helmholtz	Treatise on Physiological Optics, New York: Dover Books, 1962.
	Jones		The art of light & color, New York: Van Nostrand Reinhold, 1972.
	----------------------------------------------------------
	Reference	http://rhythmiclight.com/archives/ideas/colorscales.html
	----------------------------------------------------------
*/

if (typeof MIDI === 'undefined') var MIDI = {};

MIDI.Synesthesia = MIDI.Synesthesia || {};

(function(root) {
	var defs = {
		'Isaac Newton (1704)': { 
			format: 'HSL',
			ref: 'Gerstner, p.167',
			english: ['red', null, 'orange', null, 'yellow', 'green', null, 'blue', null, 'indigo', null, 'violet'],
			0: [ 0, 96, 51 ], // C
			1: [ 0, 0, 0 ], // C#
			2: [ 29, 94, 52 ], // D
			3: [ 0, 0, 0 ], // D#
			4: [ 60, 90, 60 ], // E
			5: [ 135, 76, 32 ], // F
			6: [ 0, 0, 0 ], // F#
			7: [ 248, 82, 28 ], // G
			8: [ 0, 0, 0 ], // G#
			9: [ 302, 88, 26 ], // A
			10: [ 0, 0, 0 ], // A#
			11: [ 325, 84, 46 ] // B
		},
		'Louis Bertrand Castel (1734)': { 
			format: 'HSL',
			ref: 'Peacock, p.400',
			english: ['blue', 'blue-green', 'green', 'olive green', 'yellow', 'yellow-orange', 'orange', 'red', 'crimson', 'violet', 'agate', 'indigo'],			
			0: [ 248, 82, 28 ],
			1: [ 172, 68, 34 ],
			2: [ 135, 76, 32 ],
			3: [ 79, 59, 36 ],
			4: [ 60, 90, 60 ],
			5: [ 49, 90, 60 ],
			6: [ 29, 94, 52 ],
			7: [ 360, 96, 51 ],
			8: [ 1, 89, 33 ],
			9: [ 325, 84, 46 ],
			10: [ 273, 80, 27 ],
			11: [ 302, 88, 26 ]
		},
		'George Field (1816)': { 
			format: 'HSL',
			ref: 'Klein, p.69',
			english: ['blue', null, 'purple', null, 'red', 'orange', null, 'yellow', null, 'yellow green', null, 'green'],
			0: [ 248, 82, 28 ],
			1: [ 0, 0, 0 ],
			2: [ 302, 88, 26 ],
			3: [ 0, 0, 0 ],
			4: [ 360, 96, 51 ],
			5: [ 29, 94, 52 ],
			6: [ 0, 0, 0 ],
			7: [ 60, 90, 60 ],
			8: [ 0, 0, 0 ],
			9: [ 79, 59, 36 ],
			10: [ 0, 0, 0 ],
			11: [ 135, 76, 32 ]
		},
		'D. D. Jameson (1844)': { 
			format: 'HSL',
			ref: 'Jameson, p.12',
			english: ['red', 'red-orange', 'orange', 'orange-yellow', 'yellow', 'green', 'green-blue', 'blue', 'blue-purple', 'purple', 'purple-violet', 'violet'],
			0: [ 360, 96, 51 ],
			1: [ 14, 91, 51 ],
			2: [ 29, 94, 52 ],
			3: [ 49, 90, 60 ],
			4: [ 60, 90, 60 ],
			5: [ 135, 76, 32 ],
			6: [ 172, 68, 34 ],
			7: [ 248, 82, 28 ],
			8: [ 273, 80, 27 ],
			9: [ 302, 88, 26 ],
			10: [ 313, 78, 37 ],
			11: [ 325, 84, 46 ]
		},
		'Theodor Seemann (1881)': { 
			format: 'HSL',
			ref: 'Klein, p.86',
			english: ['carmine', 'scarlet', 'orange', 'yellow-orange', 'yellow', 'green', 'green blue', 'blue', 'indigo', 'violet', 'brown', 'black'],
			0: [ 0, 58, 26 ],
			1: [ 360, 96, 51 ],
			2: [ 29, 94, 52 ],
			3: [ 49, 90, 60 ],
			4: [ 60, 90, 60 ],
			5: [ 135, 76, 32 ],
			6: [ 172, 68, 34 ],
			7: [ 248, 82, 28 ],
			8: [ 302, 88, 26 ],
			9: [ 325, 84, 46 ],
			10: [ 0, 58, 26 ],
			11: [ 0, 0, 3 ]
		},
		'A. Wallace Rimington (1893)': { 
			format: 'HSL',
			ref: 'Peacock, p.402',
			english: ['deep red', 'crimson', 'orange-crimson', 'orange', 'yellow', 'yellow-green', 'green', 'blueish green', 'blue-green', 'indigo', 'deep blue', 'violet'],
			0: [ 360, 96, 51 ],
			1: [ 1, 89, 33 ],
			2: [ 14, 91, 51 ],
			3: [ 29, 94, 52 ],
			4: [ 60, 90, 60 ],
			5: [ 79, 59, 36 ],
			6: [ 135, 76, 32 ],
			7: [ 163, 62, 40 ],
			8: [ 172, 68, 34 ],
			9: [ 302, 88, 26 ],
			10: [ 248, 82, 28 ],
			11: [ 325, 84, 46 ]
		},
		'Bainbridge Bishop (1893)': { 
			format: 'HSL',
			ref: 'Bishop, p.11',
			english: ['red', 'orange-red or scarlet', 'orange', 'gold or yellow-orange', 'yellow or green-gold', 'yellow-green', 'green', 'greenish-blue or aquamarine', 'blue', 'indigo or violet-blue', 'violet', 'violet-red', 'red'],			
			0: [ 360, 96, 51 ],
			1: [ 1, 89, 33 ],
			2: [ 29, 94, 52 ],
			3: [ 50, 93, 52 ],
			4: [ 60, 90, 60 ],
			5: [ 73, 73, 55 ],
			6: [ 135, 76, 32 ],
			7: [ 163, 62, 40 ],
			8: [ 302, 88, 26 ],
			9: [ 325, 84, 46 ],
			10: [ 343, 79, 47 ],
			11: [ 360, 96, 51 ]
		},
		'H. von Helmholtz (1910)': { 
			format: 'HSL',
			ref: 'Helmholtz, p.22',
			english: ['yellow', 'green', 'greenish blue', 'cayan-blue', 'indigo blue', 'violet', 'end of red', 'red', 'red', 'red', 'red orange', 'orange'],
			0: [ 60, 90, 60 ],
			1: [ 135, 76, 32 ],
			2: [ 172, 68, 34 ],
			3: [ 211, 70, 37 ],
			4: [ 302, 88, 26 ],
			5: [ 325, 84, 46 ],
			6: [ 330, 84, 34 ],
			7: [ 360, 96, 51 ],
			8: [ 10, 91, 43 ],
			9: [ 10, 91, 43 ],
			10: [ 8, 93, 51 ],
			11: [ 28, 89, 50 ]
		},
		'Alexander Scriabin (1911)': { 
			format: 'HSL',
			ref: 'Jones, p.104',
			english: ['red', 'violet', 'yellow', 'steely with the glint of metal', 'pearly blue the shimmer of moonshine', 'dark red', 'bright blue', 'rosy orange', 'purple', 'green', 'steely with a glint of metal', 'pearly blue the shimmer of moonshine'],
			0: [ 360, 96, 51 ],
			1: [ 325, 84, 46 ],
			2: [ 60, 90, 60 ],
			3: [ 245, 21, 43 ],
			4: [ 211, 70, 37 ],
			5: [ 1, 89, 33 ],
			6: [ 248, 82, 28 ],
			7: [ 29, 94, 52 ],
			8: [ 302, 88, 26 ],
			9: [ 135, 76, 32 ],
			10: [ 245, 21, 43 ],
			11: [ 211, 70, 37 ]
		},
		'Adrian Bernard Klein (1930)': { 
			format: 'HSL',
			ref: 'Klein, p.209',
			english: ['dark red', 'red', 'red orange', 'orange', 'yellow', 'yellow green', 'green', 'blue-green', 'blue', 'blue violet', 'violet', 'dark violet'],
			0: [ 0, 91, 40 ],
			1: [ 360, 96, 51 ],
			2: [ 14, 91, 51 ],
			3: [ 29, 94, 52 ],
			4: [ 60, 90, 60 ],
			5: [ 73, 73, 55 ],
			6: [ 135, 76, 32 ],
			7: [ 172, 68, 34 ],
			8: [ 248, 82, 28 ],
			9: [ 292, 70, 31 ],
			10: [ 325, 84, 46 ],
			11: [ 330, 84, 34 ]
		},
		'August Aeppli (1940)': { 
			format: 'HSL',
			ref: 'Gerstner, p.169',
			english: ['red', null, 'orange', null, 'yellow', null, 'green', 'blue-green', null, 'ultramarine blue', 'violet', 'purple'],
			0: [ 0, 96, 51 ],
			1: [ 0, 0, 0 ],
			2: [ 29, 94, 52 ],
			3: [ 0, 0, 0 ],
			4: [ 60, 90, 60 ],
			5: [ 0, 0, 0 ],
			6: [ 135, 76, 32 ],
			7: [ 172, 68, 34 ],
			8: [ 0, 0, 0 ],
			9: [ 211, 70, 37 ],
			10: [ 273, 80, 27 ],
			11: [ 302, 88, 26 ]
		},
		'I. J. Belmont (1944)': { 
			ref: 'Belmont, p.226',
			english: ['red', 'red-orange', 'orange', 'yellow-orange', 'yellow', 'yellow-green', 'green', 'blue-green', 'blue', 'blue-violet', 'violet', 'red-violet'],
			0: [ 360, 96, 51 ],
			1: [ 14, 91, 51 ],
			2: [ 29, 94, 52 ],
			3: [ 50, 93, 52 ],
			4: [ 60, 90, 60 ],
			5: [ 73, 73, 55 ],
			6: [ 135, 76, 32 ],
			7: [ 172, 68, 34 ],
			8: [ 248, 82, 28 ],
			9: [ 313, 78, 37 ],
			10: [ 325, 84, 46 ],
			11: [ 338, 85, 37 ]
		},
		'Steve Zieverink (2004)': { 
			format: 'HSL',
			ref: 'Cincinnati Contemporary Art Center',
			english: ['yellow-green', 'green', 'blue-green', 'blue', 'indigo', 'violet', 'ultra violet', 'infra red', 'red', 'orange', 'yellow-white', 'yellow'],
			0: [ 73, 73, 55 ],
			1: [ 135, 76, 32 ],
			2: [ 172, 68, 34 ],
			3: [ 248, 82, 28 ],
			4: [ 302, 88, 26 ],
			5: [ 325, 84, 46 ],
			6: [ 326, 79, 24 ],
			7: [ 1, 89, 33 ],
			8: [ 360, 96, 51 ],
			9: [ 29, 94, 52 ],
			10: [ 62, 78, 74 ],
			11: [ 60, 90, 60 ]
		},
		'Circle of Fifths (Johnston 2003)': {
			format: 'RGB',
			ref: 'Joseph Johnston',
			english: ['yellow', 'blue', 'orange', 'teal', 'red', 'green', 'purple', 'light orange', 'light blue', 'dark orange', 'dark green', 'violet'],
			0: [ 255, 255, 0 ],
			1: [ 50, 0, 255 ],
			2: [ 255, 150, 0 ],
			3: [ 0, 210, 180 ],
			4: [ 255, 0, 0 ],
			5: [ 130, 255, 0 ],
			6: [ 150, 0, 200 ],
			7: [ 255, 195, 0 ],
			8: [ 30, 130, 255 ],
			9: [ 255, 100, 0 ],
			10: [ 0, 200, 0 ],
			11: [ 225, 0, 225 ]
		},
		'Circle of Fifths (Wheatman 2002)': {
			format: 'HEX',
			ref: 'Stuart Wheatman', // http://www.valleysfamilychurch.org/
			english: [],
			data: ['#122400', '#2E002E', '#002914', '#470000', '#002142', '#2E2E00', '#290052', '#003D00', '#520029', '#003D3D', '#522900', '#000080', '#244700', '#570057', '#004D26', '#7A0000', '#003B75', '#4C4D00', '#47008F', '#006100', '#850042', '#005C5C', '#804000', '#0000C7', '#366B00', '#80007F', '#00753B', '#B80000', '#0057AD', '#6B6B00', '#6600CC', '#008A00', '#B8005C', '#007F80', '#B35900', '#2424FF', '#478F00', '#AD00AD', '#00994D', '#F00000', '#0073E6', '#8F8F00', '#8A14FF', '#00AD00', '#EB0075', '#00A3A3', '#E07000', '#6B6BFF', '#5CB800', '#DB00DB', '#00C261', '#FF5757', '#3399FF', '#ADAD00', '#B56BFF', '#00D600', '#FF57AB', '#00C7C7', '#FF9124', '#9999FF', '#6EDB00', '#FF29FF', '#00E070', '#FF9999', '#7ABDFF', '#D1D100', '#D1A3FF', '#00FA00', '#FFA3D1', '#00E5E6', '#FFC285', '#C2C2FF', '#80FF00', '#FFA8FF', '#00E070', '#FFCCCC', '#C2E0FF', '#F0F000', '#EBD6FF', '#ADFFAD', '#FFD6EB', '#8AFFFF', '#FFEBD6', '#EBEBFF', '#E0FFC2', '#FFEBFF', '#E5FFF2', '#FFF5F5']
		},
		'Daniel Christopher (2013)': {
			format: 'HEX',
			english: [],
			0: '33669A',
			1: '009999',
			2: '079948',
			3: '6FBE44',
			4: 'F6EC13',
			5: 'FFCD05',
			6: 'F89838',
			7: 'EF3B39',
			8: 'CC3366',
			9: 'CB9AC6',
			10: '89509F',
			11: '5e2c95'
		}
	};

	root.map = function(type) {
		var res = {};
		var blend = function(a, b) {
			return [ // blend two colors and round results
				(a[0] * 0.5 + b[0] * 0.5 + 0.5) >> 0, 
				(a[1] * 0.5 + b[1] * 0.5 + 0.5) >> 0,
				(a[2] * 0.5 + b[2] * 0.5 + 0.5) >> 0
			];
		};
		///
		var colors = defs[type] || defs['D. D. Jameson (1844)'];
		for (var note = 0, pcolor; note <= 88; note ++) { // creates mapping for 88 notes
			if (colors.data) {
				res[note] = {
					hsl: colors.data[note],
					hex: colors.data[note] 
				};
			} else {
				var color = colors[(note + 9) % 12];
				///
				var H, S, L;
				switch(colors.format) {
					case 'HEX':
						color = Color.Space(color, 'W3>HEX>RGB');
					case 'RGB':
						color = Color.Space(color, 'RGB>HSL');
						H = color.H >> 0;
						S = color.S >> 0;
						L = color.L >> 0;
						break;
					case 'HSL':
						H = color[0];
						S = color[1];
						L = color[2];
						break;
				}
				///
				if (H === S && S === L) { // note color is unset
					color = blend(pcolor, colors[(note + 10) % 12]);
				}
				///
// 				var amount = L / 10;
// 				var octave = note / 12 >> 0;
// 				var octaveLum = L + amount * octave - 3.0 * amount; // map luminance to octave
				///
				res[note] = {
					hsl: 'hsla(' + H + ',' + S + '%,' + L + '%, 1)',
					hex: Color.Space({H: H, S: S, L: L}, 'HSL>RGB>HEX>W3')
				};
				///
				pcolor = color;
			}
		}
		return res;
	};

})(MIDI.Synesthesia);
/*
	-----------------------------------------------------------
	dom.loadScript.js : 0.1.4 : 2014/02/12 : http://mudcu.be
	-----------------------------------------------------------
	Copyright 2011-2014 Mudcube. All rights reserved.
	-----------------------------------------------------------
	/// No verification
	dom.loadScript.add("../js/jszip/jszip.js");
	/// Strict loading order and verification.
	dom.loadScript.add({
		strictOrder: true,
		urls: [
			{
				url: "../js/jszip/jszip.js",
				verify: "JSZip",
				onsuccess: function() {
					console.log(1)
				}
			},
			{ 
				url: "../inc/downloadify/js/swfobject.js",
				verify: "swfobject",
				onsuccess: function() {
					console.log(2)
				}
			}
		],
		onsuccess: function() {
			console.log(3)
		}
	});
	/// Just verification.
	dom.loadScript.add({
		url: "../js/jszip/jszip.js",
		verify: "JSZip",
		onsuccess: function() {
			console.log(1)
		}
	});
*/

if (typeof(dom) === "undefined") var dom = {};

(function() { "use strict";

dom.loadScript = function() {
	this.loaded = {};
	this.loading = {};
	return this;
};

dom.loadScript.prototype.add = function(config) {
	var that = this;
	if (typeof(config) === "string") {
		config = { url: config };
	}
	var urls = config.urls;
	if (typeof(urls) === "undefined") {
		urls = [{ 
			url: config.url, 
			verify: config.verify
		}];
	}
	/// adding the elements to the head
	var doc = document.getElementsByTagName("head")[0];
	/// 
	var testElement = function(element, test) {
		if (that.loaded[element.url]) return;
		if (test && globalExists(test) === false) return;
		that.loaded[element.url] = true;
		//
		if (that.loading[element.url]) that.loading[element.url]();
		delete that.loading[element.url];
		//
		if (element.onsuccess) element.onsuccess();
		if (typeof(getNext) !== "undefined") getNext();
	};
	///
	var hasError = false;
	var batchTest = [];
	var addElement = function(element) {
		if (typeof(element) === "string") {
			element = {
				url: element,
				verify: config.verify
			};
		}
		if (/([\w\d.\[\]\'\"])$/.test(element.verify)) { // check whether its a variable reference
			var verify = element.test = element.verify;
			if (typeof(verify) === "object") {
				for (var n = 0; n < verify.length; n ++) {
					batchTest.push(verify[n]);
				}			
			} else {
				batchTest.push(verify);
			}
		}
		if (that.loaded[element.url]) return;
		var script = document.createElement("script");
		script.onreadystatechange = function() {
			if (this.readyState !== "loaded" && this.readyState !== "complete") return;
			testElement(element);
		};
		script.onload = function() {
			testElement(element);
		};
		script.onerror = function() {
			hasError = true;
			delete that.loading[element.url];
			if (typeof(element.test) === "object") {
				for (var key in element.test) {
					removeTest(element.test[key]);
				}			
			} else {
				removeTest(element.test);
			}
		};
		script.setAttribute("type", "text/javascript");
		script.setAttribute("src", element.url);
		doc.appendChild(script);
		that.loading[element.url] = function() {};
	};
	/// checking to see whether everything loaded properly
	var removeTest = function(test) {
		var ret = [];
		for (var n = 0; n < batchTest.length; n ++) {
			if (batchTest[n] === test) continue;
			ret.push(batchTest[n]);
		}
		batchTest = ret;
	};
	var onLoad = function(element) {
		if (element) {
			testElement(element, element.test);
		} else {
			for (var n = 0; n < urls.length; n ++) {
				testElement(urls[n], urls[n].test);
			}
		}
		var istrue = true;
		for (var n = 0; n < batchTest.length; n ++) {
			if (globalExists(batchTest[n]) === false) {
				istrue = false;
			}
		}
		if (!config.strictOrder && istrue) { // finished loading all the requested scripts
			if (hasError) {
				if (config.error) {
					config.error();
				}
			} else if (config.onsuccess) {
				config.onsuccess();
			}
		} else { // keep calling back the function
			setTimeout(function() { //- should get slower over time?
				onLoad(element);
			}, 10);
		}
	};
	/// loading methods;  strict ordering or loose ordering
	if (config.strictOrder) {
		var ID = -1;
		var getNext = function() {
			ID ++;
			if (!urls[ID]) { // all elements are loaded
				if (hasError) {
					if (config.error) {
						config.error();
					}
				} else if (config.onsuccess) {
					config.onsuccess();
				}
			} else { // loading new script
				var element = urls[ID];
				var url = element.url;
				if (that.loading[url]) { // already loading from another call (attach to event)
					that.loading[url] = function() {
						if (element.onsuccess) element.onsuccess();
						getNext();
					}
				} else if (!that.loaded[url]) { // create script element
					addElement(element);
					onLoad(element);
				} else { // it's already been successfully loaded
					getNext();
				}
			}
		};
		getNext();
	} else { // loose ordering
		for (var ID = 0; ID < urls.length; ID ++) {
			addElement(urls[ID]);
			onLoad(urls[ID]);
		}
	}
};

dom.loadScript = new dom.loadScript();

function globalExists(path, root) {
	try {
		path = path.split('"').join('').split("'").join('').split(']').join('').split('[').join('.');
		var parts = path.split(".");
		var length = parts.length;
		var object = root || window;
		for (var n = 0; n < length; n ++) {
			var key = parts[n];
			if (object[key] == null) {
				return false;
			} else { //
				object = object[key];
			}
		}
		return true;
	} catch(e) {
		return false;
	}
};

})();

/// For NodeJS
if (typeof (module) !== "undefined" && module.exports) {
	module.exports = dom.loadScript;
}
/*
	----------------------------------------------------------
	util.request : 0.1.1 : 2015-04-12 : https://mudcu.be
	----------------------------------------------------------
	XMLHttpRequest - IE7+ | Chrome 1+ | Firefox 1+ | Safari 1.2+
	CORS - IE10+ | Chrome 3+ | Firefox 3.5+ | Safari 4+
	----------------------------------------------------------
	util.request({
		url: './dir/something.extension',
		data: 'test!',
		format: 'text', // text | xml | json
		responseType: 'text', // arraybuffer | blob | document | json | text
		headers: {},
		withCredentials: true, // true | false
		///
		onerror: function(evt, percent) {
			console.log(evt);
		},
		onsuccess: function(evt, responseText) {
			console.log(responseText);
		},
		onprogress: function(evt, percent) {
			percent = Math.round(percent * 100);
			loader.create('thread', 'loading... ', percent);
		}
	});
	
	
	https://mathiasbynens.be/demo/xhr-responsetype //- shim for responseType='json'
	
*/

if (typeof galactic === 'undefined') galactic = {};

(function(root) {

	var util = root.util || (root.util = {});

	util.request = function(opts, onsuccess, onerror, onprogress) { 'use strict';
		if (typeof opts === 'string') opts = {url: opts};
		///
		var data = opts.data;
		var url = opts.url;
		var method = opts.method || (opts.data ? 'POST' : 'GET');
		var format = opts.format;
		var headers = opts.headers;
		var responseType = opts.responseType;
		var withCredentials = opts.withCredentials || false;
		///
		var onprogress = onprogress || opts.onprogress;
		var onsuccess = onsuccess || opts.onsuccess;
		var onerror = onerror || opts.onerror;
		///
		if (typeof NodeFS !== 'undefined' && root.loc.isLocalUrl(url)) {
			NodeFS.readFile(url, 'utf8', function(err, res) {
				if (err) {
					onerror && onerror(err);
				} else {
					onsuccess && onsuccess({responseText: res});
				}
			});
			return;
		}
		///
		var xhr = new XMLHttpRequest();
		xhr.open(method, url, true);
		///
		if (headers) {
			for (var type in headers) {
				xhr.setRequestHeader(type, headers[type]);
			}
		} else if (data) { // set the default headers for POST
			xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		}
		if (responseType) {
			xhr.responseType = responseType;
		}
		if (withCredentials) {
			xhr.withCredentials = true;
		}
		if (onerror && 'onerror' in xhr) {
			xhr.onerror = onerror;
		}
		if (onprogress && xhr.upload && 'onprogress' in xhr.upload) {
			if (data) {
				xhr.upload.onprogress = function(evt) {
					onprogress.call(xhr, evt, event.loaded / event.total);
				};
			} else {
				xhr.addEventListener('progress', function(evt) {
					var totalBytes = 0;
					if (evt.lengthComputable) {
						totalBytes = evt.total;
					} else if (xhr.totalBytes) {
						totalBytes = xhr.totalBytes;
					} else {
						var rawBytes = parseInt(xhr.getResponseHeader('Content-Length-Raw'));
						if (isFinite(rawBytes)) {
							xhr.totalBytes = totalBytes = rawBytes;
						} else {
							return;
						}
					}
					onprogress.call(xhr, evt, evt.loaded / totalBytes);
				});
			}
		}

		xhr.onreadystatechange = function(evt) {
			if (xhr.readyState === 4) { // The request is complete
				if (xhr.status === 200 || // Response OK
					xhr.status === 304 || // Not Modified
					xhr.status === 308 || // Permanent Redirect
					xhr.status === 0 && root.client.cordova // Cordova quirk
				) {
					if (onsuccess) {
						var res;
						if (format === 'json') {
							try {
								res = JSON.parse(evt.target.response);
							} catch(err) {
								onerror && onerror.call(xhr, evt);
							}
						} else if (format === 'xml') {
							res = evt.target.responseXML;
						} else if (format === 'text') {
							res = evt.target.responseText;
						} else {
							res = evt.target.response;
						}
						///
						onsuccess.call(xhr, evt, res);
					}
				} else {
					onerror && onerror.call(xhr, evt);
				}
			}
		};
		xhr.send(data);
		return xhr;
	};

	/// NodeJS
	if (typeof module !== 'undefined' && module.exports) {
		var NodeFS = require('fs');
		XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
		module.exports = root.util.request;
	}

})(galactic);