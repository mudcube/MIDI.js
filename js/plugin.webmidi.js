/*
    ----------------------------------------------------------------------
    Web MIDI API - Native Soundbanks
    ----------------------------------------------------------------------
    http://webaudio.github.io/web-midi-api/
    ----------------------------------------------------------------------
*/
export const api = 'webmidi';

// information to share with loader...
export const shared_root_info = {};

let output = null;

export const connect = opts => {
    const errFunction = err => {
        console.error('Could not connect to web midi! Falling back to WebAudio:', err);
        // we tried.  Anything that sort of supports webmidi should support WebAudio.
        if (shared_root_info.webaudio_backup_connect) {
            shared_root_info.config.api = 'webaudio';
            shared_root_info.webaudio_backup_connect(opts);
        }
    };
    navigator.requestMIDIAccess().then(access => {
        const plugin = access;
        const pluginOutputs = plugin.outputs;
        if (typeof pluginOutputs === 'function') { // Chrome pre-43
            // noinspection JSValidateTypes
            output = pluginOutputs()[0];
        } else { // Chrome post-43
            output = pluginOutputs[0];
        }
        if (output === undefined) { // nothing there...
            return errFunction('No outputs defined');
        } else {
            return opts.onsuccess && opts.onsuccess();
        }
    }, errFunction);
};


// plugin-common methods

// not applicable methods:
export const playChannel = () => {};
export const stopChannel = () => {};
export const setEffects = () => {};
export const getContext = () => {};
export const setContext = () => {};



export const send = (data, delay) => { // set channel volume
    output.send(data, delay * 1000);
};

export const setController = (channel, type, value, delay) => {
    output.send([channel, type, value], delay * 1000);
};

export const setVolume = (channel, volume, delay) => { // set channel volume
    output.send([0xB0 + channel, 0x07, volume], delay * 1000);
};

export const programChange = (channel, program, delay) => { // change patch (instrument)
    output.send([0xC0 + channel, program], delay * 1000);
};

export const pitchBend = (channel, program, delay) => { // pitch bend
    output.send([0xE0 + channel, program], delay * 1000);
};

export const noteOn = (channel, note, velocity, delay) => {
    output.send([0x90 + channel, note, velocity], delay * 1000);
};

export const noteOff = (channel, note, delay) => {
    output.send([0x80 + channel, note, 0], delay * 1000);
};

export const chordOn = (channel, chord, velocity, delay) => {
    for (const note of chord) {
        output.send([0x90 + channel, note, velocity], delay * 1000);
    }
};

export const chordOff = (channel, chord, delay) => {
    for (const note of chord) {
        output.send([0x80 + channel, note, 0], delay * 1000);
    }
};

export const stopAllNotes = () => {
    output.cancel();
    for (let channel = 0; channel < 16; channel++) {
        output.send([0xB0 + channel, 0x7B, 0]);
    }
};

