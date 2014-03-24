/*
	--------------------------------------------
	MIDI.audioDetect : 0.3.1 : 2014/02/10
	--------------------------------------------
	https://github.com/mudcube/MIDI.js
	--------------------------------------------
	Probably, Maybe, No... Absolutely!
	--------------------------------------------
	Test to see what types of <audio> MIME types are playable by the browser.
	--------------------------------------------
*/

if (typeof(MIDI) === "undefined") var MIDI = {};

(function() { "use strict";

var supports = {};	
var pending = 0;
var canPlayThrough = function (src) {
	pending ++;
	var audio = new Audio();
	var mime = src.split(";")[0];
	audio.id = "audio";
	audio.setAttribute("preload", "auto");
	audio.setAttribute("audiobuffer", true);
	audio.addEventListener("error", function() {
		supports[mime] = false;
		pending --;
	}, false);
	audio.addEventListener("canplaythrough", function() {
		supports[mime] = true;
		pending --;
	}, false);
	audio.src = "data:" + src;
	document.body.appendChild(audio);
};

MIDI.audioDetect = function(callback) {
	// detect jazz-midi plugin
	if (navigator.requestMIDIAccess) {
		var isNative = Function.prototype.toString.call(navigator.requestMIDIAccess).indexOf('[native code]');
		if (isNative) { // has native midiapi support
			supports["webmidi"] = true;
		} else { // check for jazz plugin midiapi support
			for (var n = 0; navigator.plugins.length > n; n ++) {
				var plugin = navigator.plugins[n];
				if (plugin.name.indexOf("Jazz-Plugin") >= 0) {
					supports["webmidi"] = true;
				}
			}
		}
	}
	// check whether <audio> tag is supported
	if (typeof(Audio) === "undefined") {
		return callback({});
	} else {
		supports["audiotag"] = true;
	}
	// check for webaudio api support
	if (window.AudioContext || window.webkitAudioContext) {
		supports["webaudio"] = true;
	}
	// check whether canPlayType is supported
	var audio = new Audio();
	if (typeof(audio.canPlayType) === "undefined") {
		return callback(supports);
	}
	// see what we can learn from the browser
	var vorbis = audio.canPlayType('audio/ogg; codecs="vorbis"');
	vorbis = (vorbis === "probably" || vorbis === "maybe");
	var mpeg = audio.canPlayType('audio/mpeg');
	mpeg = (mpeg === "probably" || mpeg === "maybe");
	// maybe nothing is supported
	if (!vorbis && !mpeg) {
		callback(supports);
		return;
	}
	// or maybe something is supported
	if (vorbis) canPlayThrough("audio/ogg;base64,T2dnUwACAAAAAAAAAADqnjMlAAAAAOyyzPIBHgF2b3JiaXMAAAAAAUAfAABAHwAAQB8AAEAfAACZAU9nZ1MAAAAAAAAAAAAA6p4zJQEAAAANJGeqCj3//////////5ADdm9yYmlzLQAAAFhpcGguT3JnIGxpYlZvcmJpcyBJIDIwMTAxMTAxIChTY2hhdWZlbnVnZ2V0KQAAAAABBXZvcmJpcw9CQ1YBAAABAAxSFCElGVNKYwiVUlIpBR1jUFtHHWPUOUYhZBBTiEkZpXtPKpVYSsgRUlgpRR1TTFNJlVKWKUUdYxRTSCFT1jFloXMUS4ZJCSVsTa50FkvomWOWMUYdY85aSp1j1jFFHWNSUkmhcxg6ZiVkFDpGxehifDA6laJCKL7H3lLpLYWKW4q91xpT6y2EGEtpwQhhc+211dxKasUYY4wxxsXiUyiC0JBVAAABAABABAFCQ1YBAAoAAMJQDEVRgNCQVQBABgCAABRFcRTHcRxHkiTLAkJDVgEAQAAAAgAAKI7hKJIjSZJkWZZlWZameZaouaov+64u667t6roOhIasBACAAAAYRqF1TCqDEEPKQ4QUY9AzoxBDDEzGHGNONKQMMogzxZAyiFssLqgQBKEhKwKAKAAAwBjEGGIMOeekZFIi55iUTkoDnaPUUcoolRRLjBmlEluJMYLOUeooZZRCjKXFjFKJscRUAABAgAMAQICFUGjIigAgCgCAMAYphZRCjCnmFHOIMeUcgwwxxiBkzinoGJNOSuWck85JiRhjzjEHlXNOSuekctBJyaQTAAAQ4AAAEGAhFBqyIgCIEwAwSJKmWZomipamiaJniqrqiaKqWp5nmp5pqqpnmqpqqqrrmqrqypbnmaZnmqrqmaaqiqbquqaquq6nqrZsuqoum65q267s+rZru77uqapsm6or66bqyrrqyrbuurbtS56nqqKquq5nqq6ruq5uq65r25pqyq6purJtuq4tu7Js664s67pmqq5suqotm64s667s2rYqy7ovuq5uq7Ks+6os+75s67ru2rrwi65r66os674qy74x27bwy7ouHJMnqqqnqq7rmarrqq5r26rr2rqmmq5suq4tm6or26os67Yry7aumaosm64r26bryrIqy77vyrJui67r66Ys67oqy8Lu6roxzLat+6Lr6roqy7qvyrKuu7ru+7JuC7umqrpuyrKvm7Ks+7auC8us27oxuq7vq7It/KosC7+u+8Iy6z5jdF1fV21ZGFbZ9n3d95Vj1nVhWW1b+V1bZ7y+bgy7bvzKrQvLstq2scy6rSyvrxvDLux8W/iVmqratum6um7Ksq/Lui60dd1XRtf1fdW2fV+VZd+3hV9pG8OwjK6r+6os68Jry8ov67qw7MIvLKttK7+r68ow27qw3L6wLL/uC8uq277v6rrStXVluX2fsSu38QsAABhwAAAIMKEMFBqyIgCIEwBAEHIOKQahYgpCCKGkEEIqFWNSMuakZM5JKaWUFEpJrWJMSuaclMwxKaGUlkopqYRSWiqlxBRKaS2l1mJKqcVQSmulpNZKSa2llGJMrcUYMSYlc05K5pyUklJrJZXWMucoZQ5K6iCklEoqraTUYuacpA46Kx2E1EoqMZWUYgupxFZKaq2kFGMrMdXUWo4hpRhLSrGVlFptMdXWWqs1YkxK5pyUzDkqJaXWSiqtZc5J6iC01DkoqaTUYiopxco5SR2ElDLIqJSUWiupxBJSia20FGMpqcXUYq4pxRZDSS2WlFosqcTWYoy1tVRTJ6XFklKMJZUYW6y5ttZqDKXEVkqLsaSUW2sx1xZjjqGkFksrsZWUWmy15dhayzW1VGNKrdYWY40x5ZRrrT2n1mJNMdXaWqy51ZZbzLXnTkprpZQWS0oxttZijTHmHEppraQUWykpxtZara3FXEMpsZXSWiypxNhirLXFVmNqrcYWW62ltVprrb3GVlsurdXcYqw9tZRrrLXmWFNtBQAADDgAAASYUAYKDVkJAEQBAADGMMYYhEYpx5yT0ijlnHNSKucghJBS5hyEEFLKnINQSkuZcxBKSSmUklJqrYVSUmqttQIAAAocAAACbNCUWByg0JCVAEAqAIDBcTRNFFXVdX1fsSxRVFXXlW3jVyxNFFVVdm1b+DVRVFXXtW3bFn5NFFVVdmXZtoWiqrqybduybgvDqKqua9uybeuorqvbuq3bui9UXVmWbVu3dR3XtnXd9nVd+Bmzbeu2buu+8CMMR9/4IeTj+3RCCAAAT3AAACqwYXWEk6KxwEJDVgIAGQAAgDFKGYUYM0gxphhjTDHGmAAAgAEHAIAAE8pAoSErAoAoAADAOeecc84555xzzjnnnHPOOeecc44xxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY0wAwE6EA8BOhIVQaMhKACAcAABACCEpKaWUUkoRU85BSSmllFKqFIOMSkoppZRSpBR1lFJKKaWUIqWgpJJSSimllElJKaWUUkoppYw6SimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaVUSimllFJKKaWUUkoppRQAYPLgAACVYOMMK0lnhaPBhYasBAByAwAAhRiDEEJpraRUUkolVc5BKCWUlEpKKZWUUqqYgxBKKqmlklJKKbXSQSihlFBKKSWUUkooJYQQSgmhlFRCK6mEUkoHoYQSQimhhFRKKSWUzkEoIYUOQkmllNRCSB10VFIpIZVSSiklpZQ6CKGUklJLLZVSWkqpdBJSKamV1FJqqbWSUgmhpFZKSSWl0lpJJbUSSkklpZRSSymFVFJJJYSSUioltZZaSqm11lJIqZWUUkqppdRSSiWlkEpKqZSSUmollZRSaiGVlEpJKaTUSimlpFRCSamlUlpKLbWUSkmptFRSSaWUlEpJKaVSSksppRJKSqmllFpJKYWSUkoplZJSSyW1VEoKJaWUUkmptJRSSymVklIBAEAHDgAAAUZUWoidZlx5BI4oZJiAAgAAQABAgAkgMEBQMApBgDACAQAAAADAAAAfAABHARAR0ZzBAUKCwgJDg8MDAAAAAAAAAAAAAACAT2dnUwAEAAAAAAAAAADqnjMlAgAAADzQPmcBAQA=");
	if (mpeg) canPlayThrough("audio/mpeg;base64,/+MYxAAAAANIAUAAAASEEB/jwOFM/0MM/90b/+RhST//w4NFwOjf///PZu////9lns5GFDv//l9GlUIEEIAAAgIg8Ir/JGq3/+MYxDsLIj5QMYcoAP0dv9HIjUcH//yYSg+CIbkGP//8w0bLVjUP///3Z0x5QCAv/yLjwtGKTEFNRTMuOTeqqqqqqqqqqqqq/+MYxEkNmdJkUYc4AKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq");
	// lets find out!
	var time = (new Date()).getTime(); 
	var interval = window.setInterval(function() {
		var now = (new Date()).getTime();
		var maxExecution = now - time > 5000;
		if (!pending || maxExecution) {
			window.clearInterval(interval);
			callback(supports);
		}
	}, 1);
};

})();
/*
	--------------------------------------------
	MIDI.Player : 0.3.1 : 2014/02/10
	--------------------------------------------
	https://github.com/mudcube/MIDI.js
	--------------------------------------------
*/

if (typeof (MIDI) === "undefined") var MIDI = {};
if (typeof (MIDI.Player) === "undefined") MIDI.Player = {};

(function() { "use strict";

var root = MIDI.Player;
root.callback = undefined; // your custom callback goes here!
root.currentTime = 0;
root.endTime = 0; 
root.restart = 0; 
root.playing = false;
root.timeWarp = 1;
root.startDelay = 0;
root.BPM = 120;
//
root.start =
root.resume = function (callback) {
    if (root.currentTime < -1) root.currentTime = -1;
    startAudio(root.currentTime, null, callback);
};

root.pause = function () {
	var tmp = root.restart;
	stopAudio();
	root.restart = tmp;
};

root.stop = function () {
	stopAudio();
	root.restart = 0;
	root.currentTime = 0;
};

root.addListener = function(callback) {
	onMidiEvent = callback;
};

root.removeListener = function() {
	onMidiEvent = undefined;
};

root.clearAnimation = function() {
	if (root.interval)  {
		window.clearInterval(root.interval);
	}
};

root.setAnimation = function(config) {
	var callback = (typeof(config) === "function") ? config : config.callback;
	var interval = config.interval || 30;
	var currentTime = 0;
	var tOurTime = 0;
	var tTheirTime = 0;
	//
	root.clearAnimation();
	root.interval = setInterval(function () {
		if (root.endTime === 0) return;
		if (root.playing) {
			currentTime = (tTheirTime === root.currentTime) ? tOurTime - (new Date).getTime() : 0;
			if (root.currentTime === 0) {
				currentTime = 0;
			} else {
				currentTime = root.currentTime - currentTime;
			}
			if (tTheirTime !== root.currentTime) {
				tOurTime = (new Date).getTime();
				tTheirTime = root.currentTime;
			}
		} else { // paused
			currentTime = root.currentTime;
		}
		var endTime = root.endTime;
		var percent = currentTime / endTime;
		var total = currentTime / 1000;
		var minutes = total / 60;
		var seconds = total - (minutes * 60);
		var t1 = minutes * 60 + seconds;
		var t2 = (endTime / 1000);
		if (t2 - t1 < -1) return;
		callback({
			now: t1,
			end: t2,
			events: noteRegistrar
		});
	}, interval);
};

// helpers

root.loadMidiFile = function(callback) { // reads midi into javascript array of events
    root.replayer = new Replayer(MidiFile(root.currentData), root.timeWarp, null, root.BPM);
    root.data = root.replayer.getData();
	root.endTime = getLength();
	///
	MIDI.loadPlugin({
		instruments: root.getFileInstruments(),
		callback: callback
	});
};

root.loadFile = function (file, callback) {
	root.stop();
	if (file.indexOf("base64,") !== -1) {
		var data = window.atob(file.split(",")[1]);
		root.currentData = data;
		root.loadMidiFile(callback);
		return;
	}
	///
	var fetch = new XMLHttpRequest();
	fetch.open("GET", file);
	fetch.overrideMimeType("text/plain; charset=x-user-defined");
	fetch.onreadystatechange = function () {
		if (this.readyState === 4 && this.status === 200) {
			var t = this.responseText || "";
			var ff = [];
			var mx = t.length;
			var scc = String.fromCharCode;
			for (var z = 0; z < mx; z++) {
				ff[z] = scc(t.charCodeAt(z) & 255);
			}
			var data = ff.join("");
			root.currentData = data;
			root.loadMidiFile(callback);
		}
	};
	fetch.send();
};

root.getFileInstruments = function() {
	var instruments = {};
	var programs = {};
	for (var n = 0; n < root.data.length; n ++) {
		var event = root.data[n][0].event;
		if (event.type !== "channel") continue;
		var channel = event.channel;
		switch(event.subtype) {
			case "controller":
//				console.log(event.channel, MIDI.defineControl[event.controllerType], event.value);
				break;
			case "programChange":
				programs[channel] = event.programNumber;
				break;
			case "noteOn":
				var program = programs[channel];
				var gm = MIDI.GM.byId[isFinite(program) ? program : channel];
				instruments[gm.id] = true;
				break;
		}
	}
	var ret = [];
	for (var key in instruments) {
		ret.push(key);
	}
	return ret;
};

// Playing the audio

var eventQueue = []; // hold events to be triggered
var queuedTime; // 
var startTime = 0; // to measure time elapse
var noteRegistrar = {}; // get event for requested note
var onMidiEvent = undefined; // listener callback
var scheduleTracking = function (channel, note, currentTime, offset, message, velocity, time) {
	return setTimeout(function () {
		var data = {
			channel: channel,
			note: note,
			now: currentTime,
			end: root.endTime,
			message: message,
			velocity: velocity
		};
		//
		if (message === 128) {
			delete noteRegistrar[note];
		} else {
			noteRegistrar[note] = data;
		}
		if (onMidiEvent) {
			onMidiEvent(data);
		}
		root.currentTime = currentTime;
		///
		eventQueue.shift();
		///
		if (eventQueue.length < 1000) {
			startAudio(queuedTime, true);
		} else if (root.currentTime === queuedTime && queuedTime < root.endTime) { // grab next sequence
			startAudio(queuedTime, true);
		}
	}, currentTime - offset);
};

var getContext = function() {
	if (MIDI.lang === "WebAudioAPI") {
		return MIDI.Player.ctx;
	} else if (!root.ctx) {
		root.ctx = { currentTime: 0 };
	}
	return root.ctx;
};

var getLength = function() {
	var data =  root.data;
	var length = data.length;
	var totalTime = 0.5;
	for (var n = 0; n < length; n++) {
		totalTime += data[n][1];
	}
	return totalTime;
};

var __now;
var getNow = function() {
    if (window.performance && window.performance.now)
        return window.performance.now();
    return Date.now();
};

var startAudio = function (currentTime, fromCache, callback) {
	if (!root.replayer) return;
	if (!fromCache) {
		if (typeof (currentTime) === "undefined") currentTime = root.restart;
		if (root.playing) stopAudio();
		root.playing = true;
		root.data = root.replayer.getData();
		root.endTime = getLength();
	}
	///
	var note;
	var offset = 0;
	var messages = 0;
	var data = root.data;
	var ctx = getContext();
	var length = data.length;
	//
	queuedTime = 0.5;
	///
	var interval = eventQueue[0] && eventQueue[0].interval || 0;
	var foffset = currentTime - root.currentTime;
	///
	if (MIDI.api !== "webaudio") { // set currentTime on ctx
		var now = getNow();
		__now = __now || now;
		ctx.currentTime = (now - __now) / 1000;
	}
	///
	startTime = ctx.currentTime;
	///
	for (var n = 0; n < length && messages < 100; n++) {
		var time = data[n][1];
		if ((queuedTime += time) <= currentTime) {
			offset = queuedTime;
			continue;
		}
		currentTime = queuedTime - offset;
		///
		var event = data[n][0].event;
		if (event.type !== "channel") {
			//console.log(event);
			continue;
		}
		var channelId = event.channel;
		var channel = MIDI.channels[channelId];
		var delay = ctx.currentTime + ((currentTime + foffset + root.startDelay) / 1000);
		var queueTime = queuedTime - offset + root.startDelay;
		switch (event.subtype) {
			case "controller":
				MIDI.setController(channelId, event.controllerType, event.value, delay);
				break;
			case "programChange":
				MIDI.programChange(channelId, event.programNumber, delay);
				break;
			case "pitchBend":
				MIDI.pitchBend(channelId, event.value, delay);
				break;
			case "noteOn":
				if (channel.mute) break;
				note = event.noteNumber - (root.MIDIOffset || 0);
				var obj = {
				    event: event,
				    time: queueTime,
				    source: MIDI.noteOn(channelId, event.noteNumber, event.velocity, delay),
				    interval: scheduleTracking(channelId, note, queuedTime + root.startDelay, offset - foffset, 144, event.velocity)
				};
				eventQueue.push(obj);
				messages++;
				break;
			case "noteOff":
				if (channel.mute) break;
				note = event.noteNumber - (root.MIDIOffset || 0);
				var obj = {
				    event: event,
				    time: queueTime,
				    source: MIDI.noteOff(channelId, event.noteNumber, delay),
				    interval: scheduleTracking(channelId, note, queuedTime, offset - foffset, 128, 0)
				};
				eventQueue.push(obj);
				break;
			default:
				break;
		}
	}
	if (callback) {
	    callback(eventQueue);
	}
};

var stopAudio = function () {
	var ctx = getContext();
	root.playing = false;
	root.restart += (ctx.currentTime - startTime) * 1000;
	// stop the audio, and intervals
	while (eventQueue.length) {
		var o = eventQueue.pop();
		window.clearInterval(o.interval);
		if (!o.source) continue; // is not webaudio
		if (typeof(o.source) === "number") {
			window.clearTimeout(o.source);
		} else { // webaudio
			o.source.disconnect(0);
		}
	}
	// run callback to cancel any notes still playing
	for (var key in noteRegistrar) {
		var o = noteRegistrar[key]
		if (noteRegistrar[key].message === 144 && onMidiEvent) {
			onMidiEvent({
				channel: o.channel,
				note: o.note,
				now: o.now,
				end: o.end,
				message: 128,
				velocity: o.velocity
			});
		}
	}
	// reset noteRegistrar
	noteRegistrar = {};
};

})();
/*
	--------------------------------------------
	MIDI.Plugin : 0.3.3 : 2014/02/18
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
		}, delay || 0);
	};

	root.programChange = function (channelId, program, delay) {
		setTimeout(function() {
			var channel = MIDI.channels[channelId];
			channel.instrument = program;
		}, delay || 0);
	};

	root.pitchBend = function(channelId, program, delay) {
		setTimeout(function() {
			var channel = MIDI.channels[channelId];
			channel.pitchBend = program;
		}, delay || 0);
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
		var value = (velocity / 127) * (masterVolume / 127) * 2 - 1;
		source.gainNode.connect(ctx.destination);
		source.gainNode.gain.value = Math.min(1.0, Math.max(-1.0, value));
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
/*
	---------------------------------------------------
	dom.XMLHttp : 0.1.1 : 2013/13/28
	---------------------------------------------------
	dom.request({
		url: "./dir/something.extension",
		body: "test!",
		onerror: function(event) {
			console.log(event);
		},
		onload: function(response) {
			console.log(response.responseText);
		}, 
		onprogress: function (event) {
			var percent = event.loaded / event.total * 100 >> 0;
			loader.message("loading: " + percent + "%");
		}
	});	
*/

if (typeof(dom) === "undefined") var dom = {};

(function(root) { "use strict";

dom.request = function(conf) {
	// Add XMLHttpRequest when not available
	if (typeof (XMLHttpRequest) === "undefined") {
		XMLHttpRequest;
		(function () { // find equivalent for IE
			var factories = [
			function () {
				return new ActiveXObject("Msxml2.XMLHTTP")
			}, function () {
				return new ActiveXObject("Msxml3.XMLHTTP")
			}, function () {
				return new ActiveXObject("Microsoft.XMLHTTP")
			}];
			for (var i = 0; i < factories.length; i++) {
				try {
					factories[i]();
				} catch (e) {
					continue;
				}
				break;
			}
			XMLHttpRequest = factories[i];
		})();
	}

	if (typeof ((new XMLHttpRequest()).responseText) === "undefined") {
		// http://stackoverflow.com/questions/1919972/how-do-i-access-xhr-responsebody-for-binary-data-from-javascript-in-ie
		var IEBinaryToArray_ByteStr_Script =
		"<!-- IEBinaryToArray_ByteStr -->\r\n"+
		"<script type='text/vbscript'>\r\n"+
		"Function IEBinaryToArray_ByteStr(Binary)\r\n"+
		"   IEBinaryToArray_ByteStr = CStr(Binary)\r\n"+
		"End Function\r\n"+
		"Function IEBinaryToArray_ByteStr_Last(Binary)\r\n"+
		"   Dim lastIndex\r\n"+
		"   lastIndex = LenB(Binary)\r\n"+
		"   if lastIndex mod 2 Then\r\n"+
		"       IEBinaryToArray_ByteStr_Last = Chr( AscB( MidB( Binary, lastIndex, 1 ) ) )\r\n"+
		"   Else\r\n"+
		"       IEBinaryToArray_ByteStr_Last = "+'""'+"\r\n"+
		"   End If\r\n"+
		"End Function\r\n"+
		"</script>\r\n";

		// inject VBScript
		document.write(IEBinaryToArray_ByteStr_Script);

		dom.request = function(conf) {
			// helper to convert from responseBody to a "responseText" like thing
			function getResponseText(binary) {
				var byteMapping = {};
				for (var i = 0; i < 256; i++) {
					for (var j = 0; j < 256; j++) {
						byteMapping[String.fromCharCode(i + j * 256)] = String.fromCharCode(i) + String.fromCharCode(j);
					}
				}
				// call into VBScript utility fns
				var rawBytes = IEBinaryToArray_ByteStr(binary);
				var lastChr = IEBinaryToArray_ByteStr_Last(binary);
				return rawBytes.replace(/[\s\S]/g, function (match) {
					return byteMapping[match];
				}) + lastChr;
			};
			//
			if (typeof(conf) === "string") conf = { url: conf };
			var req = XMLHttpRequest();
			req.open(conf.body ? "POST" : "GET", conf.url, true);
			if (req.overrideMimeType) req.overrideMimeType("text/plain; charset=x-user-defined");
			if (conf.headers) { // custom headers
				for (var key in conf.headers) {
					req.setRequestHeader(key, conf.headers[key]);
				}
			} else if (conf.body) { // set the default for POST request.
				req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			}
			if (conf.responseType) req.responseType = conf.responseType;
			if (conf.onerror && "onerror" in req) req.onerror = conf.onerror;
			if (conf.onprogress && "onprogress" in req) req.onprogress = conf.onprogress;
			req.onreadystatechange = function (event) {
				if (req.readyState === 4) {
					if (req.status === 200 || req.status === 304 || req.status === 0) {
						req.responseText = getResponseText(req.responseBody);
						if (conf.onload) {
							conf.onload(req);
						}
					} else {
						if (conf.onerror) {
							conf.onerror(event, false);
						}
					}
				}
			};
			req.setRequestHeader("Accept-Charset", "x-user-defined");
			req.send(null);
			return req;
		}
	} else {
		dom.request = function(conf) {
			if (typeof(conf) === "string") conf = { url: conf };
			var req = new XMLHttpRequest();
			req.open(conf.body ? "POST" : "GET", conf.url, true);
			if (req.overrideMimeType) req.overrideMimeType("text/plain; charset=x-user-defined");
			if (conf.headers) { // custom headers
				for (var key in conf.headers) {
					req.setRequestHeader(key, conf.headers[key]);
				}
			} else if (conf.body) { // set the default for POST request.
				req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			}
			///
			if (conf.responseType) {
				req.responseType = conf.responseType;
			}
			if (conf.onerror && "onerror" in req) {
				req.onerror = conf.onerror;
			}
			if (conf.onprogress && req.upload && "onprogress" in req.upload) {
				req.upload.onprogress = conf.onprogress;
			}
			///
			req.onreadystatechange = function (event) {
				if (req.readyState === 4) { // The request is complete
					if (req.status === 200 || // Response OK
						req.status === 304 || // Not Modified
						req.status === 0 && root.userAgent.cordova // Cordova quirk
					) {
						if (conf.onload) {
							conf.onload(req);
						}
					} else {
						if (conf.onerror) {
							conf.onerror(event, false);
						}
					}
				}
			};
			req.send(conf.body);
			return req;
		};
	}
	///
	dom.request(conf);
};

})(dom);

/// For NodeJS
if (typeof (module) !== "undefined" && module.exports) {
	XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
	module.exports = dom.request;
}
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
				callback: function() {
					console.log(1)
				}
			},
			{ 
				url: "../inc/downloadify/js/swfobject.js",
				verify: "swfobject",
				callback: function() {
					console.log(2)
				}
			}
		],
		callback: function() {
			console.log(3)
		}
	});
	/// Just verification.
	dom.loadScript.add({
		url: "../js/jszip/jszip.js",
		verify: "JSZip",
		callback: function() {
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
		if (element.callback) element.callback();
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
			} else if (config.callback) {
				config.callback();
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
				} else if (config.callback) {
					config.callback();
				}
			} else { // loading new script
				var element = urls[ID];
				var url = element.url;
				if (that.loading[url]) { // already loading from another call (attach to event)
					that.loading[url] = function() {
						if (element.callback) element.callback();
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

var globalExists = function(path, root) {
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
	----------------------------------------------------
	sketch.util.Queue : 0.1.1 : https://sketch.io
	----------------------------------------------------
*/

var Queue = function(conf) {
	/*
		new sketch.util.Queue({
			items: list,
			range: { from: 0, to: 75 },
			oncomplete: function() {
	//			queue.reset(); // infinite loop!
	//			queue.next();
			},
			next: function(entry, key, index) {
				if (item[0] !== "." && item.indexOf(".") === -1) {
					readDir(dir + item + "/", this.next);
				} else {
					setTimeout(this.next, 1)
				}
			}
		});
	*/
	var that = this;
	var oncomplete = conf.oncomplete || conf.complete || conf.callback;
	var onprogress = conf.onprogress || conf.progress;
	var flatten = conf.flatten === false ? false : true;
	this.canceled = false;
	this.cancel = function() {
		if (that.canceled || that.remaining <= 0) return;
		if (conf.oncancel) conf.oncancel();
		that.canceled = true;
	};
	/// Request the next item in stack.
	this.next = function() {
		if (that.canceled) return;
		/// Emit the progress of the queue.
		var queue = that.queue;
		var remaining = that.remaining;
		var total = that.length;
		var index = (total - remaining) - 1;
		var key = that.keys[index];
		///
		if (onprogress) {
			onprogress(total ? 1 - (remaining + 1) / total : 1);
		}

		/// Check whether the queue is complete.
		if (!queue.length) {
			if (oncomplete) {
				oncomplete();
			}
			return;
		}
		/// Indicate previous element as processed.
		that.remaining --;
		///
		var isObject = String(item) === "[object Object]";
		var isArray = isObject && item.length;

		/// Single level queue
		if (flatten) {
			conf.next.call(that, queue.shift(), key, index);
		} else {
			/// Remove previously completed level in stack.
			var item = queue[0];
			if (isObject && !isArray) queue.shift();
			/// Process next item in multi-dimensional stack.
			if (isObject && isArray) {
				conf.next.call(that, item.shift(), key, index);
			} else { // ditto for single-dimensional stack.
				conf.next.call(that, queue.shift(), key, index);
			}
		}
	};
	/// 
	this.reset = function(items) {
		if (conf.range) {
			var range = conf.range;
			for (var n = range.from, items = []; n <= range.to; n++) {
				items.push(n);
			}
		} else {
			items = items || conf.items;		
		}
		///
		this.length = 0;
		this.remaining = -1;
		this.queue = [];
		this.keys = [];

		/// Flatten multi-dimensional objects.
		for (var key in items) {
			if (!items.hasOwnProperty(key)) continue; // work when Array is prototyped
			if (String(items[key]) === "[object Object]" && !flatten) {
				var sub = [];
				this.queue.push(sub);
				for (var key1 in items[key]) {
					if (!items[key].hasOwnProperty(key1)) continue; // work when Array is prototyped
					sub.push(items[key][key1]);
					this.keys.push(key1);
					this.length ++;
					this.remaining ++;
				}
			} else {
				this.keys.push(key);
				this.queue.push(items[key]);
				this.length ++;
				this.remaining ++;
			}
		}
	};
	///
	this.reset(); // populate queue
	this.next(); // start queue
	///
	return this;
};
// http://ntt.cc/2008/01/19/base64-encoder-decoder-with-javascript.html

// window.atob and window.btoa

(function (window) {

	var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	
	window.btoa || (window.btoa = function encode64(input) {
		input = escape(input);
		var output = "";
		var chr1, chr2, chr3 = "";
		var enc1, enc2, enc3, enc4 = "";
		var i = 0;
		do {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
			output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
			chr1 = chr2 = chr3 = "";
			enc1 = enc2 = enc3 = enc4 = "";
		} while (i < input.length);
		return output;
	});
	
	window.atob || (window.atob = function(input) {
		var output = "";
		var chr1, chr2, chr3 = "";
		var enc1, enc2, enc3, enc4 = "";
		var i = 0;
		// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
		var base64test = /[^A-Za-z0-9\+\/\=]/g;
		if (base64test.exec(input)) {
			alert("There were invalid base64 characters in the input text.\n" + "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" + "Expect errors in decoding.");
		}
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		do {
			enc1 = keyStr.indexOf(input.charAt(i++));
			enc2 = keyStr.indexOf(input.charAt(i++));
			enc3 = keyStr.indexOf(input.charAt(i++));
			enc4 = keyStr.indexOf(input.charAt(i++));
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
			output = output + String.fromCharCode(chr1);
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
			chr1 = chr2 = chr3 = "";
			enc1 = enc2 = enc3 = enc4 = "";
		} while (i < input.length);
		return unescape(output);
	});

}(this));
/*
Copyright (c) 2011, Daniel Guerrero
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the Daniel Guerrero nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL DANIEL GUERRERO BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
 
var Base64Binary = {
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	/* will return a  Uint8Array type */
	decodeArrayBuffer: function(input) {
		var bytes = Math.ceil( (3*input.length) / 4.0);
		var ab = new ArrayBuffer(bytes);
		this.decode(input, ab);

		return ab;
	},

	decode: function(input, arrayBuffer) {
		//get last chars to see if are valid
		var lkey1 = this._keyStr.indexOf(input.charAt(input.length-1));		 
		var lkey2 = this._keyStr.indexOf(input.charAt(input.length-1));		 

		var bytes = Math.ceil( (3*input.length) / 4.0);
		if (lkey1 == 64) bytes--; //padding chars, so skip
		if (lkey2 == 64) bytes--; //padding chars, so skip

		var uarray;
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		var j = 0;

		if (arrayBuffer)
			uarray = new Uint8Array(arrayBuffer);
		else
			uarray = new Uint8Array(bytes);

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		for (i=0; i<bytes; i+=3) {	
			//get the 3 octects in 4 ascii chars
			enc1 = this._keyStr.indexOf(input.charAt(j++));
			enc2 = this._keyStr.indexOf(input.charAt(j++));
			enc3 = this._keyStr.indexOf(input.charAt(j++));
			enc4 = this._keyStr.indexOf(input.charAt(j++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			uarray[i] = chr1;			
			if (enc3 != 64) uarray[i+1] = chr2;
			if (enc4 != 64) uarray[i+2] = chr3;
		}

		return uarray;	
	}
};