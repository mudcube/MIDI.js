/*
	--------------------------------------------
	MIDI.Plugin : 0.3.4 : 2014/03/23
	--------------------------------------------
	https://github.com/mudcube/MIDI.js
	--------------------------------------------
	Inspired by javax.sound.midi (albeit a super simple version): 
		http://docs.oracle.com/javase/6/docs/api/javax/sound/midi/package-summary.html
	--------------------------------------------
	Technologies:
	--------------------------------------------
		Web MIDI API - no native support yet (jazzplugin)
		Web Audio API - firefox 25+, chrome 10+, safari 6+, opera 15+
		HTML5 Audio Tag - ie 9+, firefox 3.5+, chrome 4+, safari 4+, opera 9.5+, ios 4+, android 2.3+
	--------------------------------------------
*/

if (typeof(MIDI) === "undefined") MIDI = {};

MIDI.Soundfont = MIDI.Soundfont || {};
MIDI.Player = MIDI.Player || {};

(function(midi) { "use strict";

midi.DEBUG = false;
midi.USE_XHR = true;
midi.soundfontUrl = "./soundfont/";

/*
	MIDI.loadPlugin({
		callback: function(){},
		onprogress: function(state, percent) {},
		targetFormat: "mp3", // optionally can force to use MP3 (for instance on mobile networks)
		instrument: "acoustic_grand_piano", // or 1 (default)
		instruments: [ "acoustic_grand_piano", "acoustic_guitar_nylon" ] // or multiple instruments
	});
*/

midi.loadPlugin = function(conf) {
	if (typeof(conf) === "function") {
		conf = { callback: conf };
	}

	midi.soundfontUrl = conf.soundfontUrl || midi.soundfontUrl;

	/// Detect the best type of audio to use.
	midi.audioDetect(function(supports) {
		var hash = window.location.hash;
		var api = "";

		/// use the most appropriate plugin if not specified
		if (supports[conf.api]) {
			api = conf.api;
		} else if (supports[hash.substr(1)]) {
			api = hash.substr(1);
		} else if (supports.webmidi) {
			api = "webmidi";
		} else if (window.AudioContext) { // Chrome
			api = "webaudio";
		} else if (window.Audio) { // Firefox
			api = "audiotag";
		}

		if (!connect[api]) return;

		/// use audio/ogg when supported
		if (conf.targetFormat) {
			var format = conf.targetFormat;
		} else { // use best quality
			var format = supports["audio/ogg"] ? "ogg" : "mp3";
		}

		/// load the specified plugin
		midi.__type = api;
		midi.__format = format;
		midi.supports = supports;
		midi.loadResource(conf);
	});
};

/*
	midi.loadResource({
		callback: function(){},
		onprogress: function(state, percent) {},
		instrument: "banjo"
	})
*/

midi.loadResource = function(conf) {
	var api = midi.__type;
	var format = midi.__format;
	var instruments = conf.instruments || conf.instrument || "acoustic_grand_piano";
	///
	if (typeof(instruments) !== "object") {
		if (instruments) {
			instruments = [ instruments ];
		} else {
			instruments = [];
		}
	}
	/// Convert numbers to strings
	for (var n = 0; n < instruments.length; n ++) {
		var instrument = instruments[n];
		if (typeof(instrument) !== "number") continue;
		instruments[n] = midi.GM.byId[instrument];
	};
	/// Request resources
	connect[api](format, instruments, conf);
};

var connect = {
	webmidi: function(format, instruments, conf) {
		// cant wait for this to be standardized!
		midi.WebMIDI.connect(conf);
	},
	audiotag: function(format, instruments, conf) {
		// works ok, kinda like a drunken tuna fish, across the board.
		// http://caniuse.com/audio
		requestQueue(format, instruments, conf, "AudioTag");
	},
	webaudio: function(format, instruments, conf) {
		// works awesome! safari, chrome and firefox support.
		// http://caniuse.com/web-audio
		requestQueue(format, instruments, conf, "WebAudio");
	}
};

var requestQueue = function(format, instruments, conf, context) {
	var length = instruments.length;
	new Queue({
		items: instruments,
		next: function(instrumentId, key, index, total) {
			var total = index / length;
			if (conf.onprogress) {
				conf.onprogress("load", total, instrumentId);
			}
			sendRequest(this, instrumentId, format, function(n) {
				if (conf.onprogress) {
					conf.onprogress("load", total + n * (1 / length), instrumentId);
				}
			});
		},
		callback: function() {
			if (conf.onprogress) {
				conf.onprogress("load", 1.0);
			}
			midi[context].connect(conf);
		}
	});
};

var sendRequest = function(queue, instrumentId, format, onprogress) {
	var soundfontPath = midi.soundfontUrl + instrumentId + "-" + format + ".js";
	if (MIDI.Soundfont[instrumentId]) {
		queue.next();
	} else if (midi.USE_XHR) {
		dom.request({
			url: soundfontPath,
			onerror: function(err) {
				console.log(err);
			},
			onprogress: function(event) {
				if (!this.totalSize) { // requires server to send Content-Length-Raw (actual bytes non-gzipped)
					var header = "Content-Length-Raw";
					if (event.getResponseHeader(header)) {
						this.totalSize = parseInt(event.getResponseHeader(header));
					} else {
						this.totalSize = event.total;
					}
				}
				///
				if (this.totalSize) {
					onprogress(event.loaded / this.totalSize);
				}
			},
			onload: function(response) {
				addScript({
					text: response.responseText
				});
				queue.next();
			}
		});
	} else {
		dom.loadScript.add({
			url: soundfontPath,
			verify: "MIDI.Soundfont['" + instrumentId + "']",
			onerror: function(err) {
				console.log(err);
			},
			callback: function() {
				queue.next();
			}
		});
	}
};

var addScript = function(conf) {
	var script = document.createElement("script");
	script.language = "javascript";
	script.type = "text/javascript";
	if (conf.text) script.text = conf.text;
	if (conf.src) script.src = conf.src;
	document.body.appendChild(script);
};

})(MIDI);

(function(root) { "use strict";

/*
	----------------------------------------------------------------------
	Web MIDI API - Native Soundbanks
	----------------------------------------------------------------------
	https://dvcs.w3.org/hg/audio/raw-file/tip/midi/specification.html
	----------------------------------------------------------------------
*/

(function () {
	var plugin = null;
	var output = null;
	var channels = [];
	var midi = root.WebMIDI = { api: "webmidi" };
	midi.send = function (data, delay) { // set channel volume
		output.send(data, delay * 1000);
	};

	midi.setController = function(channel, type, value, delay) {
		output.send([channel, type, value], delay * 1000);
	};

	midi.setVolume = function (channel, volume, delay) { // set channel volume
		output.send([0xB0 + channel, 0x07, volume], delay * 1000);
	};

	midi.programChange = function (channel, program, delay) { // change patch (instrument)
		output.send([0xC0 + channel, program], delay * 1000);
	};

	midi.pitchBend = function (channel, program, delay) { // pitch bend
		output.send([0xE0 + channel, program], delay * 1000);
	};

	midi.noteOn = function (channel, note, velocity, delay) {
		output.send([0x90 + channel, note, velocity], delay * 1000);
	};

	midi.noteOff = function (channel, note, delay) {
		output.send([0x80 + channel, note, 0], delay * 1000);
	};

	midi.chordOn = function (channel, chord, velocity, delay) {
		for (var n = 0; n < chord.length; n ++) {
			var note = chord[n];
			output.send([0x90 + channel, note, velocity], delay * 1000);
		}
	};
	
	midi.chordOff = function (channel, chord, delay) {
		for (var n = 0; n < chord.length; n ++) {
			var note = chord[n];
			output.send([0x80 + channel, note, 0], delay * 1000);
		}
	};
	
	midi.stopAllNotes = function () {
		output.cancel();
		for (var channel = 0; channel < 16; channel ++) {
			output.send([0xB0 + channel, 0x7B, 0]);
		}
	};

	midi.connect = function (conf) {
		setDefaultPlugin(midi);
		///
        navigator.requestMIDIAccess().then(function (access) {
			plugin = access;
			output = plugin.outputs()[0];
			if (conf.callback) conf.callback();
		}, function (err) { // well at least we tried!
			if (window.AudioContext) { // Chrome
				conf.api = "webaudio";
			} else if (window.Audio) { // Firefox
				conf.api = "audiotag";
			} else { // no support
				return;
			}
			root.loadPlugin(conf);
		});
	};
})();

/*
	----------------------------------------------------------------------
	Web Audio API - OGG or MPEG Soundbank
	----------------------------------------------------------------------
	https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html
	----------------------------------------------------------------------
*/

if (window.AudioContext) (function () {
	var audioContext = null; // new AudioContext();
	var streaming = false; // !!audioContext.createMediaElementSource;
	var midi = root.WebAudio = { api: "webaudio" };
	var ctx; // audio context
	var sources = {};
	var effects = {};
	var masterVolume = 127;
	var audioBuffers = {};
	///
	midi.audioBuffers = audioBuffers;
	midi.send = function(data, delay) {};
	midi.setController = function(channel, type, value, delay) {};
	midi.setVolume = function (channel, volume, delay) {
		if (delay) setTimeout(function() {
			masterVolume = volume;
		}, delay);
		///
		masterVolume = volume;
	};

	midi.programChange = function (channelId, program, delay) {
//		if (delay) return setTimeout(function() {
//			var channel = root.channels[channelId];
//			channel.instrument = program;
//		}, delay);
		///
		var channel = root.channels[channelId];
		channel.instrument = program;
	};

	midi.pitchBend = function(channelId, program, delay) {
//		if (delay) setTimeout(function() {
//			var channel = root.channels[channelId];
//			channel.pitchBend = program;
//		}, delay);
		///
		var channel = root.channels[channelId];
		channel.pitchBend = program;
	};

	midi.noteOn = function (channelId, noteId, velocity, delay) {
		delay = delay || 0;

		/// check whether the note exists
		var channel = root.channels[channelId];
		var instrument = channel.instrument;
		var bufferId = instrument + "" + noteId;
		var buffer = audioBuffers[bufferId];
		if (!buffer) {
			console.log(MIDI.GM.byId[instrument].id, instrument, channelId);
			return;
		}

		/// convert relative delay to absolute delay
		if (delay < ctx.currentTime) {
			delay += ctx.currentTime;
		}
		
		/// create audio buffer
		if (streaming) { // Streaming buffer
			var source = ctx.createMediaElementSource(buffer);
		} else { // XMLHTTP buffer
			var source = ctx.createBufferSource();
			source.buffer = buffer;
		}

		/// add effects to buffer
		if (effects) {
			var chain = source;
			for (var key in effects) {
				chain.connect(effects[key].input);
				chain = effects[key];
			}
		}

		/// add gain + pitchShift
		var gain = (velocity / 127) * (masterVolume / 127) * 2 - 1;
		source.connect(ctx.destination);
		source.playbackRate.value = 1; // pitch shift 
		source.gainNode = ctx.createGain(); // gain
		source.gainNode.connect(ctx.destination);
		source.gainNode.gain.value = Math.min(1.0, Math.max(-1.0, gain));
		source.connect(source.gainNode);
		///
		if (streaming) {
			if (delay) return setTimeout(function() {
				buffer.currentTime = 0;
				buffer.play()
			}, delay * 1000);
			///
			buffer.currentTime = 0;
			buffer.play()
		} else {
			source.start(delay || 0);
		}
		///
		sources[channelId + "" + noteId] = source;
		///
		return source;
	};

	midi.noteOff = function (channelId, noteId, delay) {
		delay = delay || 0;

		/// check whether the note exists
		var channel = root.channels[channelId];
		var instrument = channel.instrument;
		var bufferId = instrument + "" + noteId;
		var buffer = audioBuffers[bufferId];
		if (!buffer) {
			return;
		}

		///
		if (delay < ctx.currentTime) {
			delay += ctx.currentTime;
		}
		///
		var source = sources[channelId + "" + noteId];
		if (!source) return;
		if (source.gainNode) {
			// @Miranet: "the values of 0.2 and 0.3 could ofcourse be used as 
			// a 'release' parameter for ADSR like time settings."
			// add { "metadata": { release: 0.3 } } to soundfont files
			var gain = source.gainNode.gain;
			gain.linearRampToValueAtTime(gain.value, delay);
			gain.linearRampToValueAtTime(-1.0, delay + .4);
		}
		///
		if (streaming) {
			if (delay) return setTimeout(function() {
				buffer.pause();
			}, delay * 1000);
			///
			buffer.pause();
		} else {
			source.stop(delay + 0.5);
		}
		///
		delete sources[channelId + "" + noteId];
		///
		return source;
	};

	midi.chordOn = function (channel, chord, velocity, delay) {
		var ret = {}, note;
		for (var n = 0, length = chord.length; n < length; n++) {
			ret[note = chord[n]] = midi.noteOn(channel, note, velocity, delay);
		}
		return ret;
	};

	midi.chordOff = function (channel, chord, delay) {
		var ret = {}, note;
		for (var n = 0, length = chord.length; n < length; n++) {
			ret[note = chord[n]] = midi.noteOff(channel, note, delay);
		}
		return ret;
	};

    midi.stopAllNotes = function () {
        for (var source in sources) {
            var delay = 0;
            if (delay < ctx.currentTime) delay += ctx.currentTime;
            // @Miranet: "the values of 0.2 and 0.3 could ofcourse be used as
            // a 'release' parameter for ADSR like time settings."
            // add { "metadata": { release: 0.3 } } to soundfont files
            sources[source].gain.linearRampToValueAtTime(1, delay);
            sources[source].gain.linearRampToValueAtTime(0, delay + 0.2);
            sources[source].noteOff(delay + 0.3);
            delete sources[source];
        }
    };

	midi.setEffects = function(list) {
		if (!ctx.tunajs) return console.log("Effects module not installed.");
		for (var n = 0; n < list.length; n ++) {
			var data = list[n];
			var effect = new ctx.tunajs[data.type](data);
			effect.connect(ctx.destination);
			effects[data.type] = effect;
		}
	};

	midi.connect = function (conf) {
		setDefaultPlugin(midi);
		midi.setContext(ctx || new AudioContext(), conf.callback);
	};
	
	midi.getContext = function() {
		return ctx;
	};
	
	midi.setContext = function(newCtx, onload, onprogress, onerror) {
		ctx = newCtx;

		/// tuna.js effects module - https://github.com/Dinahmoe/tuna
		if (window.Tuna && !ctx.tunajs) ctx.tunajs = new Tuna(ctx);
		
		/// loading audio files
		var urls = [];
		var notes = root.keyToNote;
		for (var key in notes) urls.push(key);
		///
		var waitForEnd = function(instrument) {
			for (var key in bufferPending) { // has pending items
				if (bufferPending[key]) return;
			}
			///
			if (onload) { // run onload once
				onload();
				onload = null;
			}
		};
		///
		var requestAudio = function(soundfont, instrumentId, index, key) {
			var url = soundfont[key];
			if (!url) return;
			bufferPending[instrumentId] ++;
			loadAudio(url, function (buffer) {
				buffer.id = key;
				var noteId = root.keyToNote[key];
				audioBuffers[instrumentId + "" + noteId] = buffer;
				///
				if (-- bufferPending[instrumentId] === 0) {
					var percent = index / 87;
					console.log(MIDI.GM.byId[instrumentId], "processing: ", percent);
					soundfont.isLoaded = true;
					waitForEnd(instrument);
				}
			}, function(err) {
				console.log(err);
			});
		};
		///
		var bufferPending = {};
		for (var instrument in root.Soundfont) {
			var soundfont = root.Soundfont[instrument];
			if (soundfont.isLoaded) {
				continue;
			}
			///
			var synth = root.GM.byName[instrument];
			var instrumentId = synth.number;
			///
			bufferPending[instrumentId] = 0;
			///
			for (var index = 0; index < urls.length; index++) {
				var key = urls[index];
				requestAudio(soundfont, instrumentId, index, key);
			}
		}
		///
		setTimeout(waitForEnd, 1);
	};

	/* Load audio file: streaming | base64 | arraybuffer
	---------------------------------------------------------------------- */
	var loadAudio = function (url, onload, onerror) {
		if (streaming) { // Streaming buffer.
			var audio = new Audio();
			audio.src = url;
			audio.controls = false;
			audio.autoplay = false;
			audio.preload = false;
			audio.addEventListener("canplay", function() {
				if (onload) onload(audio);
			});
			audio.addEventListener("error", function(err) {
				if (onerror) onerror(err);
			});
			document.body.appendChild(audio)
		} else if (url.indexOf("data:audio") === 0) { // Base64 string.
			var base64 = url.split(",")[1];
			var buffer = Base64Binary.decodeArrayBuffer(base64);
			ctx.decodeAudioData(buffer, onload, onerror);
		} else { // XMLHTTP buffer.
			var request = new XMLHttpRequest();
			request.open("GET", url, true);
			request.responseType = "arraybuffer";
			request.onload = function () {
				ctx.decodeAudioData(request.response, onload, onerror);
			};
			request.send();
		}
	};
})();

/*
	----------------------------------------------------------------------
	AudioTag <audio> - OGG or MPEG Soundbank
	----------------------------------------------------------------------
	http://dev.w3.org/html5/spec/Overview.html#the-audio-element
	----------------------------------------------------------------------
*/

if (window.Audio) (function () {
	var midi = root.AudioTag = { api: "audiotag" };
	var noteToKey = {};
	var volume = 127; // floating point 
	var buffer_nid = -1; // current channel
	var audioBuffers = []; // the audio channels
	var notesOn = []; // instrumentId + noteId that is currently playing in each 'channel', for routing noteOff/chordOff calls
	var notes = {}; // the piano keys
	for (var nid = 0; nid < 12; nid ++) {
		audioBuffers[nid] = new Audio();
	}

	var playChannel = function (channel, note) {
		if (!root.channels[channel]) return;
		var instrument = root.channels[channel].instrument;
		var instrumentId = root.GM.byId[instrument].id;
		var note = notes[note];
		if (!note) return;
		var instrumentNoteId = instrumentId + "" + note.id;
		var nid = (buffer_nid + 1) % audioBuffers.length;
		var audio = audioBuffers[nid];
		notesOn[ nid ] = instrumentNoteId;
		if (!root.Soundfont[instrumentId]) {
			if (root.DEBUG) console.log("404", instrumentId);
			return;
		}
		audio.src = root.Soundfont[instrumentId][note.id];
		audio.volume = volume / 127;
		audio.play();
		buffer_nid = nid;
	};

	var stopChannel = function (channel, note) {
		if (!root.channels[channel]) return;
		var instrument = root.channels[channel].instrument;
		var instrumentId = root.GM.byId[instrument].id;
		var note = notes[note];
		if (!note) return;
		var instrumentNoteId = instrumentId + "" + note.id;

		for(var i=0;i<audioBuffers.length;i++){
			var nid = (i + buffer_nid + 1) % audioBuffers.length;
			var cId = notesOn[nid];

			if(cId && cId == instrumentNoteId){
				audioBuffers[nid].pause();
				notesOn[nid] = null;
				return;
			}
		}
	};
	
	midi.audioBuffers = audioBuffers;
	midi.send = function(data, delay) {};
	midi.setController = function(channel, type, value, delay) {};
	midi.setVolume = function (channel, n) {
		volume = n; //- should be channel specific volume
	};

	midi.programChange = function (channel, program) {
		root.channels[channel].instrument = program;
	};

	midi.pitchBend = function(channel, program, delay) {};

	midi.noteOn = function (channel, note, velocity, delay) {
		var id = noteToKey[note];
		if (!notes[id]) return;
		if (delay) {
			return setTimeout(function () {
				playChannel(channel, id);
			}, delay * 1000);
		} else {
			playChannel(channel, id);
		}
	};
	
	midi.noteOff = function (channel, note, delay) {
/*
		var id = noteToKey[note];
		if (!notes[id]) return;
		if (delay) {
			return setTimeout(function() {
				stopChannel(channel, id);
			}, delay * 1000)
		} else {
			stopChannel(channel, id);
		}
*/
	};
	
	midi.chordOn = function (channel, chord, velocity, delay) {
		for (var idx = 0; idx < chord.length; idx ++) {
			var n = chord[idx];
			var id = noteToKey[n];
			if (!notes[id]) continue;
			if (delay) {
				return setTimeout(function () {
					playChannel(channel, id);
				}, delay * 1000);
			} else {
				playChannel(channel, id);
			}
		}
	};
	
	midi.chordOff = function (channel, chord, delay) {
		for (var idx = 0; idx < chord.length; idx ++) {
			var n = chord[idx];
			var id = noteToKey[n];
			if (!notes[id]) continue;
			if (delay) {
				return setTimeout(function () {
					stopChannel(channel, id);
				}, delay * 1000);
			} else {
				stopChannel(channel, id);
			}
		}
	};
	
	midi.stopAllNotes = function () {
		for (var nid = 0, length = audioBuffers.length; nid < length; nid++) {
			audioBuffers[nid].pause();
		}
	};
	
	midi.connect = function (conf) {
		setDefaultPlugin(midi);
		///
		for (var key in root.keyToNote) {
			noteToKey[root.keyToNote[key]] = key;
			notes[key] = { id: key };
		}
		///
		if (conf.callback) conf.callback();
	};
})();

var setDefaultPlugin = function(midi) {
	for (var key in midi) {
		root[key] = midi[key];
	}
};

/* GeneralMIDI
--------------------------------------------------- */
root.GM = (function (arr) {
	var clean = function(v) {
		return v.replace(/[^a-z0-9 ]/gi, "").replace(/[ ]/g, "_").toLowerCase();
	};
	var ret = {
		byName: {},
		byId: {},
		byCategory: {}
	};
	for (var key in arr) {
		var list = arr[key];
		for (var n = 0, length = list.length; n < length; n++) {
			var instrument = list[n];
			if (!instrument) continue;
			var num = parseInt(instrument.substr(0, instrument.indexOf(" ")), 10);
			instrument = instrument.replace(num + " ", "");
			ret.byId[--num] = 
			ret.byName[clean(instrument)] = 
			ret.byCategory[clean(key)] = {
				id: clean(instrument),
				instrument: instrument,
				number: num,
				category: key
			};
		}
	}
	return ret;
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

/* get/setInstrument
--------------------------------------------------- */
root.getInstrument = function(channelId) {
	var channel = root.channels[channelId];
	return channel && channel.instrument;
};
root.setInstrument = function (channelId, program, delay) {
	var channel = root.channels[channelId];
	if (delay) return setTimeout(function() {
		channel.instrument = program;
	}, delay);
	///
	channel.instrument = program;
};

/* get/setMono
--------------------------------------------------- */
root.getMono = function(channelId) {
	var channel = root.channels[channelId];
	return channel && channel.mono;
};
root.setMono = function(channelId, truthy, delay) {
	var channel = root.channels[channelId];
	if (delay) return setTimeout(function() {
		channel.mono = truthy;
	}, delay);
	///
	channel.mono = truthy;	
};

/* get/setOmni
--------------------------------------------------- */
root.getOmni = function(channelId) {
	var channel = root.channels[channelId];
	return channel && channel.omni;
};
root.setOmni = function(channelId, truthy) {
	var channel = root.channels[channelId];
	if (delay) return setTimeout(function() {
		channel.omni = truthy;	
	}, delay);
	///
	channel.omni = truthy;	
};

/* get/setSolo
--------------------------------------------------- */
root.getSolo = function(channelId) {
	var channel = root.channels[channelId];
	return channel && channel.solo;
};
root.setSolo = function(channelId, truthy) {
	var channel = root.channels[channelId];
	if (delay) return setTimeout(function() {
		channel.solo = truthy;	
	}, delay);
	///
	channel.solo = truthy;	
};

/* channels
--------------------------------------------------- */
root.channels = (function () { // 0 - 15 channels
	var channels = {};
	for (var n = 0; n < 16; n++) {
		channels[n] = { // default values
			instrument: n,
			pitchBend: 0,
			mute: false,
			mono: false,
			omni: false,
			solo: false
		};
	}
	return channels;
})();

/* note conversions
--------------------------------------------------- */
root.keyToNote = {}; // C8  == 108
root.noteToKey = {}; // 108 ==  C8

(function () {
	var A0 = 0x15; // first note
	var C8 = 0x6C; // last note
	var number2key = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
	for (var n = A0; n <= C8; n++) {
		var octave = (n - 12) / 12 >> 0;
		var name = number2key[n % 12] + octave;
		root.keyToNote[name] = n;
		root.noteToKey[n] = name;
	}
})();

})(MIDI);