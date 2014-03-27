/*
	--------------------------------------------
	MIDI.Player : 0.3.1 : 2014/02/10
	--------------------------------------------
	https://github.com/mudcube/MIDI.js
	--------------------------------------------
*/

if (typeof (MIDI) === "undefined") var MIDI = {};
if (typeof (MIDI.Player) === "undefined") MIDI.Player = {};

(function() { "use strict";

var midi = MIDI.Player;
midi.callback = undefined; // your custom callback goes here!
midi.currentTime = 0;
midi.endTime = 0; 
midi.restart = 0; 
midi.playing = false;
midi.timeWarp = 1;
midi.startDelay = 0;
midi.BPM = 120;
//
midi.start =
midi.resume = function (callback) {
    if (midi.currentTime < -1) midi.currentTime = -1;
    startAudio(midi.currentTime, null, callback);
};

midi.pause = function () {
	var tmp = midi.restart;
	stopAudio();
	midi.restart = tmp;
};

midi.stop = function () {
	stopAudio();
	midi.restart = 0;
	midi.currentTime = 0;
};

midi.addListener = function(callback) {
	onMidiEvent = callback;
};

midi.removeListener = function() {
	onMidiEvent = undefined;
};

midi.clearAnimation = function() {
	if (midi.interval)  {
		window.clearInterval(midi.interval);
	}
};

midi.setAnimation = function(config) {
	var callback = (typeof(config) === "function") ? config : config.callback;
	var interval = config.interval || 30;
	var currentTime = 0;
	var tOurTime = 0;
	var tTheirTime = 0;
	//
	midi.clearAnimation();
	midi.interval = setInterval(function () {
		if (midi.endTime === 0) return;
		if (midi.playing) {
			currentTime = (tTheirTime === midi.currentTime) ? tOurTime - (new Date).getTime() : 0;
			if (midi.currentTime === 0) {
				currentTime = 0;
			} else {
				currentTime = midi.currentTime - currentTime;
			}
			if (tTheirTime !== midi.currentTime) {
				tOurTime = (new Date).getTime();
				tTheirTime = midi.currentTime;
			}
		} else { // paused
			currentTime = midi.currentTime;
		}
		var endTime = midi.endTime;
		var percent = currentTime / endTime;
		var total = currentTime / 1000;
		var minutes = total / 60;
		var seconds = total - (minutes * 60);
		var t1 = minutes * 60 + seconds;
		var t2 = (endTime / 1000);
		if (t2 - t1 < -1) return;
		callback({
			now: t1,
			end: t2,
			events: noteRegistrar
		});
	}, interval);
};

// helpers

midi.loadMidiFile = function(onload, onprogress, onerror) { // reads midi into javascript array of events
    midi.replayer = new Replayer(MidiFile(midi.currentData), midi.timeWarp, null, midi.BPM);
    midi.data = midi.replayer.getData();
	midi.endTime = getLength();
	///
	MIDI.loadPlugin({
		instruments: midi.getFileInstruments(),
		callback: onload,
		onprogress: onprogress, 
		onerror: onerror
	});
};

midi.loadFile = function (file, onload, onprogress, onerror) {
	midi.stop();
	if (file.indexOf("base64,") !== -1) {
		var data = window.atob(file.split(",")[1]);
		midi.currentData = data;
		midi.loadMidiFile(onload, onprogress, onerror);
		return;
	}
	///
	var fetch = new XMLHttpRequest();
	fetch.open("GET", file);
	fetch.overrideMimeType("text/plain; charset=x-user-defined");
	fetch.onreadystatechange = function () {
		if (this.readyState === 4 && this.status === 200) {
			var t = this.responseText || "";
			var ff = [];
			var mx = t.length;
			var scc = String.fromCharCode;
			for (var z = 0; z < mx; z++) {
				ff[z] = scc(t.charCodeAt(z) & 255);
			}
			var data = ff.join("");
			midi.currentData = data;
			midi.loadMidiFile(onload, onprogress, onerror);
		}
	};
	fetch.send();
};

midi.getFileInstruments = function() {
	var instruments = {};
	var programs = {};
	for (var n = 0; n < midi.data.length; n ++) {
		var event = midi.data[n][0].event;
		if (event.type !== "channel") continue;
		var channel = event.channel;
		switch(event.subtype) {
			case "controller":
//				console.log(event.channel, MIDI.defineControl[event.controllerType], event.value);
				break;
			case "programChange":
				programs[channel] = event.programNumber;
				break;
			case "noteOn":
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
var noteRegistrar = {}; // get event for requested note
var onMidiEvent = undefined; // listener callback
var scheduleTracking = function (channel, note, currentTime, offset, message, velocity, time) {
	return setTimeout(function () {
		var data = {
			channel: channel,
			note: note,
			now: currentTime,
			end: midi.endTime,
			message: message,
			velocity: velocity
		};
		//
		if (message === 128) {
			delete noteRegistrar[note];
		} else {
			noteRegistrar[note] = data;
		}
		if (onMidiEvent) {
			onMidiEvent(data);
		}
		midi.currentTime = currentTime;
		///
		eventQueue.shift();
		///
		if (eventQueue.length < 1000) {
			startAudio(queuedTime, true);
		} else if (midi.currentTime === queuedTime && queuedTime < midi.endTime) { // grab next sequence
			startAudio(queuedTime, true);
		}
	}, currentTime - offset);
};

var getContext = function() {
	if (MIDI.lang === "WebAudioAPI") {
		return MIDI.Player.ctx;
	} else if (!midi.ctx) {
		midi.ctx = { currentTime: 0 };
	}
	return midi.ctx;
};

var getLength = function() {
	var data =  midi.data;
	var length = data.length;
	var totalTime = 0.5;
	for (var n = 0; n < length; n++) {
		totalTime += data[n][1];
	}
	return totalTime;
};

var __now;
var getNow = function() {
    if (window.performance && window.performance.now)
        return window.performance.now();
    return Date.now();
};

var startAudio = function (currentTime, fromCache, callback) {
	if (!midi.replayer) return;
	if (!fromCache) {
		if (typeof (currentTime) === "undefined") currentTime = midi.restart;
		if (midi.playing) stopAudio();
		midi.playing = true;
		midi.data = midi.replayer.getData();
		midi.endTime = getLength();
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
	if (MIDI.api !== "webaudio") { // set currentTime on ctx
		var now = getNow();
		__now = __now || now;
		ctx.currentTime = (now - __now) / 1000;
	}
	///
	startTime = ctx.currentTime;
	///
	for (var n = 0; n < length && messages < 100; n++) {
		var time = data[n][1];
		if ((queuedTime += time) <= currentTime) {
			offset = queuedTime;
			continue;
		}
		currentTime = queuedTime - offset;
		///
		var event = data[n][0].event;
		if (event.type !== "channel") {
			//console.log(event);
			continue;
		}
		var channelId = event.channel;
		var channel = MIDI.channels[channelId];
		var delay = ctx.currentTime + ((currentTime + foffset + midi.startDelay) / 1000);
		var queueTime = queuedTime - offset + midi.startDelay;
		switch (event.subtype) {
			case "controller":
				MIDI.setController(channelId, event.controllerType, event.value, delay);
				break;
			case "programChange":
				MIDI.programChange(channelId, event.programNumber, delay);
				break;
			case "pitchBend":
				MIDI.pitchBend(channelId, event.value, delay);
				break;
			case "noteOn":
				if (channel.mute) break;
				note = event.noteNumber - (midi.MIDIOffset || 0);
				var obj = {
				    event: event,
				    time: queueTime,
				    source: MIDI.noteOn(channelId, event.noteNumber, event.velocity, delay),
				    interval: scheduleTracking(channelId, note, queuedTime + midi.startDelay, offset - foffset, 144, event.velocity)
				};
				eventQueue.push(obj);
				messages++;
				break;
			case "noteOff":
				if (channel.mute) break;
				note = event.noteNumber - (midi.MIDIOffset || 0);
				var obj = {
				    event: event,
				    time: queueTime,
				    source: MIDI.noteOff(channelId, event.noteNumber, delay),
				    interval: scheduleTracking(channelId, note, queuedTime, offset - foffset, 128, 0)
				};
				eventQueue.push(obj);
				break;
			default:
				break;
		}
	}
	if (callback) {
	    callback(eventQueue);
	}
};

var stopAudio = function () {
	var ctx = getContext();
	midi.playing = false;
	midi.restart += (ctx.currentTime - startTime) * 1000;
	// stop the audio, and intervals
	while (eventQueue.length) {
		var o = eventQueue.pop();
		window.clearInterval(o.interval);
		if (!o.source) continue; // is not webaudio
		if (typeof(o.source) === "number") {
			window.clearTimeout(o.source);
		} else { // webaudio
			o.source.disconnect(0);
		}
	}
	// run callback to cancel any notes still playing
	for (var key in noteRegistrar) {
		var o = noteRegistrar[key]
		if (noteRegistrar[key].message === 144 && onMidiEvent) {
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
	// reset noteRegistrar
	noteRegistrar = {};
};

})();