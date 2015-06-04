/*
	----------------------------------------------------------
	Web Audio API - OGG | MPEG Soundbank
	----------------------------------------------------------
	http://webaudio.github.io/web-audio-api/
	----------------------------------------------------------
*/

(function(MIDI) { 'use strict';

	window.AudioContext && (function() {

		var audioContext = null; // new AudioContext();
		var useStreamingBuffer = false; // !!audioContext.createMediaElementSource;
		var midi = MIDI.WebAudio = {api: 'webaudio'};
		var ctx; // audio context
		var sources = {};
		var effects = {};
		var masterVolume = 127;
		var audioBuffers = {};
		///
		midi.audioBuffers = audioBuffers;
		midi.messageHandler = {};
		///
		midi.send = function(data, delay) {
		
		};

		midi.setController = function(channelId, type, value, delay) {
		
		};

		midi.setVolume = function(channelId, volume, delay) {
			if (delay) {
				setTimeout(function() {
					masterVolume = volume;
				}, delay * 1000);
			} else {
				masterVolume = volume;
			}
		};

		midi.pitchBend = function(channelId, bend, delay) {
			var channel = MIDI.channels[channelId];
			if (channel) {
				if (delay) {
					setTimeout(function() {
						channel.pitchBend = bend;
					}, delay);
				} else {
					channel.pitchBend = bend;
				}
			}
		};

		midi.noteOn = function(channelId, noteId, velocity, delay) {
			delay = delay || 0;

			/// check whether the note exists
			var channel = MIDI.channels[channelId];
			var instrument = channel.program;
			var bufferId = instrument + 'x' + noteId;
			var buffer = audioBuffers[bufferId];
			if (buffer) {
				/// convert relative delay to absolute delay
				if (delay < ctx.currentTime) {
					delay += ctx.currentTime;
				}
		
				/// create audio buffer
				if (useStreamingBuffer) {
					var source = ctx.createMediaElementSource(buffer);
				} else { // XMLHTTP buffer
					var source = ctx.createBufferSource();
					source.buffer = buffer;
				}

				/// add effects to buffer
				if (effects) {
					var chain = source;
					for (var key in effects) {
						chain.connect(effects[key].input);
						chain = effects[key];
					}
				}

				/// add gain + pitchShift
				var gain = (velocity / 127) * (masterVolume / 127) * 2 - 1;
				source.connect(ctx.destination);
				source.playbackRate.value = 1; // pitch shift 
				source.gainNode = ctx.createGain(); // gain
				source.gainNode.connect(ctx.destination);
				source.gainNode.gain.value = Math.min(1.0, Math.max(-1.0, gain));
				source.connect(source.gainNode);
				///
				if (useStreamingBuffer) {
					if (delay) {
						return setTimeout(function() {
							buffer.currentTime = 0;
							buffer.play()
						}, delay * 1000);
					} else {
						buffer.currentTime = 0;
						buffer.play()
					}
				} else {
					source.start(delay || 0);
				}
				///
				sources[channelId + 'x' + noteId] = source;
				///
				return source;
			} else {
				MIDI.handleError('no buffer', arguments);
			}
		};

		midi.noteOff = function(channelId, noteId, delay) {
			delay = delay || 0;

			/// check whether the note exists
			var channel = MIDI.channels[channelId];
			var instrument = channel.program;
			var bufferId = instrument + 'x' + noteId;
			var buffer = audioBuffers[bufferId];
			if (buffer) {
				if (delay < ctx.currentTime) {
					delay += ctx.currentTime;
				}
				///
				var source = sources[channelId + 'x' + noteId];
				if (source) {
					if (source.gainNode) {
						// @Miranet: 'the values of 0.2 and 0.3 could of course be used as 
						// a 'release' parameter for ADSR like time settings.'
						// add { 'metadata': { release: 0.3 } } to soundfont files
						var gain = source.gainNode.gain;
						gain.linearRampToValueAtTime(gain.value, delay);
						gain.linearRampToValueAtTime(-1.0, delay + 0.3);
					}
					///
					if (useStreamingBuffer) {
						if (delay) {
							setTimeout(function() {
								buffer.pause();
							}, delay * 1000);
						} else {
							buffer.pause();
						}
					} else {
						if (source.noteOff) {
							source.noteOff(delay + 0.5);
						} else {
							source.stop(delay + 0.5);
						}
					}
					///
					delete sources[channelId + 'x' + noteId];
					///
					return source;
				}
			}
		};

		midi.chordOn = function(channel, chord, velocity, delay) {
			var res = {};
			for (var n = 0, note, len = chord.length; n < len; n++) {
				res[note = chord[n]] = midi.noteOn(channel, note, velocity, delay);
			}
			return res;
		};

		midi.chordOff = function(channel, chord, delay) {
			var res = {};
			for (var n = 0, note, len = chord.length; n < len; n++) {
				res[note = chord[n]] = midi.noteOff(channel, note, delay);
			}
			return res;
		};

		midi.stopAllNotes = function() {
			for (var sid in sources) {
				var delay = 0;
				if (delay < ctx.currentTime) {
					delay += ctx.currentTime;
				}
				var source = sources[sid];
				source.gain.linearRampToValueAtTime(1, delay);
				source.gain.linearRampToValueAtTime(0, delay + 0.3);
				if (source.noteOff) { // old api
					source.noteOff(delay + 0.3);
				} else { // new api
					source.stop(delay + 0.3);
				}
				delete sources[sid];
			}
		};

		midi.setEffects = function(list) {
			if (ctx.tunajs) {
				for (var n = 0; n < list.length; n ++) {
					var data = list[n];
					var effect = new ctx.tunajs[data.type](data);
					effect.connect(ctx.destination);
					effects[data.type] = effect;
				}
			} else {
				MIDI.handleError('effects not installed.', arguments);
				return;
			}
		};

		midi.connect = function(opts) {
			MIDI.setDefaultPlugin(midi);
			midi.setContext(ctx || createAudioContext(), opts.onsuccess);
		};
	
		midi.getContext = function() {
			return ctx;
		};
	
		midi.setContext = function(newCtx, onsuccess, onprogress, onerror) {
			ctx = newCtx;

			/// tuna.js effects module - https://github.com/Dinahmoe/tuna
			if (typeof Tuna !== 'undefined') {
				if (!(ctx.tunajs instanceof Tuna)) {
					ctx.tunajs = new Tuna(ctx);
				}
			}
		
			/// loading audio files
			var urls = [];
			var notes = MIDI.keyToNote;
			for (var key in notes) {
				urls.push(key);
			}
			///
			function waitForEnd(instrument) {
				for (var key in bufferPending) { // has pending items
					if (bufferPending[key]) {
						return;
					}
				}
				if (onsuccess) { // run onsuccess once
					onsuccess();
					onsuccess = null;
				}
			};

			function requestAudio(soundfont, programId, index, key) {
				var url = soundfont[key];
				if (url) {
					bufferPending[programId] ++;
					loadAudio(url, function(buffer) {
						buffer.id = key;
						var noteId = MIDI.keyToNote[key];
						audioBuffers[programId + 'x' + noteId] = buffer;
						///
						if (--bufferPending[programId] === 0) {
							var percent = index / 87;
							soundfont.isLoaded = true;
							MIDI.DEBUG && console.log('loaded: ', instrument);
							waitForEnd(instrument);
						}
					}, function() {
						MIDI.handleError('audio could not load', arguments);
					});
				}
			};
			///
			var bufferPending = {};
			var soundfonts = MIDI.Soundfont;
			for (var instrument in soundfonts) {
				var soundfont = soundfonts[instrument];
				if (soundfont.isLoaded) {
					continue;
				} else {
					var spec = MIDI.GM.byName[instrument];
					if (spec) {
						var programId = spec.program;
						///
						bufferPending[programId] = 0;
						///
						for (var index = 0; index < urls.length; index++) {
							var key = urls[index];
							requestAudio(soundfont, programId, index, key);
						}
					}
				}
			}
			///
			setTimeout(waitForEnd, 1);
		};


		/* Load audio file: streaming | base64 | arraybuffer
		---------------------------------------------------------------------- */
		function loadAudio(url, onsuccess, onerror) {
			if (useStreamingBuffer) {
				var audio = new Audio();
				audio.src = url;
				audio.controls = false;
				audio.autoplay = false;
				audio.preload = false;
				audio.addEventListener('canplay', function() {
					onsuccess && onsuccess(audio);
				});
				audio.addEventListener('error', function(err) {
					onerror && onerror(err);
				});
				document.body.appendChild(audio);
			} else if (url.indexOf('data:audio') === 0) { // Base64 string
				var base64 = url.split(',')[1];
				var buffer = Base64Binary.decodeArrayBuffer(base64);
				ctx.decodeAudioData(buffer, onsuccess, onerror);
			} else { // XMLHTTP buffer
				var request = new XMLHttpRequest();
				request.open('GET', url, true);
				request.responseType = 'arraybuffer';
				request.onload = function() {
					ctx.decodeAudioData(request.response, onsuccess, onerror);
				};
				request.send();
			}
		};
		
		function createAudioContext() {
			return new (window.AudioContext || window.webkitAudioContext)();
		};
	})();
})(MIDI);