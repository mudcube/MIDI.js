/*
	--------------------------------------------
	MIDI.Plugin : 0.3.3 : 2014/02/11
	--------------------------------------------
	https://github.com/mudcube/MIDI.js
	--------------------------------------------
	Inspired by javax.sound.midi (albeit a super simple version): 
		http://docs.oracle.com/javase/6/docs/api/javax/sound/midi/package-summary.html
	--------------------------------------------
	Technologies:
		Web MIDI API - no native support yet
		Web Audio API - firefox 25+, chrome 10+, safari 6+, opera 15+
		HTML5 Audio Tag - ie 9+, firefox 3.5+, chrome 4+, safari 4+, opera 9.5+, ios 4+, android 2.3+
		Adobe Flash - fallback
	--------------------------------------------
	Helpers:
		MIDI.GM
		MIDI.channels
		MIDI.keyToNote
		MIDI.noteToKey
	--------------------------------------------
	MIDI.api
	MIDI.setController
	MIDI.setVolume
	MIDI.programChange
	MIDI.pitchBend
	MIDI.noteOn
	MIDI.noteOff
	MIDI.chordOn
	MIDI.chordOff
	MIDI.stopAllNotes
	MIDI.send
	--------------------------------------------
	MIDI.loadPlugin({
		targetFormat: "mp3", // optionally can force to use MP3 (for instance on mobile networks)
		instrument: "acoustic_grand_piano", // or 1 (default)
		instruments: [ "acoustic_grand_piano", "acoustic_guitar_nylon" ], // or multiple instruments
		callback: function() { }
	});
*/


if (typeof (MIDI) === "undefined") var MIDI = {};
if (typeof (MIDI.Soundfont) === "undefined") MIDI.Soundfont = {};

(function(root) { "use strict";
///
window.AudioContext = window.AudioContext || window.webkitAudioContext;
///
root.DEBUG = false;
root.USE_XHR = true;
root.soundfontUrl = "./soundfont/";
///
root.loadPlugin = function(conf) {
	if (typeof(conf) === "function") conf = { callback: conf };
	///
	root.soundfontUrl = conf.soundfontUrl || root.soundfontUrl;
	/// Detect the best type of audio to use.
	root.audioDetect(function(types) {
		var hash = window.location.hash;
		var api = "";
		// use the most appropriate plugin if not specified
		if (types[conf.api]) {
			api = conf.api;
		} else if (types[hash.substr(1)]) {
			api = hash.substr(1);
		} else if (types["webmidi"]) {
			api = "webmidi";
		} else if (window.AudioContext) { // Chrome
			api = "webaudio";
		} else if (window.Audio) { // Firefox
			api = "audiotag";
		} else { // Internet Explorer
			api = "flash";
		}
		///
		if (!connect[api]) return;
		// use audio/ogg when supported
		if (conf.targetFormat) {
			var filetype = conf.targetFormat;
		} else { // use best quality
			var filetype = types["audio/ogg"] ? "ogg" : "mp3";
		}
		// load the specified plugin
		root.lang = api;
		root.supports = types;
		///
		var instruments = getInstrumentsAsNames(conf);
		connect[api](filetype, instruments, conf);
	});
};

var getInstrumentsAsNames = function(conf) {
	/// Get the instrument name.
	var instruments = conf.instruments || conf.instrument;
	if (typeof(instruments) !== "object") {
		if (instruments) {
			instruments = [ instruments ];
		} else {
			instruments = [];
		}
	}
	///
	for (var n = 0; n < instruments.length; n ++) {
		var instrument = instruments[n];
		if (typeof(instrument) === "number") {
			instruments[n] = root.GeneralMIDI.byId[instrument];
		}
	};
	///
	return instruments;
};

///

var connect = {};

connect.webmidi = function(filetype, instruments, conf) {
	if (root.loader) root.loader.message("Web MIDI API...");
	root.WebMIDI.connect(conf);
};

connect.flash = function(filetype, instruments, conf) {
	// fairly quick, but requires loading of individual MP3s (more http requests).
	if (root.loader) root.loader.message("Flash API...");
	dom.loadScript.add({
		url: conf.soundManagerUrl || "./inc/SoundManager2/script/soundmanager2.js",
		verify: "SoundManager",
		callback: function () {
			root.Flash.connect(instruments, conf);
		}
	});
};

connect.audiotag = function(filetype, instruments, conf) {
	if (root.loader) root.loader.message("HTML5 Audio API...");
	// works ok, kinda like a drunken tuna fish, across the board.
	var queue = new Queue({
		items: instruments,
		progress: function(percent) {
			if (root.loader && instruments.length) {
				root.loader.update(null, "Downloading...", percent * 100 >> 0);
			}
		},
		next: function(instrumentId) {
			sendRequest(this, instrumentId, filetype);
		},
		callback: function() {
			root.AudioTag.connect(conf);
		}
	});
};

connect.webaudio = function(filetype, instruments, conf) {
	if (root.loader) root.loader.message("Web Audio API...");
	// works awesome! safari, chrome and firefox support.
	var queue = new Queue({
		items: instruments,
		progress: function(percent) {
			if (root.loader && instruments.length) {
				root.loader.update(null, "Downloading...", percent * 100 >> 0);
			}
		},
		next: function(instrumentId, key, index, total) {
			sendRequest(this, instrumentId, filetype);
		},
		callback: function() {
			root.WebAudio.connect(conf);
		}
	});
};

/// Helpers

var apis = {
	"webmidi": true, 
	"webaudio": true, 
	"audiotag": true, 
	"flash": true 
};

var sendRequest = function(queue, instrumentId, filetype) {
	var soundfontPath = root.soundfontUrl + instrumentId + "-" + filetype + ".js";
	if (MIDI.Soundfont[instrumentId]) {
		queue.next();
	} else if (root.USE_XHR) {
		dom.request({
			url: soundfontPath,
			onprogress: getPercent,
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
			verify: "MIDI.Soundfont['"+instrumentId+"']",
			callback: function() {
			console.log(MIDI.Soundfont)
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

var getPercent = function(event) {
	if (!this.totalSize) {
		if (this.getResponseHeader("Content-Length-Raw")) {
			this.totalSize = parseInt(this.getResponseHeader("Content-Length-Raw"));
		} else {
			this.totalSize = event.total;
		}
	}
	///
	var percent = this.totalSize ? Math.round(event.loaded / this.totalSize * 100) : "";
	if (root.loader) root.loader.update(null, "Downloading...", percent);
};

})(MIDI);

(function() { "use strict";

var setPlugin = function(root) {
	for (var key in root) {
		MIDI[key] = root[key];
	}
};

/*
	--------------------------------------------
	Web MIDI API - Native Soundbank
	--------------------------------------------
	https://dvcs.w3.org/hg/audio/raw-file/tip/midi/specification.html
	--------------------------------------------
*/

(function () {
	var plugin = null;
	var output = null;
	var channels = [];
	var root = MIDI.WebMIDI = {
		api: "webmidi"
	};

	root.send = function (data, delay) { // set channel volume
		output.send(data, delay * 1000);
	};

	root.setController = function(channel, type, value, delay) {
		output.send([channel, type, value], delay * 1000);
	};

	root.setVolume = function (channel, volume, delay) { // set channel volume
		output.send([0xB0 + channel, 0x07, volume], delay * 1000);
	};

	root.programChange = function (channel, program, delay) { // change patch (instrument)
		output.send([0xC0 + channel, program], delay * 1000);
	};

	root.pitchBend = function (channel, program, delay) { // pitch bend
		output.send([0xE0 + channel, program], delay * 1000);
	};

	root.noteOn = function (channel, note, velocity, delay) {
		output.send([0x90 + channel, note, velocity], delay * 1000);
	};

	root.noteOff = function (channel, note, delay) {
		output.send([0x80 + channel, note, 0], delay * 1000);
	};

	root.chordOn = function (channel, chord, velocity, delay) {
		for (var n = 0; n < chord.length; n ++) {
			var note = chord[n];
			output.send([0x90 + channel, note, velocity], delay * 1000);
		}
	};
	
	root.chordOff = function (channel, chord, delay) {
		for (var n = 0; n < chord.length; n ++) {
			var note = chord[n];
			output.send([0x80 + channel, note, 0], delay * 1000);
		}
	};
	
	root.stopAllNotes = function () {
		output.cancel();
		for (var channel = 0; channel < 16; channel ++) {
			output.send([0xB0 + channel, 0x7B, 0]);
		}
	};
	root.connect = function (conf) {
		setPlugin(root);
        navigator.requestMIDIAccess().then(function (access) {
			plugin = access;
			output = plugin.outputs()[0];
			if (MIDI.loader) MIDI.loader.stop();
			if (conf.callback) conf.callback();
		}, function (err) { // well at least we tried!
			if (window.AudioContext) { // Chrome
				conf.api = "webaudio";
			} else if (window.Audio) { // Firefox
				conf.api = "audiotag";
			} else { // Internet Explorer
				conf.api = "flash";
			}
			MIDI.loadPlugin(conf);
		});
	};
})();

/*
	--------------------------------------------
	Web Audio API - OGG or MPEG Soundbank
	--------------------------------------------
	https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html
	--------------------------------------------
*/

if (window.AudioContext) (function () {

	var loadAudioFile = function (url, onload, onerror) {
		if (streaming) { // Streaming buffer.
			var audio = new Audio();
			audio.src = url;
			audio.controls = false;
			audio.autoplay = false;
			audio.preload = false;
			audio.addEventListener("canplay", function() {
				callback(audio);
			});
			audio.addEventListener("error", function(err) {
				console.log(err)
			});
			document.body.appendChild(audio)
		} else if (url.indexOf("data:audio") === 0) { // Base64 string.
			var base64 = url.split(",")[1];
			var buffer = Base64Binary.decodeArrayBuffer(base64);
			var ctx = MIDI.Player.ctx;
			ctx.decodeAudioData(buffer, onload, onerror);
		} else { // XMLHTTP buffer.
			var request = new XMLHttpRequest();
			request.open('GET', url, true);
			request.responseType = 'arraybuffer';
			request.onload = function () {
				var ctx = MIDI.Player.ctx;
				ctx.decodeAudioData(request.response, onload, onerror);
			};
			request.send();
		}
	};

	var audioContext = new AudioContext();
	var streaming = false; //!!audioContext.createMediaElementSource;
	var root = MIDI.WebAudio = {
		api: "webaudio"
	};
	var ctx;
	var sources = {};
	var masterVolume = 127;
	var audioBuffers = {};
	var audioLoader = function (ctx, instrument, urlList, index, bufferList, callback) {
		var soundfont = MIDI.Soundfont[instrument];
		if (soundfont.isLoaded) {
			return callback(instrument);
		}
		var synth = MIDI.GM.byName[instrument];
		var instrumentId = synth.number;
		var key = urlList[index];
		var audioSrc = MIDI.Soundfont[instrument][key];
		if (!audioSrc) { // missing soundfont
			return callback(instrument);
		}
		var onAudioError = function(err) {
			console.log(err);
		};
		var onAudioLoad = function (buffer) {
			var msg = key;
			while (msg.length < 3) msg += "&nbsp;";
			if (typeof (MIDI.loader) !== "undefined") {
				MIDI.loader.update(null, synth.instrument + "<br>Processing: " + (index / 87 * 100 >> 0) + "%<br>" + msg);
			}
			buffer.id = key;
			bufferList[index] = buffer;
			//
			if (bufferList.length === urlList.length) {
				while (bufferList.length) {
					buffer = bufferList.pop();
					if (!buffer) continue;
					var nodeId = MIDI.keyToNote[buffer.id];
					audioBuffers[instrumentId + "" + nodeId] = buffer;
				}
				soundfont.isLoaded = true;
				callback(instrument);
			}
		};
		///
		var url = soundfont[key];
		loadAudioFile(url, onAudioLoad, onAudioError);
	};

	root.send = function(data, delay) {

	};

	root.setController = function(channel, type, value, delay) {

	};

	root.setVolume = function (channel, volume, delay) {
		setTimeout(function() {
			masterVolume = volume;
		}, delay);
	};

	root.programChange = function (channelId, program, delay) {
		setTimeout(function() {
			var channel = MIDI.channels[channelId];
			channel.instrument = program;
		}, delay);
	};

	root.pitchBend = function(channelId, program, delay) {
		setTimeout(function() {
			var channel = MIDI.channels[channelId];
			channel.pitchBend = program;
		}, delay);
	};

	root.noteOn = function (channelId, noteId, velocity, delay) {
		/// check whether the note exists
		var channel = MIDI.getChannel(channelId);
		var instrument = channel.instrument;
		var bufferId = instrument + "" + noteId;
		var buffer = audioBuffers[bufferId];
		if (!buffer) {
			if (MIDI.DEBUG) {
				console.log("missing instrument", instrument, MIDI.GM.byId[instrument]);
			}
			return;
		}
		/// convert relative delay to absolute delay
		if (delay < ctx.currentTime) delay += ctx.currentTime;
		
		/// crate audio buffer
		if (streaming) { // Streaming buffer
			var source = ctx.createMediaElementSource(buffer);
		} else { // XMLHTTP buffer
			var source = ctx.createBufferSource();
			source.buffer = buffer;
		}
		///
		if (root.ff) source.connect(root.ff.input);
		///
		sources[channelId + "" + noteId] = source;
		source.connect(ctx.destination);
		source.gainNode = ctx.createGain();
//		source.playbackRate.value = 2; // pitch shift
		///
		var value = Math.min(1.0, Math.max(-1.0, (velocity / 127) * (masterVolume / 127) * 2 - 1));
		source.gainNode.connect(ctx.destination);
		source.gainNode.gain.value = value;
	//	source.gainNode.gain.linearRampToValueAtTime(value, delay);
		source.connect(source.gainNode);
		///
		if (streaming) {
			setTimeout(function() {
				buffer.currentTime = 0;
				buffer.play()
			}, (delay || 0) * 1000);
		} else if (source.noteOn) { // old api
			source.noteOn(delay || 0);
		} else { // new api
			source.start(delay || 0);
		}
		return source;
	};

	root.noteOff = function (channelId, noteId, delay) {
		var channel = MIDI.getChannel(channelId);
		if (!channel) return;
		var instrument = channel.instrument;
		var bufferId = instrument + "" + noteId;
		var buffer = audioBuffers[bufferId];
		if (!buffer) return;
		///
		delay = delay || 0;
		if (delay < ctx.currentTime) delay += ctx.currentTime;
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
			setTimeout(function() {
				buffer.pause();
			}, delay * 1000);
		} else if (source.noteOff) { // old api
			source.noteOff(delay + 0.5);
		} else {
			source.stop(delay + 0.5);
		}
		///
		delete sources[channelId + "" + noteId];
	};

	root.chordOn = function (channel, chord, velocity, delay) {
		var ret = {}, note;
		for (var n = 0, length = chord.length; n < length; n++) {
			ret[note = chord[n]] = root.noteOn(channel, note, velocity, delay);
		}
		return ret;
	};

	root.chordOff = function (channel, chord, delay) {
		var ret = {}, note;
		for (var n = 0, length = chord.length; n < length; n++) {
			ret[note = chord[n]] = root.noteOff(channel, note, delay);
		}
		return ret;
	};

    root.stopAllNotes = function () {
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

	root.connect = function (conf) {
		setPlugin(root);
		//
		if (MIDI.Player.ctx == null)
		    MIDI.Player.ctx = ctx = new AudioContext();
		else
		    ctx = MIDI.Player.ctx;

		/// https://developer.mozilla.org/en-US/docs/Web_Audio_API/Porting_webkitAudioContext_code_to_standards_based_AudioContext
        if (!ctx.createScriptProcessor) ctx.createScriptProcessor = ctx.createJavaScriptNode;
        if (!ctx.createDelay) ctx.createDelay = ctx.createDelayNode;
        if (!ctx.createGain) ctx.createGain = ctx.createGainNode;

/*		/// testing tuna integration, think of better way to implement...
		if (window.Tuna) {
			var tuna = new Tuna(ctx); // https://github.com/Dinahmoe/tuna
			root.phaser = new tuna.Phaser({
			     rate: 1.2,                     //0.01 to 8 is a decent range, but higher values are possible
			     depth: 0.3,                    //0 to 1
			     feedback: 0.2,                 //0 to 1+
			     stereoPhase: 30,               //0 to 180
			     baseModulationFrequency: 700,  //500 to 1500
			     bypass: 0
			 });
			root.chorus = new tuna.Chorus({
			     rate: 1.5,
			     feedback: 0.2,
			     delay: 0.0045,
			     bypass: 0
			 });
			root.delay = new tuna.Delay({
			    feedback: 0.45,    //0 to 1+
			    delayTime: 150,    //how many milliseconds should the wet signal be delayed? 
			    wetLevel: 0.25,    //0 to 1+
			    dryLevel: 1,       //0 to 1+
			    cutoff: 20,        //cutoff frequency of the built in highpass-filter. 20 to 22050
			    bypass: 0
			});
			root.overdrive = new tuna.Overdrive({
			    outputGain: 0.5,         //0 to 1+
			    drive: 0.7,              //0 to 1
			    curveAmount: 1,          //0 to 1
			    algorithmIndex: 0,       //0 to 5, selects one of our drive algorithms
			    bypass: 0
			});
			root.compressor = new tuna.Compressor({
			     threshold: 0.5,    //-100 to 0
			     makeupGain: 1,     //0 and up
			     attack: 1,         //0 to 1000
			     release: 0,        //0 to 3000
			     ratio: 4,          //1 to 20
			     knee: 5,           //0 to 40
			     automakeup: true,  //true/false
			     bypass: 0
			 });
			root.convolver = new tuna.Convolver({
			    highCut: 22050,                         //20 to 22050
			    lowCut: 20,                             //20 to 22050
			    dryLevel: 1,                            //0 to 1+
			    wetLevel: 1,                            //0 to 1+
			    level: 1,                               //0 to 1+, adjusts total output of both wet and dry
			    impulse: "./inc/tuna/impulses/impulse_rev.wav",    //the path to your impulse response
			    bypass: 0
			});
			root.filter = new tuna.Filter({
				frequency: 20,         //20 to 22050
				Q: 1,                  //0.001 to 100
				gain: 0,               //-40 to 40
				bypass: 1,             //0 to 1+
				filterType: 0         //0 to 7, corresponds to the filter types in the native filter node: lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass in that order
			});
			root.cabinet = new tuna.Cabinet({
				makeupGain: 1,                                 //0 to 20
				impulsePath: "./inc/tuna/impulses/impulse_guitar.wav",    //path to your speaker impulse
				bypass: 0
			});
			root.tremolo = new tuna.Tremolo({
				intensity: 0.3,    //0 to 1
				rate: 0.1,         //0.001 to 8
				stereoPhase: 0,    //0 to 180
				bypass: 0
			});
			root.wahwah = new tuna.WahWah({
				automode: true,                //true/false
				baseFrequency: 0.5,            //0 to 1
				excursionOctaves: 2,           //1 to 6
				sweep: 0.2,                    //0 to 1
				resonance: 10,                 //1 to 100
				sensitivity: 0.5,              //-1 to 1
				bypass: 0
			});
			root.ff = root.compressor;
			root.ff.connect(ctx.destination);
		} */
		///
		var urlList = [];
		var keyToNote = MIDI.keyToNote;
		for (var key in keyToNote) urlList.push(key);
		var bufferList = [];
		var pending = {};
		var oncomplete = function(instrument) {
			delete pending[instrument];
			for (var key in pending) break;
			if (key) return;
			if (MIDI.loader) MIDI.loader.stop();
			if (conf.callback) conf.callback();
		};
		for (var instrument in MIDI.Soundfont) {
			pending[instrument] = true;
			for (var i = 0; i < urlList.length; i++) {
				audioLoader(ctx, instrument, urlList, i, bufferList, oncomplete);
			}
		}
		if (!bufferList.length) oncomplete();
	};
})();

/*
	--------------------------------------------
	AudioTag <audio> - OGG or MPEG Soundbank
	--------------------------------------------
	http://dev.w3.org/html5/spec/Overview.html#the-audio-element
	--------------------------------------------
*/

if (window.Audio) (function () {

	var root = MIDI.AudioTag = {
		api: "audiotag"
	};
	var note2id = {};
	var volume = 127; // floating point 
	var channel_nid = -1; // current channel
	var channels = []; // the audio channels
	var channelInstrumentNoteIds = []; // instrumentId + noteId that is currently playing in each 'channel', for routing noteOff/chordOff calls
	var notes = {}; // the piano keys
	for (var nid = 0; nid < 12; nid++) {
		channels[nid] = new Audio();
	}

	var playChannel = function (channel, note) {
		if (!MIDI.channels[channel]) return;
		var instrument = MIDI.channels[channel].instrument;
		var instrumentId = MIDI.GM.byId[instrument].id;
		var note = notes[note];
		if (!note) return;
		var instrumentNoteId = instrumentId + "" + note.id;
		var nid = (channel_nid + 1) % channels.length;
		var audio = channels[nid];
		channelInstrumentNoteIds[ nid ] = instrumentNoteId;
		if (!MIDI.Soundfont[instrumentId]) {
			if (MIDI.DEBUG) console.log(instrumentId);
			return;
		}
		audio.src = MIDI.Soundfont[instrumentId][note.id];
		audio.volume = volume / 127;
		audio.play();
		channel_nid = nid;
	};

	var stopChannel = function (channel, note) {
		if (!MIDI.channels[channel]) return;
		var instrument = MIDI.channels[channel].instrument;
		var instrumentId = MIDI.GM.byId[instrument].id;
		var note = notes[note];
		if (!note) return;
		var instrumentNoteId = instrumentId + "" + note.id;

		for(var i=0;i<channels.length;i++){
			var nid = (i + channel_nid + 1) % channels.length;
			var cId = channelInstrumentNoteIds[nid];

			if(cId && cId == instrumentNoteId){
				channels[nid].pause();
				channelInstrumentNoteIds[nid] = null;
				return;
			}
		}
	};

	root.send = function(data, delay) {};
	root.setController = function(channel, type, value, delay) {};

	root.setVolume = function (channel, n) {
		volume = n; //- should be channel specific volume
	};

	root.programChange = function (channel, program) {
		MIDI.channels[channel].instrument = program;
	};

	root.pitchBend = function(channel, program, delay) {};

	root.noteOn = function (channel, note, velocity, delay) {
		var id = note2id[note];
		if (!notes[id]) return;
		if (delay) {
			return setTimeout(function () {
				playChannel(channel, id);
			}, delay * 1000);
		} else {
			playChannel(channel, id);
		}
	};
	
	root.noteOff = function (channel, note, delay) {
/*
		var id = note2id[note];
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
	
	root.chordOn = function (channel, chord, velocity, delay) {
		for (var idx = 0; idx < chord.length; idx ++) {
			var n = chord[idx];
			var id = note2id[n];
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
	
	root.chordOff = function (channel, chord, delay) {
		for (var idx = 0; idx < chord.length; idx ++) {
			var n = chord[idx];
			var id = note2id[n];
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
	
	root.stopAllNotes = function () {
		for (var nid = 0, length = channels.length; nid < length; nid++) {
			channels[nid].pause();
		}
	};
	
	root.connect = function (conf) {
		for (var key in MIDI.keyToNote) {
			note2id[MIDI.keyToNote[key]] = key;
			notes[key] = {
				id: key
			};
		}
		setPlugin(root);
		///
		if (MIDI.loader) MIDI.loader.stop();
		if (conf.callback) conf.callback();
	};
})();

/*
	--------------------------------------------
	Flash - MP3 Soundbank
	--------------------------------------------
	http://www.schillmania.com/projects/soundmanager2/
	--------------------------------------------
*/
	
(function () {

	var root = MIDI.Flash = {
		api: "flash"
	};
	var noteReverse = {};
	var notes = {};

	root.send = function(data, delay) {};
	root.setController = function(channel, type, value, delay) {};

	root.setVolume = function (channel, note) {

	};

	root.programChange = function (channel, program) {
		MIDI.channels[channel].instrument = program;
	};

	root.pitchBend = function (channel, program, delay) {};

	root.noteOn = function (channel, note, velocity, delay) {
		if (!MIDI.channels[channel]) return;
		var instrument = MIDI.channels[channel].instrument;
		var id = MIDI.GM.byId[instrument].number;
		note = id + "" + noteReverse[note];
		if (!notes[note]) return;
		if (delay) {
			return setTimeout(function() { 
				notes[note].play({ volume: velocity * 2 });
			}, delay * 1000);
		} else {
			notes[note].play({ volume: velocity * 2 });
		}
	};

	root.noteOff = function (channel, note, delay) {

	};

	root.chordOn = function (channel, chord, velocity, delay) {
		if (!MIDI.channels[channel]) return;
		var instrument = MIDI.channels[channel].instrument;
		var id = MIDI.GM.byId[instrument].number;
		for (var key in chord) {
			var n = chord[key];
			var note = id + "" + noteReverse[n];
			if (notes[note]) {
				notes[note].play({ volume: velocity * 2 });
			}
		}
	};

	root.chordOff = function (channel, chord, delay) {

	};

	root.stopAllNotes = function () {

	};

	root.connect = function (instruments, conf) {
		soundManager.flashVersion = 9;
		soundManager.useHTML5Audio = true;
		soundManager.url = conf.soundManagerSwfUrl || '../inc/SoundManager2/swf/';
		soundManager.useHighPerformance = true;
		soundManager.wmode = 'transparent';
		soundManager.flashPollingInterval = 1;
		soundManager.debugMode = false;
		soundManager.onload = function () {
			var createBuffer = function(instrument, id, onload) {
				var synth = MIDI.GM.byName[instrument];
				var instrumentId = synth.number;
				notes[instrumentId+""+id] = soundManager.createSound({
					id: id,
					url: MIDI.soundfontUrl + instrument + "-mp3/" + id + ".mp3",
					multiShot: true,
					autoLoad: true,
					onload: onload
				});			
			};
			var loaded = [];
			var samplesPerInstrument = 88;
			var samplesToLoad = instruments.length * samplesPerInstrument;
				
			for (var i = 0; i < instruments.length; i++) {
				var instrument = instruments[i];
				var onload = function () {
					loaded.push(this.sID);
					if (typeof (MIDI.loader) === "undefined") return;
					MIDI.loader.update(null, "Processing: " + this.sID);
				};
				for (var j = 0; j < samplesPerInstrument; j++) {
					var id = noteReverse[j + 21];
					createBuffer(instrument, id, onload);
				}
			}
			///
			setPlugin(root);
			//
			var interval = setInterval(function () {
				if (loaded.length < samplesToLoad) return;
				clearInterval(interval);
				if (MIDI.loader) MIDI.loader.stop();
				if (conf.callback) conf.callback();
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
	helper functions
*/

// instrument-tracker
MIDI.GM = (function (arr) {
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

// channel-tracker
MIDI.getChannel = function(ch) {
	return MIDI.channels[ch];
};
MIDI.getInstrument = function(ch) {
	var channel = MIDI.getChannel(ch);
	return channel && channel.instrument;
};
MIDI.getMono = function(channel) {
	var channel = MIDI.getChannel(ch);
	return channel && channel.mono;
};
MIDI.getOmni = function(channel) {
	var channel = MIDI.getChannel(ch);
	return channel && channel.omni;
};
MIDI.getSolo = function(channel) {
	var channel = MIDI.getChannel(ch);
	return channel && channel.solo;
};

MIDI.channels = (function () { // 0 - 15 channels
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

//
MIDI.pianoKeyOffset = 21;

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