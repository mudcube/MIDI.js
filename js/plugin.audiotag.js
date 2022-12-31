/*
    ----------------------------------------------------------------------
    AudioTag <audio> - OGG or MPEG Soundbank
    ----------------------------------------------------------------------
    http://dev.w3.org/html5/spec/Overview.html#the-audio-element
    ----------------------------------------------------------------------
*/
import { DEBUG } from './debug.js';
import {
    channels, GM, keyToNote, noteToKey,
} from './gm.js';

export const api = 'audiotag';

// information to share with loader...
export const shared_root_info = {};

const volumes = []; // floating point
for (let vid = 0; vid < 16; vid++) {
    volumes[vid] = 127;
}


let buffer_nid = -1; // current channel
const notesOn = []; // instrumentId + noteId that is currently playing in each 'channel', for routing noteOff/chordOff calls
const notes = {}; // the piano keys

const audioBuffers = []; // the audio channels
for (let nid = 0; nid < 12; nid++) {
    audioBuffers[nid] = new Audio();
}
// TODO(msc): MIDI.audioBuffers = audioBuffers;

export const connect = opts => {
    for (const key of Object.keys(keyToNote)) {
        notes[key] = {id: key};
    }

    if (opts.onsuccess) {
        opts.onsuccess();
    }
};


// plugin-common methods

// not applicable methods:
export const send = (data, delay) => { };
export const setController = (channel, type, value, delay) => { };
export const pitchBend = (channel, program, delay) => { };
export const setEffects = () => {};
export const getContext = () => {};
export const setContext = () => {};


export const playChannel = (channel, in_note) => {
    if (!channels[channel]) {
        return;
    }
    const instrument = channels[channel].program;
    const instrumentId = GM.byId[instrument].id;
    const note = notes[in_note];
    if (note) {
        const instrumentNoteId = instrumentId + '' + note.id;
        const nid = (buffer_nid + 1) % audioBuffers.length;
        const audio = audioBuffers[nid];
        notesOn[nid] = instrumentNoteId;
        if (!shared_root_info.Soundfont[instrumentId]) {
            if (DEBUG) {
                console.log('404', instrumentId);
            }
            return;
        }
        audio.src = shared_root_info.Soundfont[instrumentId][note.id];
        audio.volume = volumes[channel] / 127;
        audio.play();
        buffer_nid = nid;
    }
};

export const stopChannel = (channel, in_note) => {
    if (!channels[channel]) {
        return;
    }
    const instrument = channels[channel].program;
    const instrumentId = GM.byId[instrument].id;
    const note = notes[in_note];
    if (note) {
        const instrumentNoteId = instrumentId + '' + note.id;
        for (let i = 0, len = audioBuffers.length; i < len; i++) {
            const nid = (i + buffer_nid + 1) % len;
            const cId = notesOn[nid];
            if (cId && cId === instrumentNoteId) {
                audioBuffers[nid].pause();
                notesOn[nid] = null;
                return;
            }
        }
    }
};


export const setVolume = (channel, n) => {
    volumes[channel] = n;
};

export const programChange = (channel, program) => {
    channels[channel].instrument = program;
};

export const noteOn = (channel, note, velocity, delay) => {
    const id = noteToKey[note];
    if (!notes[id]) {
        return false;
    }
    if (delay) {
        return setTimeout(() => {
            volumes[channel] = velocity;
            playChannel(channel, id);
        }, delay * 1000);
    } else {
        volumes[channel] = velocity;
        playChannel(channel, id);
        return true;
    }
};

export const noteOff = (channel, note, delay) => {
    // MASC: Already commented out in MudCube version...
    //      I see why!  clips all the notes!

    // const id = noteToKey[note];
    // if (!notes[id]) {
    //      return;
    // }
    // if (delay) {
    //      return setTimeout(function() {
    //           stopChannel(channel, id);
    //      }, delay * 1000)
    // } else {
    //      stopChannel(channel, id);
    // }
};

export const chordOn = (channel, chord, velocity, delay) => {
    for (let idx = 0; idx < chord.length; idx++) {
        const n = chord[idx];
        const id = noteToKey[n];
        if (!notes[id]) {
            continue;
        }
        if (delay) {
            setTimeout(() => {
                playChannel(channel, id);
            }, delay * 1000);
        } else {
            playChannel(channel, id);
        }
    }
};

export const chordOff = (channel, chord, delay) => {
    for (let idx = 0; idx < chord.length; idx++) {
        const n = chord[idx];
        const id = noteToKey[n];
        if (!notes[id]) {
            continue;
        }
        if (delay) {
            setTimeout(() => {
                stopChannel(channel, id);
            }, delay * 1000);
        } else {
            stopChannel(channel, id);
        }
    }
};

export const stopAllNotes = () => {
    for (let nid = 0, {length} = audioBuffers; nid < length; nid++) {
        audioBuffers[nid].pause();
    }
};

