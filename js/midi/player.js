/*
	----------------------------------------------------------
	MIDI.Player : 0.3.1 : 2015-03-26
	----------------------------------------------------------
	https://github.com/mudcube/MIDI.js
	----------------------------------------------------------
*/

if (typeof MIDI === 'undefined') MIDI = {};
if (typeof MIDI.Player === 'undefined') MIDI.Player = {};
if (typeof MIDI.Players === 'undefined') MIDI.Players = {};

(function() { 'use strict';

MIDI.Players.PlayInstance = function () {
    var midi = this;
    
    midi.currentTime = 0;
    midi.endTime = 0; 
    midi.restart = 0; 
    midi.playing = false;
    midi.timeWarp = 1;
    midi.startDelay = 0;
    midi.BPM = 120;

    midi.start = midi.resume = function(onsuccess) {
        if (midi.currentTime < -1) {
            midi.currentTime = -1;
        }
        midi.startAudio(midi.currentTime, null, onsuccess);
    };

    midi.pause = function() {
        var tmp = midi.restart;
        midi.stopAudio();
        midi.restart = tmp;
    };

    midi.stop = function() {
        midi.stopAudio();
        midi.restart = 0;
        midi.currentTime = 0;
    };
    midi.addListener = function(onsuccess) {
        midi.onMidiEvent = onsuccess;
    };

    midi.removeListener = function() {
        midi.onMidiEvent = undefined;
    };
    midi.clearAnimation = function() {
        if (midi.animationFrameId)  {
            cancelAnimationFrame(midi.animationFrameId);
        }
    };
    midi.setAnimation = function(callback) {
        var currentTime = 0;
        var tOurTime = 0;
        var tTheirTime = 0;
        //
        midi.clearAnimation();
        ///
        midi.frame = function() {
            midi.animationFrameId = requestAnimationFrame(midi.frame);
            ///
            if (midi.endTime === 0) {
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
            var endTime = midi.endTime;
            var percent = currentTime / endTime;
            var total = currentTime / 1000;
            var minutes = total / 60;
            var seconds = total - (minutes * 60);
            var t1 = minutes * 60 + seconds;
            var t2 = (endTime / 1000);
            ///
            if (t2 - t1 < -1.0) {
                return;
            } else {
                callback({
                    now: t1,
                    end: t2,
                    events: midi.noteRegistrar
                });
            }
        };
        ///
        requestAnimationFrame(midi.frame);
    };
 // helpers

    midi.loadMidiFile = function(onsuccess, onprogress, onerror) {
        try {
            midi.replayer = new Replayer(MidiFile(midi.currentData), midi.timeWarp, null, midi.BPM);
            midi.data = midi.replayer.getData();
            midi.endTime = midi.getLength();
            ///
            MIDI.loadPlugin({
//              instruments: midi.getFileInstruments(),
                onsuccess: onsuccess,
                onprogress: onprogress,
                onerror: onerror
            });
        } catch(event) {
            onerror && onerror(event);
        }
    };

    midi.loadFile = function(file, onsuccess, onprogress, onerror) {
        midi.stop();
        if (file.indexOf('base64,') !== -1) {
            var data = window.atob(file.split(',')[1]);
            midi.currentData = data;
            midi.loadMidiFile(onsuccess, onprogress, onerror);
        } else {
            var fetch = new XMLHttpRequest();
            fetch.open('GET', file);
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
                        onerror && onerror('Unable to load MIDI file');
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
//                  console.log(event.channel, MIDI.defineControl[event.controllerType], event.value);
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

    midi.eventQueue = []; // hold events to be triggered
    midi.queuedTime; // 
    midi.startTime = 0; // to measure time elapse
    midi.noteRegistrar = {}; // get event for requested note
    midi.onMidiEvent = undefined; // listener
    midi.scheduleTracking = function(channel, note, currentTime, offset, message, velocity, time) {
        return setTimeout(function() {
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
                delete midi.noteRegistrar[note];
            } else {
                midi.noteRegistrar[note] = data;
            }
            if (midi.onMidiEvent) {
                midi.onMidiEvent(data);
            }
            midi.currentTime = currentTime;
            ///
            midi.eventQueue.shift();
            ///
            if (midi.eventQueue.length < 1000) {
                midi.startAudio(midi.queuedTime, true);
            } else if (midi.currentTime === midi.queuedTime && midi.queuedTime < midi.endTime) { // grab next sequence
                midi.startAudio(midi.queuedTime, true);
            }
        }, currentTime - offset);
    };
    midi.getContext = function() {
        if (MIDI.api === 'webaudio') {
            return MIDI.WebAudio.getContext();
        } else {
            midi.ctx = {currentTime: 0};
        }
        return midi.ctx;
    };
    midi.getLength = function() {
        var data =  midi.data;
        var length = data.length;
        var totalTime = 0.5;
        for (var n = 0; n < length; n++) {
            totalTime += data[n][1];
        }
        return totalTime;
    };
    midi.__now = undefined;
    midi.getNow = function() {
        if (window.performance && window.performance.now) {
            return window.performance.now();
        } else {
            return Date.now();
        }
    };
    midi.startAudio = function(currentTime, fromCache, onsuccess) {
        if (!midi.replayer) {
            return;
        }
        if (!fromCache) {
            if (typeof currentTime === 'undefined') {
                currentTime = midi.restart;
            }
            ///
            midi.playing && midi.stopAudio();
            midi.playing = true;
            midi.data = midi.replayer.getData();
            midi.endTime = midi.getLength();
        }
        ///
        var note;
        var offset = 0;
        var messages = 0;
        var data = midi.data;
        var ctx = midi.getContext();
        var length = data.length;
        //
        midi.queuedTime = 0.5;
        ///
        var interval = midi.eventQueue[0] && midi.eventQueue[0].interval || 0;
        var foffset = currentTime - midi.currentTime;
        ///
        if (MIDI.api !== 'webaudio') { // set currentTime on ctx
            var now = midi.getNow();
            midi.__now = midi.__now || now;
            ctx.currentTime = (now - midi.__now) / 1000;
        }
        ///
        midi.startTime = ctx.currentTime;
        ///
        for (var n = 0; n < length && messages < 100; n++) {
            var obj = data[n];
            if ((midi.queuedTime += obj[1]) <= currentTime) {
                offset = midi.queuedTime;
                continue;
            }
            ///
            currentTime = midi.queuedTime - offset;
            ///
            var event = obj[0].event;
            if (event.type !== 'channel') {
                continue;
            }
            ///
            var channelId = event.channel;
            var channel = MIDI.channels[channelId];
            var delay = ctx.currentTime + ((currentTime + foffset + midi.startDelay) / 1000);
            var queueTime = midi.queuedTime - offset + midi.startDelay;
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
                    midi.eventQueue.push({
                        event: event,
                        time: queueTime,
                        source: MIDI.noteOn(channelId, event.noteNumber, event.velocity, delay),
                        interval: midi.scheduleTracking(channelId, note, midi.queuedTime + midi.startDelay, offset - foffset, 144, event.velocity)
                    });
                    messages++;
                    break;
                case 'noteOff':
                    if (channel.mute) break;
                    note = event.noteNumber - (midi.MIDIOffset || 0);
                    midi.eventQueue.push({
                        event: event,
                        time: queueTime,
                        source: MIDI.noteOff(channelId, event.noteNumber, delay),
                        interval: midi.scheduleTracking(channelId, note, midi.queuedTime, offset - foffset, 128, 0)
                    });
                    break;
                default:
                    break;
            }
        }
        ///
        onsuccess && onsuccess(midi.eventQueue);
    };
    midi.stopAudio = function() {
        var ctx = midi.getContext();
        midi.playing = false;
        midi.restart += (ctx.currentTime - midi.startTime) * 1000;
        // stop the audio, and intervals
        while (midi.eventQueue.length) {
            var o = midi.eventQueue.pop();
            window.clearInterval(o.interval);
            if (!o.source) continue; // is not webaudio
            if (typeof(o.source) === 'number') {
                window.clearTimeout(o.source);
            } else { // webaudio
                o.source.disconnect(0);
            }
        }
        // run callback to cancel any notes still playing
        for (var key in midi.noteRegistrar) {
            var o = midi.noteRegistrar[key]
            if (midi.noteRegistrar[key].message === 144 && midi.onMidiEvent) {
                midi.onMidiEvent({
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
        midi.noteRegistrar = {};
    };    
}

MIDI.Player = new MIDI.Players.PlayInstance();

})();