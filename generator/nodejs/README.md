# Node-based soundfont builder

Execute `soundfont_builder.js` in Node 14 or later to generate mp3- and ogg-based soundfont JS files.

Your source files can be WAV, MP3, and/or OGG and the script will attempt to encode as necessary (depending on your configuration). For each MIDI note, it will look for files like `61.wav` (C sharp octave 4), `Cs4.wav`, or `Db4.wav`. It can create a soundfont even if not all MIDI values have samples available.

## Usage

1. Place your wav/mp3/ogg files in a directory like `./sounds`.
2. Clone and adjust the config as necessary:
   ```
   cp generator/nodejs/example.config.js generator/nodejs/config.js
   ```
3. Execute the script
   ```
   node generator/nodejs/soundfont_builder.js
   ```

The default config file will generate `synth_drum.mp3.js` from the mp3s in the repo.
