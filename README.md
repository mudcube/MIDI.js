<style type="text/css">
p {
	margin: 15px 0 0 15px;
	color: #403522;
}
 li {
	color: #403522;
}
li {
	margin-bottom: 20px;
	color: #000;
	background: rgba(255, 0, 0, 0);
	border-radius: 10px;
	-moz-border-radius: 10px;
	-webkit-border-radius: 10px;
	list-style-type: none;
	padding: 2px 10px;
}
pre {
	width: 90%;
	overflow-x: scroll;
	padding: 0;
	margin: 0;
}
pre b {
	color: #fff;
	background: rgba(255, 0, 0, 0.5);
	padding: 2px 5px;
}
li.indent {
	color: #403522;
	background: none;
	position: relative;
	left: 50px;
	list-style-type: none;
}
li.indent.square {
	background: none;
	list-style-type: square;
}
h3 {
	background-image: -webkit-gradient(linear, left top, left bottom, color-stop(1, rgba(0, 200, 255, 0.35)), color-stop(0, rgba(0,88,127,0.42)));
	color: #fff;
	text-shadow: 1px 1px #000;
	padding: 2px 10px;
	border-bottom: 1px solid rgba(0,0,0,0.3);
	border-top: 1px solid rgba(0,0,0,0.6);
}
li a {
	color: #000;
}
h3 a {
	color: #fff;
}
a, li.indent.demos a {
	color: #06f;
}
li a:hover, a:hover, li.indent.demos a:hover {
	color: #c09;
}
h3 a:hover {
	color: #ff0;
}
h3 {
	font-family: Oswald;
}
h1 {
	font-family: Oswald; font-size: 2em; font-weight: bold; z-index: 2; padding-left: 15px; position: relative; color: rgba(0,0,0,0.5); text-shadow: 0 0 7px rgba(255,255,0,0.50);
}
</style>
 <h3>Description of package;</h3>
 <li><a href="./js/MIDI.loadPlugin.js">MIDI.loadPlugin.js</a>: &nbsp;Decides which framework is best to use, and sends request.</li>
<li class="indent">
<pre>
// interface to download soundfont, then execute callback;
MIDI.loadPlugin(callback, soundfont);
// simple example to get started;
MIDI.loadPlugin(function() {
	MIDI.noteOn(0, 100, 127, 0); // plays note once loaded
}, "soundfont/soundfont-ogg-guitar.js");
</pre>
</li>
 <li><a href="./soundfont/soundfont-ogg.js">MIDI.Soundfont.js</a>: &nbsp;Customizable base64 Soundfont.</li>
  <li class="indent square"><a href="http://mudcu.be/journal/2011/11/base64-soundfonts/">Encode your own soundfonts</a>, Drums, Guitars, and so on.</li>
  <li class="indent square"><a href="https://github.com/mudx/MIDI.js">Share</a> them with the community!</li>
 <li><a href="./js/MIDI.Plugin.js">MIDI.Plugin.js</a>: &nbsp;Ties together the following frameworks;</li>
 <li class="indent"><pre>
MIDI.noteOn(channel, note, velocity, delay);
MIDI.noteOff(channel, note, delay);
MIDI.chordOn(channel, chord, velocity, delay);
MIDI.chordOff(channel, chord, delay);
MIDI.keyToNote = object; // A0 => 21
MIDI.noteToKey = object; // 21 => A0
</pre></li>
 <li><a href="./js/MIDI.Player.js">MIDI.Player.js</a>: &nbsp;Streams the MIDI to the browser.
<li class="indent">
 <pre>
MIDI.Player.currentTime = integer; // time we are at now within the song.
MIDI.Player.endTime = integer; // time when song ends.
MIDI.Player.playing = boolean; // are we playing? yes or no.
MIDI.Player.loadFile(file, callback); // load .MIDI from base64 or binary XML request.
MIDI.Player.start(); // start the MIDI track (you can put this in the loadFile callback)
MIDI.Player.resume(); // resume the MIDI track from pause.
MIDI.Player.pause(); // pause the MIDI track.
MIDI.Player.stop(); // stops all audio being played, and resets currentTime to 0.
<b>Callback whenever a note is played;</b>
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
<b>Smooth animation, interpolates between onMidiEvent calls;</b>
MIDI.Player.clearAnimation(); // clears current animation.
MIDI.Player.setAnimation(function(data) {
	var now = data.now; // where we are now
	var end = data.end; // time when song ends
	var events = data.events; // all the notes currently being processed
	// then do what you want with the information!
});</pre></li>
</li>
 <li><a href="./js/Color.js">Color.js</a>: &nbsp;Color conversions, music isn&rsquo;t complete without!</li>
 <li class="indent"><pre>Color.Space(0xff0000, "HEX>RGB>HSL");</pre></li>
 <li><a href="./js/DOMLoader.script.js">DOMLoader.script.js</a>: &nbsp;Loads scripts in synchronously, or asynchronously.</li>
 <li class="indent"><pre>DOMLoader.script.add(src, callback);</pre></li>
 <li><a href="./js/DOMLoader.XMLHttp.js">DOMLoader.XMLHttp.js</a>: &nbsp;Cross-browser XMLHttpd request.</li>
 <li class="indent"><pre>DOMLoader.sendRequest(src, callback);</pre></li>
 <li><a href="./js/MusicTheory.Synesthesia.js">MusicTheory.Synesthesia.js</a>: &nbsp;Note-to-color mappings (from Isaac Newton onwards).</li>
 <h3>Many thanks to the authors of these libraries;</h3>
 <li><a href="http://dev.w3.org/html5/spec/Overview.html">&lt;audio&gt;</a>: &nbsp;HTML5 specs</li>
 <li><a href="https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html">WebAudioAPI</a>: &nbsp;W3C proposal by Google</li>
 <li>Java package: &nbsp;<a href="https://github.com/abudaan/midibridge-js">MIDIBridge</a> by <a href="http://abumarkub.net">Daniel van der Meer</a></li>
 <li class="indent square">Use this to hook up a MIDI keyboard to your browser!</li>
 <li class="indent square">Access to 128 General MIDI instruments.</li>
 <li>Flash package: &nbsp;<a href="http://www.schillmania.com/projects/soundmanager2/">SoundManager2</a> by <a href="http://schillmania.com">Scott Schiller</a></li>
 <li><a href="https://github.com/gasman/jasmid">jasmid</a>: &nbsp;Reads MIDI file byte-code, and translats into a Javascript array.</li>
 <li><a href="http://blog.danguer.com/2011/10/24/base64-binary-decoding-in-javascript/">base642binary.js</a>: &nbsp;Cleans up XML base64-requests for Web Audio API.</li>
