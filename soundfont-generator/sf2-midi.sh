#!/bin/bash

# UNIX SETUP
# ------------------------------------
# base64     - http://josefsson.org/base64/

# directory to generate into
MIDIDIR="./build"
if [ ! -d "$MIDIDIR" ]; then
	mkdir $MIDIDIR
fi

# put into the head of each generated .JS file
JSHEADER="{"
JSFOOTER="}"

# write the headers
echo "{ " > "$MIDIDIR/soundfont-midi.js"

# from MIDI to WAV to OGG to JS, and beyond!
find $MIDIDIR -name '*.mid' -print0 | while read -d $'\0' file
	do 
		OGGFILE=$file
		JSCONTENT="\"`basename \"${file%.mid}\"`\": 'data:audio/midi;base64,`base64 -i \"$OGGFILE\" -o -`',"
		echo $JSHEADER > "$OGGFILE.js"
		echo $JSCONTENT >> "$OGGFILE.js"
		echo $JSFOOTER >> "$OGGFILE.js"
		echo "\"`basename \"${file%.mid}\"`\": undefined, " >> "$MIDIDIR/soundfont-midi.js"
	done

# write the footers
echo "}" >> "$MIDIDIR/soundfont-midi.js"