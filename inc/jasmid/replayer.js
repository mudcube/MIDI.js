function Replayer(midiFile, timeWarp, eventProcessor, bpm) {
	function clone(o) {
		if (typeof o === 'object') {
			if (o == null) {
				return (o);
			} else {
				var res = typeof o.length === 'number' ? [] : {};
				for (var key in o) {
					res[key] = clone(o[key]);
				}
				return res;
			}
		} else {
			return o;
		}
	};

	var trackStates = [];
	var beatsPerMinute = bpm ? bpm : 120;
	var bpmOverride = bpm === +bpm;
	///
	var ticksPerBeat = midiFile.header.ticksPerBeat;	
	for (var i = 0; i < midiFile.tracks.length; i++) {
		trackStates[i] = {
			'nextEventIndex': 0,
			'ticksToNextEvent': (
				midiFile.tracks[i].length ?
					midiFile.tracks[i][0].deltaTime :
					null
			)
		};
	}

	var nextEventInfo;
	var samplesToNextEvent = 0;
	
	function getNextEvent() {
		var ticksToNextEvent = null;
		var nextEventTrack = null;
		var nextEventIndex = null;
		
		for (var i = 0; i < trackStates.length; i++) {
			if (
				trackStates[i].ticksToNextEvent != null
				&& (ticksToNextEvent == null || trackStates[i].ticksToNextEvent < ticksToNextEvent)
			) {
				ticksToNextEvent = trackStates[i].ticksToNextEvent;
				nextEventTrack = i;
				nextEventIndex = trackStates[i].nextEventIndex;
			}
		}
		if (nextEventTrack != null) {
			/* consume event from that track */
			var nextEvent = midiFile.tracks[nextEventTrack][nextEventIndex];
			if (midiFile.tracks[nextEventTrack][nextEventIndex + 1]) {
				trackStates[nextEventTrack].ticksToNextEvent += midiFile.tracks[nextEventTrack][nextEventIndex + 1].deltaTime;
			} else {
				trackStates[nextEventTrack].ticksToNextEvent = null;
			}
			trackStates[nextEventTrack].nextEventIndex += 1;
			/* advance timings on all tracks by ticksToNextEvent */
			for (var i = 0; i < trackStates.length; i++) {
				if (trackStates[i].ticksToNextEvent != null) {
					trackStates[i].ticksToNextEvent -= ticksToNextEvent
				}
			}
			return {
				'ticksToEvent': ticksToNextEvent,
				'event': nextEvent,
				'track': nextEventTrack
			}
		} else {
			return null;
		}
	};
	///
	var packet;
	var temporal = [];
	var calcDuration = {}; // used to calculate duration of noteOn
	///
	function processEvents() {
		function processNext() {
			var event = packet.event;
			var subtype = event.subtype;
			///
			var beatsToGenerate = 0;
			var secondsToGenerate = 0;
			if (packet.ticksToEvent > 0) {
				beatsToGenerate = packet.ticksToEvent / ticksPerBeat;
				secondsToGenerate = beatsToGenerate / (beatsPerMinute / 60);
			}
			///
			var currentTime = secondsToGenerate * 1000 * timeWarp || 0;
			///
			switch(subtype) {
				case 'setTempo':
					if (!bpmOverride) { // tempo change events can occur anywhere in the middle and affect events that follow
						beatsPerMinute = 60000000 / event.microsecondsPerBeat;
					}
					break;
				case 'noteOn':
					var eid = event.channel + 'x' + event.noteNumber;
 					calcDuration[eid] = {
 						event: event,
 						currentTime: currentTime
 					};
					break;
				case 'noteOff':
					var eid = event.channel + 'x' + event.noteNumber;
					var map = calcDuration[eid];
					if (map) {
						map.event.duration = currentTime - map.currentTime;
						delete calcDuration[eid];
					}
					break;
			}
			///
			temporal.push([packet, currentTime]);
			///
			packet = getNextEvent();
		};
		///
		if (packet = getNextEvent()) {
			while(packet) {
				processNext(true);
			}
		}
	};
	///
	processEvents();
	///
	return {
		getData: function() {
			return clone(temporal);
		}
	};
};
