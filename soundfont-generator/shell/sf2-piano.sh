#!/bin/bash

# UNIX SETUP
# ------------------------------------
# nodejs     - http://nodejs.org/
# gzip       - http://www.gzip.org/
# fluidsynth - http://sourceforge.net/apps/trac/fluidsynth/
# oggenc     - http://www.rarewares.org/ogg-oggenc.php
# lame       - http://lame.sourceforge.net/

# PROCESSING
# ------------------------------------
# file types to build
MP3=1
OGG=1

# formats to create
JS=1
JGZ=1

# operating mode
SINGLE=0
PACKAGE=1

# directory to generate into
MIDIDIR="./build"
if [ ! -d "$MIDIDIR" ]; then
	mkdir $MIDIDIR
fi

# .SF2 file to map MIDI to (make sure this exists!)
SOUNDFONT="./sf2/FluidSynth_1.43.sf2"

# put into the head of each generated .JS/.JGZ file
JSHEADER="{"
JSFOOTER="}"

# create MIDI files for audible notes
node "./inc/gen-midi.js"

# write the headers
if [ $OGG -eq 1 ]; then
	echo $JSHEADER > $MIDIDIR/soundfont-ogg.js
fi
if [ $MP3 -eq 1 ]; then
	echo $JSHEADER > $MIDIDIR/soundfont-mp3.js
fi

# from MIDI to WAV to OGG to JS to JGZ, and beyond!
find $MIDIDIR -name '*.midi' -print0 | while read -d $'\0' file
	do 
		# from MIDI to WAV
		fluidsynth -C 1 -R 1 -g 0.5 -F "$file.wav" "$SOUNDFONT" "$file"
		# from WAV to OGG
		if [ $OGG -eq 1 ]; then
			OGGFILE=`echo ${file%.midi}.ogg`;
			oggenc -m 32 -M 64 "$file.wav"
			mv "$file.ogg" "$OGGFILE"
			# from OGG to base64 embedded in Javascript
			JSCONTENT="\"`basename \"${file%.midi}\"`\": \"data:audio/ogg;base64,`node ./inc/gen-base64.js \"$OGGFILE\"`\","
			if [ $SINGLE -eq 1 ]; then
				echo $JSHEADER > "$OGGFILE.js"
				echo $JSCONTENT >> "$OGGFILE.js"
				echo $JSFOOTER >> "$OGGFILE.js"
				# gzipped version
				if [ $JGZ -eq 1 ]; then
					gzip "$OGGFILE.js" -c > "$OGGFILE.jgz"
				fi 
			fi
			if [ $PACKAGE -eq 1 ]; then
				echo "$JSCONTENT" >> "$MIDIDIR/soundfont-ogg.js"
			fi
			`rm "$OGGFILE"`
		fi 
		# from WAV to MP3
		if [ $MP3 -eq 1 ]; then
			MP3FILE=`echo "${file%.midi}.mp3"`
			lame -v -b 8 -B 32 "$file.wav" "$MP3FILE"
			# from MP3 to base64 embedded in Javascript
			JSCONTENT="\"`basename \"${file%.midi}\"`\": \"data:audio/mpeg;base64,`node ./inc/gen-base64.js \"$MP3FILE\"`\","
			if [ $SINGLE -eq 1 ]; then
				echo $JSHEADER > "$MP3FILE.js"
				echo $JSCONTENT >> "$MP3FILE.js"
				echo $JSFOOTER >> "$MP3FILE.js"
				# gzipped version
				if [ $JGZ -eq 1 ]; then
					gzip "$MP3FILE.js" -c > "$MP3FILE.jgz"
				fi 
			fi
			if [ $PACKAGE -eq 1 ]; then
				echo $JSCONTENT >> "$MIDIDIR/soundfont-mp3.js"
			fi
#			`rm "$MP3FILE"`
		fi 
		# cleanup
		rm "$file"
		rm "$file.wav"
	done

# write the footers
if [ $OGG -eq 1 ]; then
	echo $JSFOOTER >> $MIDIDIR/soundfont-ogg.js
fi
if [ $MP3 -eq 1 ]; then
	echo $JSFOOTER >> $MIDIDIR/soundfont-mp3.js
fi

if [ $PACKAGE -eq 1 ]; then
	if [ $JGZ -eq 1 ]; then
		if [ $OGG -eq 1 ]; then
			gzip $MIDIDIR/soundfont-ogg.js -c > $MIDIDIR/soundfont-ogg.jgz
		fi
		if [ $MP3 -eq 1 ]; then
			gzip $MIDIDIR/soundfont-mp3.js -c > $MIDIDIR/soundfont-mp3.jgz
		fi
	fi
fi