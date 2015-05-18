/*
	----------------------------------------------------------------------
	Web MIDI API - Native Soundbanks
	----------------------------------------------------------------------
	http://webaudio.github.io/web-midi-api/
	----------------------------------------------------------------------
*/

(function(MIDI) { 'use strict';

	var plugin = null;
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
		MIDI.setDefaultPlugin(midi);
		///
		navigator.requestMIDIAccess().then(function(access) {
			plugin = access;
			output = plugin.outputs()[0];
			opts.onsuccess && opts.onsuccess();
		}, function(err) { // well at least we tried!
			if (window.AudioContext) { // Chrome
				opts.api = 'webaudio';
			} else if (window.Audio) { // Firefox
				opts.api = 'audiotag';
			} else { // no support
				return;
			}
			MIDI.loadPlugin(opts);
		});
	};

})(MIDI);