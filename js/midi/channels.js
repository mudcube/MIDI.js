/*
	----------------------------------------------------------
	channels : 2015-10-18
	----------------------------------------------------------
*/

if (typeof MIDI === 'undefined') MIDI = {};

(function (MIDI) { 'use strict';

	MIDI.channels = (function (channels) {
		for (var i = 0; i <= 15; i++) {
			addChannel(i);
		}
		
		return channels;
		
		function addChannel(channelId) {

			var channel = channels[channelId] = {};

			channel.noteOn = function (noteId, velocity, delay) {
				return MIDI.noteOn(channelId, noteId, velocity, delay);
			};
			
			channel.noteOff = function (noteId, delay) {
				return MIDI.noteOff(channelId, noteId, delay);
			};
			
			channel.cancelNotes = function () {
				return MIDI.cancelNotes(channelId);
			};
			
			channel.set = function () {
			
			};
			
			Object.defineProperties(channel, {
				id: {
					value: i,
					enumerable: true,
					writable: true
				},
				program: {
					value: i,
					enumerable: true,
					writable: true
				},
				volume: set('number', 'volume', 1.0),
				mute: set('boolean', 'volume', false),
				mono: set('boolean', '*', false),
				omni: set('boolean', '*', false),
				solo: set('boolean', '*', false),
				detune: set('number', 'detune', 0),
				fx: set('object', 'fx', null)
			});
			
			function set(_typeof, _type, _value) {
				return {
					configurable: true,
					enumerable: true,
					get: function () {
						return _value;
					},
					set: function (value) {
						if (typeof value === _typeof) {
							_value = value;
							MIDI.setProperty(_type, channelId);
						}
					}
				};
			};
		};
	})({});

})(MIDI);