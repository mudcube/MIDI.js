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
midi.currentTime = 0;
midi.duration = 0; 
midi.restart = 0; 
midi.playing = false;
midi.timeWarp = 1;
midi.startDelay = 0;
midi.BPM = 120;


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
	midi.restart = 0;
	midi.currentTime = 0;
};

midi.pause = function() {
	var tmp = midi.restart;
	stopAudio();
	midi.restart = tmp;
};

midi.toggle = function() {
	if (midi.playing) {
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
	var tOurTime = 0;
	var tTheirTime = 0;
	//
	midi.clearAnimation();
	///
	function frame() {
		midi.frameId = requestAnimationFrame(frame);
		///
		if (midi.duration === 0) {
			return;
		}
		if (midi.playing) {
			currentTime = (tTheirTime === midi.currentTime) ? tOurTime - Date.now() : 0;
			if (midi.currentTime === 0) {
				currentTime = 0;
			} else {
				currentTime = midi.currentTime - currentTime;
			}
			if (tTheirTime !== midi.currentTime) {
				tOurTime = Date.now();
				tTheirTime = midi.currentTime;
			}
		} else { // paused
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
		///
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

// helpers

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

midi.getFileInstruments = function() {
	var instruments = {};
	var programs = {};
	for (var n = 0; n < midi.data.length; n ++) {
		var event = midi.data[n][0].event;
		if (event.type !== 'channel') {
			continue;
		}
		var channel = event.channel;
		switch(event.subtype) {
			case 'controller':
//				console.log(event.channel, MIDI.defineControl[event.controllerType], event.value);
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
	var ret = [];
	for (var key in instruments) {
		ret.push(key);
	}
	return ret;
};

// Playing the audio

var eventQueue = []; // hold events to be triggered
var queuedTime; // 
var startTime = 0; // to measure time elapse
var onMidiEvent = undefined; // listener

midi.packets = {}; // get event for requested note

function scheduleTracking(event, note, currentTime, offset, message, velocity, time) {
	return setTimeout(function() {
		var packet = {
			name: event.subtype,
			message: message,
			channel: event.channel,
			///
			note: note,
			now: currentTime,
			end: midi.duration,
			velocity: velocity
		};
		///
		if (message === 144) { //- handle multiple channels
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
			startAudio(queuedTime, true);
		} else if (midi.currentTime === queuedTime && queuedTime < midi.duration) { // grab next sequence
			startAudio(queuedTime, true);
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

function startAudio(currentTime, fromCache, onsuccess) {
	if (!midi.replayer) {
		return;
	}
	if (!fromCache) {
		if (typeof currentTime === 'undefined') {
			currentTime = midi.restart;
		}
		///
		midi.playing && stopAudio();
		midi.playing = true;
		midi.data = midi.replayer.getData();
		midi.duration = getLength();
	}
	///
	var note;
	var offset = 0;
	var messages = 0;
	var data = midi.data;
	var ctx = getContext();
	var length = data.length;
	//
	queuedTime = 0.5;
	///
	var interval = eventQueue[0] && eventQueue[0].interval || 0;
	var foffset = currentTime - midi.currentTime;
	///
	if (MIDI.api !== 'webaudio') { // set currentTime on ctx
		var now = getNow();
		NOW = NOW || now;
		ctx.currentTime = (now - NOW) / 1000;
	}
	///
	startTime = ctx.currentTime;
	///
	for (var n = 0; n < length && messages < 100; n++) {
		var obj = data[n];
		if ((queuedTime += obj[1]) <= currentTime) {
			offset = queuedTime;
			continue;
		}
		///
		currentTime = queuedTime - offset;
		///
		var event = obj[0].event;
		if (event.type !== 'channel') {
			continue;
		}
		///
		var channelId = event.channel;
		var channel = MIDI.channels[channelId];
		var delay = ctx.currentTime + ((currentTime + foffset + midi.startDelay) / 1000);
		var queueTime = queuedTime - offset + midi.startDelay;
		switch (event.subtype) {
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
				if (channel.mute) break;
				note = event.noteNumber - (midi.MIDIOffset || 0);
				eventQueue.push({
				    event: event,
				    time: queueTime,
				    source: MIDI.noteOn(channelId, event.noteNumber, event.velocity, delay),
				    interval: scheduleTracking(event, note, queuedTime + midi.startDelay, offset - foffset, 144, event.velocity)
				});
				messages++;
				break;
			case 'noteOff':
				if (channel.mute) break;
				note = event.noteNumber - (midi.MIDIOffset || 0);
				eventQueue.push({
				    event: event,
				    time: queueTime,
				    source: MIDI.noteOff(channelId, event.noteNumber, delay),
				    interval: scheduleTracking(event, note, queuedTime, offset - foffset, 128, 0)
				});
				break;
			default:
				break;
		}
	}
	///
	onsuccess && onsuccess(eventQueue);
};

function stopAudio() {
	var ctx = getContext();
	midi.playing = false;
	midi.restart += (ctx.currentTime - startTime) * 1000;
	// stop the audio, and intervals
	while (eventQueue.length) {
		var o = eventQueue.pop();
		window.clearInterval(o.interval);
		if (!o.source) continue; // is not webaudio
		if (typeof(o.source) === 'number') {
			window.clearTimeout(o.source);
		} else { // webaudio
			o.source.disconnect(0);
		}
	}
	// run callback to cancel any notes still playing
	for (var key in midi.packets) {
		if (onMidiEvent) {
			var packet = midi.packets[key]
			if (packet.message === 144) {
				onMidiEvent({
					channel: o.channel,
					note: o.note,
					now: o.now,
					end: o.end,
					message: 128,
					velocity: o.velocity
				});
			}
		}
		///
		delete midi.packets[key];
	}
};

})();