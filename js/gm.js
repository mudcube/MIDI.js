/*
----------------------------------------------------------
GeneralMIDI
----------------------------------------------------------
*/

const GM_fixer = in_dict => {
    const asId = name => name.replace(/[^a-z0-9 ]/gi, '').replace(/ /g, '_').toLowerCase();
    const res = {
        byName: { },
        byId: { },
        byCategory: { },
    };
    for (const [key, list] of Object.entries(in_dict)) {
        for (const instrument of list) {
            if (!instrument) {
                continue;
            }
            const id = parseInt(instrument.substr(0, instrument.indexOf(' ')), 10);
            const programNumber = id - 1;
            const name = instrument.replace(id + ' ', '');
            const nameId = asId(name);
            const categoryId = asId(key);
            const spec = {
                id: nameId,
                name,
                program: programNumber,
                category: key,
            };
            res.byId[programNumber] = spec;
            res.byName[nameId] = spec;
            res.byCategory[categoryId] = res.byCategory[categoryId] || [];
            res.byCategory[categoryId].push(spec);
        }
    }
    return res;
};

export const GM = GM_fixer({
    'Piano': [
        '1 Acoustic Grand Piano',
        '2 Bright Acoustic Piano',
        '3 Electric Grand Piano',
        '4 Honky-tonk Piano',
        '5 Electric Piano 1',
        '6 Electric Piano 2',
        '7 Harpsichord',
        '8 Clavinet',
    ],
    'Chromatic Percussion': [
        '9 Celesta',
        '10 Glockenspiel',
        '11 Music Box',
        '12 Vibraphone',
        '13 Marimba',
        '14 Xylophone',
        '15 Tubular Bells',
        '16 Dulcimer',
    ],
    'Organ': [
        '17 Drawbar Organ',
        '18 Percussive Organ',
        '19 Rock Organ',
        '20 Church Organ',
        '21 Reed Organ',
        '22 Accordion',
        '23 Harmonica',
        '24 Tango Accordion',
    ],
    'Guitar': [
        '25 Acoustic Guitar (nylon)',
        '26 Acoustic Guitar (steel)',
        '27 Electric Guitar (jazz)',
        '28 Electric Guitar (clean)',
        '29 Electric Guitar (muted)',
        '30 Overdriven Guitar',
        '31 Distortion Guitar',
        '32 Guitar Harmonics',
    ],
    'Bass': [
        '33 Acoustic Bass',
        '34 Electric Bass (finger)',
        '35 Electric Bass (pick)',
        '36 Fretless Bass',
        '37 Slap Bass 1',
        '38 Slap Bass 2',
        '39 Synth Bass 1',
        '40 Synth Bass 2',
    ],
    'Strings': [
        '41 Violin',
        '42 Viola',
        '43 Cello',
        '44 Contrabass',
        '45 Tremolo Strings',
        '46 Pizzicato Strings',
        '47 Orchestral Harp',
        '48 Timpani', // ??
    ],
    'Ensemble': [
        '49 String Ensemble 1',
        '50 String Ensemble 2',
        '51 Synth Strings 1',
        '52 Synth Strings 2',
        '53 Choir Aahs',
        '54 Voice Oohs',
        '55 Synth Choir',
        '56 Orchestra Hit',
    ],
    'Brass': [
        '57 Trumpet',
        '58 Trombone',
        '59 Tuba',
        '60 Muted Trumpet',
        '61 French Horn',
        '62 Brass Section',
        '63 Synth Brass 1',
        '64 Synth Brass 2',
    ],
    'Reed': [
        '65 Soprano Sax',
        '66 Alto Sax',
        '67 Tenor Sax',
        '68 Baritone Sax',
        '69 Oboe',
        '70 English Horn',
        '71 Bassoon',
        '72 Clarinet',
    ],
    'Pipe': [
        '73 Piccolo',
        '74 Flute',
        '75 Recorder',
        '76 Pan Flute',
        '77 Blown Bottle',
        '78 Shakuhachi',
        '79 Whistle',
        '80 Ocarina',
    ],
    'Synth Lead': [
        '81 Lead 1 (square)',
        '82 Lead 2 (sawtooth)',
        '83 Lead 3 (calliope)',
        '84 Lead 4 (chiff)',
        '85 Lead 5 (charang)',
        '86 Lead 6 (voice)',
        '87 Lead 7 (fifths)',
        '88 Lead 8 (bass + lead)',
    ],
    'Synth Pad': [
        '89 Pad 1 (new age)',
        '90 Pad 2 (warm)',
        '91 Pad 3 (polysynth)',
        '92 Pad 4 (choir)',
        '93 Pad 5 (bowed)',
        '94 Pad 6 (metallic)',
        '95 Pad 7 (halo)',
        '96 Pad 8 (sweep)',
    ],
    'Synth Effects': [
        '97 FX 1 (rain)',
        '98 FX 2 (soundtrack)',
        '99 FX 3 (crystal)',
        '100 FX 4 (atmosphere)',
        '101 FX 5 (brightness)',
        '102 FX 6 (goblins)',
        '103 FX 7 (echoes)',
        '104 FX 8 (sci-fi)',
    ],
    'Ethnic': [
        '105 Sitar',
        '106 Banjo',
        '107 Shamisen',
        '108 Koto',
        '109 Kalimba',
        '110 Bagpipe',
        '111 Fiddle',
        '112 Shanai',
    ],
    'Percussive': [
        '113 Tinkle Bell',
        '114 Agogo',
        '115 Steel Drums',
        '116 Woodblock',
        '117 Taiko Drum',
        '118 Melodic Tom',
        '119 Synth Drum',
    ],
    'Sound effects': [
        '120 Reverse Cymbal',
        '121 Guitar Fret Noise',
        '122 Breath Noise',
        '123 Seashore',
        '124 Bird Tweet',
        '125 Telephone Ring',
        '126 Helicopter',
        '127 Applause',
        '128 Gunshot',
    ],
});

/* channels
--------------------------------------------------- */
const get_channels = () => { // 0 - 15 channels
    const channels = {};
    for (let i = 0; i < 16; i++) {
        channels[i] = { // default values
            program: i,
            pitchBend: 0,
            mute: false,
            mono: false,
            omni: false,
            solo: false,
        };
    }
    return channels;
};

export const channels = get_channels();



/* get/setInstrument
--------------------------------------------------- */
export const getProgram = (channelId) => {
    const channel = channels[channelId];
    return channel && channel.program;
};

export const setProgram = (channelId, program, delay) => {
    const channel = channels[channelId];
    if (delay) {
        return setTimeout(() => {
            channel.program = program;
        }, delay);
    } else {
        channel.program = program;
    }
    return undefined;
};

/* get/setMono
--------------------------------------------------- */
export const getMono = (channelId) => {
    const channel = channels[channelId];
    return channel && channel.mono;
};

export const setMono = (channelId, truthy, delay) => {
    const channel = channels[channelId];
    if (delay) {
        return setTimeout(() => {
            channel.mono = truthy;
        }, delay);
    } else {
        channel.mono = truthy;
    }
    return undefined;
};

/* get/setOmni
--------------------------------------------------- */
export const getOmni = (channelId) => {
    const channel = channels[channelId];
    return channel && channel.omni;
};

export const setOmni = (channelId, truthy, delay) => {
    const channel = channels[channelId];
    if (delay) {
        return setTimeout(() => {
            channel.omni = truthy;
        }, delay);
    } else {
        channel.omni = truthy;
    }
    return undefined;
};

/* get/setSolo
--------------------------------------------------- */
export const getSolo = channelId => {
    const channel = channels[channelId];
    return channel && channel.solo;
};

export const setSolo = (channelId, truthy, delay) => {
    const channel = channels[channelId];
    if (delay) {
        return setTimeout(() => {
            channel.solo = truthy;
        }, delay);
    } else {
        channel.solo = truthy;
    }
    return undefined;
};


/* note conversions
--------------------------------------------------- */
export const keyToNote = {}; // C8  == 108
export const noteToKey = {}; // 108 ==  C8

(function helper_set_mapping() {
    const A0 = 0x15; // first note
    const C8 = 0x6C; // last note
    const number2key = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    for (let n = A0; n <= C8; n++) {
        const octave = Math.floor((n - 12) / 12);
        const name = number2key[n % 12] + octave;
        keyToNote[name] = n;
        noteToKey[n] = name;
    }
}());
