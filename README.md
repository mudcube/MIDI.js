 <li><a href="./js/MIDI.loadPlugin.js">MIDI.loadPlugin.js</a>: &nbsp;Decides which framework is best to use, and sends request.</li>
<li class="indent">
<pre>
// interface to download soundfont, then execute callback;
MIDI.loadPlugin(callback);
// simple example to get started;
MIDI.loadPlugin({
	instrument: "acoustic_grand_piano", // or 1 (default)
	instruments: [ "acoustic_grand_piano", "acoustic_guitar_nylon" ], // or multiple instruments
	callback: function() { }
});
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