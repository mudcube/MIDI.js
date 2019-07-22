/*
	----------------------------------------------------------
	Web Audio API - OGG or MPEG Soundbank
	----------------------------------------------------------
	http://webaudio.github.io/web-audio-api/
	----------------------------------------------------------
*/
import { DEBUG } from './debug.js';
import { channels, GM, keyToNote, noteToKey } from './gm.js';
import * as Base64Binary from './shim/Base64binary.js';
// information to share with loader...
export const shared_root_info = {};

const audioContext = null; // new AudioContext();
let useStreamingBuffer = false; // !!audioContext.createMediaElementSource;
let ctx; // audio context
const sources = {};
const effects = {};
let masterVolume = 127;
const audioBuffers = {};

export const send = (data, delay) => { };
export const setController = (channelId, type, value, delay) => { };

export const setVolume = (channelId, volume, delay) => {
    if (delay) {
        setTimeout(() => {
            masterVolume = volume;
        }, delay * 1000);
    } else {
        masterVolume = volume;
    }
};

export const programChange = (channelId, program, delay) => {
    // delay is ignored
    const channel = channels[channelId];
    if (channel) {
        channel.program = program;
    }
};

export const pitchBend = function(channelId, bend, delay) {
    // delay is ignored
    const channel = channels[channelId];
    if (channel) {
        if (delay) {
            setTimeout(() => channel.pitchBend = bend,
                delay);
        } else {
            channel.pitchBend = bend;
        }
    }
};

export const noteOn = (channelId, noteId, velocity, delay) => {
    delay = delay || 0;

    // check whether the note exists
    const channel = channels[channelId];
    const program = channel.program;
    const bufferId = program + 'x' + noteId;
    const buffer = audioBuffers[bufferId];
    if (!buffer) {
        if (DEBUG) {
            console.log('no buffer', GM.byId[program].id, program, channelId);
        }
        return;
    }

    // convert relative delay to absolute delay
    if (delay < ctx.currentTime) {
        delay += ctx.currentTime;
    }

    // create audio buffer
    let source;
    if (useStreamingBuffer) {
        source = ctx.createMediaElementSource(buffer);
    } else { // XMLHTTP buffer
        source = ctx.createBufferSource();
        source.buffer = buffer;
    }

    // add effects to buffer
    if (effects) {
        let chain = source;
        for (let key in effects) {
            chain.connect(effects[key].input);
            chain = effects[key];
        }
    }

    // add gain + pitchShift
    const gain = (velocity / 127) * (masterVolume / 127) * 2 - 1;
    source.connect(ctx.destination);
    source.playbackRate.value = 1; // pitch shift
    source.gainNode = ctx.createGain(); // gain
    source.gainNode.connect(ctx.destination);
    source.gainNode.gain.value = Math.min(1.0, Math.max(-1.0, gain));
    source.connect(source.gainNode);

    if (useStreamingBuffer) {
        if (delay) {
            return setTimeout(() => {
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

    sources[channelId + 'x' + noteId] = source;

    return source;
};

export const noteOff = (channelId, noteId, delay) => {
    delay = delay || 0;

    // check whether the note exists
    const channel = channels[channelId];
    const program = channel.program;
    const bufferId = program + 'x' + noteId;
    const buffer = audioBuffers[bufferId];
    if (buffer) {
        if (delay < ctx.currentTime) {
            delay += ctx.currentTime;
        }

        let source = sources[channelId + 'x' + noteId];
        if (source) {
            if (source.gainNode) {
                // @Miranet: 'the values of 0.2 and 0.3 could of course be used as
                // a 'release' parameter for ADSR like time settings.'
                // add { 'metadata': { release: 0.3 } } to soundfont files
                const gain = source.gainNode.gain;
                gain.linearRampToValueAtTime(gain.value, delay);
                gain.linearRampToValueAtTime(-1.0, delay + 0.3);
            }
            if (useStreamingBuffer) {
                if (delay) {
                    setTimeout(() => {
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

            delete sources[channelId + 'x' + noteId];
            return source;
        }
    }
};

export const chordOn = (channel, chord, velocity, delay) => {
    const res = {};
    for (const note of chord) {
        res[note] = noteOn(channel, note, velocity, delay);
    }
    return res;
};

export const chordOff = (channel, chord, delay) => {
    const res = {};
    for (const note of chord) {
        res[note] = noteOff(channel, note, delay);
    }
    return res;
};



export const stopAllNotes = () => {
    for (let sid in sources) {
        let delay = 0;
        if (delay < ctx.currentTime) {
            delay += ctx.currentTime;
        }
        const source = sources[sid];
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

export const setEffects = list => {
    if (ctx && ctx.tunajs) {
        for (const data of list) {
            const effect = new ctx.tunajs[data.type](data);
            effect.connect(ctx.destination);
            effects[data.type] = effect;
        }
    } else {
        return console.log('Effects module not installed.');
    }
};

export const connect = opts => {
    setContext(ctx || createAudioContext(), opts.onsuccess);
};

export const getContext = () => {
    return ctx;
};

export const setContext = (newCtx, onsuccess, onprogress, onerror) => {
    ctx = newCtx;

    // tuna.js effects module - https://github.com/Dinahmoe/tuna
    if (typeof Tuna !== 'undefined' && !(ctx.tunajs instanceof Tuna)) {
        ctx.tunajs = new Tuna(ctx);
    }

    // loading audio files
    const urls = [];
    for (let key in keyToNote) {
        urls.push(key);
    }

    const waitForEnd = instrument => {
        for (const key of Object.keys(bufferPending)) { // has pending items
            if (bufferPending[key]) {
                return;
            }
        }

        if (onsuccess) { // run onsuccess once
            onsuccess();
            onsuccess = null;
        }
    };

    const requestAudio = (soundfont, programId, index, key) => {
        const url = soundfont[key];
        if (url) {
            bufferPending[programId] ++;
            loadAudio(url, buffer => {
                buffer.id = key;
                const noteId = keyToNote[key];
                audioBuffers[programId + 'x' + noteId] = buffer;

                if (--bufferPending[programId] === 0) {
                    const percent = index / 87;
                    if (DEBUG) {
                        console.log(GM.byId[programId], 'processing: ', percent);
                    }
                    soundfont.isLoaded = true;
                    waitForEnd(programId);
                }
            }, err => {
                console.log(err);
            });
        }
    };

    const bufferPending = {};
    for (const [instrument, soundfont] of Object.entries(shared_root_info.Soundfont)) {
        if (soundfont.isLoaded) {
            continue;
        }

        const spec = GM.byName[instrument];
        if (spec) {
            const programId = spec.program;

            bufferPending[programId] = 0;

            for (let index = 0; index < urls.length; index++) {
                const key = urls[index];
                requestAudio(soundfont, programId, index, key);
            }
        }
    }
    setTimeout(waitForEnd, 1);
};

/* Load audio file: streaming | base64 | arraybuffer
---------------------------------------------------------------------- */
export const loadAudio = (url, onsuccess, onerror) => {
    if (useStreamingBuffer) {
        const audio = new Audio();
        audio.src = url;
        audio.controls = false;
        audio.autoplay = false;
        audio.preload = false;
        audio.addEventListener('canplay', () => {
            onsuccess && onsuccess(audio);
        });
        audio.addEventListener('error', err => {
            onerror && onerror(err);
        });
        document.body.appendChild(audio);
    } else if (url.indexOf('data:audio') === 0) { // Base64 string
        const base64 = url.split(',')[1];
        const buffer = Base64Binary.decodeArrayBuffer(base64);
        return ctx.decodeAudioData(buffer, onsuccess, onerror);
    } else {  // XMLHTTP buffer
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onsuccess = () => {
            return ctx.decodeAudioData(request.response, onsuccess, onerror);
        };
        request.send();
    }
};

export const createAudioContext = () => {
    return new (window.AudioContext || window.webkitAudioContext)();
};
