/*
	----------------------------------------------------------------------
	adaptors
	----------------------------------------------------------------------
*/

if (typeof MIDI === 'undefined') MIDI = {};

(function (MIDI) { 'use strict';

	var _adaptor = MIDI.adaptor = {};
	var _adaptors = MIDI.adaptors = {};
	var _requests = _adaptors._requests = {};
	var _load = _adaptors._load = function (args) {
		resetAdaptor();
		if (args.tech === 'midiapi') {
			return _adaptors.midiapi.connect(args);
		} else {
			return requestQueue(args);
		}
	};

	function requestQueue(args) {
		return new Promise(function (resolve, reject) {
			var audioFormat = _adaptor.format.split('_').shift();
			var programs = args.instruments;
			var onprogress = args.onprogress;
			var tech = args.tech;
			
			var length = programs.length;

			for (var i = 0; i < length; i ++) {
				var programId = programs[i];
				var request = _requests[programId] || (_requests[programId] = {});

				if (request.loaded) {
					waitForEnd([programId]);
				} else if (request.loading) {
					request.queue.push(resolve);
				} else {
					request.queue = [resolve];
					request.loading = true;

					sendRequest(programId, audioFormat).then(function (pgm) {
						waitForEnd(pgm);
					}).catch(reject);
				}
			}

			function emitProgress(progress, programId) {
				if (emitProgress.progress !== progress) {
					emitProgress.progress = progress;
					onprogress && onprogress('load', progress, programId);
				}
			}
			
			function waitForEnd(pgm) {
				_requests[pgm].loading = false;
				var pending = false;
				for (var key in _requests) {
					if (_requests.hasOwnProperty(key)) {
						if (_requests[key].loading) {
							pending = true;
						}
					}
				}
				if (!pending) {
					emitProgress(1.0);
					_adaptors[tech].connect(args).then(function () {
						programs.forEach(function (programId) {
							var request = _requests[programId];
							var cb;
							while(cb = request.queue.pop()) {
								cb();
							}
						});
					}).catch(reject);
				}
			}
		});

		function sendRequest(programId, audioFormat, onprogress) {
			return new Promise(function (resolve, reject) {
				var soundfontPath = MIDI.PATH + programId + '-' + audioFormat + '.js';
				if (MIDI.USE_XHR) {
					galactic.request({
						url: soundfontPath,
						format: 'text',
						onerror: reject,
						onprogress: onprogress,
						onsuccess: function (event, responseText) {
							var script = document.createElement('script');
							script.language = 'javascript';
							script.type = 'text/javascript';
							script.text = responseText;
							document.body.appendChild(script);
							resolve(programId);
						}
					});
				} else {
					dom.loadScript.add({
						url: soundfontPath,
						verify: 'MIDI.Soundfont["' + programId + '"]',
						onerror: reject,
						onsuccess: resolve
					});
				}
			});
		}
	};


	/* resetAdaptor */
	function resetAdaptor() {

		/* currentTime */
		(function () {
			var _now = performance.now();
			Object.defineProperties(MIDI, {
				'currentTime': {
					configurable: true,
					get: function () {
						return performance.now() - _now;
					}
				}
			});
		})();


		/* set */
		MIDI.set = function (property, value, delay) {
			if (delay) {
				return setTimeout(function () {
					MIDI[property] = value;
				}, delay * 1000);
			} else {
				MIDI[property] = value;
			}
		};


		/** programChange **/
		MIDI.messageHandler = {};
		MIDI.programChange = function (channelId, programId, delay) {
			var program = MIDI.getProgram(programId);
			if (program && Number.isFinite(programId = program.id)) {
				var channel = MIDI.channels[channelId];
				if (channel && channel.program !== programId) {
					if (delay) {
						setTimeout(function () { //- is there a better option?
							channel.program = programId;
						}, delay);
					} else {
						channel.program = programId;
					}
					
					var wrapper = MIDI.messageHandler.program || programHandler;
					if (wrapper) {
						wrapper(channelId, programId, delay);
					}
				}
			}
		};
	
		function programHandler(channelId, program, delay) {
			if (MIDI.adaptor.id) {
				if (MIDI.player.playing) {
					MIDI.loadProgram(program).then(MIDI.player.start);
				} else {
					MIDI.loadProgram(program);
				}
			}
		}


		/* globals */
		Object.defineProperties(MIDI, {
			'context': set(null),
			'detune': set('detune', 0),
			'fx': set('fx', null),
			'mute': set('mute', false),
			'volume': set('volume', 1.0)
		});
		
		function set(_type, _value) {
			return {
				configurable: true,
				get: function () {
					return _value;
				},
				set: function (value) {
					_value = value;
					handleError(_type);
				}
			};
		}


		/* functions */
		MIDI.send = handleErrorWrapper('send');
		MIDI.noteOn = handleErrorWrapper('noteOn');
		MIDI.noteOff = handleErrorWrapper('noteOff');
		MIDI.cancelNotes = handleErrorWrapper('cancelNotes');
		
		MIDI.setController = handleErrorWrapper('setController'); //- depreciate
		MIDI.setEffects = handleErrorWrapper('setEffects'); //- depreciate
		MIDI.setPitchBend = handleErrorWrapper('setPitchBend'); //- depreciate
		MIDI.setProperty = handleErrorWrapper('setProperty');
		MIDI.setVolume = handleErrorWrapper('setVolume'); //- depreciate
		
		MIDI.iOSUnlock = handleErrorWrapper('iOSUnlock');
		
		/* helpers */
		function handleError(_type) {
			MIDI.DEBUG && console.warn('The ' + _adaptor.id + ' adaptor does not support "' + _type + '".');
		}

		function handleErrorWrapper(_type) {
			return function () {
				handleError(_type);
			};
		}
	}
	
	resetAdaptor();
	
})(MIDI);