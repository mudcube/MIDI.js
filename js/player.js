/*
    ----------------------------------------------------------
    MIDI.Player
    ----------------------------------------------------------
    https://github.com/mscuthbert/midicube
    ----------------------------------------------------------
*/
import { channels, GM } from './gm.js';
import { MidiFile } from '../inc/jasmid/midifile.js';
import { Replayer } from '../inc/jasmid/replayer.js';

export class PlayInstance {
    /**
     *
     * @param {Object} plugin -- WebAudio, WebMidi, AudioTag
     */
    constructor(plugin) {
        this.plugin = plugin;
        this.currentTime = 0;
        this.endTime = 0;
        this.restart = 0;
        this.playing = false;
        this.timeWarp = 1;
        this.startDelay = 0;
        this.BPM = undefined;

        this.data = [];
        this.eventQueue = []; // hold events to be triggered
        this.queuedTime = 0.0; //
        this.startTime = 0; // to measure time elapse
        this.noteRegistrar = {}; // get event for requested note
        this.onMidiEvent = undefined; // listener
        this.MIDIOffset = 0; // not sure what used for.  A transposition?

        this.frame = undefined;

        this.__now = undefined;

    }

    start(onsuccess) {
        if (this.currentTime < -1) {
            this.currentTime = -1;
        }
        this.startAudio(this.currentTime, null, onsuccess);
    }

    resume(onsuccess) {
        return this.start(onsuccess);
    }

    pause() {
        const tmp = this.restart;
        this.stopAudio();
        this.restart = tmp;
    }

    stop() {
        this.stopAudio();
        this.restart = 0;
        this.currentTime = 0;
    }

    addListener(onsuccess) {
        this.onMidiEvent = onsuccess;
    }

    removeListener() {
        this.onMidiEvent = undefined;
    }

    clearAnimation() {
        if (this.animationFrameId)  {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    setAnimation(callback) {
        let currentTime = 0;
        let tOurTime = 0;
        let tTheirTime = 0;
        this.clearAnimation();
        this.frame = () => {
            this.animationFrameId = requestAnimationFrame(this.frame);

            if (this.endTime === 0) {
                return;
            }
            if (this.playing) {
                currentTime = (tTheirTime === this.currentTime) ? tOurTime - Date.now() : 0;
                if (this.currentTime === 0) {
                    currentTime = 0;
                } else {
                    currentTime = this.currentTime - currentTime;
                }
                if (tTheirTime !== this.currentTime) {
                    tOurTime = Date.now();
                    tTheirTime = this.currentTime;
                }
            } else { // paused
                currentTime = this.currentTime;
            }

            const endTime = this.endTime;
            // const percent = currentTime / endTime;
            const total = currentTime / 1000;
            const minutes = total / 60;
            const seconds = total - (minutes * 60);
            const t1 = minutes * 60 + seconds;
            const t2 = (endTime / 1000);

            if (t2 - t1 < -1.0) {
                // noinspection UnnecessaryReturnStatementJS

            } else {
                callback({
                    now: t1,
                    end: t2,
                    events: this.noteRegistrar,
                });
            }
        };

        requestAnimationFrame(this.frame);
    }

    loadMidiFile(onsuccess, onprogress, onerror) {
        try {
            this.replayer = new Replayer(MidiFile(this.currentData), this.timeWarp, null, this.BPM);
            this.data = this.replayer.getData();
            this.endTime = this.getLength();

            this.loadPlugin({
                // instruments: this.getFileInstruments(),
                onsuccess,
                onprogress,
                onerror,
            });
        } catch (event) {
            if (onerror) {
                onerror(event);
            }
        }
    }

    loadPlugin(...options) {  // override in subclasses
    }

    loadFile(file, onsuccess, onprogress, onerror) {
        this.stop();
        if (file.indexOf('base64,') !== -1) {
            this.currentData = atob(file.split(',')[1]);
            this.loadMidiFile(onsuccess, onprogress, onerror);
        } else {
            const fetch = new XMLHttpRequest();
            fetch.open('GET', file);
            fetch.overrideMimeType('text/plain; charset=x-user-defined');
            fetch.onreadystatechange = () => {
                if (fetch.readyState === 4) {
                    if (fetch.status === 200) {
                        const t = fetch.responseText || '';
                        const ff = [];
                        const mx = t.length;
                        const scc = String.fromCharCode;
                        for (let z = 0; z < mx; z++) {
                            // eslint-disable-next-line no-bitwise
                            ff[z] = scc(t.charCodeAt(z) & 255);
                        }

                        this.currentData = ff.join('');
                        this.loadMidiFile(onsuccess, onprogress, onerror);
                    } else {
                        if (onerror) {
                            onerror('Unable to load MIDI file');
                        }
                    }
                }
            };
            fetch.send();
        }
    }

    getFileInstruments() {
        const instruments = {};
        const programs = {};
        for (let n = 0; n < this.data.length; n++) {
            const event = this.data[n][0].event;
            if (event.type !== 'channel') {
                continue;
            }
            const channel = event.channel;
            switch (event.subtype) {
            case 'controller': {
                // console.log(event.channel, MIDI.defineControl[event.controllerType], event.value);
                break;
            }
            case 'programChange': {
                programs[channel] = event.programNumber;
                break;
            }
            case 'noteOn': {
                const program = programs[channel];
                const use_value = !Number.isNaN(parseInt(program)) ? program : channel;
                const gm = GM.byId[use_value];
                instruments[gm.id] = true;
                break;
            }
            default: {
                break;
            }
            }
        }
        const ret = [];
        for (const key of Object.keys(instruments)) {
            ret.push(key);
        }
        return ret;
    }

    // Playing the audio

    // noinspection JSUnusedLocalSymbols
    scheduleTracking(channel, note, currentTime, offset, message, velocity, time) {
        return setTimeout(() => {
            const data = {
                channel,
                note,
                now: currentTime,
                end: this.endTime,
                message,
                velocity,
            };
            if (message === 128) {
                delete this.noteRegistrar[note];
            } else {
                this.noteRegistrar[note] = data;
            }
            if (this.onMidiEvent) {
                this.onMidiEvent(data);
            }
            this.currentTime = currentTime;
            this.eventQueue.shift();

            if (this.eventQueue.length < 1000) {
                this.startAudio(this.queuedTime, true);
            } else if (this.currentTime === this.queuedTime && this.queuedTime < this.endTime) { // grab next sequence
                this.startAudio(this.queuedTime, true);
            }
        }, currentTime - offset);
    }

    getContext() {
        if (this.plugin.api === 'webaudio') {
            return this.plugin.getContext();
        } else {
            this.ctx = {currentTime: 0};
        }
        return this.ctx;
    }

    getLength() {
        const data = this.data;
        const length = data.length;
        let totalTime = 0.5;
        for (let n = 0; n < length; n++) {
            totalTime += data[n][1];
        }
        return totalTime;
    }

    getNow() {
        if (window.performance && window.performance.now) {
            return window.performance.now();
        } else {
            return Date.now();
        }
    }

    startAudio(currentTime, fromCache, onsuccess) {
        if (!this.replayer) {
            return;
        }
        if (!fromCache) {
            if (typeof currentTime === 'undefined') {
                currentTime = this.restart;
            }
            if (this.playing) {
                this.stopAudio();
            }
            this.playing = true;
            this.data = this.replayer.getData();
            this.endTime = this.getLength();
        }

        let note;
        let offset = 0;
        let messages = 0;
        const data = this.data;
        const ctx = this.getContext();
        const length = data.length;

        this.queuedTime = 0.5;

        // const interval = this.eventQueue[0] && this.eventQueue[0].interval || 0;
        const foffset = currentTime - this.currentTime;

        if (this.plugin.api !== 'webaudio') { // set currentTime on ctx
            const now = this.getNow();
            this.__now = this.__now || now;
            ctx.currentTime = (now - this.__now) / 1000;
        }

        this.startTime = ctx.currentTime;

        for (let n = 0; n < length && messages < 100; n++) {
            const obj = data[n];
            this.queuedTime += obj[1];
            if (this.queuedTime <= currentTime) {
                offset = this.queuedTime;
                continue;
            }

            currentTime = this.queuedTime - offset;

            const event = obj[0].event;
            if (event.type !== 'channel') {
                continue;
            }

            const channelId = event.channel;
            const channel = channels[channelId];
            const delay = ctx.currentTime + ((currentTime + foffset + this.startDelay) / 1000);
            const queueTime = this.queuedTime - offset + this.startDelay;
            switch (event.subtype) {
            case 'controller':
                // noinspection JSUnresolvedFunction
                this.plugin.setController(channelId, event.controllerType, event.value, delay);
                break;
            case 'programChange':
                // noinspection JSUnresolvedFunction
                this.plugin.programChange(channelId, event.programNumber, delay);
                break;
            case 'pitchBend':
                this.plugin.pitchBend(channelId, event.value, delay);
                break;
            case 'noteOn':
                if (channel.mute) { break; }
                note = event.noteNumber - (this.MIDIOffset || 0);
                this.eventQueue.push({
                    event,
                    time: queueTime,
                    source: this.plugin.noteOn(channelId, event.noteNumber, event.velocity, delay),
                    interval: this.scheduleTracking(
                        channelId,
                        note,
                        this.queuedTime + this.startDelay,
                        offset - foffset,
                        144,
                        event.velocity
                    ),
                });
                messages += 1;
                break;
            case 'noteOff':
                if (channel.mute) {
                    break;
                }
                note = event.noteNumber - (this.MIDIOffset || 0);
                this.eventQueue.push({
                    event,
                    time: queueTime,
                    source: this.plugin.noteOff(channelId, event.noteNumber, delay),
                    interval: this.scheduleTracking(
                        channelId,
                        note,
                        this.queuedTime,
                        offset - foffset,
                        128,
                        0
                    ),
                });
                break;
            default:
                break;
            }
        }
        if (onsuccess) {
            onsuccess(this.eventQueue);
        }
    }

    stopAudio() {
        const ctx = this.getContext();
        this.playing = false;
        this.restart += (ctx.currentTime - this.startTime) * 1000;

        // stop the audio, and intervals
        while (this.eventQueue.length) {
            const o = this.eventQueue.pop();
            window.clearInterval(o.interval);
            if (!o.source) {
                continue; // is not webaudio
            }
            if (typeof (o.source) === 'number') {
                window.clearTimeout(o.source);
            } else { // webaudio
                o.source.disconnect(0);
            }
        }

        // run callback to cancel any notes still playing
        for (const key of Object.keys(this.noteRegistrar)) {
            const o = this.noteRegistrar[key];
            if (this.noteRegistrar[key].message === 144 && this.onMidiEvent) {
                this.onMidiEvent({
                    channel: o.channel,
                    note: o.note,
                    now: o.now,
                    end: o.end,
                    message: 128,
                    velocity: o.velocity,
                });
            }
        }

        // reset noteRegistrar
        this.noteRegistrar = {};
    }
}
