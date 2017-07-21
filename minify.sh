#!/bin/sh
die () {
    echo >&2 "$@"
    exit 1
}

[ "$#" -eq 1 ] || die "Call with a version number argument in the form x.yy"
echo $1 | grep -E -q '^[1-9]\.[0-9]+$' || die "Version number argument required (x.yy), $1 provided"
echo "Concatenating all files..."

cat js/debug.js \
    js/MIDI/WebAudioAPI.js \
    js/MIDI/AudioDetect.js \
    js/MIDI/LoadPlugin.js \
    js/MIDI/Plugin.js \
    js/DOM/DOMLoader.XMLHttp.js \
    js/base64/Base64.js \
    js/base64/base64binary.js \
    js/widgets/loader.js \
    js/widgets/timer.js > tmp/MIDI.js

echo "Compressing MIDI.js..."
java -jar yuicompressor-2.4.2.jar  --line-break 7000 -o bin/MIDI_$1-min.js tmp/MIDI.js

cp bin/MIDI_$1-min.js ../diatonic-map/jslib/
cp bin/MIDI_$1-min.js ../abcxjs/jslib/
cp tmp/MIDI.js ../diatonic-map/jslib/
cp tmp/MIDI.js ../abcxjs/jslib/

echo "Removing temporary files..."
rm tmp/*

