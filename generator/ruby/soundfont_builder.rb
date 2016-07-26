#!/usr/bin/env ruby
#
# JavaScript Soundfont Builder for MIDI.js
# Author: 0xFE <mohit@muthanna.com>
#
# Requires:
#
#   FluidSynth
#   Lame
#   OggEnc (from vorbis-tools)
#   Ruby Gem: midilib
#
#   $ brew install --with-libsndfile fluidsynth
#   $ brew install vorbis-tools lame
#   $ gem install midilib
#
# You'll need to download a GM soundbank to generate audio.
#
# Usage:
#
# 1) Install the above dependencies.
# 2) Edit BUILD_DIR, SOUNDFONT, and INSTRUMENTS as required.
# 3) Run without any argument.

require 'base64'
require 'fileutils'
require 'midilib'
require 'zlib'
include FileUtils

BUILD_DIR = "./soundfont" # Output path
SOUNDFONT = "../sf2/redco/TR-808-Drums.SF2" # Soundfont file path

# This script will generate MIDI.js-compatible instrument JS files for
# all instruments in the below array. Add or remove as necessary.
INSTRUMENTS = [
  -1,   # Percussion (channel 10)
  0     # Acoustic Grand Piano
];
# INSTRUMENTS = [
#   -1,    # Percussion (channel 10)
#   0,     # Acoustic Grand Piano
#   24,    # Acoustic Guitar (nylon)
#   25,    # Acoustic Guitar (steel)
#   26,    # Electric Guitar (jazz)
#   30,    # Distortion Guitar
#   33,    # Electric Bass (finger)
#   34,    # Electric Bass (pick)
#   56,    # Trumpet
#   61,    # Brass Section
#   64,    # Soprano Sax
#   65,    # Alto Sax
#   66,    # Tenor Sax
#   67,    # Baritone Sax
#   73,    # Flute
#   118    # Synth Drum
# ];

# The encoders and tools are expected in your PATH. You can supply alternate
# paths by changing the constants below.
OGGENC = `which oggenc`.chomp
LAME = `which lame`.chomp
FLUIDSYNTH = `which fluidsynth`.chomp

puts "Building the following instruments using font: " + SOUNDFONT

# Display instrument names.
INSTRUMENTS.each do |i|
  if i == -1
    puts "    percussion (MIDI channel 10)"
  else
    puts "    #{i}: " + MIDI::GM_PATCH_NAMES[i]
  end
end

puts
puts "Using OGG encoder: " + OGGENC
puts "Using MP3 encoder: " + LAME
puts "Using FluidSynth encoder: " + FLUIDSYNTH
puts
puts "Sending output to: " + BUILD_DIR
puts

raise "Can't find soundfont: #{SOUNDFONT}" unless File.exists? SOUNDFONT
raise "Can't find 'oggenc' command" if OGGENC.empty?
raise "Can't find 'lame' command" if LAME.empty?
raise "Can't find 'fluidsynth' command" if FLUIDSYNTH.empty?
raise "Output directory does not exist: #{BUILD_DIR}" unless File.exists?(BUILD_DIR)

puts "Hit return to begin."
$stdin.readline

NOTES = {
  "C"  => 0,
  "Db" => 1,
  "D"  => 2,
  "Eb" => 3,
  "E"  => 4,
  "F"  => 5,
  "Gb" => 6,
  "G"  => 7,
  "Ab" => 8,
  "A"  => 9,
  "Bb" => 10,
  "B"  => 11
}

MIDI_C0 = 12
VELOCITY = 85
DURATION = Integer(3000)
TEMP_FILE = "#{BUILD_DIR}/temp.midi"

def deflate(string, level)
  z = Zlib::Deflate.new(level)
  dst = z.deflate(string, Zlib::FINISH)
  z.close
  dst
end

def note_to_int(note, octave)
  value = NOTES[note]
  increment = MIDI_C0 + (octave * 12)
  return value + increment
end

def int_to_note(value)
  raise "Bad Value" if value < MIDI_C0
  reverse_notes = NOTES.invert
  value -= MIDI_C0
  octave = value / 12
  note = value % 12
  return { key: reverse_notes[note],
           octave: octave }
end

# Run a quick table validation
MIDI_C0.upto(100) do |x|
  note = int_to_note x
  raise "Broken table" unless note_to_int(note[:key], note[:octave]) == x
end

def generate_midi(program, note_value, file)
  include MIDI
  seq = Sequence.new()
  track = Track.new(seq)
  channel = 0
  if program == -1
    channel = 9
    program = 0
  end

  seq.tracks << track
  track.events << ProgramChange.new(channel, Integer(program))
  track.events << NoteOn.new(channel, note_value, VELOCITY, 0) # channel, note, velocity, delta
  track.events << NoteOff.new(channel, note_value, VELOCITY, DURATION)

  File.open(file, 'wb') { | file | seq.write(file) }
end

def run_command(cmd)
  puts "Running: " + cmd
  `#{cmd}`
end

def midi_to_audio(source, target)
  run_command "#{FLUIDSYNTH} -C no -R no -g 0.5 -F #{target} #{SOUNDFONT} #{source}"
  run_command "#{OGGENC} -m 32 -M 128 #{target}"
  run_command "#{LAME} -v -b 8 -B 64 #{target}"
  rm target
end

def open_js_file(instrument_key, type)
  js_file = File.open("#{BUILD_DIR}/#{instrument_key}-#{type}.js", "w")
  js_file.write(
"""
if (typeof(MIDI) === 'undefined') var MIDI = {};
if (typeof(MIDI.Soundfont) === 'undefined') MIDI.Soundfont = {};
MIDI.Soundfont.#{instrument_key} = {
""")
  return js_file
end

def close_js_file(file)
  file.write("\n}\n")
  file.close
end

def base64js(note, file, type)
  output = '"' + note + '": ' 
  output += '"' + "data:audio/#{type};base64,"
  output += Base64.strict_encode64(File.read(file)) + '"'
  return output
end

def generate_audio(program)
  include MIDI
  if program == -1
    instrument = "percussion"
  else
    instrument = GM_PATCH_NAMES[program]
  end
  instrument_key = instrument.downcase.gsub(/[^a-z0-9 ]/, "").gsub(/\s+/, "_")

  puts "Generating audio for: " + instrument + "(#{instrument_key})"

  mkdir_p "#{BUILD_DIR}/#{instrument_key}-mp3"
  ogg_js_file = open_js_file(instrument_key, "ogg")
  mp3_js_file = open_js_file(instrument_key, "mp3")

  note_to_int("A", 0).upto(note_to_int("C", 8)) do |note_value|
    note = int_to_note(note_value)
    output_name = "#{note[:key]}#{note[:octave]}"
    output_path_prefix = BUILD_DIR + "/" + output_name

    puts "Generating: #{output_name}"
    generate_midi(program, note_value, TEMP_FILE)
    midi_to_audio(TEMP_FILE, output_path_prefix + ".wav")

    puts "Updating JS files..."
    ogg_js_file.write(base64js(output_name, output_path_prefix + ".ogg", "ogg") + ",\n")
    mp3_js_file.write(base64js(output_name, output_path_prefix + ".mp3", "mp3") + ",\n")

    mv output_path_prefix + ".mp3", "#{BUILD_DIR}/#{instrument_key}-mp3"
    rm output_path_prefix + ".ogg"
    rm TEMP_FILE
  end

  close_js_file(ogg_js_file)
  close_js_file(mp3_js_file)
  
  ogg_js_file = File.read("#{BUILD_DIR}/#{instrument_key}-ogg.js")
  ojsz = File.open("#{BUILD_DIR}/#{instrument_key}-ogg.js.gz", "w")
  ojsz.write(deflate(ogg_js_file, 9));

  mp3_js_file = File.read("#{BUILD_DIR}/#{instrument_key}-mp3.js")
  mjsz = File.open("#{BUILD_DIR}/#{instrument_key}-mp3.js.gz", "w")
  mjsz.write(deflate(mp3_js_file, 9));

end

INSTRUMENTS.each {|i| generate_audio(i)}