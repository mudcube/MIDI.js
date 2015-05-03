/*
	----------------------------------------------------------
	MIDI.Player : 0.3.1 : 2015-05-03 : https://mudcu.be
	----------------------------------------------------------
	https://github.com/mudcube/MIDI.js
	----------------------------------------------------------
*/

if (typeof MIDI === 'undefined') MIDI = {};
if (typeof MIDI.player === 'undefined') MIDI.player = {};

(function() { 'use strict';

MIDI.Player = MIDI.player; //- depreciate me
///
var midi = MIDI.player;
midi.currentTime = 0; // current time within current song
midi.duration = 0; // duration of current song
midi.isPlaying = false;
///
midi.BPM = undefined; // beats-per-minute override
midi.timeWarp = 1.0; // warp beats-per-minute
midi.transpose = 0; // transpose notes up or down


/* Playback
---------------------------------------------------------- */
midi.play =
midi.start = function(onsuccess) {
    if (midi.currentTime < -1) {
    	midi.currentTime = -1;
    }
    startAudio(midi.currentTime, null, onsuccess);
};

midi.stop = function() {
	stopAudio();
	midi.currentTime = 0;
};

midi.pause = function() {
	stopAudio();
};

midi.toggle = function() {
	if (midi.isPlaying) {
		midi.pause();
	} else {
		midi.play();
	}
};


/* Listeners
---------------------------------------------------------- */
midi.addListener = function(onsuccess) {
	onMidiEvent = onsuccess;
};

midi.removeListener = function() {
	onMidiEvent = undefined;
};

midi.clearAnimation = function() {
	midi.frameId && cancelAnimationFrame(midi.frameId);
};

midi.setAnimation = function(callback) {
	var currentTime = 0;
	var nowSys = 0;
	var nowMidi = 0;
	//
	midi.clearAnimation();
	///
	function frame() {
		midi.frameId = requestAnimationFrame(frame);
		///
		if (midi.duration === 0) {
			return;
		}
		if (midi.isPlaying) {
			currentTime = (nowMidi === midi.currentTime) ? nowSys - Date.now() : 0;
			if (midi.currentTime === 0) {
				currentTime = 0;
			} else {
				currentTime = midi.currentTime - currentTime;
			}
			if (nowMidi !== midi.currentTime) {
				nowSys = Date.now();
				nowMidi = midi.currentTime;
			}
		} else {
			currentTime = midi.currentTime;
		}
		///
		var duration = midi.duration;
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
midi.loadMidiFile = function(onsuccess, onprogress, onerror) {
	try {
		midi.replayer = new Replayer(MidiFile(midi.currentData), midi.timeWarp, null, midi.BPM);
		midi.data = midi.replayer.getData();
		midi.duration = getLength();
		///
		MIDI.loadPlugin({
// 			instruments: midi.getFileInstruments(),
			onsuccess: onsuccess,
			onprogress: onprogress,
			onerror: onerror
		});
	} catch(event) {
		onerror && onerror(event);
	}
};

midi.loadFile = function(opts, onsuccess, onprogress, onerror) {
	if (typeof opts === 'string') opts = {src: opts};
	var src = opts.src;
	var onsuccess = onsuccess || opts.onsuccess;
	var onerror = onerror || opts.onerror;
	var onprogress = onprogress || opts.onprogress;
	///
	midi.stop();
	if (src.indexOf('base64,') !== -1) {
		var data = window.atob(src.split(',')[1]);
		midi.currentData = data;
		midi.loadMidiFile(onsuccess, onprogress, onerror);
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
					midi.currentData = data;
					midi.loadMidiFile(onsuccess, onprogress, onerror);
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
midi.getFileInstruments = function() {
	var instruments = {};
	var programs = {};
	var data = midi.data;
	for (var n = 0; n < data.length; n ++) {
		var event = data[n][0].event;
		if (event.type === 'channel') {
			var channel = event.channel;
			switch(event.subtype) {
				case 'controller':
	//				console.debug(event.channel, MIDI.defineControl[event.controllerType], event.value);
					break;
				case 'programChange':
					programs[channel] = event.programNumber;
					break;
				case 'noteOn':
					var program = programs[channel];
					var gm = MIDI.GM.byId[isFinite(program) ? program : channel];
					instruments[gm.id] = true;
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
midi.packets = {}; // get event for requested note

function scheduleTracking(event, note, currentTime, offset) {
	return setTimeout(function() {
		var packet = {
			channel: event.channel,
			status: event.status,
			subtype: event.subtype,
			velocity: event.velocity,
			///
			note: note,
			currentTime: currentTime,
			duration: midi.duration
		};
		///
		if (event.status === 144) { //- handle multiple channels
			midi.packets[note] = packet;
		} else {
			delete midi.packets[note];
		}
		///
		onMidiEvent && onMidiEvent(packet);
		///
		midi.currentTime = currentTime;
		///
		eventQueue.shift();
		///
		if (eventQueue.length < 1000) {
			startAudio(OFFSET, true);
		} else if (midi.currentTime === OFFSET && OFFSET < midi.duration) { // grab next sequence
			startAudio(OFFSET, true);
		}
	}, currentTime - offset);
};

function getContext() {
	if (MIDI.api === 'webaudio') {
		return MIDI.WebAudio.getContext();
	} else {
		midi.ctx = {currentTime: 0};
	}
	return midi.ctx;
};

function getLength() {
	var data =  midi.data;
	var length = data.length;
	var totalTime = 0.5;
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

var IDX;
var OFFSET;
function startAudio(currentTime, streaming, onsuccess) {
	if (!streaming) {
		midi.isPlaying && stopAudio();
		midi.isPlaying = true;
		midi.data = midi.replayer.getData();
		midi.duration = getLength();
	}
	///
	var offset = 0;
	var messages = 0;
	var packets = midi.data;
	var packetIdx;
	var length = packets.length;
	///
	var interval = eventQueue[0] && eventQueue[0].interval || 0;
	var foffset = currentTime - midi.currentTime;
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
		OFFSET = 0.5;
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
		if (event.type !== 'channel') {
			continue;
		}
		///
		var channelId = event.channel;
		var channel = MIDI.channels[channelId];
		var delay = ctx.currentTime + ((currentTime + foffset) / 1000);
		var queueTime = OFFSET - offset;
		switch(event.subtype) {
			case 'controller':
				MIDI.setController(channelId, event.controllerType, event.value, delay);
				break;
			case 'programChange':
				MIDI.programChange(channelId, event.programNumber, delay);
				break;
			case 'pitchBend':
				MIDI.pitchBend(channelId, event.value, delay);
				break;
			case 'noteOn':
				if (channel.mute) {
					break;
				}
				///
				var note = clamp(0, 127, event.noteNumber + midi.transpose);
				eventQueue.push({
					event: event,
					time: queueTime,
					source: MIDI.noteOn(channelId, note, event.velocity, delay),
					interval: scheduleTracking(event, note, OFFSET, offset - foffset)
				});
				messages++;
				break;
			case 'noteOff':
				if (channel.mute) {
					break;
				}
				///
				var note = clamp(0, 127, event.noteNumber + midi.transpose);
				eventQueue.push({
					event: event,
					time: queueTime,
					source: MIDI.noteOff(channelId, note, delay),
					interval: scheduleTracking(event, note, OFFSET, offset - foffset)
				});
				messages++;
				break;
			default:
				break;
		}
	}

	onsuccess && onsuccess(eventQueue);

};

function stopAudio() {
	if (midi.isPlaying) {
		midi.isPlaying = false;
		///
		var ctx = getContext();
		midi.currentTime += (ctx.currentTime - startTime) * 1000;
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
		for (var key in midi.packets) {
			if (onMidiEvent) {
				var packet = midi.packets[key]
				if (packet.status === 144) {
					onMidiEvent(packet);
				}
			}
			///
			delete midi.packets[key];
		}
	}
};

function clamp(min, max, value) {
	return (value < min) ? min : ((value > max) ? max : value);
};

})();