/*jshint unused:false */

//    Teoria.js
//    http://saebekassebil.github.com/teoria
//    Copyright Jakob Miland (saebekassebil)
//    Teoria may be freely distributed under the MIT License.

(function teoriaClosure() {
  'use strict';

  var teoria = {};

  var kNotes = {
    'c': {
      name: 'c',
      distance: 0,
      index: 0
    },
    'd': {
      name: 'd',
      distance: 2,
      index: 1
    },
    'e': {
      name: 'e',
      distance: 4,
      index: 2
    },
    'f': {
      name: 'f',
      distance: 5,
      index: 3
    },
    'g': {
      name: 'g',
      distance: 7,
      index: 4
    },
    'a': {
      name: 'a',
      distance: 9,
      index: 5
    },
    'b': {
      name: 'b',
      distance: 11,
      index: 6
    },
    'h': {
      name: 'h',
      distance: 11,
      index: 6
    }
  };

  var kNoteIndex = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];

  var kDurations = {
    '0.25': 'longa',
    '0.5': 'breve',
    '1': 'whole',
    '2': 'half',
    '4': 'quarter',
    '8': 'eighth',
    '16': 'sixteenth',
    '32': 'thirty-second',
    '64': 'sixty-fourth',
    '128': 'hundred-twenty-eighth'
  };

  var kIntervals = [{
    name: 'first',
    quality: 'perfect',
    size: 0
  }, {
    name: 'second',
    quality: 'minor',
    size: 1
  }, {
    name: 'third',
    quality: 'minor',
    size: 3
  }, {
    name: 'fourth',
    quality: 'perfect',
    size: 5
  }, {
    name: 'fifth',
    quality: 'perfect',
    size: 7
  }, {
    name: 'sixth',
    quality: 'minor',
    size: 8
  }, {
    name: 'seventh',
    quality: 'minor',
    size: 10
  }, {
    name: 'octave',
    quality: 'perfect',
    size: 12
  }];

  var kIntervalIndex = {
    'first': 0, 'second': 1, 'third': 2, 'fourth': 3,
    'fifth': 4, 'sixth': 5, 'seventh': 6, 'octave': 7,
    'ninth': 8, 'tenth': 9, 'eleventh': 10, 'twelfth': 11,
    'thirteenth': 12, 'fourteenth': 13, 'fifteenth': 14
  };

  var kQualityLong = {
    'P': 'perfect',
    'M': 'major',
    'm': 'minor',
    '-': 'minor',
    'A': 'augmented',
    '+': 'augmented',
    'AA': 'doubly augmented',
    'd': 'diminished',
    'dd': 'doubly diminished',

    'min': 'minor',
    'aug': 'augmented',
    'dim': 'diminished'
  };

  var kQualityTemp = {
    'perfect': 'P',
    'major': 'M',
    'minor': 'm',
    'augmented': 'A',
    'doubly augmented': 'AA',
    'diminished': 'd',
    'doubly diminished': 'dd'
  };

  var kValidQualities = {
    perfect: {
      'doubly diminished': -2,
      diminished: -1,
      perfect: 0,
      augmented: 1,
      'doubly augmented': 2
    },

    minor: {
      'doubly diminished': -2,
      diminished: -1,
      minor: 0,
      major: 1,
      augmented: 2,
      'doubly augmented': 3
    }
  };

  var kQualityInversion = {
    'perfect': 'perfect',
    'major': 'minor',
    'minor': 'major',
    'augmented': 'diminished',
    'doubly augmented': 'doubly diminished',
    'diminished': 'augmented',
    'doubly diminished': 'doubly augmented'
  };

  var kAlterations = {
    perfect: ['doubly diminished', 'diminished', 'perfect',
              'augmented', 'doubly augmented'],

    minor: ['doubly diminished', 'diminished', 'minor',
            'major', 'augmented', 'doubly augmented']
  };

  var kSymbols = {
    'min': ['m3', 'P5'],
    'm': ['m3', 'P5'],
    '-': ['m3', 'P5'],

    'M': ['M3', 'P5'],
    '': ['M3', 'P5'],

    '+': ['M3', 'A5'],
    'aug': ['M3', 'A5'],

    'dim': ['m3', 'd5'],
    'o': ['m3', 'd5'],

    'maj': ['M3', 'P5', 'M7'],
    'dom': ['M3', 'P5', 'm7'],
    'Ã¸': ['m3', 'd5', 'm7']
  };

  var kChordShort = {
    'major': 'M',
    'minor': 'm',
    'augmented': 'aug',
    'diminished': 'dim',
    'power': '5'
  };

  var kAccidentalSign = {
    '-2': 'bb',
    '-1': 'b',
    '0': '',
    '1': '#',
    '2': 'x'
  };

  var kAccidentalValue = {
    'bb': -2,
    'b': -1,
    '#': 1,
    'x': 2
  };

  var kStepNumber = {
    'first': '1',
    'tonic': '1',
    'second': '2',
    'third': '3',
    'fourth': '4',
    'fifth': '5',
    'sixth': '6',
    'seventh': '7',
    'ninth': '9',
    'eleventh': '11',
    'thirteenth': '13'
  };

  // Adjusted Shearer syllables - Chromatic solfege system
  // Some intervals are not provided for. These include:
  // dd2 - Doubly diminished second
  // dd3 - Doubly diminished third
  // AA3 - Doubly augmented third
  // dd6 - Doubly diminished sixth
  // dd7 - Doubly diminished seventh
  // AA7 - Doubly augmented seventh
  var kIntervalSolfege = {
    'dd1': 'daw',
    'd1': 'de',
    'P1': 'do',
    'A1': 'di',
    'AA1': 'dai',
    'd2': 'raw',
    'm2': 'ra',
    'M2': 're',
    'A2': 'ri',
    'AA2': 'rai',
    'd3': 'maw',
    'm3': 'me',
    'M3': 'mi',
    'A3': 'mai',
    'dd4': 'faw',
    'd4': 'fe',
    'P4': 'fa',
    'A4': 'fi',
    'AA4': 'fai',
    'dd5': 'saw',
    'd5': 'se',
    'P5': 'so',
    'A5': 'si',
    'AA5': 'sai',
    'd6': 'law',
    'm6': 'le',
    'M6': 'la',
    'A6': 'li',
    'AA6': 'lai',
    'd7': 'taw',
    'm7': 'te',
    'M7': 'ti',
    'A7': 'tai',
    'dd8': 'daw',
    'd8': 'de',
    'P8': 'do',
    'A8': 'di',
    'AA8': 'dai'
  };
  /**
   * getDistance, returns the distance in semitones between two notes
   */
  function getDistance(from, to) {
    from = kNotes[from];
    to = kNotes[to];
    if (from.distance > to.distance) {
      return (to.distance + 12) - from.distance;
    } else {
      return to.distance - from.distance;
    }
  }

  function pad(str, ch, len) {
    for (; len > 0; len--) {
      str += ch;
    }

    return str;
  }

  // teoria.note namespace - All notes should be instantiated
  // through this function.
  teoria.note = function(name, duration) {
    return new TeoriaNote(name, duration);
  };

  teoria.note.fromKey = function(key) {
    var octave = Math.floor((key - 4) / 12);
    var distance = key - (octave * 12) - 4;
    var note = kNotes[kNoteIndex[Math.round(distance / 2)]];
    var name = note.name;
    if (note.distance < distance) {
      name += '#';
    } else if (note.distance > distance) {
      name += 'b';
    }

    return teoria.note(name + (octave + 1));
  };

  teoria.note.fromFrequency = function(fq, concertPitch) {
    var key, cents, originalFq;
    concertPitch = concertPitch || 440;

    key = 49 + 12 * ((Math.log(fq) - Math.log(concertPitch)) / Math.log(2));
    key = Math.round(key);
    originalFq = concertPitch * Math.pow(2, (key - 49) / 12);
    cents = 1200 * (Math.log(fq / originalFq) / Math.log(2));

    return {note: teoria.note.fromKey(key), cents: cents};
  };

  teoria.note.fromMIDI = function(note) {
    return teoria.note.fromKey(note - 20);
  };

  // teoria.chord namespace - All chords should be instantiated
  // through this function.
  teoria.chord = function(name, symbol) {
    if (typeof name === 'string') {
      var root, octave;
      root = name.match(/^([a-h])(x|#|bb|b?)/i);
      if (root && root[0]) {
        octave = typeof symbol === 'number' ? symbol.toString(10) : '4';
        return new TeoriaChord(teoria.note(root[0].toLowerCase() + octave),
                              name.substr(root[0].length));
      }
    } else if (name instanceof TeoriaNote) {
      return new TeoriaChord(name, symbol || '');
    }

    throw new Error('Invalid Chord. Couldn\'t find note name');
  };

  /**
   * teoria.interval
   *
   * Sugar function for #from and #between methods, with the possibility to
   * declare a interval by its string name: P8, M3, m7 etc.
   */
  teoria.interval = function(from, to, direction) {
    var quality, intervalNumber, interval, match;

    // Construct a TeoriaInterval object from string representation
    if (typeof from === 'string') {
      match = from.match(/^(AA|A|P|M|m|d|dd)(-?\d+)$/);
      if (!match) {
        throw new Error('Invalid string-interval format');
      }

      quality = kQualityLong[match[1]];
      intervalNumber = parseInt(match[2], 10);

      // Uses the second argument 'to', as direction
      direction = to === 'down' || intervalNumber < 0 ? 'down' : 'up';

      return new TeoriaInterval(Math.abs(intervalNumber), quality, direction);
    }

    if (typeof to === 'string' && from instanceof TeoriaNote) {
      interval = teoria.interval(to, direction);

      return teoria.interval.from(from, interval);
    } else if (to instanceof TeoriaNote && from instanceof TeoriaNote) {
      return teoria.interval.between(from, to);
    } else {
      throw new Error('Invalid parameters');
    }
  };

  /**
   * Returns the note from a given note (from), with a given interval (to)
   */
  teoria.interval.from = function(from, to) {
    var note, diff, octave, index, dist, intval, dir;
    dir = (to.direction === 'down') ? -1 : 1;

    intval = to.simpleInterval - 1;
    intval = dir * intval;

    index = kNotes[from.name].index + intval;

    if (index > kNoteIndex.length - 1) {
      index = index - kNoteIndex.length;
    } else if (index < 0) {
      index = index + kNoteIndex.length;
    }

    note = kNoteIndex[index];
    dist = getDistance(from.name, note);

    if (dir > 0) {
      diff = to.simpleIntervalType.size + to.qualityValue() - dist;
    } else {
      diff = getDistance(note, from.name) -
        (to.simpleIntervalType.size + to.qualityValue());
    }
    diff += from.accidental.value;

    octave = Math.floor((from.key() - from.accidental.value + dist - 4) / 12);
    octave += 1 + dir * to.compoundOctaves;

    if (diff >= 10) {
      diff -= 12;
    } else if (diff <= -10) {
      diff += 12;
    }

    if (to.simpleInterval === 8) {
      octave += dir;
    } else if (dir < 0) {
      octave--;
    }

    note += kAccidentalSign[diff];
    return teoria.note(note + octave.toString(10));
  };

  /**
   * Returns the interval between two instances of teoria.note
   */
  teoria.interval.between = function(from, to) {
    var semitones, interval, intervalInt, quality,
        alteration, direction = 'up', dir = 1;

    semitones = to.key() - from.key();
    intervalInt = to.key(true) - from.key(true);

    if (intervalInt < 0) {
      intervalInt = -intervalInt;
      direction = 'down';
      dir = -1;
    }

    interval = kIntervals[intervalInt % 7];
    alteration = kAlterations[interval.quality];
    quality = alteration[(dir * semitones - interval.size + 2) % 12];

    return new TeoriaInterval(intervalInt + 1, quality, direction);
  };

  teoria.interval.invert = function(sInterval) {
    return teoria.interval(sInterval).invert().toString();
  };

  // teoria.scale namespace - Scales are constructed through this function.
  teoria.scale = function(tonic, scale) {
    if (!(tonic instanceof TeoriaNote)) {
      tonic = teoria.note(tonic);
    }

    return new TeoriaScale(tonic, scale);
  };

  teoria.scale.scales = {};

  /**
   * TeoriaNote - teoria.note - the note object
   *
   * This object is the representation of a note.
   * The constructor must be called with a name,
   * and optionally a duration argument.
   * The first parameter (name) can be specified in either
   * scientific notation (name+accidentals+octave). Fx:
   *    A4 - Cb3 - D#8 - Hbb - etc.
   * Or in the Helmholtz notation:
   *    C,, - f#'' - d - Eb - etc.
   * The second argument must be an object literal, with a
   * 'value' property and/or a 'dots' property. By default,
   * the duration value is 4 (quarter note) and dots is 0.
   */
  function TeoriaNote(name, duration) {
    if (typeof name !== 'string') {
      return null;
    }

    duration = duration || {};

    this.name = name;
    this.duration = {value: duration.value || 4, dots: duration.dots || 0};
    this.accidental = {value: 0, sign: ''};
    var scientific = /^([a-h])(x|#|bb|b?)(-?\d*)/i;
    var helmholtz = /^([a-h])(x|#|bb|b?)([,\']*)$/i;
    var accidentalSign, accidentalValue, noteName, octave;

    // Start trying to parse scientific notation
    var parser = name.match(scientific);
    if (parser && name === parser[0] && parser[3].length !== 0) { // Scientific
      noteName = parser[1].toLowerCase();
      octave = parseInt(parser[3], 10);

      if (parser[2].length > 0) {
        accidentalSign = parser[2].toLowerCase();
        accidentalValue = kAccidentalValue[parser[2]];
      }
    } else { // Helmholtz Notation
      name = name.replace(/\u2032/g, "'").replace(/\u0375/g, ',');

      parser = name.match(helmholtz);
      if (!parser || name !== parser[0]) {
        throw new Error('Invalid note format');
      }

      noteName = parser[1];
      octave = parser[3];
      if (parser[2].length > 0) {
        accidentalSign = parser[2].toLowerCase();
        accidentalValue = kAccidentalValue[parser[2]];
      }

      if (octave.length === 0) { // no octave symbols
        octave = (noteName === noteName.toLowerCase()) ? 3 : 2;
      } else {
        if (octave.match(/^'+$/)) {
          if (noteName === noteName.toUpperCase()) { // If upper-case
            throw new Error('Format must respect the Helmholtz notation');
          }

          octave = 3 + octave.length;
        } else if (octave.match(/^,+$/)) {
          if (noteName === noteName.toLowerCase()) { // If lower-case
            throw new Error('Format must respect the Helmholtz notation');
          }

          octave = 2 - octave.length;
        } else {
          throw new Error('Invalid characters after note name.');
        }
      }
    }

    this.name = noteName.toLowerCase();
    this.octave = octave;

    if (accidentalSign) {
      this.accidental.value = accidentalValue;
      this.accidental.sign = accidentalSign;
    }
  }

  TeoriaNote.prototype = {
    /**
     * Returns the key number of the note
     */
    key: function(whitenotes) {
      var noteValue;
      if (whitenotes) {
        noteValue = Math.ceil(kNotes[this.name].distance / 2);
        return (this.octave - 1) * 7 + 3 + noteValue;
      } else {
        noteValue = kNotes[this.name].distance + this.accidental.value;
        return (this.octave - 1) * 12 + 4 + noteValue;
      }
    },

    /**
     * Calculates and returns the frequency of the note.
     * Optional concert pitch (def. 440)
     */
    fq: function(concertPitch) {
      concertPitch = concertPitch || 440;

      return concertPitch * Math.pow(2, (this.key() - 49) / 12);
    },

    /**
     * Returns the pitch class index (chroma) of the note
     */
    chroma: function() {
      var value = (kNotes[this.name].distance + this.accidental.value) % 12;
      return (value < 0) ? value + 12 : value;
    },

    /**
     * Sugar function for teoria.scale(note, scale)
     */
    scale: function(scale) {
      return teoria.scale(this, scale);
    },

    /**
     * Sugar function for teoria.interval(note, interval[, direction])
     */
    interval: function(interval, direction) {
      return teoria.interval(this, interval, direction);
    },

    /**
     * Transposes the note, returned by TeoriaNote#interval
     */
    transpose: function(interval, direction) {
      var note = teoria.interval(this, interval, direction);
      this.name = note.name;
      this.octave = note.octave;
      this.accidental = note.accidental;

      return this;
    },

    /**
     * Returns a TeoriaChord object with this note as root
     */
    chord: function(chord) {
      chord = chord || 'major';
      if (chord in kChordShort) {
        chord = kChordShort[chord];
      }

      return new TeoriaChord(this, chord);
    },

    /**
     * Returns the Helmholtz notation form of the note (fx C,, d' F# g#'')
     */
    helmholtz: function() {
      var name = (this.octave < 3) ? this.name.toUpperCase() :
                                     this.name.toLowerCase();
      var paddingChar = (this.octave < 3) ? ',' : '\'';
      var paddingCount = (this.octave < 2) ? 2 - this.octave : this.octave - 3;

      return pad(name + this.accidental.sign, paddingChar, paddingCount);
    },

    /**
     * Returns the scientific notation form of the note (fx E4, Bb3, C#7 etc.)
     */
    scientific: function() {
      return this.name.toUpperCase() + this.accidental.sign + this.octave;
    },

    /**
     * Returns notes that are enharmonic with this note.
     */
    enharmonics: function() {
      var enharmonics = [], key = this.key(),
      upper = this.interval('m2', 'up'), lower = this.interval('m2', 'down');
      var upperKey = upper.key() - upper.accidental.value;
      var lowerKey = lower.key() - lower.accidental.value;
      var diff = key - upperKey;
      if (diff < 3 && diff > -3) {
        upper.accidental = {value: diff, sign: kAccidentalSign[diff]};
        enharmonics.push(upper);
      }

      diff = key - lowerKey;
      if (diff < 3 && diff > -3) {
        lower.accidental = {value: diff, sign: kAccidentalSign[diff]};
        enharmonics.push(lower);
      }

      return enharmonics;
    },

    solfege: function(scale, showOctaves) {
      if (!(scale instanceof TeoriaScale)) {
        throw new Error('Invalid Scale');
      }

      var interval = scale.tonic.interval(this), solfege, stroke, count;
      if (interval.direction === 'down') {
        interval = interval.invert();
      }

      if (showOctaves) {
        count = (this.key(true) - scale.tonic.key(true)) / 7;
        count = (count >= 0) ? Math.floor(count) : -(Math.ceil(-count));
        stroke = (count >= 0) ? '\'' : ',';
      }

      solfege = kIntervalSolfege[interval.simple(true)];
      return (showOctaves) ? pad(solfege, stroke, Math.abs(count)) : solfege;
    },

    /**
     * Returns the name of the duration value,
     * such as 'whole', 'quarter', 'sixteenth' etc.
     */
    durationName: function() {
      return kDurations[this.duration.value];
    },

    /**
     * Returns the duration of the note (including dots)
     * in seconds. The first argument is the tempo in beats
     * per minute, the second is the beat unit (i.e. the
     * lower numeral in a time signature).
     */
    durationInSeconds: function(bpm, beatUnit) {
      var secs = (60 / bpm) / (this.duration.value / 4) / (beatUnit / 4);
      return secs * 2 - secs / Math.pow(2, this.duration.dots);
    },

    /**
     * Returns the degree of this note in a given scale
     * If the scale doesn't contain this note, the scale degree
     * will be returned as 0 allowing for expressions such as:
     * if (teoria.note('a').scaleDegree(teoria.scale('a', 'major'))) {
     *   ...
     * }
     *
     * as 0 evaluates to false in boolean context
     **/
    scaleDegree: function(scale) {
      var interval = scale.tonic.interval(this);
      interval = (interval.direction === 'down' ||
                  interval.simpleInterval === 8) ? interval.invert() : interval;

      return scale.scale.indexOf(interval.simple(true)) + 1;
    },

    /**
     * Returns the name of the note, with an optional display of octave number
     */
    toString: function(dontShow) {
      var octave = dontShow ? '' : this.octave;
      return this.name.toLowerCase() + this.accidental.sign + octave;
    }
  };


  function TeoriaInterval(intervalNum, quality, direction) {
    var simple = (intervalNum >= 8 && intervalNum % 7 === 1) ?
          intervalNum % 7 * 8 : ((intervalNum - 1) % 7) + 1;
    var compoundOctaves = Math.ceil((intervalNum - simple) / 8);
    var simpleIntervalType = kIntervals[simple - 1];


    if (!(quality in kValidQualities[simpleIntervalType.quality])) {
      throw new Error('Invalid interval quality');
    }

    this.interval = intervalNum;
    this.quality = quality;
    this.direction = direction === 'down' ? 'down' : 'up';
    this.simpleInterval = simple;
    this.simpleIntervalType = simpleIntervalType;
    this.compoundOctaves = compoundOctaves;
  }

  TeoriaInterval.prototype = {
    semitones: function() {
      return this.simpleIntervalType.size + this.qualityValue() +
              this.compoundOctaves * 12;
    },

    simple: function(ignore) {
      var intval = this.simpleInterval;
      intval = (this.direction === 'down' && !ignore) ? -intval : intval;

      return kQualityTemp[this.quality] + intval.toString();
    },

    compound: function(ignore) {
      var intval = this.simpleInterval + this.compoundOctaves * 7;
      intval = (this.direction === 'down' && !ignore) ? -intval : intval;

      return kQualityTemp[this.quality] + intval.toString();
    },

    isCompound: function() {
      return this.compoundOctaves > 0;
    },

    invert: function() {
      var intervalNumber = this.simpleInterval;

      intervalNumber = 9 - intervalNumber;

      return new TeoriaInterval(intervalNumber,
                                kQualityInversion[this.quality], this.direction);
    },

    qualityValue: function() {
      var defQuality = this.simpleIntervalType.quality, quality = this.quality;

      return kValidQualities[defQuality][quality];
    },

    equal: function(interval) {
      return this.interval === interval.interval &&
             this.quality === interval.quality;
    },

    greater: function(interval) {
      var thisSemitones = this.semitones();
      var thatSemitones = interval.semitones();

      // If equal in absolute size, measure which interval is bigger
      // For example P4 is bigger than A3
      return (thisSemitones === thatSemitones) ?
        (this.interval > interval.interval) : (thisSemitones > thatSemitones);
    },

    smaller: function(interval) {
      return !this.equal(interval) && !this.greater(interval);
    },

    toString: function() {
      return this.compound();
    }
  };


  function TeoriaChord(root, name) {
    if (!(root instanceof TeoriaNote)) {
      return null;
    }

    name = name || '';
    this.name = root.name.toUpperCase() + root.accidental.sign + name;
    this.symbol = name;
    this.root = root;
    this.intervals = [];
    this._voicing = [];

    var i, length, c, strQuality, parsing = 'quality', additionals = [],
        notes = ['P1', 'M3', 'P5', 'm7', 'M9', 'P11', 'M13'],
        chordLength = 2, bass, symbol;

    function setChord(intervals) {
      for (var n = 0, chordl = intervals.length; n < chordl; n++) {
        notes[n + 1] = intervals[n];
      }

      chordLength = intervals.length;
    }

    // Remove whitespace, commas and parentheses
    name = name.replace(/[,\s\(\)]/g, '');
    bass = name.split('/');
    if (bass.length === 2) {
      name = bass[0];
      bass = bass[1];
    } else {
      bass = null;
    }

    for (i = 0, length = name.length; i < length; i++) {
      if (!(c = name[i])) {
        break;
      }

      switch (parsing) {
        // Parses for the "base" chord, either a triad or a seventh chord
        case 'quality':
          strQuality = ((i + 3) <= length) ? name.substr(i, 3) : null;
          symbol = (strQuality in kSymbols) ?
            strQuality : (c in kSymbols) ? c : '';

          setChord(kSymbols[symbol]);

          i += symbol.length - 1;
          parsing = 'extension';
          break;

        // Parses for the top interval or a pure sixth
        case 'extension':
          c = (c === '1' && name[i + 1]) ?
            parseFloat(name.substr(i, 2)) : parseFloat(c);

          if (!isNaN(c) && c !== 6) {
            chordLength = (c - 1) / 2;

            if (chordLength !== Math.round(chordLength)) {
              throw new Error('Invalid interval extension: ' + c.toString(10));
            }

            // Special care for diminished chords
            if (symbol === 'o' || symbol === 'dim') {
              notes[3] = 'd7';
            }

            i += String(c).length - 1;
          } else if (c === 6) {
            notes[3] = 'M6';
            chordLength = (chordLength < 3) ? 3 : chordLength;
          } else {
            i -= 1;
          }

          parsing = 'alterations';
          break;

        // Parses for possible alterations of intervals (#5, b9, etc.)
        case 'alterations':
          var alterations = name.substr(i).split(/(#|b|add|maj|sus|M)/),
              next, flat = false, sharp = false;

          if (alterations.length === 1) {
            throw new Error('Invalid alterations');
          } else if (alterations[0].length !== 0) {
            throw new Error('Invalid token: \'' + alterations[0] + '\'');
          }

          for (var a = 1, aLength = alterations.length; a < aLength; a++) {
            next = alterations[a + 1];

            switch (alterations[a]) {
            case 'M':
            case 'maj':
              chordLength = (chordLength < 3) ? 3 : chordLength;

              if (next === '7') { // Ignore the seventh, that is already implied
                a++;
              }

              notes[3] = 'M7';
              break;

            case 'sus':
              var type = 'P4';
              if (next === '2' || next === '4') {
                a++;

                if (next === '2') {
                  type = 'M2';
                }
              }

              notes[1] = type; // Replace third with M2 or P4
              break;

            case 'add':
              if (next && !isNaN(parseInt(next, 10))) {
                if (next === '9') {
                  additionals.push('M9');
                } else if (next === '11') {
                  additionals.push('P11');
                } else if (next === '13') {
                  additionals.push('M13');
                }

                a += next.length;
              }
              break;

            case 'b':
              flat = true;
              break;

            case '#':
              sharp = true;
              break;

            default:
              if (alterations[a].length === 0) {
                break;
              }

              var token = parseInt(alterations[a], 10), quality,
                  interval = parseInt(alterations[a], 10), intPos;
              if (isNaN(token) ||
                  String(token).length !== alterations[a].length) {
                throw new Error('Invalid token: \'' + alterations[a] + '\'');
              }

              if (token === 6) {
                if (sharp) {
                  notes[3] = 'A6';
                } else if (flat) {
                  notes[3] = 'm6';
                } else {
                  notes[3] = 'M6';
                }

                chordLength = (chordLength < 3) ? 3 : chordLength;
                continue;
              }

              // Calculate the position in the 'note' array
              intPos = (interval - 1) / 2;
              if (chordLength < intPos) {
                chordLength = intPos;
              }

              if (interval < 5 || interval === 7 ||
                  intPos !== Math.round(intPos)) {
                throw new Error('Invalid interval alteration: ' +
                    interval.toString(10));
              }

              quality = notes[intPos][0];

              // Alterate the quality of the interval according the accidentals
              if (sharp) {
                if (quality === 'd') {
                  quality = 'm';
                } else if (quality === 'm') {
                  quality = 'M';
                } else if (quality === 'M' || quality === 'P') {
                  quality = 'A';
                }
              } else if (flat) {
                if (quality === 'A') {
                  quality = 'M';
                } else if (quality === 'M') {
                  quality = 'm';
                } else if (quality === 'm' || quality === 'P') {
                  quality = 'd';
                }
              }

              notes[intPos] = quality + interval;
              break;
            }
          }

          parsing = 'ended';
          break;
      }

      if (parsing === 'ended') {
        break;
      }
    }

    this.intervals = notes
      .slice(0, chordLength + 1)
      .concat(additionals)
      .map(function(i) { return teoria.interval(i); });

    for (i = 0, length = this.intervals.length; i < length; i++) {
      this._voicing[i] = this.intervals[i];
    }

    if (bass) {
      var intervals = this.intervals, bassInterval, inserted = 0, note;
      // Make sure the bass is atop of the root note
      note = teoria.note(bass + (root.octave + 1));

      bassInterval = teoria.interval.between(root, note);
      bass = bassInterval.simpleInterval;

      if (bassInterval.direction === 'up') {
        bassInterval = bassInterval.invert();
        bassInterval.direction = 'down';
      }

      this._voicing = [bassInterval];
      for (i = 0; i < length; i++) {
        if (intervals[i].interval === bass) {
          continue;
        }

        inserted++;
        this._voicing[inserted] = intervals[i];
      }
    }
  }

  TeoriaChord.prototype = {
    notes: function() {
      var voicing = this.voicing(), notes = [];

      for (var i = 0, length = voicing.length; i < length; i++) {
        notes.push(teoria.interval.from(this.root, voicing[i]));
      }

      return notes;
    },

    voicing: function(voicing) {
      // Get the voicing
      if (!voicing) {
        return this._voicing;
      }

      // Set the voicing
      this._voicing = [];
      for (var i = 0, length = voicing.length; i < length; i++) {
        this._voicing[i] = teoria.interval(voicing[i]);
      }

      return this;
    },

    resetVoicing: function() {
      this._voicing = this.intervals;
    },

    dominant: function(additional) {
      additional = additional || '';
      return new TeoriaChord(this.root.interval('P5'), additional);
    },

    subdominant: function(additional) {
      additional = additional || '';
      return new TeoriaChord(this.root.interval('P4'), additional);
    },

    parallel: function(additional) {
      additional = additional || '';
      var quality = this.quality();

      if (this.chordType() !== 'triad' || quality === 'diminished' ||
          quality === 'augmented') {
        throw new Error('Only major/minor triads have parallel chords');
      }

      if (quality === 'major') {
        return new TeoriaChord(this.root.interval('m3', 'down'), 'm');
      } else {
        return new TeoriaChord(this.root.interval('m3', 'up'));
      }
    },

    quality: function() {
      var third, fifth, seventh, intervals = this.intervals;

      for (var i = 0, length = intervals.length; i < length; i++) {
        if (intervals[i].interval === 3) {
          third = intervals[i];
        } else if (intervals[i].interval === 5) {
          fifth = intervals[i];
        } else if (intervals[i].interval === 7) {
          seventh = intervals[i];
        }
      }

      if (!third) {
        return;
      }

      third = (third.direction === 'down') ? third.invert() : third;
      third = third.simple();

      if (fifth) {
        fifth = (fifth.direction === 'down') ? fifth.invert() : fifth;
        fifth = fifth.simple();
      }

      if (seventh) {
        seventh = (seventh.direction === 'down') ? seventh.invert() : seventh;
        seventh = seventh.simple();
      }

      if (third === 'M3') {
        if (fifth === 'A5') {
          return 'augmented';
        } else if (fifth === 'P5') {
          return (seventh === 'm7') ? 'dominant' : 'major';
        }

        return 'major';
      } else if (third === 'm3') {
        if (fifth === 'P5') {
          return 'minor';
        } else if (fifth === 'd5') {
          return (seventh === 'm7') ? 'half-diminished' : 'diminished';
        }

        return 'minor';
      }
    },

    chordType: function() { // In need of better name
      var length = this.intervals.length, interval, has, invert, i, name;

      if (length === 2) {
        return 'dyad';
      } else if (length === 3) {
        has = {first: false, third: false, fifth: false};
        for (i = 0; i < length; i++) {
          interval = this.intervals[i];
          invert = interval.invert();
          if (interval.simpleIntervalType.name in has) {
            has[interval.simpleIntervalType.name] = true;
          } else if (invert.simpleIntervalType.name in has) {
            has[invert.simpleIntervalType.name] = true;
          }
        }

        name = (has.first && has.third && has.fifth) ? 'triad' : 'trichord';
      } else if (length === 4) {
        has = {first: false, third: false, fifth: false, seventh: false};
        for (i = 0; i < length; i++) {
          interval = this.intervals[i];
          invert = interval.invert();
          if (interval.simpleIntervalType.name in has) {
            has[interval.simpleIntervalType.name] = true;
          } else if (invert.simpleIntervalType.name in has) {
            has[invert.simpleIntervalType.name] = true;
          }
        }

        if (has.first && has.third && has.fifth && has.seventh) {
          name = 'tetrad';
        }
      }

      return name || 'unknown';
    },

    get: function(interval) {
      if (typeof interval === 'string' && interval in kStepNumber) {
        var intervals = this.intervals, i, length;

        interval = kStepNumber[interval];
        for (i = 0, length = intervals.length; i < length; i++) {
          if (intervals[i].interval === +interval) {
            return teoria.interval.from(this.root, intervals[i]);
          }
        }

        return null;
      } else {
        throw new Error('Invalid interval name');
      }
    },

    interval: function(interval, direction) {
      return new TeoriaChord(this.root.interval(interval, direction),
                             this.symbol);
    },

    transpose: function(interval, direction) {
      this.root.transpose(interval, direction);
      this.name = this.root.name.toUpperCase() +
                  this.root.accidental.sign + this.symbol;

      return this;
    },

    toString: function() {
      return this.name;
    }
  };


  function TeoriaScale(tonic, scale) {
    var scaleName, i, length;

    if (!(tonic instanceof TeoriaNote)) {
      throw new Error('Invalid Tonic');
    }

    if (typeof scale === 'string') {
      scaleName = scale;
      scale = teoria.scale.scales[scale];
      if (!scale) {
        throw new Error('Invalid Scale');
      }
    } else {
      for (i in teoria.scale.scales) {
        if (teoria.scale.scales.hasOwnProperty(i)) {
          if (teoria.scale.scales[i].toString() === scale.toString()) {
            scaleName = i;
            break;
          }
        }
      }
    }

    this.name = scaleName;
    this.notes = [];
    this.tonic = tonic;
    this.scale = scale;

    for (i = 0, length = scale.length; i < length; i++) {
      this.notes.push(teoria.interval(tonic, scale[i]));
    }
  }

  TeoriaScale.prototype = {
    simple: function() {
      var sNotes = [];

      for (var i = 0, length = this.notes.length; i < length; i++) {
        sNotes.push(this.notes[i].toString(true));
      }

      return sNotes;
    },

    type: function() {
      var length = this.notes.length - 2;
      if (length < 8) {
        return ['di', 'tri', 'tetra', 'penta', 'hexa', 'hepta', 'octa'][length] +
          'tonic';
      }
    },

    get: function(i) {
      if (typeof i === 'string' && i in kStepNumber) {
        i = parseInt(kStepNumber[i], 10);
      }

      return this.notes[i - 1];
    },

    solfege: function(index, showOctaves) {
      var i, length, solfegeArray = [];

      // Return specific index in scale
      if (index) {
        return this.get(index).solfege(this, showOctaves);
      }

      // Return an array of solfege syllables
      for (i = 0, length = this.notes.length; i < length; i++) {
        solfegeArray.push(this.notes[i].solfege(this, showOctaves));
      }

      return solfegeArray;
    },

    interval: function(interval, direction) {
      return new TeoriaScale(this.tonic.interval(interval, direction),
                             this.scale);
    },

    transpose: function(interval, direction) {
      var scale = new TeoriaScale(this.tonic.interval(interval, direction),
                                  this.scale);
      this.notes = scale.notes;
      this.scale = scale.scale;
      this.tonic = scale.tonic;

      return this;
    }
  };


  teoria.scale.scales.ionian = teoria.scale.scales.major =
    ['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7'];
  teoria.scale.scales.dorian = ['P1', 'M2', 'm3', 'P4', 'P5', 'M6', 'm7'];
  teoria.scale.scales.phrygian = ['P1', 'm2', 'm3', 'P4', 'P5', 'm6', 'm7'];
  teoria.scale.scales.lydian = ['P1', 'M2', 'M3', 'A4', 'P5', 'M6', 'M7'];
  teoria.scale.scales.mixolydian = ['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'm7'];
  teoria.scale.scales.aeolian = teoria.scale.scales.minor =
    ['P1', 'M2', 'm3', 'P4', 'P5', 'm6', 'm7'];
  teoria.scale.scales.locrian = ['P1', 'm2', 'm3', 'P4', 'd5', 'm6', 'm7'];
  teoria.scale.scales.majorpentatonic = ['P1', 'M2', 'M3', 'P5', 'M6'];
  teoria.scale.scales.minorpentatonic = ['P1', 'm3', 'P4', 'P5', 'm7'];
  teoria.scale.scales.chromatic = teoria.scale.scales.harmonicchromatic =
    ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'A4', 'P5', 'm6', 'M6', 'm7', 'M7'];


  teoria.TeoriaNote = TeoriaNote;
  teoria.TeoriaChord = TeoriaChord;
  teoria.TeoriaScale = TeoriaScale;
  teoria.TeoriaInterval = TeoriaInterval;

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = teoria;
    }
    exports.teoria = teoria;
  } else if (typeof this !== 'undefined') {
    this.teoria = teoria;
  } else if (typeof window !== 'undefined') {
    window.teoria = teoria;
  }
})();