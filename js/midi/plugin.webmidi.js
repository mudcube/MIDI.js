/*
	----------------------------------------------------------------------
	Web MIDI API - Native Soundbanks
	----------------------------------------------------------------------
	http://webaudio.github.io/web-midi-api/
	----------------------------------------------------------------------
*/

(function(root) { 'use strict';

	var plugin = null;
	var output = null;
	var channels = [];
	var midi = root.WebMIDI = {api: 'webmidi'};
	midi.send = function(data, delay) { // set channel volume
		output.send(data, delay * 1000);
	};

	midi.setController = function(channel, type, value, delay) {
		output.send([channel, type, value], delay * 1000);
	};

	midi.setVolume = function(channel, volume, delay) { // set channel volume
		output.send([0xB0 + channel, 0x07, volume], delay * 1000);
	};

	midi.programChange = function(channel, program, delay) { // change patch (instrument)
		output.send([0xC0 + channel, program], delay * 1000);
	};

	midi.pitchBend = function(channel, program, delay) { // pitch bend
		output.send([0xE0 + channel, program], delay * 1000);
	};

	midi.noteOn = function(channel, note, velocity, delay) {
		output.send([0x90 + channel, note, velocity], delay * 1000);
	};

	midi.noteOff = function(channel, note, delay) {
		output.send([0x80 + channel, note, 0], delay * 1000);
	};

	midi.chordOn = function(channel, chord, velocity, delay) {
		for (var n = 0; n < chord.length; n ++) {
			var note = chord[n];
			output.send([0x90 + channel, note, velocity], delay * 1000);
		}
	};

	midi.chordOff = function(channel, chord, delay) {
		for (var n = 0; n < chord.length; n ++) {
			var note = chord[n];
			output.send([0x80 + channel, note, 0], delay * 1000);
		}
	};

	midi.stopAllNotes = function() {
		output.cancel();
		for (var channel = 0; channel < 16; channel ++) {
			output.send([0xB0 + channel, 0x7B, 0]);
		}
	};

	midi.connect = function(opts) {
		root.setDefaultPlugin(midi);
		var errFunction = function(err) { // well at least we tried!
			if (window.AudioContext) { // Chrome
				opts.api = 'webaudio';
			} else if (window.Audio) { // Firefox
				opts.api = 'audiotag';
			} else { // no support
				return;
			}
			root.loadPlugin(opts);
		};
		///
		navigator.requestMIDIAccess().then(function(access) {
			plugin = access;
			var pluginOutputs = plugin.outputs;
			if (typeof pluginOutputs == 'function') { // Chrome pre-43
				output = pluginOutputs()[0];
			} else { // Chrome post-43
				output = pluginOutputs[0];
			}
			if (output === undefined) { // nothing there...
				errFunction();
			} else {
				opts.onsuccess && opts.onsuccess();			
			}
		}, errFunction);
	};

})(MIDI);