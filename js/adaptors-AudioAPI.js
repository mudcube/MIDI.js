/*
	----------------------------------------------------------------------
	adaptors-AudioAPI
	----------------------------------------------------------------------
	http://webaudio.github.io/web-audio-api/
	----------------------------------------------------------------------
*/

window.AudioContext && (function () { 'use strict';

	var adaptors = MIDI.adaptors;
	var midi = adaptors.audioapi = {};
	
	var _ctx = createAudioContext();
	var _buffers = {}; // downloaded & decoded audio buffers
	var _requests = adaptors._requests; // queue
	var _apply = {};

	var _scheduled = {}; // audio sources that are scheduled to play

	/** connect **/
	midi.connect = function (args) {

		MIDI.adaptor.id = 'audioapi';


		/** properties **/
		defineProperties();


		/** volume **/
		_apply.volume = function (source) {
			var node = source.gainNode.gain;
			var channel = source._channel;
			
			/* set value */
			if (MIDI.mute || channel.mute) {
				node.value = 0.0;
			} else {
				var volume = MIDI.volume * channel.volume * source._volume;
				node.value = Math.min(2.0, Math.max(0.0, volume));
			}
			
			/* reschedule fadeout */
			if (node._fadeout) {
				node.cancelScheduledValues(_ctx.currentTime);
				node.linearRampToValueAtTime(node.value, node._startAt);
				node.linearRampToValueAtTime(0.0, node._startAt + 0.3);
			}
		};


		/** detune **/
		_apply.detune = function (source) {
			if (_ctx.hasDetune) {
				var channel = source._channel;
				var detune = MIDI.detune + channel.detune;
				if (detune) {
					source.detune.value = detune; // -1200 to 1200 - value in cents [100 cents per semitone]
				}
			}
		};
		

		/** fx **/
		_apply.fx = function (source) {
			var channel = source._channel;
			var chain = source.gainNode;
			
			source.disconnect(0);
			source.connect(chain);
			
			apply(MIDI.fxNodes); // apply master effects
			apply(channel.fxNodes); // apply channel effects //- trigger refresh when this changes

			function apply(nodes) {
				if (nodes) {
					for (var type in nodes) {
						var node = nodes[type];
						chain.connect(node.input);
						chain = node;
					}
				}
			};
		};

		
		/** noteOn/Off **/
		MIDI.noteOn = function (channelId, noteId, velocity, delay) {
			switch(typeof noteId) {
				case 'number':
					return noteOn.apply(null, arguments);
				case 'string':
					break;
				case 'object':
					return noteGroupOn.apply(null, arguments);
			}
		};

		MIDI.noteOff = function (channelId, noteId, delay) {
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
		MIDI.cancelNotes = function (channelId) {
			if (isFinite(channelId)) {
				stopChannel(channelId);
			} else {
				for (var channelId in _scheduled) {
					stopChannel(channelId);
				}
			}
			
			function stopChannel(channelId) {
				loopChannel(channelId, function (sources, source) {
					fadeOut(sources, source);
				});
			}
		};


		/** unlock **/
		MIDI.iOSUnlock = function () {
			if (_ctx.unlocked !== true) {
				_ctx.unlocked = true;
				var buffer = _ctx.createBuffer(1, 1, 44100);
				var source = _ctx.createBufferSource();
				source.buffer = buffer;
				source.connect(_ctx.destination);
				source.start(0);
			}
		};

		// To take care of browsers who catch this as an "auto play" case.
		if (_ctx.state === "suspended")
			_ctx.resume(); // TODO-PER: should actually wrap the following in a promise, but this is the simplest code change and the following promise will take a long time.

		/** connect **/
		return new Promise(function (resolve, reject) {
			if (window.Tuna) {
				if (!(_ctx.tunajs instanceof Tuna)) {
					_ctx.tunajs = new Tuna(_ctx);
				}
			}
			
			var soundfonts = MIDI.Soundfont;
			var requests = Object.keys(soundfonts);
			for (var programId in soundfonts) {
				var program = MIDI.getProgram(programId);
				if (program) {
					var request = _requests[programId] || (_requests[programId] = {});
					if (request.loaded) {
						continue;
					} else if (request.decoding) {
						request.queue.push(resolve);
					} else {
						request.decoding = true;
						request.queue.push(resolve);
						request.pending = 0;
						
						var soundfont = soundfonts[programId];
						for (var noteName in soundfont) {
							loadAudio(programId, program.id, noteName);
						}
					}
				}
			}
			
			setTimeout(waitForEnd, 0);

			/* helpers */
			function waitForEnd() {
				for (var i = 0; i < requests.length; i ++) {
					var program = requests[i];
					var request = _requests[program];
					if (request.pending) {
						return;
					}
				}
				for (var i = 0; i < requests.length; i ++) {
					var program = requests[i];
					var request = _requests[program];
					var cb;
					while(cb = request.queue.pop()) {
						cb();
					}
				}
			}

			function loadAudio(program, programId, noteName) {
				var request = _requests[program];
				var soundfont = soundfonts[program];
				var path = soundfont[noteName];
				if (path) {
					request.pending ++;
					loadBuffer(path).then(function (buffer) {
						buffer.id = noteName;
						
						var noteId = MIDI.getNoteNumber(noteName);
						var bufferId = programId + 'x' + noteId;
						_buffers[bufferId] = buffer;

						if (!--request.pending) {
							request.decoding = false;
							request.loading = false;
							request.loaded = true;
							
							MIDI.DEBUG && console.log('loaded: ', program);
							
							waitForEnd();
						}
					}).catch(function (err) {
						MIDI.DEBUG && console.error('audio could not load', arguments);
					});
				}
			}
		});
		
		function noteOn(channelId, noteId, velocity, delay) {
			delay = delay || 0;

			var source;
			var sourceId;
			
			var volume = MIDI.volume;
			if (volume) {
				var channel = MIDI.channels[channelId];
				var programId = channel.program;
				var bufferId = programId + 'x' + noteId;
				var buffer = _buffers[bufferId];
				if (buffer) {
					source = _ctx.createBufferSource();
					source.buffer = buffer;
					
					source.gainNode = _ctx.createGain();
					source.gainNode.connect(_ctx.destination);
					
					source._channel = channel;
					source._volume = velocity;
					
					_apply.volume(source);
					_apply.detune(source);
					_apply.fx(source);
					
					source.start(delay + _ctx.currentTime);
					
					_scheduled[channelId] = _scheduled[channelId] || {};
					_scheduled[channelId][noteId] = _scheduled[channelId][noteId] || [];
					_scheduled[channelId][noteId].push(source);
					_scheduled[channelId][noteId].active = source;
				} else {
					MIDI.DEBUG && console.error(['no buffer', arguments]);
				}
			}
			return {
				cancel: function () {
					source && source.disconnect(0);
				}
			};
		}
		

		/** noteOn/Off **/
		function noteOff(channelId, noteId, delay) {
			delay = delay || 0;
			
			var channels = _scheduled[channelId];
			if (channels) {
				var sources = channels[noteId];
				if (sources) {
					var source = sources.active;
					if (source) {
						fadeOut(sources, source, delay);
					}
				}
			}
			return {
				cancel: function () {
					source && source.disconnect(0);
				}
			};
		}
	
		function noteGroupOn(channel, chord, velocity, delay) {
			var res = {};
			for (var n = 0, note, len = chord.length; n < len; n++) {
				res[note = chord[n]] = MIDI.noteOn(channel, note, velocity, delay);
			}
			return res;
		}

		function noteGroupOff(channel, chord, delay) {
			var res = {};
			for (var n = 0, note, len = chord.length; n < len; n++) {
				res[note = chord[n]] = MIDI.noteOff(channel, note, delay);
			}
			return res;
		}

		function fadeOut(sources, source, delay) {
			var startAt = (delay || 0) + _ctx.currentTime;

			// @Miranet: 'the values of 0.2 and 0.3 could of course be used as 
			// a 'release' parameter for ADSR like time settings.'
			// add { 'metadata': { release: 0.3 } } to soundfont files
			var gain = source.gainNode.gain;
			gain._fadeout = true;
			gain._startAt = startAt;
			gain.linearRampToValueAtTime(gain.value, startAt);
			gain.linearRampToValueAtTime(0.0, startAt + 0.3);
			
			source.stop(startAt + 0.5);
			
			setTimeout(function () {
				sources.shift();
			}, delay * 1000);
		}

		function loadBuffer(path) { // streaming | base64 | arraybuffer
			return new Promise(function (resolve, reject) {
				if (path.indexOf('data:audio') === 0) { // Base64 string
					decode(base64ToBuffer(path));
				} else { // XMLHTTP buffer
					var xhr = new XMLHttpRequest();
					xhr.open('GET', path, true);
					xhr.responseType = 'arraybuffer';
					xhr.onload = function () {
						decode(xhr.response);
					};
					xhr.send();
				}
				
				function decode(buffer) {
					_ctx.decodeAudioData(buffer, resolve, reject);
				}
			});
		}
	};
	
	function base64ToBuffer(uri) {
		uri = uri.split(',');
		var binary = atob(uri[1]);
		var mime = uri[0].split(':')[1].split(';')[0];
		var buffer = new ArrayBuffer(binary.length);
		var uint = new Uint8Array(buffer);
		for (var n = 0; n < binary.length; n++) {
			uint[n] = binary.charCodeAt(n);
		}
		return buffer;
	}

	function createAudioContext() {
		_ctx = new (window.AudioContext || window.webkitAudioContext)();
		_ctx.hasDetune = detectDetune();
		return _ctx;
	}

	function detectDetune() {
		var buffer = _ctx.createBuffer(1, 1, 44100);
		var source = _ctx.createBufferSource();
		try {
			source.detune.value = 1200;
			return true;
		} catch(e) {
			return false;
		}
	}

	function loopChannel(channelId, cb) {
		var channel = _scheduled[channelId];
		for (var noteId in channel) {
			var sources = channel[noteId];
			var source;
			for (var i = 0; i < sources.length; i ++) {
				cb(sources, sources[i]);
			}
		}
	}

	function defineProperties() {
		Object.defineProperties(MIDI, {
			'context': {
				configurable: true,
				get: function () {
					return _ctx;
				},
				set: function (ctx) {
					_ctx = ctx;
				}
			},
			
			/* effects */
			'detune': set('number', 0, handler('detune')),
			'fx': set('object', null, handler('fx')),
			'mute': set('boolean', false, handler('volume')),
			'volume': set('number', 1.0, handler('volume'))
		});
	
		function set(_format, _value, _handler) {
			return {
				configurable: true,
				get: function () {
					return _value;
				},
				set: function (value) {
					if (typeof value === _format) {
						_value = value;
						_handler && _handler();
					}
				}
			}
		}

		function handler(type) {
			return function () {
				MIDI.setProperty(type);
			};
		}
		
		MIDI.setProperty = function (type, channelId) {
			if (_apply[type]) {
				if (isFinite(channelId)) {
					type === 'fx' && prepareFX(MIDI.channels[channelId]);
					setFX(channelId);
				} else {
					type === 'fx' && prepareFX(MIDI);
					for (var channelId in _scheduled) {
						setFX(channelId);
					}
				
				}
			}
			
			function setFX() {
				loopChannel(channelId, function (sources, source) {
					_apply[type](source);
				});
			}

			function prepareFX(channel) {
				var fxNodes = channel.fxNodes || (channel.fxNodes = {});
				for (var key in fxNodes) {
					fxNodes[key].disconnect(_ctx.destination);
					delete fxNodes[key];
				}
				if (_ctx.tunajs) {
					var fx = channel.fx;
					for (var i = 0; i < fx.length; i ++) {
						var data = fx[i];
						var type = data.type;
						var effect = new _ctx.tunajs[type](data);
						effect.connect(_ctx.destination);
						fxNodes[type] = effect;
					}
				} else {
					MIDI.DEBUG && console.error('fx not installed.', arguments);
				}
			}
		};
	}

})();