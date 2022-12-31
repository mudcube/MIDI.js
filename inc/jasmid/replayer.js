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
const clone = o => {
    if (typeof o !== 'object') {
        return o;
    }
    if (o == null) {
        return o;
    }
    const ret = (typeof o.length === 'number') ? [] : {};
    // eslint-disable-next-line guard-for-in
    for (const key in o) {
        // noinspection JSUnfilteredForInLoop
        ret[key] = clone(o[key]);
    }
    return ret;
};

export class Replayer {
    constructor(midiFile, timeWarp, eventProcessor, bpm) {
        this.midiFile = midiFile;
        this.timeWarp = timeWarp;
        this.eventProcessor = eventProcessor;
        this.trackStates = [];
        this.beatsPerMinute = bpm || 120;
        this.bpmOverride = !!bpm;
        this.ticksPerBeat = midiFile.header.ticksPerBeat;

        for (let i = 0; i < midiFile.tracks.length; i++) {
            this.trackStates[i] = {
                'nextEventIndex': 0,
                'ticksToNextEvent': (
                    midiFile.tracks[i].length
                        ? midiFile.tracks[i][0].deltaTime
                        : null
                ),
            };
        }
        this.temporal = [];
        this.processEvents();
    }

    getNextEvent() {
        let ticksToNextEvent = null;
        let nextEventTrack = null;
        let nextEventIndex = null;

        for (let i = 0; i < this.trackStates.length; i++) {
            if (
                this.trackStates[i].ticksToNextEvent != null
                && (ticksToNextEvent == null || this.trackStates[i].ticksToNextEvent < ticksToNextEvent)
            ) {
                ticksToNextEvent = this.trackStates[i].ticksToNextEvent;
                nextEventTrack = i;
                nextEventIndex = this.trackStates[i].nextEventIndex;
            }
        }
        if (nextEventTrack != null) {
            /* consume event from that track */
            const nextEvent = this.midiFile.tracks[nextEventTrack][nextEventIndex];
            if (this.midiFile.tracks[nextEventTrack][nextEventIndex + 1]) {
                this.trackStates[nextEventTrack].ticksToNextEvent += this.midiFile.tracks[nextEventTrack][nextEventIndex + 1].deltaTime;
            } else {
                this.trackStates[nextEventTrack].ticksToNextEvent = null;
            }
            this.trackStates[nextEventTrack].nextEventIndex += 1;
            /* advance timings on all tracks by ticksToNextEvent */
            for (let i = 0; i < this.trackStates.length; i++) {
                if (this.trackStates[i].ticksToNextEvent != null) {
                    this.trackStates[i].ticksToNextEvent -= ticksToNextEvent;
                }
            }
            return {
                'ticksToEvent': ticksToNextEvent,
                'event': nextEvent,
                'track': nextEventTrack,
            };
        } else {
            return null;
        }
    }

    processEvents() {
        let midiEvent = this.getNextEvent();
        while (midiEvent) {
            if (!this.bpmOverride && midiEvent.event.type === 'meta' && midiEvent.event.subtype === 'setTempo') {
                // tempo change events can occur anywhere in the middle and affect events that follow
                this.beatsPerMinute = 60000000 / midiEvent.event.microsecondsPerBeat;
            }
            //
            let beatsToGenerate = 0;
            let secondsToGenerate = 0;
            if (midiEvent.ticksToEvent > 0) {
                beatsToGenerate = midiEvent.ticksToEvent / this.ticksPerBeat;
                secondsToGenerate = beatsToGenerate / (this.beatsPerMinute / 60);
            }

            const time = (secondsToGenerate * 1000 * this.timeWarp) || 0;
            this.temporal.push([midiEvent, time]);
            midiEvent = this.getNextEvent();
        }
    }

    getData() {
        return clone(this.temporal);
    }
}
