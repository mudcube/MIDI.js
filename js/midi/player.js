/*
	----------------------------------------------------------
	MIDI.player : 2015-05-16
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
	player.currentTime = clamp(0, player.duration, player.currentTime);
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
player.on =
player.addListener = function(onsuccess) {
	onPacketListener = onsuccess;
};

player.off =
player.removeListener = function() {
	onPacketListener = undefined;
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
	requestAnimationFrame(function frame() {
		player.frameId = requestAnimationFrame(frame);
		///
		if (player.duration) {
			if (player.isPlaying) {
				currentTime = (nowMidi === player.currentTime) ? nowSys - Date.now() : 0;
				///
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
		}
	});
};


/* Load File - accepts base64 or url to MIDI File
---------------------------------------------------------- */
player.loadFile = (function() {

	function getInstrumentList() {
		var GM = MIDI.GM;
		var instruments = {};
		var programChange = {};
		var packets = player.packets;
		for (var n = 0; n < packets.length; n ++) {
			var event = packets[n][0].event;
			if (event.type === 'channel') {
				var channel = event.channel;
				switch(event.subtype) {
					case 'programChange':
						programChange[channel] = event.programNumber;
						break;
					case 'noteOn':
						var program = programChange[channel];
						if (program === +program) {
							if (handleEvent.programChange) {
								var gm = GM.byId[program];
							} else {
								var channel = MIDI.channels[channel];
								var gm = GM.byId[channel.program];
							}
							instruments[gm.id] = true;
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

	function loadFile(onsuccess, onprogress, onerror) {
		try {
			player.replayer = new Replayer(MidiFile(player.currentData), 1.0 / player.timeWarp, null, player.BPM);
			player.packets = player.replayer.getData();
			player.duration = getLength();
			///
			MIDI.loadPlugin({
				instruments: getInstrumentList(),
				onsuccess: onsuccess,
				onprogress: onprogress,
				onerror: onerror
			});
		} catch(err) {
			onerror && onerror(err);
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

	return function(opts, onsuccess, onprogress, onerror) {
		if (typeof opts === 'string') opts = {src: opts};
		var src = opts.src;
		var onsuccess = onsuccess || opts.onsuccess;
		var onerror = onerror || opts.onerror;
		var onprogress = onprogress || opts.onprogress;
		///
		player.stop();
		///
		if (src.indexOf('base64,') !== -1) {
			player.currentData = atob(src.split(',')[1]);
			loadFile(onsuccess, onprogress, onerror);
		} else {
			var fetch = new XMLHttpRequest();
			fetch.open('GET', src);
			fetch.overrideMimeType('text/plain; charset=x-user-defined');
			fetch.onreadystatechange = function() {
				if (this.readyState === 4) {
					if (this.status === 200 && this.responseText) {
						player.currentData = toBase64(this.responseText);
						loadFile(onsuccess, onprogress, onerror);
					} else {
						onerror && onerror('Unable to load MIDI file.');
					}
				}
			};
			fetch.send();
		}
	};
})();


/* Scheduling
---------------------------------------------------------- */
var packetQueue = []; // hold events to be triggered
var packetOn = {};
///
var onPacketListener = undefined; // listener
var startTime = 0; // to measure time elapse
///
player.packets = {}; // get event for requested note

function scheduleTracking(event, note, currentTime, offset) {
	return setTimeout(function() {
		onPacketListener && onPacketListener(event);
		///
		player.currentTime = currentTime;
		///
		packetQueue.shift();
		///
		var sid = event.channel + 'x' + event.noteNumber;
		var subtype = event.subtype;
		if (subtype === 'noteOn') {
			packetOn[sid] = event;
		} else if (subtype === 'noteOff') {
			delete packetOn[sid];
		}
		///
		if (OFFSET < player.duration) {
			if (packetQueue.length < 1000) { // fill queue
				startAudio(OFFSET, true);
			} else if (player.currentTime === OFFSET) { // grab next sequence
				startAudio(OFFSET, true);
			}
		}
	}, currentTime - offset);
};


/* Start Audio
---------------------------------------------------------- */
var IDX;
var OFFSET;
function startAudio(currentTime, isPlaying, onsuccess) {
	if (!isPlaying) {
		player.isPlaying && stopAudio();
		player.isPlaying = true;
		player.packets = player.replayer.getData();
		player.duration = getLength();
	}
	///
	var messages = 0;
	var packets = player.packets;
	var length = packets.length;
	///
	var interval = packetQueue[0] && packetQueue[0].interval || 0;
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
	if (isPlaying) {
		var packetIdx = IDX;
		var offset = OFFSET;
	} else {
		var obj = seekPacket(currentTime);
		var packetIdx = obj.idx;
		var offset = OFFSET = obj.offset;
	}

	while(packetIdx < length && messages <= 100) {
		var packet = packets[packetIdx];
		///
		IDX = ++ packetIdx;
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
						packetQueue.push({
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
						packetQueue.push({
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
	onsuccess && onsuccess(packetQueue);
};

function seekPacket(seekTime) {
	var packets = player.packets;
	var length = packets.length;
	for (var idx = 0, offset = 0; idx < length; idx++) {
		var packet = packets[idx];
		var packetTime = packet[1];
		if (offset + packetTime < seekTime) {
			offset += packetTime;
		} else {
			break;
		}
	}
	return {
		idx: idx,
		offset: offset
	};
};


/* Stop Audio
---------------------------------------------------------- */
function stopAudio() {
	if (player.isPlaying) {
		player.isPlaying = false;
		///
		var ctx = getContext();
		player.currentTime += (ctx.currentTime - startTime) * 1000;

		/// stop the audio, and intervals
		while(packetQueue.length) {
			var packet = packetQueue.pop();
			if (packet) {
				if (packet.source) {
					if (typeof packet.source === 'number') { // HTML5 Audio
						clearTimeout(packet.source);
					} else { // WebAudioAPI
						packet.source.disconnect(0);
					}
				}
				///
				clearTimeout(packet.interval);
			}
		}
		
		for (var sid in packetOn) {
			var event = packetOn[sid];
			onPacketListener({
				channel: event.channel,
				noteNumber: event.noteNumber,
				status: event.status - 16,
				subtype: 'noteOff',
				type: 'channel'
			});
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
	var packets =  player.packets;
	var length = packets.length;
	var totalTime = 0.0;
	for (var n = 0; n < length; n++) {
		totalTime += packets[n][1];
	}
	return totalTime;
};

var NOW;
function getNow() {
    if (window.performance && performance.now) {
        return performance.now();
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