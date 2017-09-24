/*
	-----------------------------------------------------------
	MIDI.loadPlugin : 0.1.2 : 01/22/2014
	-----------------------------------------------------------
	https://github.com/mudcube/MIDI.js
	-----------------------------------------------------------
	MIDI.loadPlugin({
		targetFormat: "mp3", // optionally can force to use MP3 (for instance on mobile networks)
		instrument: "acoustic_grand_piano", // or 1 (default)
		instruments: [ "acoustic_grand_piano", "acoustic_guitar_nylon" ], // or multiple instruments
		callback: function() { }
	});
*/

if (!window.MIDI)
    window.MIDI = {};


//if (typeof (MIDI) === "undefined") var MIDI = {};

if (typeof (MIDI.Soundfont) === "undefined") MIDI.Soundfont = {};

(function() { "use strict";

var USE_JAZZMIDI = false; // Turn on to support JazzMIDI Plugin

MIDI.getPercent = function(event) {
    if (!this.totalSize) {
        if (this.getResponseHeader && this.getResponseHeader("Content-Length-Raw")) {
            this.totalSize = parseInt(this.getResponseHeader("Content-Length-Raw"));
        } else {
            this.totalSize = event.total;
        }
    }
    ///
    return !this.totalSize ? 0 : Math.round(event.loaded / this.totalSize * 100);
};

MIDI.loadPlugin = function(conf) {
    
    
	if (typeof(conf) === "function") conf = {
		callback: conf
	};
        
	/// Get the instrument name.
	var instruments = conf.instruments || conf.instrument || "accordion";
	if (typeof(instruments) !== "object") instruments = [ instruments ];
        
        MIDI.clientOnProgress = conf.onprogress;
        MIDI.jobsTotal = (2*instruments.length);
        MIDI.jobsDone = 0;
        
	for (var n = 0; n < instruments.length; n ++) {
		var instrument = instruments[n];
		if (typeof(instrument) === "number") {
			instruments[n] = MIDI.GeneralMIDI.byId[instrument];
		}
	};
	///
	MIDI.soundfontUrl = conf.soundfontUrl || MIDI.soundfontUrl || "./soundfont/";
        
	/// Detect the best type of audio to use.
	MIDI.audioDetect(function(types) {
            
		var api = "";
		// use the most appropriate plugin if not specified
		if (apis[conf.api]) {
			api = conf.api;
		} else if (apis[window.location.hash.substr(1)]) {
			api = window.location.hash.substr(1);
		} else if (USE_JAZZMIDI && navigator.requestMIDIAccess) {
			api = "webmidi";
		} else if (window.AudioContext || window.webkitAudioContext) { // Chrome
			api = "webaudio";
		} else if (window.Audio) { // Firefox
			api = "audiotag";
		} else { // Internet Explorer
			api = "flash";
		}
                
		///
		if (!connect[api]) return;
                
		// use audio/ogg when supported
                var filetype = types["audio/ogg"] ? "ogg" : "mp3";
                
		if (conf.targetFormat) {
                    filetype = conf.targetFormat;
		}
                
		// load the specified plugin
		MIDI.lang = api;
		MIDI.supports = types;
                MIDI.audioformat = filetype;
		connect[api](filetype, instruments, conf);
	});
};

///

var connect = {};

connect.webmidi = function(filetype, instruments, conf) {
    
	if (MIDI.loader) MIDI.loader.message("Web MIDI API...");
        
	MIDI.WebMIDI.connect(conf);
        
};

connect.flash = function(filetype, instruments, conf) {
    
	// fairly quick, but requires loading of individual MP3s (more http requests).
	if (MIDI.loader) MIDI.loader.message("Flash API...");
        
	DOMLoader.script.add({
		src: conf.soundManagerUrl || "./inc/SoundManager2/script/soundmanager2.js",
		verify: "SoundManager",
		callback: function () {
			MIDI.Flash.connect(instruments, conf);
		}
	});
};

connect.audiotag = function(filetype, instruments, conf) {
    
	// works ok, kinda like a drunken tuna fish, across the board.
        if (MIDI.loader) MIDI.loader.message("HTML5 Audio API...");
        
        var onload = defaultOnLoad;
	var queue = createQueue({
		items: instruments,
		getNext: function(instrumentId) {
                            DOMLoader.sendRequest({
				url: MIDI.soundfontUrl + instrumentId + "-" + filetype + ".js",
                                instrument: instrumentId,
				onprogress: defaultOnProgress,
				onload: function (response, instrument) {
					addSoundfont(response.responseText, instrument);
                                        onload();
					queue.getNext();
				}
                            });
		},
		onComplete: function() {
			MIDI.AudioTag.connect(conf);
		}
	});
};

connect.webaudio = function(filetype, instruments, conf) {
    
	// works awesome! safari, chrome and firefox support.
	if (MIDI.loader) MIDI.loader.message("Web Audio API...");
         
        var onload = defaultOnLoad;
	var queue = createQueue({
		items: instruments,
		getNext: function(instrumentId) {
			DOMLoader.sendRequest({
				url: MIDI.soundfontUrl + instrumentId + "-" + filetype + ".js",
                                instrument: instrumentId,
				onprogress: defaultOnProgress,
				onload: function(response, instrument) {
					addSoundfont(response.responseText, instrument );
                                        onload();
					queue.getNext();
				}
			});
		},
		onComplete: function() {
                    MIDI.WebAudio.connect(conf);
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

var addSoundfont = function(text, instrument) {
    if(!MIDI.Soundfont[instrument]) {
	var script = document.createElement("script");
	script.language = "javascript";
	script.type = "text/javascript";
	script.text = text;
	document.body.appendChild(script);
    } else {
        MIDI.Soundfont[instrument].alreadyLoaded = true;
    }
};



var defaultOnProgress = function( event ) {
    if( MIDI.clientOnProgress ) {
        MIDI.clientOnProgress( MIDI.jobsTotal, MIDI.jobsDone, MIDI.getPercent(event) );
    } else {
        MIDI.loader && MIDI.loader.update(null, "Downloading...", MIDI.getPercent(event));
    }
};

var defaultOnLoad = function( event ) {
    if( MIDI.clientOnProgress ) {
        MIDI.jobsDone++;
        MIDI.clientOnProgress( MIDI.jobsTotal, MIDI.jobsDone, 0 );
    } else {
        MIDI.loader && MIDI.loader.update(null, "Downloading", 100);
    }    
};

var createQueue = function(conf) {
	var self = {};
	self.queue = [];
	for (var key in conf.items) {
		if (conf.items.hasOwnProperty(key)) {
			self.queue.push(conf.items[key]);
		}
	}
	self.getNext = function() {
		if (!self.queue.length) return conf.onComplete();
		conf.getNext(self.queue.shift());
	};
	setTimeout(self.getNext, 1);
	return self;
};

})();