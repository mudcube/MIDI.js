copy /b/y js\MIDI\* tmp\midi_all.js
copy /b/y tmp\midi_all.js+js\Widgets\Loader.js+js\Window\DOMLoader.XMLHttp.js tmp\MIDI_nobase64.js
copy /b/y tmp\MIDI_nobase64.js+inc\Base64.js+inc\base64binary.js tmp\MIDI.js

set versao=2.04

echo "Compressing MIDI.js  %versao% ..."
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.2.jar --line-break 7000 -o bin\MIDI_%versao%-min.js tmp\MIDI.js

echo "Compressing MIDI_nobase64.js..."
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.2.jar --line-break 7000 -o bin\MIDI_nobase64_%versao%-min.js tmp\MIDI_nobase64.js


