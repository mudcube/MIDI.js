(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("MIDI", [], factory);
	else if(typeof exports === 'object')
		exports["MIDI"] = factory();
	else
		root["MIDI"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./js/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./inc/jasmid/midifile.js":
/*!********************************!*\
  !*** ./inc/jasmid/midifile.js ***!
  \********************************/
/*! exports provided: MidiFileClass, MidiFile */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MidiFileClass", function() { return MidiFileClass; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MidiFile", function() { return MidiFile; });
/* harmony import */ var _stream_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./stream.js */ "./inc/jasmid/stream.js");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/*
class to parse the .mid file format
(depends on stream.js)
*/

var MidiFileClass =
/*#__PURE__*/
function () {
  function MidiFileClass(data) {
    _classCallCheck(this, MidiFileClass);

    this.data = data;
    this.stream = new _stream_js__WEBPACK_IMPORTED_MODULE_0__["Stream"](data);
    this.lastEventTypeByte = undefined;
  }

  _createClass(MidiFileClass, [{
    key: "readChunk",
    value: function readChunk(stream) {
      var id = stream.read(4);
      var length = stream.readInt32();
      return {
        'id': id,
        'length': length,
        'data': stream.read(length)
      };
    }
  }, {
    key: "readEvent",
    value: function readEvent(stream) {
      var event = {};
      event.deltaTime = stream.readVarInt();
      var eventTypeByte = stream.readInt8();

      if ((eventTypeByte & 0xf0) === 0xf0) {
        /* system / meta event */
        if (eventTypeByte === 0xff) {
          /* meta event */
          event.type = 'meta';
          var subtypeByte = stream.readInt8();
          var length = stream.readVarInt();

          switch (subtypeByte) {
            case 0x00:
              event.subtype = 'sequenceNumber';

              if (length !== 2) {
                throw "Expected length for sequenceNumber event is 2, got " + length;
              }

              event.number = stream.readInt16();
              return event;

            case 0x01:
              event.subtype = 'text';
              event.text = stream.read(length);
              return event;

            case 0x02:
              event.subtype = 'copyrightNotice';
              event.text = stream.read(length);
              return event;

            case 0x03:
              event.subtype = 'trackName';
              event.text = stream.read(length);
              return event;

            case 0x04:
              event.subtype = 'instrumentName';
              event.text = stream.read(length);
              return event;

            case 0x05:
              event.subtype = 'lyrics';
              event.text = stream.read(length);
              return event;

            case 0x06:
              event.subtype = 'marker';
              event.text = stream.read(length);
              return event;

            case 0x07:
              event.subtype = 'cuePoint';
              event.text = stream.read(length);
              return event;

            case 0x20:
              event.subtype = 'midiChannelPrefix';

              if (length !== 1) {
                throw "Expected length for midiChannelPrefix event is 1, got " + length;
              }

              event.channel = stream.readInt8();
              return event;

            case 0x2f:
              event.subtype = 'endOfTrack';

              if (length !== 0) {
                throw "Expected length for endOfTrack event is 0, got " + length;
              }

              return event;

            case 0x51:
              event.subtype = 'setTempo';
              if (length !== 3) throw "Expected length for setTempo event is 3, got " + length;
              event.microsecondsPerBeat = (stream.readInt8() << 16) + (stream.readInt8() << 8) + stream.readInt8();
              return event;

            case 0x54:
              event.subtype = 'smpteOffset';

              if (length !== 5) {
                throw "Expected length for smpteOffset event is 5, got " + length;
              }

              var hourByte = stream.readInt8();
              event.frameRate = {
                0x00: 24,
                0x20: 25,
                0x40: 29,
                0x60: 30
              }[hourByte & 0x60];
              event.hour = hourByte & 0x1f;
              event.min = stream.readInt8();
              event.sec = stream.readInt8();
              event.frame = stream.readInt8();
              event.subframe = stream.readInt8();
              return event;

            case 0x58:
              event.subtype = 'timeSignature';

              if (length !== 4) {
                throw "Expected length for timeSignature event is 4, got " + length;
              }

              event.numerator = stream.readInt8();
              event.denominator = Math.pow(2, stream.readInt8());
              event.metronome = stream.readInt8();
              event.thirtyseconds = stream.readInt8();
              return event;

            case 0x59:
              event.subtype = 'keySignature';

              if (length !== 2) {
                throw "Expected length for keySignature event is 2, got " + length;
              }

              event.key = stream.readInt8(true);
              event.scale = stream.readInt8();
              return event;

            case 0x7f:
              event.subtype = 'sequencerSpecific';
              event.data = stream.read(length);
              return event;

            default:
              // console.log("Unrecognised meta event subtype: " + subtypeByte);
              event.subtype = 'unknown';
              event.data = stream.read(length);
              return event;
          }
        } else if (eventTypeByte === 0xf0) {
          event.type = 'sysEx';

          var _length = stream.readVarInt();

          event.data = stream.read(_length);
          return event;
        } else if (eventTypeByte === 0xf7) {
          event.type = 'dividedSysEx';

          var _length2 = stream.readVarInt();

          event.data = stream.read(_length2);
          return event;
        } else {
          throw "Unrecognised MIDI event type byte: " + eventTypeByte;
        }
      } else {
        /* channel event */
        var param1;

        if ((eventTypeByte & 0x80) === 0) {
          /* running status - reuse lastEventTypeByte as the event type.
          	eventTypeByte is actually the first parameter
          */
          param1 = eventTypeByte;
          eventTypeByte = this.lastEventTypeByte;
        } else {
          param1 = stream.readInt8();
          this.lastEventTypeByte = eventTypeByte;
        }

        var eventType = eventTypeByte >> 4;
        event.channel = eventTypeByte & 0x0f;
        event.type = 'channel';

        switch (eventType) {
          case 0x08:
            event.subtype = 'noteOff';
            event.noteNumber = param1;
            event.velocity = stream.readInt8();
            return event;

          case 0x09:
            event.noteNumber = param1;
            event.velocity = stream.readInt8();

            if (event.velocity === 0) {
              event.subtype = 'noteOff';
            } else {
              event.subtype = 'noteOn';
            }

            return event;

          case 0x0a:
            event.subtype = 'noteAftertouch';
            event.noteNumber = param1;
            event.amount = stream.readInt8();
            return event;

          case 0x0b:
            event.subtype = 'controller';
            event.controllerType = param1;
            event.value = stream.readInt8();
            return event;

          case 0x0c:
            event.subtype = 'programChange';
            event.programNumber = param1;
            return event;

          case 0x0d:
            event.subtype = 'channelAftertouch';
            event.amount = param1;
            return event;

          case 0x0e:
            event.subtype = 'pitchBend';
            event.value = param1 + (stream.readInt8() << 7);
            return event;

          default:
            throw "Unrecognised MIDI event type: " + eventType;

          /* 
          console.log("Unrecognised MIDI event type: " + eventType);
          stream.readInt8();
          event.subtype = 'unknown';
          return event;
          */
        }
      }
    }
  }, {
    key: "parseAndReturn",
    value: function parseAndReturn() {
      var stream = this.stream;
      var headerChunk = this.readChunk(stream);

      if (headerChunk.id !== 'MThd' || headerChunk.length !== 6) {
        throw "Bad .mid file - header not found";
      }

      var headerStream = new _stream_js__WEBPACK_IMPORTED_MODULE_0__["Stream"](headerChunk.data);
      var formatType = headerStream.readInt16();
      var trackCount = headerStream.readInt16();
      var timeDivision = headerStream.readInt16();
      var ticksPerBeat;

      if (timeDivision & 0x8000) {
        throw "Expressing time division in SMTPE frames is not supported yet";
      } else {
        ticksPerBeat = timeDivision;
      }

      var header = {
        'formatType': formatType,
        'trackCount': trackCount,
        'ticksPerBeat': ticksPerBeat
      };
      var tracks = [];

      for (var i = 0; i < header.trackCount; i++) {
        tracks[i] = [];
        var trackChunk = this.readChunk(stream);

        if (trackChunk.id !== 'MTrk') {
          throw "Unexpected chunk - expected MTrk, got " + trackChunk.id;
        }

        var trackStream = new _stream_js__WEBPACK_IMPORTED_MODULE_0__["Stream"](trackChunk.data);

        while (!trackStream.eof()) {
          var event = this.readEvent(trackStream);
          tracks[i].push(event); //console.log(event);
        }
      }

      return {
        'header': header,
        'tracks': tracks
      };
    }
  }]);

  return MidiFileClass;
}();
function MidiFile(data) {
  var midiFileObject = new MidiFileClass(data);
  return midiFileObject.parseAndReturn();
}

/***/ }),

/***/ "./inc/jasmid/replayer.js":
/*!********************************!*\
  !*** ./inc/jasmid/replayer.js ***!
  \********************************/
/*! exports provided: Replayer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Replayer", function() { return Replayer; });
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * Replayer class -- factored from function by MSC July 2019
 *
 */

/**
 * Clone any object
 *
 * @param {*} o
 * @returns {Array|*}
 */
var clone = function clone(o) {
  if (_typeof(o) != 'object') {
    return o;
  }

  if (o == null) {
    return o;
  }

  var ret = typeof o.length == 'number' ? [] : {};

  for (var key in o) {
    // noinspection JSUnfilteredForInLoop
    ret[key] = clone(o[key]);
  }

  return ret;
};

var Replayer =
/*#__PURE__*/
function () {
  function Replayer(midiFile, timeWarp, eventProcessor, bpm) {
    _classCallCheck(this, Replayer);

    this.midiFile = midiFile;
    this.timeWarp = timeWarp;
    this.eventProcessor = eventProcessor;
    this.trackStates = [];
    this.beatsPerMinute = bpm ? bpm : 120;
    this.bpmOverride = !!bpm;
    this.ticksPerBeat = midiFile.header.ticksPerBeat;

    for (var i = 0; i < midiFile.tracks.length; i++) {
      this.trackStates[i] = {
        'nextEventIndex': 0,
        'ticksToNextEvent': midiFile.tracks[i].length ? midiFile.tracks[i][0].deltaTime : null
      };
    }

    this.temporal = [];
    this.processEvents();
  }

  _createClass(Replayer, [{
    key: "getNextEvent",
    value: function getNextEvent() {
      var ticksToNextEvent = null;
      var nextEventTrack = null;
      var nextEventIndex = null;

      for (var i = 0; i < this.trackStates.length; i++) {
        if (this.trackStates[i].ticksToNextEvent != null && (ticksToNextEvent == null || this.trackStates[i].ticksToNextEvent < ticksToNextEvent)) {
          ticksToNextEvent = this.trackStates[i].ticksToNextEvent;
          nextEventTrack = i;
          nextEventIndex = this.trackStates[i].nextEventIndex;
        }
      }

      if (nextEventTrack != null) {
        /* consume event from that track */
        var nextEvent = this.midiFile.tracks[nextEventTrack][nextEventIndex];

        if (this.midiFile.tracks[nextEventTrack][nextEventIndex + 1]) {
          this.trackStates[nextEventTrack].ticksToNextEvent += this.midiFile.tracks[nextEventTrack][nextEventIndex + 1].deltaTime;
        } else {
          this.trackStates[nextEventTrack].ticksToNextEvent = null;
        }

        this.trackStates[nextEventTrack].nextEventIndex += 1;
        /* advance timings on all tracks by ticksToNextEvent */

        for (var _i = 0; _i < this.trackStates.length; _i++) {
          if (this.trackStates[_i].ticksToNextEvent != null) {
            this.trackStates[_i].ticksToNextEvent -= ticksToNextEvent;
          }
        }

        return {
          "ticksToEvent": ticksToNextEvent,
          "event": nextEvent,
          "track": nextEventTrack
        };
      } else {
        return null;
      }
    }
  }, {
    key: "processEvents",
    value: function processEvents() {
      var midiEvent = this.getNextEvent();

      while (midiEvent) {
        if (!this.bpmOverride && midiEvent.event.type === "meta" && midiEvent.event.subtype === "setTempo") {
          // tempo change events can occur anywhere in the middle and affect events that follow
          this.beatsPerMinute = 60000000 / midiEvent.event.microsecondsPerBeat;
        } //


        var beatsToGenerate = 0;
        var secondsToGenerate = 0;

        if (midiEvent.ticksToEvent > 0) {
          beatsToGenerate = midiEvent.ticksToEvent / this.ticksPerBeat;
          secondsToGenerate = beatsToGenerate / (this.beatsPerMinute / 60);
        }

        var time = secondsToGenerate * 1000 * this.timeWarp || 0;
        this.temporal.push([midiEvent, time]);
        midiEvent = this.getNextEvent();
      }
    }
  }, {
    key: "getData",
    value: function getData() {
      return clone(this.temporal);
    }
  }]);

  return Replayer;
}();

/***/ }),

/***/ "./inc/jasmid/stream.js":
/*!******************************!*\
  !*** ./inc/jasmid/stream.js ***!
  \******************************/
/*! exports provided: Stream */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Stream", function() { return Stream; });
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* Wrapper for accessing strings through sequential reads */

/* now an ES6 class -- MSC 2019 */
var Stream =
/*#__PURE__*/
function () {
  function Stream(str) {
    _classCallCheck(this, Stream);

    this.str = str;
    this.position = 0;
  }

  _createClass(Stream, [{
    key: "read",
    value: function read(length) {
      var result = this.str.substr(this.position, length);
      this.position += length;
      return result;
    }
    /* read a big-endian 32-bit integer */

  }, {
    key: "readInt32",
    value: function readInt32() {
      var result = (this.str.charCodeAt(this.position) << 24) + (this.str.charCodeAt(this.position + 1) << 16) + (this.str.charCodeAt(this.position + 2) << 8) + this.str.charCodeAt(this.position + 3);
      this.position += 4;
      return result;
    }
    /* read a big-endian 16-bit integer */

  }, {
    key: "readInt16",
    value: function readInt16() {
      var result = (this.str.charCodeAt(this.position) << 8) + this.str.charCodeAt(this.position + 1);
      this.position += 2;
      return result;
    }
    /* read an 8-bit integer */

  }, {
    key: "readInt8",
    value: function readInt8(signed) {
      var result = this.str.charCodeAt(this.position);

      if (signed && result > 127) {
        result -= 256;
      }

      this.position += 1;
      return result;
    }
  }, {
    key: "eof",
    value: function eof() {
      return this.position >= this.str.length;
    }
    /* read a MIDI-style variable-length integer
    	(big-endian value in groups of 7 bits,
    	with top bit set to signify that another byte follows)
    */

  }, {
    key: "readVarInt",
    value: function readVarInt() {
      var result = 0;

      while (true) {
        var b = this.readInt8(); // noinspection JSBitwiseOperatorUsage

        if (b & 0x80) {
          result += b & 0x7f;
          result <<= 7;
        } else {
          /* b is the last byte */
          return result + b;
        }
      }
    }
  }]);

  return Stream;
}();

/***/ }),

/***/ "./js/audioDetect.js":
/*!***************************!*\
  !*** ./js/audioDetect.js ***!
  \***************************/
/*! exports provided: supports, canPlayThrough, audioDetect */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "supports", function() { return supports; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "canPlayThrough", function() { return canPlayThrough; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "audioDetect", function() { return audioDetect; });
/*
	----------------------------------------------------------
	MIDI.audioDetect : 0.3.2 : 2015-03-26
	----------------------------------------------------------
	https://github.com/mudcube/MIDI.js
	----------------------------------------------------------
	Probably, Maybe, No... Absolutely!
	Test to see what types of <audio> MIME types are playable by the browser.
	----------------------------------------------------------
*/
var supports = {}; // object of supported file types

var pending = 0; // pending file types to process

var canPlayThrough = function canPlayThrough(src) {
  // check whether format plays through
  pending += 1;
  var body = document.body;
  var audio = new Audio();
  var mime = src.split(';')[0];
  audio.id = 'audio';
  audio.setAttribute('preload', 'auto');
  audio.setAttribute('audiobuffer', true);
  audio.addEventListener('error', function () {
    body.removeChild(audio);
    supports[mime] = false;
    pending -= 1;
  }, false);
  audio.addEventListener('canplaythrough', function () {
    body.removeChild(audio);
    supports[mime] = true;
    pending -= 1;
  }, false);
  audio.src = 'data:' + src;
  body.appendChild(audio);
};
function audioDetect(successCallback) {
  // detect jazz-midi plugin
  if (typeof navigator !== 'undefined' && navigator.requestMIDIAccess) {
    var isNative = Function.prototype.toString.call(navigator.requestMIDIAccess).indexOf('[native code]');

    if (isNative) {
      // has native midiapi support
      supports['webmidi'] = true;
    } else if (typeof navigator !== 'undefined' && navigator.plugins !== undefined) {
      // check for jazz plugin midiapi support
      for (var _i = 0, _Array$from = Array.from(navigator.plugins); _i < _Array$from.length; _i++) {
        var plugin = _Array$from[_i];

        if (plugin.name.indexOf('Jazz-Plugin') >= 0) {
          supports['webmidi'] = true;
        }
      }
    }
  } // check whether <audio> tag is supported


  if (typeof Audio === 'undefined') {
    return successCallback({});
  } else {
    supports['audiotag'] = true;
  } // check for webaudio api support


  if (window.AudioContext || window.webkitAudioContext) {
    supports['webaudio'] = true;
  } // check whether canPlayType is supported


  var audio = new Audio();

  if (typeof audio.canPlayType === 'undefined') {
    return successCallback(supports);
  } // see what we can learn from the browser


  var vorbis = audio.canPlayType('audio/ogg; codecs="vorbis"');
  vorbis = vorbis === 'probably' || vorbis === 'maybe';
  var mpeg = audio.canPlayType('audio/mpeg');
  mpeg = mpeg === 'probably' || mpeg === 'maybe'; // maybe nothing is supported

  if (!vorbis && !mpeg) {
    successCallback(supports);
    return;
  } // or maybe something is supported


  if (vorbis) {
    canPlayThrough('audio/ogg;base64,T2dnUwACAAAAAAAAAADqnjMlAAAAAOyyzPIBHgF2b3JiaXMAAAAAAUAfAABAHwAAQB8AAEAfAACZAU9nZ1MAAAAAAAAAAAAA6p4zJQEAAAANJGeqCj3//////////5ADdm9yYmlzLQAAAFhpcGguT3JnIGxpYlZvcmJpcyBJIDIwMTAxMTAxIChTY2hhdWZlbnVnZ2V0KQAAAAABBXZvcmJpcw9CQ1YBAAABAAxSFCElGVNKYwiVUlIpBR1jUFtHHWPUOUYhZBBTiEkZpXtPKpVYSsgRUlgpRR1TTFNJlVKWKUUdYxRTSCFT1jFloXMUS4ZJCSVsTa50FkvomWOWMUYdY85aSp1j1jFFHWNSUkmhcxg6ZiVkFDpGxehifDA6laJCKL7H3lLpLYWKW4q91xpT6y2EGEtpwQhhc+211dxKasUYY4wxxsXiUyiC0JBVAAABAABABAFCQ1YBAAoAAMJQDEVRgNCQVQBABgCAABRFcRTHcRxHkiTLAkJDVgEAQAAAAgAAKI7hKJIjSZJkWZZlWZameZaouaov+64u667t6roOhIasBACAAAAYRqF1TCqDEEPKQ4QUY9AzoxBDDEzGHGNONKQMMogzxZAyiFssLqgQBKEhKwKAKAAAwBjEGGIMOeekZFIi55iUTkoDnaPUUcoolRRLjBmlEluJMYLOUeooZZRCjKXFjFKJscRUAABAgAMAQICFUGjIigAgCgCAMAYphZRCjCnmFHOIMeUcgwwxxiBkzinoGJNOSuWck85JiRhjzjEHlXNOSuekctBJyaQTAAAQ4AAAEGAhFBqyIgCIEwAwSJKmWZomipamiaJniqrqiaKqWp5nmp5pqqpnmqpqqqrrmqrqypbnmaZnmqrqmaaqiqbquqaquq6nqrZsuqoum65q267s+rZru77uqapsm6or66bqyrrqyrbuurbtS56nqqKquq5nqq6ruq5uq65r25pqyq6purJtuq4tu7Js664s67pmqq5suqotm64s667s2rYqy7ovuq5uq7Ks+6os+75s67ru2rrwi65r66os674qy74x27bwy7ouHJMnqqqnqq7rmarrqq5r26rr2rqmmq5suq4tm6or26os67Yry7aumaosm64r26bryrIqy77vyrJui67r66Ys67oqy8Lu6roxzLat+6Lr6roqy7qvyrKuu7ru+7JuC7umqrpuyrKvm7Ks+7auC8us27oxuq7vq7It/KosC7+u+8Iy6z5jdF1fV21ZGFbZ9n3d95Vj1nVhWW1b+V1bZ7y+bgy7bvzKrQvLstq2scy6rSyvrxvDLux8W/iVmqratum6um7Ksq/Lui60dd1XRtf1fdW2fV+VZd+3hV9pG8OwjK6r+6os68Jry8ov67qw7MIvLKttK7+r68ow27qw3L6wLL/uC8uq277v6rrStXVluX2fsSu38QsAABhwAAAIMKEMFBqyIgCIEwBAEHIOKQahYgpCCKGkEEIqFWNSMuakZM5JKaWUFEpJrWJMSuaclMwxKaGUlkopqYRSWiqlxBRKaS2l1mJKqcVQSmulpNZKSa2llGJMrcUYMSYlc05K5pyUklJrJZXWMucoZQ5K6iCklEoqraTUYuacpA46Kx2E1EoqMZWUYgupxFZKaq2kFGMrMdXUWo4hpRhLSrGVlFptMdXWWqs1YkxK5pyUzDkqJaXWSiqtZc5J6iC01DkoqaTUYiopxco5SR2ElDLIqJSUWiupxBJSia20FGMpqcXUYq4pxRZDSS2WlFosqcTWYoy1tVRTJ6XFklKMJZUYW6y5ttZqDKXEVkqLsaSUW2sx1xZjjqGkFksrsZWUWmy15dhayzW1VGNKrdYWY40x5ZRrrT2n1mJNMdXaWqy51ZZbzLXnTkprpZQWS0oxttZijTHmHEppraQUWykpxtZara3FXEMpsZXSWiypxNhirLXFVmNqrcYWW62ltVprrb3GVlsurdXcYqw9tZRrrLXmWFNtBQAADDgAAASYUAYKDVkJAEQBAADGMMYYhEYpx5yT0ijlnHNSKucghJBS5hyEEFLKnINQSkuZcxBKSSmUklJqrYVSUmqttQIAAAocAAACbNCUWByg0JCVAEAqAIDBcTRNFFXVdX1fsSxRVFXXlW3jVyxNFFVVdm1b+DVRVFXXtW3bFn5NFFVVdmXZtoWiqrqybduybgvDqKqua9uybeuorqvbuq3bui9UXVmWbVu3dR3XtnXd9nVd+Bmzbeu2buu+8CMMR9/4IeTj+3RCCAAAT3AAACqwYXWEk6KxwEJDVgIAGQAAgDFKGYUYM0gxphhjTDHGmAAAgAEHAIAAE8pAoSErAoAoAADAOeecc84555xzzjnnnHPOOeecc44xxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY0wAwE6EA8BOhIVQaMhKACAcAABACCEpKaWUUkoRU85BSSmllFKqFIOMSkoppZRSpBR1lFJKKaWUIqWgpJJSSimllElJKaWUUkoppYw6SimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaVUSimllFJKKaWUUkoppRQAYPLgAACVYOMMK0lnhaPBhYasBAByAwAAhRiDEEJpraRUUkolVc5BKCWUlEpKKZWUUqqYgxBKKqmlklJKKbXSQSihlFBKKSWUUkooJYQQSgmhlFRCK6mEUkoHoYQSQimhhFRKKSWUzkEoIYUOQkmllNRCSB10VFIpIZVSSiklpZQ6CKGUklJLLZVSWkqpdBJSKamV1FJqqbWSUgmhpFZKSSWl0lpJJbUSSkklpZRSSymFVFJJJYSSUioltZZaSqm11lJIqZWUUkqppdRSSiWlkEpKqZSSUmollZRSaiGVlEpJKaTUSimlpFRCSamlUlpKLbWUSkmptFRSSaWUlEpJKaVSSksppRJKSqmllFpJKYWSUkoplZJSSyW1VEoKJaWUUkmptJRSSymVklIBAEAHDgAAAUZUWoidZlx5BI4oZJiAAgAAQABAgAkgMEBQMApBgDACAQAAAADAAAAfAABHARAR0ZzBAUKCwgJDg8MDAAAAAAAAAAAAAACAT2dnUwAEAAAAAAAAAADqnjMlAgAAADzQPmcBAQA=');
  }

  if (mpeg) {
    canPlayThrough('audio/mpeg;base64,/+MYxAAAAANIAUAAAASEEB/jwOFM/0MM/90b/+RhST//w4NFwOjf///PZu////9lns5GFDv//l9GlUIEEIAAAgIg8Ir/JGq3/+MYxDsLIj5QMYcoAP0dv9HIjUcH//yYSg+CIbkGP//8w0bLVjUP///3Z0x5QCAv/yLjwtGKTEFNRTMuOTeqqqqqqqqqqqqq/+MYxEkNmdJkUYc4AKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
  } // lets find out!


  var time = new Date().getTime();
  var interval = window.setInterval(function () {
    var now = new Date().getTime();
    var maxExecution = now - time > 5000;

    if (!pending || maxExecution) {
      window.clearInterval(interval);
      successCallback(supports);
    }
  }, 1);
}
;

/***/ }),

/***/ "./js/debug.js":
/*!*********************!*\
  !*** ./js/debug.js ***!
  \*********************/
/*! exports provided: DEBUG */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DEBUG", function() { return DEBUG; });
var DEBUG = true;

/***/ }),

/***/ "./js/gm.js":
/*!******************!*\
  !*** ./js/gm.js ***!
  \******************/
/*! exports provided: GM, channels, getProgram, setProgram, getMono, setMono, getOmni, setOmni, getSolo, setSolo, keyToNote, noteToKey */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GM", function() { return GM; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "channels", function() { return channels; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getProgram", function() { return getProgram; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setProgram", function() { return setProgram; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getMono", function() { return getMono; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setMono", function() { return setMono; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getOmni", function() { return getOmni; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setOmni", function() { return setOmni; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSolo", function() { return getSolo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setSolo", function() { return setSolo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "keyToNote", function() { return keyToNote; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "noteToKey", function() { return noteToKey; });
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/*
----------------------------------------------------------
GeneralMIDI
----------------------------------------------------------
*/
var GM_fixer = function GM_fixer(in_dict) {
  var asId = function asId(name) {
    return name.replace(/[^a-z0-9 ]/gi, '').replace(/[ ]/g, '_').toLowerCase();
  };

  var res = {
    byName: {},
    byId: {},
    byCategory: {}
  };

  for (var _i = 0, _Object$entries = Object.entries(in_dict); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        key = _Object$entries$_i[0],
        list = _Object$entries$_i[1];

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var instrument = _step.value;

        if (!instrument) {
          continue;
        }

        var id = parseInt(instrument.substr(0, instrument.indexOf(' ')), 10);
        var programNumber = id - 1;
        var name = instrument.replace(id + ' ', '');
        var nameId = asId(name);
        var categoryId = asId(key);
        var spec = {
          id: nameId,
          name: name,
          program: programNumber,
          category: key
        };
        res.byId[programNumber] = spec;
        res.byName[nameId] = spec;
        res.byCategory[categoryId] = res.byCategory[categoryId] || [];
        res.byCategory[categoryId].push(spec);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  return res;
};

var GM = GM_fixer({
  'Piano': ['1 Acoustic Grand Piano', '2 Bright Acoustic Piano', '3 Electric Grand Piano', '4 Honky-tonk Piano', '5 Electric Piano 1', '6 Electric Piano 2', '7 Harpsichord', '8 Clavinet'],
  'Chromatic Percussion': ['9 Celesta', '10 Glockenspiel', '11 Music Box', '12 Vibraphone', '13 Marimba', '14 Xylophone', '15 Tubular Bells', '16 Dulcimer'],
  'Organ': ['17 Drawbar Organ', '18 Percussive Organ', '19 Rock Organ', '20 Church Organ', '21 Reed Organ', '22 Accordion', '23 Harmonica', '24 Tango Accordion'],
  'Guitar': ['25 Acoustic Guitar (nylon)', '26 Acoustic Guitar (steel)', '27 Electric Guitar (jazz)', '28 Electric Guitar (clean)', '29 Electric Guitar (muted)', '30 Overdriven Guitar', '31 Distortion Guitar', '32 Guitar Harmonics'],
  'Bass': ['33 Acoustic Bass', '34 Electric Bass (finger)', '35 Electric Bass (pick)', '36 Fretless Bass', '37 Slap Bass 1', '38 Slap Bass 2', '39 Synth Bass 1', '40 Synth Bass 2'],
  'Strings': ['41 Violin', '42 Viola', '43 Cello', '44 Contrabass', '45 Tremolo Strings', '46 Pizzicato Strings', '47 Orchestral Harp', '48 Timpani'],
  'Ensemble': ['49 String Ensemble 1', '50 String Ensemble 2', '51 Synth Strings 1', '52 Synth Strings 2', '53 Choir Aahs', '54 Voice Oohs', '55 Synth Choir', '56 Orchestra Hit'],
  'Brass': ['57 Trumpet', '58 Trombone', '59 Tuba', '60 Muted Trumpet', '61 French Horn', '62 Brass Section', '63 Synth Brass 1', '64 Synth Brass 2'],
  'Reed': ['65 Soprano Sax', '66 Alto Sax', '67 Tenor Sax', '68 Baritone Sax', '69 Oboe', '70 English Horn', '71 Bassoon', '72 Clarinet'],
  'Pipe': ['73 Piccolo', '74 Flute', '75 Recorder', '76 Pan Flute', '77 Blown Bottle', '78 Shakuhachi', '79 Whistle', '80 Ocarina'],
  'Synth Lead': ['81 Lead 1 (square)', '82 Lead 2 (sawtooth)', '83 Lead 3 (calliope)', '84 Lead 4 (chiff)', '85 Lead 5 (charang)', '86 Lead 6 (voice)', '87 Lead 7 (fifths)', '88 Lead 8 (bass + lead)'],
  'Synth Pad': ['89 Pad 1 (new age)', '90 Pad 2 (warm)', '91 Pad 3 (polysynth)', '92 Pad 4 (choir)', '93 Pad 5 (bowed)', '94 Pad 6 (metallic)', '95 Pad 7 (halo)', '96 Pad 8 (sweep)'],
  'Synth Effects': ['97 FX 1 (rain)', '98 FX 2 (soundtrack)', '99 FX 3 (crystal)', '100 FX 4 (atmosphere)', '101 FX 5 (brightness)', '102 FX 6 (goblins)', '103 FX 7 (echoes)', '104 FX 8 (sci-fi)'],
  'Ethnic': ['105 Sitar', '106 Banjo', '107 Shamisen', '108 Koto', '109 Kalimba', '110 Bagpipe', '111 Fiddle', '112 Shanai'],
  'Percussive': ['113 Tinkle Bell', '114 Agogo', '115 Steel Drums', '116 Woodblock', '117 Taiko Drum', '118 Melodic Tom', '119 Synth Drum'],
  'Sound effects': ['120 Reverse Cymbal', '121 Guitar Fret Noise', '122 Breath Noise', '123 Seashore', '124 Bird Tweet', '125 Telephone Ring', '126 Helicopter', '127 Applause', '128 Gunshot']
});
/* channels
--------------------------------------------------- */

var get_channels = function get_channels() {
  // 0 - 15 channels
  var channels = {};

  for (var i = 0; i < 16; i++) {
    channels[i] = {
      // default values
      program: i,
      pitchBend: 0,
      mute: false,
      mono: false,
      omni: false,
      solo: false
    };
  }

  return channels;
};

var channels = get_channels();
/* get/setInstrument
--------------------------------------------------- */

var getProgram = function getProgram(channelId) {
  var channel = channels[channelId];
  return channel && channel.program;
};
var setProgram = function setProgram(channelId, program, delay) {
  var channel = channels[channelId];

  if (delay) {
    return setTimeout(function () {
      channel.program = program;
    }, delay);
  } else {
    channel.program = program;
  }
};
/* get/setMono
--------------------------------------------------- */

var getMono = function getMono(channelId) {
  var channel = channels[channelId];
  return channel && channel.mono;
};
var setMono = function setMono(channelId, truthy, delay) {
  var channel = channels[channelId];

  if (delay) {
    return setTimeout(function () {
      channel.mono = truthy;
    }, delay);
  } else {
    channel.mono = truthy;
  }
};
/* get/setOmni
--------------------------------------------------- */

var getOmni = function getOmni(channelId) {
  var channel = channels[channelId];
  return channel && channel.omni;
};
var setOmni = function setOmni(channelId, truthy, delay) {
  var channel = channels[channelId];

  if (delay) {
    return setTimeout(function () {
      channel.omni = truthy;
    }, delay);
  } else {
    channel.omni = truthy;
  }
};
/* get/setSolo
--------------------------------------------------- */

var getSolo = function getSolo(channelId) {
  var channel = channels[channelId];
  return channel && channel.solo;
};
var setSolo = function setSolo(channelId, truthy) {
  var channel = channels[channelId];

  if (delay) {
    return setTimeout(function () {
      channel.solo = truthy;
    }, delay);
  } else {
    channel.solo = truthy;
  }
};
/* note conversions
--------------------------------------------------- */

var keyToNote = {}; // C8  == 108

var noteToKey = {}; // 108 ==  C8

(function () {
  var A0 = 0x15; // first note

  var C8 = 0x6C; // last note

  var number2key = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

  for (var n = A0; n <= C8; n++) {
    var octave = (n - 12) / 12 >> 0;
    var name = number2key[n % 12] + octave;
    keyToNote[name] = n;
    noteToKey[n] = name;
  }
})();

/***/ }),

/***/ "./js/index.js":
/*!*********************!*\
  !*** ./js/index.js ***!
  \*********************/
/*! exports provided: GM, noteToKey, keyToNote, channels, Synesthesia, Soundfont, audio_contexts, config, loadPlugin, loadProgram, requestQueue, sendRequest, playChannel, stopChannel, send, setController, setVolume, programChange, pitchBend, noteOn, noteOff, chordOn, chordOff, stopAllNotes, setEffects, getContext, setContext, Player */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Soundfont", function() { return Soundfont; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "audio_contexts", function() { return audio_contexts; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "config", function() { return config; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadPlugin", function() { return _loadPlugin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadProgram", function() { return loadProgram; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "requestQueue", function() { return requestQueue; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sendRequest", function() { return sendRequest; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "playChannel", function() { return playChannel; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stopChannel", function() { return stopChannel; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "send", function() { return send; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setController", function() { return setController; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setVolume", function() { return setVolume; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "programChange", function() { return programChange; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pitchBend", function() { return pitchBend; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "noteOn", function() { return noteOn; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "noteOff", function() { return noteOff; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "chordOn", function() { return chordOn; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "chordOff", function() { return chordOff; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stopAllNotes", function() { return stopAllNotes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setEffects", function() { return setEffects; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getContext", function() { return getContext; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setContext", function() { return setContext; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Player", function() { return Player; });
/* harmony import */ var _shim_WebAudioAPI_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./shim/WebAudioAPI.js */ "./js/shim/WebAudioAPI.js");
/* harmony import */ var _shim_WebAudioAPI_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_shim_WebAudioAPI_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _audioDetect_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./audioDetect.js */ "./js/audioDetect.js");
/* harmony import */ var _plugin_audiotag_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./plugin.audiotag.js */ "./js/plugin.audiotag.js");
/* harmony import */ var _plugin_webaudio_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./plugin.webaudio.js */ "./js/plugin.webaudio.js");
/* harmony import */ var _plugin_webmidi_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./plugin.webmidi.js */ "./js/plugin.webmidi.js");
/* harmony import */ var _gm_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./gm.js */ "./js/gm.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "GM", function() { return _gm_js__WEBPACK_IMPORTED_MODULE_5__["GM"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "noteToKey", function() { return _gm_js__WEBPACK_IMPORTED_MODULE_5__["noteToKey"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "keyToNote", function() { return _gm_js__WEBPACK_IMPORTED_MODULE_5__["keyToNote"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "channels", function() { return _gm_js__WEBPACK_IMPORTED_MODULE_5__["channels"]; });

/* harmony import */ var _player_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./player.js */ "./js/player.js");
/* harmony import */ var _synesthesia_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./synesthesia.js */ "./js/synesthesia.js");
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "Synesthesia", function() { return _synesthesia_js__WEBPACK_IMPORTED_MODULE_7__; });
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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
 // imported by default -- webmidi shim needs to be loaded separately









var Soundfont = {};
var audio_contexts = {
  AudioTag: _plugin_audiotag_js__WEBPACK_IMPORTED_MODULE_2__,
  WebAudio: _plugin_webaudio_js__WEBPACK_IMPORTED_MODULE_3__,
  WebMIDI: _plugin_webmidi_js__WEBPACK_IMPORTED_MODULE_4__
};
var config = {
  soundfontUrl: './soundfont/',
  api: undefined,
  audioFormat: undefined,
  supports: {},
  connected_plugin: undefined
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

var _loadPlugin = function loadPlugin(opts) {
  if (typeof opts === 'function') {
    opts = {
      onsuccess: opts
    };
  }

  opts.onprogress = opts.onprogress || undefined;
  opts.api = opts.api || '';
  opts.targetFormat = opts.targetFormat || '';
  opts.instrument = opts.instrument || 'acoustic_grand_piano';
  opts.instruments = opts.instruments || undefined; // MSC: add the order of API precedence.
  //      Chrome's need for sys permissions for webmidi makes it lower precedence.

  opts.apiPrecedence = opts.apiPrecedence || ['webaudio', 'webmidi', 'audiotag'];
  config.soundfontUrl = opts.soundfontUrl || config.soundfontUrl; // Detect the best type of audio to use

  Object(_audioDetect_js__WEBPACK_IMPORTED_MODULE_1__["audioDetect"])(function (supports) {
    var hash = window.location.hash;
    var api = ''; // use the most appropriate plugin if not specified

    if (supports[opts.api]) {
      api = opts.api;
    } else if (supports[hash.substr(1)]) {
      api = hash.substr(1);
    } else {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = opts.apiPrecedence[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var apiInOrder = _step.value;

          if (supports[apiInOrder]) {
            api = apiInOrder;
            break;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }

    if (connect[api]) {
      var audioFormat; // use audio/ogg when supported

      if (opts.targetFormat) {
        audioFormat = opts.targetFormat;
      } else {
        // use best quality
        audioFormat = supports['audio/ogg'] ? 'ogg' : 'mp3';
      } // load the specified plugin


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



var loadProgram = function loadProgram(opts) {
  var instruments = opts.instruments || opts.instrument || 'acoustic_grand_piano'; //

  if (_typeof(instruments) !== 'object') {
    if (instruments || instruments === 0) {
      instruments = [instruments];
    } else {
      instruments = [];
    }
  } // convert numeric ids into strings


  for (var i = 0; i < instruments.length; i++) {
    var instrument = instruments[i];

    if (instrument === instrument + 0) {
      // is numeric
      if (GM.byId[instrument]) {
        instruments[i] = GM.byId[instrument].id;
      }
    }
  } //


  opts.format = config.audioFormat;
  opts.instruments = instruments; //

  connect[config.api](opts);
};
var connect = {
  webmidi: function webmidi(opts) {
    // cant wait for this to be standardized!
    pre_connect(_plugin_webmidi_js__WEBPACK_IMPORTED_MODULE_4__, opts);
    _plugin_webmidi_js__WEBPACK_IMPORTED_MODULE_4__["connect"](opts);
  },
  audiotag: function audiotag(opts) {
    // works ok, kinda like a drunken tuna fish, across the board
    // http://caniuse.com/audio
    pre_connect(_plugin_audiotag_js__WEBPACK_IMPORTED_MODULE_2__, opts);
    requestQueue(opts, 'AudioTag');
  },
  webaudio: function webaudio(opts) {
    // works awesome! safari, chrome and firefox support
    // http://caniuse.com/web-audio
    pre_connect(_plugin_webaudio_js__WEBPACK_IMPORTED_MODULE_3__, opts);
    requestQueue(opts, 'WebAudio');
  }
};

var pre_connect = function pre_connect(plugin, opts) {
  config.connected_plugin = plugin;
  plugin.shared_root_info.Soundfont = Soundfont;
  plugin.shared_root_info.config = config;

  plugin.shared_root_info.webaudio_backup_connect = function (opts) {
    return connect['webaudio'](opts);
  };
};

var requestQueue = function requestQueue(opts, context) {
  var audioFormat = opts.format;
  var instruments = opts.instruments;
  var onprogress = opts.onprogress;
  var onerror = opts.onerror;
  var correct_audio_context = audio_contexts[context] || context.WebAudio;
  var num_instruments = instruments.length;
  var pending = num_instruments;

  var waitForEnd = function waitForEnd() {
    pending -= 1;

    if (!pending) {
      onprogress && onprogress('load', 1.0);
      correct_audio_context.connect(opts);
    }
  };

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    var _loop = function _loop() {
      var instrumentId = _step2.value;

      if (Soundfont[instrumentId]) {
        // already loaded
        waitForEnd();
      } else {
        // needs to be requested
        var onprogress_inner = function onprogress_inner(evt, progress) {
          var fileProgress = progress / num_instruments;
          var queueProgress = (num_instruments - pending) / num_instruments;
          onprogress && onprogress('load', fileProgress + queueProgress, instrumentId);
        };

        var onsuccess_inner = function onsuccess_inner() {
          return waitForEnd();
        };

        sendRequest(instrumentId, audioFormat, onprogress_inner, onsuccess_inner, onerror);
      }
    };

    for (var _iterator2 = instruments[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      _loop();
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
        _iterator2["return"]();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  ;
};
var sendRequest = function sendRequest(instrumentId, audioFormat, onprogress, onsuccess, onerror) {
  var soundfontPath = config.soundfontUrl + instrumentId + '-' + audioFormat + '.js';
  var xhr = new XMLHttpRequest();
  xhr.open('GET', soundfontPath);
  xhr.setRequestHeader('Content-Type', 'text/plain');

  xhr.onload = function () {
    if (xhr.status === 200) {
      var script = document.createElement('script');
      script.language = 'javascript';
      script.type = 'text/javascript'; // console.log(xhr.responseText);

      script.text = xhr.responseText;
      document.body.appendChild(script);
      onsuccess();
    } else {
      onerror();
    }
  };

  xhr.send();
};
var playChannel = function playChannel() {
  var _config$connected_plu;

  return (_config$connected_plu = config.connected_plugin).playChannel.apply(_config$connected_plu, arguments);
};
var stopChannel = function stopChannel() {
  var _config$connected_plu2;

  return (_config$connected_plu2 = config.connected_plugin).stopChannel.apply(_config$connected_plu2, arguments);
}; // TODO: audioBuffers

var send = function send() {
  var _config$connected_plu3;

  return (_config$connected_plu3 = config.connected_plugin).send.apply(_config$connected_plu3, arguments);
};
var setController = function setController() {
  var _config$connected_plu4;

  return (_config$connected_plu4 = config.connected_plugin).setController.apply(_config$connected_plu4, arguments);
};
var setVolume = function setVolume() {
  var _config$connected_plu5;

  return (_config$connected_plu5 = config.connected_plugin).setVolume.apply(_config$connected_plu5, arguments);
};
var programChange = function programChange() {
  var _config$connected_plu6;

  return (_config$connected_plu6 = config.connected_plugin).programChange.apply(_config$connected_plu6, arguments);
};
var pitchBend = function pitchBend() {
  var _config$connected_plu7;

  return (_config$connected_plu7 = config.connected_plugin).pitchBend.apply(_config$connected_plu7, arguments);
};
var noteOn = function noteOn() {
  var _config$connected_plu8;

  return (_config$connected_plu8 = config.connected_plugin).noteOn.apply(_config$connected_plu8, arguments);
};
var noteOff = function noteOff() {
  var _config$connected_plu9;

  return (_config$connected_plu9 = config.connected_plugin).noteOff.apply(_config$connected_plu9, arguments);
};
var chordOn = function chordOn() {
  var _config$connected_plu10;

  return (_config$connected_plu10 = config.connected_plugin).chordOn.apply(_config$connected_plu10, arguments);
};
var chordOff = function chordOff() {
  var _config$connected_plu11;

  return (_config$connected_plu11 = config.connected_plugin).chordOff.apply(_config$connected_plu11, arguments);
};
var stopAllNotes = function stopAllNotes() {
  var _config$connected_plu12;

  return (_config$connected_plu12 = config.connected_plugin).stopAllNotes.apply(_config$connected_plu12, arguments);
};
var setEffects = function setEffects() {
  if (config.connected_plugin !== _plugin_webaudio_js__WEBPACK_IMPORTED_MODULE_3__) {
    return;
  }

  return config.connected_plugin.setEffects();
};
var getContext = function getContext() {
  if (config.connected_plugin !== _plugin_webaudio_js__WEBPACK_IMPORTED_MODULE_3__) {
    return;
  }

  return config.connected_plugin.getContext();
};
var setContext = function setContext() {
  var _config$connected_plu13;

  if (config.connected_plugin !== _plugin_webaudio_js__WEBPACK_IMPORTED_MODULE_3__) {
    return;
  }

  return (_config$connected_plu13 = config.connected_plugin).setContext.apply(_config$connected_plu13, arguments);
}; // Player

var Player =
/*#__PURE__*/
function (_PlayInstance) {
  _inherits(Player, _PlayInstance);

  function Player() {
    _classCallCheck(this, Player);

    return _possibleConstructorReturn(this, _getPrototypeOf(Player).call(this, config.connected_plugin));
  }

  _createClass(Player, [{
    key: "loadPlugin",
    value: function loadPlugin() {
      return _loadPlugin.apply(void 0, arguments);
    }
  }]);

  return Player;
}(_player_js__WEBPACK_IMPORTED_MODULE_6__["PlayInstance"]);

/***/ }),

/***/ "./js/player.js":
/*!**********************!*\
  !*** ./js/player.js ***!
  \**********************/
/*! exports provided: PlayInstance */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PlayInstance", function() { return PlayInstance; });
/* harmony import */ var _gm_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./gm.js */ "./js/gm.js");
/* harmony import */ var _inc_jasmid_midifile_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../inc/jasmid/midifile.js */ "./inc/jasmid/midifile.js");
/* harmony import */ var _inc_jasmid_replayer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../inc/jasmid/replayer.js */ "./inc/jasmid/replayer.js");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/*
	----------------------------------------------------------
	MIDI.Player : 0.3.1 : 2015-03-26
	----------------------------------------------------------
	https://github.com/mudcube/MIDI.js
	----------------------------------------------------------
*/



var PlayInstance =
/*#__PURE__*/
function () {
  function PlayInstance(plugin) {
    _classCallCheck(this, PlayInstance);

    this.plugin = plugin;
    this.currentTime = 0;
    this.endTime = 0;
    this.restart = 0;
    this.playing = false;
    this.timeWarp = 1;
    this.startDelay = 0;
    this.BPM = 120;
    this.eventQueue = []; // hold events to be triggered

    this.queuedTime = 0.0; //

    this.startTime = 0; // to measure time elapse

    this.noteRegistrar = {}; // get event for requested note

    this.onMidiEvent = undefined; // listener

    this.frame = undefined;
    this.__now = undefined;
  }

  _createClass(PlayInstance, [{
    key: "start",
    value: function start(onsuccess) {
      if (this.currentTime < -1) {
        this.currentTime = -1;
      }

      this.startAudio(this.currentTime, null, onsuccess);
    }
  }, {
    key: "resume",
    value: function resume(onsuccess) {
      return this.start(onsuccess);
    }
  }, {
    key: "pause",
    value: function pause() {
      var tmp = this.restart;
      this.stopAudio();
      this.restart = tmp;
    }
  }, {
    key: "stop",
    value: function stop() {
      this.stopAudio();
      this.restart = 0;
      this.currentTime = 0;
    }
  }, {
    key: "addListener",
    value: function addListener(onsuccess) {
      this.onMidiEvent = onsuccess;
    }
  }, {
    key: "removeListener",
    value: function removeListener() {
      this.onMidiEvent = undefined;
    }
  }, {
    key: "clearAnimation",
    value: function clearAnimation() {
      if (this.animationFrameId) {
        cancelAnimationFrame(mthis.animationFrameId);
      }
    }
  }, {
    key: "setAnimation",
    value: function setAnimation(callback) {
      var _this = this;

      var currentTime = 0;
      var tOurTime = 0;
      var tTheirTime = 0;
      this.clearAnimation();

      this.frame = function () {
        _this.animationFrameId = requestAnimationFrame(_this.frame); //

        if (_this.endTime === 0) {
          return;
        }

        if (_this.playing) {
          currentTime = tTheirTime === _this.currentTime ? tOurTime - Date.now() : 0;

          if (_this.currentTime === 0) {
            currentTime = 0;
          } else {
            currentTime = _this.currentTime - currentTime;
          }

          if (tTheirTime !== _this.currentTime) {
            tOurTime = Date.now();
            tTheirTime = _this.currentTime;
          }
        } else {
          // paused
          currentTime = _this.currentTime;
        }

        var endTime = _this.endTime; // const percent = currentTime / endTime;

        var total = currentTime / 1000;
        var minutes = total / 60;
        var seconds = total - minutes * 60;
        var t1 = minutes * 60 + seconds;
        var t2 = endTime / 1000;

        if (t2 - t1 < -1.0) {
          // noinspection UnnecessaryReturnStatementJS
          return;
        } else {
          callback({
            now: t1,
            end: t2,
            events: _this.noteRegistrar
          });
        }
      };

      requestAnimationFrame(this.frame);
    }
  }, {
    key: "loadMidiFile",
    value: function loadMidiFile(onsuccess, onprogress, onerror) {
      try {
        this.replayer = new _inc_jasmid_replayer_js__WEBPACK_IMPORTED_MODULE_2__["Replayer"](Object(_inc_jasmid_midifile_js__WEBPACK_IMPORTED_MODULE_1__["MidiFile"])(this.currentData), this.timeWarp, null, this.BPM);
        this.data = this.replayer.getData();
        this.endTime = this.getLength();
        this.loadPlugin({
          // instruments: this.getFileInstruments(),
          onsuccess: onsuccess,
          onprogress: onprogress,
          onerror: onerror
        });
      } catch (event) {
        onerror && onerror(event);
      }
    }
  }, {
    key: "loadPlugin",
    value: function loadPlugin() {// override in subclasses
    }
  }, {
    key: "loadFile",
    value: function loadFile(file, onsuccess, onprogress, onerror) {
      var _this2 = this;

      this.stop();

      if (file.indexOf('base64,') !== -1) {
        this.currentData = atob(file.split(',')[1]);
        this.loadMidiFile(onsuccess, onprogress, onerror);
      } else {
        var fetch = new XMLHttpRequest();
        fetch.open('GET', file);
        fetch.overrideMimeType('text/plain; charset=x-user-defined');

        fetch.onreadystatechange = function () {
          if (fetch.readyState === 4) {
            if (fetch.status === 200) {
              var t = fetch.responseText || '';
              var ff = [];
              var mx = t.length;
              var scc = String.fromCharCode;

              for (var z = 0; z < mx; z++) {
                ff[z] = scc(t.charCodeAt(z) & 255);
              }

              _this2.currentData = ff.join('');

              _this2.loadMidiFile(onsuccess, onprogress, onerror);
            } else {
              onerror && onerror('Unable to load MIDI file');
            }
          }
        };

        fetch.send();
      }
    }
  }, {
    key: "getFileInstruments",
    value: function getFileInstruments() {
      var instruments = {};
      var programs = {};

      for (var n = 0; n < midi.data.length; n++) {
        var event = midi.data[n][0].event;

        if (event.type !== 'channel') {
          continue;
        }

        var channel = event.channel;

        switch (event.subtype) {
          case 'controller':
            //                  console.log(event.channel, MIDI.defineControl[event.controllerType], event.value);
            break;

          case 'programChange':
            programs[channel] = event.programNumber;
            break;

          case 'noteOn':
            var program = programs[channel];
            var gm = _gm_js__WEBPACK_IMPORTED_MODULE_0__["GM"].byId[isFinite(program) ? program : channel];
            instruments[gm.id] = true;
            break;
        }
      }

      var ret = [];

      for (var _i = 0, _Object$keys = Object.keys(instruments); _i < _Object$keys.length; _i++) {
        var key = _Object$keys[_i];
        ret.push(key);
      }

      return ret;
    } // Playing the audio

  }, {
    key: "scheduleTracking",
    value: function scheduleTracking(channel, note, currentTime, offset, message, velocity, time) {
      var _this3 = this;

      return setTimeout(function () {
        var data = {
          channel: channel,
          note: note,
          now: currentTime,
          end: _this3.endTime,
          message: message,
          velocity: velocity
        };

        if (message === 128) {
          delete _this3.noteRegistrar[note];
        } else {
          _this3.noteRegistrar[note] = data;
        }

        if (_this3.onMidiEvent) {
          _this3.onMidiEvent(data);
        }

        _this3.currentTime = currentTime;

        _this3.eventQueue.shift();

        if (_this3.eventQueue.length < 1000) {
          _this3.startAudio(_this3.queuedTime, true);
        } else if (_this3.currentTime === _this3.queuedTime && _this3.queuedTime < _this3.endTime) {
          // grab next sequence
          _this3.startAudio(_this3.queuedTime, true);
        }
      }, currentTime - offset);
    }
  }, {
    key: "getContext",
    value: function getContext() {
      if (MIDI.api === 'webaudio') {
        return MIDI.WebAudio.getContext();
      } else {
        this.ctx = {
          currentTime: 0
        };
      }

      return this.ctx;
    }
  }, {
    key: "getLength",
    value: function getLength() {
      var data = this.data;
      var length = data.length;
      var totalTime = 0.5;

      for (var n = 0; n < length; n++) {
        totalTime += data[n][1];
      }

      return totalTime;
    }
  }, {
    key: "getNow",
    value: function getNow() {
      if (window.performance && window.performance.now) {
        return window.performance.now();
      } else {
        return Date.now();
      }
    }
  }, {
    key: "startAudio",
    value: function startAudio(currentTime, fromCache, onsuccess) {
      if (!this.replayer) {
        return;
      }

      if (!fromCache) {
        if (typeof currentTime === 'undefined') {
          currentTime = this.restart;
        }

        this.playing && this.stopAudio();
        this.playing = true;
        this.data = this.replayer.getData();
        this.endTime = this.getLength();
      }

      var note;
      var offset = 0;
      var messages = 0;
      var data = this.data;
      var ctx = this.getContext();
      var length = data.length;
      this.queuedTime = 0.5;
      var interval = this.eventQueue[0] && this.eventQueue[0].interval || 0;
      var foffset = currentTime - this.currentTime;

      if (MIDI.api !== 'webaudio') {
        // set currentTime on ctx
        var now = this.getNow();
        this.__now = this.__now || now;
        ctx.currentTime = (now - this.__now) / 1000;
      }

      this.startTime = ctx.currentTime;

      for (var n = 0; n < length && messages < 100; n++) {
        var obj = data[n];

        if ((this.queuedTime += obj[1]) <= currentTime) {
          offset = this.queuedTime;
          continue;
        }

        currentTime = this.queuedTime - offset;
        var event = obj[0].event;

        if (event.type !== 'channel') {
          continue;
        }

        var channelId = event.channel;
        var channel = _gm_js__WEBPACK_IMPORTED_MODULE_0__["channels"][channelId];
        var delay = ctx.currentTime + (currentTime + foffset + this.startDelay) / 1000;
        var queueTime = this.queuedTime - offset + this.startDelay;

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
            note = event.noteNumber - (this.MIDIOffset || 0);
            this.eventQueue.push({
              event: event,
              time: queueTime,
              source: MIDI.noteOn(channelId, event.noteNumber, event.velocity, delay),
              interval: this.scheduleTracking(channelId, note, this.queuedTime + this.startDelay, offset - foffset, 144, event.velocity)
            });
            messages++;
            break;

          case 'noteOff':
            if (channel.mute) {
              break;
            }

            note = event.noteNumber - (this.MIDIOffset || 0);
            this.eventQueue.push({
              event: event,
              time: queueTime,
              source: MIDI.noteOff(channelId, event.noteNumber, delay),
              interval: this.scheduleTracking(channelId, note, this.queuedTime, offset - foffset, 128, 0)
            });
            break;

          default:
            break;
        }
      } //


      onsuccess && onsuccess(this.eventQueue);
    }
  }, {
    key: "stopAudio",
    value: function stopAudio() {
      var ctx = this.getContext();
      this.playing = false;
      this.restart += (ctx.currentTime - this.startTime) * 1000; // stop the audio, and intervals

      while (this.eventQueue.length) {
        var o = this.eventQueue.pop();
        window.clearInterval(o.interval);

        if (!o.source) {
          continue; // is not webaudio
        }

        if (typeof o.source === 'number') {
          window.clearTimeout(o.source);
        } else {
          // webaudio
          o.source.disconnect(0);
        }
      } // run callback to cancel any notes still playing


      for (var key in this.noteRegistrar) {
        var _o = this.noteRegistrar[key];

        if (this.noteRegistrar[key].message === 144 && this.onMidiEvent) {
          this.onMidiEvent({
            channel: _o.channel,
            note: _o.note,
            now: _o.now,
            end: _o.end,
            message: 128,
            velocity: _o.velocity
          });
        }
      } // reset noteRegistrar


      this.noteRegistrar = {};
    }
  }]);

  return PlayInstance;
}();

/***/ }),

/***/ "./js/plugin.audiotag.js":
/*!*******************************!*\
  !*** ./js/plugin.audiotag.js ***!
  \*******************************/
/*! exports provided: shared_root_info, playChannel, stopChannel, send, setController, setVolume, programChange, pitchBend, noteOn, noteOff, chordOn, chordOff, stopAllNotes, connect */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "shared_root_info", function() { return shared_root_info; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "playChannel", function() { return playChannel; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stopChannel", function() { return stopChannel; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "send", function() { return send; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setController", function() { return setController; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setVolume", function() { return setVolume; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "programChange", function() { return programChange; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pitchBend", function() { return pitchBend; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "noteOn", function() { return noteOn; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "noteOff", function() { return noteOff; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "chordOn", function() { return chordOn; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "chordOff", function() { return chordOff; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stopAllNotes", function() { return stopAllNotes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "connect", function() { return connect; });
/* harmony import */ var _debug_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./debug.js */ "./js/debug.js");
/* harmony import */ var _gm_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./gm.js */ "./js/gm.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*
	----------------------------------------------------------------------
	AudioTag <audio> - OGG or MPEG Soundbank
	----------------------------------------------------------------------
	http://dev.w3.org/html5/spec/Overview.html#the-audio-element
	----------------------------------------------------------------------
*/

 // information to share with loader...

var shared_root_info = {};
var volumes = []; // floating point

for (var vid = 0; vid < 16; vid++) {
  volumes[vid] = 127;
}

var buffer_nid = -1; // current channel

var notesOn = []; // instrumentId + noteId that is currently playing in each 'channel', for routing noteOff/chordOff calls

var notes = {}; // the piano keys

var audioBuffers = []; // the audio channels

for (var nid = 0; nid < 12; nid++) {
  audioBuffers[nid] = new Audio();
}

var playChannel = function playChannel(channel, in_note) {
  if (!_gm_js__WEBPACK_IMPORTED_MODULE_1__["channels"][channel]) {
    return;
  }

  var instrument = _gm_js__WEBPACK_IMPORTED_MODULE_1__["channels"][channel].program;
  var instrumentId = _gm_js__WEBPACK_IMPORTED_MODULE_1__["GM"].byId[instrument].id;
  var note = notes[in_note];

  if (note) {
    var instrumentNoteId = instrumentId + '' + note.id;

    var _nid = (buffer_nid + 1) % audioBuffers.length;

    var audio = audioBuffers[_nid];
    notesOn[_nid] = instrumentNoteId;

    if (!shared_root_info.Soundfont[instrumentId]) {
      if (_debug_js__WEBPACK_IMPORTED_MODULE_0__["DEBUG"]) {
        console.log('404', instrumentId);
      }

      return;
    }

    audio.src = shared_root_info.Soundfont[instrumentId][note.id];
    audio.volume = volumes[channel] / 127;
    audio.play();
    buffer_nid = _nid;
  }
};
var stopChannel = function stopChannel(channel, in_note) {
  if (!_gm_js__WEBPACK_IMPORTED_MODULE_1__["channels"][channel]) {
    return;
  }

  var instrument = _gm_js__WEBPACK_IMPORTED_MODULE_1__["channels"][channel].program;
  var instrumentId = _gm_js__WEBPACK_IMPORTED_MODULE_1__["GM"].byId[instrument].id;
  var note = notes[in_note];

  if (note) {
    var instrumentNoteId = instrumentId + '' + note.id;

    for (var i = 0, len = audioBuffers.length; i < len; i++) {
      var _nid2 = (i + buffer_nid + 1) % len;

      var cId = notesOn[_nid2];

      if (cId && cId === instrumentNoteId) {
        audioBuffers[_nid2].pause();

        notesOn[_nid2] = null;
        return;
      }
    }
  }
}; // midi.audioBuffers = audioBuffers;

var send = function send(data, delay) {};
var setController = function setController(channel, type, value, delay) {};
var setVolume = function setVolume(channel, n) {
  volumes[channel] = n;
};
var programChange = function programChange(channel, program) {
  _gm_js__WEBPACK_IMPORTED_MODULE_1__["channels"][channel].instrument = program;
};
var pitchBend = function pitchBend(channel, program, delay) {};
var noteOn = function noteOn(channel, note, velocity, delay) {
  var id = _gm_js__WEBPACK_IMPORTED_MODULE_1__["noteToKey"][note];

  if (!notes[id]) {
    return;
  }

  if (delay) {
    return setTimeout(function () {
      volumes[channel] = velocity;
      playChannel(channel, id);
    }, delay * 1000);
  } else {
    volumes[channel] = velocity;
    playChannel(channel, id);
  }
};
var noteOff = function noteOff(channel, note, delay) {// MSC: Commented out in MudCube version...
  //      I see why!  clips all the notes!
  // const id = noteToKey[note];
  // if (!notes[id]) {
  // 	return;
  // }
  // if (delay) {
  // 	return setTimeout(function() {
  // 		stopChannel(channel, id);
  // 	}, delay * 1000)
  // } else {
  // 	stopChannel(channel, id);
  // }
};
var chordOn = function chordOn(channel, chord, velocity, delay) {
  var _loop = function _loop(idx) {
    var n = chord[idx];
    var id = _gm_js__WEBPACK_IMPORTED_MODULE_1__["noteToKey"][n];

    if (!notes[id]) {
      return "continue";
    }

    if (delay) {
      return {
        v: setTimeout(function () {
          playChannel(channel, id);
        }, delay * 1000)
      };
    } else {
      playChannel(channel, id);
    }
  };

  for (var idx = 0; idx < chord.length; idx++) {
    var _ret = _loop(idx);

    switch (_ret) {
      case "continue":
        continue;

      default:
        if (_typeof(_ret) === "object") return _ret.v;
    }
  }
};
var chordOff = function chordOff(channel, chord, delay) {
  var _loop2 = function _loop2(idx) {
    var n = chord[idx];
    var id = _gm_js__WEBPACK_IMPORTED_MODULE_1__["noteToKey"][n];

    if (!notes[id]) {
      return "continue";
    }

    if (delay) {
      return {
        v: setTimeout(function () {
          stopChannel(channel, id);
        }, delay * 1000)
      };
    } else {
      stopChannel(channel, id);
    }
  };

  for (var idx = 0; idx < chord.length; idx++) {
    var _ret2 = _loop2(idx);

    switch (_ret2) {
      case "continue":
        continue;

      default:
        if (_typeof(_ret2) === "object") return _ret2.v;
    }
  }
};
var stopAllNotes = function stopAllNotes() {
  for (var _nid3 = 0, length = audioBuffers.length; _nid3 < length; _nid3++) {
    audioBuffers[_nid3].pause();
  }
};
var connect = function connect(opts) {
  for (var key in _gm_js__WEBPACK_IMPORTED_MODULE_1__["keyToNote"]) {
    notes[key] = {
      id: key
    };
  } //


  opts.onsuccess && opts.onsuccess();
};

/***/ }),

/***/ "./js/plugin.webaudio.js":
/*!*******************************!*\
  !*** ./js/plugin.webaudio.js ***!
  \*******************************/
/*! exports provided: shared_root_info, send, setController, setVolume, programChange, pitchBend, noteOn, noteOff, chordOn, chordOff, stopAllNotes, setEffects, connect, getContext, setContext, loadAudio, createAudioContext */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "shared_root_info", function() { return shared_root_info; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "send", function() { return send; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setController", function() { return setController; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setVolume", function() { return setVolume; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "programChange", function() { return programChange; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pitchBend", function() { return pitchBend; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "noteOn", function() { return noteOn; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "noteOff", function() { return noteOff; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "chordOn", function() { return chordOn; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "chordOff", function() { return chordOff; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stopAllNotes", function() { return stopAllNotes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setEffects", function() { return setEffects; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "connect", function() { return connect; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getContext", function() { return getContext; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setContext", function() { return setContext; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadAudio", function() { return loadAudio; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createAudioContext", function() { return createAudioContext; });
/* harmony import */ var _debug_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./debug.js */ "./js/debug.js");
/* harmony import */ var _gm_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./gm.js */ "./js/gm.js");
/* harmony import */ var _shim_Base64binary_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./shim/Base64binary.js */ "./js/shim/Base64binary.js");
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/*
	----------------------------------------------------------
	Web Audio API - OGG or MPEG Soundbank
	----------------------------------------------------------
	http://webaudio.github.io/web-audio-api/
	----------------------------------------------------------
*/


 // information to share with loader...

var shared_root_info = {};
var audioContext = null; // new AudioContext();

var useStreamingBuffer = false; // !!audioContext.createMediaElementSource;

var ctx; // audio context

var sources = {};
var effects = {};
var masterVolume = 127;
var audioBuffers = {};
var send = function send(data, delay) {};
var setController = function setController(channelId, type, value, delay) {};
var setVolume = function setVolume(channelId, volume, delay) {
  if (delay) {
    setTimeout(function () {
      masterVolume = volume;
    }, delay * 1000);
  } else {
    masterVolume = volume;
  }
};
var programChange = function programChange(channelId, program, delay) {
  // delay is ignored
  var channel = _gm_js__WEBPACK_IMPORTED_MODULE_1__["channels"][channelId];

  if (channel) {
    channel.program = program;
  }
};
var pitchBend = function pitchBend(channelId, bend, delay) {
  // delay is ignored
  var channel = _gm_js__WEBPACK_IMPORTED_MODULE_1__["channels"][channelId];

  if (channel) {
    if (delay) {
      setTimeout(function () {
        return channel.pitchBend = bend;
      }, delay);
    } else {
      channel.pitchBend = bend;
    }
  }
};
var noteOn = function noteOn(channelId, noteId, velocity, delay) {
  delay = delay || 0; // check whether the note exists

  var channel = _gm_js__WEBPACK_IMPORTED_MODULE_1__["channels"][channelId];
  var program = channel.program;
  var bufferId = program + 'x' + noteId;
  var buffer = audioBuffers[bufferId];

  if (!buffer) {
    if (_debug_js__WEBPACK_IMPORTED_MODULE_0__["DEBUG"]) {
      console.log('no buffer', _gm_js__WEBPACK_IMPORTED_MODULE_1__["GM"].byId[program].id, program, channelId);
    }

    return;
  } // convert relative delay to absolute delay


  if (delay < ctx.currentTime) {
    delay += ctx.currentTime;
  } // create audio buffer


  var source;

  if (useStreamingBuffer) {
    source = ctx.createMediaElementSource(buffer);
  } else {
    // XMLHTTP buffer
    source = ctx.createBufferSource();
    source.buffer = buffer;
  } // add effects to buffer


  if (effects) {
    var chain = source;

    for (var key in effects) {
      chain.connect(effects[key].input);
      chain = effects[key];
    }
  } // add gain + pitchShift


  var gain = velocity / 127 * (masterVolume / 127) * 2 - 1;
  source.connect(ctx.destination);
  source.playbackRate.value = 1; // pitch shift

  source.gainNode = ctx.createGain(); // gain

  source.gainNode.connect(ctx.destination);
  source.gainNode.gain.value = Math.min(1.0, Math.max(-1.0, gain));
  source.connect(source.gainNode);

  if (useStreamingBuffer) {
    if (delay) {
      return setTimeout(function () {
        buffer.currentTime = 0;
        buffer.play();
      }, delay * 1000);
    } else {
      buffer.currentTime = 0;
      buffer.play();
    }
  } else {
    source.start(delay || 0);
  }

  sources[channelId + 'x' + noteId] = source;
  return source;
};
var noteOff = function noteOff(channelId, noteId, delay) {
  delay = delay || 0; // check whether the note exists

  var channel = _gm_js__WEBPACK_IMPORTED_MODULE_1__["channels"][channelId];
  var program = channel.program;
  var bufferId = program + 'x' + noteId;
  var buffer = audioBuffers[bufferId];

  if (buffer) {
    if (delay < ctx.currentTime) {
      delay += ctx.currentTime;
    }

    var source = sources[channelId + 'x' + noteId];

    if (source) {
      if (source.gainNode) {
        // @Miranet: 'the values of 0.2 and 0.3 could of course be used as
        // a 'release' parameter for ADSR like time settings.'
        // add { 'metadata': { release: 0.3 } } to soundfont files
        var gain = source.gainNode.gain;
        gain.linearRampToValueAtTime(gain.value, delay);
        gain.linearRampToValueAtTime(-1.0, delay + 0.3);
      }

      if (useStreamingBuffer) {
        if (delay) {
          setTimeout(function () {
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
var chordOn = function chordOn(channel, chord, velocity, delay) {
  var res = {};
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = chord[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var note = _step.value;
      res[note] = noteOn(channel, note, velocity, delay);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return res;
};
var chordOff = function chordOff(channel, chord, delay) {
  var res = {};
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = chord[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var note = _step2.value;
      res[note] = noteOff(channel, note, delay);
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
        _iterator2["return"]();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return res;
};
var stopAllNotes = function stopAllNotes() {
  for (var sid in sources) {
    var delay = 0;

    if (delay < ctx.currentTime) {
      delay += ctx.currentTime;
    }

    var source = sources[sid];
    source.gain.linearRampToValueAtTime(1, delay);
    source.gain.linearRampToValueAtTime(0, delay + 0.3);

    if (source.noteOff) {
      // old api
      source.noteOff(delay + 0.3);
    } else {
      // new api
      source.stop(delay + 0.3);
    }

    delete sources[sid];
  }
};
var setEffects = function setEffects(list) {
  if (ctx && ctx.tunajs) {
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = list[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var data = _step3.value;
        var effect = new ctx.tunajs[data.type](data);
        effect.connect(ctx.destination);
        effects[data.type] = effect;
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
          _iterator3["return"]();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }
  } else {
    return console.log('Effects module not installed.');
  }
};
var connect = function connect(opts) {
  setContext(ctx || createAudioContext(), opts.onsuccess);
};
var getContext = function getContext() {
  return ctx;
};
var setContext = function setContext(newCtx, onsuccess, onprogress, onerror) {
  ctx = newCtx; // tuna.js effects module - https://github.com/Dinahmoe/tuna

  if (typeof Tuna !== 'undefined' && !(ctx.tunajs instanceof Tuna)) {
    ctx.tunajs = new Tuna(ctx);
  } // loading audio files


  var urls = [];

  for (var key in _gm_js__WEBPACK_IMPORTED_MODULE_1__["keyToNote"]) {
    urls.push(key);
  }

  var waitForEnd = function waitForEnd(instrument) {
    for (var _i = 0, _Object$keys = Object.keys(bufferPending); _i < _Object$keys.length; _i++) {
      var _key = _Object$keys[_i];

      // has pending items
      if (bufferPending[_key]) {
        return;
      }
    }

    if (onsuccess) {
      // run onsuccess once
      onsuccess();
      onsuccess = null;
    }
  };

  var requestAudio = function requestAudio(soundfont, programId, index, key) {
    var url = soundfont[key];

    if (url) {
      bufferPending[programId]++;
      loadAudio(url, function (buffer) {
        buffer.id = key;
        var noteId = _gm_js__WEBPACK_IMPORTED_MODULE_1__["keyToNote"][key];
        audioBuffers[programId + 'x' + noteId] = buffer;

        if (--bufferPending[programId] === 0) {
          var percent = index / 87;

          if (_debug_js__WEBPACK_IMPORTED_MODULE_0__["DEBUG"]) {
            console.log(_gm_js__WEBPACK_IMPORTED_MODULE_1__["GM"].byId[programId], 'processing: ', percent);
          }

          soundfont.isLoaded = true;
          waitForEnd(programId);
        }
      }, function (err) {
        console.log(err);
      });
    }
  };

  var bufferPending = {};

  for (var _i2 = 0, _Object$entries = Object.entries(shared_root_info.Soundfont); _i2 < _Object$entries.length; _i2++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i2], 2),
        instrument = _Object$entries$_i[0],
        soundfont = _Object$entries$_i[1];

    if (soundfont.isLoaded) {
      continue;
    }

    var spec = _gm_js__WEBPACK_IMPORTED_MODULE_1__["GM"].byName[instrument];

    if (spec) {
      var programId = spec.program;
      bufferPending[programId] = 0;

      for (var index = 0; index < urls.length; index++) {
        var _key2 = urls[index];
        requestAudio(soundfont, programId, index, _key2);
      }
    }
  }

  setTimeout(waitForEnd, 1);
};
/* Load audio file: streaming | base64 | arraybuffer
---------------------------------------------------------------------- */

var loadAudio = function loadAudio(url, onsuccess, onerror) {
  if (useStreamingBuffer) {
    var audio = new Audio();
    audio.src = url;
    audio.controls = false;
    audio.autoplay = false;
    audio.preload = false;
    audio.addEventListener('canplay', function () {
      onsuccess && onsuccess(audio);
    });
    audio.addEventListener('error', function (err) {
      onerror && onerror(err);
    });
    document.body.appendChild(audio);
  } else if (url.indexOf('data:audio') === 0) {
    // Base64 string
    var base64 = url.split(',')[1];
    var buffer = _shim_Base64binary_js__WEBPACK_IMPORTED_MODULE_2__["decodeArrayBuffer"](base64);
    return ctx.decodeAudioData(buffer, onsuccess, onerror);
  } else {
    // XMLHTTP buffer
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onsuccess = function () {
      return ctx.decodeAudioData(request.response, onsuccess, onerror);
    };

    request.send();
  }
};
var createAudioContext = function createAudioContext() {
  return new (window.AudioContext || window.webkitAudioContext)();
};

/***/ }),

/***/ "./js/plugin.webmidi.js":
/*!******************************!*\
  !*** ./js/plugin.webmidi.js ***!
  \******************************/
/*! exports provided: shared_root_info, send, setController, setVolume, programChange, pitchBend, noteOn, noteOff, chordOn, chordOff, stopAllNotes, connect */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "shared_root_info", function() { return shared_root_info; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "send", function() { return send; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setController", function() { return setController; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setVolume", function() { return setVolume; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "programChange", function() { return programChange; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pitchBend", function() { return pitchBend; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "noteOn", function() { return noteOn; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "noteOff", function() { return noteOff; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "chordOn", function() { return chordOn; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "chordOff", function() { return chordOff; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stopAllNotes", function() { return stopAllNotes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "connect", function() { return connect; });
/*
	----------------------------------------------------------------------
	Web MIDI API - Native Soundbanks
	----------------------------------------------------------------------
	http://webaudio.github.io/web-midi-api/
	----------------------------------------------------------------------
*/
// information to share with loader...
var shared_root_info = {};
var plugin = null;
var output = null;
var channels = [];
var send = function send(data, delay) {
  // set channel volume
  output.send(data, delay * 1000);
};
var setController = function setController(channel, type, value, delay) {
  output.send([channel, type, value], delay * 1000);
};
var setVolume = function setVolume(channel, volume, delay) {
  // set channel volume
  output.send([0xB0 + channel, 0x07, volume], delay * 1000);
};
var programChange = function programChange(channel, program, delay) {
  // change patch (instrument)
  output.send([0xC0 + channel, program], delay * 1000);
};
var pitchBend = function pitchBend(channel, program, delay) {
  // pitch bend
  output.send([0xE0 + channel, program], delay * 1000);
};
var noteOn = function noteOn(channel, note, velocity, delay) {
  output.send([0x90 + channel, note, velocity], delay * 1000);
};
var noteOff = function noteOff(channel, note, delay) {
  output.send([0x80 + channel, note, 0], delay * 1000);
};
var chordOn = function chordOn(channel, chord, velocity, delay) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = chord[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var note = _step.value;
      output.send([0x90 + channel, note, velocity], delay * 1000);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
};
var chordOff = function chordOff(channel, chord, delay) {
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = chord[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var note = _step2.value;
      output.send([0x80 + channel, note, 0], delay * 1000);
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
        _iterator2["return"]();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }
};
var stopAllNotes = function stopAllNotes() {
  output.cancel();

  for (var channel = 0; channel < 16; channel++) {
    output.send([0xB0 + channel, 0x7B, 0]);
  }
};
var connect = function connect(opts) {
  var errFunction = function errFunction(err) {
    console.error('Could not connect to web midi! Falling back to WebAudio:', err); // we tried.  Anything that sort of supports webmidi should support WebAudio.

    if (shared_root_info.webaudio_backup_connect) {
      shared_root_info.config.api = 'webaudio';
      shared_root_info.webaudio_backup_connect(opts);
    }
  };

  navigator.requestMIDIAccess().then(function (access) {
    var plugin = access;
    var pluginOutputs = plugin.outputs;

    if (typeof pluginOutputs == 'function') {
      // Chrome pre-43
      output = pluginOutputs()[0];
    } else {
      // Chrome post-43
      output = pluginOutputs[0];
    }

    if (output === undefined) {
      // nothing there...
      errFunction('No outputs defined');
    } else {
      opts.onsuccess && opts.onsuccess();
    }
  }, errFunction);
};

/***/ }),

/***/ "./js/shim/Base64binary.js":
/*!*********************************!*\
  !*** ./js/shim/Base64binary.js ***!
  \*********************************/
/*! exports provided: decodeArrayBuffer, decode */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "decodeArrayBuffer", function() { return decodeArrayBuffer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "decode", function() { return decode; });
/**
 * @license -------------------------------------------------------------------
 *   module: Base64Binary
 *      src: http://blog.danguer.com/2011/10/24/base64-binary-decoding-in-javascript/
 *  license: Simplified BSD License
 * -------------------------------------------------------------------
 * Copyright 2011, Daniel Guerrero. All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     - Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     - Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL DANIEL GUERRERO BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * Modified by MSC to be a module.
 * @type {string}
 * @private
 */
var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
/* will return a  Uint8Array type */

function decodeArrayBuffer(input) {
  var bytes = Math.ceil(3 * input.length / 4.0);
  var ab = new ArrayBuffer(bytes);
  decode(input, ab);
  return ab;
}
function decode(input, arrayBuffer) {
  //get last chars to see if are valid
  var lkey1 = _keyStr.indexOf(input.charAt(input.length - 1));

  var lkey2 = _keyStr.indexOf(input.charAt(input.length - 1));

  var bytes = Math.ceil(3 * input.length / 4.0);

  if (lkey1 === 64) {
    bytes--;
  } //padding chars, so skip


  if (lkey2 === 64) {
    bytes--;
  } //padding chars, so skip


  var uarray;
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var j = 0;

  if (arrayBuffer) {
    uarray = new Uint8Array(arrayBuffer);
  } else {
    uarray = new Uint8Array(bytes);
  }

  input = input.replace(/[^A-Za-z0-9+\/=]/g, "");

  for (var i = 0; i < bytes; i += 3) {
    // get the 3 octets in 4 ascii chars
    enc1 = _keyStr.indexOf(input.charAt(j++));
    enc2 = _keyStr.indexOf(input.charAt(j++));
    enc3 = _keyStr.indexOf(input.charAt(j++));
    enc4 = _keyStr.indexOf(input.charAt(j++));
    chr1 = enc1 << 2 | enc2 >> 4;
    chr2 = (enc2 & 15) << 4 | enc3 >> 2;
    chr3 = (enc3 & 3) << 6 | enc4;
    uarray[i] = chr1;

    if (enc3 !== 64) {
      uarray[i + 1] = chr2;
    }

    if (enc4 !== 64) {
      uarray[i + 2] = chr3;
    }
  }

  return uarray;
}

/***/ }),

/***/ "./js/shim/WebAudioAPI.js":
/*!********************************!*\
  !*** ./js/shim/WebAudioAPI.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * @license -------------------------------------------------------------------
 *   module: WebAudioShim - Fix naming issues for WebAudioAPI supports
 *      src: https://github.com/Dinahmoe/webaudioshim
 *   author: Dinahmoe AB
 * -------------------------------------------------------------------
 * Copyright (c) 2012 DinahMoe AB
 * 
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
window.AudioContext = window.AudioContext || window.webkitAudioContext || null;
window.OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext || null;

(function (Context) {
  var isFunction = function isFunction(f) {
    return Object.prototype.toString.call(f) === "[object Function]" || Object.prototype.toString.call(f) === "[object AudioContextConstructor]";
  };

  var contextMethods = [["createGainNode", "createGain"], ["createDelayNode", "createDelay"], ["createJavaScriptNode", "createScriptProcessor"]]; //

  var proto;
  var instance;
  var sourceProto; //

  if (!isFunction(Context)) {
    return;
  }

  instance = new Context();

  if (!instance.destination || !instance.sampleRate) {
    return;
  }

  proto = Context.prototype;
  sourceProto = Object.getPrototypeOf(instance.createBufferSource());

  if (!isFunction(sourceProto.start)) {
    if (isFunction(sourceProto.noteOn)) {
      sourceProto.start = function (when, offset, duration) {
        switch (arguments.length) {
          case 0:
            throw new Error("Not enough arguments.");

          case 1:
            this.noteOn(when);
            break;

          case 2:
            if (this.buffer) {
              this.noteGrainOn(when, offset, this.buffer.duration - offset);
            } else {
              throw new Error("Missing AudioBuffer");
            }

            break;

          case 3:
            this.noteGrainOn(when, offset, duration);
        }
      };
    }
  }

  if (!isFunction(sourceProto.noteOn)) {
    sourceProto.noteOn = sourceProto.start;
  }

  if (!isFunction(sourceProto.noteGrainOn)) {
    sourceProto.noteGrainOn = sourceProto.start;
  }

  if (!isFunction(sourceProto.stop)) {
    sourceProto.stop = sourceProto.noteOff;
  }

  if (!isFunction(sourceProto.noteOff)) {
    sourceProto.noteOff = sourceProto.stop;
  }

  contextMethods.forEach(function (names) {
    var name1;
    var name2;

    while (names.length) {
      name1 = names.pop();

      if (isFunction(this[name1])) {
        this[names.pop()] = this[name1];
      } else {
        name2 = names.pop();
        this[name1] = this[name2];
      }
    }
  }, proto);
})(window.AudioContext);

/***/ }),

/***/ "./js/synesthesia.js":
/*!***************************!*\
  !*** ./js/synesthesia.js ***!
  \***************************/
/*! exports provided: data, map */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "data", function() { return data; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "map", function() { return map; });
/*
	----------------------------------------------------------
	MIDI.Synesthesia : 0.3.1 : 2012-01-06
	----------------------------------------------------------
	Peacock:  “Instruments to perform color-music: Two centuries of technological experimentation,” Leonardo, 21 (1988), 397-406.
	Gerstner:  Karl Gerstner, The Forms of Color 1986
	Klein:  Colour-Music: The art of light, London: Crosby Lockwood and Son, 1927.
	Jameson:  “Visual music in a visual programming language,” IEEE Symposium on Visual Languages, 1999, 111-118. 
	Helmholtz:  Treatise on Physiological Optics, New York: Dover Books, 1962 
	Jones:  The art of light & color, New York: Van Nostrand Reinhold, 1972
	----------------------------------------------------------
	Reference: http://rhythmiclight.com/archives/ideas/colorscales.html
	----------------------------------------------------------
*/
var data = {
  'Isaac Newton (1704)': {
    format: 'HSL',
    ref: 'Gerstner, p.167',
    english: ['red', null, 'orange', null, 'yellow', 'green', null, 'blue', null, 'indigo', null, 'violet'],
    0: [0, 96, 51],
    // C
    1: [0, 0, 0],
    // C#
    2: [29, 94, 52],
    // D
    3: [0, 0, 0],
    // D#
    4: [60, 90, 60],
    // E
    5: [135, 76, 32],
    // F
    6: [0, 0, 0],
    // F#
    7: [248, 82, 28],
    // G
    8: [0, 0, 0],
    // G#
    9: [302, 88, 26],
    // A
    10: [0, 0, 0],
    // A#
    11: [325, 84, 46] // B

  },
  'Louis Bertrand Castel (1734)': {
    format: 'HSL',
    ref: 'Peacock, p.400',
    english: ['blue', 'blue-green', 'green', 'olive green', 'yellow', 'yellow-orange', 'orange', 'red', 'crimson', 'violet', 'agate', 'indigo'],
    0: [248, 82, 28],
    1: [172, 68, 34],
    2: [135, 76, 32],
    3: [79, 59, 36],
    4: [60, 90, 60],
    5: [49, 90, 60],
    6: [29, 94, 52],
    7: [360, 96, 51],
    8: [1, 89, 33],
    9: [325, 84, 46],
    10: [273, 80, 27],
    11: [302, 88, 26]
  },
  'George Field (1816)': {
    format: 'HSL',
    ref: 'Klein, p.69',
    english: ['blue', null, 'purple', null, 'red', 'orange', null, 'yellow', null, 'yellow green', null, 'green'],
    0: [248, 82, 28],
    1: [0, 0, 0],
    2: [302, 88, 26],
    3: [0, 0, 0],
    4: [360, 96, 51],
    5: [29, 94, 52],
    6: [0, 0, 0],
    7: [60, 90, 60],
    8: [0, 0, 0],
    9: [79, 59, 36],
    10: [0, 0, 0],
    11: [135, 76, 32]
  },
  'D. D. Jameson (1844)': {
    format: 'HSL',
    ref: 'Jameson, p.12',
    english: ['red', 'red-orange', 'orange', 'orange-yellow', 'yellow', 'green', 'green-blue', 'blue', 'blue-purple', 'purple', 'purple-violet', 'violet'],
    0: [360, 96, 51],
    1: [14, 91, 51],
    2: [29, 94, 52],
    3: [49, 90, 60],
    4: [60, 90, 60],
    5: [135, 76, 32],
    6: [172, 68, 34],
    7: [248, 82, 28],
    8: [273, 80, 27],
    9: [302, 88, 26],
    10: [313, 78, 37],
    11: [325, 84, 46]
  },
  'Theodor Seemann (1881)': {
    format: 'HSL',
    ref: 'Klein, p.86',
    english: ['carmine', 'scarlet', 'orange', 'yellow-orange', 'yellow', 'green', 'green blue', 'blue', 'indigo', 'violet', 'brown', 'black'],
    0: [0, 58, 26],
    1: [360, 96, 51],
    2: [29, 94, 52],
    3: [49, 90, 60],
    4: [60, 90, 60],
    5: [135, 76, 32],
    6: [172, 68, 34],
    7: [248, 82, 28],
    8: [302, 88, 26],
    9: [325, 84, 46],
    10: [0, 58, 26],
    11: [0, 0, 3]
  },
  'A. Wallace Rimington (1893)': {
    format: 'HSL',
    ref: 'Peacock, p.402',
    english: ['deep red', 'crimson', 'orange-crimson', 'orange', 'yellow', 'yellow-green', 'green', 'blueish green', 'blue-green', 'indigo', 'deep blue', 'violet'],
    0: [360, 96, 51],
    1: [1, 89, 33],
    2: [14, 91, 51],
    3: [29, 94, 52],
    4: [60, 90, 60],
    5: [79, 59, 36],
    6: [135, 76, 32],
    7: [163, 62, 40],
    8: [172, 68, 34],
    9: [302, 88, 26],
    10: [248, 82, 28],
    11: [325, 84, 46]
  },
  'Bainbridge Bishop (1893)': {
    format: 'HSL',
    ref: 'Bishop, p.11',
    english: ['red', 'orange-red or scarlet', 'orange', 'gold or yellow-orange', 'yellow or green-gold', 'yellow-green', 'green', 'greenish-blue or aquamarine', 'blue', 'indigo or violet-blue', 'violet', 'violet-red', 'red'],
    0: [360, 96, 51],
    1: [1, 89, 33],
    2: [29, 94, 52],
    3: [50, 93, 52],
    4: [60, 90, 60],
    5: [73, 73, 55],
    6: [135, 76, 32],
    7: [163, 62, 40],
    8: [302, 88, 26],
    9: [325, 84, 46],
    10: [343, 79, 47],
    11: [360, 96, 51]
  },
  'H. von Helmholtz (1910)': {
    format: 'HSL',
    ref: 'Helmholtz, p.22',
    english: ['yellow', 'green', 'greenish blue', 'cayan-blue', 'indigo blue', 'violet', 'end of red', 'red', 'red', 'red', 'red orange', 'orange'],
    0: [60, 90, 60],
    1: [135, 76, 32],
    2: [172, 68, 34],
    3: [211, 70, 37],
    4: [302, 88, 26],
    5: [325, 84, 46],
    6: [330, 84, 34],
    7: [360, 96, 51],
    8: [10, 91, 43],
    9: [10, 91, 43],
    10: [8, 93, 51],
    11: [28, 89, 50]
  },
  'Alexander Scriabin (1911)': {
    format: 'HSL',
    ref: 'Jones, p.104',
    english: ['red', 'violet', 'yellow', 'steely with the glint of metal', 'pearly blue the shimmer of moonshine', 'dark red', 'bright blue', 'rosy orange', 'purple', 'green', 'steely with a glint of metal', 'pearly blue the shimmer of moonshine'],
    0: [360, 96, 51],
    1: [325, 84, 46],
    2: [60, 90, 60],
    3: [245, 21, 43],
    4: [211, 70, 37],
    5: [1, 89, 33],
    6: [248, 82, 28],
    7: [29, 94, 52],
    8: [302, 88, 26],
    9: [135, 76, 32],
    10: [245, 21, 43],
    11: [211, 70, 37]
  },
  'Adrian Bernard Klein (1930)': {
    format: 'HSL',
    ref: 'Klein, p.209',
    english: ['dark red', 'red', 'red orange', 'orange', 'yellow', 'yellow green', 'green', 'blue-green', 'blue', 'blue violet', 'violet', 'dark violet'],
    0: [0, 91, 40],
    1: [360, 96, 51],
    2: [14, 91, 51],
    3: [29, 94, 52],
    4: [60, 90, 60],
    5: [73, 73, 55],
    6: [135, 76, 32],
    7: [172, 68, 34],
    8: [248, 82, 28],
    9: [292, 70, 31],
    10: [325, 84, 46],
    11: [330, 84, 34]
  },
  'August Aeppli (1940)': {
    format: 'HSL',
    ref: 'Gerstner, p.169',
    english: ['red', null, 'orange', null, 'yellow', null, 'green', 'blue-green', null, 'ultramarine blue', 'violet', 'purple'],
    0: [0, 96, 51],
    1: [0, 0, 0],
    2: [29, 94, 52],
    3: [0, 0, 0],
    4: [60, 90, 60],
    5: [0, 0, 0],
    6: [135, 76, 32],
    7: [172, 68, 34],
    8: [0, 0, 0],
    9: [211, 70, 37],
    10: [273, 80, 27],
    11: [302, 88, 26]
  },
  'I. J. Belmont (1944)': {
    ref: 'Belmont, p.226',
    english: ['red', 'red-orange', 'orange', 'yellow-orange', 'yellow', 'yellow-green', 'green', 'blue-green', 'blue', 'blue-violet', 'violet', 'red-violet'],
    0: [360, 96, 51],
    1: [14, 91, 51],
    2: [29, 94, 52],
    3: [50, 93, 52],
    4: [60, 90, 60],
    5: [73, 73, 55],
    6: [135, 76, 32],
    7: [172, 68, 34],
    8: [248, 82, 28],
    9: [313, 78, 37],
    10: [325, 84, 46],
    11: [338, 85, 37]
  },
  'Steve Zieverink (2004)': {
    format: 'HSL',
    ref: 'Cincinnati Contemporary Art Center',
    english: ['yellow-green', 'green', 'blue-green', 'blue', 'indigo', 'violet', 'ultra violet', 'infra red', 'red', 'orange', 'yellow-white', 'yellow'],
    0: [73, 73, 55],
    1: [135, 76, 32],
    2: [172, 68, 34],
    3: [248, 82, 28],
    4: [302, 88, 26],
    5: [325, 84, 46],
    6: [326, 79, 24],
    7: [1, 89, 33],
    8: [360, 96, 51],
    9: [29, 94, 52],
    10: [62, 78, 74],
    11: [60, 90, 60]
  },
  'Circle of Fifths (Johnston 2003)': {
    format: 'RGB',
    ref: 'Joseph Johnston',
    english: ['yellow', 'blue', 'orange', 'teal', 'red', 'green', 'purple', 'light orange', 'light blue', 'dark orange', 'dark green', 'violet'],
    0: [255, 255, 0],
    1: [50, 0, 255],
    2: [255, 150, 0],
    3: [0, 210, 180],
    4: [255, 0, 0],
    5: [130, 255, 0],
    6: [150, 0, 200],
    7: [255, 195, 0],
    8: [30, 130, 255],
    9: [255, 100, 0],
    10: [0, 200, 0],
    11: [225, 0, 225]
  },
  'Circle of Fifths (Wheatman 2002)': {
    format: 'HEX',
    ref: 'Stuart Wheatman',
    // http://www.valleysfamilychurch.org/
    english: [],
    data: ['#122400', '#2E002E', '#002914', '#470000', '#002142', '#2E2E00', '#290052', '#003D00', '#520029', '#003D3D', '#522900', '#000080', '#244700', '#570057', '#004D26', '#7A0000', '#003B75', '#4C4D00', '#47008F', '#006100', '#850042', '#005C5C', '#804000', '#0000C7', '#366B00', '#80007F', '#00753B', '#B80000', '#0057AD', '#6B6B00', '#6600CC', '#008A00', '#B8005C', '#007F80', '#B35900', '#2424FF', '#478F00', '#AD00AD', '#00994D', '#F00000', '#0073E6', '#8F8F00', '#8A14FF', '#00AD00', '#EB0075', '#00A3A3', '#E07000', '#6B6BFF', '#5CB800', '#DB00DB', '#00C261', '#FF5757', '#3399FF', '#ADAD00', '#B56BFF', '#00D600', '#FF57AB', '#00C7C7', '#FF9124', '#9999FF', '#6EDB00', '#FF29FF', '#00E070', '#FF9999', '#7ABDFF', '#D1D100', '#D1A3FF', '#00FA00', '#FFA3D1', '#00E5E6', '#FFC285', '#C2C2FF', '#80FF00', '#FFA8FF', '#00E070', '#FFCCCC', '#C2E0FF', '#F0F000', '#EBD6FF', '#ADFFAD', '#FFD6EB', '#8AFFFF', '#FFEBD6', '#EBEBFF', '#E0FFC2', '#FFEBFF', '#E5FFF2', '#FFF5F5']
  }
};
var map = function map(type) {
  var data_internal = {};

  var blend = function blend(a, b) {
    return [// blend two colors and round results
    a[0] * 0.5 + b[0] * 0.5 + 0.5 >> 0, a[1] * 0.5 + b[1] * 0.5 + 0.5 >> 0, a[2] * 0.5 + b[2] * 0.5 + 0.5 >> 0];
  };

  var syn = data;
  var colors = syn[type] || syn['D. D. Jameson (1844)'];
  var prior_clr = colors[3];
  var H, S, L;

  for (var note = 0; note <= 88; note++) {
    // creates mapping for 88 notes
    if (colors.data) {
      data_internal[note] = {
        hsl: colors.data[note],
        hex: colors.data[note]
      };
    } else {
      var clr = colors[(note + 9) % 12];

      switch (colors.format) {
        case 'RGB':
          clr = Color.Space(clr, 'RGB>HSL');
          H = clr.H >> 0;
          S = clr.S >> 0;
          L = clr.L >> 0;
          break;

        case 'HSL':
          H = clr[0];
          S = clr[1];
          L = clr[2];
          break;
      }

      if (H === S && S === L) {
        // note color is unset
        clr = blend(prior_clr, colors[(note + 10) % 12]);
      } // 	var amount = L / 10;
      // 	var octave = note / 12 >> 0;
      // 	var octaveLum = L + amount * octave - 3.0 * amount; // map luminance to octave


      data_internal[note] = {
        hsl: 'hsla(' + H + ',' + S + '%,' + L + '%, 1)',
        hex: Color.Space({
          H: H,
          S: S,
          L: L
        }, 'HSL>RGB>HEX>W3')
      };
      prior_clr = clr;
    }
  }

  return data_internal;
};

/***/ })

/******/ });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9NSURJL3dlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbiIsIndlYnBhY2s6Ly9NSURJL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL01JREkvLi9pbmMvamFzbWlkL21pZGlmaWxlLmpzIiwid2VicGFjazovL01JREkvLi9pbmMvamFzbWlkL3JlcGxheWVyLmpzIiwid2VicGFjazovL01JREkvLi9pbmMvamFzbWlkL3N0cmVhbS5qcyIsIndlYnBhY2s6Ly9NSURJLy4vanMvYXVkaW9EZXRlY3QuanMiLCJ3ZWJwYWNrOi8vTUlESS8uL2pzL2RlYnVnLmpzIiwid2VicGFjazovL01JREkvLi9qcy9nbS5qcyIsIndlYnBhY2s6Ly9NSURJLy4vanMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vTUlESS8uL2pzL3BsYXllci5qcyIsIndlYnBhY2s6Ly9NSURJLy4vanMvcGx1Z2luLmF1ZGlvdGFnLmpzIiwid2VicGFjazovL01JREkvLi9qcy9wbHVnaW4ud2ViYXVkaW8uanMiLCJ3ZWJwYWNrOi8vTUlESS8uL2pzL3BsdWdpbi53ZWJtaWRpLmpzIiwid2VicGFjazovL01JREkvLi9qcy9zaGltL0Jhc2U2NGJpbmFyeS5qcyIsIndlYnBhY2s6Ly9NSURJLy4vanMvc2hpbS9XZWJBdWRpb0FQSS5qcyIsIndlYnBhY2s6Ly9NSURJLy4vanMvc3luZXN0aGVzaWEuanMiXSwibmFtZXMiOlsiTWlkaUZpbGVDbGFzcyIsImRhdGEiLCJzdHJlYW0iLCJTdHJlYW0iLCJsYXN0RXZlbnRUeXBlQnl0ZSIsInVuZGVmaW5lZCIsImlkIiwicmVhZCIsImxlbmd0aCIsInJlYWRJbnQzMiIsImV2ZW50IiwiZGVsdGFUaW1lIiwicmVhZFZhckludCIsImV2ZW50VHlwZUJ5dGUiLCJyZWFkSW50OCIsInR5cGUiLCJzdWJ0eXBlQnl0ZSIsInN1YnR5cGUiLCJudW1iZXIiLCJyZWFkSW50MTYiLCJ0ZXh0IiwiY2hhbm5lbCIsIm1pY3Jvc2Vjb25kc1BlckJlYXQiLCJob3VyQnl0ZSIsImZyYW1lUmF0ZSIsImhvdXIiLCJtaW4iLCJzZWMiLCJmcmFtZSIsInN1YmZyYW1lIiwibnVtZXJhdG9yIiwiZGVub21pbmF0b3IiLCJNYXRoIiwicG93IiwibWV0cm9ub21lIiwidGhpcnR5c2Vjb25kcyIsImtleSIsInNjYWxlIiwicGFyYW0xIiwiZXZlbnRUeXBlIiwibm90ZU51bWJlciIsInZlbG9jaXR5IiwiYW1vdW50IiwiY29udHJvbGxlclR5cGUiLCJ2YWx1ZSIsInByb2dyYW1OdW1iZXIiLCJoZWFkZXJDaHVuayIsInJlYWRDaHVuayIsImhlYWRlclN0cmVhbSIsImZvcm1hdFR5cGUiLCJ0cmFja0NvdW50IiwidGltZURpdmlzaW9uIiwidGlja3NQZXJCZWF0IiwiaGVhZGVyIiwidHJhY2tzIiwiaSIsInRyYWNrQ2h1bmsiLCJ0cmFja1N0cmVhbSIsImVvZiIsInJlYWRFdmVudCIsInB1c2giLCJNaWRpRmlsZSIsIm1pZGlGaWxlT2JqZWN0IiwicGFyc2VBbmRSZXR1cm4iLCJjbG9uZSIsIm8iLCJyZXQiLCJSZXBsYXllciIsIm1pZGlGaWxlIiwidGltZVdhcnAiLCJldmVudFByb2Nlc3NvciIsImJwbSIsInRyYWNrU3RhdGVzIiwiYmVhdHNQZXJNaW51dGUiLCJicG1PdmVycmlkZSIsInRlbXBvcmFsIiwicHJvY2Vzc0V2ZW50cyIsInRpY2tzVG9OZXh0RXZlbnQiLCJuZXh0RXZlbnRUcmFjayIsIm5leHRFdmVudEluZGV4IiwibmV4dEV2ZW50IiwibWlkaUV2ZW50IiwiZ2V0TmV4dEV2ZW50IiwiYmVhdHNUb0dlbmVyYXRlIiwic2Vjb25kc1RvR2VuZXJhdGUiLCJ0aWNrc1RvRXZlbnQiLCJ0aW1lIiwic3RyIiwicG9zaXRpb24iLCJyZXN1bHQiLCJzdWJzdHIiLCJjaGFyQ29kZUF0Iiwic2lnbmVkIiwiYiIsInN1cHBvcnRzIiwicGVuZGluZyIsImNhblBsYXlUaHJvdWdoIiwic3JjIiwiYm9keSIsImRvY3VtZW50IiwiYXVkaW8iLCJBdWRpbyIsIm1pbWUiLCJzcGxpdCIsInNldEF0dHJpYnV0ZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZW1vdmVDaGlsZCIsImFwcGVuZENoaWxkIiwiYXVkaW9EZXRlY3QiLCJzdWNjZXNzQ2FsbGJhY2siLCJuYXZpZ2F0b3IiLCJyZXF1ZXN0TUlESUFjY2VzcyIsImlzTmF0aXZlIiwiRnVuY3Rpb24iLCJwcm90b3R5cGUiLCJ0b1N0cmluZyIsImNhbGwiLCJpbmRleE9mIiwicGx1Z2lucyIsIkFycmF5IiwiZnJvbSIsInBsdWdpbiIsIm5hbWUiLCJ3aW5kb3ciLCJBdWRpb0NvbnRleHQiLCJ3ZWJraXRBdWRpb0NvbnRleHQiLCJjYW5QbGF5VHlwZSIsInZvcmJpcyIsIm1wZWciLCJEYXRlIiwiZ2V0VGltZSIsImludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJub3ciLCJtYXhFeGVjdXRpb24iLCJjbGVhckludGVydmFsIiwiREVCVUciLCJHTV9maXhlciIsImluX2RpY3QiLCJhc0lkIiwicmVwbGFjZSIsInRvTG93ZXJDYXNlIiwicmVzIiwiYnlOYW1lIiwiYnlJZCIsImJ5Q2F0ZWdvcnkiLCJPYmplY3QiLCJlbnRyaWVzIiwibGlzdCIsImluc3RydW1lbnQiLCJwYXJzZUludCIsIm5hbWVJZCIsImNhdGVnb3J5SWQiLCJzcGVjIiwicHJvZ3JhbSIsImNhdGVnb3J5IiwiR00iLCJnZXRfY2hhbm5lbHMiLCJjaGFubmVscyIsInBpdGNoQmVuZCIsIm11dGUiLCJtb25vIiwib21uaSIsInNvbG8iLCJnZXRQcm9ncmFtIiwiY2hhbm5lbElkIiwic2V0UHJvZ3JhbSIsImRlbGF5Iiwic2V0VGltZW91dCIsImdldE1vbm8iLCJzZXRNb25vIiwidHJ1dGh5IiwiZ2V0T21uaSIsInNldE9tbmkiLCJnZXRTb2xvIiwic2V0U29sbyIsImtleVRvTm90ZSIsIm5vdGVUb0tleSIsIkEwIiwiQzgiLCJudW1iZXIya2V5IiwibiIsIm9jdGF2ZSIsIlNvdW5kZm9udCIsImF1ZGlvX2NvbnRleHRzIiwiQXVkaW9UYWciLCJXZWJBdWRpbyIsIldlYk1JREkiLCJjb25maWciLCJzb3VuZGZvbnRVcmwiLCJhcGkiLCJhdWRpb0Zvcm1hdCIsImNvbm5lY3RlZF9wbHVnaW4iLCJsb2FkUGx1Z2luIiwib3B0cyIsIm9uc3VjY2VzcyIsIm9ucHJvZ3Jlc3MiLCJ0YXJnZXRGb3JtYXQiLCJpbnN0cnVtZW50cyIsImFwaVByZWNlZGVuY2UiLCJoYXNoIiwibG9jYXRpb24iLCJhcGlJbk9yZGVyIiwiY29ubmVjdCIsImxvYWRQcm9ncmFtIiwiZm9ybWF0Iiwid2VibWlkaSIsInByZV9jb25uZWN0IiwiYXVkaW90YWciLCJyZXF1ZXN0UXVldWUiLCJ3ZWJhdWRpbyIsInNoYXJlZF9yb290X2luZm8iLCJ3ZWJhdWRpb19iYWNrdXBfY29ubmVjdCIsImNvbnRleHQiLCJvbmVycm9yIiwiY29ycmVjdF9hdWRpb19jb250ZXh0IiwibnVtX2luc3RydW1lbnRzIiwid2FpdEZvckVuZCIsImluc3RydW1lbnRJZCIsIm9ucHJvZ3Jlc3NfaW5uZXIiLCJldnQiLCJwcm9ncmVzcyIsImZpbGVQcm9ncmVzcyIsInF1ZXVlUHJvZ3Jlc3MiLCJvbnN1Y2Nlc3NfaW5uZXIiLCJzZW5kUmVxdWVzdCIsInNvdW5kZm9udFBhdGgiLCJ4aHIiLCJYTUxIdHRwUmVxdWVzdCIsIm9wZW4iLCJzZXRSZXF1ZXN0SGVhZGVyIiwib25sb2FkIiwic3RhdHVzIiwic2NyaXB0IiwiY3JlYXRlRWxlbWVudCIsImxhbmd1YWdlIiwicmVzcG9uc2VUZXh0Iiwic2VuZCIsInBsYXlDaGFubmVsIiwic3RvcENoYW5uZWwiLCJzZXRDb250cm9sbGVyIiwic2V0Vm9sdW1lIiwicHJvZ3JhbUNoYW5nZSIsIm5vdGVPbiIsIm5vdGVPZmYiLCJjaG9yZE9uIiwiY2hvcmRPZmYiLCJzdG9wQWxsTm90ZXMiLCJzZXRFZmZlY3RzIiwiZ2V0Q29udGV4dCIsInNldENvbnRleHQiLCJQbGF5ZXIiLCJQbGF5SW5zdGFuY2UiLCJjdXJyZW50VGltZSIsImVuZFRpbWUiLCJyZXN0YXJ0IiwicGxheWluZyIsInN0YXJ0RGVsYXkiLCJCUE0iLCJldmVudFF1ZXVlIiwicXVldWVkVGltZSIsInN0YXJ0VGltZSIsIm5vdGVSZWdpc3RyYXIiLCJvbk1pZGlFdmVudCIsIl9fbm93Iiwic3RhcnRBdWRpbyIsInN0YXJ0IiwidG1wIiwic3RvcEF1ZGlvIiwiYW5pbWF0aW9uRnJhbWVJZCIsImNhbmNlbEFuaW1hdGlvbkZyYW1lIiwibXRoaXMiLCJjYWxsYmFjayIsInRPdXJUaW1lIiwidFRoZWlyVGltZSIsImNsZWFyQW5pbWF0aW9uIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwidG90YWwiLCJtaW51dGVzIiwic2Vjb25kcyIsInQxIiwidDIiLCJlbmQiLCJldmVudHMiLCJyZXBsYXllciIsImN1cnJlbnREYXRhIiwiZ2V0RGF0YSIsImdldExlbmd0aCIsImZpbGUiLCJzdG9wIiwiYXRvYiIsImxvYWRNaWRpRmlsZSIsImZldGNoIiwib3ZlcnJpZGVNaW1lVHlwZSIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsInJlYWR5U3RhdGUiLCJ0IiwiZmYiLCJteCIsInNjYyIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsInoiLCJqb2luIiwicHJvZ3JhbXMiLCJtaWRpIiwiZ20iLCJpc0Zpbml0ZSIsImtleXMiLCJub3RlIiwib2Zmc2V0IiwibWVzc2FnZSIsInNoaWZ0IiwiTUlESSIsImN0eCIsInRvdGFsVGltZSIsInBlcmZvcm1hbmNlIiwiZnJvbUNhY2hlIiwibWVzc2FnZXMiLCJmb2Zmc2V0IiwiZ2V0Tm93Iiwib2JqIiwicXVldWVUaW1lIiwiTUlESU9mZnNldCIsInNvdXJjZSIsInNjaGVkdWxlVHJhY2tpbmciLCJwb3AiLCJjbGVhclRpbWVvdXQiLCJkaXNjb25uZWN0Iiwidm9sdW1lcyIsInZpZCIsImJ1ZmZlcl9uaWQiLCJub3Rlc09uIiwibm90ZXMiLCJhdWRpb0J1ZmZlcnMiLCJuaWQiLCJpbl9ub3RlIiwiaW5zdHJ1bWVudE5vdGVJZCIsImNvbnNvbGUiLCJsb2ciLCJ2b2x1bWUiLCJwbGF5IiwibGVuIiwiY0lkIiwicGF1c2UiLCJjaG9yZCIsImlkeCIsImF1ZGlvQ29udGV4dCIsInVzZVN0cmVhbWluZ0J1ZmZlciIsInNvdXJjZXMiLCJlZmZlY3RzIiwibWFzdGVyVm9sdW1lIiwiYmVuZCIsIm5vdGVJZCIsImJ1ZmZlcklkIiwiYnVmZmVyIiwiY3JlYXRlTWVkaWFFbGVtZW50U291cmNlIiwiY3JlYXRlQnVmZmVyU291cmNlIiwiY2hhaW4iLCJpbnB1dCIsImdhaW4iLCJkZXN0aW5hdGlvbiIsInBsYXliYWNrUmF0ZSIsImdhaW5Ob2RlIiwiY3JlYXRlR2FpbiIsIm1heCIsImxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lIiwic2lkIiwidHVuYWpzIiwiZWZmZWN0IiwiY3JlYXRlQXVkaW9Db250ZXh0IiwibmV3Q3R4IiwiVHVuYSIsInVybHMiLCJidWZmZXJQZW5kaW5nIiwicmVxdWVzdEF1ZGlvIiwic291bmRmb250IiwicHJvZ3JhbUlkIiwiaW5kZXgiLCJ1cmwiLCJsb2FkQXVkaW8iLCJwZXJjZW50IiwiaXNMb2FkZWQiLCJlcnIiLCJjb250cm9scyIsImF1dG9wbGF5IiwicHJlbG9hZCIsImJhc2U2NCIsIkJhc2U2NEJpbmFyeSIsImRlY29kZUF1ZGlvRGF0YSIsInJlcXVlc3QiLCJyZXNwb25zZVR5cGUiLCJyZXNwb25zZSIsIm91dHB1dCIsImNhbmNlbCIsImVyckZ1bmN0aW9uIiwiZXJyb3IiLCJ0aGVuIiwiYWNjZXNzIiwicGx1Z2luT3V0cHV0cyIsIm91dHB1dHMiLCJfa2V5U3RyIiwiZGVjb2RlQXJyYXlCdWZmZXIiLCJieXRlcyIsImNlaWwiLCJhYiIsIkFycmF5QnVmZmVyIiwiZGVjb2RlIiwiYXJyYXlCdWZmZXIiLCJsa2V5MSIsImNoYXJBdCIsImxrZXkyIiwidWFycmF5IiwiY2hyMSIsImNocjIiLCJjaHIzIiwiZW5jMSIsImVuYzIiLCJlbmMzIiwiZW5jNCIsImoiLCJVaW50OEFycmF5IiwiT2ZmbGluZUF1ZGlvQ29udGV4dCIsIndlYmtpdE9mZmxpbmVBdWRpb0NvbnRleHQiLCJDb250ZXh0IiwiaXNGdW5jdGlvbiIsImYiLCJjb250ZXh0TWV0aG9kcyIsInByb3RvIiwiaW5zdGFuY2UiLCJzb3VyY2VQcm90byIsInNhbXBsZVJhdGUiLCJnZXRQcm90b3R5cGVPZiIsIndoZW4iLCJkdXJhdGlvbiIsImFyZ3VtZW50cyIsIkVycm9yIiwibm90ZUdyYWluT24iLCJmb3JFYWNoIiwibmFtZXMiLCJuYW1lMSIsIm5hbWUyIiwicmVmIiwiZW5nbGlzaCIsIm1hcCIsImRhdGFfaW50ZXJuYWwiLCJibGVuZCIsImEiLCJzeW4iLCJjb2xvcnMiLCJwcmlvcl9jbHIiLCJIIiwiUyIsIkwiLCJoc2wiLCJoZXgiLCJjbHIiLCJDb2xvciIsIlNwYWNlIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTztBQ1ZBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0RBQTBDLGdDQUFnQztBQUMxRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdFQUF3RCxrQkFBa0I7QUFDMUU7QUFDQSx5REFBaUQsY0FBYztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQXlDLGlDQUFpQztBQUMxRSx3SEFBZ0gsbUJBQW1CLEVBQUU7QUFDckk7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7O0FBR0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNsRkE7Ozs7QUFJQTtBQUVPLElBQU1B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aWRpY3ViZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFwiTUlESVwiLCBbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJNSURJXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIk1JRElcIl0gPSBmYWN0b3J5KCk7XG59KSh3aW5kb3csIGZ1bmN0aW9uKCkge1xucmV0dXJuICIsIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vanMvaW5kZXguanNcIik7XG4iLCIvKlxuY2xhc3MgdG8gcGFyc2UgdGhlIC5taWQgZmlsZSBmb3JtYXRcbihkZXBlbmRzIG9uIHN0cmVhbS5qcylcbiovXG5pbXBvcnQgeyBTdHJlYW0gfSBmcm9tICcuL3N0cmVhbS5qcyc7XG5cbmV4cG9ydCBjbGFzcyBNaWRpRmlsZUNsYXNzIHtcblx0Y29uc3RydWN0b3IoZGF0YSkge1xuXHRcdHRoaXMuZGF0YSA9IGRhdGE7XG5cdFx0dGhpcy5zdHJlYW0gPSBuZXcgU3RyZWFtKGRhdGEpO1xuXHRcdHRoaXMubGFzdEV2ZW50VHlwZUJ5dGUgPSB1bmRlZmluZWQ7XG5cdH1cblx0cmVhZENodW5rKHN0cmVhbSkge1xuXHRcdGNvbnN0IGlkID0gc3RyZWFtLnJlYWQoNCk7XG5cdFx0Y29uc3QgbGVuZ3RoID0gc3RyZWFtLnJlYWRJbnQzMigpO1xuXHRcdHJldHVybiB7XG5cdFx0XHQnaWQnOiBpZCxcblx0XHRcdCdsZW5ndGgnOiBsZW5ndGgsXG5cdFx0XHQnZGF0YSc6IHN0cmVhbS5yZWFkKGxlbmd0aClcblx0XHR9O1xuXHR9XG5cdFxuXHRyZWFkRXZlbnQoc3RyZWFtKSB7XG5cdFx0Y29uc3QgZXZlbnQgPSB7fTtcblx0XHRldmVudC5kZWx0YVRpbWUgPSBzdHJlYW0ucmVhZFZhckludCgpO1xuXHRcdGxldCBldmVudFR5cGVCeXRlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG5cdFx0aWYgKChldmVudFR5cGVCeXRlICYgMHhmMCkgPT09IDB4ZjApIHtcblx0XHRcdC8qIHN5c3RlbSAvIG1ldGEgZXZlbnQgKi9cblx0XHRcdGlmIChldmVudFR5cGVCeXRlID09PSAweGZmKSB7XG5cdFx0XHRcdC8qIG1ldGEgZXZlbnQgKi9cblx0XHRcdFx0ZXZlbnQudHlwZSA9ICdtZXRhJztcblx0XHRcdFx0Y29uc3Qgc3VidHlwZUJ5dGUgPSBzdHJlYW0ucmVhZEludDgoKTtcblx0XHRcdFx0Y29uc3QgbGVuZ3RoID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcblx0XHRcdFx0c3dpdGNoKHN1YnR5cGVCeXRlKSB7XG5cdFx0XHRcdFx0Y2FzZSAweDAwOlxuXHRcdFx0XHRcdFx0ZXZlbnQuc3VidHlwZSA9ICdzZXF1ZW5jZU51bWJlcic7XG5cdFx0XHRcdFx0XHRpZiAobGVuZ3RoICE9PSAyKSB7XG5cdFx0XHRcdFx0XHRcdHRocm93IFwiRXhwZWN0ZWQgbGVuZ3RoIGZvciBzZXF1ZW5jZU51bWJlciBldmVudCBpcyAyLCBnb3QgXCIgKyBsZW5ndGg7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRldmVudC5udW1iZXIgPSBzdHJlYW0ucmVhZEludDE2KCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZXZlbnQ7XG5cdFx0XHRcdFx0Y2FzZSAweDAxOlxuXHRcdFx0XHRcdFx0ZXZlbnQuc3VidHlwZSA9ICd0ZXh0Jztcblx0XHRcdFx0XHRcdGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGV2ZW50O1xuXHRcdFx0XHRcdGNhc2UgMHgwMjpcblx0XHRcdFx0XHRcdGV2ZW50LnN1YnR5cGUgPSAnY29weXJpZ2h0Tm90aWNlJztcblx0XHRcdFx0XHRcdGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGV2ZW50O1xuXHRcdFx0XHRcdGNhc2UgMHgwMzpcblx0XHRcdFx0XHRcdGV2ZW50LnN1YnR5cGUgPSAndHJhY2tOYW1lJztcblx0XHRcdFx0XHRcdGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGV2ZW50O1xuXHRcdFx0XHRcdGNhc2UgMHgwNDpcblx0XHRcdFx0XHRcdGV2ZW50LnN1YnR5cGUgPSAnaW5zdHJ1bWVudE5hbWUnO1xuXHRcdFx0XHRcdFx0ZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZXZlbnQ7XG5cdFx0XHRcdFx0Y2FzZSAweDA1OlxuXHRcdFx0XHRcdFx0ZXZlbnQuc3VidHlwZSA9ICdseXJpY3MnO1xuXHRcdFx0XHRcdFx0ZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZXZlbnQ7XG5cdFx0XHRcdFx0Y2FzZSAweDA2OlxuXHRcdFx0XHRcdFx0ZXZlbnQuc3VidHlwZSA9ICdtYXJrZXInO1xuXHRcdFx0XHRcdFx0ZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZXZlbnQ7XG5cdFx0XHRcdFx0Y2FzZSAweDA3OlxuXHRcdFx0XHRcdFx0ZXZlbnQuc3VidHlwZSA9ICdjdWVQb2ludCc7XG5cdFx0XHRcdFx0XHRldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcblx0XHRcdFx0XHRcdHJldHVybiBldmVudDtcblx0XHRcdFx0XHRjYXNlIDB4MjA6XG5cdFx0XHRcdFx0XHRldmVudC5zdWJ0eXBlID0gJ21pZGlDaGFubmVsUHJlZml4Jztcblx0XHRcdFx0XHRcdGlmIChsZW5ndGggIT09IDEpIHtcblx0XHRcdFx0XHRcdFx0dGhyb3cgXCJFeHBlY3RlZCBsZW5ndGggZm9yIG1pZGlDaGFubmVsUHJlZml4IGV2ZW50IGlzIDEsIGdvdCBcIiArIGxlbmd0aDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGV2ZW50LmNoYW5uZWwgPSBzdHJlYW0ucmVhZEludDgoKTtcblx0XHRcdFx0XHRcdHJldHVybiBldmVudDtcblx0XHRcdFx0XHRjYXNlIDB4MmY6XG5cdFx0XHRcdFx0XHRldmVudC5zdWJ0eXBlID0gJ2VuZE9mVHJhY2snO1xuXHRcdFx0XHRcdFx0aWYgKGxlbmd0aCAhPT0gMCkge1xuXHRcdFx0XHRcdFx0XHR0aHJvdyBcIkV4cGVjdGVkIGxlbmd0aCBmb3IgZW5kT2ZUcmFjayBldmVudCBpcyAwLCBnb3QgXCIgKyBsZW5ndGg7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXR1cm4gZXZlbnQ7XG5cdFx0XHRcdFx0Y2FzZSAweDUxOlxuXHRcdFx0XHRcdFx0ZXZlbnQuc3VidHlwZSA9ICdzZXRUZW1wbyc7XG5cdFx0XHRcdFx0XHRpZiAobGVuZ3RoICE9PSAzKSB0aHJvdyBcIkV4cGVjdGVkIGxlbmd0aCBmb3Igc2V0VGVtcG8gZXZlbnQgaXMgMywgZ290IFwiICsgbGVuZ3RoO1xuXHRcdFx0XHRcdFx0ZXZlbnQubWljcm9zZWNvbmRzUGVyQmVhdCA9IChcblx0XHRcdFx0XHRcdFx0KHN0cmVhbS5yZWFkSW50OCgpIDw8IDE2KVxuXHRcdFx0XHRcdFx0XHQrIChzdHJlYW0ucmVhZEludDgoKSA8PCA4KVxuXHRcdFx0XHRcdFx0XHQrIHN0cmVhbS5yZWFkSW50OCgpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGV2ZW50O1xuXHRcdFx0XHRcdGNhc2UgMHg1NDpcblx0XHRcdFx0XHRcdGV2ZW50LnN1YnR5cGUgPSAnc21wdGVPZmZzZXQnO1xuXHRcdFx0XHRcdFx0aWYgKGxlbmd0aCAhPT0gNSkge1xuXHRcdFx0XHRcdFx0XHR0aHJvdyBcIkV4cGVjdGVkIGxlbmd0aCBmb3Igc21wdGVPZmZzZXQgZXZlbnQgaXMgNSwgZ290IFwiICsgbGVuZ3RoO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y29uc3QgaG91ckJ5dGUgPSBzdHJlYW0ucmVhZEludDgoKTtcblx0XHRcdFx0XHRcdGV2ZW50LmZyYW1lUmF0ZSA9IHtcblx0XHRcdFx0XHRcdFx0MHgwMDogMjQsXG5cdFx0XHRcdFx0XHRcdDB4MjA6IDI1LFxuXHRcdFx0XHRcdFx0XHQweDQwOiAyOSxcblx0XHRcdFx0XHRcdFx0MHg2MDogMzBcblx0XHRcdFx0XHRcdH1baG91ckJ5dGUgJiAweDYwXTtcblx0XHRcdFx0XHRcdGV2ZW50LmhvdXIgPSBob3VyQnl0ZSAmIDB4MWY7XG5cdFx0XHRcdFx0XHRldmVudC5taW4gPSBzdHJlYW0ucmVhZEludDgoKTtcblx0XHRcdFx0XHRcdGV2ZW50LnNlYyA9IHN0cmVhbS5yZWFkSW50OCgpO1xuXHRcdFx0XHRcdFx0ZXZlbnQuZnJhbWUgPSBzdHJlYW0ucmVhZEludDgoKTtcblx0XHRcdFx0XHRcdGV2ZW50LnN1YmZyYW1lID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZXZlbnQ7XG5cdFx0XHRcdFx0Y2FzZSAweDU4OlxuXHRcdFx0XHRcdFx0ZXZlbnQuc3VidHlwZSA9ICd0aW1lU2lnbmF0dXJlJztcblx0XHRcdFx0XHRcdGlmIChsZW5ndGggIT09IDQpIHtcblx0XHRcdFx0XHRcdFx0dGhyb3cgXCJFeHBlY3RlZCBsZW5ndGggZm9yIHRpbWVTaWduYXR1cmUgZXZlbnQgaXMgNCwgZ290IFwiICsgbGVuZ3RoO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZXZlbnQubnVtZXJhdG9yID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG5cdFx0XHRcdFx0XHRldmVudC5kZW5vbWluYXRvciA9IE1hdGgucG93KDIsIHN0cmVhbS5yZWFkSW50OCgpKTtcblx0XHRcdFx0XHRcdGV2ZW50Lm1ldHJvbm9tZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuXHRcdFx0XHRcdFx0ZXZlbnQudGhpcnR5c2Vjb25kcyA9IHN0cmVhbS5yZWFkSW50OCgpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGV2ZW50O1xuXHRcdFx0XHRcdGNhc2UgMHg1OTpcblx0XHRcdFx0XHRcdGV2ZW50LnN1YnR5cGUgPSAna2V5U2lnbmF0dXJlJztcblx0XHRcdFx0XHRcdGlmIChsZW5ndGggIT09IDIpIHtcblx0XHRcdFx0XHRcdFx0dGhyb3cgXCJFeHBlY3RlZCBsZW5ndGggZm9yIGtleVNpZ25hdHVyZSBldmVudCBpcyAyLCBnb3QgXCIgKyBsZW5ndGg7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRldmVudC5rZXkgPSBzdHJlYW0ucmVhZEludDgodHJ1ZSk7XG5cdFx0XHRcdFx0XHRldmVudC5zY2FsZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGV2ZW50O1xuXHRcdFx0XHRcdGNhc2UgMHg3Zjpcblx0XHRcdFx0XHRcdGV2ZW50LnN1YnR5cGUgPSAnc2VxdWVuY2VyU3BlY2lmaWMnO1xuXHRcdFx0XHRcdFx0ZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZXZlbnQ7XG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKFwiVW5yZWNvZ25pc2VkIG1ldGEgZXZlbnQgc3VidHlwZTogXCIgKyBzdWJ0eXBlQnl0ZSk7XG5cdFx0XHRcdFx0XHRldmVudC5zdWJ0eXBlID0gJ3Vua25vd24nO1xuXHRcdFx0XHRcdFx0ZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZXZlbnQ7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoZXZlbnRUeXBlQnl0ZSA9PT0gMHhmMCkge1xuXHRcdFx0XHRldmVudC50eXBlID0gJ3N5c0V4Jztcblx0XHRcdFx0Y29uc3QgbGVuZ3RoID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcblx0XHRcdFx0ZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG5cdFx0XHRcdHJldHVybiBldmVudDtcblx0XHRcdH0gZWxzZSBpZiAoZXZlbnRUeXBlQnl0ZSA9PT0gMHhmNykge1xuXHRcdFx0XHRldmVudC50eXBlID0gJ2RpdmlkZWRTeXNFeCc7XG5cdFx0XHRcdGNvbnN0IGxlbmd0aCA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG5cdFx0XHRcdGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuXHRcdFx0XHRyZXR1cm4gZXZlbnQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBcIlVucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGUgYnl0ZTogXCIgKyBldmVudFR5cGVCeXRlO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvKiBjaGFubmVsIGV2ZW50ICovXG5cdFx0XHRsZXQgcGFyYW0xO1xuXHRcdFx0aWYgKChldmVudFR5cGVCeXRlICYgMHg4MCkgPT09IDApIHtcblx0XHRcdFx0LyogcnVubmluZyBzdGF0dXMgLSByZXVzZSBsYXN0RXZlbnRUeXBlQnl0ZSBhcyB0aGUgZXZlbnQgdHlwZS5cblx0XHRcdFx0XHRldmVudFR5cGVCeXRlIGlzIGFjdHVhbGx5IHRoZSBmaXJzdCBwYXJhbWV0ZXJcblx0XHRcdFx0Ki9cblx0XHRcdFx0cGFyYW0xID0gZXZlbnRUeXBlQnl0ZTtcblx0XHRcdFx0ZXZlbnRUeXBlQnl0ZSA9IHRoaXMubGFzdEV2ZW50VHlwZUJ5dGU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRwYXJhbTEgPSBzdHJlYW0ucmVhZEludDgoKTtcblx0XHRcdFx0dGhpcy5sYXN0RXZlbnRUeXBlQnl0ZSA9IGV2ZW50VHlwZUJ5dGU7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBldmVudFR5cGUgPSBldmVudFR5cGVCeXRlID4+IDQ7XG5cdFx0XHRldmVudC5jaGFubmVsID0gZXZlbnRUeXBlQnl0ZSAmIDB4MGY7XG5cdFx0XHRldmVudC50eXBlID0gJ2NoYW5uZWwnO1xuXHRcdFx0c3dpdGNoIChldmVudFR5cGUpIHtcblx0XHRcdFx0Y2FzZSAweDA4OlxuXHRcdFx0XHRcdGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9mZic7XG5cdFx0XHRcdFx0ZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcblx0XHRcdFx0XHRldmVudC52ZWxvY2l0eSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuXHRcdFx0XHRcdHJldHVybiBldmVudDtcblx0XHRcdFx0Y2FzZSAweDA5OlxuXHRcdFx0XHRcdGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG5cdFx0XHRcdFx0ZXZlbnQudmVsb2NpdHkgPSBzdHJlYW0ucmVhZEludDgoKTtcblx0XHRcdFx0XHRpZiAoZXZlbnQudmVsb2NpdHkgPT09IDApIHtcblx0XHRcdFx0XHRcdGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9mZic7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9uJztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIGV2ZW50O1xuXHRcdFx0XHRjYXNlIDB4MGE6XG5cdFx0XHRcdFx0ZXZlbnQuc3VidHlwZSA9ICdub3RlQWZ0ZXJ0b3VjaCc7XG5cdFx0XHRcdFx0ZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcblx0XHRcdFx0XHRldmVudC5hbW91bnQgPSBzdHJlYW0ucmVhZEludDgoKTtcblx0XHRcdFx0XHRyZXR1cm4gZXZlbnQ7XG5cdFx0XHRcdGNhc2UgMHgwYjpcblx0XHRcdFx0XHRldmVudC5zdWJ0eXBlID0gJ2NvbnRyb2xsZXInO1xuXHRcdFx0XHRcdGV2ZW50LmNvbnRyb2xsZXJUeXBlID0gcGFyYW0xO1xuXHRcdFx0XHRcdGV2ZW50LnZhbHVlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG5cdFx0XHRcdFx0cmV0dXJuIGV2ZW50O1xuXHRcdFx0XHRjYXNlIDB4MGM6XG5cdFx0XHRcdFx0ZXZlbnQuc3VidHlwZSA9ICdwcm9ncmFtQ2hhbmdlJztcblx0XHRcdFx0XHRldmVudC5wcm9ncmFtTnVtYmVyID0gcGFyYW0xO1xuXHRcdFx0XHRcdHJldHVybiBldmVudDtcblx0XHRcdFx0Y2FzZSAweDBkOlxuXHRcdFx0XHRcdGV2ZW50LnN1YnR5cGUgPSAnY2hhbm5lbEFmdGVydG91Y2gnO1xuXHRcdFx0XHRcdGV2ZW50LmFtb3VudCA9IHBhcmFtMTtcblx0XHRcdFx0XHRyZXR1cm4gZXZlbnQ7XG5cdFx0XHRcdGNhc2UgMHgwZTpcblx0XHRcdFx0XHRldmVudC5zdWJ0eXBlID0gJ3BpdGNoQmVuZCc7XG5cdFx0XHRcdFx0ZXZlbnQudmFsdWUgPSBwYXJhbTEgKyAoc3RyZWFtLnJlYWRJbnQ4KCkgPDwgNyk7XG5cdFx0XHRcdFx0cmV0dXJuIGV2ZW50O1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHRocm93IFwiVW5yZWNvZ25pc2VkIE1JREkgZXZlbnQgdHlwZTogXCIgKyBldmVudFR5cGVcblx0XHRcdFx0XHQvKiBcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhcIlVucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGU6IFwiICsgZXZlbnRUeXBlKTtcblx0XHRcdFx0XHRzdHJlYW0ucmVhZEludDgoKTtcblx0XHRcdFx0XHRldmVudC5zdWJ0eXBlID0gJ3Vua25vd24nO1xuXHRcdFx0XHRcdHJldHVybiBldmVudDtcblx0XHRcdFx0XHQqL1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHBhcnNlQW5kUmV0dXJuKCkge1xuXHRcdGNvbnN0IHN0cmVhbSA9IHRoaXMuc3RyZWFtO1xuXHRcdGNvbnN0IGhlYWRlckNodW5rID0gdGhpcy5yZWFkQ2h1bmsoc3RyZWFtKTtcblx0XHRpZiAoaGVhZGVyQ2h1bmsuaWQgIT09ICdNVGhkJyB8fCBoZWFkZXJDaHVuay5sZW5ndGggIT09IDYpIHtcblx0XHRcdHRocm93IFwiQmFkIC5taWQgZmlsZSAtIGhlYWRlciBub3QgZm91bmRcIjtcblx0XHR9XG5cdFx0Y29uc3QgaGVhZGVyU3RyZWFtID0gbmV3IFN0cmVhbShoZWFkZXJDaHVuay5kYXRhKTtcblx0XHRjb25zdCBmb3JtYXRUeXBlID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuXHRcdGNvbnN0IHRyYWNrQ291bnQgPSBoZWFkZXJTdHJlYW0ucmVhZEludDE2KCk7XG5cdFx0Y29uc3QgdGltZURpdmlzaW9uID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuXG5cdFx0bGV0IHRpY2tzUGVyQmVhdDtcblx0XHRpZiAodGltZURpdmlzaW9uICYgMHg4MDAwKSB7XG5cdFx0XHR0aHJvdyBcIkV4cHJlc3NpbmcgdGltZSBkaXZpc2lvbiBpbiBTTVRQRSBmcmFtZXMgaXMgbm90IHN1cHBvcnRlZCB5ZXRcIlxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aWNrc1BlckJlYXQgPSB0aW1lRGl2aXNpb247XG5cdFx0fVxuXG5cdFx0Y29uc3QgaGVhZGVyID0ge1xuXHRcdFx0J2Zvcm1hdFR5cGUnOiBmb3JtYXRUeXBlLFxuXHRcdFx0J3RyYWNrQ291bnQnOiB0cmFja0NvdW50LFxuXHRcdFx0J3RpY2tzUGVyQmVhdCc6IHRpY2tzUGVyQmVhdCxcblx0XHR9O1xuXHRcdGNvbnN0IHRyYWNrcyA9IFtdO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgaGVhZGVyLnRyYWNrQ291bnQ7IGkrKykge1xuXHRcdFx0dHJhY2tzW2ldID0gW107XG5cdFx0XHRjb25zdCB0cmFja0NodW5rID0gdGhpcy5yZWFkQ2h1bmsoc3RyZWFtKTtcblx0XHRcdGlmICh0cmFja0NodW5rLmlkICE9PSAnTVRyaycpIHtcblx0XHRcdFx0dGhyb3cgXCJVbmV4cGVjdGVkIGNodW5rIC0gZXhwZWN0ZWQgTVRyaywgZ290IFwiKyB0cmFja0NodW5rLmlkO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgdHJhY2tTdHJlYW0gPSBuZXcgU3RyZWFtKHRyYWNrQ2h1bmsuZGF0YSk7XG5cdFx0XHR3aGlsZSAoIXRyYWNrU3RyZWFtLmVvZigpKSB7XG5cdFx0XHRcdGNvbnN0IGV2ZW50ID0gdGhpcy5yZWFkRXZlbnQodHJhY2tTdHJlYW0pO1xuXHRcdFx0XHR0cmFja3NbaV0ucHVzaChldmVudCk7XG5cdFx0XHRcdC8vY29uc29sZS5sb2coZXZlbnQpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4ge1xuXHRcdFx0J2hlYWRlcic6IGhlYWRlcixcblx0XHRcdCd0cmFja3MnOiB0cmFja3MsXG5cdFx0fTtcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gTWlkaUZpbGUoZGF0YSkge1xuXHRjb25zdCBtaWRpRmlsZU9iamVjdCA9IG5ldyBNaWRpRmlsZUNsYXNzKGRhdGEpO1xuXHRyZXR1cm4gbWlkaUZpbGVPYmplY3QucGFyc2VBbmRSZXR1cm4oKTtcbn1cbiIsIi8qKlxuICogUmVwbGF5ZXIgY2xhc3MgLS0gZmFjdG9yZWQgZnJvbSBmdW5jdGlvbiBieSBNU0MgSnVseSAyMDE5XG4gKlxuICovXG5cblxuLyoqXG4gKiBDbG9uZSBhbnkgb2JqZWN0XG4gKlxuICogQHBhcmFtIHsqfSBvXG4gKiBAcmV0dXJucyB7QXJyYXl8Kn1cbiAqL1xuY29uc3QgY2xvbmUgPSBvID0+IHtcblx0aWYgKHR5cGVvZiBvICE9ICdvYmplY3QnKSB7XG5cdFx0cmV0dXJuIG87XG5cdH1cblx0aWYgKG8gPT0gbnVsbCkge1xuXHRcdHJldHVybiBvO1xuXHR9XG5cdGNvbnN0IHJldCA9ICh0eXBlb2Ygby5sZW5ndGggPT0gJ251bWJlcicpID8gW10gOiB7fTtcblx0Zm9yIChsZXQga2V5IGluIG8pIHtcblx0XHQvLyBub2luc3BlY3Rpb24gSlNVbmZpbHRlcmVkRm9ySW5Mb29wXG5cdFx0cmV0W2tleV0gPSBjbG9uZShvW2tleV0pO1xuXHR9XG5cdHJldHVybiByZXQ7XG59O1xuXG5leHBvcnQgY2xhc3MgUmVwbGF5ZXIge1xuXHRjb25zdHJ1Y3RvcihtaWRpRmlsZSwgdGltZVdhcnAsIGV2ZW50UHJvY2Vzc29yLCBicG0pIHtcblx0XHR0aGlzLm1pZGlGaWxlID0gbWlkaUZpbGU7XG5cdFx0dGhpcy50aW1lV2FycCA9IHRpbWVXYXJwO1xuXHRcdHRoaXMuZXZlbnRQcm9jZXNzb3IgPSBldmVudFByb2Nlc3Nvcjtcblx0XHR0aGlzLnRyYWNrU3RhdGVzID0gW107XG5cdFx0dGhpcy5iZWF0c1Blck1pbnV0ZSA9IGJwbSA/IGJwbSA6IDEyMDtcblx0XHR0aGlzLmJwbU92ZXJyaWRlID0gISFicG07XG5cdFx0dGhpcy50aWNrc1BlckJlYXQgPSBtaWRpRmlsZS5oZWFkZXIudGlja3NQZXJCZWF0O1xuXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBtaWRpRmlsZS50cmFja3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdHRoaXMudHJhY2tTdGF0ZXNbaV0gPSB7XG5cdFx0XHRcdCduZXh0RXZlbnRJbmRleCc6IDAsXG5cdFx0XHRcdCd0aWNrc1RvTmV4dEV2ZW50JzogKFxuXHRcdFx0XHRcdG1pZGlGaWxlLnRyYWNrc1tpXS5sZW5ndGggP1xuXHRcdFx0XHRcdFx0bWlkaUZpbGUudHJhY2tzW2ldWzBdLmRlbHRhVGltZSA6XG5cdFx0XHRcdFx0XHRudWxsXG5cdFx0XHRcdClcblx0XHRcdH07XG5cdFx0fVxuXHRcdHRoaXMudGVtcG9yYWwgPSBbXTtcblx0XHR0aGlzLnByb2Nlc3NFdmVudHMoKTtcblx0fVxuXG5cdGdldE5leHRFdmVudCgpIHtcblx0XHRsZXQgdGlja3NUb05leHRFdmVudCA9IG51bGw7XG5cdFx0bGV0IG5leHRFdmVudFRyYWNrID0gbnVsbDtcblx0XHRsZXQgbmV4dEV2ZW50SW5kZXggPSBudWxsO1xuXHRcdFxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy50cmFja1N0YXRlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHR0aGlzLnRyYWNrU3RhdGVzW2ldLnRpY2tzVG9OZXh0RXZlbnQgIT0gbnVsbFxuXHRcdFx0XHQmJiAodGlja3NUb05leHRFdmVudCA9PSBudWxsIHx8IHRoaXMudHJhY2tTdGF0ZXNbaV0udGlja3NUb05leHRFdmVudCA8IHRpY2tzVG9OZXh0RXZlbnQpXG5cdFx0XHQpIHtcblx0XHRcdFx0dGlja3NUb05leHRFdmVudCA9IHRoaXMudHJhY2tTdGF0ZXNbaV0udGlja3NUb05leHRFdmVudDtcblx0XHRcdFx0bmV4dEV2ZW50VHJhY2sgPSBpO1xuXHRcdFx0XHRuZXh0RXZlbnRJbmRleCA9IHRoaXMudHJhY2tTdGF0ZXNbaV0ubmV4dEV2ZW50SW5kZXg7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChuZXh0RXZlbnRUcmFjayAhPSBudWxsKSB7XG5cdFx0XHQvKiBjb25zdW1lIGV2ZW50IGZyb20gdGhhdCB0cmFjayAqL1xuXHRcdFx0Y29uc3QgbmV4dEV2ZW50ID0gdGhpcy5taWRpRmlsZS50cmFja3NbbmV4dEV2ZW50VHJhY2tdW25leHRFdmVudEluZGV4XTtcblx0XHRcdGlmICh0aGlzLm1pZGlGaWxlLnRyYWNrc1tuZXh0RXZlbnRUcmFja11bbmV4dEV2ZW50SW5kZXggKyAxXSkge1xuXHRcdFx0XHR0aGlzLnRyYWNrU3RhdGVzW25leHRFdmVudFRyYWNrXS50aWNrc1RvTmV4dEV2ZW50ICs9IHRoaXMubWlkaUZpbGUudHJhY2tzW25leHRFdmVudFRyYWNrXVtuZXh0RXZlbnRJbmRleCArIDFdLmRlbHRhVGltZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMudHJhY2tTdGF0ZXNbbmV4dEV2ZW50VHJhY2tdLnRpY2tzVG9OZXh0RXZlbnQgPSBudWxsO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy50cmFja1N0YXRlc1tuZXh0RXZlbnRUcmFja10ubmV4dEV2ZW50SW5kZXggKz0gMTtcblx0XHRcdC8qIGFkdmFuY2UgdGltaW5ncyBvbiBhbGwgdHJhY2tzIGJ5IHRpY2tzVG9OZXh0RXZlbnQgKi9cblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy50cmFja1N0YXRlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAodGhpcy50cmFja1N0YXRlc1tpXS50aWNrc1RvTmV4dEV2ZW50ICE9IG51bGwpIHtcblx0XHRcdFx0XHR0aGlzLnRyYWNrU3RhdGVzW2ldLnRpY2tzVG9OZXh0RXZlbnQgLT0gdGlja3NUb05leHRFdmVudFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcInRpY2tzVG9FdmVudFwiOiB0aWNrc1RvTmV4dEV2ZW50LFxuXHRcdFx0XHRcImV2ZW50XCI6IG5leHRFdmVudCxcblx0XHRcdFx0XCJ0cmFja1wiOiBuZXh0RXZlbnRUcmFja1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH1cblxuXHRwcm9jZXNzRXZlbnRzKCkge1xuXHRcdGxldCBtaWRpRXZlbnQgPSB0aGlzLmdldE5leHRFdmVudCgpO1xuXHRcdHdoaWxlKG1pZGlFdmVudCkge1xuXHRcdCAgICBpZiAoIXRoaXMuYnBtT3ZlcnJpZGUgJiYgbWlkaUV2ZW50LmV2ZW50LnR5cGUgPT09IFwibWV0YVwiICYmIG1pZGlFdmVudC5ldmVudC5zdWJ0eXBlID09PSBcInNldFRlbXBvXCIgKSB7XG5cdFx0XHRcdC8vIHRlbXBvIGNoYW5nZSBldmVudHMgY2FuIG9jY3VyIGFueXdoZXJlIGluIHRoZSBtaWRkbGUgYW5kIGFmZmVjdCBldmVudHMgdGhhdCBmb2xsb3dcblx0XHRcdFx0dGhpcy5iZWF0c1Blck1pbnV0ZSA9IDYwMDAwMDAwIC8gbWlkaUV2ZW50LmV2ZW50Lm1pY3Jvc2Vjb25kc1BlckJlYXQ7XG5cdFx0XHR9XG5cdFx0XHQvL1xuXHRcdFx0bGV0IGJlYXRzVG9HZW5lcmF0ZSA9IDA7XG5cdFx0XHRsZXQgc2Vjb25kc1RvR2VuZXJhdGUgPSAwO1xuXHRcdFx0aWYgKG1pZGlFdmVudC50aWNrc1RvRXZlbnQgPiAwKSB7XG5cdFx0XHRcdGJlYXRzVG9HZW5lcmF0ZSA9IG1pZGlFdmVudC50aWNrc1RvRXZlbnQgLyB0aGlzLnRpY2tzUGVyQmVhdDtcblx0XHRcdFx0c2Vjb25kc1RvR2VuZXJhdGUgPSBiZWF0c1RvR2VuZXJhdGUgLyAodGhpcy5iZWF0c1Blck1pbnV0ZSAvIDYwKTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgdGltZSA9IChzZWNvbmRzVG9HZW5lcmF0ZSAqIDEwMDAgKiB0aGlzLnRpbWVXYXJwKSB8fCAwO1xuXHRcdFx0dGhpcy50ZW1wb3JhbC5wdXNoKFttaWRpRXZlbnQsIHRpbWVdKTtcblx0XHRcdG1pZGlFdmVudCA9IHRoaXMuZ2V0TmV4dEV2ZW50KCk7XG5cdFx0fVxuXHR9XG5cblx0Z2V0RGF0YSgpIHtcblx0XHRyZXR1cm4gY2xvbmUodGhpcy50ZW1wb3JhbCk7XG5cdH1cbn1cbiIsIi8qIFdyYXBwZXIgZm9yIGFjY2Vzc2luZyBzdHJpbmdzIHRocm91Z2ggc2VxdWVudGlhbCByZWFkcyAqL1xuLyogbm93IGFuIEVTNiBjbGFzcyAtLSBNU0MgMjAxOSAqL1xuXG5leHBvcnQgY2xhc3MgU3RyZWFtIHtcblx0Y29uc3RydWN0b3Ioc3RyKSB7XG5cdFx0dGhpcy5zdHIgPSBzdHI7XG5cdFx0dGhpcy5wb3NpdGlvbiA9IDA7XG5cdH1cblxuXHRyZWFkKGxlbmd0aCkge1xuXHRcdGNvbnN0IHJlc3VsdCA9IHRoaXMuc3RyLnN1YnN0cih0aGlzLnBvc2l0aW9uLCBsZW5ndGgpO1xuXHRcdHRoaXMucG9zaXRpb24gKz0gbGVuZ3RoO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblx0XG5cdC8qIHJlYWQgYSBiaWctZW5kaWFuIDMyLWJpdCBpbnRlZ2VyICovXG5cdHJlYWRJbnQzMigpIHtcblx0XHRjb25zdCByZXN1bHQgPSAoXG5cdFx0XHQodGhpcy5zdHIuY2hhckNvZGVBdCh0aGlzLnBvc2l0aW9uKSA8PCAyNClcblx0XHRcdCsgKHRoaXMuc3RyLmNoYXJDb2RlQXQodGhpcy5wb3NpdGlvbiArIDEpIDw8IDE2KVxuXHRcdFx0KyAodGhpcy5zdHIuY2hhckNvZGVBdCh0aGlzLnBvc2l0aW9uICsgMikgPDwgOClcblx0XHRcdCsgdGhpcy5zdHIuY2hhckNvZGVBdCh0aGlzLnBvc2l0aW9uICsgMykpO1xuXHRcdHRoaXMucG9zaXRpb24gKz0gNDtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0LyogcmVhZCBhIGJpZy1lbmRpYW4gMTYtYml0IGludGVnZXIgKi9cblx0cmVhZEludDE2KCkge1xuXHRcdGNvbnN0IHJlc3VsdCA9IChcblx0XHRcdCh0aGlzLnN0ci5jaGFyQ29kZUF0KHRoaXMucG9zaXRpb24pIDw8IDgpXG5cdFx0XHQrIHRoaXMuc3RyLmNoYXJDb2RlQXQodGhpcy5wb3NpdGlvbiArIDEpKTtcblx0XHR0aGlzLnBvc2l0aW9uICs9IDI7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXHRcblx0LyogcmVhZCBhbiA4LWJpdCBpbnRlZ2VyICovXG5cdHJlYWRJbnQ4KHNpZ25lZCkge1xuXHRcdGxldCByZXN1bHQgPSB0aGlzLnN0ci5jaGFyQ29kZUF0KHRoaXMucG9zaXRpb24pO1xuXHRcdGlmIChzaWduZWQgJiYgcmVzdWx0ID4gMTI3KSB7XG5cdFx0XHRyZXN1bHQgLT0gMjU2O1xuXHRcdH1cblx0XHR0aGlzLnBvc2l0aW9uICs9IDE7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXHRcblx0ZW9mKCkge1xuXHRcdHJldHVybiB0aGlzLnBvc2l0aW9uID49IHRoaXMuc3RyLmxlbmd0aDtcblx0fVxuXHRcblx0LyogcmVhZCBhIE1JREktc3R5bGUgdmFyaWFibGUtbGVuZ3RoIGludGVnZXJcblx0XHQoYmlnLWVuZGlhbiB2YWx1ZSBpbiBncm91cHMgb2YgNyBiaXRzLFxuXHRcdHdpdGggdG9wIGJpdCBzZXQgdG8gc2lnbmlmeSB0aGF0IGFub3RoZXIgYnl0ZSBmb2xsb3dzKVxuXHQqL1xuXHRyZWFkVmFySW50KCkge1xuXHRcdGxldCByZXN1bHQgPSAwO1xuXHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHRsZXQgYiA9IHRoaXMucmVhZEludDgoKTtcblx0XHRcdC8vIG5vaW5zcGVjdGlvbiBKU0JpdHdpc2VPcGVyYXRvclVzYWdlXG5cdFx0XHRpZiAoYiAmIDB4ODApIHtcblx0XHRcdFx0cmVzdWx0ICs9IChiICYgMHg3Zik7XG5cdFx0XHRcdHJlc3VsdCA8PD0gNztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8qIGIgaXMgdGhlIGxhc3QgYnl0ZSAqL1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0ICsgYjtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cbiIsIi8qXG5cdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0TUlESS5hdWRpb0RldGVjdCA6IDAuMy4yIDogMjAxNS0wMy0yNlxuXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdGh0dHBzOi8vZ2l0aHViLmNvbS9tdWRjdWJlL01JREkuanNcblx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRQcm9iYWJseSwgTWF5YmUsIE5vLi4uIEFic29sdXRlbHkhXG5cdFRlc3QgdG8gc2VlIHdoYXQgdHlwZXMgb2YgPGF1ZGlvPiBNSU1FIHR5cGVzIGFyZSBwbGF5YWJsZSBieSB0aGUgYnJvd3Nlci5cblx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuKi9cblxuZXhwb3J0IGNvbnN0IHN1cHBvcnRzID0ge307IC8vIG9iamVjdCBvZiBzdXBwb3J0ZWQgZmlsZSB0eXBlc1xuXG5sZXQgcGVuZGluZyA9IDA7IC8vIHBlbmRpbmcgZmlsZSB0eXBlcyB0byBwcm9jZXNzXG5cbmV4cG9ydCBjb25zdCBjYW5QbGF5VGhyb3VnaCA9IHNyYyA9PiB7IC8vIGNoZWNrIHdoZXRoZXIgZm9ybWF0IHBsYXlzIHRocm91Z2hcblx0cGVuZGluZyArPSAxO1xuXHRjb25zdCBib2R5ID0gZG9jdW1lbnQuYm9keTtcblx0Y29uc3QgYXVkaW8gPSBuZXcgQXVkaW8oKTtcblx0Y29uc3QgbWltZSA9IHNyYy5zcGxpdCgnOycpWzBdO1xuXHRhdWRpby5pZCA9ICdhdWRpbyc7XG5cdGF1ZGlvLnNldEF0dHJpYnV0ZSgncHJlbG9hZCcsICdhdXRvJyk7XG5cdGF1ZGlvLnNldEF0dHJpYnV0ZSgnYXVkaW9idWZmZXInLCB0cnVlKTtcblx0YXVkaW8uYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCAoKSA9PiB7XG5cdFx0Ym9keS5yZW1vdmVDaGlsZChhdWRpbyk7XG5cdFx0c3VwcG9ydHNbbWltZV0gPSBmYWxzZTtcblx0XHRwZW5kaW5nIC09IDE7XG5cdH0sIGZhbHNlKTtcblx0YXVkaW8uYWRkRXZlbnRMaXN0ZW5lcignY2FucGxheXRocm91Z2gnLCAoKSA9PiB7XG5cdFx0Ym9keS5yZW1vdmVDaGlsZChhdWRpbyk7XG5cdFx0c3VwcG9ydHNbbWltZV0gPSB0cnVlO1xuXHRcdHBlbmRpbmcgLT0gMTtcblx0fSwgZmFsc2UpO1xuXHRhdWRpby5zcmMgPSAnZGF0YTonICsgc3JjO1xuXHRib2R5LmFwcGVuZENoaWxkKGF1ZGlvKTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBhdWRpb0RldGVjdChzdWNjZXNzQ2FsbGJhY2spIHtcblx0Ly8gZGV0ZWN0IGphenotbWlkaSBwbHVnaW5cblx0aWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIG5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2Vzcykge1xuXHRcdGNvbnN0IGlzTmF0aXZlID0gRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nXG5cdFx0XHQuY2FsbChuYXZpZ2F0b3IucmVxdWVzdE1JRElBY2Nlc3MpXG5cdFx0XHQuaW5kZXhPZignW25hdGl2ZSBjb2RlXScpO1xuXG5cdFx0aWYgKGlzTmF0aXZlKSB7IC8vIGhhcyBuYXRpdmUgbWlkaWFwaSBzdXBwb3J0XG5cdFx0XHRzdXBwb3J0c1snd2VibWlkaSddID0gdHJ1ZTtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIG5hdmlnYXRvci5wbHVnaW5zICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vIGNoZWNrIGZvciBqYXp6IHBsdWdpbiBtaWRpYXBpIHN1cHBvcnRcblx0XHRcdGZvciAoY29uc3QgcGx1Z2luIG9mIEFycmF5LmZyb20obmF2aWdhdG9yLnBsdWdpbnMpKSB7XG5cdFx0XHRcdGlmIChwbHVnaW4ubmFtZS5pbmRleE9mKCdKYXp6LVBsdWdpbicpID49IDApIHtcblx0XHRcdFx0XHRzdXBwb3J0c1snd2VibWlkaSddID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIGNoZWNrIHdoZXRoZXIgPGF1ZGlvPiB0YWcgaXMgc3VwcG9ydGVkXG5cdGlmICh0eXBlb2YoQXVkaW8pID09PSAndW5kZWZpbmVkJykge1xuXHRcdHJldHVybiBzdWNjZXNzQ2FsbGJhY2soe30pO1xuXHR9IGVsc2Uge1xuXHRcdHN1cHBvcnRzWydhdWRpb3RhZyddID0gdHJ1ZTtcblx0fVxuXG5cdC8vIGNoZWNrIGZvciB3ZWJhdWRpbyBhcGkgc3VwcG9ydFxuXHRpZiAod2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0KSB7XG5cdFx0c3VwcG9ydHNbJ3dlYmF1ZGlvJ10gPSB0cnVlO1xuXHR9XG5cblx0Ly8gY2hlY2sgd2hldGhlciBjYW5QbGF5VHlwZSBpcyBzdXBwb3J0ZWRcblx0Y29uc3QgYXVkaW8gPSBuZXcgQXVkaW8oKTtcblx0aWYgKHR5cGVvZihhdWRpby5jYW5QbGF5VHlwZSkgPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0cmV0dXJuIHN1Y2Nlc3NDYWxsYmFjayhzdXBwb3J0cyk7XG5cdH1cblxuXHQvLyBzZWUgd2hhdCB3ZSBjYW4gbGVhcm4gZnJvbSB0aGUgYnJvd3NlclxuXHRsZXQgdm9yYmlzID0gYXVkaW8uY2FuUGxheVR5cGUoJ2F1ZGlvL29nZzsgY29kZWNzPVwidm9yYmlzXCInKTtcblx0dm9yYmlzID0gKHZvcmJpcyA9PT0gJ3Byb2JhYmx5JyB8fCB2b3JiaXMgPT09ICdtYXliZScpO1xuXHRsZXQgbXBlZyA9IGF1ZGlvLmNhblBsYXlUeXBlKCdhdWRpby9tcGVnJyk7XG5cdG1wZWcgPSAobXBlZyA9PT0gJ3Byb2JhYmx5JyB8fCBtcGVnID09PSAnbWF5YmUnKTtcblx0Ly8gbWF5YmUgbm90aGluZyBpcyBzdXBwb3J0ZWRcblx0aWYgKCF2b3JiaXMgJiYgIW1wZWcpIHtcblx0XHRzdWNjZXNzQ2FsbGJhY2soc3VwcG9ydHMpO1xuXHRcdHJldHVybjtcblx0fVxuXG5cdC8vIG9yIG1heWJlIHNvbWV0aGluZyBpcyBzdXBwb3J0ZWRcblx0aWYgKHZvcmJpcykge1xuXHRcdGNhblBsYXlUaHJvdWdoKCdhdWRpby9vZ2c7YmFzZTY0LFQyZG5Vd0FDQUFBQUFBQUFBQURxbmpNbEFBQUFBT3l5elBJQkhnRjJiM0ppYVhNQUFBQUFBVUFmQUFCQUh3QUFRQjhBQUVBZkFBQ1pBVTluWjFNQUFBQUFBQUFBQUFBQTZwNHpKUUVBQUFBTkpHZXFDajMvLy8vLy8vLy8vNUFEZG05eVltbHpMUUFBQUZocGNHZ3VUM0puSUd4cFlsWnZjbUpwY3lCSklESXdNVEF4TVRBeElDaFRZMmhoZFdabGJuVm5aMlYwS1FBQUFBQUJCWFp2Y21KcGN3OUNRMVlCQUFBQkFBeFNGQ0VsR1ZOS1l3aVZVbElwQlIxalVGdEhIV1BVT1VZaFpCQlRpRWtacFh0UEtwVllTc2dSVWxncFJSMVRURk5KbFZLV0tVVWRZeFJUU0NGVDFqRmxvWE1VUzRaSkNTVnNUYTUwRmt2b21XT1dNVVlkWTg1YVNwMWoxakZGSFdOU1VrbWhjeGc2WmlWa0ZEcEd4ZWhpZkRBNmxhSkNLTDdIM2xMcExZV0tXNHE5MXhwVDZ5MkVHRXRwd1FoaGMrMjExZHhLYXNVWVk0d3h4c1hpVXlpQzBKQlZBQUFCQUFCQUJBRkNRMVlCQUFvQUFNSlFERVZSZ05DUVZRQkFCZ0NBQUJSRmNSVEhjUnhIa2lUTEFrSkRWZ0VBUUFBQUFnQUFLSTdoS0pJalNaSmtXWlpsV1phbWVaYW91YW92KzY0dTY2N3Q2cm9PaElhc0JBQ0FBQUFZUnFGMVRDcURFRVBLUTRRVVk5QXpveEJEREV6R0hHTk9OS1FNTW9nenhaQXlpRnNzTHFnUUJLRWhLd0tBS0FBQXdCakVHR0lNT2Vla1pGSWk1NWlVVGtvRG5hUFVVY29vbFJSTGpCbWxFbHVKTVlMT1Vlb29aWlJDaktYRmpGS0pzY1JVQUFCQWdBTUFRSUNGVUdqSWlnQWdDZ0NBTUFZcGhaUkNqQ25tRkhPSU1lVWNnd3d4eGlCa3ppbm9HSk5PU3VXY2s4NUppUmhqempFSGxYTk9TdWVrY3RCSnlhUVRBQUFRNEFBQUVHQWhGQnF5SWdDSUV3QXdTSkttV1pvbWlwYW1pYUpuaXFycWlhS3FXcDVubXA1cHFxcG5tcXBxcXFycm1xcnF5cGJubWFabm1xcnFtYWFxaXFicXVxYXF1cTZucXJac3Vxb3VtNjVxMjY3cytyWnJ1Nzd1cWFwc202b3I2NmJxeXJycXlyYnV1cmJ0UzU2bnFxS3F1cTVucXE2cnVxNXVxNjVyMjVwcXlxNnB1ckp0dXE0dHU3SnM2NjRzNjdwbXFxNXN1cW90bTY0czY2N3MycllxeTdvdnVxNXVxN0tzKzZvcys3NXM2N3J1MnJyd2k2NXI2Nm9zNjc0cXk3NHgyN2J3eTdvdUhKTW5xcXFucXE3cm1hcnJxcTVyMjZycjJycW1tcTVzdXE0dG02b3IyNm9zNjdZcnk3YXVtYW9zbTY0cjI2YnJ5cklxeTc3dnlySnVpNjdyNjZZczY3b3F5OEx1NnJveHpMYXQrNkxyNnJvcXk3cXZ5ckt1dTdydSs3SnVDN3VtcXJwdXlyS3ZtN0tzKzdhdUM4dXMyN294dXE3dnE3SXQvS29zQzcrdSs4SXk2ejVqZEYxZlYyMVpHRmJaOW4zZDk1VmoxblZoV1cxYitWMWJaN3krYmd5N2J2ektyUXZMc3RxMnNjeTZyU3l2cnh2REx1eDhXL2lWbXFyYXR1bTZ1bTdLc3EvTHVpNjBkZDFYUnRmMWZkVzJmVitWWmQrM2hWOXBHOE93aks2cis2b3M2OEpyeThvdjY3cXc3TUl2TEt0dEs3K3I2OG93MjdxdzNMNndMTC91Qzh1cTI3N3Y2cnJTdFhWbHVYMmZzU3UzOFFzQUFCaHdBQUFJTUtFTUZCcXlJZ0NJRXdCQUVISU9LUWFoWWdwQ0NLR2tFRUlxRldOU011YWtaTTVKS2FXVUZFcEpyV0pNU3VhY2xNd3hLYUdVbGtvcHFZUlNXaXFseEJSS2FTMmwxbUpLcWNWUVNtdWxwTlpLU2EybGxHSk1yY1VZTVNZbGMwNUs1cHlVa2xKckpaWFdNdWNvWlE1SzZpQ2tsRW9xcmFUVVl1YWNwQTQ2S3gyRTFFb3FNWldVWWd1cHhGWkthcTJrRkdNck1kWFVXbzRocFJoTFNyR1ZsRnB0TWRYV1dxczFZa3hLNXB5VXpEa3FKYVhXU2lxdFpjNUo2aUMwMURrb3FhVFVZaW9weGNvNVNSMkVsRExJcUpTVVdpdXB4QkpTaWEyMEZHTXBxY1hVWXE0cHhSWkRTUzJXbEZvc3FjVFdZb3kxdFZSVEo2WEZrbEtNSlpVWVc2eTV0dFpxREtYRVZrcUxzYVNVVzJzeDF4WmpqcUdrRmtzcnNaV1VXbXkxNWRoYXl6VzFWR05LcmRZV1k0MHg1WlJyclQybjFtSk5NZFhhV3F5NTFaWmJ6TFhuVGtwcnBaUVdTMG94dHRaaWpUSG1IRXBwcmFRVVd5a3B4dFphcmEzRlhFTXBzWlhTV2l5cHhOaGlyTFhGVm1OcXJjWVdXNjJsdFZwcnJiM0dWbHN1cmRYY1lxdzl0WlJyckxYbVdGTnRCUUFBRERnQUFBU1lVQVlLRFZrSkFFUUJBQURHTU1ZWWhFWXB4NXlUMGlqbG5ITlNLdWNnaEpCUzVoeUVFRkxLbklOUVNrdVpjeEJLU1NtVWtsSnFyWVZTVW1xdHRRSUFBQW9jQUFBQ2JOQ1VXQnlnMEpDVkFFQXFBSURCY1RSTkZGWFZkWDFmc1N4UlZGWFhsVzNqVnl4TkZGVlZkbTFiK0RWUlZGWFh0VzNiRm41TkZGVlZkbVhadG9XaXFycXliZHV5Ymd2RHFLcXVhOXV5YmV1b3JxdmJ1cTNidWk5VVhWbVdiVnUzZFIzWHRuWGQ5blZkK0JtemJldTJidXUrOENNTVI5LzRJZVRqKzNSQ0NBQUFUM0FBQUNxd1lYV0VrNkt4d0VKRFZnSUFHUUFBZ0RGS0dZVVlNMGd4cGhoalRESEdtQUFBZ0FFSEFJQUFFOHBBb1NFckFvQW9BQURBT2VlY2M4NDU1NXh6empubm5IUE9PZWVjYzQ0eHhoaGpqREhHR0dPTU1jWVlZNHd4eGhoampESEdHR09NTWNZWVkwd0F3RTZFQThCT2hJVlFhTWhLQUNBY0FBQkFDQ0VwS2FXVVVrb1JVODVCU1NtbGxGS3FGSU9NU2tvcHBaUlNwQlIxbEZKS0thV1VJcVdncEpKU1NpbWxsRWxKS2FXVVVrb3BwWXc2U2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thVlVTaW1sbEZKS0thV1VVa29wcFJRQVlQTGdBQUNWWU9NTUswbG5oYVBCaFlhc0JBQnlBd0FBaFJpREVFSnByYVJVVWtvbFZjNUJLQ1dVbEVwS0taV1VVcXFZZ3hCS0txbWxrbEpLS2JYU1FTaWhsRkJLS1NXVVVrb29KWVFRU2dtaGxGUkNLNm1FVWtvSG9ZUVNRaW1oaEZSS0tTV1V6a0VvSVlVT1FrbWxsTlJDU0IxMFZGSXBJWlZTU2lrbHBaUTZDS0dVa2xKTExaVlNXa3FwZEJKU0thbVYxRkpxcWJXU1VnbWhwRlpLU1NXbDBscEpKYlVTU2trbHBaUlNTeW1GVkZKSkpZU1NVaW9sdFpaYVNxbTExbEpJcVpXVVVrcXBwZFJTU2lXbGtFcEtxWlNTVW1vbGxaUlNhaUdWbEVwSkthVFVTaW1scEZSQ1NhbWxVbHBLTGJXVVNrbXB0RlJTU2FXVWxFcEpLYVZTU2tzcHBSSktTcW1sbEZwSktZV1NVa29wbFpKU1N5VzFWRW9LSmFXVVVrbXB0SlJTU3ltVmtsSUJBRUFIRGdBQUFVWlVXb2lkWmx4NUJJNG9aSmlBQWdBQVFBQkFnQWtnTUVCUU1BcEJnREFDQVFBQUFBREFBQUFmQUFCSEFSQVIwWnpCQVVLQ3dnSkRnOE1EQUFBQUFBQUFBQUFBQUFDQVQyZG5Vd0FFQUFBQUFBQUFBQURxbmpNbEFnQUFBRHpRUG1jQkFRQT0nKTtcblx0fVxuXHRpZiAobXBlZykge1xuXHRcdGNhblBsYXlUaHJvdWdoKCdhdWRpby9tcGVnO2Jhc2U2NCwvK01ZeEFBQUFBTklBVUFBQUFTRUVCL2p3T0ZNLzBNTS85MGIvK1JoU1QvL3c0TkZ3T2pmLy8vUFp1Ly8vLzlsbnM1R0ZEdi8vbDlHbFVJRUVJQUFBZ0lnOElyL0pHcTMvK01ZeERzTElqNVFNWWNvQVAwZHY5SElqVWNILy95WVNnK0NJYmtHUC8vOHcwYkxWalVQLy8vM1oweDVRQ0F2L3lMand0R0tURUZOUlRNdU9UZXFxcXFxcXFxcXFxcXEvK01ZeEVrTm1kSmtVWWM0QUtxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXEnKTtcblx0fVxuXHRcdFxuXHQvLyBsZXRzIGZpbmQgb3V0IVxuXHRjb25zdCB0aW1lID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcblx0Y29uc3QgaW50ZXJ2YWwgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4ge1xuXHRcdGNvbnN0IG5vdyA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG5cdFx0Y29uc3QgbWF4RXhlY3V0aW9uID0gbm93IC0gdGltZSA+IDUwMDA7XG5cdFx0aWYgKCFwZW5kaW5nIHx8IG1heEV4ZWN1dGlvbikge1xuXHRcdFx0d2luZG93LmNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuXHRcdFx0c3VjY2Vzc0NhbGxiYWNrKHN1cHBvcnRzKTtcblx0XHR9XG5cdH0sIDEpO1xufTtcbiIsImV4cG9ydCBjb25zdCBERUJVRyA9IHRydWU7XG4iLCIvKlxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuR2VuZXJhbE1JRElcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiovXG5cbmNvbnN0IEdNX2ZpeGVyID0gaW5fZGljdCA9PiB7XG5cdGNvbnN0IGFzSWQgPSBuYW1lID0+IHtcblx0XHRyZXR1cm4gbmFtZS5yZXBsYWNlKC9bXmEtejAtOSBdL2dpLCAnJykucmVwbGFjZSgvWyBdL2csICdfJykudG9Mb3dlckNhc2UoKTtcblx0fTtcblx0Y29uc3QgcmVzID0ge1xuXHRcdGJ5TmFtZTogeyB9LFxuXHRcdGJ5SWQ6IHsgfSxcblx0XHRieUNhdGVnb3J5OiB7IH1cblx0fTtcblx0Zm9yIChsZXQgW2tleSwgbGlzdF0gb2YgT2JqZWN0LmVudHJpZXMoaW5fZGljdCkpIHtcblx0XHRmb3IgKGxldCBpbnN0cnVtZW50IG9mIGxpc3QpIHtcblx0XHRcdGlmICghaW5zdHJ1bWVudCkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IGlkID0gcGFyc2VJbnQoaW5zdHJ1bWVudC5zdWJzdHIoMCwgaW5zdHJ1bWVudC5pbmRleE9mKCcgJykpLCAxMCk7XG5cdFx0XHRjb25zdCBwcm9ncmFtTnVtYmVyID0gaWQgLSAxO1xuXHRcdFx0Y29uc3QgbmFtZSA9IGluc3RydW1lbnQucmVwbGFjZShpZCArICcgJywgJycpO1xuXHRcdFx0Y29uc3QgbmFtZUlkID0gYXNJZChuYW1lKTtcblx0XHRcdGNvbnN0IGNhdGVnb3J5SWQgPSBhc0lkKGtleSk7XG5cdFx0XHRjb25zdCBzcGVjID0ge1xuXHRcdFx0XHRpZDogbmFtZUlkLFxuXHRcdFx0XHRuYW1lOiBuYW1lLFxuXHRcdFx0XHRwcm9ncmFtOiBwcm9ncmFtTnVtYmVyLFxuXHRcdFx0XHRjYXRlZ29yeToga2V5XG5cdFx0XHR9O1xuXHRcdFx0cmVzLmJ5SWRbcHJvZ3JhbU51bWJlcl0gPSBzcGVjO1xuXHRcdFx0cmVzLmJ5TmFtZVtuYW1lSWRdID0gc3BlYztcblx0XHRcdHJlcy5ieUNhdGVnb3J5W2NhdGVnb3J5SWRdID0gcmVzLmJ5Q2F0ZWdvcnlbY2F0ZWdvcnlJZF0gfHwgW107XG5cdFx0XHRyZXMuYnlDYXRlZ29yeVtjYXRlZ29yeUlkXS5wdXNoKHNwZWMpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmVzO1xufTtcblxuZXhwb3J0IGNvbnN0IEdNID0gR01fZml4ZXIoe1xuXHQnUGlhbm8nOiBbJzEgQWNvdXN0aWMgR3JhbmQgUGlhbm8nLCAnMiBCcmlnaHQgQWNvdXN0aWMgUGlhbm8nLCAnMyBFbGVjdHJpYyBHcmFuZCBQaWFubycsICc0IEhvbmt5LXRvbmsgUGlhbm8nLCAnNSBFbGVjdHJpYyBQaWFubyAxJywgJzYgRWxlY3RyaWMgUGlhbm8gMicsICc3IEhhcnBzaWNob3JkJywgJzggQ2xhdmluZXQnXSxcblx0J0Nocm9tYXRpYyBQZXJjdXNzaW9uJzogWyc5IENlbGVzdGEnLCAnMTAgR2xvY2tlbnNwaWVsJywgJzExIE11c2ljIEJveCcsICcxMiBWaWJyYXBob25lJywgJzEzIE1hcmltYmEnLCAnMTQgWHlsb3Bob25lJywgJzE1IFR1YnVsYXIgQmVsbHMnLCAnMTYgRHVsY2ltZXInXSxcblx0J09yZ2FuJzogWycxNyBEcmF3YmFyIE9yZ2FuJywgJzE4IFBlcmN1c3NpdmUgT3JnYW4nLCAnMTkgUm9jayBPcmdhbicsICcyMCBDaHVyY2ggT3JnYW4nLCAnMjEgUmVlZCBPcmdhbicsICcyMiBBY2NvcmRpb24nLCAnMjMgSGFybW9uaWNhJywgJzI0IFRhbmdvIEFjY29yZGlvbiddLFxuXHQnR3VpdGFyJzogWycyNSBBY291c3RpYyBHdWl0YXIgKG55bG9uKScsICcyNiBBY291c3RpYyBHdWl0YXIgKHN0ZWVsKScsICcyNyBFbGVjdHJpYyBHdWl0YXIgKGphenopJywgJzI4IEVsZWN0cmljIEd1aXRhciAoY2xlYW4pJywgJzI5IEVsZWN0cmljIEd1aXRhciAobXV0ZWQpJywgJzMwIE92ZXJkcml2ZW4gR3VpdGFyJywgJzMxIERpc3RvcnRpb24gR3VpdGFyJywgJzMyIEd1aXRhciBIYXJtb25pY3MnXSxcblx0J0Jhc3MnOiBbJzMzIEFjb3VzdGljIEJhc3MnLCAnMzQgRWxlY3RyaWMgQmFzcyAoZmluZ2VyKScsICczNSBFbGVjdHJpYyBCYXNzIChwaWNrKScsICczNiBGcmV0bGVzcyBCYXNzJywgJzM3IFNsYXAgQmFzcyAxJywgJzM4IFNsYXAgQmFzcyAyJywgJzM5IFN5bnRoIEJhc3MgMScsICc0MCBTeW50aCBCYXNzIDInXSxcblx0J1N0cmluZ3MnOiBbJzQxIFZpb2xpbicsICc0MiBWaW9sYScsICc0MyBDZWxsbycsICc0NCBDb250cmFiYXNzJywgJzQ1IFRyZW1vbG8gU3RyaW5ncycsICc0NiBQaXp6aWNhdG8gU3RyaW5ncycsICc0NyBPcmNoZXN0cmFsIEhhcnAnLCAnNDggVGltcGFuaSddLFxuXHQnRW5zZW1ibGUnOiBbJzQ5IFN0cmluZyBFbnNlbWJsZSAxJywgJzUwIFN0cmluZyBFbnNlbWJsZSAyJywgJzUxIFN5bnRoIFN0cmluZ3MgMScsICc1MiBTeW50aCBTdHJpbmdzIDInLCAnNTMgQ2hvaXIgQWFocycsICc1NCBWb2ljZSBPb2hzJywgJzU1IFN5bnRoIENob2lyJywgJzU2IE9yY2hlc3RyYSBIaXQnXSxcblx0J0JyYXNzJzogWyc1NyBUcnVtcGV0JywgJzU4IFRyb21ib25lJywgJzU5IFR1YmEnLCAnNjAgTXV0ZWQgVHJ1bXBldCcsICc2MSBGcmVuY2ggSG9ybicsICc2MiBCcmFzcyBTZWN0aW9uJywgJzYzIFN5bnRoIEJyYXNzIDEnLCAnNjQgU3ludGggQnJhc3MgMiddLFxuXHQnUmVlZCc6IFsnNjUgU29wcmFubyBTYXgnLCAnNjYgQWx0byBTYXgnLCAnNjcgVGVub3IgU2F4JywgJzY4IEJhcml0b25lIFNheCcsICc2OSBPYm9lJywgJzcwIEVuZ2xpc2ggSG9ybicsICc3MSBCYXNzb29uJywgJzcyIENsYXJpbmV0J10sXG5cdCdQaXBlJzogWyc3MyBQaWNjb2xvJywgJzc0IEZsdXRlJywgJzc1IFJlY29yZGVyJywgJzc2IFBhbiBGbHV0ZScsICc3NyBCbG93biBCb3R0bGUnLCAnNzggU2hha3VoYWNoaScsICc3OSBXaGlzdGxlJywgJzgwIE9jYXJpbmEnXSxcblx0J1N5bnRoIExlYWQnOiBbJzgxIExlYWQgMSAoc3F1YXJlKScsICc4MiBMZWFkIDIgKHNhd3Rvb3RoKScsICc4MyBMZWFkIDMgKGNhbGxpb3BlKScsICc4NCBMZWFkIDQgKGNoaWZmKScsICc4NSBMZWFkIDUgKGNoYXJhbmcpJywgJzg2IExlYWQgNiAodm9pY2UpJywgJzg3IExlYWQgNyAoZmlmdGhzKScsICc4OCBMZWFkIDggKGJhc3MgKyBsZWFkKSddLFxuXHQnU3ludGggUGFkJzogWyc4OSBQYWQgMSAobmV3IGFnZSknLCAnOTAgUGFkIDIgKHdhcm0pJywgJzkxIFBhZCAzIChwb2x5c3ludGgpJywgJzkyIFBhZCA0IChjaG9pciknLCAnOTMgUGFkIDUgKGJvd2VkKScsICc5NCBQYWQgNiAobWV0YWxsaWMpJywgJzk1IFBhZCA3IChoYWxvKScsICc5NiBQYWQgOCAoc3dlZXApJ10sXG5cdCdTeW50aCBFZmZlY3RzJzogWyc5NyBGWCAxIChyYWluKScsICc5OCBGWCAyIChzb3VuZHRyYWNrKScsICc5OSBGWCAzIChjcnlzdGFsKScsICcxMDAgRlggNCAoYXRtb3NwaGVyZSknLCAnMTAxIEZYIDUgKGJyaWdodG5lc3MpJywgJzEwMiBGWCA2IChnb2JsaW5zKScsICcxMDMgRlggNyAoZWNob2VzKScsICcxMDQgRlggOCAoc2NpLWZpKSddLFxuXHQnRXRobmljJzogWycxMDUgU2l0YXInLCAnMTA2IEJhbmpvJywgJzEwNyBTaGFtaXNlbicsICcxMDggS290bycsICcxMDkgS2FsaW1iYScsICcxMTAgQmFncGlwZScsICcxMTEgRmlkZGxlJywgJzExMiBTaGFuYWknXSxcblx0J1BlcmN1c3NpdmUnOiBbJzExMyBUaW5rbGUgQmVsbCcsICcxMTQgQWdvZ28nLCAnMTE1IFN0ZWVsIERydW1zJywgJzExNiBXb29kYmxvY2snLCAnMTE3IFRhaWtvIERydW0nLCAnMTE4IE1lbG9kaWMgVG9tJywgJzExOSBTeW50aCBEcnVtJ10sXG5cdCdTb3VuZCBlZmZlY3RzJzogWycxMjAgUmV2ZXJzZSBDeW1iYWwnLCAnMTIxIEd1aXRhciBGcmV0IE5vaXNlJywgJzEyMiBCcmVhdGggTm9pc2UnLCAnMTIzIFNlYXNob3JlJywgJzEyNCBCaXJkIFR3ZWV0JywgJzEyNSBUZWxlcGhvbmUgUmluZycsICcxMjYgSGVsaWNvcHRlcicsICcxMjcgQXBwbGF1c2UnLCAnMTI4IEd1bnNob3QnXVxufSk7XG5cbi8qIGNoYW5uZWxzXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cbmNvbnN0IGdldF9jaGFubmVscyA9ICgpID0+IHsgLy8gMCAtIDE1IGNoYW5uZWxzXG5cdGNvbnN0IGNoYW5uZWxzID0ge307XG5cdGZvciAobGV0IGkgPSAwOyBpIDwgMTY7IGkrKykge1xuXHRcdGNoYW5uZWxzW2ldID0geyAvLyBkZWZhdWx0IHZhbHVlc1xuXHRcdFx0cHJvZ3JhbTogaSxcblx0XHRcdHBpdGNoQmVuZDogMCxcblx0XHRcdG11dGU6IGZhbHNlLFxuXHRcdFx0bW9ubzogZmFsc2UsXG5cdFx0XHRvbW5pOiBmYWxzZSxcblx0XHRcdHNvbG86IGZhbHNlXG5cdFx0fTtcblx0fVxuXHRyZXR1cm4gY2hhbm5lbHM7XG59O1xuXG5leHBvcnQgY29uc3QgY2hhbm5lbHMgPSBnZXRfY2hhbm5lbHMoKTtcblxuXG5cbi8qIGdldC9zZXRJbnN0cnVtZW50XG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cbmV4cG9ydCBjb25zdCBnZXRQcm9ncmFtID0gKGNoYW5uZWxJZCkgPT4ge1xuXHRjb25zdCBjaGFubmVsID0gY2hhbm5lbHNbY2hhbm5lbElkXTtcblx0cmV0dXJuIGNoYW5uZWwgJiYgY2hhbm5lbC5wcm9ncmFtO1xufTtcblxuZXhwb3J0IGNvbnN0IHNldFByb2dyYW0gPSAoY2hhbm5lbElkLCBwcm9ncmFtLCBkZWxheSkgPT4ge1xuXHRjb25zdCBjaGFubmVsID0gY2hhbm5lbHNbY2hhbm5lbElkXTtcblx0aWYgKGRlbGF5KSB7XG5cdFx0cmV0dXJuIHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0Y2hhbm5lbC5wcm9ncmFtID0gcHJvZ3JhbTtcblx0XHR9LCBkZWxheSk7XG5cdH0gZWxzZSB7XG5cdFx0Y2hhbm5lbC5wcm9ncmFtID0gcHJvZ3JhbTtcblx0fVxufTtcblxuLyogZ2V0L3NldE1vbm9cbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuZXhwb3J0IGNvbnN0IGdldE1vbm8gPSAoY2hhbm5lbElkKSA9PiB7XG5cdGNvbnN0IGNoYW5uZWwgPSBjaGFubmVsc1tjaGFubmVsSWRdO1xuXHRyZXR1cm4gY2hhbm5lbCAmJiBjaGFubmVsLm1vbm87XG59O1xuXG5leHBvcnQgY29uc3Qgc2V0TW9ubyA9IChjaGFubmVsSWQsIHRydXRoeSwgZGVsYXkpID0+IHtcblx0Y29uc3QgY2hhbm5lbCA9IGNoYW5uZWxzW2NoYW5uZWxJZF07XG5cdGlmIChkZWxheSkge1xuXHRcdHJldHVybiBzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdGNoYW5uZWwubW9ubyA9IHRydXRoeTtcblx0XHR9LCBkZWxheSk7XG5cdH0gZWxzZSB7XG5cdFx0Y2hhbm5lbC5tb25vID0gdHJ1dGh5O1xuXHR9XG59O1xuXG4vKiBnZXQvc2V0T21uaVxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5leHBvcnQgY29uc3QgZ2V0T21uaSA9IChjaGFubmVsSWQpID0+IHtcblx0Y29uc3QgY2hhbm5lbCA9IGNoYW5uZWxzW2NoYW5uZWxJZF07XG5cdHJldHVybiBjaGFubmVsICYmIGNoYW5uZWwub21uaTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZXRPbW5pID0gKGNoYW5uZWxJZCwgdHJ1dGh5LCBkZWxheSkgPT4ge1xuXHRjb25zdCBjaGFubmVsID0gY2hhbm5lbHNbY2hhbm5lbElkXTtcblx0aWYgKGRlbGF5KSB7XG5cdFx0cmV0dXJuIHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0Y2hhbm5lbC5vbW5pID0gdHJ1dGh5O1xuXHRcdH0sIGRlbGF5KTtcblx0fSBlbHNlIHtcblx0XHRjaGFubmVsLm9tbmkgPSB0cnV0aHk7XG5cdH1cbn07XG5cbi8qIGdldC9zZXRTb2xvXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cbmV4cG9ydCBjb25zdCBnZXRTb2xvID0gY2hhbm5lbElkID0+IHtcblx0Y29uc3QgY2hhbm5lbCA9IGNoYW5uZWxzW2NoYW5uZWxJZF07XG5cdHJldHVybiBjaGFubmVsICYmIGNoYW5uZWwuc29sbztcbn07XG5cbmV4cG9ydCBjb25zdCBzZXRTb2xvID0gKGNoYW5uZWxJZCwgdHJ1dGh5KSA9PiB7XG5cdGNvbnN0IGNoYW5uZWwgPSBjaGFubmVsc1tjaGFubmVsSWRdO1xuXHRpZiAoZGVsYXkpIHtcblx0XHRyZXR1cm4gc2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRjaGFubmVsLnNvbG8gPSB0cnV0aHk7XG5cdFx0fSwgZGVsYXkpO1xuXHR9IGVsc2Uge1xuXHRcdGNoYW5uZWwuc29sbyA9IHRydXRoeTtcblx0fVxufTtcblxuXG4vKiBub3RlIGNvbnZlcnNpb25zXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cbmV4cG9ydCBjb25zdCBrZXlUb05vdGUgPSB7fTsgLy8gQzggID09IDEwOFxuZXhwb3J0IGNvbnN0IG5vdGVUb0tleSA9IHt9OyAvLyAxMDggPT0gIEM4XG5cbihmdW5jdGlvbigpIHtcblx0Y29uc3QgQTAgPSAweDE1OyAvLyBmaXJzdCBub3RlXG5cdGNvbnN0IEM4ID0gMHg2QzsgLy8gbGFzdCBub3RlXG5cdGNvbnN0IG51bWJlcjJrZXkgPSBbJ0MnLCAnRGInLCAnRCcsICdFYicsICdFJywgJ0YnLCAnR2InLCAnRycsICdBYicsICdBJywgJ0JiJywgJ0InXTtcblx0Zm9yIChsZXQgbiA9IEEwOyBuIDw9IEM4OyBuKyspIHtcblx0XHRjb25zdCBvY3RhdmUgPSAobiAtIDEyKSAvIDEyID4+IDA7XG5cdFx0Y29uc3QgbmFtZSA9IG51bWJlcjJrZXlbbiAlIDEyXSArIG9jdGF2ZTtcblx0XHRrZXlUb05vdGVbbmFtZV0gPSBuO1xuXHRcdG5vdGVUb0tleVtuXSA9IG5hbWU7XG5cdH1cbn0pKCk7XG4iLCIvKlxuXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdE1JREkuUGx1Z2luIDogMC4zLjQgOiAyMDE1LTAzLTI2XG5cdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0aHR0cHM6Ly9naXRodWIuY29tL211ZGN1YmUvTUlESS5qc1xuXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdEluc3BpcmVkIGJ5IGphdmF4LnNvdW5kLm1pZGkgKGFsYmVpdCBhIHN1cGVyIHNpbXBsZSB2ZXJzaW9uKTogXG5cdFx0aHR0cDovL2RvY3Mub3JhY2xlLmNvbS9qYXZhc2UvNi9kb2NzL2FwaS9qYXZheC9zb3VuZC9taWRpL3BhY2thZ2Utc3VtbWFyeS5odG1sXG5cdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0VGVjaG5vbG9naWVzXG5cdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0XHRXZWIgTUlESSBBUEkgLSBubyBuYXRpdmUgc3VwcG9ydCB5ZXQgKGphenpwbHVnaW4pXG5cdFx0V2ViIEF1ZGlvIEFQSSAtIGZpcmVmb3ggMjUrLCBjaHJvbWUgMTArLCBzYWZhcmkgNissIG9wZXJhIDE1K1xuXHRcdEhUTUw1IEF1ZGlvIFRhZyAtIGllIDkrLCBmaXJlZm94IDMuNSssIGNocm9tZSA0Kywgc2FmYXJpIDQrLCBvcGVyYSA5LjUrLCBpb3MgNCssIGFuZHJvaWQgMi4zK1xuXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4qL1xuaW1wb3J0ICcuL3NoaW0vV2ViQXVkaW9BUEkuanMnOyAgLy8gaW1wb3J0ZWQgYnkgZGVmYXVsdCAtLSB3ZWJtaWRpIHNoaW0gbmVlZHMgdG8gYmUgbG9hZGVkIHNlcGFyYXRlbHlcbmltcG9ydCB7IGF1ZGlvRGV0ZWN0IH0gZnJvbSAnLi9hdWRpb0RldGVjdC5qcyc7XG5pbXBvcnQgKiBhcyBBdWRpb1RhZyBmcm9tICcuL3BsdWdpbi5hdWRpb3RhZy5qcyc7XG5pbXBvcnQgKiBhcyBXZWJBdWRpbyBmcm9tICcuL3BsdWdpbi53ZWJhdWRpby5qcyc7XG5pbXBvcnQgKiBhcyBXZWJNSURJIGZyb20gJy4vcGx1Z2luLndlYm1pZGkuanMnO1xuZXhwb3J0IHsgR00sIG5vdGVUb0tleSwga2V5VG9Ob3RlLCBjaGFubmVscyB9IGZyb20gJy4vZ20uanMnO1xuaW1wb3J0IHsgUGxheUluc3RhbmNlIH0gZnJvbSAnLi9wbGF5ZXIuanMnO1xuZXhwb3J0ICogYXMgU3luZXN0aGVzaWEgZnJvbSAnLi9zeW5lc3RoZXNpYS5qcyc7XG5cbmV4cG9ydCBjb25zdCBTb3VuZGZvbnQgPSB7fTtcblxuZXhwb3J0IGNvbnN0IGF1ZGlvX2NvbnRleHRzID0ge1xuXHRBdWRpb1RhZyxcblx0V2ViQXVkaW8sXG5cdFdlYk1JREksXG59O1xuXG5leHBvcnQgY29uc3QgY29uZmlnID0ge1xuXHRzb3VuZGZvbnRVcmw6ICcuL3NvdW5kZm9udC8nLFxuXHRhcGk6IHVuZGVmaW5lZCxcblx0YXVkaW9Gb3JtYXQ6IHVuZGVmaW5lZCxcblx0c3VwcG9ydHM6IHt9LFxuXHRjb25uZWN0ZWRfcGx1Z2luOiB1bmRlZmluZWQsXG59O1xuXG5cbi8qXG5NSURJLmxvYWRQbHVnaW4oe1xuXHRvbnN1Y2Nlc3M6IGZ1bmN0aW9uKCkgeyB9LFxuXHRvbnByb2dyZXNzOiBmdW5jdGlvbihzdGF0ZSwgcGVyY2VudCkgeyB9LFxuXHR0YXJnZXRGb3JtYXQ6ICdtcDMnLCAvLyBvcHRpb25hbGx5IGNhbiBmb3JjZSB0byB1c2UgTVAzIChmb3IgaW5zdGFuY2Ugb24gbW9iaWxlIG5ldHdvcmtzKVxuXHRpbnN0cnVtZW50OiAnYWNvdXN0aWNfZ3JhbmRfcGlhbm8nLCAvLyBvciAxIChkZWZhdWx0KVxuXHRpbnN0cnVtZW50czogWyAnYWNvdXN0aWNfZ3JhbmRfcGlhbm8nLCAnYWNvdXN0aWNfZ3VpdGFyX255bG9uJyBdIC8vIG9yIG11bHRpcGxlIGluc3RydW1lbnRzXG59KTtcbiovXG5cbmV4cG9ydCBjb25zdCBsb2FkUGx1Z2luID0gb3B0cyA9PiB7XG5cdGlmICh0eXBlb2Ygb3B0cyA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdG9wdHMgPSB7XG5cdFx0XHRvbnN1Y2Nlc3M6IG9wdHNcblx0XHR9O1xuXHR9XG5cdG9wdHMub25wcm9ncmVzcyA9IG9wdHMub25wcm9ncmVzcyB8fCB1bmRlZmluZWQ7XG5cdG9wdHMuYXBpID0gb3B0cy5hcGkgfHwgJyc7XG5cdG9wdHMudGFyZ2V0Rm9ybWF0ID0gb3B0cy50YXJnZXRGb3JtYXQgfHwgJyc7XG5cdG9wdHMuaW5zdHJ1bWVudCA9IG9wdHMuaW5zdHJ1bWVudCB8fCAnYWNvdXN0aWNfZ3JhbmRfcGlhbm8nO1xuXHRvcHRzLmluc3RydW1lbnRzID0gb3B0cy5pbnN0cnVtZW50cyB8fCB1bmRlZmluZWQ7XG5cdC8vIE1TQzogYWRkIHRoZSBvcmRlciBvZiBBUEkgcHJlY2VkZW5jZS5cblx0Ly8gICAgICBDaHJvbWUncyBuZWVkIGZvciBzeXMgcGVybWlzc2lvbnMgZm9yIHdlYm1pZGkgbWFrZXMgaXQgbG93ZXIgcHJlY2VkZW5jZS5cblx0b3B0cy5hcGlQcmVjZWRlbmNlID0gb3B0cy5hcGlQcmVjZWRlbmNlIHx8IFsnd2ViYXVkaW8nLCAnd2VibWlkaScsICdhdWRpb3RhZyddO1xuXG5cdGNvbmZpZy5zb3VuZGZvbnRVcmwgPSBvcHRzLnNvdW5kZm9udFVybCB8fCBjb25maWcuc291bmRmb250VXJsO1xuXG5cdC8vIERldGVjdCB0aGUgYmVzdCB0eXBlIG9mIGF1ZGlvIHRvIHVzZVxuXHRhdWRpb0RldGVjdChzdXBwb3J0cyA9PiB7XG5cdFx0Y29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuXHRcdGxldCBhcGkgPSAnJztcblxuXHRcdC8vIHVzZSB0aGUgbW9zdCBhcHByb3ByaWF0ZSBwbHVnaW4gaWYgbm90IHNwZWNpZmllZFxuXHRcdGlmIChzdXBwb3J0c1tvcHRzLmFwaV0pIHtcblx0XHRcdGFwaSA9IG9wdHMuYXBpO1xuXHRcdH0gZWxzZSBpZiAoc3VwcG9ydHNbaGFzaC5zdWJzdHIoMSldKSB7XG5cdFx0XHRhcGkgPSBoYXNoLnN1YnN0cigxKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Zm9yIChjb25zdCBhcGlJbk9yZGVyIG9mIG9wdHMuYXBpUHJlY2VkZW5jZSkge1xuXHRcdFx0XHRpZiAoc3VwcG9ydHNbYXBpSW5PcmRlcl0pIHtcblx0XHRcdFx0XHRhcGkgPSBhcGlJbk9yZGVyO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGNvbm5lY3RbYXBpXSkge1xuXHRcdFx0bGV0IGF1ZGlvRm9ybWF0O1xuXHRcdFx0Ly8gdXNlIGF1ZGlvL29nZyB3aGVuIHN1cHBvcnRlZFxuXHRcdFx0aWYgKG9wdHMudGFyZ2V0Rm9ybWF0KSB7XG5cdFx0XHRcdGF1ZGlvRm9ybWF0ID0gb3B0cy50YXJnZXRGb3JtYXQ7XG5cdFx0XHR9IGVsc2UgeyAvLyB1c2UgYmVzdCBxdWFsaXR5XG5cdFx0XHRcdGF1ZGlvRm9ybWF0ID0gc3VwcG9ydHNbJ2F1ZGlvL29nZyddID8gJ29nZycgOiAnbXAzJztcblx0XHRcdH1cblxuXHRcdFx0Ly8gbG9hZCB0aGUgc3BlY2lmaWVkIHBsdWdpblxuXHRcdFx0Y29uZmlnLmFwaSA9IGFwaTtcblx0XHRcdGNvbmZpZy5hdWRpb0Zvcm1hdCA9IGF1ZGlvRm9ybWF0O1xuXHRcdFx0Y29uZmlnLnN1cHBvcnRzID0gc3VwcG9ydHM7XG5cdFx0XHRsb2FkUHJvZ3JhbShvcHRzKTtcblx0XHR9XG5cdH0pO1xufTtcblxuLypcblx0bG9hZFByb2dyYW0oe1xuXHRcdGluc3RydW1lbnQ6ICdiYW5qbydcblx0XHRvbnN1Y2Nlc3M6IGZ1bmN0aW9uKCkgeyB9LFxuXHRcdG9ucHJvZ3Jlc3M6IGZ1bmN0aW9uKHN0YXRlLCBwZXJjZW50KSB7IH0sXG5cdFx0b25lcnJvcjogZnVuY3Rpb24oKSB7IH0sXG5cdH0pXG4qL1xuXG5leHBvcnQgY29uc3QgbG9hZFByb2dyYW0gPSBvcHRzID0+IHtcblx0bGV0IGluc3RydW1lbnRzID0gb3B0cy5pbnN0cnVtZW50cyB8fCBvcHRzLmluc3RydW1lbnQgfHwgJ2Fjb3VzdGljX2dyYW5kX3BpYW5vJztcblx0Ly9cblx0aWYgKHR5cGVvZiBpbnN0cnVtZW50cyAhPT0gJ29iamVjdCcpIHtcblx0XHRpZiAoaW5zdHJ1bWVudHMgfHwgaW5zdHJ1bWVudHMgPT09IDApIHtcblx0XHRcdGluc3RydW1lbnRzID0gW2luc3RydW1lbnRzXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aW5zdHJ1bWVudHMgPSBbXTtcblx0XHR9XG5cdH1cblx0Ly8gY29udmVydCBudW1lcmljIGlkcyBpbnRvIHN0cmluZ3Ncblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBpbnN0cnVtZW50cy5sZW5ndGg7IGkgKyspIHtcblx0XHRjb25zdCBpbnN0cnVtZW50ID0gaW5zdHJ1bWVudHNbaV07XG5cdFx0aWYgKGluc3RydW1lbnQgPT09IChpbnN0cnVtZW50ICsgMCkpIHsgLy8gaXMgbnVtZXJpY1xuXHRcdFx0aWYgKEdNLmJ5SWRbaW5zdHJ1bWVudF0pIHtcblx0XHRcdFx0aW5zdHJ1bWVudHNbaV0gPSBHTS5ieUlkW2luc3RydW1lbnRdLmlkO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHQvL1xuXHRvcHRzLmZvcm1hdCA9IGNvbmZpZy5hdWRpb0Zvcm1hdDtcblx0b3B0cy5pbnN0cnVtZW50cyA9IGluc3RydW1lbnRzO1xuXHQvL1xuXHRjb25uZWN0W2NvbmZpZy5hcGldKG9wdHMpO1xufTtcblxuY29uc3QgY29ubmVjdCA9IHtcblx0d2VibWlkaTogb3B0cyA9PiB7XG5cdFx0Ly8gY2FudCB3YWl0IGZvciB0aGlzIHRvIGJlIHN0YW5kYXJkaXplZCFcblx0XHRwcmVfY29ubmVjdChXZWJNSURJLCBvcHRzKTtcblx0XHRXZWJNSURJLmNvbm5lY3Qob3B0cyk7XG5cdH0sXG5cdGF1ZGlvdGFnOiBvcHRzID0+IHtcblx0XHQvLyB3b3JrcyBvaywga2luZGEgbGlrZSBhIGRydW5rZW4gdHVuYSBmaXNoLCBhY3Jvc3MgdGhlIGJvYXJkXG5cdFx0Ly8gaHR0cDovL2Nhbml1c2UuY29tL2F1ZGlvXG5cdFx0cHJlX2Nvbm5lY3QoQXVkaW9UYWcsIG9wdHMpO1xuXHRcdHJlcXVlc3RRdWV1ZShvcHRzLCAnQXVkaW9UYWcnKTtcblx0fSxcblx0d2ViYXVkaW86IG9wdHMgPT4ge1xuXHRcdC8vIHdvcmtzIGF3ZXNvbWUhIHNhZmFyaSwgY2hyb21lIGFuZCBmaXJlZm94IHN1cHBvcnRcblx0XHQvLyBodHRwOi8vY2FuaXVzZS5jb20vd2ViLWF1ZGlvXG5cdFx0cHJlX2Nvbm5lY3QoV2ViQXVkaW8sIG9wdHMpO1xuXHRcdHJlcXVlc3RRdWV1ZShvcHRzLCAnV2ViQXVkaW8nKTtcblx0fVxufTtcblxuY29uc3QgcHJlX2Nvbm5lY3QgPSAocGx1Z2luLCBvcHRzKSA9PiB7XG5cdGNvbmZpZy5jb25uZWN0ZWRfcGx1Z2luID0gcGx1Z2luO1xuXHRwbHVnaW4uc2hhcmVkX3Jvb3RfaW5mby5Tb3VuZGZvbnQgPSBTb3VuZGZvbnQ7XG5cdHBsdWdpbi5zaGFyZWRfcm9vdF9pbmZvLmNvbmZpZyA9IGNvbmZpZztcblx0cGx1Z2luLnNoYXJlZF9yb290X2luZm8ud2ViYXVkaW9fYmFja3VwX2Nvbm5lY3QgPSBvcHRzID0+IGNvbm5lY3RbJ3dlYmF1ZGlvJ10ob3B0cyk7XG59XG5cbmV4cG9ydCBjb25zdCByZXF1ZXN0UXVldWUgPSAob3B0cywgY29udGV4dCkgPT4ge1xuXHRjb25zdCBhdWRpb0Zvcm1hdCA9IG9wdHMuZm9ybWF0O1xuXHRjb25zdCBpbnN0cnVtZW50cyA9IG9wdHMuaW5zdHJ1bWVudHM7XG5cdGNvbnN0IG9ucHJvZ3Jlc3MgPSBvcHRzLm9ucHJvZ3Jlc3M7XG5cdGNvbnN0IG9uZXJyb3IgPSBvcHRzLm9uZXJyb3I7XG5cdGNvbnN0IGNvcnJlY3RfYXVkaW9fY29udGV4dCA9IGF1ZGlvX2NvbnRleHRzW2NvbnRleHRdIHx8IGNvbnRleHQuV2ViQXVkaW87XG5cblx0Y29uc3QgbnVtX2luc3RydW1lbnRzID0gaW5zdHJ1bWVudHMubGVuZ3RoO1xuXHRsZXQgcGVuZGluZyA9IG51bV9pbnN0cnVtZW50cztcblx0Y29uc3Qgd2FpdEZvckVuZCA9ICgpID0+IHtcblx0XHRwZW5kaW5nIC09IDE7XG5cdFx0aWYgKCFwZW5kaW5nKSB7XG5cdFx0XHRvbnByb2dyZXNzICYmIG9ucHJvZ3Jlc3MoJ2xvYWQnLCAxLjApO1xuXHRcdFx0Y29ycmVjdF9hdWRpb19jb250ZXh0LmNvbm5lY3Qob3B0cyk7XG5cdFx0fVxuXHR9O1xuXG5cdGZvciAoY29uc3QgaW5zdHJ1bWVudElkIG9mIGluc3RydW1lbnRzKSB7XG5cdFx0aWYgKFNvdW5kZm9udFtpbnN0cnVtZW50SWRdKSB7IC8vIGFscmVhZHkgbG9hZGVkXG5cdFx0XHR3YWl0Rm9yRW5kKCk7XG5cdFx0fSBlbHNlIHsgLy8gbmVlZHMgdG8gYmUgcmVxdWVzdGVkXG5cdFx0XHRjb25zdCBvbnByb2dyZXNzX2lubmVyID0gKGV2dCwgcHJvZ3Jlc3MpID0+IHtcblx0XHRcdFx0Y29uc3QgZmlsZVByb2dyZXNzID0gcHJvZ3Jlc3MgLyBudW1faW5zdHJ1bWVudHM7XG5cdFx0XHRcdGNvbnN0IHF1ZXVlUHJvZ3Jlc3MgPSAobnVtX2luc3RydW1lbnRzIC0gcGVuZGluZykgLyBudW1faW5zdHJ1bWVudHM7XG5cdFx0XHRcdG9ucHJvZ3Jlc3MgJiYgb25wcm9ncmVzcygnbG9hZCcsIGZpbGVQcm9ncmVzcyArIHF1ZXVlUHJvZ3Jlc3MsIGluc3RydW1lbnRJZCk7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBvbnN1Y2Nlc3NfaW5uZXIgPSAoKSA9PiB3YWl0Rm9yRW5kKCk7XG5cdFx0XHRzZW5kUmVxdWVzdChpbnN0cnVtZW50SWQsIGF1ZGlvRm9ybWF0LCBvbnByb2dyZXNzX2lubmVyLCBvbnN1Y2Nlc3NfaW5uZXIsIG9uZXJyb3IpO1xuXHRcdH1cblx0fTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZW5kUmVxdWVzdCA9IChpbnN0cnVtZW50SWQsIGF1ZGlvRm9ybWF0LCBvbnByb2dyZXNzLCBvbnN1Y2Nlc3MsIG9uZXJyb3IpID0+IHtcblx0Y29uc3Qgc291bmRmb250UGF0aCA9IGNvbmZpZy5zb3VuZGZvbnRVcmwgKyBpbnN0cnVtZW50SWQgKyAnLScgKyBhdWRpb0Zvcm1hdCArICcuanMnO1xuXHRjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblx0eGhyLm9wZW4oJ0dFVCcsIHNvdW5kZm9udFBhdGgpO1xuXHR4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ3RleHQvcGxhaW4nKTtcblx0eGhyLm9ubG9hZCA9ICgpID0+IHtcblx0XHRpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG5cdFx0XHRjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcblx0XHRcdHNjcmlwdC5sYW5ndWFnZSA9ICdqYXZhc2NyaXB0Jztcblx0XHRcdHNjcmlwdC50eXBlID0gJ3RleHQvamF2YXNjcmlwdCc7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyh4aHIucmVzcG9uc2VUZXh0KTtcblx0XHRcdHNjcmlwdC50ZXh0ID0geGhyLnJlc3BvbnNlVGV4dDtcblx0XHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcblx0XHRcdG9uc3VjY2VzcygpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvbmVycm9yKCk7XG5cdFx0fVxuXHR9O1xuXHR4aHIuc2VuZCgpO1xufTtcblxuZXhwb3J0IGNvbnN0IHBsYXlDaGFubmVsID0gKC4uLm9wdGlvbnMpID0+IHtcblx0cmV0dXJuIGNvbmZpZy5jb25uZWN0ZWRfcGx1Z2luLnBsYXlDaGFubmVsKC4uLm9wdGlvbnMpO1xufVxuXG5leHBvcnQgY29uc3Qgc3RvcENoYW5uZWwgPSAoLi4ub3B0aW9ucykgPT4ge1xuXHRyZXR1cm4gY29uZmlnLmNvbm5lY3RlZF9wbHVnaW4uc3RvcENoYW5uZWwoLi4ub3B0aW9ucyk7XG59XG5cbi8vIFRPRE86IGF1ZGlvQnVmZmVyc1xuXG5leHBvcnQgY29uc3Qgc2VuZCA9ICguLi5vcHRpb25zKSA9PiB7XG5cdHJldHVybiBjb25maWcuY29ubmVjdGVkX3BsdWdpbi5zZW5kKC4uLm9wdGlvbnMpO1xufVxuZXhwb3J0IGNvbnN0IHNldENvbnRyb2xsZXIgPSAoLi4ub3B0aW9ucykgPT4ge1xuXHRyZXR1cm4gY29uZmlnLmNvbm5lY3RlZF9wbHVnaW4uc2V0Q29udHJvbGxlciguLi5vcHRpb25zKTtcbn1cbmV4cG9ydCBjb25zdCBzZXRWb2x1bWUgPSAoLi4ub3B0aW9ucykgPT4ge1xuXHRyZXR1cm4gY29uZmlnLmNvbm5lY3RlZF9wbHVnaW4uc2V0Vm9sdW1lKC4uLm9wdGlvbnMpO1xufVxuZXhwb3J0IGNvbnN0IHByb2dyYW1DaGFuZ2UgPSAoLi4ub3B0aW9ucykgPT4ge1xuXHRyZXR1cm4gY29uZmlnLmNvbm5lY3RlZF9wbHVnaW4ucHJvZ3JhbUNoYW5nZSguLi5vcHRpb25zKTtcbn1cbmV4cG9ydCBjb25zdCBwaXRjaEJlbmQgPSAoLi4ub3B0aW9ucykgPT4ge1xuXHRyZXR1cm4gY29uZmlnLmNvbm5lY3RlZF9wbHVnaW4ucGl0Y2hCZW5kKC4uLm9wdGlvbnMpO1xufVxuZXhwb3J0IGNvbnN0IG5vdGVPbiA9ICguLi5vcHRpb25zKSA9PiB7XG5cdHJldHVybiBjb25maWcuY29ubmVjdGVkX3BsdWdpbi5ub3RlT24oLi4ub3B0aW9ucyk7XG59XG5leHBvcnQgY29uc3Qgbm90ZU9mZiA9ICguLi5vcHRpb25zKSA9PiB7XG5cdHJldHVybiBjb25maWcuY29ubmVjdGVkX3BsdWdpbi5ub3RlT2ZmKC4uLm9wdGlvbnMpO1xufVxuXG5leHBvcnQgY29uc3QgY2hvcmRPbiA9ICguLi5vcHRpb25zKSA9PiB7XG5cdHJldHVybiBjb25maWcuY29ubmVjdGVkX3BsdWdpbi5jaG9yZE9uKC4uLm9wdGlvbnMpO1xufVxuXG5leHBvcnQgY29uc3QgY2hvcmRPZmYgPSAoLi4ub3B0aW9ucykgPT4ge1xuXHRyZXR1cm4gY29uZmlnLmNvbm5lY3RlZF9wbHVnaW4uY2hvcmRPZmYoLi4ub3B0aW9ucyk7XG59XG5cbmV4cG9ydCBjb25zdCBzdG9wQWxsTm90ZXMgPSAoLi4ub3B0aW9ucykgPT4ge1xuXHRyZXR1cm4gY29uZmlnLmNvbm5lY3RlZF9wbHVnaW4uc3RvcEFsbE5vdGVzKC4uLm9wdGlvbnMpO1xufVxuXG5cbmV4cG9ydCBjb25zdCBzZXRFZmZlY3RzID0gKC4uLm9wdGlvbnMpID0+IHtcblx0aWYgKGNvbmZpZy5jb25uZWN0ZWRfcGx1Z2luICE9PSBXZWJBdWRpbykge1xuXHRcdHJldHVybjtcblx0fVxuXHRyZXR1cm4gY29uZmlnLmNvbm5lY3RlZF9wbHVnaW4uc2V0RWZmZWN0cygpO1xufVxuXG5leHBvcnQgY29uc3QgZ2V0Q29udGV4dCA9ICgpID0+IHtcblx0aWYgKGNvbmZpZy5jb25uZWN0ZWRfcGx1Z2luICE9PSBXZWJBdWRpbykge1xuXHRcdHJldHVybjtcblx0fVxuXHRyZXR1cm4gY29uZmlnLmNvbm5lY3RlZF9wbHVnaW4uZ2V0Q29udGV4dCgpO1xufVxuXG5cbmV4cG9ydCBjb25zdCBzZXRDb250ZXh0ID0gKC4uLm9wdGlvbnMpID0+IHtcblx0aWYgKGNvbmZpZy5jb25uZWN0ZWRfcGx1Z2luICE9PSBXZWJBdWRpbykge1xuXHRcdHJldHVybjtcblx0fVxuXHRyZXR1cm4gY29uZmlnLmNvbm5lY3RlZF9wbHVnaW4uc2V0Q29udGV4dCguLi5vcHRpb25zKTtcbn1cblxuXG4vLyBQbGF5ZXJcblxuZXhwb3J0IGNsYXNzIFBsYXllciBleHRlbmRzIFBsYXlJbnN0YW5jZSB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKGNvbmZpZy5jb25uZWN0ZWRfcGx1Z2luKTtcblx0fVxuXHRsb2FkUGx1Z2luKC4uLm9wdGlvbnMpIHtcblx0XHRyZXR1cm4gbG9hZFBsdWdpbiguLi5vcHRpb25zKTtcblx0fVxufVxuIiwiLypcblx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRNSURJLlBsYXllciA6IDAuMy4xIDogMjAxNS0wMy0yNlxuXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdGh0dHBzOi8vZ2l0aHViLmNvbS9tdWRjdWJlL01JREkuanNcblx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuKi9cbmltcG9ydCB7IGNoYW5uZWxzLCBHTSB9IGZyb20gJy4vZ20uanMnO1xuaW1wb3J0IHsgTWlkaUZpbGUgfSBmcm9tICcuLi9pbmMvamFzbWlkL21pZGlmaWxlLmpzJztcbmltcG9ydCB7IFJlcGxheWVyIH0gZnJvbSAnLi4vaW5jL2phc21pZC9yZXBsYXllci5qcyc7XG5cbmV4cG9ydCBjbGFzcyBQbGF5SW5zdGFuY2Uge1xuICAgIGNvbnN0cnVjdG9yKHBsdWdpbikge1xuICAgICAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcbiAgICAgICAgdGhpcy5jdXJyZW50VGltZSA9IDA7XG4gICAgICAgIHRoaXMuZW5kVGltZSA9IDA7XG4gICAgICAgIHRoaXMucmVzdGFydCA9IDA7XG4gICAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnRpbWVXYXJwID0gMTtcbiAgICAgICAgdGhpcy5zdGFydERlbGF5ID0gMDtcbiAgICAgICAgdGhpcy5CUE0gPSAxMjA7XG5cbiAgICAgICAgdGhpcy5ldmVudFF1ZXVlID0gW107IC8vIGhvbGQgZXZlbnRzIHRvIGJlIHRyaWdnZXJlZFxuICAgICAgICB0aGlzLnF1ZXVlZFRpbWUgPSAwLjA7IC8vXG4gICAgICAgIHRoaXMuc3RhcnRUaW1lID0gMDsgLy8gdG8gbWVhc3VyZSB0aW1lIGVsYXBzZVxuICAgICAgICB0aGlzLm5vdGVSZWdpc3RyYXIgPSB7fTsgLy8gZ2V0IGV2ZW50IGZvciByZXF1ZXN0ZWQgbm90ZVxuICAgICAgICB0aGlzLm9uTWlkaUV2ZW50ID0gdW5kZWZpbmVkOyAvLyBsaXN0ZW5lclxuICAgICAgICB0aGlzLmZyYW1lID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIHRoaXMuX19ub3cgPSB1bmRlZmluZWQ7XG5cbiAgICB9XG5cbiAgICBzdGFydChvbnN1Y2Nlc3MpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFRpbWUgPCAtMSkge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50VGltZSA9IC0xO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3RhcnRBdWRpbyh0aGlzLmN1cnJlbnRUaW1lLCBudWxsLCBvbnN1Y2Nlc3MpO1xuICAgIH1cbiAgICByZXN1bWUob25zdWNjZXNzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXJ0KG9uc3VjY2Vzcyk7XG4gICAgfVxuXG4gICAgcGF1c2UoKSB7XG4gICAgICAgIGNvbnN0IHRtcCA9IHRoaXMucmVzdGFydDtcbiAgICAgICAgdGhpcy5zdG9wQXVkaW8oKTtcbiAgICAgICAgdGhpcy5yZXN0YXJ0ID0gdG1wO1xuICAgIH07XG5cbiAgICBzdG9wKCkge1xuICAgICAgICB0aGlzLnN0b3BBdWRpbygpO1xuICAgICAgICB0aGlzLnJlc3RhcnQgPSAwO1xuICAgICAgICB0aGlzLmN1cnJlbnRUaW1lID0gMDtcbiAgICB9XG5cbiAgICBhZGRMaXN0ZW5lcihvbnN1Y2Nlc3MpIHtcbiAgICAgICAgdGhpcy5vbk1pZGlFdmVudCA9IG9uc3VjY2VzcztcbiAgICB9XG5cbiAgICByZW1vdmVMaXN0ZW5lcigpIHtcbiAgICAgICAgdGhpcy5vbk1pZGlFdmVudCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgY2xlYXJBbmltYXRpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbkZyYW1lSWQpICB7XG4gICAgICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShtdGhpcy5hbmltYXRpb25GcmFtZUlkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzZXRBbmltYXRpb24oY2FsbGJhY2spIHtcbiAgICAgICAgbGV0IGN1cnJlbnRUaW1lID0gMDtcbiAgICAgICAgbGV0IHRPdXJUaW1lID0gMDtcbiAgICAgICAgbGV0IHRUaGVpclRpbWUgPSAwO1xuICAgICAgICB0aGlzLmNsZWFyQW5pbWF0aW9uKCk7XG4gICAgICAgIHRoaXMuZnJhbWUgPSAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbkZyYW1lSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5mcmFtZSk7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgaWYgKHRoaXMuZW5kVGltZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXlpbmcpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50VGltZSA9ICh0VGhlaXJUaW1lID09PSB0aGlzLmN1cnJlbnRUaW1lKSA/IHRPdXJUaW1lIC0gRGF0ZS5ub3coKSA6IDA7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudFRpbWUgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFRpbWUgPSAwO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUaW1lID0gdGhpcy5jdXJyZW50VGltZSAtIGN1cnJlbnRUaW1lO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodFRoZWlyVGltZSAhPT0gdGhpcy5jdXJyZW50VGltZSkge1xuICAgICAgICAgICAgICAgICAgICB0T3VyVGltZSA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgICAgIHRUaGVpclRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7IC8vIHBhdXNlZFxuICAgICAgICAgICAgICAgIGN1cnJlbnRUaW1lID0gdGhpcy5jdXJyZW50VGltZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgZW5kVGltZSA9IHRoaXMuZW5kVGltZTtcbiAgICAgICAgICAgIC8vIGNvbnN0IHBlcmNlbnQgPSBjdXJyZW50VGltZSAvIGVuZFRpbWU7XG4gICAgICAgICAgICBjb25zdCB0b3RhbCA9IGN1cnJlbnRUaW1lIC8gMTAwMDtcbiAgICAgICAgICAgIGNvbnN0IG1pbnV0ZXMgPSB0b3RhbCAvIDYwO1xuICAgICAgICAgICAgY29uc3Qgc2Vjb25kcyA9IHRvdGFsIC0gKG1pbnV0ZXMgKiA2MCk7XG4gICAgICAgICAgICBjb25zdCB0MSA9IG1pbnV0ZXMgKiA2MCArIHNlY29uZHM7XG4gICAgICAgICAgICBjb25zdCB0MiA9IChlbmRUaW1lIC8gMTAwMCk7XG5cbiAgICAgICAgICAgIGlmICh0MiAtIHQxIDwgLTEuMCkge1xuICAgICAgICAgICAgICAgIC8vIG5vaW5zcGVjdGlvbiBVbm5lY2Vzc2FyeVJldHVyblN0YXRlbWVudEpTXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayh7XG4gICAgICAgICAgICAgICAgICAgIG5vdzogdDEsXG4gICAgICAgICAgICAgICAgICAgIGVuZDogdDIsXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50czogdGhpcy5ub3RlUmVnaXN0cmFyXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuZnJhbWUpO1xuICAgIH1cblxuICAgIGxvYWRNaWRpRmlsZShvbnN1Y2Nlc3MsIG9ucHJvZ3Jlc3MsIG9uZXJyb3IpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMucmVwbGF5ZXIgPSBuZXcgUmVwbGF5ZXIoTWlkaUZpbGUodGhpcy5jdXJyZW50RGF0YSksIHRoaXMudGltZVdhcnAsIG51bGwsIHRoaXMuQlBNKTtcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IHRoaXMucmVwbGF5ZXIuZ2V0RGF0YSgpO1xuICAgICAgICAgICAgdGhpcy5lbmRUaW1lID0gdGhpcy5nZXRMZW5ndGgoKTtcblxuICAgICAgICAgICAgdGhpcy5sb2FkUGx1Z2luKHtcbiAgICAgICAgICAgICAgICAvLyBpbnN0cnVtZW50czogdGhpcy5nZXRGaWxlSW5zdHJ1bWVudHMoKSxcbiAgICAgICAgICAgICAgICBvbnN1Y2Nlc3M6IG9uc3VjY2VzcyxcbiAgICAgICAgICAgICAgICBvbnByb2dyZXNzOiBvbnByb2dyZXNzLFxuICAgICAgICAgICAgICAgIG9uZXJyb3I6IG9uZXJyb3JcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoKGV2ZW50KSB7XG4gICAgICAgICAgICBvbmVycm9yICYmIG9uZXJyb3IoZXZlbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbG9hZFBsdWdpbiguLi5vcHRpb25zKSB7ICAvLyBvdmVycmlkZSBpbiBzdWJjbGFzc2VzXG4gICAgICAgIH1cblxuICAgIGxvYWRGaWxlKGZpbGUsIG9uc3VjY2Vzcywgb25wcm9ncmVzcywgb25lcnJvcikge1xuICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgaWYgKGZpbGUuaW5kZXhPZignYmFzZTY0LCcpICE9PSAtMSkge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50RGF0YSA9IGF0b2IoZmlsZS5zcGxpdCgnLCcpWzFdKTtcbiAgICAgICAgICAgIHRoaXMubG9hZE1pZGlGaWxlKG9uc3VjY2Vzcywgb25wcm9ncmVzcywgb25lcnJvcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBmZXRjaCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgZmV0Y2gub3BlbignR0VUJywgZmlsZSk7XG4gICAgICAgICAgICBmZXRjaC5vdmVycmlkZU1pbWVUeXBlKCd0ZXh0L3BsYWluOyBjaGFyc2V0PXgtdXNlci1kZWZpbmVkJyk7XG4gICAgICAgICAgICBmZXRjaC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGZldGNoLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZldGNoLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ID0gZmV0Y2gucmVzcG9uc2VUZXh0IHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmYgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG14ID0gdC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzY2MgPSBTdHJpbmcuZnJvbUNoYXJDb2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgeiA9IDA7IHogPCBteDsgeisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmZbel0gPSBzY2ModC5jaGFyQ29kZUF0KHopICYgMjU1KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RGF0YSA9IGZmLmpvaW4oJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkTWlkaUZpbGUob25zdWNjZXNzLCBvbnByb2dyZXNzLCBvbmVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uZXJyb3IgJiYgb25lcnJvcignVW5hYmxlIHRvIGxvYWQgTUlESSBmaWxlJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZmV0Y2guc2VuZCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0RmlsZUluc3RydW1lbnRzKCkge1xuICAgICAgICBjb25zdCBpbnN0cnVtZW50cyA9IHt9O1xuICAgICAgICBjb25zdCBwcm9ncmFtcyA9IHt9O1xuICAgICAgICBmb3IgKGxldCBuID0gMDsgbiA8IG1pZGkuZGF0YS5sZW5ndGg7IG4gKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gbWlkaS5kYXRhW25dWzBdLmV2ZW50O1xuICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgIT09ICdjaGFubmVsJykge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgY2hhbm5lbCA9IGV2ZW50LmNoYW5uZWw7XG4gICAgICAgICAgICBzd2l0Y2goZXZlbnQuc3VidHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2NvbnRyb2xsZXInOlxuLy8gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhldmVudC5jaGFubmVsLCBNSURJLmRlZmluZUNvbnRyb2xbZXZlbnQuY29udHJvbGxlclR5cGVdLCBldmVudC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3Byb2dyYW1DaGFuZ2UnOlxuICAgICAgICAgICAgICAgICAgICBwcm9ncmFtc1tjaGFubmVsXSA9IGV2ZW50LnByb2dyYW1OdW1iZXI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ25vdGVPbic6XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb2dyYW0gPSBwcm9ncmFtc1tjaGFubmVsXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZ20gPSBHTS5ieUlkW2lzRmluaXRlKHByb2dyYW0pID8gcHJvZ3JhbSA6IGNoYW5uZWxdO1xuICAgICAgICAgICAgICAgICAgICBpbnN0cnVtZW50c1tnbS5pZF0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXQgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoaW5zdHJ1bWVudHMpKSB7XG4gICAgICAgICAgICByZXQucHVzaChrZXkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgLy8gUGxheWluZyB0aGUgYXVkaW9cblxuICAgIHNjaGVkdWxlVHJhY2tpbmcoY2hhbm5lbCwgbm90ZSwgY3VycmVudFRpbWUsIG9mZnNldCwgbWVzc2FnZSwgdmVsb2NpdHksIHRpbWUpIHtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBjaGFubmVsOiBjaGFubmVsLFxuICAgICAgICAgICAgICAgIG5vdGU6IG5vdGUsXG4gICAgICAgICAgICAgICAgbm93OiBjdXJyZW50VGltZSxcbiAgICAgICAgICAgICAgICBlbmQ6IHRoaXMuZW5kVGltZSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB2ZWxvY2l0eVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChtZXNzYWdlID09PSAxMjgpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5ub3RlUmVnaXN0cmFyW25vdGVdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGVSZWdpc3RyYXJbbm90ZV0gPSBkYXRhO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMub25NaWRpRXZlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uTWlkaUV2ZW50KGRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdXJyZW50VGltZSA9IGN1cnJlbnRUaW1lO1xuICAgICAgICAgICAgdGhpcy5ldmVudFF1ZXVlLnNoaWZ0KCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmV2ZW50UXVldWUubGVuZ3RoIDwgMTAwMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnRBdWRpbyh0aGlzLnF1ZXVlZFRpbWUsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmN1cnJlbnRUaW1lID09PSB0aGlzLnF1ZXVlZFRpbWUgJiYgdGhpcy5xdWV1ZWRUaW1lIDwgdGhpcy5lbmRUaW1lKSB7IC8vIGdyYWIgbmV4dCBzZXF1ZW5jZVxuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnRBdWRpbyh0aGlzLnF1ZXVlZFRpbWUsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBjdXJyZW50VGltZSAtIG9mZnNldCk7XG4gICAgfVxuXG4gICAgZ2V0Q29udGV4dCgpIHtcbiAgICAgICAgaWYgKE1JREkuYXBpID09PSAnd2ViYXVkaW8nKSB7XG4gICAgICAgICAgICByZXR1cm4gTUlESS5XZWJBdWRpby5nZXRDb250ZXh0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmN0eCA9IHtjdXJyZW50VGltZTogMH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuY3R4O1xuICAgIH1cblxuICAgIGdldExlbmd0aCgpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9ICB0aGlzLmRhdGE7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGRhdGEubGVuZ3RoO1xuICAgICAgICBsZXQgdG90YWxUaW1lID0gMC41O1xuICAgICAgICBmb3IgKGxldCBuID0gMDsgbiA8IGxlbmd0aDsgbisrKSB7XG4gICAgICAgICAgICB0b3RhbFRpbWUgKz0gZGF0YVtuXVsxXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdG90YWxUaW1lO1xuICAgIH1cblxuICAgIGdldE5vdygpIHtcbiAgICAgICAgaWYgKHdpbmRvdy5wZXJmb3JtYW5jZSAmJiB3aW5kb3cucGVyZm9ybWFuY2Uubm93KSB7XG4gICAgICAgICAgICByZXR1cm4gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIERhdGUubm93KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGFydEF1ZGlvKGN1cnJlbnRUaW1lLCBmcm9tQ2FjaGUsIG9uc3VjY2Vzcykge1xuICAgICAgICBpZiAoIXRoaXMucmVwbGF5ZXIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWZyb21DYWNoZSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50VGltZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50VGltZSA9IHRoaXMucmVzdGFydDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucGxheWluZyAmJiB0aGlzLnN0b3BBdWRpbygpO1xuICAgICAgICAgICAgdGhpcy5wbGF5aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IHRoaXMucmVwbGF5ZXIuZ2V0RGF0YSgpO1xuICAgICAgICAgICAgdGhpcy5lbmRUaW1lID0gdGhpcy5nZXRMZW5ndGgoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBub3RlO1xuICAgICAgICBsZXQgb2Zmc2V0ID0gMDtcbiAgICAgICAgbGV0IG1lc3NhZ2VzID0gMDtcbiAgICAgICAgY29uc3QgZGF0YSA9IHRoaXMuZGF0YTtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5nZXRDb250ZXh0KCk7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGRhdGEubGVuZ3RoO1xuXG4gICAgICAgIHRoaXMucXVldWVkVGltZSA9IDAuNTtcblxuICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHRoaXMuZXZlbnRRdWV1ZVswXSAmJiB0aGlzLmV2ZW50UXVldWVbMF0uaW50ZXJ2YWwgfHwgMDtcbiAgICAgICAgY29uc3QgZm9mZnNldCA9IGN1cnJlbnRUaW1lIC0gdGhpcy5jdXJyZW50VGltZTtcblxuICAgICAgICBpZiAoTUlESS5hcGkgIT09ICd3ZWJhdWRpbycpIHsgLy8gc2V0IGN1cnJlbnRUaW1lIG9uIGN0eFxuICAgICAgICAgICAgY29uc3Qgbm93ID0gdGhpcy5nZXROb3coKTtcbiAgICAgICAgICAgIHRoaXMuX19ub3cgPSB0aGlzLl9fbm93IHx8IG5vdztcbiAgICAgICAgICAgIGN0eC5jdXJyZW50VGltZSA9IChub3cgLSB0aGlzLl9fbm93KSAvIDEwMDA7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IGN0eC5jdXJyZW50VGltZTtcblxuICAgICAgICBmb3IgKGxldCBuID0gMDsgbiA8IGxlbmd0aCAmJiBtZXNzYWdlcyA8IDEwMDsgbisrKSB7XG4gICAgICAgICAgICBjb25zdCBvYmogPSBkYXRhW25dO1xuICAgICAgICAgICAgaWYgKCh0aGlzLnF1ZXVlZFRpbWUgKz0gb2JqWzFdKSA8PSBjdXJyZW50VGltZSkge1xuICAgICAgICAgICAgICAgIG9mZnNldCA9IHRoaXMucXVldWVkVGltZTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3VycmVudFRpbWUgPSB0aGlzLnF1ZXVlZFRpbWUgLSBvZmZzZXQ7XG5cbiAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gb2JqWzBdLmV2ZW50O1xuICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgIT09ICdjaGFubmVsJykge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBjaGFubmVsSWQgPSBldmVudC5jaGFubmVsO1xuICAgICAgICAgICAgY29uc3QgY2hhbm5lbCA9IGNoYW5uZWxzW2NoYW5uZWxJZF07XG4gICAgICAgICAgICBjb25zdCBkZWxheSA9IGN0eC5jdXJyZW50VGltZSArICgoY3VycmVudFRpbWUgKyBmb2Zmc2V0ICsgdGhpcy5zdGFydERlbGF5KSAvIDEwMDApO1xuICAgICAgICAgICAgY29uc3QgcXVldWVUaW1lID0gdGhpcy5xdWV1ZWRUaW1lIC0gb2Zmc2V0ICsgdGhpcy5zdGFydERlbGF5O1xuICAgICAgICAgICAgc3dpdGNoIChldmVudC5zdWJ0eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnY29udHJvbGxlcic6XG4gICAgICAgICAgICAgICAgICAgIE1JREkuc2V0Q29udHJvbGxlcihjaGFubmVsSWQsIGV2ZW50LmNvbnRyb2xsZXJUeXBlLCBldmVudC52YWx1ZSwgZGVsYXkpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdwcm9ncmFtQ2hhbmdlJzpcbiAgICAgICAgICAgICAgICAgICAgTUlESS5wcm9ncmFtQ2hhbmdlKGNoYW5uZWxJZCwgZXZlbnQucHJvZ3JhbU51bWJlciwgZGVsYXkpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdwaXRjaEJlbmQnOlxuICAgICAgICAgICAgICAgICAgICBNSURJLnBpdGNoQmVuZChjaGFubmVsSWQsIGV2ZW50LnZhbHVlLCBkZWxheSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ25vdGVPbic6XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGFubmVsLm11dGUpIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBub3RlID0gZXZlbnQubm90ZU51bWJlciAtICh0aGlzLk1JRElPZmZzZXQgfHwgMCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRRdWV1ZS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50OiBldmVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6IHF1ZXVlVGltZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogTUlESS5ub3RlT24oY2hhbm5lbElkLCBldmVudC5ub3RlTnVtYmVyLCBldmVudC52ZWxvY2l0eSwgZGVsYXkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWw6IHRoaXMuc2NoZWR1bGVUcmFja2luZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFubmVsSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnF1ZXVlZFRpbWUgKyB0aGlzLnN0YXJ0RGVsYXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0IC0gZm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAxNDQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQudmVsb2NpdHkpXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlcysrO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdub3RlT2ZmJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoYW5uZWwubXV0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbm90ZSA9IGV2ZW50Lm5vdGVOdW1iZXIgLSAodGhpcy5NSURJT2Zmc2V0IHx8IDApO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmV2ZW50UXVldWUucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudDogZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lOiBxdWV1ZVRpbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IE1JREkubm90ZU9mZihjaGFubmVsSWQsIGV2ZW50Lm5vdGVOdW1iZXIsIGRlbGF5KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVydmFsOiB0aGlzLnNjaGVkdWxlVHJhY2tpbmcoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbm5lbElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5xdWV1ZWRUaW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldCAtIGZvZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgMTI4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDApXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL1xuICAgICAgICBvbnN1Y2Nlc3MgJiYgb25zdWNjZXNzKHRoaXMuZXZlbnRRdWV1ZSk7XG4gICAgfVxuICAgIHN0b3BBdWRpbygpIHtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5nZXRDb250ZXh0KCk7XG4gICAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnJlc3RhcnQgKz0gKGN0eC5jdXJyZW50VGltZSAtIHRoaXMuc3RhcnRUaW1lKSAqIDEwMDA7XG5cbiAgICAgICAgLy8gc3RvcCB0aGUgYXVkaW8sIGFuZCBpbnRlcnZhbHNcbiAgICAgICAgd2hpbGUgKHRoaXMuZXZlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnN0IG8gPSB0aGlzLmV2ZW50UXVldWUucG9wKCk7XG4gICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChvLmludGVydmFsKTtcbiAgICAgICAgICAgIGlmICghby5zb3VyY2UpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTsgLy8gaXMgbm90IHdlYmF1ZGlvXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mKG8uc291cmNlKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KG8uc291cmNlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7IC8vIHdlYmF1ZGlvXG4gICAgICAgICAgICAgICAgby5zb3VyY2UuZGlzY29ubmVjdCgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJ1biBjYWxsYmFjayB0byBjYW5jZWwgYW55IG5vdGVzIHN0aWxsIHBsYXlpbmdcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHRoaXMubm90ZVJlZ2lzdHJhcikge1xuICAgICAgICAgICAgY29uc3QgbyA9IHRoaXMubm90ZVJlZ2lzdHJhcltrZXldXG4gICAgICAgICAgICBpZiAodGhpcy5ub3RlUmVnaXN0cmFyW2tleV0ubWVzc2FnZSA9PT0gMTQ0ICYmIHRoaXMub25NaWRpRXZlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uTWlkaUV2ZW50KHtcbiAgICAgICAgICAgICAgICAgICAgY2hhbm5lbDogby5jaGFubmVsLFxuICAgICAgICAgICAgICAgICAgICBub3RlOiBvLm5vdGUsXG4gICAgICAgICAgICAgICAgICAgIG5vdzogby5ub3csXG4gICAgICAgICAgICAgICAgICAgIGVuZDogby5lbmQsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IDEyOCxcbiAgICAgICAgICAgICAgICAgICAgdmVsb2NpdHk6IG8udmVsb2NpdHlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJlc2V0IG5vdGVSZWdpc3RyYXJcbiAgICAgICAgdGhpcy5ub3RlUmVnaXN0cmFyID0ge307XG4gICAgfVxufVxuIiwiLypcblx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRBdWRpb1RhZyA8YXVkaW8+IC0gT0dHIG9yIE1QRUcgU291bmRiYW5rXG5cdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0aHR0cDovL2Rldi53My5vcmcvaHRtbDUvc3BlYy9PdmVydmlldy5odG1sI3RoZS1hdWRpby1lbGVtZW50XG5cdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiovXG5pbXBvcnQgeyBERUJVRyB9IGZyb20gJy4vZGVidWcuanMnO1xuaW1wb3J0IHsgY2hhbm5lbHMsIEdNLCBrZXlUb05vdGUsIG5vdGVUb0tleSB9IGZyb20gJy4vZ20uanMnO1xuXG4vLyBpbmZvcm1hdGlvbiB0byBzaGFyZSB3aXRoIGxvYWRlci4uLlxuZXhwb3J0IGNvbnN0IHNoYXJlZF9yb290X2luZm8gPSB7fTtcblxuY29uc3Qgdm9sdW1lcyA9IFtdOyAvLyBmbG9hdGluZyBwb2ludFxuZm9yIChsZXQgdmlkID0gMDsgdmlkIDwgMTY7IHZpZCArKykge1xuXHR2b2x1bWVzW3ZpZF0gPSAxMjc7XG59XG5cblxubGV0IGJ1ZmZlcl9uaWQgPSAtMTsgLy8gY3VycmVudCBjaGFubmVsXG5jb25zdCBub3Rlc09uID0gW107IC8vIGluc3RydW1lbnRJZCArIG5vdGVJZCB0aGF0IGlzIGN1cnJlbnRseSBwbGF5aW5nIGluIGVhY2ggJ2NoYW5uZWwnLCBmb3Igcm91dGluZyBub3RlT2ZmL2Nob3JkT2ZmIGNhbGxzXG5jb25zdCBub3RlcyA9IHt9OyAvLyB0aGUgcGlhbm8ga2V5c1xuXG5jb25zdCBhdWRpb0J1ZmZlcnMgPSBbXTsgLy8gdGhlIGF1ZGlvIGNoYW5uZWxzXG5mb3IgKGxldCBuaWQgPSAwOyBuaWQgPCAxMjsgbmlkICsrKSB7XG5cdGF1ZGlvQnVmZmVyc1tuaWRdID0gbmV3IEF1ZGlvKCk7XG59XG5cbmV4cG9ydCBjb25zdCBwbGF5Q2hhbm5lbCA9IChjaGFubmVsLCBpbl9ub3RlKSA9PiB7XG5cdGlmICghY2hhbm5lbHNbY2hhbm5lbF0pIHtcblx0XHRyZXR1cm47XG5cdH1cblx0Y29uc3QgaW5zdHJ1bWVudCA9IGNoYW5uZWxzW2NoYW5uZWxdLnByb2dyYW07XG5cdGNvbnN0IGluc3RydW1lbnRJZCA9IEdNLmJ5SWRbaW5zdHJ1bWVudF0uaWQ7XG5cdGNvbnN0IG5vdGUgPSBub3Rlc1tpbl9ub3RlXTtcblx0aWYgKG5vdGUpIHtcblx0XHRjb25zdCBpbnN0cnVtZW50Tm90ZUlkID0gaW5zdHJ1bWVudElkICsgJycgKyBub3RlLmlkO1xuXHRcdGNvbnN0IG5pZCA9IChidWZmZXJfbmlkICsgMSkgJSBhdWRpb0J1ZmZlcnMubGVuZ3RoO1xuXHRcdGNvbnN0IGF1ZGlvID0gYXVkaW9CdWZmZXJzW25pZF07XG5cdFx0bm90ZXNPbltuaWRdID0gaW5zdHJ1bWVudE5vdGVJZDtcblx0XHRpZiAoIXNoYXJlZF9yb290X2luZm8uU291bmRmb250W2luc3RydW1lbnRJZF0pIHtcblx0XHRcdGlmIChERUJVRykge1xuXHRcdFx0XHRjb25zb2xlLmxvZygnNDA0JywgaW5zdHJ1bWVudElkKTtcblx0XHRcdH1cblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0YXVkaW8uc3JjID0gc2hhcmVkX3Jvb3RfaW5mby5Tb3VuZGZvbnRbaW5zdHJ1bWVudElkXVtub3RlLmlkXTtcblx0XHRhdWRpby52b2x1bWUgPSB2b2x1bWVzW2NoYW5uZWxdIC8gMTI3O1xuXHRcdGF1ZGlvLnBsYXkoKTtcblx0XHRidWZmZXJfbmlkID0gbmlkO1xuXHR9XG59O1xuXG5leHBvcnQgY29uc3Qgc3RvcENoYW5uZWwgPSAoY2hhbm5lbCwgaW5fbm90ZSkgPT4ge1xuXHRpZiAoIWNoYW5uZWxzW2NoYW5uZWxdKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdGNvbnN0IGluc3RydW1lbnQgPSBjaGFubmVsc1tjaGFubmVsXS5wcm9ncmFtO1xuXHRjb25zdCBpbnN0cnVtZW50SWQgPSBHTS5ieUlkW2luc3RydW1lbnRdLmlkO1xuXHRjb25zdCBub3RlID0gbm90ZXNbaW5fbm90ZV07XG5cdGlmIChub3RlKSB7XG5cdFx0Y29uc3QgaW5zdHJ1bWVudE5vdGVJZCA9IGluc3RydW1lbnRJZCArICcnICsgbm90ZS5pZDtcblx0XHRmb3IgKGxldCBpID0gMCwgbGVuID0gYXVkaW9CdWZmZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHRjb25zdCBuaWQgPSAoaSArIGJ1ZmZlcl9uaWQgKyAxKSAlIGxlbjtcblx0XHRcdGNvbnN0IGNJZCA9IG5vdGVzT25bbmlkXTtcblx0XHRcdGlmIChjSWQgJiYgY0lkID09PSBpbnN0cnVtZW50Tm90ZUlkKSB7XG5cdFx0XHRcdGF1ZGlvQnVmZmVyc1tuaWRdLnBhdXNlKCk7XG5cdFx0XHRcdG5vdGVzT25bbmlkXSA9IG51bGw7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG5cbi8vIG1pZGkuYXVkaW9CdWZmZXJzID0gYXVkaW9CdWZmZXJzO1xuZXhwb3J0IGNvbnN0IHNlbmQgPSAoZGF0YSwgZGVsYXkpID0+IHsgfTtcbmV4cG9ydCBjb25zdCBzZXRDb250cm9sbGVyID0gKGNoYW5uZWwsIHR5cGUsIHZhbHVlLCBkZWxheSkgPT4geyB9O1xuZXhwb3J0IGNvbnN0IHNldFZvbHVtZSA9IChjaGFubmVsLCBuKSA9PiB7XG5cdHZvbHVtZXNbY2hhbm5lbF0gPSBuO1xufTtcblxuZXhwb3J0IGNvbnN0IHByb2dyYW1DaGFuZ2UgPSAoY2hhbm5lbCwgcHJvZ3JhbSkgPT4ge1xuXHRjaGFubmVsc1tjaGFubmVsXS5pbnN0cnVtZW50ID0gcHJvZ3JhbTtcbn07XG5cbmV4cG9ydCBjb25zdCBwaXRjaEJlbmQgPSAoY2hhbm5lbCwgcHJvZ3JhbSwgZGVsYXkpID0+IHsgfTtcblxuZXhwb3J0IGNvbnN0IG5vdGVPbiA9IChjaGFubmVsLCBub3RlLCB2ZWxvY2l0eSwgZGVsYXkpID0+IHtcblx0Y29uc3QgaWQgPSBub3RlVG9LZXlbbm90ZV07XG5cdGlmICghbm90ZXNbaWRdKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdGlmIChkZWxheSkge1xuXHRcdHJldHVybiBzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdHZvbHVtZXNbY2hhbm5lbF0gPSB2ZWxvY2l0eTtcblx0XHRcdHBsYXlDaGFubmVsKGNoYW5uZWwsIGlkKTtcblx0XHR9LCBkZWxheSAqIDEwMDApO1xuXHR9IGVsc2Uge1xuXHRcdHZvbHVtZXNbY2hhbm5lbF0gPSB2ZWxvY2l0eTtcblx0XHRwbGF5Q2hhbm5lbChjaGFubmVsLCBpZCk7XG5cdH1cbn07XG5cbmV4cG9ydCBjb25zdCBub3RlT2ZmID0gKGNoYW5uZWwsIG5vdGUsIGRlbGF5KSA9PiB7XG5cdC8vIE1TQzogQ29tbWVudGVkIG91dCBpbiBNdWRDdWJlIHZlcnNpb24uLi5cblx0Ly8gICAgICBJIHNlZSB3aHkhICBjbGlwcyBhbGwgdGhlIG5vdGVzIVxuXG5cdC8vIGNvbnN0IGlkID0gbm90ZVRvS2V5W25vdGVdO1xuXHQvLyBpZiAoIW5vdGVzW2lkXSkge1xuXHQvLyBcdHJldHVybjtcblx0Ly8gfVxuXHQvLyBpZiAoZGVsYXkpIHtcblx0Ly8gXHRyZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0Ly8gXHRcdHN0b3BDaGFubmVsKGNoYW5uZWwsIGlkKTtcblx0Ly8gXHR9LCBkZWxheSAqIDEwMDApXG5cdC8vIH0gZWxzZSB7XG5cdC8vIFx0c3RvcENoYW5uZWwoY2hhbm5lbCwgaWQpO1xuXHQvLyB9XG59O1xuXG5leHBvcnQgY29uc3QgY2hvcmRPbiA9IChjaGFubmVsLCBjaG9yZCwgdmVsb2NpdHksIGRlbGF5KSA9PiB7XG5cdGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IGNob3JkLmxlbmd0aDsgaWR4ICsrKSB7XG5cdFx0Y29uc3QgbiA9IGNob3JkW2lkeF07XG5cdFx0Y29uc3QgaWQgPSBub3RlVG9LZXlbbl07XG5cdFx0aWYgKCFub3Rlc1tpZF0pIHtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblx0XHRpZiAoZGVsYXkpIHtcblx0XHRcdHJldHVybiBzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0cGxheUNoYW5uZWwoY2hhbm5lbCwgaWQpO1xuXHRcdFx0fSwgZGVsYXkgKiAxMDAwKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cGxheUNoYW5uZWwoY2hhbm5lbCwgaWQpO1xuXHRcdH1cblx0fVxufTtcblxuZXhwb3J0IGNvbnN0IGNob3JkT2ZmID0gKGNoYW5uZWwsIGNob3JkLCBkZWxheSkgPT4ge1xuXHRmb3IgKGxldCBpZHggPSAwOyBpZHggPCBjaG9yZC5sZW5ndGg7IGlkeCArKykge1xuXHRcdGNvbnN0IG4gPSBjaG9yZFtpZHhdO1xuXHRcdGNvbnN0IGlkID0gbm90ZVRvS2V5W25dO1xuXHRcdGlmICghbm90ZXNbaWRdKSB7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cdFx0aWYgKGRlbGF5KSB7XG5cdFx0XHRyZXR1cm4gc2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdHN0b3BDaGFubmVsKGNoYW5uZWwsIGlkKTtcblx0XHRcdH0sIGRlbGF5ICogMTAwMCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHN0b3BDaGFubmVsKGNoYW5uZWwsIGlkKTtcblx0XHR9XG5cdH1cbn07XG5cbmV4cG9ydCBjb25zdCBzdG9wQWxsTm90ZXMgPSAoKSA9PiB7XG5cdGZvciAobGV0IG5pZCA9IDAsIGxlbmd0aCA9IGF1ZGlvQnVmZmVycy5sZW5ndGg7IG5pZCA8IGxlbmd0aDsgbmlkKyspIHtcblx0XHRhdWRpb0J1ZmZlcnNbbmlkXS5wYXVzZSgpO1xuXHR9XG59O1xuXG5leHBvcnQgY29uc3QgY29ubmVjdCA9IG9wdHMgPT4ge1xuXHRmb3IgKGNvbnN0IGtleSBpbiBrZXlUb05vdGUpIHtcblx0XHRub3Rlc1trZXldID0ge2lkOiBrZXl9O1xuXHR9XG5cdC8vXG5cdG9wdHMub25zdWNjZXNzICYmIG9wdHMub25zdWNjZXNzKCk7XG59O1xuIiwiLypcblx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRXZWIgQXVkaW8gQVBJIC0gT0dHIG9yIE1QRUcgU291bmRiYW5rXG5cdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0aHR0cDovL3dlYmF1ZGlvLmdpdGh1Yi5pby93ZWItYXVkaW8tYXBpL1xuXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4qL1xuaW1wb3J0IHsgREVCVUcgfSBmcm9tICcuL2RlYnVnLmpzJztcbmltcG9ydCB7IGNoYW5uZWxzLCBHTSwga2V5VG9Ob3RlLCBub3RlVG9LZXkgfSBmcm9tICcuL2dtLmpzJztcbmltcG9ydCAqIGFzIEJhc2U2NEJpbmFyeSBmcm9tICcuL3NoaW0vQmFzZTY0YmluYXJ5LmpzJztcbi8vIGluZm9ybWF0aW9uIHRvIHNoYXJlIHdpdGggbG9hZGVyLi4uXG5leHBvcnQgY29uc3Qgc2hhcmVkX3Jvb3RfaW5mbyA9IHt9O1xuXG5jb25zdCBhdWRpb0NvbnRleHQgPSBudWxsOyAvLyBuZXcgQXVkaW9Db250ZXh0KCk7XG5sZXQgdXNlU3RyZWFtaW5nQnVmZmVyID0gZmFsc2U7IC8vICEhYXVkaW9Db250ZXh0LmNyZWF0ZU1lZGlhRWxlbWVudFNvdXJjZTtcbmxldCBjdHg7IC8vIGF1ZGlvIGNvbnRleHRcbmNvbnN0IHNvdXJjZXMgPSB7fTtcbmNvbnN0IGVmZmVjdHMgPSB7fTtcbmxldCBtYXN0ZXJWb2x1bWUgPSAxMjc7XG5jb25zdCBhdWRpb0J1ZmZlcnMgPSB7fTtcblxuZXhwb3J0IGNvbnN0IHNlbmQgPSAoZGF0YSwgZGVsYXkpID0+IHsgfTtcbmV4cG9ydCBjb25zdCBzZXRDb250cm9sbGVyID0gKGNoYW5uZWxJZCwgdHlwZSwgdmFsdWUsIGRlbGF5KSA9PiB7IH07XG5cbmV4cG9ydCBjb25zdCBzZXRWb2x1bWUgPSAoY2hhbm5lbElkLCB2b2x1bWUsIGRlbGF5KSA9PiB7XG4gICAgaWYgKGRlbGF5KSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgbWFzdGVyVm9sdW1lID0gdm9sdW1lO1xuICAgICAgICB9LCBkZWxheSAqIDEwMDApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG1hc3RlclZvbHVtZSA9IHZvbHVtZTtcbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3QgcHJvZ3JhbUNoYW5nZSA9IChjaGFubmVsSWQsIHByb2dyYW0sIGRlbGF5KSA9PiB7XG4gICAgLy8gZGVsYXkgaXMgaWdub3JlZFxuICAgIGNvbnN0IGNoYW5uZWwgPSBjaGFubmVsc1tjaGFubmVsSWRdO1xuICAgIGlmIChjaGFubmVsKSB7XG4gICAgICAgIGNoYW5uZWwucHJvZ3JhbSA9IHByb2dyYW07XG4gICAgfVxufTtcblxuZXhwb3J0IGNvbnN0IHBpdGNoQmVuZCA9IGZ1bmN0aW9uKGNoYW5uZWxJZCwgYmVuZCwgZGVsYXkpIHtcbiAgICAvLyBkZWxheSBpcyBpZ25vcmVkXG4gICAgY29uc3QgY2hhbm5lbCA9IGNoYW5uZWxzW2NoYW5uZWxJZF07XG4gICAgaWYgKGNoYW5uZWwpIHtcbiAgICAgICAgaWYgKGRlbGF5KSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IGNoYW5uZWwucGl0Y2hCZW5kID0gYmVuZCxcbiAgICAgICAgICAgICAgICBkZWxheSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjaGFubmVsLnBpdGNoQmVuZCA9IGJlbmQ7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3Qgbm90ZU9uID0gKGNoYW5uZWxJZCwgbm90ZUlkLCB2ZWxvY2l0eSwgZGVsYXkpID0+IHtcbiAgICBkZWxheSA9IGRlbGF5IHx8IDA7XG5cbiAgICAvLyBjaGVjayB3aGV0aGVyIHRoZSBub3RlIGV4aXN0c1xuICAgIGNvbnN0IGNoYW5uZWwgPSBjaGFubmVsc1tjaGFubmVsSWRdO1xuICAgIGNvbnN0IHByb2dyYW0gPSBjaGFubmVsLnByb2dyYW07XG4gICAgY29uc3QgYnVmZmVySWQgPSBwcm9ncmFtICsgJ3gnICsgbm90ZUlkO1xuICAgIGNvbnN0IGJ1ZmZlciA9IGF1ZGlvQnVmZmVyc1tidWZmZXJJZF07XG4gICAgaWYgKCFidWZmZXIpIHtcbiAgICAgICAgaWYgKERFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnbm8gYnVmZmVyJywgR00uYnlJZFtwcm9ncmFtXS5pZCwgcHJvZ3JhbSwgY2hhbm5lbElkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gY29udmVydCByZWxhdGl2ZSBkZWxheSB0byBhYnNvbHV0ZSBkZWxheVxuICAgIGlmIChkZWxheSA8IGN0eC5jdXJyZW50VGltZSkge1xuICAgICAgICBkZWxheSArPSBjdHguY3VycmVudFRpbWU7XG4gICAgfVxuXG4gICAgLy8gY3JlYXRlIGF1ZGlvIGJ1ZmZlclxuICAgIGxldCBzb3VyY2U7XG4gICAgaWYgKHVzZVN0cmVhbWluZ0J1ZmZlcikge1xuICAgICAgICBzb3VyY2UgPSBjdHguY3JlYXRlTWVkaWFFbGVtZW50U291cmNlKGJ1ZmZlcik7XG4gICAgfSBlbHNlIHsgLy8gWE1MSFRUUCBidWZmZXJcbiAgICAgICAgc291cmNlID0gY3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgICBzb3VyY2UuYnVmZmVyID0gYnVmZmVyO1xuICAgIH1cblxuICAgIC8vIGFkZCBlZmZlY3RzIHRvIGJ1ZmZlclxuICAgIGlmIChlZmZlY3RzKSB7XG4gICAgICAgIGxldCBjaGFpbiA9IHNvdXJjZTtcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGVmZmVjdHMpIHtcbiAgICAgICAgICAgIGNoYWluLmNvbm5lY3QoZWZmZWN0c1trZXldLmlucHV0KTtcbiAgICAgICAgICAgIGNoYWluID0gZWZmZWN0c1trZXldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gYWRkIGdhaW4gKyBwaXRjaFNoaWZ0XG4gICAgY29uc3QgZ2FpbiA9ICh2ZWxvY2l0eSAvIDEyNykgKiAobWFzdGVyVm9sdW1lIC8gMTI3KSAqIDIgLSAxO1xuICAgIHNvdXJjZS5jb25uZWN0KGN0eC5kZXN0aW5hdGlvbik7XG4gICAgc291cmNlLnBsYXliYWNrUmF0ZS52YWx1ZSA9IDE7IC8vIHBpdGNoIHNoaWZ0XG4gICAgc291cmNlLmdhaW5Ob2RlID0gY3R4LmNyZWF0ZUdhaW4oKTsgLy8gZ2FpblxuICAgIHNvdXJjZS5nYWluTm9kZS5jb25uZWN0KGN0eC5kZXN0aW5hdGlvbik7XG4gICAgc291cmNlLmdhaW5Ob2RlLmdhaW4udmFsdWUgPSBNYXRoLm1pbigxLjAsIE1hdGgubWF4KC0xLjAsIGdhaW4pKTtcbiAgICBzb3VyY2UuY29ubmVjdChzb3VyY2UuZ2Fpbk5vZGUpO1xuXG4gICAgaWYgKHVzZVN0cmVhbWluZ0J1ZmZlcikge1xuICAgICAgICBpZiAoZGVsYXkpIHtcbiAgICAgICAgICAgIHJldHVybiBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBidWZmZXIuY3VycmVudFRpbWUgPSAwO1xuICAgICAgICAgICAgICAgIGJ1ZmZlci5wbGF5KClcbiAgICAgICAgICAgIH0sIGRlbGF5ICogMTAwMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBidWZmZXIuY3VycmVudFRpbWUgPSAwO1xuICAgICAgICAgICAgYnVmZmVyLnBsYXkoKVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc291cmNlLnN0YXJ0KGRlbGF5IHx8IDApO1xuICAgIH1cblxuICAgIHNvdXJjZXNbY2hhbm5lbElkICsgJ3gnICsgbm90ZUlkXSA9IHNvdXJjZTtcblxuICAgIHJldHVybiBzb3VyY2U7XG59O1xuXG5leHBvcnQgY29uc3Qgbm90ZU9mZiA9IChjaGFubmVsSWQsIG5vdGVJZCwgZGVsYXkpID0+IHtcbiAgICBkZWxheSA9IGRlbGF5IHx8IDA7XG5cbiAgICAvLyBjaGVjayB3aGV0aGVyIHRoZSBub3RlIGV4aXN0c1xuICAgIGNvbnN0IGNoYW5uZWwgPSBjaGFubmVsc1tjaGFubmVsSWRdO1xuICAgIGNvbnN0IHByb2dyYW0gPSBjaGFubmVsLnByb2dyYW07XG4gICAgY29uc3QgYnVmZmVySWQgPSBwcm9ncmFtICsgJ3gnICsgbm90ZUlkO1xuICAgIGNvbnN0IGJ1ZmZlciA9IGF1ZGlvQnVmZmVyc1tidWZmZXJJZF07XG4gICAgaWYgKGJ1ZmZlcikge1xuICAgICAgICBpZiAoZGVsYXkgPCBjdHguY3VycmVudFRpbWUpIHtcbiAgICAgICAgICAgIGRlbGF5ICs9IGN0eC5jdXJyZW50VGltZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzb3VyY2UgPSBzb3VyY2VzW2NoYW5uZWxJZCArICd4JyArIG5vdGVJZF07XG4gICAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgICAgIGlmIChzb3VyY2UuZ2Fpbk5vZGUpIHtcbiAgICAgICAgICAgICAgICAvLyBATWlyYW5ldDogJ3RoZSB2YWx1ZXMgb2YgMC4yIGFuZCAwLjMgY291bGQgb2YgY291cnNlIGJlIHVzZWQgYXNcbiAgICAgICAgICAgICAgICAvLyBhICdyZWxlYXNlJyBwYXJhbWV0ZXIgZm9yIEFEU1IgbGlrZSB0aW1lIHNldHRpbmdzLidcbiAgICAgICAgICAgICAgICAvLyBhZGQgeyAnbWV0YWRhdGEnOiB7IHJlbGVhc2U6IDAuMyB9IH0gdG8gc291bmRmb250IGZpbGVzXG4gICAgICAgICAgICAgICAgY29uc3QgZ2FpbiA9IHNvdXJjZS5nYWluTm9kZS5nYWluO1xuICAgICAgICAgICAgICAgIGdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoZ2Fpbi52YWx1ZSwgZGVsYXkpO1xuICAgICAgICAgICAgICAgIGdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoLTEuMCwgZGVsYXkgKyAwLjMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHVzZVN0cmVhbWluZ0J1ZmZlcikge1xuICAgICAgICAgICAgICAgIGlmIChkZWxheSkge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlci5wYXVzZSgpO1xuICAgICAgICAgICAgICAgICAgICB9LCBkZWxheSAqIDEwMDApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlci5wYXVzZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHNvdXJjZS5ub3RlT2ZmKSB7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZS5ub3RlT2ZmKGRlbGF5ICsgMC41KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzb3VyY2Uuc3RvcChkZWxheSArIDAuNSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkZWxldGUgc291cmNlc1tjaGFubmVsSWQgKyAneCcgKyBub3RlSWRdO1xuICAgICAgICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBjaG9yZE9uID0gKGNoYW5uZWwsIGNob3JkLCB2ZWxvY2l0eSwgZGVsYXkpID0+IHtcbiAgICBjb25zdCByZXMgPSB7fTtcbiAgICBmb3IgKGNvbnN0IG5vdGUgb2YgY2hvcmQpIHtcbiAgICAgICAgcmVzW25vdGVdID0gbm90ZU9uKGNoYW5uZWwsIG5vdGUsIHZlbG9jaXR5LCBkZWxheSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59O1xuXG5leHBvcnQgY29uc3QgY2hvcmRPZmYgPSAoY2hhbm5lbCwgY2hvcmQsIGRlbGF5KSA9PiB7XG4gICAgY29uc3QgcmVzID0ge307XG4gICAgZm9yIChjb25zdCBub3RlIG9mIGNob3JkKSB7XG4gICAgICAgIHJlc1tub3RlXSA9IG5vdGVPZmYoY2hhbm5lbCwgbm90ZSwgZGVsYXkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufTtcblxuXG5cbmV4cG9ydCBjb25zdCBzdG9wQWxsTm90ZXMgPSAoKSA9PiB7XG4gICAgZm9yIChsZXQgc2lkIGluIHNvdXJjZXMpIHtcbiAgICAgICAgbGV0IGRlbGF5ID0gMDtcbiAgICAgICAgaWYgKGRlbGF5IDwgY3R4LmN1cnJlbnRUaW1lKSB7XG4gICAgICAgICAgICBkZWxheSArPSBjdHguY3VycmVudFRpbWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc291cmNlID0gc291cmNlc1tzaWRdO1xuICAgICAgICBzb3VyY2UuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgxLCBkZWxheSk7XG4gICAgICAgIHNvdXJjZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGRlbGF5ICsgMC4zKTtcbiAgICAgICAgaWYgKHNvdXJjZS5ub3RlT2ZmKSB7IC8vIG9sZCBhcGlcbiAgICAgICAgICAgIHNvdXJjZS5ub3RlT2ZmKGRlbGF5ICsgMC4zKTtcbiAgICAgICAgfSBlbHNlIHsgLy8gbmV3IGFwaVxuICAgICAgICAgICAgc291cmNlLnN0b3AoZGVsYXkgKyAwLjMpO1xuICAgICAgICB9XG4gICAgICAgIGRlbGV0ZSBzb3VyY2VzW3NpZF07XG4gICAgfVxufTtcblxuZXhwb3J0IGNvbnN0IHNldEVmZmVjdHMgPSBsaXN0ID0+IHtcbiAgICBpZiAoY3R4ICYmIGN0eC50dW5hanMpIHtcbiAgICAgICAgZm9yIChjb25zdCBkYXRhIG9mIGxpc3QpIHtcbiAgICAgICAgICAgIGNvbnN0IGVmZmVjdCA9IG5ldyBjdHgudHVuYWpzW2RhdGEudHlwZV0oZGF0YSk7XG4gICAgICAgICAgICBlZmZlY3QuY29ubmVjdChjdHguZGVzdGluYXRpb24pO1xuICAgICAgICAgICAgZWZmZWN0c1tkYXRhLnR5cGVdID0gZWZmZWN0O1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKCdFZmZlY3RzIG1vZHVsZSBub3QgaW5zdGFsbGVkLicpO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBjb25uZWN0ID0gb3B0cyA9PiB7XG4gICAgc2V0Q29udGV4dChjdHggfHwgY3JlYXRlQXVkaW9Db250ZXh0KCksIG9wdHMub25zdWNjZXNzKTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRDb250ZXh0ID0gKCkgPT4ge1xuICAgIHJldHVybiBjdHg7XG59O1xuXG5leHBvcnQgY29uc3Qgc2V0Q29udGV4dCA9IChuZXdDdHgsIG9uc3VjY2Vzcywgb25wcm9ncmVzcywgb25lcnJvcikgPT4ge1xuICAgIGN0eCA9IG5ld0N0eDtcblxuICAgIC8vIHR1bmEuanMgZWZmZWN0cyBtb2R1bGUgLSBodHRwczovL2dpdGh1Yi5jb20vRGluYWhtb2UvdHVuYVxuICAgIGlmICh0eXBlb2YgVHVuYSAhPT0gJ3VuZGVmaW5lZCcgJiYgIShjdHgudHVuYWpzIGluc3RhbmNlb2YgVHVuYSkpIHtcbiAgICAgICAgY3R4LnR1bmFqcyA9IG5ldyBUdW5hKGN0eCk7XG4gICAgfVxuXG4gICAgLy8gbG9hZGluZyBhdWRpbyBmaWxlc1xuICAgIGNvbnN0IHVybHMgPSBbXTtcbiAgICBmb3IgKGxldCBrZXkgaW4ga2V5VG9Ob3RlKSB7XG4gICAgICAgIHVybHMucHVzaChrZXkpO1xuICAgIH1cblxuICAgIGNvbnN0IHdhaXRGb3JFbmQgPSBpbnN0cnVtZW50ID0+IHtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoYnVmZmVyUGVuZGluZykpIHsgLy8gaGFzIHBlbmRpbmcgaXRlbXNcbiAgICAgICAgICAgIGlmIChidWZmZXJQZW5kaW5nW2tleV0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob25zdWNjZXNzKSB7IC8vIHJ1biBvbnN1Y2Nlc3Mgb25jZVxuICAgICAgICAgICAgb25zdWNjZXNzKCk7XG4gICAgICAgICAgICBvbnN1Y2Nlc3MgPSBudWxsO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IHJlcXVlc3RBdWRpbyA9IChzb3VuZGZvbnQsIHByb2dyYW1JZCwgaW5kZXgsIGtleSkgPT4ge1xuICAgICAgICBjb25zdCB1cmwgPSBzb3VuZGZvbnRba2V5XTtcbiAgICAgICAgaWYgKHVybCkge1xuICAgICAgICAgICAgYnVmZmVyUGVuZGluZ1twcm9ncmFtSWRdICsrO1xuICAgICAgICAgICAgbG9hZEF1ZGlvKHVybCwgYnVmZmVyID0+IHtcbiAgICAgICAgICAgICAgICBidWZmZXIuaWQgPSBrZXk7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm90ZUlkID0ga2V5VG9Ob3RlW2tleV07XG4gICAgICAgICAgICAgICAgYXVkaW9CdWZmZXJzW3Byb2dyYW1JZCArICd4JyArIG5vdGVJZF0gPSBidWZmZXI7XG5cbiAgICAgICAgICAgICAgICBpZiAoLS1idWZmZXJQZW5kaW5nW3Byb2dyYW1JZF0gPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGVyY2VudCA9IGluZGV4IC8gODc7XG4gICAgICAgICAgICAgICAgICAgIGlmIChERUJVRykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coR00uYnlJZFtwcm9ncmFtSWRdLCAncHJvY2Vzc2luZzogJywgcGVyY2VudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc291bmRmb250LmlzTG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgd2FpdEZvckVuZChwcm9ncmFtSWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIGVyciA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IGJ1ZmZlclBlbmRpbmcgPSB7fTtcbiAgICBmb3IgKGNvbnN0IFtpbnN0cnVtZW50LCBzb3VuZGZvbnRdIG9mIE9iamVjdC5lbnRyaWVzKHNoYXJlZF9yb290X2luZm8uU291bmRmb250KSkge1xuICAgICAgICBpZiAoc291bmRmb250LmlzTG9hZGVkKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNwZWMgPSBHTS5ieU5hbWVbaW5zdHJ1bWVudF07XG4gICAgICAgIGlmIChzcGVjKSB7XG4gICAgICAgICAgICBjb25zdCBwcm9ncmFtSWQgPSBzcGVjLnByb2dyYW07XG5cbiAgICAgICAgICAgIGJ1ZmZlclBlbmRpbmdbcHJvZ3JhbUlkXSA9IDA7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB1cmxzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IHVybHNbaW5kZXhdO1xuICAgICAgICAgICAgICAgIHJlcXVlc3RBdWRpbyhzb3VuZGZvbnQsIHByb2dyYW1JZCwgaW5kZXgsIGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgc2V0VGltZW91dCh3YWl0Rm9yRW5kLCAxKTtcbn07XG5cbi8qIExvYWQgYXVkaW8gZmlsZTogc3RyZWFtaW5nIHwgYmFzZTY0IHwgYXJyYXlidWZmZXJcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cbmV4cG9ydCBjb25zdCBsb2FkQXVkaW8gPSAodXJsLCBvbnN1Y2Nlc3MsIG9uZXJyb3IpID0+IHtcbiAgICBpZiAodXNlU3RyZWFtaW5nQnVmZmVyKSB7XG4gICAgICAgIGNvbnN0IGF1ZGlvID0gbmV3IEF1ZGlvKCk7XG4gICAgICAgIGF1ZGlvLnNyYyA9IHVybDtcbiAgICAgICAgYXVkaW8uY29udHJvbHMgPSBmYWxzZTtcbiAgICAgICAgYXVkaW8uYXV0b3BsYXkgPSBmYWxzZTtcbiAgICAgICAgYXVkaW8ucHJlbG9hZCA9IGZhbHNlO1xuICAgICAgICBhdWRpby5hZGRFdmVudExpc3RlbmVyKCdjYW5wbGF5JywgKCkgPT4ge1xuICAgICAgICAgICAgb25zdWNjZXNzICYmIG9uc3VjY2VzcyhhdWRpbyk7XG4gICAgICAgIH0pO1xuICAgICAgICBhdWRpby5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGVyciA9PiB7XG4gICAgICAgICAgICBvbmVycm9yICYmIG9uZXJyb3IoZXJyKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXVkaW8pO1xuICAgIH0gZWxzZSBpZiAodXJsLmluZGV4T2YoJ2RhdGE6YXVkaW8nKSA9PT0gMCkgeyAvLyBCYXNlNjQgc3RyaW5nXG4gICAgICAgIGNvbnN0IGJhc2U2NCA9IHVybC5zcGxpdCgnLCcpWzFdO1xuICAgICAgICBjb25zdCBidWZmZXIgPSBCYXNlNjRCaW5hcnkuZGVjb2RlQXJyYXlCdWZmZXIoYmFzZTY0KTtcbiAgICAgICAgcmV0dXJuIGN0eC5kZWNvZGVBdWRpb0RhdGEoYnVmZmVyLCBvbnN1Y2Nlc3MsIG9uZXJyb3IpO1xuICAgIH0gZWxzZSB7ICAvLyBYTUxIVFRQIGJ1ZmZlclxuICAgICAgICBjb25zdCByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgIHJlcXVlc3Qub3BlbignR0VUJywgdXJsLCB0cnVlKTtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuICAgICAgICByZXF1ZXN0Lm9uc3VjY2VzcyA9ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjdHguZGVjb2RlQXVkaW9EYXRhKHJlcXVlc3QucmVzcG9uc2UsIG9uc3VjY2Vzcywgb25lcnJvcik7XG4gICAgICAgIH07XG4gICAgICAgIHJlcXVlc3Quc2VuZCgpO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVBdWRpb0NvbnRleHQgPSAoKSA9PiB7XG4gICAgcmV0dXJuIG5ldyAod2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0KSgpO1xufTtcbiIsIi8qXG5cdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0V2ViIE1JREkgQVBJIC0gTmF0aXZlIFNvdW5kYmFua3Ncblx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRodHRwOi8vd2ViYXVkaW8uZ2l0aHViLmlvL3dlYi1taWRpLWFwaS9cblx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuKi9cblxuLy8gaW5mb3JtYXRpb24gdG8gc2hhcmUgd2l0aCBsb2FkZXIuLi5cbmV4cG9ydCBjb25zdCBzaGFyZWRfcm9vdF9pbmZvID0ge307XG5cblxubGV0IHBsdWdpbiA9IG51bGw7XG5sZXQgb3V0cHV0ID0gbnVsbDtcbmNvbnN0IGNoYW5uZWxzID0gW107XG5cbmV4cG9ydCBjb25zdCBzZW5kID0gKGRhdGEsIGRlbGF5KSA9PiB7IC8vIHNldCBjaGFubmVsIHZvbHVtZVxuXHRvdXRwdXQuc2VuZChkYXRhLCBkZWxheSAqIDEwMDApO1xufTtcblxuZXhwb3J0IGNvbnN0IHNldENvbnRyb2xsZXIgPSAoY2hhbm5lbCwgdHlwZSwgdmFsdWUsIGRlbGF5KSA9PiB7XG5cdG91dHB1dC5zZW5kKFtjaGFubmVsLCB0eXBlLCB2YWx1ZV0sIGRlbGF5ICogMTAwMCk7XG59O1xuXG5leHBvcnQgY29uc3Qgc2V0Vm9sdW1lID0gKGNoYW5uZWwsIHZvbHVtZSwgZGVsYXkpID0+IHsgLy8gc2V0IGNoYW5uZWwgdm9sdW1lXG5cdG91dHB1dC5zZW5kKFsweEIwICsgY2hhbm5lbCwgMHgwNywgdm9sdW1lXSwgZGVsYXkgKiAxMDAwKTtcbn07XG5cbmV4cG9ydCBjb25zdCBwcm9ncmFtQ2hhbmdlID0gKGNoYW5uZWwsIHByb2dyYW0sIGRlbGF5KSA9PiB7IC8vIGNoYW5nZSBwYXRjaCAoaW5zdHJ1bWVudClcblx0b3V0cHV0LnNlbmQoWzB4QzAgKyBjaGFubmVsLCBwcm9ncmFtXSwgZGVsYXkgKiAxMDAwKTtcbn07XG5cbmV4cG9ydCBjb25zdCBwaXRjaEJlbmQgPSAoY2hhbm5lbCwgcHJvZ3JhbSwgZGVsYXkpID0+IHsgLy8gcGl0Y2ggYmVuZFxuXHRvdXRwdXQuc2VuZChbMHhFMCArIGNoYW5uZWwsIHByb2dyYW1dLCBkZWxheSAqIDEwMDApO1xufTtcblxuZXhwb3J0IGNvbnN0IG5vdGVPbiA9IChjaGFubmVsLCBub3RlLCB2ZWxvY2l0eSwgZGVsYXkpID0+IHtcblx0b3V0cHV0LnNlbmQoWzB4OTAgKyBjaGFubmVsLCBub3RlLCB2ZWxvY2l0eV0sIGRlbGF5ICogMTAwMCk7XG59O1xuXG5leHBvcnQgY29uc3Qgbm90ZU9mZiA9IChjaGFubmVsLCBub3RlLCBkZWxheSkgPT4ge1xuXHRvdXRwdXQuc2VuZChbMHg4MCArIGNoYW5uZWwsIG5vdGUsIDBdLCBkZWxheSAqIDEwMDApO1xufTtcblxuZXhwb3J0IGNvbnN0IGNob3JkT24gPSAoY2hhbm5lbCwgY2hvcmQsIHZlbG9jaXR5LCBkZWxheSkgPT4ge1xuXHRmb3IgKGNvbnN0IG5vdGUgb2YgY2hvcmQpIHtcblx0XHRvdXRwdXQuc2VuZChbMHg5MCArIGNoYW5uZWwsIG5vdGUsIHZlbG9jaXR5XSwgZGVsYXkgKiAxMDAwKTtcblx0fVxufTtcblxuZXhwb3J0IGNvbnN0IGNob3JkT2ZmID0gKGNoYW5uZWwsIGNob3JkLCBkZWxheSkgPT4ge1xuXHRmb3IgKGNvbnN0IG5vdGUgb2YgY2hvcmQpIHtcblx0XHRvdXRwdXQuc2VuZChbMHg4MCArIGNoYW5uZWwsIG5vdGUsIDBdLCBkZWxheSAqIDEwMDApO1xuXHR9XG59O1xuXG5leHBvcnQgY29uc3Qgc3RvcEFsbE5vdGVzID0gKCkgPT4ge1xuXHRvdXRwdXQuY2FuY2VsKCk7XG5cdGZvciAobGV0IGNoYW5uZWwgPSAwOyBjaGFubmVsIDwgMTY7IGNoYW5uZWwgKyspIHtcblx0XHRvdXRwdXQuc2VuZChbMHhCMCArIGNoYW5uZWwsIDB4N0IsIDBdKTtcblx0fVxufTtcblxuZXhwb3J0IGNvbnN0IGNvbm5lY3QgPSBvcHRzID0+IHtcblx0Y29uc3QgZXJyRnVuY3Rpb24gPSBlcnIgPT4ge1xuXHRcdGNvbnNvbGUuZXJyb3IoJ0NvdWxkIG5vdCBjb25uZWN0IHRvIHdlYiBtaWRpISBGYWxsaW5nIGJhY2sgdG8gV2ViQXVkaW86JywgZXJyKTtcblx0XHQvLyB3ZSB0cmllZC4gIEFueXRoaW5nIHRoYXQgc29ydCBvZiBzdXBwb3J0cyB3ZWJtaWRpIHNob3VsZCBzdXBwb3J0IFdlYkF1ZGlvLlxuXHRcdGlmIChzaGFyZWRfcm9vdF9pbmZvLndlYmF1ZGlvX2JhY2t1cF9jb25uZWN0KSB7XG5cdFx0XHRzaGFyZWRfcm9vdF9pbmZvLmNvbmZpZy5hcGkgPSAnd2ViYXVkaW8nO1xuXHRcdFx0c2hhcmVkX3Jvb3RfaW5mby53ZWJhdWRpb19iYWNrdXBfY29ubmVjdChvcHRzKTtcblx0XHR9XG5cdH07XG5cdG5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2VzcygpLnRoZW4oYWNjZXNzID0+IHtcblx0XHRjb25zdCBwbHVnaW4gPSBhY2Nlc3M7XG5cdFx0Y29uc3QgcGx1Z2luT3V0cHV0cyA9IHBsdWdpbi5vdXRwdXRzO1xuXHRcdGlmICh0eXBlb2YgcGx1Z2luT3V0cHV0cyA9PSAnZnVuY3Rpb24nKSB7IC8vIENocm9tZSBwcmUtNDNcblx0XHRcdG91dHB1dCA9IHBsdWdpbk91dHB1dHMoKVswXTtcblx0XHR9IGVsc2UgeyAvLyBDaHJvbWUgcG9zdC00M1xuXHRcdFx0b3V0cHV0ID0gcGx1Z2luT3V0cHV0c1swXTtcblx0XHR9XG5cdFx0aWYgKG91dHB1dCA9PT0gdW5kZWZpbmVkKSB7IC8vIG5vdGhpbmcgdGhlcmUuLi5cblx0XHRcdGVyckZ1bmN0aW9uKCdObyBvdXRwdXRzIGRlZmluZWQnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b3B0cy5vbnN1Y2Nlc3MgJiYgb3B0cy5vbnN1Y2Nlc3MoKTtcblx0XHR9XG5cdH0sIGVyckZ1bmN0aW9uKTtcbn07XG4iLCIvKipcbiAqIEBsaWNlbnNlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqICAgbW9kdWxlOiBCYXNlNjRCaW5hcnlcbiAqICAgICAgc3JjOiBodHRwOi8vYmxvZy5kYW5ndWVyLmNvbS8yMDExLzEwLzI0L2Jhc2U2NC1iaW5hcnktZGVjb2RpbmctaW4tamF2YXNjcmlwdC9cbiAqICBsaWNlbnNlOiBTaW1wbGlmaWVkIEJTRCBMaWNlbnNlXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiBDb3B5cmlnaHQgMjAxMSwgRGFuaWVsIEd1ZXJyZXJvLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbiAqIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuICogICAgIC0gUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHRcbiAqICAgICAgIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAgICAtIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0XG4gKiAgICAgICBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlXG4gKiAgICAgICBkb2N1bWVudGF0aW9uIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuICogXG4gKiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbiAqIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG4gKiBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFXG4gKiBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBEQU5JRUwgR1VFUlJFUk8gQkUgTElBQkxFIEZPUiBBTllcbiAqIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXG4gKiAoSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG4gKiBMT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkRcbiAqIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4gKiAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJU1xuICogU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4qL1xuXG4vKipcbiAqIE1vZGlmaWVkIGJ5IE1TQyB0byBiZSBhIG1vZHVsZS5cbiAqIEB0eXBlIHtzdHJpbmd9XG4gKiBAcHJpdmF0ZVxuICovXG5cbmNvbnN0IF9rZXlTdHIgPSBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky89XCI7XG5cbi8qIHdpbGwgcmV0dXJuIGEgIFVpbnQ4QXJyYXkgdHlwZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZUFycmF5QnVmZmVyKGlucHV0KSB7XG5cdGNvbnN0IGJ5dGVzID0gTWF0aC5jZWlsKCgzICogaW5wdXQubGVuZ3RoKSAvIDQuMCk7XG5cdGNvbnN0IGFiID0gbmV3IEFycmF5QnVmZmVyKGJ5dGVzKTtcblx0ZGVjb2RlKGlucHV0LCBhYik7XG5cblx0cmV0dXJuIGFiO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlKGlucHV0LCBhcnJheUJ1ZmZlcikge1xuXHQvL2dldCBsYXN0IGNoYXJzIHRvIHNlZSBpZiBhcmUgdmFsaWRcblx0bGV0IGxrZXkxID0gX2tleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChpbnB1dC5sZW5ndGggLSAxKSk7XG5cdGxldCBsa2V5MiA9IF9rZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaW5wdXQubGVuZ3RoIC0gMSkpO1xuXG5cdGxldCBieXRlcyA9IE1hdGguY2VpbCgoMyAqIGlucHV0Lmxlbmd0aCkgLyA0LjApO1xuXHRpZiAobGtleTEgPT09IDY0KSB7XG5cdFx0Ynl0ZXMtLTtcblx0fSAvL3BhZGRpbmcgY2hhcnMsIHNvIHNraXBcblx0aWYgKGxrZXkyID09PSA2NCkge1xuXHRcdGJ5dGVzLS07XG5cdH0gLy9wYWRkaW5nIGNoYXJzLCBzbyBza2lwXG5cblx0bGV0IHVhcnJheTtcblx0bGV0IGNocjEsIGNocjIsIGNocjM7XG5cdGxldCBlbmMxLCBlbmMyLCBlbmMzLCBlbmM0O1xuXHRsZXQgaiA9IDA7XG5cblx0aWYgKGFycmF5QnVmZmVyKSB7XG5cdFx0dWFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXlCdWZmZXIpO1xuXHR9IGVsc2Uge1xuXHRcdHVhcnJheSA9IG5ldyBVaW50OEFycmF5KGJ5dGVzKTtcblx0fVxuXG5cdGlucHV0ID0gaW5wdXQucmVwbGFjZSgvW15BLVphLXowLTkrXFwvPV0vZywgXCJcIik7XG5cblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBieXRlczsgaSArPSAzKSB7XG5cdFx0Ly8gZ2V0IHRoZSAzIG9jdGV0cyBpbiA0IGFzY2lpIGNoYXJzXG5cdFx0ZW5jMSA9IF9rZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG5cdFx0ZW5jMiA9IF9rZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG5cdFx0ZW5jMyA9IF9rZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG5cdFx0ZW5jNCA9IF9rZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG5cblx0XHRjaHIxID0gKGVuYzEgPDwgMikgfCAoZW5jMiA+PiA0KTtcblx0XHRjaHIyID0gKChlbmMyICYgMTUpIDw8IDQpIHwgKGVuYzMgPj4gMik7XG5cdFx0Y2hyMyA9ICgoZW5jMyAmIDMpIDw8IDYpIHwgZW5jNDtcblxuXHRcdHVhcnJheVtpXSA9IGNocjE7XG5cdFx0aWYgKGVuYzMgIT09IDY0KSB7XG5cdFx0XHR1YXJyYXlbaSsxXSA9IGNocjI7XG5cdFx0fVxuXHRcdGlmIChlbmM0ICE9PSA2NCkge1xuXHRcdFx0dWFycmF5W2krMl0gPSBjaHIzO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB1YXJyYXk7XG59XG4iLCIvKipcbiAqIEBsaWNlbnNlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqICAgbW9kdWxlOiBXZWJBdWRpb1NoaW0gLSBGaXggbmFtaW5nIGlzc3VlcyBmb3IgV2ViQXVkaW9BUEkgc3VwcG9ydHNcbiAqICAgICAgc3JjOiBodHRwczovL2dpdGh1Yi5jb20vRGluYWhtb2Uvd2ViYXVkaW9zaGltXG4gKiAgIGF1dGhvcjogRGluYWhtb2UgQUJcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqIENvcHlyaWdodCAoYykgMjAxMiBEaW5haE1vZSBBQlxuICogXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvblxuICogb2J0YWluaW5nIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb25cbiAqIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dFxuICogcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsXG4gKiBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlXG4gKiBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZ1xuICogY29uZGl0aW9uczpcbiAqIFxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmVcbiAqIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICogXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxuICogRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTXG4gKiBPRiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORFxuICogTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFRcbiAqIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLFxuICogV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HXG4gKiBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SXG4gKiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG4gKi9cblxud2luZG93LkF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dCB8fCBudWxsO1xud2luZG93Lk9mZmxpbmVBdWRpb0NvbnRleHQgPSB3aW5kb3cuT2ZmbGluZUF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0T2ZmbGluZUF1ZGlvQ29udGV4dCB8fCBudWxsO1xuXG4oZnVuY3Rpb24gKENvbnRleHQpIHtcblx0dmFyIGlzRnVuY3Rpb24gPSBmdW5jdGlvbiAoZikge1xuXHRcdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZikgPT09IFwiW29iamVjdCBGdW5jdGlvbl1cIiB8fFxuXHRcdFx0T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGYpID09PSBcIltvYmplY3QgQXVkaW9Db250ZXh0Q29uc3RydWN0b3JdXCI7XG5cdH07XG5cdHZhciBjb250ZXh0TWV0aG9kcyA9IFtcblx0XHRbXCJjcmVhdGVHYWluTm9kZVwiLCBcImNyZWF0ZUdhaW5cIl0sXG5cdFx0W1wiY3JlYXRlRGVsYXlOb2RlXCIsIFwiY3JlYXRlRGVsYXlcIl0sXG5cdFx0W1wiY3JlYXRlSmF2YVNjcmlwdE5vZGVcIiwgXCJjcmVhdGVTY3JpcHRQcm9jZXNzb3JcIl1cblx0XTtcblx0Ly9cblx0dmFyIHByb3RvO1xuXHR2YXIgaW5zdGFuY2U7XG5cdHZhciBzb3VyY2VQcm90bztcblx0Ly9cblx0aWYgKCFpc0Z1bmN0aW9uKENvbnRleHQpKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdGluc3RhbmNlID0gbmV3IENvbnRleHQoKTtcblx0aWYgKCFpbnN0YW5jZS5kZXN0aW5hdGlvbiB8fCAhaW5zdGFuY2Uuc2FtcGxlUmF0ZSkge1xuXHRcdHJldHVybjtcblx0fVxuXHRwcm90byA9IENvbnRleHQucHJvdG90eXBlO1xuXHRzb3VyY2VQcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihpbnN0YW5jZS5jcmVhdGVCdWZmZXJTb3VyY2UoKSk7XG5cblx0aWYgKCFpc0Z1bmN0aW9uKHNvdXJjZVByb3RvLnN0YXJ0KSkge1xuXHRcdGlmIChpc0Z1bmN0aW9uKHNvdXJjZVByb3RvLm5vdGVPbikpIHtcblx0XHRcdHNvdXJjZVByb3RvLnN0YXJ0ID0gZnVuY3Rpb24gKHdoZW4sIG9mZnNldCwgZHVyYXRpb24pIHtcblx0XHRcdFx0c3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0Y2FzZSAwOlxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTm90IGVub3VnaCBhcmd1bWVudHMuXCIpO1xuXHRcdFx0XHRcdGNhc2UgMTpcblx0XHRcdFx0XHRcdHRoaXMubm90ZU9uKHdoZW4pO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRcdFx0aWYgKHRoaXMuYnVmZmVyKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMubm90ZUdyYWluT24od2hlbiwgb2Zmc2V0LCB0aGlzLmJ1ZmZlci5kdXJhdGlvbiAtIG9mZnNldCk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIEF1ZGlvQnVmZmVyXCIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSAzOlxuXHRcdFx0XHRcdFx0dGhpcy5ub3RlR3JhaW5Pbih3aGVuLCBvZmZzZXQsIGR1cmF0aW9uKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9XG5cdH1cblxuXHRpZiAoIWlzRnVuY3Rpb24oc291cmNlUHJvdG8ubm90ZU9uKSkge1xuXHRcdHNvdXJjZVByb3RvLm5vdGVPbiA9IHNvdXJjZVByb3RvLnN0YXJ0O1xuXHR9XG5cblx0aWYgKCFpc0Z1bmN0aW9uKHNvdXJjZVByb3RvLm5vdGVHcmFpbk9uKSkge1xuXHRcdHNvdXJjZVByb3RvLm5vdGVHcmFpbk9uID0gc291cmNlUHJvdG8uc3RhcnQ7XG5cdH1cblxuXHRpZiAoIWlzRnVuY3Rpb24oc291cmNlUHJvdG8uc3RvcCkpIHtcblx0XHRzb3VyY2VQcm90by5zdG9wID0gc291cmNlUHJvdG8ubm90ZU9mZjtcblx0fVxuXG5cdGlmICghaXNGdW5jdGlvbihzb3VyY2VQcm90by5ub3RlT2ZmKSkge1xuXHRcdHNvdXJjZVByb3RvLm5vdGVPZmYgPSBzb3VyY2VQcm90by5zdG9wO1xuXHR9XG5cblx0Y29udGV4dE1ldGhvZHMuZm9yRWFjaChmdW5jdGlvbiAobmFtZXMpIHtcblx0XHR2YXIgbmFtZTE7XG5cdFx0dmFyIG5hbWUyO1xuXHRcdHdoaWxlIChuYW1lcy5sZW5ndGgpIHtcblx0XHRcdG5hbWUxID0gbmFtZXMucG9wKCk7XG5cdFx0XHRpZiAoaXNGdW5jdGlvbih0aGlzW25hbWUxXSkpIHtcblx0XHRcdFx0dGhpc1tuYW1lcy5wb3AoKV0gPSB0aGlzW25hbWUxXTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG5hbWUyID0gbmFtZXMucG9wKCk7XG5cdFx0XHRcdHRoaXNbbmFtZTFdID0gdGhpc1tuYW1lMl07XG5cdFx0XHR9XG5cdFx0fVxuXHR9LCBwcm90byk7XG59KSh3aW5kb3cuQXVkaW9Db250ZXh0KTtcbiIsIi8qXG5cdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0TUlESS5TeW5lc3RoZXNpYSA6IDAuMy4xIDogMjAxMi0wMS0wNlxuXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdFBlYWNvY2s6ICDigJxJbnN0cnVtZW50cyB0byBwZXJmb3JtIGNvbG9yLW11c2ljOiBUd28gY2VudHVyaWVzIG9mIHRlY2hub2xvZ2ljYWwgZXhwZXJpbWVudGF0aW9uLOKAnSBMZW9uYXJkbywgMjEgKDE5ODgpLCAzOTctNDA2LlxuXHRHZXJzdG5lcjogIEthcmwgR2Vyc3RuZXIsIFRoZSBGb3JtcyBvZiBDb2xvciAxOTg2XG5cdEtsZWluOiAgQ29sb3VyLU11c2ljOiBUaGUgYXJ0IG9mIGxpZ2h0LCBMb25kb246IENyb3NieSBMb2Nrd29vZCBhbmQgU29uLCAxOTI3LlxuXHRKYW1lc29uOiAg4oCcVmlzdWFsIG11c2ljIGluIGEgdmlzdWFsIHByb2dyYW1taW5nIGxhbmd1YWdlLOKAnSBJRUVFIFN5bXBvc2l1bSBvbiBWaXN1YWwgTGFuZ3VhZ2VzLCAxOTk5LCAxMTEtMTE4LiBcblx0SGVsbWhvbHR6OiAgVHJlYXRpc2Ugb24gUGh5c2lvbG9naWNhbCBPcHRpY3MsIE5ldyBZb3JrOiBEb3ZlciBCb29rcywgMTk2MiBcblx0Sm9uZXM6ICBUaGUgYXJ0IG9mIGxpZ2h0ICYgY29sb3IsIE5ldyBZb3JrOiBWYW4gTm9zdHJhbmQgUmVpbmhvbGQsIDE5NzJcblx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRSZWZlcmVuY2U6IGh0dHA6Ly9yaHl0aG1pY2xpZ2h0LmNvbS9hcmNoaXZlcy9pZGVhcy9jb2xvcnNjYWxlcy5odG1sXG5cdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiovXG5cbmV4cG9ydCBjb25zdCBkYXRhID0ge1xuXHQnSXNhYWMgTmV3dG9uICgxNzA0KSc6IHtcblx0XHRmb3JtYXQ6ICdIU0wnLFxuXHRcdHJlZjogJ0dlcnN0bmVyLCBwLjE2NycsXG5cdFx0ZW5nbGlzaDogWydyZWQnLG51bGwsJ29yYW5nZScsbnVsbCwneWVsbG93JywnZ3JlZW4nLG51bGwsJ2JsdWUnLG51bGwsJ2luZGlnbycsbnVsbCwndmlvbGV0J10sXG5cdFx0MDogWyAwLCA5NiwgNTEgXSwgLy8gQ1xuXHRcdDE6IFsgMCwgMCwgMCBdLCAvLyBDI1xuXHRcdDI6IFsgMjksIDk0LCA1MiBdLCAvLyBEXG5cdFx0MzogWyAwLCAwLCAwIF0sIC8vIEQjXG5cdFx0NDogWyA2MCwgOTAsIDYwIF0sIC8vIEVcblx0XHQ1OiBbIDEzNSwgNzYsIDMyIF0sIC8vIEZcblx0XHQ2OiBbIDAsIDAsIDAgXSwgLy8gRiNcblx0XHQ3OiBbIDI0OCwgODIsIDI4IF0sIC8vIEdcblx0XHQ4OiBbIDAsIDAsIDAgXSwgLy8gRyNcblx0XHQ5OiBbIDMwMiwgODgsIDI2IF0sIC8vIEFcblx0XHQxMDogWyAwLCAwLCAwIF0sIC8vIEEjXG5cdFx0MTE6IFsgMzI1LCA4NCwgNDYgXSAvLyBCXG5cdH0sXG5cdCdMb3VpcyBCZXJ0cmFuZCBDYXN0ZWwgKDE3MzQpJzoge1xuXHRcdGZvcm1hdDogJ0hTTCcsXG5cdFx0cmVmOiAnUGVhY29jaywgcC40MDAnLFxuXHRcdGVuZ2xpc2g6IFsnYmx1ZScsJ2JsdWUtZ3JlZW4nLCdncmVlbicsJ29saXZlIGdyZWVuJywneWVsbG93JywneWVsbG93LW9yYW5nZScsJ29yYW5nZScsJ3JlZCcsJ2NyaW1zb24nLCd2aW9sZXQnLCdhZ2F0ZScsJ2luZGlnbyddLFxuXHRcdDA6IFsgMjQ4LCA4MiwgMjggXSxcblx0XHQxOiBbIDE3MiwgNjgsIDM0IF0sXG5cdFx0MjogWyAxMzUsIDc2LCAzMiBdLFxuXHRcdDM6IFsgNzksIDU5LCAzNiBdLFxuXHRcdDQ6IFsgNjAsIDkwLCA2MCBdLFxuXHRcdDU6IFsgNDksIDkwLCA2MCBdLFxuXHRcdDY6IFsgMjksIDk0LCA1MiBdLFxuXHRcdDc6IFsgMzYwLCA5NiwgNTEgXSxcblx0XHQ4OiBbIDEsIDg5LCAzMyBdLFxuXHRcdDk6IFsgMzI1LCA4NCwgNDYgXSxcblx0XHQxMDogWyAyNzMsIDgwLCAyNyBdLFxuXHRcdDExOiBbIDMwMiwgODgsIDI2IF1cblx0fSxcblx0J0dlb3JnZSBGaWVsZCAoMTgxNiknOiB7XG5cdFx0Zm9ybWF0OiAnSFNMJyxcblx0XHRyZWY6ICdLbGVpbiwgcC42OScsXG5cdFx0ZW5nbGlzaDogWydibHVlJyxudWxsLCdwdXJwbGUnLG51bGwsJ3JlZCcsJ29yYW5nZScsbnVsbCwneWVsbG93JyxudWxsLCd5ZWxsb3cgZ3JlZW4nLG51bGwsJ2dyZWVuJ10sXG5cdFx0MDogWyAyNDgsIDgyLCAyOCBdLFxuXHRcdDE6IFsgMCwgMCwgMCBdLFxuXHRcdDI6IFsgMzAyLCA4OCwgMjYgXSxcblx0XHQzOiBbIDAsIDAsIDAgXSxcblx0XHQ0OiBbIDM2MCwgOTYsIDUxIF0sXG5cdFx0NTogWyAyOSwgOTQsIDUyIF0sXG5cdFx0NjogWyAwLCAwLCAwIF0sXG5cdFx0NzogWyA2MCwgOTAsIDYwIF0sXG5cdFx0ODogWyAwLCAwLCAwIF0sXG5cdFx0OTogWyA3OSwgNTksIDM2IF0sXG5cdFx0MTA6IFsgMCwgMCwgMCBdLFxuXHRcdDExOiBbIDEzNSwgNzYsIDMyIF1cblx0fSxcblx0J0QuIEQuIEphbWVzb24gKDE4NDQpJzoge1xuXHRcdGZvcm1hdDogJ0hTTCcsXG5cdFx0cmVmOiAnSmFtZXNvbiwgcC4xMicsXG5cdFx0ZW5nbGlzaDogWydyZWQnLCdyZWQtb3JhbmdlJywnb3JhbmdlJywnb3JhbmdlLXllbGxvdycsJ3llbGxvdycsJ2dyZWVuJywnZ3JlZW4tYmx1ZScsJ2JsdWUnLCdibHVlLXB1cnBsZScsJ3B1cnBsZScsJ3B1cnBsZS12aW9sZXQnLCd2aW9sZXQnXSxcblx0XHQwOiBbIDM2MCwgOTYsIDUxIF0sXG5cdFx0MTogWyAxNCwgOTEsIDUxIF0sXG5cdFx0MjogWyAyOSwgOTQsIDUyIF0sXG5cdFx0MzogWyA0OSwgOTAsIDYwIF0sXG5cdFx0NDogWyA2MCwgOTAsIDYwIF0sXG5cdFx0NTogWyAxMzUsIDc2LCAzMiBdLFxuXHRcdDY6IFsgMTcyLCA2OCwgMzQgXSxcblx0XHQ3OiBbIDI0OCwgODIsIDI4IF0sXG5cdFx0ODogWyAyNzMsIDgwLCAyNyBdLFxuXHRcdDk6IFsgMzAyLCA4OCwgMjYgXSxcblx0XHQxMDogWyAzMTMsIDc4LCAzNyBdLFxuXHRcdDExOiBbIDMyNSwgODQsIDQ2IF1cblx0fSxcblx0J1RoZW9kb3IgU2VlbWFubiAoMTg4MSknOiB7XG5cdFx0Zm9ybWF0OiAnSFNMJyxcblx0XHRyZWY6ICdLbGVpbiwgcC44NicsXG5cdFx0ZW5nbGlzaDogWydjYXJtaW5lJywnc2NhcmxldCcsJ29yYW5nZScsJ3llbGxvdy1vcmFuZ2UnLCd5ZWxsb3cnLCdncmVlbicsJ2dyZWVuIGJsdWUnLCdibHVlJywnaW5kaWdvJywndmlvbGV0JywnYnJvd24nLCdibGFjayddLFxuXHRcdDA6IFsgMCwgNTgsIDI2IF0sXG5cdFx0MTogWyAzNjAsIDk2LCA1MSBdLFxuXHRcdDI6IFsgMjksIDk0LCA1MiBdLFxuXHRcdDM6IFsgNDksIDkwLCA2MCBdLFxuXHRcdDQ6IFsgNjAsIDkwLCA2MCBdLFxuXHRcdDU6IFsgMTM1LCA3NiwgMzIgXSxcblx0XHQ2OiBbIDE3MiwgNjgsIDM0IF0sXG5cdFx0NzogWyAyNDgsIDgyLCAyOCBdLFxuXHRcdDg6IFsgMzAyLCA4OCwgMjYgXSxcblx0XHQ5OiBbIDMyNSwgODQsIDQ2IF0sXG5cdFx0MTA6IFsgMCwgNTgsIDI2IF0sXG5cdFx0MTE6IFsgMCwgMCwgMyBdXG5cdH0sXG5cdCdBLiBXYWxsYWNlIFJpbWluZ3RvbiAoMTg5MyknOiB7XG5cdFx0Zm9ybWF0OiAnSFNMJyxcblx0XHRyZWY6ICdQZWFjb2NrLCBwLjQwMicsXG5cdFx0ZW5nbGlzaDogWydkZWVwIHJlZCcsJ2NyaW1zb24nLCdvcmFuZ2UtY3JpbXNvbicsJ29yYW5nZScsJ3llbGxvdycsJ3llbGxvdy1ncmVlbicsJ2dyZWVuJywnYmx1ZWlzaCBncmVlbicsJ2JsdWUtZ3JlZW4nLCdpbmRpZ28nLCdkZWVwIGJsdWUnLCd2aW9sZXQnXSxcblx0XHQwOiBbIDM2MCwgOTYsIDUxIF0sXG5cdFx0MTogWyAxLCA4OSwgMzMgXSxcblx0XHQyOiBbIDE0LCA5MSwgNTEgXSxcblx0XHQzOiBbIDI5LCA5NCwgNTIgXSxcblx0XHQ0OiBbIDYwLCA5MCwgNjAgXSxcblx0XHQ1OiBbIDc5LCA1OSwgMzYgXSxcblx0XHQ2OiBbIDEzNSwgNzYsIDMyIF0sXG5cdFx0NzogWyAxNjMsIDYyLCA0MCBdLFxuXHRcdDg6IFsgMTcyLCA2OCwgMzQgXSxcblx0XHQ5OiBbIDMwMiwgODgsIDI2IF0sXG5cdFx0MTA6IFsgMjQ4LCA4MiwgMjggXSxcblx0XHQxMTogWyAzMjUsIDg0LCA0NiBdXG5cdH0sXG5cdCdCYWluYnJpZGdlIEJpc2hvcCAoMTg5MyknOiB7XG5cdFx0Zm9ybWF0OiAnSFNMJyxcblx0XHRyZWY6ICdCaXNob3AsIHAuMTEnLFxuXHRcdGVuZ2xpc2g6IFsncmVkJywnb3JhbmdlLXJlZCBvciBzY2FybGV0Jywnb3JhbmdlJywnZ29sZCBvciB5ZWxsb3ctb3JhbmdlJywneWVsbG93IG9yIGdyZWVuLWdvbGQnLCd5ZWxsb3ctZ3JlZW4nLCdncmVlbicsJ2dyZWVuaXNoLWJsdWUgb3IgYXF1YW1hcmluZScsJ2JsdWUnLCdpbmRpZ28gb3IgdmlvbGV0LWJsdWUnLCd2aW9sZXQnLCd2aW9sZXQtcmVkJywncmVkJ10sXG5cdFx0MDogWyAzNjAsIDk2LCA1MSBdLFxuXHRcdDE6IFsgMSwgODksIDMzIF0sXG5cdFx0MjogWyAyOSwgOTQsIDUyIF0sXG5cdFx0MzogWyA1MCwgOTMsIDUyIF0sXG5cdFx0NDogWyA2MCwgOTAsIDYwIF0sXG5cdFx0NTogWyA3MywgNzMsIDU1IF0sXG5cdFx0NjogWyAxMzUsIDc2LCAzMiBdLFxuXHRcdDc6IFsgMTYzLCA2MiwgNDAgXSxcblx0XHQ4OiBbIDMwMiwgODgsIDI2IF0sXG5cdFx0OTogWyAzMjUsIDg0LCA0NiBdLFxuXHRcdDEwOiBbIDM0MywgNzksIDQ3IF0sXG5cdFx0MTE6IFsgMzYwLCA5NiwgNTEgXVxuXHR9LFxuXHQnSC4gdm9uIEhlbG1ob2x0eiAoMTkxMCknOiB7XG5cdFx0Zm9ybWF0OiAnSFNMJyxcblx0XHRyZWY6ICdIZWxtaG9sdHosIHAuMjInLFxuXHRcdGVuZ2xpc2g6IFsneWVsbG93JywnZ3JlZW4nLCdncmVlbmlzaCBibHVlJywnY2F5YW4tYmx1ZScsJ2luZGlnbyBibHVlJywndmlvbGV0JywnZW5kIG9mIHJlZCcsJ3JlZCcsJ3JlZCcsJ3JlZCcsJ3JlZCBvcmFuZ2UnLCdvcmFuZ2UnXSxcblx0XHQwOiBbIDYwLCA5MCwgNjAgXSxcblx0XHQxOiBbIDEzNSwgNzYsIDMyIF0sXG5cdFx0MjogWyAxNzIsIDY4LCAzNCBdLFxuXHRcdDM6IFsgMjExLCA3MCwgMzcgXSxcblx0XHQ0OiBbIDMwMiwgODgsIDI2IF0sXG5cdFx0NTogWyAzMjUsIDg0LCA0NiBdLFxuXHRcdDY6IFsgMzMwLCA4NCwgMzQgXSxcblx0XHQ3OiBbIDM2MCwgOTYsIDUxIF0sXG5cdFx0ODogWyAxMCwgOTEsIDQzIF0sXG5cdFx0OTogWyAxMCwgOTEsIDQzIF0sXG5cdFx0MTA6IFsgOCwgOTMsIDUxIF0sXG5cdFx0MTE6IFsgMjgsIDg5LCA1MCBdXG5cdH0sXG5cdCdBbGV4YW5kZXIgU2NyaWFiaW4gKDE5MTEpJzoge1xuXHRcdGZvcm1hdDogJ0hTTCcsXG5cdFx0cmVmOiAnSm9uZXMsIHAuMTA0Jyxcblx0XHRlbmdsaXNoOiBbJ3JlZCcsJ3Zpb2xldCcsJ3llbGxvdycsJ3N0ZWVseSB3aXRoIHRoZSBnbGludCBvZiBtZXRhbCcsJ3BlYXJseSBibHVlIHRoZSBzaGltbWVyIG9mIG1vb25zaGluZScsJ2RhcmsgcmVkJywnYnJpZ2h0IGJsdWUnLCdyb3N5IG9yYW5nZScsJ3B1cnBsZScsJ2dyZWVuJywnc3RlZWx5IHdpdGggYSBnbGludCBvZiBtZXRhbCcsJ3BlYXJseSBibHVlIHRoZSBzaGltbWVyIG9mIG1vb25zaGluZSddLFxuXHRcdDA6IFsgMzYwLCA5NiwgNTEgXSxcblx0XHQxOiBbIDMyNSwgODQsIDQ2IF0sXG5cdFx0MjogWyA2MCwgOTAsIDYwIF0sXG5cdFx0MzogWyAyNDUsIDIxLCA0MyBdLFxuXHRcdDQ6IFsgMjExLCA3MCwgMzcgXSxcblx0XHQ1OiBbIDEsIDg5LCAzMyBdLFxuXHRcdDY6IFsgMjQ4LCA4MiwgMjggXSxcblx0XHQ3OiBbIDI5LCA5NCwgNTIgXSxcblx0XHQ4OiBbIDMwMiwgODgsIDI2IF0sXG5cdFx0OTogWyAxMzUsIDc2LCAzMiBdLFxuXHRcdDEwOiBbIDI0NSwgMjEsIDQzIF0sXG5cdFx0MTE6IFsgMjExLCA3MCwgMzcgXVxuXHR9LFxuXHQnQWRyaWFuIEJlcm5hcmQgS2xlaW4gKDE5MzApJzoge1xuXHRcdGZvcm1hdDogJ0hTTCcsXG5cdFx0cmVmOiAnS2xlaW4sIHAuMjA5Jyxcblx0XHRlbmdsaXNoOiBbJ2RhcmsgcmVkJywncmVkJywncmVkIG9yYW5nZScsJ29yYW5nZScsJ3llbGxvdycsJ3llbGxvdyBncmVlbicsJ2dyZWVuJywnYmx1ZS1ncmVlbicsJ2JsdWUnLCdibHVlIHZpb2xldCcsJ3Zpb2xldCcsJ2RhcmsgdmlvbGV0J10sXG5cdFx0MDogWyAwLCA5MSwgNDAgXSxcblx0XHQxOiBbIDM2MCwgOTYsIDUxIF0sXG5cdFx0MjogWyAxNCwgOTEsIDUxIF0sXG5cdFx0MzogWyAyOSwgOTQsIDUyIF0sXG5cdFx0NDogWyA2MCwgOTAsIDYwIF0sXG5cdFx0NTogWyA3MywgNzMsIDU1IF0sXG5cdFx0NjogWyAxMzUsIDc2LCAzMiBdLFxuXHRcdDc6IFsgMTcyLCA2OCwgMzQgXSxcblx0XHQ4OiBbIDI0OCwgODIsIDI4IF0sXG5cdFx0OTogWyAyOTIsIDcwLCAzMSBdLFxuXHRcdDEwOiBbIDMyNSwgODQsIDQ2IF0sXG5cdFx0MTE6IFsgMzMwLCA4NCwgMzQgXVxuXHR9LFxuXHQnQXVndXN0IEFlcHBsaSAoMTk0MCknOiB7XG5cdFx0Zm9ybWF0OiAnSFNMJyxcblx0XHRyZWY6ICdHZXJzdG5lciwgcC4xNjknLFxuXHRcdGVuZ2xpc2g6IFsncmVkJyxudWxsLCdvcmFuZ2UnLG51bGwsJ3llbGxvdycsbnVsbCwnZ3JlZW4nLCdibHVlLWdyZWVuJyxudWxsLCd1bHRyYW1hcmluZSBibHVlJywndmlvbGV0JywncHVycGxlJ10sXG5cdFx0MDogWyAwLCA5NiwgNTEgXSxcblx0XHQxOiBbIDAsIDAsIDAgXSxcblx0XHQyOiBbIDI5LCA5NCwgNTIgXSxcblx0XHQzOiBbIDAsIDAsIDAgXSxcblx0XHQ0OiBbIDYwLCA5MCwgNjAgXSxcblx0XHQ1OiBbIDAsIDAsIDAgXSxcblx0XHQ2OiBbIDEzNSwgNzYsIDMyIF0sXG5cdFx0NzogWyAxNzIsIDY4LCAzNCBdLFxuXHRcdDg6IFsgMCwgMCwgMCBdLFxuXHRcdDk6IFsgMjExLCA3MCwgMzcgXSxcblx0XHQxMDogWyAyNzMsIDgwLCAyNyBdLFxuXHRcdDExOiBbIDMwMiwgODgsIDI2IF1cblx0fSxcblx0J0kuIEouIEJlbG1vbnQgKDE5NDQpJzoge1xuXHRcdHJlZjogJ0JlbG1vbnQsIHAuMjI2Jyxcblx0XHRlbmdsaXNoOiBbJ3JlZCcsJ3JlZC1vcmFuZ2UnLCdvcmFuZ2UnLCd5ZWxsb3ctb3JhbmdlJywneWVsbG93JywneWVsbG93LWdyZWVuJywnZ3JlZW4nLCdibHVlLWdyZWVuJywnYmx1ZScsJ2JsdWUtdmlvbGV0JywndmlvbGV0JywncmVkLXZpb2xldCddLFxuXHRcdDA6IFsgMzYwLCA5NiwgNTEgXSxcblx0XHQxOiBbIDE0LCA5MSwgNTEgXSxcblx0XHQyOiBbIDI5LCA5NCwgNTIgXSxcblx0XHQzOiBbIDUwLCA5MywgNTIgXSxcblx0XHQ0OiBbIDYwLCA5MCwgNjAgXSxcblx0XHQ1OiBbIDczLCA3MywgNTUgXSxcblx0XHQ2OiBbIDEzNSwgNzYsIDMyIF0sXG5cdFx0NzogWyAxNzIsIDY4LCAzNCBdLFxuXHRcdDg6IFsgMjQ4LCA4MiwgMjggXSxcblx0XHQ5OiBbIDMxMywgNzgsIDM3IF0sXG5cdFx0MTA6IFsgMzI1LCA4NCwgNDYgXSxcblx0XHQxMTogWyAzMzgsIDg1LCAzNyBdXG5cdH0sXG5cdCdTdGV2ZSBaaWV2ZXJpbmsgKDIwMDQpJzoge1xuXHRcdGZvcm1hdDogJ0hTTCcsXG5cdFx0cmVmOiAnQ2luY2lubmF0aSBDb250ZW1wb3JhcnkgQXJ0IENlbnRlcicsXG5cdFx0ZW5nbGlzaDogWyd5ZWxsb3ctZ3JlZW4nLCdncmVlbicsJ2JsdWUtZ3JlZW4nLCdibHVlJywnaW5kaWdvJywndmlvbGV0JywndWx0cmEgdmlvbGV0JywnaW5mcmEgcmVkJywncmVkJywnb3JhbmdlJywneWVsbG93LXdoaXRlJywneWVsbG93J10sXG5cdFx0MDogWyA3MywgNzMsIDU1IF0sXG5cdFx0MTogWyAxMzUsIDc2LCAzMiBdLFxuXHRcdDI6IFsgMTcyLCA2OCwgMzQgXSxcblx0XHQzOiBbIDI0OCwgODIsIDI4IF0sXG5cdFx0NDogWyAzMDIsIDg4LCAyNiBdLFxuXHRcdDU6IFsgMzI1LCA4NCwgNDYgXSxcblx0XHQ2OiBbIDMyNiwgNzksIDI0IF0sXG5cdFx0NzogWyAxLCA4OSwgMzMgXSxcblx0XHQ4OiBbIDM2MCwgOTYsIDUxIF0sXG5cdFx0OTogWyAyOSwgOTQsIDUyIF0sXG5cdFx0MTA6IFsgNjIsIDc4LCA3NCBdLFxuXHRcdDExOiBbIDYwLCA5MCwgNjAgXVxuXHR9LFxuXHQnQ2lyY2xlIG9mIEZpZnRocyAoSm9obnN0b24gMjAwMyknOiB7XG5cdFx0Zm9ybWF0OiAnUkdCJyxcblx0XHRyZWY6ICdKb3NlcGggSm9obnN0b24nLFxuXHRcdGVuZ2xpc2g6IFsneWVsbG93JywgJ2JsdWUnLCAnb3JhbmdlJywgJ3RlYWwnLCAncmVkJywgJ2dyZWVuJywgJ3B1cnBsZScsICdsaWdodCBvcmFuZ2UnLCAnbGlnaHQgYmx1ZScsICdkYXJrIG9yYW5nZScsICdkYXJrIGdyZWVuJywgJ3Zpb2xldCcgXSxcblx0XHQwOiBbIDI1NSwgMjU1LCAwIF0sXG5cdFx0MTogWyA1MCwgMCwgMjU1IF0sXG5cdFx0MjogWyAyNTUsIDE1MCwgMCBdLFxuXHRcdDM6IFsgMCwgMjEwLCAxODAgXSxcblx0XHQ0OiBbIDI1NSwgMCwgMCBdLFxuXHRcdDU6IFsgMTMwLCAyNTUsIDAgXSxcblx0XHQ2OiBbIDE1MCwgMCwgMjAwIF0sXG5cdFx0NzogWyAyNTUsIDE5NSwgMCBdLFxuXHRcdDg6IFsgMzAsIDEzMCwgMjU1IF0sXG5cdFx0OTogWyAyNTUsIDEwMCwgMCBdLFxuXHRcdDEwOiBbIDAsIDIwMCwgMCBdLFxuXHRcdDExOiBbIDIyNSwgMCwgMjI1IF1cblx0fSxcblx0J0NpcmNsZSBvZiBGaWZ0aHMgKFdoZWF0bWFuIDIwMDIpJzoge1xuXHRcdGZvcm1hdDogJ0hFWCcsXG5cdFx0cmVmOiAnU3R1YXJ0IFdoZWF0bWFuJywgLy8gaHR0cDovL3d3dy52YWxsZXlzZmFtaWx5Y2h1cmNoLm9yZy9cblx0XHRlbmdsaXNoOiBbXSxcblx0XHRkYXRhOiBbJyMxMjI0MDAnLCAnIzJFMDAyRScsICcjMDAyOTE0JywgJyM0NzAwMDAnLCAnIzAwMjE0MicsICcjMkUyRTAwJywgJyMyOTAwNTInLCAnIzAwM0QwMCcsICcjNTIwMDI5JywgJyMwMDNEM0QnLCAnIzUyMjkwMCcsICcjMDAwMDgwJywgJyMyNDQ3MDAnLCAnIzU3MDA1NycsICcjMDA0RDI2JywgJyM3QTAwMDAnLCAnIzAwM0I3NScsICcjNEM0RDAwJywgJyM0NzAwOEYnLCAnIzAwNjEwMCcsICcjODUwMDQyJywgJyMwMDVDNUMnLCAnIzgwNDAwMCcsICcjMDAwMEM3JywgJyMzNjZCMDAnLCAnIzgwMDA3RicsICcjMDA3NTNCJywgJyNCODAwMDAnLCAnIzAwNTdBRCcsICcjNkI2QjAwJywgJyM2NjAwQ0MnLCAnIzAwOEEwMCcsICcjQjgwMDVDJywgJyMwMDdGODAnLCAnI0IzNTkwMCcsICcjMjQyNEZGJywgJyM0NzhGMDAnLCAnI0FEMDBBRCcsICcjMDA5OTREJywgJyNGMDAwMDAnLCAnIzAwNzNFNicsICcjOEY4RjAwJywgJyM4QTE0RkYnLCAnIzAwQUQwMCcsICcjRUIwMDc1JywgJyMwMEEzQTMnLCAnI0UwNzAwMCcsICcjNkI2QkZGJywgJyM1Q0I4MDAnLCAnI0RCMDBEQicsICcjMDBDMjYxJywgJyNGRjU3NTcnLCAnIzMzOTlGRicsICcjQURBRDAwJywgJyNCNTZCRkYnLCAnIzAwRDYwMCcsICcjRkY1N0FCJywgJyMwMEM3QzcnLCAnI0ZGOTEyNCcsICcjOTk5OUZGJywgJyM2RURCMDAnLCAnI0ZGMjlGRicsICcjMDBFMDcwJywgJyNGRjk5OTknLCAnIzdBQkRGRicsICcjRDFEMTAwJywgJyNEMUEzRkYnLCAnIzAwRkEwMCcsICcjRkZBM0QxJywgJyMwMEU1RTYnLCAnI0ZGQzI4NScsICcjQzJDMkZGJywgJyM4MEZGMDAnLCAnI0ZGQThGRicsICcjMDBFMDcwJywgJyNGRkNDQ0MnLCAnI0MyRTBGRicsICcjRjBGMDAwJywgJyNFQkQ2RkYnLCAnI0FERkZBRCcsICcjRkZENkVCJywgJyM4QUZGRkYnLCAnI0ZGRUJENicsICcjRUJFQkZGJywgJyNFMEZGQzInLCAnI0ZGRUJGRicsICcjRTVGRkYyJywgJyNGRkY1RjUnXVx0XHR9XG59O1xuXG5leHBvcnQgY29uc3QgbWFwID0gdHlwZSA9PiB7XG5cdGNvbnN0IGRhdGFfaW50ZXJuYWwgPSB7fTtcblx0Y29uc3QgYmxlbmQgPSAoYSwgYikgPT4ge1xuXHRcdHJldHVybiBbIC8vIGJsZW5kIHR3byBjb2xvcnMgYW5kIHJvdW5kIHJlc3VsdHNcblx0XHRcdChhWzBdICogMC41ICsgYlswXSAqIDAuNSArIDAuNSkgPj4gMCxcblx0XHRcdChhWzFdICogMC41ICsgYlsxXSAqIDAuNSArIDAuNSkgPj4gMCxcblx0XHRcdChhWzJdICogMC41ICsgYlsyXSAqIDAuNSArIDAuNSkgPj4gMFxuXHRcdF07XG5cdH07XG5cblx0Y29uc3Qgc3luID0gZGF0YTtcblx0Y29uc3QgY29sb3JzID0gc3luW3R5cGVdIHx8IHN5blsnRC4gRC4gSmFtZXNvbiAoMTg0NCknXTtcblx0bGV0IHByaW9yX2NsciA9IGNvbG9yc1szXTtcblx0bGV0IEgsIFMsIEw7XG5cdGZvciAobGV0IG5vdGUgPSAwOyBub3RlIDw9IDg4OyBub3RlKyspIHsgLy8gY3JlYXRlcyBtYXBwaW5nIGZvciA4OCBub3Rlc1xuXHRcdGlmIChjb2xvcnMuZGF0YSkge1xuXHRcdFx0ZGF0YV9pbnRlcm5hbFtub3RlXSA9IHtcblx0XHRcdFx0aHNsOiBjb2xvcnMuZGF0YVtub3RlXSxcblx0XHRcdFx0aGV4OiBjb2xvcnMuZGF0YVtub3RlXVxuXHRcdFx0fTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bGV0IGNsciA9IGNvbG9yc1sobm90ZSArIDkpICUgMTJdO1xuXG5cdFx0XHRzd2l0Y2goY29sb3JzLmZvcm1hdCkge1xuXHRcdFx0XHRjYXNlICdSR0InOlxuXHRcdFx0XHRcdGNsciA9IENvbG9yLlNwYWNlKGNsciwgJ1JHQj5IU0wnKTtcblx0XHRcdFx0XHRIID0gY2xyLkggPj4gMDtcblx0XHRcdFx0XHRTID0gY2xyLlMgPj4gMDtcblx0XHRcdFx0XHRMID0gY2xyLkwgPj4gMDtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSAnSFNMJzpcblx0XHRcdFx0XHRIID0gY2xyWzBdO1xuXHRcdFx0XHRcdFMgPSBjbHJbMV07XG5cdFx0XHRcdFx0TCA9IGNsclsyXTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblxuXHRcdFx0aWYgKEggPT09IFMgJiYgUyA9PT0gTCkgeyAvLyBub3RlIGNvbG9yIGlzIHVuc2V0XG5cdFx0XHRcdGNsciA9IGJsZW5kKHByaW9yX2NsciwgY29sb3JzWyhub3RlICsgMTApICUgMTJdKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gXHR2YXIgYW1vdW50ID0gTCAvIDEwO1xuXHRcdFx0Ly8gXHR2YXIgb2N0YXZlID0gbm90ZSAvIDEyID4+IDA7XG5cdFx0XHQvLyBcdHZhciBvY3RhdmVMdW0gPSBMICsgYW1vdW50ICogb2N0YXZlIC0gMy4wICogYW1vdW50OyAvLyBtYXAgbHVtaW5hbmNlIHRvIG9jdGF2ZVxuXG5cdFx0XHRkYXRhX2ludGVybmFsW25vdGVdID0ge1xuXHRcdFx0XHRoc2w6ICdoc2xhKCcgKyBIICsgJywnICsgUyArICclLCcgKyBMICsgJyUsIDEpJyxcblx0XHRcdFx0aGV4OiBDb2xvci5TcGFjZSh7SDogSCwgUzogUywgTDogTH0sICdIU0w+UkdCPkhFWD5XMycpXG5cdFx0XHR9O1xuXG5cdFx0XHRwcmlvcl9jbHIgPSBjbHI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBkYXRhX2ludGVybmFsO1xufTtcbiJdLCJzb3VyY2VSb290IjoiIn0=