/*
	----------------------------------------------------------
	MIDI.player : 2015-05-09 : https://mudcu.be
	----------------------------------------------------------
	https://github.com/mudcube/MIDI.js
	----------------------------------------------------------
*/

if (typeof MIDI === 'undefined') MIDI = {};
if (typeof MIDI.player === 'undefined') MIDI.player = {};

(function() { 'use strict';

var player = MIDI.player;
player.currentTime = 0; // current time within current song
player.duration = 0; // duration of current song
player.isPlaying = false;
///
player.BPM = null; // beats-per-minute override
player.timeDelay = 0; // in seconds
player.timeWarp = 1.0; // warp beats-per-minute
player.transpose = 0; // transpose notes up or down


/* Playback
---------------------------------------------------------- */
player.play =
player.start = function(onsuccess) {
    if (player.currentTime < -1.0) {
    	player.currentTime = -1.0;
    }
    ///
    startAudio(player.currentTime, null, onsuccess);
};

player.stop = function() {
	stopAudio();
	player.currentTime = 0;
};

player.pause = function() {
	stopAudio();
};

player.toggle = function() {
	if (player.isPlaying) {
		player.pause();
	} else {
		player.play();
	}
};


/* Listeners
---------------------------------------------------------- */
player.addListener = function(onsuccess) {
	onMidiEvent = onsuccess;
};

player.removeListener = function() {
	onMidiEvent = undefined;
};

player.clearAnimation = function() {
	player.frameId && cancelAnimationFrame(player.frameId);
};

player.setAnimation = function(callback) {
	var currentTime = 0;
	var nowSys = 0;
	var nowMidi = 0;
	//
	player.clearAnimation();
	///
	function frame() {
		player.frameId = requestAnimationFrame(frame);
		///
		if (player.duration === 0) {
			return;
		}
		if (player.isPlaying) {
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
		///
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
	};
	///
	requestAnimationFrame(frame);
};


/* Load
---------------------------------------------------------- */
player.loadMidiFile = function(onsuccess, onprogress, onerror) {
	try {
		player.replayer = new Replayer(MidiFile(player.currentData), player.timeWarp, null, player.BPM);
		player.data = player.replayer.getData();
		player.duration = getLength();
		///
		MIDI.loadPlugin({
			instruments: player.getFileInstruments(),
			onsuccess: onsuccess,
			onprogress: onprogress,
			onerror: onerror
		});
	} catch(event) {
		onerror && onerror(event);
	}
};

player.loadFile = function(opts, onsuccess, onprogress, onerror) {
	if (typeof opts === 'string') opts = {src: opts};
	var src = opts.src;
	var onsuccess = onsuccess || opts.onsuccess;
	var onerror = onerror || opts.onerror;
	var onprogress = onprogress || opts.onprogress;
	///
	player.stop();
	///
	if (src.indexOf('base64,') !== -1) {
		var data = window.atob(src.split(',')[1]);
		player.currentData = data;
		player.loadMidiFile(onsuccess, onprogress, onerror);
	} else {
		var fetch = new XMLHttpRequest();
		fetch.open('GET', src);
		fetch.overrideMimeType('text/plain; charset=x-user-defined');
		fetch.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					var t = this.responseText || '';
					var ff = [];
					var mx = t.length;
					var scc = String.fromCharCode;
					for (var z = 0; z < mx; z++) {
						ff[z] = scc(t.charCodeAt(z) & 255);
					}
					///
					var data = ff.join('');
					player.currentData = data;
					player.loadMidiFile(onsuccess, onprogress, onerror);
				} else {
					onerror && onerror('Unable to load MIDI file.');
				}
			}
		};
		fetch.send();
	}
};


/* Determine instruments required
---------------------------------------------------------- */
player.getFileInstruments = function() {
	var GM = MIDI.GM;
	var instruments = {};
	var programChange = {};
	var data = player.data;
	for (var n = 0; n < data.length; n ++) {
		var event = data[n][0].event;
		if (event.type === 'channel') {
			var channel = event.channel;
			switch(event.subtype) {
				case 'controller':
	//				console.debug(event.channel, MIDI.defineControl[event.controllerType], event.value);
					break;
				case 'programChange':
					programChange[channel] = event.programNumber;
					break;
				case 'noteOn':
					var program = programChange[channel];
					if (program === +program) {
						if (handleEvent.programChange) {
							var gm = GM.byId[program];
							instruments[gm.id] = true;
						} else {
							var channel = MIDI.channels[channel];
							var gm = GM.byId[channel.program];
							instruments[gm.id] = true;
						}
					}
					break;
			}
		}
	}
	///
	var res = [];
	for (var key in instruments) {
		res.push(key);
	}
	return res;
};


/* Schedule tracking
---------------------------------------------------------- */
var eventQueue = []; // hold events to be triggered
var onMidiEvent = undefined; // listener
var startTime = 0; // to measure time elapse
///
player.packets = {}; // get event for requested note

function scheduleTracking(event, note, currentTime, offset) {
	return setTimeout(function() {
		if (event.status === 144) { //- handle multiple channels
			player.packets[note] = event;
		} else {
			delete player.packets[note];
		}
		///
		onMidiEvent && onMidiEvent(event);
		///
		player.currentTime = currentTime;
		///
		eventQueue.shift();
		///
		if (eventQueue.length < 1000) {
			startAudio(OFFSET, true);
		} else if (player.currentTime === OFFSET && OFFSET < player.duration) { // grab next sequence
			startAudio(OFFSET, true);
		}
	}, currentTime - offset);
};


/* Start Audio
---------------------------------------------------------- */
var IDX;
var OFFSET;
function startAudio(currentTime, streaming, onsuccess) {
	if (!streaming) {
		player.isPlaying && stopAudio();
		player.isPlaying = true;
		player.data = player.replayer.getData();
		player.duration = getLength();
	}
	///
	var offset = 0;
	var messages = 0;
	var packets = player.data;
	var packetIdx;
	var length = packets.length;
	///
	var interval = eventQueue[0] && eventQueue[0].interval || 0;
	var foffset = currentTime - player.currentTime;
	///
	var now;
	var ctx = getContext();
	if (MIDI.api !== 'webaudio') {
		now = getNow();
		NOW = NOW || now;
		ctx.currentTime = (now - NOW) / 1000;
	}
	///
	startTime = ctx.currentTime;
	///
	if (streaming) { // continue
		packetIdx = IDX;
		offset = OFFSET;
	} else { // seek
		OFFSET = 0.000001;
		for (packetIdx = 0; packetIdx < length; packetIdx++) {
			var packet = packets[packetIdx];
			if ((OFFSET += packet[1]) <= currentTime) {
				offset = OFFSET;
			} else {
				break;
			}
		}
	}

	while(packetIdx < length && messages < 100) {
		var packet = packets[packetIdx];
		///
		IDX = packetIdx ++;
		OFFSET += packet[1];
		currentTime = OFFSET - offset;
		///
		var event = packet[0].event;
		if (event.type === 'channel') {
			var subtype = event.subtype;
			if (!handleEvent[subtype]) {
				continue;
			}
			///
			var channelId = event.channel;
			var channel = MIDI.channels[channelId];
			var delay = ctx.currentTime + ((currentTime + foffset) / 1000);
			var delayMIDI = Math.max(0, delay + player.timeDelay);
			var queueTime = OFFSET - offset;
			///
			switch(subtype) {
				case 'controller':
					MIDI.setController(channelId, event.controllerType, event.value, delayMIDI);
					break;
				case 'programChange':
					MIDI.programChange(channelId, event.programNumber, delayMIDI);
					break;
				case 'pitchBend':
					MIDI.pitchBend(channelId, event.value, delayMIDI);
					break;
				case 'noteOn':
					if (!channel.mute) {
						var note = clamp(0, 127, event.noteNumber + player.transpose);
						eventQueue.push({
							event: event,
							time: queueTime,
							source: MIDI.noteOn(channelId, note, event.velocity, delayMIDI),
							interval: scheduleTracking(event, note, OFFSET, offset - foffset)
						});
						messages++;
					}
					break;
				case 'noteOff':
					if (!channel.mute) {
						var note = clamp(0, 127, event.noteNumber + player.transpose);
						eventQueue.push({
							event: event,
							time: queueTime,
							source: MIDI.noteOff(channelId, note, delayMIDI),
							interval: scheduleTracking(event, note, OFFSET, offset - foffset)
						});
						messages++;
					}
					break;
				default:
					break;
			}
		}
	}

	onsuccess && onsuccess(eventQueue);

};


/* Stop Audio
---------------------------------------------------------- */
function stopAudio() {
	if (player.isPlaying) {
		player.isPlaying = false;
		///
		var ctx = getContext();
		player.currentTime += (ctx.currentTime - startTime) * 1000;
		///
		while(eventQueue.length) { // stop the audio, and intervals
			var packet = eventQueue.pop();
			window.clearInterval(packet.interval);
			///
			if (packet.source) { // webAudio
				if (typeof packet.source === 'number') {
					window.clearTimeout(packet.source);
				} else { // webaudio
					packet.source.disconnect(0);
				}
			}
		}
		// run callback to cancel any notes still playing
		for (var key in player.packets) {
			if (onMidiEvent) {
				var packet = player.packets[key]
				if (packet.status === 144) {
					onMidiEvent(packet);
				}
			}
			///
			delete player.packets[key];
		}
	}
};


/* Helpers
---------------------------------------------------------- */
function clamp(min, max, value) {
	return (value < min) ? min : ((value > max) ? max : value);
};

function getContext() {
	if (MIDI.api === 'webaudio') {
		return MIDI.WebAudio.getContext();
	} else {
		player.ctx = {currentTime: 0};
	}
	return player.ctx;
};

function getLength() {
	var data =  player.data;
	var length = data.length;
	var totalTime = 0.000001;
	for (var n = 0; n < length; n++) {
		totalTime += data[n][1];
	}
	return totalTime;
};

var NOW;
function getNow() {
    if (window.performance && window.performance.now) {
        return window.performance.now();
    } else {
		return Date.now();
	}
};


/* Toggle event handling
---------------------------------------------------------- */
var handleEvent = {
    controller: true,
    noteOff: true,
    noteOn: true,
    pitchBend: true,
    programChange: true
};

player.handleEvent = function(type, truthy) {
	handleEvent[type] = truthy;
};

})();