#!/bin/sh
die () {
    echo >&2 "$@"
    exit 1
}

[ "$#" -eq 1 ] || die "Call with a version number argument in the form x.y"
echo $1 | grep -E -q '^[1-9]\.[0-9]+$' || die "Version number argument required (x.y), $1 provided"
echo "Concatenating all files..."

cat js/debug.js \
    js/MIDI/WebAudioAPI.js \
    js/MIDI/AudioDetect.js \
    js/MIDI/LoadPlugin.js \
    js/MIDI/Plugin.js \
    js/MIDI/Player.js \
    js/DOM/DOMLoader.XMLHttp.js \
    js/base64/Base64.js \
    js/base64/base64binary.js \
    js/widgets/loader.js \
    js/widgets/timer.js > tmp/MIDI.js

echo "Compressing MIDI.js..."
java -jar yuicompressor-2.4.2.jar  --line-break 7000 -o bin/MIDI_$1-min.js tmp/MIDI.js

cp bin/MIDI_$1-min.js ../diatonic-map/MIDI.js/
cp bin/MIDI_$1-min.js ../abcxjs/MIDI.js/
cp tmp/MIDI.js ../diatonic-map/MIDI.js/
cp tmp/MIDI.js ../abcxjs/MIDI.js/

echo "Removing temporary files..."
rm tmp/*

