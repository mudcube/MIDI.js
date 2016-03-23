/*
	----------------------------------------------------------
	MIDI/player : 2015-10-18 : https://mudcu.be
	----------------------------------------------------------
	https://github.com/mudcube/MIDI.js
	----------------------------------------------------------
*/

if (typeof MIDI === 'undefined') MIDI = {};

MIDI.player = new function () { 'use strict';

	var player = this;
	
	galactic.EventEmitter(player); // player.on(...)

	/* Scheduling */
	var _schedulePerRequest = 20;
	var _scheduleMax = 100;

	/* State */
	var _midiState = {};

	/* Queue */
	var _midiQueue = [];

	/* Events */
	var _midiEvents = {};
	var _midiEventIndex;
	var _midiEventTime;
	
	/* File */
	var _midiFile;


	/** properties **/
	(function () {
		var _currentTime = 0;
		var _playing = false;
		var _now = 0;

		Object.defineProperties(player, {
			'bpm': finiteValue(null, true), // beats-per-minute override
			'warp': finiteValue(1.0, true), // warp beats-per-minute
			'transpose': finiteValue(0.0, true), // transpose notes up or down
			'currentTime': { // current time within current song
				get: function () {
					if (player.playing) {
						return _currentTime + (performance.now() - _now);
					} else {
						return _currentTime;
					}
				},
				set: function (time) {
					if (Number.isFinite(time)) {
						setTime(time);
					}
				}
			},
			'duration': finiteValue(0, false), // duration of current song
			'playing': { // current time within current song
				get: function () {
					return _playing;
				},
				set: function (playing) {
					setTime(player.currentTime);
					_playing = playing;
				}
			}
		});
	
		function finiteValue(_value, refresh) {
			return {
				get: function () {
					return _value;
				},
				set: function (value) {
					if (Number.isFinite(value)) {
						_value = value;
						refresh && refreshAudio();
					}
				}
			};

			function refreshAudio() {
				if (_midiFile) {
					player.stop();
					readMidiFile();
					requestEvents(0, true);
				}		
			};
		};
			
		function setTime(time) {
			_now = performance.now();
			_currentTime = clamp(0, player.duration, time);
		};
	})();


	/** playback **/
	player.start = function (startAt) {
		cancelEvents();
		player.currentTime = startAt;
		requestEvents(player.currentTime, true);
	};

	player.stop = function () {
		cancelEvents();
		player.currentTime = 0;
	};

	player.pause = function () {
		cancelEvents();
	};


	/** animation **/
	player.setAnimation = function (callback) { //- player.on('tick', ...)
		var currentTime = 0;
		var nowSys = 0;
		var nowMidi = 0;
		//
		player.clearAnimation();
		
		requestAnimationFrame(function frame() {
			player.frameId = requestAnimationFrame(frame);
			
			if (player.duration) {
				if (player.playing) {
					currentTime = (nowMidi === player.currentTime) ? nowSys - Date.now() : 0;
					
					if (player.currentTime === 0) {
						currentTime = 0;
					} else {
						currentTime = player.currentTime - currentTime;
					}
					if (nowMidi !== player.currentTime) {
						nowSys = Date.now();
						nowMidi = player.currentTime;
					}
				} else {
					currentTime = player.currentTime;
				}
				
				var duration = player.duration;
				var percent = currentTime / duration;
				var total = currentTime / 1000;
				var minutes = total / 60;
				var seconds = total - (minutes * 60);
				var t1 = minutes * 60 + seconds;
				var t2 = (duration / 1000);
				if (t2 - t1 < -1.0) {
					return;
				} else {
					var progress = Math.min(1.0, t1 / t2);
					if (progress !== callback.progress) {
						callback.progress = progress;
						callback({
							progress: progress,
							currentTime: t1,
							duration: t2
						});
					}
				}
			}
		});
	};

	player.clearAnimation = function () { //- player.off('tick', ...)
		player.frameId && cancelAnimationFrame(player.frameId);
	};


	/* Request Events */
	function requestEvents(startAt, seek) {
		if (startAt > player.duration) { // song finished
			return;
		}

		/* find current position */
		if (seek) { // seek to point in time
			if (player.playing) {
				cancelEvents();
			} else {
				player.playing = true;
			}
			
			var packet = seekPacket(startAt);
			var packetIndex = packet.idx;
			var packetTime = _midiEventTime = packet.time;
		} else { // streaming to queue
			var packetIndex = _midiEventIndex;
			var packetTime = _midiEventTime;
		}

		/* queue out events */
		var future = startAt - player.currentTime; // in ms
		var requests = 0;
		var length = _midiEvents.length;
		while(packetIndex < length && requests <= _schedulePerRequest) {
			var packet = _midiEvents[packetIndex];
			
			_midiEventIndex = ++packetIndex;
			_midiEventTime += packet[1];
			
			startAt = _midiEventTime - packetTime;
			
			var event = packet[0].event;
			var type = event.type;
			var subtype = event.subtype;
			
			if (handleEvent[subtype]) {
				switch(type) {
					case 'channel':
						handleChannelEvent();
						break;
					case 'meta':
						handleMetaEvent();
						break;
				}
			}
		}
		
		/* meta event */
		function handleMetaEvent() {
			switch(subtype) {
				case 'setTempo':
// 					console.log(event); //- handle tempo changes
					break;
			}
		};
		
		/* channel event */
		function handleChannelEvent() {
			var channelId = event.channel;
			var channel = MIDI.channels[channelId];
			var delay = Math.max(0, (startAt + future) / 1000);

			switch(subtype) {
				case 'controller':
// 					channel.set('controller', event.controllerType, event.value, delay);
					MIDI.setController(channelId, event.controllerType, event.value, delay); //- depreciate
					break;

				case 'programChange':
					var program = event.programNumber;
					if (programIsUsed(program)) {
// 						channel.set('program', program, delay);
						MIDI.programChange(channelId, program, delay); //- depreciate
					}
					break;

				case 'pitchBend':
					var pitch = event.value;
// 					channel.set('detune', pitch, delay);
					MIDI.setPitchBend(channelId, pitch, delay); //- depreciate
					break;

				case 'noteOn':
					var noteNumber = transpose(event.noteNumber);
					_midiQueue.push({
						promise: channel.noteOn(noteNumber, event.velocity / 127, delay),
						timeout: wait(event, noteNumber, _midiEventTime, delay)
					});
					requests++;
					break;

				case 'noteOff':
					var noteNumber = transpose(event.noteNumber);
					_midiQueue.push({
						promise: channel.noteOff(noteNumber, delay),
						timeout: wait(event, noteNumber, _midiEventTime, delay)
					});
					requests++;
					break;

				default:
					break;
			}
		};
	
		/* event tracking */
		function wait(event, noteNumber, currentTime, delay) {
			return setTimeout(function () {
				var packet = galactic.util.copy(event);
				packet.noteNumber = noteNumber;
				
				player.emit('event', packet);
				
				_midiQueue.shift();
				
				var packetId = packet.channel + 'x' + packet.noteNumber;
				switch(packet.subtype) {
					case 'noteOn':
						_midiState[packetId] = packet;
						break;
					case 'noteOff':
						delete _midiState[packetId];
						break;
				}
				
				if (_midiQueue.length <= _scheduleMax) {
					requestEvents(_midiEventTime);
				}
			}, delay * 1000);
		};

		/* change program */
		function programIsUsed(programNumber) {
			var program = MIDI.getProgram(programNumber);
			return program && player.instruments[program.nameId];
		};

		/* seek to point in time */
		function seekPacket(seekTime) {
			var time = 0;
			var length = _midiEvents.length;
			for (var idx = 0; idx < length; idx++) {
				var event = _midiEvents[idx];
				var eventDuration = event[1];
				if (time + eventDuration < seekTime) {
					time += eventDuration;
				} else {
					break;
				}
			}
			return {
				idx: idx,
				time: time
			};
		};

		/* transpose notes */
		function transpose(noteNumber) {
			return clamp(0, 127, noteNumber + player.transpose);
		};
	};


	/* Cancel Events */
	function cancelEvents() {
		if (player.playing) {
			player.playing = false;
			
			while(_midiQueue.length) {
				var packet = _midiQueue.pop();
				if (packet) {
					packet.promise && packet.promise.cancel();
					clearTimeout(packet.timeout);
				}
			}
			
			for (var sid in _midiState) {
				var event = _midiState[sid];
				player.emit('event', {
					channel: event.channel,
					noteNumber: event.noteNumber,
					status: event.status - 16,
					subtype: 'noteOff',
					type: 'channel'
				});
			}
		}
	};


	/* math */
	function clamp(min, max, value) {
		return (value < min) ? min : ((value > max) ? max : value);
	};


	/* read data */
	function readMidiFile() {
		// PER: handle the case where the caller already has the midi events. Don't need to load anything here.
		if (_midiFile)
			_midiEvents = Replayer(MidiFile(_midiFile), player.bpm);
		player.duration = getLength();

		function getLength() {
			var length = _midiEvents.length;
			var totalTime = 0.0;
			for (var n = 0; n < length; n++) {
				totalTime += _midiEvents[n][1];
			}
			return totalTime;
		};
	};

	function readMetadata() {
		player.instruments = readInstruments();
// 		player.notes = readNotes();

		function readNotes() { //- use me; download *only* specific notes
			var notes = {};
			for (var i = 0; i < _midiEvents.length; i ++) {
				var packet = _midiEvents[i];
				var event = packet[0].event;
				if (Number.isFinite(event.noteNumber)) {
					notes[event.noteNumber] = true;
				}
			}
			return Object.keys(notes);
		};

		function readInstruments() {
			var instruments = {};
			var programChange = {};
			for (var n = 0; n < _midiEvents.length; n ++) {
				var event = _midiEvents[n][0].event;
				if (event.type === 'channel') {
					var channel = event.channel;
					switch(event.subtype) {
						case 'programChange':
							programChange[channel] = event.programNumber;
							break;
						case 'noteOn':
							var programId = programChange[channel];
							if (Number.isFinite(programId)) {
								if (handleEvent.programChange) {
									var program = MIDI.getProgram(programId);
								} else {
									var channel = MIDI.channels[channel];
									var program = MIDI.getProgram(channel.program);
								}
								instruments[program.nameId] = true;
							}
							break;
					}
				}
			}
			return instruments;
		};
	};


	/* Custom event handlers */
	var handleEvent = {
		controller: true,
		noteOff: true,
		noteOn: true,
		pitchBend: true,
		setTempo: true,
		programChange: true
	};

	player.handleEvent = function (type, truthy) {
		handleEvent[type] = truthy;
	};


	/** Load **/
	player.load = function (args) {
		return new Promise(function (resolve, reject) {
			if (typeof args === 'string') args = {src: args};
			var src = args.src;
			var onprogress = args.onprogress;
			
			player.stop();

			// PER: Handle the case where the caller already has the events in an array
			if (args.events) {
				_midiEvents = args.events;
				_midiFile = undefined;
				load();
			} else if (src.indexOf('base64,') !== -1) {
				_midiFile = atob(src.split(',')[1]);
				load();
			} else {
				galactic.request({
					url: src,
					mimeType: 'text/plain; charset=x-user-defined',
					onerror: function () {
						reject && reject('Unable to load MIDI file: ' + src);
					},
					onsuccess: function (event, responseText) {
						_midiFile = toBase64(responseText);
						load();
					}
				});
			}

			function load() {
				try {
					readMidiFile();
					readMetadata();

					MIDI.setup({
						instruments: player.instruments,
						onprogress: onprogress
					}).then(function (res) {
						resolve(res);
					}).catch(function (err) {
						reject(err);
					});
				} catch(event) {
					reject && reject(event);
				}
			};

			function toBase64(data) {
				var res = [];
				var fromCharCode = String.fromCharCode;
				for (var i = 0, length = data.length; i < length; i++) {
					res[i] = fromCharCode(data.charCodeAt(i) & 255);
				}
				return res.join('');
			};
		});
	};
};