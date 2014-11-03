#!/bin/sh
die () {
    echo >&2 "$@"
    exit 1
}

[ "$#" -eq 1 ] || die "Call with a version number argument in the form x.y"
echo $1 | grep -E -q '^[1-9]\.[0-9]+$' || die "Version number argument required (x.y), $1 provided"
echo "Concatenating all files..."

cat js/MIDI/AudioDetect.js \
    js/MIDI/LoadPlugin.js \
    js/MIDI/Plugin.js \
    js/MIDI/Player.js \
    js/Widgets/Loader.js \
    js/Window/DOMLoader.XMLHttp.js > tmp/MIDI_nobase64.js

cat tmp/MIDI_nobase64.js  \
    inc/Base64.js inc/base64binary.js > tmp/MIDI.js

echo "Compressing MIDI.js..."
java -jar yuicompressor-2.4.2.jar  --line-break 7000 -o bin/MIDI_$1-min.js tmp/MIDI.js
echo "Compressing MIDI_nobase64.js..."
java -jar yuicompressor-2.4.2.jar  --line-break 7000 -o bin/MIDI_nobase64_$1-min.js tmp/MIDI_nobase64.js

echo "Removing temporary files..."
rm tmp/*

