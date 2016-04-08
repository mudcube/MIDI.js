Instrument
  .fromSoundfontUrl('./soundfonts/acoustic_grand_piano')
  .then(instrument => {
    // const track = new MidiTrack({ instrument });

    const channel = new AudioTagChannel();
    var delay = 0; // play one note every quarter second
    var note = 50; // the MIDI note
    var velocity = 127; // how hard the note hits
    // play the note
    instrument.connectToChannel(channel);
    instrument.setVolume(0, 127);

    instrument.noteOn(0, note, velocity, delay);
    instrument.noteOff(0, note, delay + 0.75);
  })
