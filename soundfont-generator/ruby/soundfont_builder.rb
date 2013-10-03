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
#   SOX
#   Ruby Gem: midilib
#
#   $ brew install fluidsynth vorbis-tools lame sox (on OSX)
#   $ gem install midilib parallel
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
require 'parallel'
require 'digest/sha1'
include FileUtils

BUILD_DIR = "../../soundfont"            # Output path
SOUNDFONT = "./FluidR3_GM.sf2"        # Soundfont file path

# This script will generate MIDI.js-compatible instrument JS files for
# all instruments in the below array. Add or remove as necessary.
INSTRUMENTS = [
  # 0,     # Acoustic Grand Piano
  # 24,    # Acoustic Guitar (nylon)
  # 25,    # Acoustic Guitar (steel)
  # 26,    # Electric Guitar (jazz)
  # 30,    # Distortion Guitar
  # 33,    # Electric Bass (finger)
  # 34,    # Electric Bass (pick)
  # 56,    # Trumpet
  # 61,    # Brass Section
  # 64,    # Soprano Sax
  # 65,    # Alto Sax
  # 66,    # Tenor Sax
  # 67,    # Baritone Sax
  # 73,    # Flute
  # 118    # Synth Drum
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  46,
  47,
  48,
  49,
  50,
  51,
  52,
  53,
  54,
  55,
  56,
  57,
  58,
  59,
  60,
  61,
  62,
  63,
  64,
  65,
  66,
  67,
  68,
  69,
  70,
  71,
  72,
  73,
  74,
  75,
  76,
  77,
  78,
  79,
  80,
  81,
  82,
  83,
  84,
  85,
  86,
  87,
  88,
  89,
  90,
  91,
  92,
  93,
  94,
  95,
  96,
  97,
  98,
  99,
  100,
  101,
  102,
  103,
  104,
  105,
  106,
  107,
  108,
  109,
  110,
  111,
  112,
  113,
  114,
  115,
  116,
  117,
  118,
  119,
  120,
  121,
  122,
  123,
  124,
  125,
  126,
  127
]

# The encoders and tools are expected in your PATH. You can supply alternate
# paths by changing the constants below.
OGGENC = `which oggenc`.chomp
LAME = `which lame`.chomp
FLUIDSYNTH = `which fluidsynth`.chomp
SOX = `which sox`.chomp

puts "Building the following instruments using font: " + SOUNDFONT

# Display instrument names.
INSTRUMENTS.each do |i|
  puts "    #{i}: " + MIDI::GM_PATCH_NAMES[i]
end

puts
puts "Using OGG encoder: " + OGGENC
puts "Using MP3 encoder: " + LAME
puts "Using FluidSynth encoder: " + FLUIDSYNTH
puts "Using SOX encoder: " + SOX
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
DURATION = Integer(3200 * 0.75)
TEMP_FILE = "#{BUILD_DIR}/%s%stemp.midi"
FLUIDSYNTH_RAW = "%s.raw"

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

  seq.tracks << track
  track.events << ProgramChange.new(0, Integer(program))
  track.events << NoteOn.new(0, note_value, VELOCITY, 0) # channel, note, velocity, delta
  track.events << NoteOff.new(0, note_value, VELOCITY, DURATION)

  File.open(file, 'wb') { | file | seq.write(file) }
end

def run_command(cmd)
  puts "Running: " + cmd
  `#{cmd}`
end

def midi_to_audio(source, target)
  digest = Digest::SHA1.hexdigest source
  raw_file = FLUIDSYNTH_RAW % [digest]
  run_command "#{FLUIDSYNTH} -C 1 -R 1 -g 0.5 -F #{raw_file} #{SOUNDFONT} #{source}"
  run_command "#{SOX} -b 16 -c 2 -s -r 44100 #{raw_file} #{target}"
  run_command "#{OGGENC} -m 32 -M 64 #{target}"
  run_command "#{LAME} -v -b 8 -B 32 #{target}"
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
  instrument = GM_PATCH_NAMES[program]
  program_key = instrument.downcase.gsub(/[^a-z0-9 ]/, "").gsub(/\s+/, "_")

  puts "Generating audio for: " + instrument + "(#{program_key})"

  mkdir_p "#{BUILD_DIR}/#{program_key}-mp3"
  ogg_js_file = open_js_file(program_key, "ogg")
  mp3_js_file = open_js_file(program_key, "mp3")

  note_to_int("A", 0).upto(note_to_int("C", 8)) do |note_value|
    note = int_to_note(note_value)
    output_name = "#{note[:key]}#{note[:octave]}"
    output_path_prefix = BUILD_DIR + "/#{program_key}" + output_name

    puts "Generating: #{output_name}"
    temp_file_specific = TEMP_FILE % [output_name, program_key]
    generate_midi(program, note_value, temp_file_specific)
    midi_to_audio(temp_file_specific, output_path_prefix + ".wav")

    puts "Updating JS files..."
    ogg_js_file.write(base64js(output_name, output_path_prefix + ".ogg", "ogg") + ",\n")
    mp3_js_file.write(base64js(output_name, output_path_prefix + ".mp3", "mp3") + ",\n")

    mv output_path_prefix + ".mp3", "#{BUILD_DIR}/#{program_key}-mp3/#{output_name}.mp3"
    rm output_path_prefix + ".ogg"
    rm temp_file_specific
    digest = Digest::SHA1.hexdigest temp_file_specific
    rm FLUIDSYNTH_RAW % [digest]
  end

  close_js_file(ogg_js_file)
  close_js_file(mp3_js_file)
end

Parallel.each(INSTRUMENTS, :in_processes=>10){|i| generate_audio(i)}
