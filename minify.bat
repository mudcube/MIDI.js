copy /b/y js\MIDI\* tmp\m1.js
copy /b/y js\DOM\* tmp\m2.js
copy /b/y js\base64\* tmp\m3.js
copy /b/y js\widgets\* tmp\m4.js

copy /b/y js\debug.js+tmp\m1.js+tmp\m2.js+tmp\m3.js+tmp\m4.js tmp\MIDI.js

set versao=5.25

echo "Compressing MIDI.js  %versao% ..."
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.2.jar --line-break 7000 -o bin\MIDI_%versao%-min.js tmp\MIDI.js

copy bin\MIDI_%versao%-min.js ..\diatonic-map\jslib\
copy bin\MIDI_%versao%-min.js ..\abcxjs\jslib\
copy tmp\MIDI.js ..\diatonic-map\jslib\
copy tmp\MIDI.js ..\abcxjs\jslib\
