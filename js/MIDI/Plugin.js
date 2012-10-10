/*

	MIDI.Plugin : 0.3
	-------------------------------------
	https://github.com/mudx/MIDI.js
	-------------------------------------
	MIDI.WebAudioAPI
	MIDI.Flash
	MIDI.HTML5
	MIDI.instruments
	MIDI.channels
	MIDI.keyToNote
	MIDI.noteToKey
	
	setMute?
	getInstruments?

*/

if (typeof (MIDI) === "undefined") var MIDI = {};
if (typeof (MIDI.Plugin) === "undefined") MIDI.Plugin = {};

(function() { "use strict";

/*
	Web Audio API - OGG or MPEG Soundbank
	--------------------------------------
	https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html
*/

if (typeof (MIDI.WebAudioAPI) === "undefined") MIDI.WebAudioAPI = {};

if (window.AudioContext || window.webkitAudioContext) (function () {

	var AudioContext = window.AudioContext || window.webkitAudioContext;
	var root = MIDI.WebAudioAPI;
	var ctx;
	var sources = {};
	var masterVolume = 1;
	var audioBuffers = {};
	var audioLoader = function (urlList, index, bufferList, oncomplete) {
		var url = urlList[index];
		var base64 = MIDI.Soundfont[url].split(",")[1];
		var buffer = Base64Binary.decodeArrayBuffer(base64);
		ctx.decodeAudioData(buffer, function (buffer) {
			var msg = url; while(msg.length < 3) msg += "&nbsp;";
			if (typeof(loader) !== "undefined") {
				loader.message("Downloading: 100%<br>Processing: "+(index/87 * 100 >> 0)+"%<br>" + msg);
			}
			buffer.id = url;
			bufferList[index] = buffer;
			//
			if (bufferList.length === urlList.length) {
				while (bufferList.length) {
					buffer = bufferList.pop();
					var nodeId = MIDI.keyToNote[buffer.id];
					audioBuffers[nodeId] = buffer;
				}
				oncomplete();
			}
		});
	};

	root.setVolume = function (n) {
		masterVolume = n;
	};

	root.programChange = function (instrument) {

	};

	root.noteOn = function (channel, note, velocity, delay) {
		/// check whether the note exists
		if (!audioBuffers[note]) return;
		/// convert relative delay to absolute delay
		if (delay < ctx.currentTime) delay += ctx.currentTime;
		/// crate audio buffer
		var source = ctx.createBufferSource();
		sources[channel + "" + note] = source;
		source.buffer = audioBuffers[note];
		source.connect(ctx.destination);
		//
		var gainNode = ctx.createGainNode();
		var value = -0.5 + (velocity / 100) * 2;
		var minus = (1 - masterVolume) * 2;
		gainNode.connect(ctx.destination);
		gainNode.gain.value = Math.max(-1, value - minus);
		source.connect(gainNode);
		//
//		source.playbackRate.value = 2;
		///
		source.noteOn(delay || 0);
		return source;
	};

	root.chordOn = function (channel, chord, velocity, delay) {
		var ret = {}, note;
		for (var n = 0, length = chord.length; n < length; n ++) {
			ret[note = chord[n]] = root.noteOn(channel, note, velocity, delay);
		}
		return ret;
	};

	// FIX: needs some way to fade out smoothly..
	root.noteOff = function (channel, note, delay) {
//		var source = sources[channel+""+note];
//		if (!source) return;
//		source.noteOff(delay || 0);
//		return source;
	};

	root.chordOff = function (channel, chord, delay) {

	};

	root.connect = function (callback) {
	
		MIDI.lang = 'WebAudioAPI';
		MIDI.setVolume = root.setVolume;
		MIDI.programChange = root.programChange;
		MIDI.noteOn = root.noteOn;
		MIDI.noteOff = root.noteOff;
		MIDI.chordOn = root.chordOn;
		MIDI.chordOff = root.chordOff;
		//
		MIDI.Player.ctx = ctx = new AudioContext();
		///
		var urlList = [];
		var keyToNote = MIDI.keyToNote;
		for (var key in keyToNote) urlList.push(key);
		var bufferList = [];
		for (var i = 0; i < urlList.length; i++) {
			audioLoader(urlList, i, bufferList, callback);
		}
	};

})();

/*
	HTML5 <audio> - OGG or MPEG Soundbank
	--------------------------------------
	http://dev.w3.org/html5/spec/Overview.html#the-audio-element
*/

if (window.Audio) (function () {

	var root = MIDI.HTML5 = {};
	var note2id = {};
	var volume = 1; // floating point 
	var channel_nid = -1; // current channel
	var channel_map = {}; // map to current playing <audio> elements
	var channels = []; // the audio channels
	var notes = {}; // the piano keys
	for (var nid = 0; nid < 12; nid++) {
		channels[nid] = new Audio();
	}

	var playChannel = function (id) {
		var note = notes[id];
		if (!note) return;
		var nid = (channel_nid + 1) % channels.length;
		var time = (new Date()).getTime();
		var audio = channels[nid];
		channel_map[note.id] = audio;
		audio.src = MIDI.Soundfont[note.id];
		audio.volume = volume;
		audio.play();
		channel_nid = nid;
	};

	root.programChange = function () {

	};
	
	root.setVolume = function (n) {
		volume = n;
	};
	
	root.noteOn = function (channel, note, velocity, delay) {
		var id = note2id[note];
		if (!notes[id]) return;
		if (delay) {
			var interval = window.setTimeout(function() { 
				playChannel(id); 
			}, delay * 1000);
			return interval;
		} else {
			playChannel(id);
		}
	};
	root.noteOff = function (channel, note, delay) {
//		var nid = note2id[note];
//		channel_map[nid].pause();
	};
	root.chordOn = function (channel, chord, velocity, delay) {
		for (var key in chord) {
			var n = chord[key];
			var id = note2id[n];
			if (!notes[id]) continue;
			playChannel(id);
		}
	};
	root.chordOff = function (channel, chord, delay) {

	};
	root.stopAllNotes = function () {
		for (var nid = 0, length = channels.length; nid < length; nid++) {
			channels[nid].pause();
		}
	};
	root.connect = function (callback) {
		var loading = {};
		for (var key in MIDI.keyToNote) {
			note2id[MIDI.keyToNote[key]] = key;
			notes[key] = {
				id: key
			};
		}
		MIDI.lang = 'HTML5';
		MIDI.setVolume = root.setVolume;
		MIDI.programChange = root.programChange;
		MIDI.noteOn = root.noteOn;
		MIDI.noteOff = root.noteOff;
		MIDI.chordOn = root.chordOn;
		MIDI.chordOff = root.chordOff;
		//
		if (callback) callback();
		//
	};
})();

/*
	Flash - MP3 Soundbank
	----------------------
	http://www.schillmania.com/projects/soundmanager2/
	
*/
	
(function () {

	var root = MIDI.Flash = {};
	var noteReverse = {};
	var notes = {};
	root.programChange = function () {

	};
	root.setVolume = function (channel, note) {

	};
	root.noteOn = function (channel, note, velocity, delay) {
		var id = noteReverse[note];
		if (!notes[id]) return;
		if (delay) {
			var interval = window.setTimeout(function() { 
				notes[id].play({ volume: velocity * 2 });
			}, delay * 1000);
			return interval;
		} else {
			notes[id].play({ volume: velocity * 2 });
		}
	};
	root.noteOff = function (channel, note, delay) {

	};
	root.chordOn = function (channel, chord, velocity, delay) {
		for (var key in chord) {
			var n = chord[key];
			var id = noteReverse[n];
			if (notes[id]) {
				notes[id].play({ volume: velocity * 2 });
			}
		}
	};
	root.chordOff = function (channel, chord, delay) {

	};
	root.stopAllNotes = function () {

	};
	root.connect = function (callback) {
		soundManager.flashVersion = 9;
		soundManager.useHTML5Audio = true;
		soundManager.url = '../inc/SoundManager2/swf/';
		soundManager.useHighPerformance = true;
		soundManager.wmode = 'transparent';
		soundManager.flashPollingInterval = 1;
		soundManager.debugMode = false;
		soundManager.onload = function () {
			var loaded = [];
			var onload = function () {
				loaded.push(this.sID);
				if (typeof (loader) === "undefined") return;
				loader.message("Processing: " + this.sID);
			};
			for (var i = 0; i < 88; i++) {
				var id = noteReverse[i + 21];
				notes[id] = soundManager.createSound({
					id: id,
					url: './soundfont/mp3/' + id + '.mp3',
					multiShot: true,
					autoLoad: true,
					onload: onload
				});
			}
			MIDI.lang = 'Flash';
			MIDI.setVolume = root.setVolume;
			MIDI.programChange = root.programChange;
			MIDI.noteOn = root.noteOn;
			MIDI.noteOff = root.noteOff;
			MIDI.chordOn = root.chordOn;
			MIDI.chordOff = root.chordOff;
			//
			var interval = window.setInterval(function () {
				if (loaded.length !== 88) return;
				window.clearInterval(interval);
				if (callback) callback();
			}, 25);
		};
		soundManager.onerror = function () {

		};
		for (var key in MIDI.keyToNote) {
			noteReverse[MIDI.keyToNote[key]] = key;
		}
	};
})();

/*
	Java - Native Soundbank
	----------------------------
	https://github.com/abudaan/midibridge-js
	http://java.sun.com/products/java-media/sound/soundbanks.html	
*/

(function () {
	var root = MIDI.Java = {};
	root.connect = function (callback) {
		// deferred loading of <applet>
		MIDI.Plugin = false;
		if (!window.navigator.javaEnabled()) {
			MIDI.Flash.connect(callback);
			return;
		}
		MIDI.Java.callback = callback;
		var iframe = document.createElement('iframe');
		iframe.name = 'MIDIFrame';
		iframe.src = 'inc/midibridge/index.html';
		iframe.width = 1;
		iframe.height = 1;
		document.body.appendChild(iframe);
	};
	root.confirm = function (plugin) {
		MIDI.programChange = function (program) {
			plugin.sendMidiEvent(0xC0, 0, program, 0);
		};
		MIDI.setVolume = function (n) {
			
		};
		MIDI.noteOn = function (channel, note, velocity, delay) {
			if (delay) {
				var interval = window.setTimeout(function() { 
					plugin.sendMidiEvent(0x90, channel, note, velocity);
				}, delay * 1000);
				return interval;
			} else {
				plugin.sendMidiEvent(0x90, channel, note, velocity);
			}
		};
		MIDI.noteOff = function (channel, note, delay) {
			if (delay) {
				var interval = window.setTimeout(function() { 
					plugin.sendMidiEvent(0x80, channel, note, 0);
				}, delay * 1000);
				return interval;
			} else {
				plugin.sendMidiEvent(0x80, channel, note, 0);
			}
		};
		MIDI.chordOn = function (channel, chord, velocity, delay) {
			for (var key in chord) {
				var n = chord[key];
				plugin.sendMidiEvent(0x90, channel, n, 100);
			}
		};
		MIDI.chordOff = function (channel, chord, delay) {
			for (var key in chord) {
				var n = chord[key];
				plugin.sendMidiEvent(0x80, channel, n, 100);
			}
		};
		MIDI.stopAllNotes = function () {

		};
		MIDI.getInstruments = function() {
			return [];
		};
		///
		if (plugin.ready) {
			MIDI.lang = "Java";
			if (MIDI.Java.callback) {
				MIDI.Java.callback();
			}
		} else {
			MIDI.Flash.connect(MIDI.Java.callback);
		}
	};
})();

/*
	helper functions
*/

// instrument-tracker
MIDI.instruments = (function (arr) {
	var instruments = {};
	for (var key in arr) {
		var list = arr[key];
		for (var n = 0, length = list.length; n < length; n++) {
			var instrument = list[n];
			if (!instrument) continue;
			var num = parseInt(instrument.substr(0, instrument.indexOf(" ")), 10);
			instrument = instrument.replace(num + " ", "");
			instruments[--num] = {
				instrument: instrument,
				category: key
			};
			instruments[instrument] = {
				number: num,
				category: key
			};
		}
	}
	return instruments;
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
	'Percussive': ['113 Tinkle Bell', '114 Agogo', '115 Steel Drums', '116 Woodblock', '117 Taiko Drum', '118 Melodic Tom', '119 Synth Drum'],
	'Sound effects': ['120 Reverse Cymbal', '121 Guitar Fret Noise', '122 Breath Noise', '123 Seashore', '124 Bird Tweet', '125 Telephone Ring', '126 Helicopter', '127 Applause', '128 Gunshot']
});

// channel-tracker
MIDI.channels = (function () { // 0 - 15 channels
	var channels = {};
	for (var n = 0; n < 16; n++) {
		channels[n] = { // default values
			instrument: 0,
			// Acoustic Grand Piano
			mute: false,
			mono: false,
			omni: false,
			solo: false
		};
	}
	return channels;
})();

// note conversions
MIDI.keyToNote = {}; // C8  == 108
MIDI.noteToKey = {}; // 108 ==  C8
(function () {
	var A0 = 0x15; // first note
	var C8 = 0x6C; // last note
	var number2key = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
	for (var n = A0; n <= C8; n++) {
		var octave = (n - 12) / 12 >> 0;
		var name = number2key[n % 12] + octave;
		MIDI.keyToNote[name] = n;
		MIDI.noteToKey[n] = name;
	}
})();

})();

MIDI.pianoKeyOffset = 21;