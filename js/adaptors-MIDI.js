/*
	----------------------------------------------------------------------
	adaptors-MIDI
	----------------------------------------------------------------------
	http://webaudio.github.io/web-midi-api/
	----------------------------------------------------------------------
*/

(function() { 'use strict';

	var midi = MIDI.adaptors.midiapi = {};
	
	var _context;
	var _active = {};
	var _apply = {};

	/** connect **/
	midi.connect = function(args) {

		MIDI.adaptor.id = 'midiapi';


		/** properties **/
		defineProperties();


		/** volume **/
		_apply.volume = function(source) {
			var channel = source._channel;
			if (MIDI.mute || channel.mute) {
				setVolume(channel.id, 0.0);
			} else {
				var volume = MIDI.volume * channel.volume * source._volume;
				setVolume(channel.id, Math.min(1.0, Math.max(-1.0, volume * 2.0)));
			}
		};


		/** detune **/
		_apply.detune = function(source) {
			var channel = source._channel;
			var detune = MIDI.detune + channel.detune;
			if (detune) {
				setDetune(channel.id, detune); // -1200 to 1200 - value in cents [100 cents per semitone]
			}
		};


		MIDI.setController = setController; //- depreciate
		MIDI.setPitchBend = setDetune; //- depreciate
		MIDI.setVolume = setVolume; //- depreciate


		/** on.programChange **/
		MIDI.messageHandler.program = function(channelId, program, delay) { // change patch (instrument)
			_context.send([0xC0 + channelId, program], (delay || 0) * 1000);
		};


		/** send **/
		MIDI.send = function(data, delay) {
			_context.send(data, (delay || 0) * 1000);
		};


		/** noteOn/Off **/
		MIDI.noteOn = function(channelId, noteId, velocity, delay) {
			switch(typeof noteId) {
				case 'number':
					return noteOn.apply(null, arguments);
				case 'string':
					break;
				case 'object':
					return noteGroupOn.apply(null, arguments);
			}
		};

		MIDI.noteOff = function(channelId, noteId, delay) {
			switch(typeof noteId) {
				case 'number':
					return noteOff.apply(null, arguments);
				case 'string':
					break;
				case 'object':
					return noteGroupOff.apply(null, arguments);
			}
		};


		/** cancelNotes **/
		MIDI.cancelNotes = function(channelId) {
			if (isFinite(channelId)) {
				_context.send([0xB0 + channelId, 0x7B, 0]);
			} else {
				_context.cancel();
				for (var channelId = 0; channelId < 16; channelId ++) {
					_context.send([0xB0 + channelId, 0x7B, 0]);
				}
			}
		};
	

		/** connect **/
		return new Promise(function(resolve, reject) {
			navigator.requestMIDIAccess().then(function(e) {
				var outputs = e.outputs;
				if (outputs.size) {
					outputs.forEach(function(context) {
						if (context.state === 'connected' && context.type === 'input') {
							_context = context;
						}
					});
				}
				if (_context == null) { // no outputs
					handleError({
						message: 'No available outputs.'
					});
				} else {
					resolve();
				}
			}, handleError);

			function handleError(err) { // well at least we tried!
				reject && reject(err);
			}
		});
	};


	/* note */
	function noteOn(channelId, noteId, velocity, delay) {
		_context.send([0x90 + channelId, noteId, velocity * 127 >> 0], (delay || 0) * 1000);
		_active[channelId + 'x' + noteId] = {
			_channel: MIDI.channels[channelId],
			_volume: velocity
		};
		return {
			cancel: function() {
				
			}
		};
	}

	function noteOff(channelId, noteId, delay) {
		_context.send([0x80 + channelId, noteId, 0], (delay || 0) * 1000);
		delete _active[channelId + 'x' + noteId];
		return {
			cancel: function() {
				
			}
		};
	}

	function noteGroupOn(channelId, group, velocity, delay) {
		for (var i = 0; i < group.length; i ++) {
			_context.send([0x90 + channelId, group[i], velocity], (delay || 0) * 1000);
		}
	}

	function noteGroupOff(channelId, group, delay) {
		for (var i = 0; i < group.length; i ++) {
			_context.send([0x80 + channelId, group[i], 0], (delay || 0) * 1000);
		}
	}


	/* properties */
	function setController(channelId, type, value, delay) {
		_context.send([channelId, type, value], (delay || 0) * 1000);
	}

	function setDetune(channelId, pitch, delay) {
		_context.send([0xE0 + channelId, pitch], (delay || 0) * 1000);
	}

	function setVolume(channelId, volume, delay) {
		_context.send([0xB0 + channelId, 0x07, volume], (delay || 0) * 1000);
	}


	/** define properties **/
	function defineProperties() {

		Object.defineProperties(MIDI, {
			'context': {
				configurable: true,
				set: function(context) {
					_context = context;
				},
				get: function() {
					return _context;
				}
			},
			
			/* effects */
			'detune': set('number', 0, handler('detune')),
			'mute': set('boolean', false, handler('volume')),
			'volume': set('number', 1.0, handler('volume'))
		});
	
		function set(_format, _value, _handler) {
			return {
				configurable: true,
				get: function() {
					return _value;
				},
				set: function(value) {
					if (typeof value === _format) {
						_value = value;
						_handler && _handler();
					}
				}
			}
		}

		function handler(type) {
			return function() {
				for (var sourceId in _active) {
					_apply[type](_active[sourceId]);
				}
			};
		}
	}

})();