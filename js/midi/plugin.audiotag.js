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
		var volume = 127; // floating point 
		var buffer_nid = -1; // current channel
		var audioBuffers = []; // the audio channels
		var notesOn = []; // instrumentId + noteId that is currently playing in each 'channel', for routing noteOff/chordOff calls
		var notes = {}; // the piano keys
		for (var nid = 0; nid < 12; nid ++) {
			audioBuffers[nid] = new Audio();
		}

		function playChannel(channel, note) {
			if (!MIDI.channels[channel]) return;
			var instrument = MIDI.channels[channel].program;
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
				audio.volume = volume / 127;
				audio.play();
				buffer_nid = nid;
			}
		};

		function stopChannel(channel, note) {
			if (!MIDI.channels[channel]) return;
			var instrument = MIDI.channels[channel].program;
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
		midi.setController = function(channel, type, value, delay) { };
		midi.setVolume = function(channel, n) {
			volume = n; //- should be channel specific volume
		};

		midi.pitchBend = function(channel, program, delay) { };

		midi.noteOn = function(channel, note, velocity, delay) {
			var id = noteToKey[note];
			if (notes[id]) {
				if (delay) {
					return setTimeout(function() {
						playChannel(channel, id);
					}, delay * 1000);
				} else {
					playChannel(channel, id);
				}
			}
		};
	
		midi.noteOff = function(channel, note, delay) {
// 			var id = noteToKey[note];
// 			if (notes[id]) {
// 				if (delay) {
// 					return setTimeout(function() {
// 						stopChannel(channel, id);
// 					}, delay * 1000)
// 				} else {
// 					stopChannel(channel, id);
// 				}
// 			}
		};
	
		midi.chordOn = function(channel, chord, velocity, delay) {
			for (var idx = 0; idx < chord.length; idx ++) {
				var n = chord[idx];
				var id = noteToKey[n];
				if (notes[id]) {
					if (delay) {
						return setTimeout(function() {
							playChannel(channel, id);
						}, delay * 1000);
					} else {
						playChannel(channel, id);
					}
				}
			}
		};
	
		midi.chordOff = function(channel, chord, delay) {
			for (var idx = 0; idx < chord.length; idx ++) {
				var n = chord[idx];
				var id = noteToKey[n];
				if (notes[id]) {
					if (delay) {
						return setTimeout(function() {
							stopChannel(channel, id);
						}, delay * 1000);
					} else {
						stopChannel(channel, id);
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