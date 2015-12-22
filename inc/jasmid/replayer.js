function Replayer(midiFile, BPM) {

	if (Number.isFinite(BPM)) {
		var _allowTempoChange = false;
		var _BPM = BPM;
	} else {
		var _allowTempoChange = true;
		var _BPM = 120;
	}
	///
	var _header = midiFile.header;
	var _tracks = midiFile.tracks;
	var _trackInfo = [];
	for (var i = 0; i < _tracks.length; i++) {
		var track = _tracks[i];
		_trackInfo[i] = {
			'nextEventIndex': 0,
			'ticksToNextEvent': track.length ? track[0].deltaTime : null
		};
	}
	///
	var _events = [];
	var _noteOn = {};
	///
	processEvents();
	///
	return _events;

	function processEvents() {
		var packet;
		while(packet = nextPacket()) {
			var secondsToGenerate = 0;
			if (packet.ticksToEvent > 0) {
				var beats = packet.ticksToEvent / _header.ticksPerBeat;
				secondsToGenerate = beats / (_BPM / 60);
			}
			///
			var currentTime = secondsToGenerate * 1000 || 0;
			///
			var event = packet.event;
			if (event.type === 'channel') {
				var eventId = event.channel + 'x' + event.noteNumber;
				///
				switch(event.subtype) {
					case 'noteOn':
						_noteOn[eventId] = {
							event: event,
							currentTime: currentTime
						};
						break;
					case 'noteOff':
						var start = _noteOn[eventId];
						if (start) {
							start.event.duration = currentTime - start.currentTime;
							delete _noteOn[eventId];
						}
						break;
				}
			} else {
				switch(event.subtype) {
					case 'setTempo':
						if (_allowTempoChange) {
							_BPM = 60000000 / event.microsecondsPerBeat;
						}
						break;
				}
			}
			///
			_events.push([packet, currentTime]);
		}
	}

	function nextPacket() {
		var ticksToNextEvent = null;
		var nextEventIndex = null;
		var nextEventTrack = null;
		
		for (var i = 0; i < _tracks.length; i++) {
			var info = _trackInfo[i];
			if (info.ticksToNextEvent != null) {
				if (ticksToNextEvent == null || info.ticksToNextEvent < ticksToNextEvent) {
					nextEventTrack = i;
					nextEventIndex = info.nextEventIndex;
					ticksToNextEvent = info.ticksToNextEvent;
				}
			}
		}

		if (nextEventTrack != null) {
			var track = _tracks[nextEventTrack];
			var info = _trackInfo[nextEventTrack];
			///
			info.nextEventIndex++;
			///
			if (track[nextEventIndex + 1]) {
				info.ticksToNextEvent += track[nextEventIndex + 1].deltaTime;
			} else {
				info.ticksToNextEvent = null;
			}

			for (var i = 0; i < _tracks.length; i++) {
				var info = _trackInfo[i];
				if (info.ticksToNextEvent != null) {
					info.ticksToNextEvent -= ticksToNextEvent;
				}
			}
			return {
				'ticksToEvent': ticksToNextEvent,
				'event': track[nextEventIndex]
			}
		} else {
			return null;
		}
	}
}