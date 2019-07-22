/*
	----------------------------------------------------------
	MIDI.Plugin : 0.3.4 : 2015-03-26
	----------------------------------------------------------
	https://github.com/mudcube/MIDI.js
	----------------------------------------------------------
	Inspired by javax.sound.midi (albeit a super simple version): 
		http://docs.oracle.com/javase/6/docs/api/javax/sound/midi/package-summary.html
	----------------------------------------------------------
	Technologies
	----------------------------------------------------------
		Web MIDI API - no native support yet (jazzplugin)
		Web Audio API - firefox 25+, chrome 10+, safari 6+, opera 15+
		HTML5 Audio Tag - ie 9+, firefox 3.5+, chrome 4+, safari 4+, opera 9.5+, ios 4+, android 2.3+
	----------------------------------------------------------
*/
import './shim/WebAudioAPI.js';  // imported by default -- webmidi shim needs to be loaded separately
import { audioDetect } from './audioDetect.js';
import * as AudioTag from './plugin.audiotag.js';
import * as WebAudio from './plugin.webaudio.js';
import * as WebMIDI from './plugin.webmidi.js';
export { GM, noteToKey, keyToNote } from './gm.js';
import { PlayInstance } from './player.js';
export * as Synesthesia from './synesthesia.js';

export const Soundfont = {};

export const audio_contexts = {
	AudioTag,
	WebAudio,
	WebMIDI,
};

export const config = {
	soundfontUrl: './soundfont/',
	api: undefined,
	audioFormat: undefined,
	supports: {},
	connected_plugin: undefined,
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
			onsuccess: opts
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
		} else if (supports[hash.substr(1)]) {
			api = hash.substr(1);
		} else {
			for (const apiInOrder of opts.apiPrecedence) {
				if (supports[apiInOrder]) {
					api = apiInOrder;
					break;
				}
			}
		}

		if (connect[api]) {
			let audioFormat;
			// use audio/ogg when supported
			if (opts.targetFormat) {
				audioFormat = opts.targetFormat;
			} else { // use best quality
				audioFormat = supports['audio/ogg'] ? 'ogg' : 'mp3';
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
	for (let i = 0; i < instruments.length; i ++) {
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
	}
};

const pre_connect = (plugin, opts) => {
	config.connected_plugin = plugin;
	plugin.shared_root_info.Soundfont = Soundfont;
	plugin.shared_root_info.config = config;
	plugin.shared_root_info.webaudio_backup_connect = opts => connect['webaudio'](opts);
}

export const requestQueue = (opts, context) => {
	const audioFormat = opts.format;
	const instruments = opts.instruments;
	const onprogress = opts.onprogress;
	const onerror = opts.onerror;
	const correct_audio_context = audio_contexts[context] || context.WebAudio;

	const num_instruments = instruments.length;
	let pending = num_instruments;
	const waitForEnd = () => {
		pending -= 1;
		if (!pending) {
			onprogress && onprogress('load', 1.0);
			correct_audio_context.connect(opts);
		}
	};

	for (const instrumentId of instruments) {
		if (Soundfont[instrumentId]) { // already loaded
			waitForEnd();
		} else { // needs to be requested
			const onprogress_inner = (evt, progress) => {
				const fileProgress = progress / num_instruments;
				const queueProgress = (num_instruments - pending) / num_instruments;
				onprogress && onprogress('load', fileProgress + queueProgress, instrumentId);
			}
			const onsuccess_inner = () => waitForEnd();
			sendRequest(instrumentId, audioFormat, onprogress_inner, onsuccess_inner, onerror);
		}
	};
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
			// console.log(xhr.responseText);
			script.text = xhr.responseText;
			document.body.appendChild(script);
			onsuccess();
		} else {
			onerror();
		}
	};
	xhr.send();
};

export const playChannel = (...options) => {
	return config.connected_plugin.playChannel(...options);
}

export const stopChannel = (...options) => {
	return config.connected_plugin.stopChannel(...options);
}

// TODO: audioBuffers

export const send = (...options) => {
	return config.connected_plugin.send(...options);
}
export const setController = (...options) => {
	return config.connected_plugin.setController(...options);
}
export const setVolume = (...options) => {
	return config.connected_plugin.setVolume(...options);
}
export const programChange = (...options) => {
	return config.connected_plugin.programChange(...options);
}
export const pitchBend = (...options) => {
	return config.connected_plugin.pitchBend(...options);
}
export const noteOn = (...options) => {
	return config.connected_plugin.noteOn(...options);
}
export const noteOff = (...options) => {
	return config.connected_plugin.noteOff(...options);
}

export const chordOn = (...options) => {
	return config.connected_plugin.chordOn(...options);
}

export const chordOff = (...options) => {
	return config.connected_plugin.chordOff(...options);
}

export const stopAllNotes = (...options) => {
	return config.connected_plugin.stopAllNotes(...options);
}


export const setEffects = (...options) => {
	if (config.connected_plugin !== WebAudio) {
		return;
	}
	return config.connected_plugin.setEffects();
}

export const getContext = () => {
	if (config.connected_plugin !== WebAudio) {
		return;
	}
	return config.connected_plugin.getContext();
}


export const setContext = (...options) => {
	if (config.connected_plugin !== WebAudio) {
		return;
	}
	return config.connected_plugin.setContext(...options);
}


// Player

export class Player extends PlayInstance {
	constructor() {
		super(config.connected_plugin);
	}
	loadPlugin(...options) {
		return loadPlugin(...options);
	}
}
