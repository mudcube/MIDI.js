/*
	------------------------------------------------------
	Combine multiple waves into one Soundfont Package
	------------------------------------------------------
*/

var keyToNote = {}; // C8 === 108
var noteToKey = {}; // 108 === C8
(function () {
	var A0 = 0x15; // first note
	var C8 = 0x6C; // last note
	var number2key = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
	for (var n = A0; n <= C8; n++) {
		var octave = (n - 12) / 12 >> 0;
		var name = number2key[n % 12] + octave;
		keyToNote[name] = n;
		noteToKey[n] = name;
	}
})();
///
var zlib = require("zlib");
var fs = require("fs");
var beautify = require("js-beautify").js_beautify;
var exec = require("child_process").exec;
var walk = require("walk");
var walker = walk.walk("./source", { followLinks: false });
///
var buildDir = "./build/";
var instrumentName = "synth_drum";
var instrumentDir = buildDir + instrumentName + "/";
var index = 21;
///
var output = {};
output.ogg = [];
output.mp3 = [];
///
walker.on("file", function (root, stat, next) {
	if (stat.name.indexOf(".wav") === -1) return next();
	convertPackage(stat, "mp3", function() { // encode mp3
		convertPackage(stat, "ogg", function() { // encode ogg
			index ++;
			return next();
		});
	});
});

walker.on("end", function () {
	writePackage("mp3");
	writePackage("ogg");
});

/* helpers
--------------------------------------------------- */
var encoder = {
	"mp3": "lame -v -b 8 -B 64",
	"ogg": "oggenc -m 32 -M 128"
};

var convertPackage = function (stat, type, callback) {
	var src = "./source/" + stat.name;
	exec(encoder[type] + " '" + src + "'", function (err) { // run encoder
		var format = src.replace(".wav", "." + type);
		fs.readFile(format, function (err, buffer) { // read encoded file
			var key = noteToKey[index];
			if (type === "mp3") {
				var from = format;
				var to = instrumentDir + key + ".mp3";
				if (!fs.existsSync(instrumentDir)) {
					fs.mkdirSync(instrumentDir);
				}
				exec("mv '" + from + "' '" + to + "'", function (err) {
					console.log(err, from, to)
				});
			}
			output[type].push({ // push to output
				name: stat.name,
				key: noteToKey[index],
				data: "data:audio/" + type + ";base64," + buffer.toString("base64")
			});
			return callback();
		});
	});
};

var writePackage = function (type) {
	var data = output[type];
	var header = '\
if (typeof(MIDI) === "undefined") var MIDI = {};\
if (typeof(MIDI.Soundfont) === "undefined") MIDI.Soundfont = {};\
MIDI.Soundfont["' + instrumentName + '"] = ';
	///
	var ret = {};
	for (var n = 0; n < data.length; n ++) {
		var obj = data[n];
		ret[obj.key] = obj.data;
	}
	///
	var js = beautify(header + JSON.stringify(ret));
	var path = "./build/" + instrumentName + "." + type + ".js";
	fs.writeFileSync(path, js);
	///
	var buf = new Buffer(js, "utf-8"); // Choose encoding for the string.
	zlib.gzip(buf, function (self, result) { // The callback will give you the 
		fs.writeFileSync(path + ".gz", result);
	});
};