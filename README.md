## Code examples - from the repo

* [Basic](./examples/Basic.html) - the most basic implementation.
* [MIDIPlayer](./examples/MIDIPlayer.html) - how to parse MIDI files, and interact with the data stream.
* [WhitneyMusicBox](./examples/WhitneyMusicBox.html) - a audio/visual experiment by Jim Bumgardner

## Demos

* [3D Piano Player w/ Three.js](http://www.rgba.org/r3d/3d-piano-player/) by Borja Morales @reality3d
* [Brite Lite](http://labs.uxmonk.com/brite-lite/) by Daniel Christopher @uxmonk
* [Color Piano](http://mudcu.be/piano) by Michael Deal @mudcube
* [Euphony 3D Piano](http://qiao.github.com/euphony/) by Xueqiao Xu @qiao
* [Gbloink!](http://gbloink.com/alpha/) by Phil Jones
* [Piano Typewriter](http://www.picatino.com/piano_typewriter/) by Andrew Levine
* [Ragamroll](http://online-compute.rhcloud.com/ragamroll/) by Mani Balasubramanian
* [Simon Says](http://labs.uxmonk.com/simon-says/) by Daniel Christopher @uxmonk
* [Spiral Keyboard](http://spiral.qet.me/) by Patrick Snels
* [VexFlow](http://my.vexflow.com/articles/53) by Mohit Muthanna @11111110b

## Related repositories

* [MIDI Pictures](https://github.com/andruo11/midi-pictures): Pictures of the 128 standard instruments on MIDI piano keyboards
* [MIDI Soundfonts](https://github.com/gleitz/midi-js-soundfonts): Pre-rendered General MIDI soundfonts that can be used immediately with MIDI.js

## Generating Base64 Soundfonts

There is two generators for MIDI.js soundfonts:

* NodeJS package for creating soundfonts from WAV files - by Patrick Wolleb
* Ruby package for creating soundsfonts from SF2 files - by Mohit Muthanna

To dive in quickly Benjamin Gleitzman has created a package of [pre-rendered sound fonts](https://github.com/gleitz/midi-js-soundfonts).

## API

### [MIDI.loadPlugin.js](./js/midi/loader.js) - Decides which framework is best to use

```javascript
// interface to download soundfont, then execute callback;
MIDI.loadPlugin(onsuccess);
// simple example to get started;
MIDI.loadPlugin({
    instrument: "acoustic_grand_piano", // or the instrument code 1 (aka the default)
    instruments: [ "acoustic_grand_piano", "acoustic_guitar_nylon" ], // or multiple instruments
    onsuccess: function() { }
});
```

### [MIDI.Plugin.js](./js/midi/plugin.webaudio.js) - Controls MIDI output

```javascript
MIDI.noteOn(channel, note, velocity, delay);
MIDI.noteOff(channel, note, delay);
MIDI.chordOn(channel, [note, note, note], velocity, delay);
MIDI.chordOff(channel, [note, note, note], delay);
MIDI.keyToNote = object; // A0 => 21
MIDI.noteToKey = object; // 21 => A0
```

### [MIDI.Player.js](./js/midi/player.js) - Plays MIDI stream

```javascript
MIDI.Player.currentTime = integer; // time we are at now within the song.
MIDI.Player.endTime = integer; // time when song ends.
MIDI.Player.playing = boolean; // are we playing? yes or no.
MIDI.Player.loadFile(file, onsuccess); // load .MIDI from base64 or binary XML request.
MIDI.Player.start(); // start the MIDI track (you can put this in the loadFile callback)
MIDI.Player.resume(); // resume the MIDI track from pause.
MIDI.Player.pause(); // pause the MIDI track.
MIDI.Player.stop(); // stops all audio being played, and resets currentTime to 0.
```

### Listener for when notes are played

```javascript
MIDI.Player.removeListener(); // removes current listener.
MIDI.Player.addListener(function(data) { // set it to your own function!
    var now = data.now; // where we are now
    var end = data.end; // time when song ends
    var channel = data.channel; // channel note is playing on
    var message = data.message; // 128 is noteOff, 144 is noteOn
    var note = data.note; // the note
    var velocity = data.velocity; // the velocity of the note
    // then do whatever you want with the information!
});
```

### Smooth animation interpolating between onMidiEvent calls

```javascript
MIDI.Player.clearAnimation(); // clears current animation.
MIDI.Player.setAnimation(function(data) {
    var now = data.now; // where we are now
    var end = data.end; // time when song ends
    var events = data.events; // all the notes currently being processed
    // then do what you want with the information!
});
```

### Effects available for WebAudioContext via Tuna.js

```javascript
MIDI.setEffects([
        {
 		type: "MoogFilter",
		bufferSize: 4096,
		bypass: false,
		cutoff: 0.065,
		resonance: 3.5
	},
	{
		type: "Bitcrusher",
		bits: 4,
		bufferSize: 4096,
		bypass: false,
		normfreq: 0.1
	},
	{
		type: "Phaser",
		rate: 1.2, // 0.01 to 8 is a decent range, but higher values are possible
		depth: 0.3, // 0 to 1
		feedback: 0.2, // 0 to 1+
		stereoPhase: 30, // 0 to 180
		baseModulationFrequency: 700, // 500 to 1500
		bypass: 0
	}, {
		type: "Chorus",
		rate: 1.5,
		feedback: 0.2,
		delay: 0.0045,
		bypass: 0
	}, {
		type: "Delay",
		feedback: 0.45, // 0 to 1+
		delayTime: 150, // how many milliseconds should the wet signal be delayed? 
		wetLevel: 0.25, // 0 to 1+
		dryLevel: 1, // 0 to 1+
		cutoff: 20, // cutoff frequency of the built in highpass-filter. 20 to 22050
		bypass: 0
	}, {
		type: "Overdrive",
		outputGain: 0.5, // 0 to 1+
		drive: 0.7, // 0 to 1
		curveAmount: 1, // 0 to 1
		algorithmIndex: 0, // 0 to 5, selects one of our drive algorithms
		bypass: 0
	}, {
		type: "Compressor",
		threshold: 0.5, // -100 to 0
		makeupGain: 1, // 0 and up
		attack: 1, // 0 to 1000
		release: 0, // 0 to 3000
		ratio: 4, // 1 to 20
		knee: 5, // 0 to 40
		automakeup: true, // true/false
		bypass: 0
	}, {
		type: "Convolver",
		highCut: 22050, // 20 to 22050
		lowCut: 20, // 20 to 22050
		dryLevel: 1, // 0 to 1+
		wetLevel: 1, // 0 to 1+
		level: 1, // 0 to 1+, adjusts total output of both wet and dry
		impulse: "./inc/tuna/impulses/impulse_rev.wav", // the path to your impulse response
		bypass: 0
	}, {
		type: "Filter",
		frequency: 20, // 20 to 22050
		Q: 1, // 0.001 to 100
		gain: 0, // -40 to 40
		bypass: 1, // 0 to 1+
		filterType: 0 // 0 to 7, corresponds to the filter types in the native filter node: lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass in that order
	}, {
		type: "Cabinet",
		makeupGain: 1, // 0 to 20
		impulsePath: "./inc/tuna/impulses/impulse_guitar.wav", // path to your speaker impulse
		bypass: 0
	}, {
		type: "Tremolo",
		intensity: 0.3, // 0 to 1
		rate: 0.1, // 0.001 to 8
		stereoPhase: 0, // 0 to 180
		bypass: 0
	}, {
		type: "WahWah",
		automode: true, // true/false
		baseFrequency: 0.5, // 0 to 1
		excursionOctaves: 2, // 1 to 6
		sweep: 0.2, // 0 to 1
		resonance: 10, // 1 to 100
		sensitivity: 0.5, // -1 to 1
		bypass: 0
	}
]);
```

## Libraries

* [colorspace.js](./examples/inc/colorspace.js): Color conversions, music isn&rsquo;t complete without!
<pre>Color.Space(0xff0000, "HEX>RGB>HSL");</pre>
* [dom_request_script.js](./js/util/dom_request_script.js): Loads scripts in synchronously, or asynchronously.
<pre>DOMLoader.script.add(src, onsuccess);</pre>
* [dom_request_xhr.js](./js/util/dom_request_xhr.js): Cross-browser XMLHttpd request.
<pre>DOMLoader.sendRequest(src, onsuccess);</pre>
* [synesthesia.js](./js/midi/synesthesia.js): Note-to-color mappings (from Isaac Newton onwards).

### Many thanks to the authors of these libraries

* [Web MIDI API](http://webaudio.github.io/web-midi-api/): W3C proposal by Jussi Kalliokoski & Chris Wilson
* [Web Audio API](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html): W3C proposal by Chris Rogers
* [&lt;audio&gt;](http://dev.w3.org/html5/spec/Overview.html): HTML5 specs
* Flash package: [SoundManager2](http://www.schillmania.com/projects/soundmanager2/) by [Scott Schiller](http://schillmania.com)
* [jasmid](https://github.com/gasman/jasmid): Reads MIDI file byte-code, and translats into a Javascript array.
* [base642binary.js](http://blog.danguer.com/2011/10/24/base64-binary-decoding-in-javascript/): Cleans up XML base64-requests for Web Audio API.

## Similar projects
* [Wild Web MIDI](http://zz85.github.io/wild-web-midi/) by [@BlurSpline](https://twitter.com/BlurSpline)
