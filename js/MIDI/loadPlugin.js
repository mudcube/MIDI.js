/*
	-----------------------------------------------------------
	MIDI.loadPlugin : 0.1 : 11/20/2012
	-----------------------------------------------------------
	https://github.com/mudx/MIDI.js
	-----------------------------------------------------------
	MIDI.loadPlugin({
		instrument: "acoustic_grand_piano", // or 1 (default)
		instruments: [ "acoustic_grand_piano", "acoustic_guitar_nylon" ], // or multiple instruments
		callback: function() { }
	});
*/

if (typeof (MIDI) === "undefined") var MIDI = {};
if (typeof (MIDI.Soundfont) === "undefined") MIDI.Soundfont = {};

(function() { "use strict";

MIDI.loadPlugin = function(conf) {
	if (typeof(conf) === "function") conf = { callback: conf };
	/// Get the instrument name.
	var instruments = conf.instruments || conf.instrument || "acoustic_grand_piano";
	if (typeof(instruments) !== "object") instruments = [ instruments ];
	instruments.map(function(data) {
		if (typeof(data) === "number") data = MIDI.GeneralMIDI.byId[data];
		MIDI.Soundfont[data] = true;
		return data;		
	});
	/// Detect the best type of audio to use.
	MIDI.audioDetect(function(types) {
		var type = "";
		// use the most appropriate plugin if not specified
		if (typeof(type) === 'undefined') {
			if (plugins[window.location.hash]) {
				type = window.location.hash.substr(1);
			} else { //
				type = "";
			}
		}
		if (type === "") {
			if (window.webkitAudioContext) { // Chrome
				type = "webaudio";
			} else if (window.Audio) { // Firefox
				type = "audiotag";
			} else { // Internet Explorer
				type = "flash";
			}
		}
		if (!connect[type]) return;
		// use audio/ogg when supported
		var filetype = types["audio/ogg"] ? "ogg" : "mp3";
		// load the specified plugin
		connect[type](filetype, instruments, conf.callback);
	});
};

///

var connect = {};

connect.java = function(filetype, instruments, callback) {
	// works well cross-browser, and fully featured, but has delay when Java machine starts.
	if (typeof(loader) === "undefined") var loader;
	if (loader) loader.message("Soundfont (500KB)<br>Java Interface...");
	MIDI.Java.connect(callback);
};

connect.flash = function(filetype, instruments, callback) {
	// fairly quick, but requires loading of individual MP3s (more http requests).
	if (typeof(loader) === "undefined") var loader;
	if (loader) loader.message("Soundfont (2MB)<br>Flash Interface...");
	DOMLoader.script.add({
		src: "./inc/SoundManager2/script/soundmanager2.js",
		verify: "SoundManager",
		callback: function () {
			MIDI.Flash.connect(callback);
		}
	});
};

connect.audiotag = function(filetype, instruments, callback) {
	// works ok, kinda like a drunken tuna fish, across the board.
	if (typeof(loader) === "undefined") var loader;
	var queue = createQueue({
		items: instruments,
		getNext: function(instrumentId) {
			DOMLoader.sendRequest({
				url: "./soundfont/" + instrumentId + "-" + filetype + ".js",
				onload: function (response) {
					MIDI.Soundfont[instrumentId] = JSON.parse(response.responseText);
					if (loader) loader.message("Downloading", 100);
					queue.getNext();
				}, 
				onprogress: function (evt) {
					var percent = Math.round(evt.loaded / evt.total * 100);
					if (loader) loader.message("Downloading", percent);
				}
			});
		},
		onComplete: function() {
			MIDI.AudioTag.connect(callback);
		}
	});
};

connect.webaudio = function(filetype, instruments, callback) {
	// works awesome! safari and chrome support
	var queue = createQueue({
		items: instruments,
		getNext: function(instrumentId) {
			DOMLoader.sendRequest({
				url: "./soundfont/" + instrumentId + "-" + filetype + ".js",
				onload: function(response) {
					MIDI.Soundfont[instrumentId] = JSON.parse(response.responseText);
					if (loader) loader.message("Downloading", 100);
					queue.getNext();
				}, 
				onprogress: function (evt) {
					var percent = Math.round(evt.loaded / evt.total * 100);
					if (loader) loader.message("Downloading", percent);
				}
			});
		},
		onComplete: function() {
			MIDI.WebAudioAPI.connect(callback);
		}
	});
};

/// Helpers

var plugins = {
	"#webaudio": true, 
	"#audiotag": true, 
	"#java": true, 
	"#flash": true 
};

var createQueue = function(conf) {
	var self = {};
	self.queue = [];
	for (var key in conf.items) {
		self.queue.push(conf.items[key]);
	}
	self.getNext = function() {
		if (!self.queue.length) return conf.onComplete();
		conf.getNext(self.queue.shift());
	};
	setTimeout(self.getNext, 1);
	return self;
};

})();