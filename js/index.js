/*!
    ----------------------------------------------------------
    midicube
    2019-08-17

    based on MIDI.js.Plugin : 0.3.4 : 2015-03-26

    MIT License
    https://github.com/mscuthbert/midicube/

    ----------------------------------------------------------
    Inspired by javax.sound.midi (albeit a super simple version):
        http://docs.oracle.com/javase/6/docs/api/javax/sound/midi/package-summary.html
    ----------------------------------------------------------
    Technologies
    ----------------------------------------------------------
        Web MIDI API - native support in Chrome. (Jazz plugin for safari, firefox, opera?)
        Web Audio API - firefox 25+, chrome 10+, safari 6+, opera 15+, edge 18+
            WebAudioShim allows Firefox < 25 to use, but not imported by default.
        HTML5 Audio Tag - ie 9+, firefox 3.5+, chrome 4+, safari 4+,
            opera 9.5+, ios 4+, android 2.3+
    ----------------------------------------------------------
*/
// not in core-js
import 'regenerator-runtime/runtime';
// core-js will monkey patch automatically

// no longer imported by default -- webmidi shim needs to be loaded separately
// import './shim/WebAudioAPI.js';
import { audioDetect } from './audioDetect.js';
import * as AudioTag from './plugin.audiotag.js';  // to be "export * as" when fully supported
import * as WebAudio from './plugin.webaudio.js';  // to be "export * as" when fully supported
import * as WebMIDI from './plugin.webmidi.js';
import { PlayInstance } from './player.js';
import * as Synesthesia from './synesthesia.js';
import {
    GM, noteToKey, keyToNote, channels,
} from './gm.js';  // to be "export * as" when fully supported

export {
    GM, noteToKey, keyToNote, channels,
};
export {
    AudioTag, WebAudio, WebMIDI,
};
export { Synesthesia };   // remove after export * as above

export const Soundfont = {};

export const audio_contexts = {
    AudioTag,
    WebAudio,
    WebMIDI,
};

export const config = {
    soundfontUrl: './soundfont/',
    api: '',
    audioFormat: '',
    supports: {},
    connected_plugin: WebAudio,  // just for linting/inheritance
    is_connected: false,
};


/*
MIDI.loadPlugin({
    onsuccess: function() { },
    onprogress: function(state, percent) { },
    targetFormat: 'mp3', // optionally can force to use MP3 (for instance on mobile networks)
    instrument: 'acoustic_grand_piano', // or 1 (default)
    instruments: [ 'acoustic_grand_piano', 'acoustic_guitar_nylon' ] // or multiple instruments
});
*/

export const loadPlugin = opts => {
    if (typeof opts === 'function') {
        opts = {
            onsuccess: opts,
        };
    }
    opts.onprogress = opts.onprogress || undefined;
    opts.api = opts.api || '';
    opts.targetFormat = opts.targetFormat || '';
    opts.instrument = opts.instrument || 'acoustic_grand_piano';
    opts.instruments = opts.instruments || undefined;
    // MSC: add the order of API precedence.
    //      Chrome's need for sys permissions for webmidi makes it lower precedence.
    opts.apiPrecedence = opts.apiPrecedence || ['webaudio', 'webmidi', 'audiotag'];

    config.soundfontUrl = opts.soundfontUrl || config.soundfontUrl;

    // Detect the best type of audio to use
    audioDetect(supports => {
        const hash = window.location.hash;
        let api = '';

        // use the most appropriate plugin if not specified
        if (supports[opts.api]) {
            api = opts.api;
        } else if (supports[hash.substring(1)]) {
            api = hash.substring(1);
        } else {
            for (const apiInOrder of opts.apiPrecedence) {
                if (supports[apiInOrder]) {
                    api = apiInOrder;
                    break;
                }
            }
        }

        if (connect[api]) {
            let audioFormat = '';
            const supports_ogg = supports['audio/ogg'];
            const supports_mpeg = supports['audio/mpeg'];
            const audio_format_precedence = supports.ogg_mp3_precedence;

            // use audio/ogg when supported
            if (opts.targetFormat) {
                audioFormat = opts.targetFormat;
            } else { // use best chance of playing, then quality as tiebreak.
                if (supports_ogg && audio_format_precedence === 'ogg') {
                    audioFormat = 'ogg';
                } else if (supports_mpeg && audio_format_precedence === 'mp3') {
                    audioFormat = 'mp3';
                } else if (supports_ogg) {
                    audioFormat = 'ogg';
                } else if (supports_mpeg) {
                    audioFormat = 'mp3';
                } else if (api !== 'webmidi') {
                    console.warn('no supporting playback formats...will try mp3 but unlikely');
                    audioFormat = 'mp3';
                }
            }

            // load the specified plugin
            config.api = api;
            config.audioFormat = audioFormat;
            config.supports = supports;
            loadProgram(opts);
        }
    });
};

/*
    loadProgram({
        instrument: 'banjo'
        onsuccess: function() { },
        onprogress: function(state, percent) { },
        onerror: function() { },
    })
*/

export const loadProgram = opts => {
    let instruments = opts.instruments || opts.instrument || 'acoustic_grand_piano';
    //
    if (typeof instruments !== 'object') {
        if (instruments || instruments === 0) {
            instruments = [instruments];
        } else {
            instruments = [];
        }
    }
    // convert numeric ids into strings
    for (let i = 0; i < instruments.length; i++) {
        const instrument = instruments[i];
        if (instrument === (instrument + 0)) { // is numeric
            if (GM.byId[instrument]) {
                instruments[i] = GM.byId[instrument].id;
            }
        }
    }
    //
    opts.format = config.audioFormat;
    opts.instruments = instruments;
    //
    connect[config.api](opts);
};

const connect = {
    webmidi: opts => {
        // cant wait for this to be standardized!
        pre_connect(WebMIDI, opts);
        WebMIDI.connect(opts);
        config.is_connected = true;
    },
    audiotag: opts => {
        // works ok, kinda like a drunken tuna fish, across the board
        // http://caniuse.com/audio
        pre_connect(AudioTag, opts);
        requestQueue(opts, 'AudioTag');
    },
    webaudio: opts => {
        // works awesome! safari, chrome and firefox support
        // http://caniuse.com/web-audio
        pre_connect(WebAudio, opts);
        requestQueue(opts, 'WebAudio');
    },
};

// noinspection JSUnusedLocalSymbols
/**
 *
 * @param {WebMIDI|WebAudio|AudioTag} plugin
 * @param {Object} [opts]
 */
const pre_connect = (plugin, opts) => {
    config.connected_plugin = plugin;

    // noinspection JSUnresolvedVariable
    plugin.shared_root_info.Soundfont = Soundfont;
    // noinspection JSUnresolvedVariable
    plugin.shared_root_info.config = config;
    // noinspection JSUnresolvedVariable
    plugin.shared_root_info.webaudio_backup_connect = opts => connect.webaudio(opts);
};

export const requestQueue = (opts, context) => {
    const audioFormat = opts.format;
    const { instruments, onprogress, onerror } = opts;
    const correct_audio_context = audio_contexts[context] || context.WebAudio;

    const num_instruments = instruments.length;
    let pending = num_instruments;
    const waitForEnd = () => {
        pending -= 1;
        if (!pending) {
            correct_audio_context.connect(opts);
            config.is_connected = true;
            if (onprogress) {
                onprogress('load', 1.0);
            }
        }
    };

    const onprogress_inner = (evt, progress, instrumentId) => {
        const fileProgress = progress / num_instruments;
        const queueProgress = (num_instruments - pending) / num_instruments;
        if (onprogress) {
            onprogress('load', fileProgress + queueProgress, instrumentId);
        }
    };


    for (const instrumentId of instruments) {
        if (Soundfont[instrumentId]) { // already loaded
            waitForEnd();
        } else { // needs to be requested
            const onsuccess_inner = () => waitForEnd();
            sendRequest(
                instrumentId,
                audioFormat,
                (evt, progress) => onprogress_inner(evt, progress, instrumentId),
                onsuccess_inner,
                onerror
            );
        }
    }
};

export const sendRequest = (instrumentId, audioFormat, onprogress, onsuccess, onerror) => {
    const soundfontPath = config.soundfontUrl + instrumentId + '-' + audioFormat + '.js';
    const xhr = new XMLHttpRequest();
    xhr.open('GET', soundfontPath);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.onload = () => {
        if (xhr.status === 200) {
            const script = document.createElement('script');
            script.language = 'javascript';
            script.type = 'text/javascript';
            script.text = xhr.responseText;
            document.body.appendChild(script);
            onsuccess();
        } else {
            if (onerror) {
                onerror();
            } else {
                console.error(`Could not load soundfont; path was ${soundfontPath}`);
            }
        }
    };
    xhr.send();
};


// These are methods that call the connected plugin's method

// TODO: get audio buffers from webaudio audioBuffers


export const playChannel = (...options) => {
    if (!config.is_connected) { console.error('Connect before calling'); return undefined; }
    return config.connected_plugin.playChannel(...options);
};

export const stopChannel = (...options) => {
    if (!config.is_connected) { console.error('Connect before calling'); return undefined; }
    return config.connected_plugin.stopChannel(...options);
};

export const send = (...options) => {
    if (!config.is_connected) { console.error('Connect before calling'); return undefined; }
    return config.connected_plugin.send(...options);
};
export const setController = (...options) => {
    if (!config.is_connected) { console.error('Connect before calling'); return undefined; }
    return config.connected_plugin.setController(...options);
};
export const setVolume = (...options) => {
    if (!config.is_connected) { console.error('Connect before calling'); return undefined; }
    return config.connected_plugin.setVolume(...options);
};
export const programChange = (...options) => {
    if (!config.is_connected) { console.error('Connect before calling'); return undefined; }
    return config.connected_plugin.programChange(...options);
};
export const pitchBend = (...options) => {
    if (!config.is_connected) { console.error('Connect before calling'); return undefined; }
    return config.connected_plugin.pitchBend(...options);
};
export const noteOn = (...options) => {
    if (!config.is_connected) { console.error('Connect before calling'); return undefined; }
    return config.connected_plugin.noteOn(...options);
};
export const noteOff = (...options) => {
    if (!config.is_connected) { console.error('Connect before calling'); return undefined; }
    return config.connected_plugin.noteOff(...options);
};

export const chordOn = (...options) => {
    if (!config.is_connected) { console.error('Connect before calling'); return undefined; }
    return config.connected_plugin.chordOn(...options);
};

export const chordOff = (...options) => {
    if (!config.is_connected) { console.error('Connect before calling'); return undefined; }
    return config.connected_plugin.chordOff(...options);
};

export const stopAllNotes = (...options) => {
    if (!config.is_connected) { console.error('Connect before calling'); return undefined; }
    return config.connected_plugin.stopAllNotes(...options);
};


// noinspection JSUnusedLocalSymbols
export const setEffects = (...options) => {
    if (!config.is_connected) { console.error('Connect before calling'); return undefined; }
    return config.connected_plugin.setEffects();
};

export const getContext = () => {
    if (!config.is_connected) { console.error('Connect before calling'); return undefined; }
    return config.connected_plugin.getContext();
};


export const setContext = (...options) => {
    if (!config.is_connected) { console.error('Connect before calling'); return undefined; }
    return config.connected_plugin.setContext(...options);
};


// Player

export class Player extends PlayInstance {
    constructor() {
        super(config.connected_plugin);
    }

    loadPlugin(...options) {
        return loadPlugin(...options);
    }
}
