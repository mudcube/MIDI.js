#!/bin/bash

mkdir -p build
OUT=build/MIDI.minimal.js

echo "//MIDI.js minimal Browserify wrapper" > $OUT

for file in js/DOMLoader.*.js js/Polyfill/Base64.js inc/base64binary.js js/MIDI.*.js
do
  cat $file >> $OUT
  echo "" >> $OUT
done

echo "if (typeof module !== 'undefined') module.exports = MIDI;" >> $OUT