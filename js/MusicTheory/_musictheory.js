var invertObject = function (o) {
	if (o.length) {
		var ret = {};
		for (var key = 0; key < o.length; key ++) {
			ret[o[key]] = key; 
		}
	} else {
		var ret = {};
		for (var key in o) {
			ret[o[key]] = key; 
		}
	}
	return ret;
};

if (typeof(MusicTheory) === "undefined") MusicTheory = {};

(function() {

	var root = MusicTheory;
	
	// KEY SIGNATURES
		
	root.key2number = {
		'A': 0,
		'A#': 1,
		'Bb': 1,
		'B': 2,
		'C': 3,
		'C#': 4,
		'Db': 4,
		'D': 5,
		'D#': 6,
		'Eb': 6,
		'E': 7,
		'F': 8,
		'F#': 9,
		'Gb': 9,
		'G': 10,
		'G#': 11,
		'Ab': 11
	};
	
	root.number2float = {
		0: 0,
		1: 0.5,
		2: 1,
		3: 2,
		4: 2.5,
		5: 3,
		6: 3.5,
		7: 4,
		8: 5,
		9: 5.5,
		10: 6,
		11: 6.5,
		12: 7
	};
	
	root.number2key = invertObject(root.key2number);
	root.float2number = invertObject(root.number2float);
	
	root.getKeySignature = function (key) {
		var keys = [ 'A', 'AB', 'B', 'C', 'CD', 'D', 'DE', 'E', 'F', 'FG', 'G', 'GA' ];
		var accidental = [ 'F', 'C', 'G', 'D', 'A', 'E', 'B' ];
		var signature = { // key signatures
				'Fb': -8,
				'Cb': -7,
				'Gb': -6,
				'Db': -5,
				'Ab': -4,
				'Eb': -3,
				'Bb': -2,
				'F': -1,
				'C': 0,
				'G': 1,
				'D': 2,
				'A': 3,
				'E': 4,
				'B': 5,
				'F#': 6,
				'C#': 7,
				'G#': 8,
				'D#': 9,
				'A#': 10,
				'E#': 11,
				'B#': 12
			}[key];
		if(signature < 0) { // flat
			accidental = accidental.splice(7 + signature, -signature).reverse().join('');
		} else { // sharp
			accidental = accidental.splice(0, signature).join('');
		}
		for(var i = 0; i < keys.length; i ++) {
			if (keys[i].length > 1) {
				if (accidental.indexOf(keys[i][0]) != -1 || accidental.indexOf(keys[i][1]) != -1) {
					if (signature > 0) {
						keys[i] = keys[i][0] + '#';
					} else {
						keys[i] = keys[i][1] + 'b';
					}
				} else {
					keys[i] = keys[i][0] + '#';
				}
			}
		};
		Piano.keySignature = keys;
	};
	
	//// TEMPO
	
	root.tempoFromTap = function(that) {
		function getName(v) {
			var tempo = { // wikipedia
				200: 'Prestissimo',
				168: 'Presto',
				140: 'Vivace',
				120: 'Allegro',
				112: 'Allegretto',
				101: 'Moderato',
				76: 'Andante',
				66: 'Adagio',
				60: 'Larghetto',
				40: 'Lento',
				0: 'Larghissimo'
			};
			for (var n = 0, name = ""; n < 250; n ++) {
				if (tempo[n]) name = tempo[n];
				if (v < n) return name;
			}
			return 'Prestissimo';
		};
		if (that.tap) {
			var diff = (new Date()).getTime() - that.tap;
			var c = 1 / (diff / 1000) * 60;
			Piano.tempo = c;
			console.log(getName(c), c, diff)
			document.getElementById("taptap").value = (c>>0) +"bmp " + getName(c);
		}
		that.tap = (new Date()).getTime();
	}; 
	
	//// CHORD FINDER
	
	root.findChord = function(r) {
		function rewrite(o) {
			var z = {};
			for (var i in o) {
				var r = {};
				for (var ii in o[i]) {
					r[o[i][ii]] = 1;
				}
				z[i] = r;
			}
			return z;
		};
		var test = {};
		var values = "0 3".split(' ');
		var chords = rewrite(Piano.chords);
		for (var key in chords) {
			for (var n = 0, length = values.length; n < length; n ++) {
				if (isNaN(chords[key][values[n]])) {
					test[key] = 1;
					break;
				}
			}
		}
		var results = [];
		for (var key in chords) {
			if (!test[key]) results.push(key);
		}
		document.getElementById("find").value = results;
		return results;
	}; 
	
	///// CHORD INFORMATION
	
	root.scaleInfo = function(o) {
		var intervalNames = [ 'r', 'b2', '2', 'b3', '3', '4', 'b5', '5', '&#X266F;5', '6', 'b7', '7', '8', 'b9', '9', '&#X266F;9', '10', '11', 'b12', '12', '&#X266F;12', '13' ]; // Interval numbers
		var notes = '',
			intervals = '',
			gaps = '',
			solfege = '',
	//		colors = '',
			keys = '';
		for (var i in o) {
			if (o[i] > 0) {
				gaps += '-' + (o[i] - key);
			}
			var key = o[i];
			var note = Piano.calculateNote(key) % 12;
			var noteName = Piano.keySignature[note];
			var color = Piano.Color[Piano.HSL].english[note];
			solfege += ', ' + MusicTheory.Solfege[noteName].syllable;
	//		colors += ', ' + (color[0] ? color[0].toUpperCase() + color.substr(1) : 'Undefined');
			keys += ', ' + key;
			notes += ', ' + noteName;
			intervals += ', ' + intervalNames[key];
		}
		console.log(
			'<b>notes:</b> ' + notes.substr(2) + '<br>' +
			'<b>solfege:</b> ' + solfege.substr(2) + '<br>' +
			'<b>intervals:</b> ' + intervals.substr(2) + '<br>' +
			'<b>keys:</b> ' + keys.substr(2) + '<br>' +
			'<b>gaps:</b> ' + gaps.substr(1)
		);
	};

})();