/*
	----------------------------------------------------------
	MIDI/loader : 2015-12-22 : https://mudcu.be
	----------------------------------------------------------
	https://github.com/mudcube/MIDI.js
	----------------------------------------------------------
*/

if (typeof MIDI === 'undefined') MIDI = {};

(function (MIDI) { 'use strict';


	/** globals **/
	MIDI.DEBUG = false;
	MIDI.USE_XHR = true;
	MIDI.PATH = './soundfont/';

	if (MIDI.DEBUG && console && console.log) {
		console.log('%c♥ MIDI.js 0.4.2 ♥', 'color: red;');
	}

	/** priorities **/
	var _adaptorPriority = {
		'midiapi': 0,
		'audioapi': 1,
		'audio': 2
	};

	var _formatPriority = {
		'ogg': 0,
		'mp3': 1
	};

	/** setup **/
	MIDI.setup = function (args) {
		return new Promise(function (resolve, reject) {
			args = args || {};
			if (typeof args === 'function') args = {onsuccess: args};

			if (isFinite(args.debug)) {
				MIDI.DEBUG = !!args.debug;
			}

			/* custom paths */
			if (args.soundfontUrl) {
				MIDI.PATH = args.soundfontUrl;
			}

			/* choose adaptor */
			AudioSupports().then(function (supports) {
				if (chooseFormat()) {
					chooseAdaptor();
				} else {
					reject({
						message: 'MIDIJS: Browser does not have necessary audio support.'
					});
				}

				function chooseFormat() {

					/* empty object */
					for (var key in MIDI.adaptor) {
						delete MIDI.adaptor[key];
					}

					/* choose format based on priority */
					for (var format in _formatPriority) {
						if (supports[format]) {
							MIDI.adaptor.format = format;
							return true; // yay!...
						}
					}
				}

				function chooseAdaptor() {
					if (supports[location.hash.substr(1)]) {
						loadAdaptor(location.hash.substr(1));
					} else if (supports.midi_api) {
						loadAdaptor('midiapi');
					} else if (window.AudioContext) {
						loadAdaptor('audioapi');
					} else if (window.Audio) {
						loadAdaptor('Audio');
					}
				}

				function loadAdaptor(tech) {
					tech = tech.toLowerCase();
					var format = MIDI.adaptor.format;
					var canPlayThrough = supports[tech];
//					console.log("loadAdaptor", tech, format, canPlayThrough, supports);
					if (!canPlayThrough[format]) {
						handleError();
						return;
					}

					args.tech = tech;

					MIDI.loadProgram(args).then(function () {
						resolve();
					}).catch(function (err) {
						MIDI.DEBUG && console.error(tech, err);
						handleError(err);
					});

					function handleError(err) {
						var idx = parseInt(_adaptorPriority[tech]) + 1;
						var nextAdaptor = Object.keys(_adaptorPriority)[idx];
						if (nextAdaptor) {
							loadAdaptor(nextAdaptor);
						} else {
							reject && reject({
								message: 'All plugins failed.'
							});
						}
					}
				}
			}, reject);
		});
	};


	/** loadProgram **/
	MIDI.loadProgram = function (args) {
		args || (args = {});
		typeof args === 'object' || (args = {instrument: args});
		args.instruments = instrumentList();
		args.tech = args.tech || MIDI.adaptor.id;

		return MIDI.adaptors._load(args);

		/* helpers */
		function instrumentList() {
			var programs = args.instruments || args.instrument || MIDI.channels[0].program;
			if (typeof programs === 'object') {
				Array.isArray(programs) || (programs = Object.keys(programs));
			} else {
				if (programs === undefined) {
					programs = [];
				} else {
					programs = [programs];
				}
			}

			/* program number -> id */
			for (var n = 0; n < programs.length; n ++) {
				var programId = programs[n];
				if (programId >= 0) {
					var program = MIDI.getProgram(programId);
					if (program) {
						programs[n] = program.nameId;
					}
				}
			}
			if (programs.length === 0) {
				programs = ['acoustic_grand_piano'];
			}
			return programs;
		}
	};

})(MIDI);