/* 
	----------------------------------------------------
	Color Space : 1.2 : 2012.11.06
	----------------------------------------------------
	https://github.com/mudcube/Color.Space.js
	----------------------------------------------------
	RGBA <-> HSLA  <-> W3
	RGBA <-> HSVA
	RGBA <-> CMY   <-> CMYK
	RGBA <-> HEX24 <-> W3
	RGBA <-> HEX32
	RGBA <-> W3
	----------------------------------------------------
	Examples
	----------------------------------------------------
	Color.Space(0x99ff0000, "HEX32>RGBA>HSLA>W3"); // outputs "hsla(60,100%,17%,0.6)"
	Color.Space(0xFF0000, "HEX24>RGB>HSL"); // convert hex24 to HSL object.
	----------------------------------------------------
	W3 values
	----------------------------------------------------
	rgb(255,0,0)
	rgba(255,0,0,1)
	rgb(100%,0%,0%)
	rgba(100%,0%,0%,1)
	hsl(120, 100%, 50%)
	hsla(120, 100%, 50%, 1)
	#000000
*/

if (typeof(Color) === "undefined") var Color = {};
if (typeof(Color.Space) === "undefined") Color.Space = {};

(function () { "use strict";

var useEval = false; // caches functions for quicker access.

var functions = {
	// holds generated cached conversion functions.
};

var shortcuts = {
	"HEX24>HSL": "HEX24>RGB>HSL",
	"HEX32>HSLA": "HEX32>RGBA>HSLA",
	"HEX24>CMYK": "HEX24>RGB>CMY>CMYK",
	"RGB>CMYK": "RGB>CMY>CMYK"
};

var root = Color.Space = function(color, route) {
	if (shortcuts[route]) { // shortcut available
		route = shortcuts[route];
	}
	var r = route.split(">");
	// check whether color is an [], if so, convert to {}
	if (typeof(color) === "object" && color[0] >= 0) { // array
		var type = r[0];
		var tmp = {};
		for(var i = 0; i < type.length; i ++) {
			var str = type.substr(i, 1);
			tmp[str] = color[i];
		}
		color = tmp;
	}
	if (functions[route]) { // cached function available
		return functions[route](color);
	}
	var f = "color";
	for (var pos = 1, key = r[0]; pos < r.length; pos ++) {
		if (pos > 1) { // recycle previous
			key = key.substr(key.indexOf("_") + 1);
		}
		key += (pos === 0 ? "" : "_") + r[pos];
		color = root[key](color);
		if (useEval) {
			f = "Color.Space."+key+"("+f+")";
		}
	}	
	if (useEval) {
		functions[route] = eval("(function(color) { return "+f+" })");
	}
	return color;
};

// W3C - RGB + RGBA

root.RGB_W3 = function(o) { 
	return "rgb(" + (o.R >> 0) + "," + (o.G >> 0) + "," + (o.B >> 0) + ")"; 
};

root.RGBA_W3 = function(o) { 
	var alpha = typeof(o.A) === "number" ? o.A / 255 : 1;
	return "rgba(" + (o.R >> 0) + "," + (o.G >> 0) + "," + (o.B >> 0) + "," + alpha + ")"; 
};

root.W3_RGB = function(o) {
	var o = o.substr(4, o.length - 5).split(",");
	return {
		R: parseInt(o[0]),
		G: parseInt(o[1]),
		B: parseInt(o[2])
	}
};

root.W3_RGBA = function(o) {
	var o = o.substr(5, o.length - 6).split(",");
	return {
		R: parseInt(o[0]),
		G: parseInt(o[1]),
		B: parseInt(o[2]),
		A: parseFloat(o[3]) * 255
	}
};

// W3C - HSL + HSLA

root.HSL_W3 = function(o) {
	return "hsl(" + ((o.H + 0.5) >> 0) + "," + ((o.S + 0.5) >> 0) + "%," + ((o.L + 0.5) >> 0) + "%)"; 
};

root.HSLA_W3 = function(o) {
	var alpha = typeof(o.A) === "number" ? o.A / 255 : 1;
	return "hsla(" + ((o.H + 0.5) >> 0) + "," + ((o.S + 0.5) >> 0) + "%," + ((o.L + 0.5) >> 0) + "%," + alpha + ")"; 
};

root.W3_HSL = function(o) {
	var o = o.substr(4, o.length - 5).split(",");
	return {
		H: parseInt(o[0]),
		S: parseInt(o[1]),
		L: parseInt(o[2])
	}
};

root.W3_HSLA = function(o) {
	var o = o.substr(5, o.length - 6).split(",");
	return {
		H: parseInt(o[0]),
		S: parseInt(o[1]),
		L: parseInt(o[2]),
		A: parseFloat(o[3]) * 255
	}
};

// W3 HEX = "FFFFFF" | "FFFFFFFF"

root.W3_HEX = 
root.W3_HEX24 = function (o) {
	if (o.substr(0, 1) === "#") o = o.substr(1);
	if (o.length === 3) o = o[0] + o[0] + o[1] + o[1] + o[2] + o[2];
	return parseInt("0x" + o);
};

root.W3_HEX32 = function (o) {
	if (o.substr(0, 1) === "#") o = o.substr(1);
	if (o.length === 6) {
		return parseInt("0xFF" + o);
	} else {
		return parseInt("0x" + o);
	}
};

// HEX = 0x000000 -> 0xFFFFFF

root.HEX_W3 =
root.HEX24_W3 = function (o, maxLength) {
	if (!maxLength) maxLength = 6;
	if (!o) o = 0;
	var z = o.toString(16);
	// when string is lesser than maxLength
	var n = z.length;
	while (n < maxLength) {
		z = "0" + z;
		n++;
	}
	// when string is greater than maxLength
	var n = z.length;
	while (n > maxLength) {
		z = z.substr(1);
		n--;
	}
	return "#" + z;
};

root.HEX32_W3 = function(o) {
	return root.HEX_W3(o, 8);
};

root.HEX_RGB =
root.HEX24_RGB = function (o) {
	return {
		R: (o >> 16),
		G: (o >> 8) & 0xFF,
		B: o & 0xFF
	};
};

// HEX32 = 0x00000000 -> 0xFFFFFFFF

root.HEX32_RGBA = function (o) {
	return {
		R: o >>> 16 & 0xFF,
		G: o >>> 8 & 0xFF,
		B: o & 0xFF,
		A: o >>> 24
	};
};

// RGBA = R: Red / G: Green / B: Blue / A: Alpha

root.RGBA_HEX32 = function (o) {
	return (o.A << 24 | o.R << 16 | o.G << 8 | o.B) >>> 0;
};

// RGB = R: Red / G: Green / B: Blue

root.RGB_HEX24 =
root.RGB_HEX = function (o) {
	if (o.R < 0) o.R = 0;
	if (o.G < 0) o.G = 0;
	if (o.B < 0) o.B = 0;
	if (o.R > 255) o.R = 255;
	if (o.G > 255) o.G = 255;
	if (o.B > 255) o.B = 255;
	return o.R << 16 | o.G << 8 | o.B;
};

root.RGB_CMY = function (o) {
	return {
		C: 1 - (o.R / 255),
		M: 1 - (o.G / 255),
		Y: 1 - (o.B / 255)
	};
};

root.RGBA_HSLA =
root.RGB_HSL = function (o) { // RGB from 0 to 1
	var _R = o.R / 255,
		_G = o.G / 255,
		_B = o.B / 255,
		min = Math.min(_R, _G, _B),
		max = Math.max(_R, _G, _B),
		D = max - min,
		H,
		S,
		L = (max + min) / 2;
	if (D === 0) { // No chroma
		H = 0;
		S = 0;
	} else { // Chromatic data
		if (L < 0.5) S = D / (max + min);
		else S = D / (2 - max - min);
		var DR = (((max - _R) / 6) + (D / 2)) / D;
		var DG = (((max - _G) / 6) + (D / 2)) / D;
		var DB = (((max - _B) / 6) + (D / 2)) / D;
		if (_R === max) H = DB - DG;
		else if (_G === max) H = (1 / 3) + DR - DB;
		else if (_B === max) H = (2 / 3) + DG - DR;
		if (H < 0) H += 1;
		if (H > 1) H -= 1;
	}
	return {
		H: H * 360,
		S: S * 100,
		L: L * 100,
		A: o.A
	};
};

root.RGBA_HSVA =
root.RGB_HSV = function (o) { //- RGB from 0 to 255
	var _R = o.R / 255,
		_G = o.G / 255,
		_B = o.B / 255,
		min = Math.min(_R, _G, _B),
		max = Math.max(_R, _G, _B),
		D = max - min,
		H, 
		S,
		V = max;
	if (D === 0) { // No chroma
		H = 0;
		S = 0;
	} else { // Chromatic data
		S = D / max;
		var DR = (((max - _R) / 6) + (D / 2)) / D;
		var DG = (((max - _G) / 6) + (D / 2)) / D;
		var DB = (((max - _B) / 6) + (D / 2)) / D;
		if (_R === max) H = DB - DG;
		else if (_G === max) H = (1 / 3) + DR - DB;
		else if (_B === max) H = (2 / 3) + DG - DR;
		if (H < 0) H += 1;
		if (H > 1) H -= 1;
	}
	return {
		H: H * 360,
		S: S * 100,
		V: V * 100,
		A: o.A
	};
};

// CMY = C: Cyan / M: Magenta / Y: Yellow

root.CMY_RGB = function (o) {
	return {
		R: Math.max(0, (1 - o.C) * 255),
		G: Math.max(0, (1 - o.M) * 255),
		B: Math.max(0, (1 - o.Y) * 255)
	};
};

root.CMY_CMYK = function (o) {
	var C = o.C;
	var M = o.M;
	var Y = o.Y;
	var K = Math.min(Y, Math.min(M, Math.min(C, 1)));
	C = Math.round((C - K) / (1 - K) * 100);
	M = Math.round((M - K) / (1 - K) * 100);
	Y = Math.round((Y - K) / (1 - K) * 100);
	K = Math.round(K * 100);
	return {
		C: C,
		M: M,
		Y: Y,
		K: K
	};
};

// CMYK = C: Cyan / M: Magenta / Y: Yellow / K: Key (black)

root.CMYK_CMY = function (o) {
	return {
		C: (o.C * (1 - o.K) + o.K),
		M: (o.M * (1 - o.K) + o.K),
		Y: (o.Y * (1 - o.K) + o.K)
	};
};

// HSL (1978) = H: Hue / S: Saturation / L: Lightess
// en.wikipedia.org/wiki/HSL_and_HSV

root.HSLA_RGBA =
root.HSL_RGB = function (o) {
	var H = o.H / 360;
	var S = o.S / 100;
	var L = o.L / 100;
	var R, G, B;
	var temp1, temp2, temp3;
	if (S === 0) {
		R = G = B = L;
	} else {
		if (L < 0.5) temp2 = L * (1 + S);
		else temp2 = (L + S) - (S * L);
		temp1 = 2 * L - temp2;
		// calculate red
		temp3 = H + (1 / 3);
		if (temp3 < 0) temp3 += 1;
		if (temp3 > 1) temp3 -= 1;
		if ((6 * temp3) < 1) R = temp1 + (temp2 - temp1) * 6 * temp3;
		else if ((2 * temp3) < 1) R = temp2;
		else if ((3 * temp3) < 2) R = temp1 + (temp2 - temp1) * ((2 / 3) - temp3) * 6;
		else R = temp1;
		// calculate green
		temp3 = H;
		if (temp3 < 0) temp3 += 1;
		if (temp3 > 1) temp3 -= 1;
		if ((6 * temp3) < 1) G = temp1 + (temp2 - temp1) * 6 * temp3;
		else if ((2 * temp3) < 1) G = temp2;
		else if ((3 * temp3) < 2) G = temp1 + (temp2 - temp1) * ((2 / 3) - temp3) * 6;
		else G = temp1;
		// calculate blue
		temp3 = H - (1 / 3);
		if (temp3 < 0) temp3 += 1;
		if (temp3 > 1) temp3 -= 1;
		if ((6 * temp3) < 1) B = temp1 + (temp2 - temp1) * 6 * temp3;
		else if ((2 * temp3) < 1) B = temp2;
		else if ((3 * temp3) < 2) B = temp1 + (temp2 - temp1) * ((2 / 3) - temp3) * 6;
		else B = temp1;
	}
	return {
		R: R * 255,
		G: G * 255,
		B: B * 255,
		A: o.A
	};
};

// HSV (1978) = H: Hue / S: Saturation / V: Value
// en.wikipedia.org/wiki/HSL_and_HSV

root.HSVA_RGBA = 
root.HSV_RGB = function (o) {
	var H = o.H / 360;
	var S = o.S / 100;
	var V = o.V / 100;
	var R, G, B, D, A, C;
	if (S === 0) {
		R = G = B = Math.round(V * 255);
	} else {
		if (H >= 1) H = 0;
		H = 6 * H;
		D = H - Math.floor(H);
		A = Math.round(255 * V * (1 - S));
		B = Math.round(255 * V * (1 - (S * D)));
		C = Math.round(255 * V * (1 - (S * (1 - D))));
		V = Math.round(255 * V);
		switch (Math.floor(H)) {
			case 0:
				R = V;
				G = C;
				B = A;
				break;
			case 1:
				R = B;
				G = V;
				B = A;
				break;
			case 2:
				R = A;
				G = V;
				B = C;
				break;
			case 3:
				R = A;
				G = B;
				B = V;
				break;
			case 4:
				R = C;
				G = A;
				B = V;
				break;
			case 5:
				R = V;
				G = A;
				B = B;
				break;
		}
	}
	return {
		R: R,
		G: G,
		B: B,
		A: o.A
	};
};

})();
/*
	-------------------------------------
	MIDI.audioDetect : 0.3
	-------------------------------------
	https://github.com/mudcube/MIDI.js
	-------------------------------------
	Probably, Maybe, No... Absolutely!
	-------------------------------------
	Test to see what types of <audio> MIME types are playable by the browser.
	-------------------------------------
*/

if (typeof(MIDI) === "undefined") var MIDI = {};

(function() { "use strict";

var supports = {};	
var canPlayThrough = function (src) {
	var audio = new Audio();
	var mime = src.split(";")[0];
	audio.id = "audio";
	audio.setAttribute("preload", "auto");
	audio.setAttribute("audiobuffer", true);
	audio.addEventListener("canplaythrough", function() {
		supports[mime] = true;
	}, false);
	audio.src = "data:" + src;
	document.body.appendChild(audio);
};

MIDI.audioDetect = function(callback) {
	// check whether <audio> tag is supported
	if (typeof(Audio) === "undefined") return callback({});
	// check whether canPlayType is supported
	var audio = new Audio();
	if (typeof(audio.canPlayType) === "undefined") return callback(supports);
	// see what we can learn from the browser
	var vorbis = audio.canPlayType('audio/ogg; codecs="vorbis"');
	vorbis = (vorbis === "probably" || vorbis === "maybe");
	var mpeg = audio.canPlayType('audio/mpeg');
	mpeg = (mpeg === "probably" || mpeg === "maybe");
	// maybe nothing is supported
	if (!vorbis && !mpeg) {
		callback(supports);
		return;
	}
	// or maybe something is supported
	if (vorbis) canPlayThrough("audio/ogg;base64,T2dnUwACAAAAAAAAAADqnjMlAAAAAOyyzPIBHgF2b3JiaXMAAAAAAUAfAABAHwAAQB8AAEAfAACZAU9nZ1MAAAAAAAAAAAAA6p4zJQEAAAANJGeqCj3//////////5ADdm9yYmlzLQAAAFhpcGguT3JnIGxpYlZvcmJpcyBJIDIwMTAxMTAxIChTY2hhdWZlbnVnZ2V0KQAAAAABBXZvcmJpcw9CQ1YBAAABAAxSFCElGVNKYwiVUlIpBR1jUFtHHWPUOUYhZBBTiEkZpXtPKpVYSsgRUlgpRR1TTFNJlVKWKUUdYxRTSCFT1jFloXMUS4ZJCSVsTa50FkvomWOWMUYdY85aSp1j1jFFHWNSUkmhcxg6ZiVkFDpGxehifDA6laJCKL7H3lLpLYWKW4q91xpT6y2EGEtpwQhhc+211dxKasUYY4wxxsXiUyiC0JBVAAABAABABAFCQ1YBAAoAAMJQDEVRgNCQVQBABgCAABRFcRTHcRxHkiTLAkJDVgEAQAAAAgAAKI7hKJIjSZJkWZZlWZameZaouaov+64u667t6roOhIasBACAAAAYRqF1TCqDEEPKQ4QUY9AzoxBDDEzGHGNONKQMMogzxZAyiFssLqgQBKEhKwKAKAAAwBjEGGIMOeekZFIi55iUTkoDnaPUUcoolRRLjBmlEluJMYLOUeooZZRCjKXFjFKJscRUAABAgAMAQICFUGjIigAgCgCAMAYphZRCjCnmFHOIMeUcgwwxxiBkzinoGJNOSuWck85JiRhjzjEHlXNOSuekctBJyaQTAAAQ4AAAEGAhFBqyIgCIEwAwSJKmWZomipamiaJniqrqiaKqWp5nmp5pqqpnmqpqqqrrmqrqypbnmaZnmqrqmaaqiqbquqaquq6nqrZsuqoum65q267s+rZru77uqapsm6or66bqyrrqyrbuurbtS56nqqKquq5nqq6ruq5uq65r25pqyq6purJtuq4tu7Js664s67pmqq5suqotm64s667s2rYqy7ovuq5uq7Ks+6os+75s67ru2rrwi65r66os674qy74x27bwy7ouHJMnqqqnqq7rmarrqq5r26rr2rqmmq5suq4tm6or26os67Yry7aumaosm64r26bryrIqy77vyrJui67r66Ys67oqy8Lu6roxzLat+6Lr6roqy7qvyrKuu7ru+7JuC7umqrpuyrKvm7Ks+7auC8us27oxuq7vq7It/KosC7+u+8Iy6z5jdF1fV21ZGFbZ9n3d95Vj1nVhWW1b+V1bZ7y+bgy7bvzKrQvLstq2scy6rSyvrxvDLux8W/iVmqratum6um7Ksq/Lui60dd1XRtf1fdW2fV+VZd+3hV9pG8OwjK6r+6os68Jry8ov67qw7MIvLKttK7+r68ow27qw3L6wLL/uC8uq277v6rrStXVluX2fsSu38QsAABhwAAAIMKEMFBqyIgCIEwBAEHIOKQahYgpCCKGkEEIqFWNSMuakZM5JKaWUFEpJrWJMSuaclMwxKaGUlkopqYRSWiqlxBRKaS2l1mJKqcVQSmulpNZKSa2llGJMrcUYMSYlc05K5pyUklJrJZXWMucoZQ5K6iCklEoqraTUYuacpA46Kx2E1EoqMZWUYgupxFZKaq2kFGMrMdXUWo4hpRhLSrGVlFptMdXWWqs1YkxK5pyUzDkqJaXWSiqtZc5J6iC01DkoqaTUYiopxco5SR2ElDLIqJSUWiupxBJSia20FGMpqcXUYq4pxRZDSS2WlFosqcTWYoy1tVRTJ6XFklKMJZUYW6y5ttZqDKXEVkqLsaSUW2sx1xZjjqGkFksrsZWUWmy15dhayzW1VGNKrdYWY40x5ZRrrT2n1mJNMdXaWqy51ZZbzLXnTkprpZQWS0oxttZijTHmHEppraQUWykpxtZara3FXEMpsZXSWiypxNhirLXFVmNqrcYWW62ltVprrb3GVlsurdXcYqw9tZRrrLXmWFNtBQAADDgAAASYUAYKDVkJAEQBAADGMMYYhEYpx5yT0ijlnHNSKucghJBS5hyEEFLKnINQSkuZcxBKSSmUklJqrYVSUmqttQIAAAocAAACbNCUWByg0JCVAEAqAIDBcTRNFFXVdX1fsSxRVFXXlW3jVyxNFFVVdm1b+DVRVFXXtW3bFn5NFFVVdmXZtoWiqrqybduybgvDqKqua9uybeuorqvbuq3bui9UXVmWbVu3dR3XtnXd9nVd+Bmzbeu2buu+8CMMR9/4IeTj+3RCCAAAT3AAACqwYXWEk6KxwEJDVgIAGQAAgDFKGYUYM0gxphhjTDHGmAAAgAEHAIAAE8pAoSErAoAoAADAOeecc84555xzzjnnnHPOOeecc44xxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY0wAwE6EA8BOhIVQaMhKACAcAABACCEpKaWUUkoRU85BSSmllFKqFIOMSkoppZRSpBR1lFJKKaWUIqWgpJJSSimllElJKaWUUkoppYw6SimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaVUSimllFJKKaWUUkoppRQAYPLgAACVYOMMK0lnhaPBhYasBAByAwAAhRiDEEJpraRUUkolVc5BKCWUlEpKKZWUUqqYgxBKKqmlklJKKbXSQSihlFBKKSWUUkooJYQQSgmhlFRCK6mEUkoHoYQSQimhhFRKKSWUzkEoIYUOQkmllNRCSB10VFIpIZVSSiklpZQ6CKGUklJLLZVSWkqpdBJSKamV1FJqqbWSUgmhpFZKSSWl0lpJJbUSSkklpZRSSymFVFJJJYSSUioltZZaSqm11lJIqZWUUkqppdRSSiWlkEpKqZSSUmollZRSaiGVlEpJKaTUSimlpFRCSamlUlpKLbWUSkmptFRSSaWUlEpJKaVSSksppRJKSqmllFpJKYWSUkoplZJSSyW1VEoKJaWUUkmptJRSSymVklIBAEAHDgAAAUZUWoidZlx5BI4oZJiAAgAAQABAgAkgMEBQMApBgDACAQAAAADAAAAfAABHARAR0ZzBAUKCwgJDg8MDAAAAAAAAAAAAAACAT2dnUwAEAAAAAAAAAADqnjMlAgAAADzQPmcBAQA=");
	if (mpeg) canPlayThrough("audio/mpeg;base64,/+MYxAAAAANIAUAAAASEEB/jwOFM/0MM/90b/+RhST//w4NFwOjf///PZu////9lns5GFDv//l9GlUIEEIAAAgIg8Ir/JGq3/+MYxDsLIj5QMYcoAP0dv9HIjUcH//yYSg+CIbkGP//8w0bLVjUP///3Z0x5QCAv/yLjwtGKTEFNRTMuOTeqqqqqqqqqqqqq/+MYxEkNmdJkUYc4AKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq");
	// lets find out!
	var time = (new Date()).getTime(); 
	var interval = window.setInterval(function() {
		for (var key in supports) {}
		var now = (new Date()).getTime();
		var maxExecution = now - time > 5000;
		if (key || maxExecution) {
			window.clearInterval(interval);
			callback(supports);
		}
	}, 1);
};

})();
/*
	-----------------------------------------------------------
	MIDI.loadPlugin : 0.1 : 11/20/2012
	-----------------------------------------------------------
	https://github.com/mudcube/MIDI.js
	-----------------------------------------------------------
	MIDI.loadPlugin({
		instrument: "acoustic_grand_piano", // or 1 (default)
		instruments: [ "acoustic_grand_piano", "acoustic_guitar_nylon" ], // or multiple instruments
		callback: function() { }
	});
*/

if (typeof (MIDI) === "undefined") var MIDI = {};
if (typeof (MIDI.Soundfont) === "undefined") MIDI.Soundfont = {};

(function() { "use strict";

MIDI.loadPlugin = function(conf) {
	if (typeof(conf) === "function") conf = { callback: conf };
	/// Get the instrument name.
	var instruments = conf.instruments || conf.instrument || "acoustic_grand_piano";
	if (typeof(instruments) !== "object") instruments = [ instruments ];
	instruments.map(function(data) {
		if (typeof(data) === "number") data = MIDI.GeneralMIDI.byId[data];
		MIDI.Soundfont[data] = true;
		return data;		
	});
	///
	MIDI.soundfontUrl = conf.soundfontUrl || MIDI.soundfontUrl || "./soundfont/";
	/// Detect the best type of audio to use.
	MIDI.audioDetect(function(types) {
		var type = "";
		// use the most appropriate plugin if not specified
		if (typeof(type) === 'undefined') {
			if (plugins[window.location.hash]) {
				type = window.location.hash.substr(1);
			} else { //
				type = "";
			}
		}
		if (type === "") {
			if (window.webkitAudioContext) { // Chrome
				type = "webaudio";
			} else if (window.Audio) { // Firefox
				type = "audiotag";
			} else { // Internet Explorer
				type = "flash";
			}
		}
		if (!connect[type]) return;
		// use audio/ogg when supported
		var filetype = types["audio/ogg"] ? "ogg" : "mp3";
		// load the specified plugin
		connect[type](filetype, instruments, conf.callback);
	});
};

///

var connect = {};

connect.java = function(filetype, instruments, callback) {
	// works well cross-browser, and fully featured, but has delay when Java machine starts.
	if (MIDI.loader) MIDI.loader.message("Java API...");
	MIDI.Java.connect(callback);
};

connect.flash = function(filetype, instruments, callback) {
	// fairly quick, but requires loading of individual MP3s (more http requests).
	if (MIDI.loader) MIDI.loader.message("Flash API...");
	DOMLoader.script.add({
		src: "./inc/SoundManager2/script/soundmanager2.js",
		verify: "SoundManager",
		callback: function () {
			MIDI.Flash.connect(callback);
		}
	});
};

connect.audiotag = function(filetype, instruments, callback) {
	if (MIDI.loader) MIDI.loader.message("HTML5 Audio API...");
	// works ok, kinda like a drunken tuna fish, across the board.
	var queue = createQueue({
		items: instruments,
		getNext: function(instrumentId) {
			DOMLoader.sendRequest({
				url: MIDI.soundfontUrl + instrumentId + "-" + filetype + ".js",
				onprogress: getPercent,
				onload: function (response) {
					MIDI.Soundfont[instrumentId] = JSON.parse(response.responseText);
					if (MIDI.loader) MIDI.loader.update(null, "Downloading", 100);
					queue.getNext();
				}
			});
		},
		onComplete: function() {
			MIDI.AudioTag.connect(callback);
		}
	});
};

connect.webaudio = function(filetype, instruments, callback) {
	if (MIDI.loader) MIDI.loader.message("Web Audio API...");
	// works awesome! safari and chrome support
	var queue = createQueue({
		items: instruments,
		getNext: function(instrumentId) {
			DOMLoader.sendRequest({
				url: MIDI.soundfontUrl + instrumentId + "-" + filetype + ".js",
				onprogress: getPercent,
				onload: function(response) {
					MIDI.Soundfont[instrumentId] = JSON.parse(response.responseText);
					if (MIDI.loader) MIDI.loader.update(null, "Downloading...", 100);
					queue.getNext();
				}
			});
		},
		onComplete: function() {
			MIDI.WebAudioAPI.connect(callback);
		}
	});
};

/// Helpers

var plugins = {
	"#webaudio": true, 
	"#audiotag": true, 
	"#java": true, 
	"#flash": true 
};

var getPercent = function(event) {
	if (!this.totalSize) {
		if (this.getResponseHeader("Content-Length-Raw")) {
			this.totalSize = parseInt(this.getResponseHeader("Content-Length-Raw"));
		} else {
			this.totalSize = event.total;
		}
	}
	var percent = this.totalSize ? Math.round(event.loaded / this.totalSize * 100) : "";
	if (MIDI.loader) MIDI.loader.update(null, "Downloading...", percent);
};

var createQueue = function(conf) {
	var self = {};
	self.queue = [];
	for (var key in conf.items) {
		self.queue.push(conf.items[key]);
	}
	self.getNext = function() {
		if (!self.queue.length) return conf.onComplete();
		conf.getNext(self.queue.shift());
	};
	setTimeout(self.getNext, 1);
	return self;
};

})();
/*
	-------------------------------------
	MIDI.Player : 0.3
	-------------------------------------
	https://github.com/mudcube/MIDI.js
	-------------------------------------
	#jasmid
	-------------------------------------
*/

if (typeof (MIDI) === "undefined") var MIDI = {};
if (typeof (MIDI.Player) === "undefined") MIDI.Player = {};

(function() { "use strict";

var root = MIDI.Player;
root.callback = undefined; // your custom callback goes here!
root.currentTime = 0;
root.endTime = 0; 
root.restart = 0; 
root.playing = false;
root.timeWarp = 1;

//
root.start =
root.resume = function () {
	if (root.currentTime < -1) root.currentTime = -1;
	startAudio(root.currentTime);
};

root.pause = function () {
	var tmp = root.restart;
	stopAudio();
	root.restart = tmp;
};

root.stop = function () {
	stopAudio();
	root.restart = 0;
	root.currentTime = 0;
};

root.addListener = function(callback) {
	onMidiEvent = callback;
};

root.removeListener = function() {
	onMidiEvent = undefined;
};

root.clearAnimation = function() {
	if (root.interval)  {
		window.clearInterval(root.interval);
	}
};

root.setAnimation = function(config) {
	var callback = (typeof(config) === "function") ? config : config.callback;
	var interval = config.interval || 30;
	var currentTime = 0;
	var tOurTime = 0;
	var tTheirTime = 0;
	//
	root.clearAnimation();
	root.interval = window.setInterval(function () {
		if (root.endTime === 0) return;
		if (root.playing) {
			currentTime = (tTheirTime === root.currentTime) ? tOurTime - (new Date).getTime() : 0;
			if (root.currentTime === 0) {
				currentTime = 0;
			} else {
				currentTime = root.currentTime - currentTime;
			}
			if (tTheirTime !== root.currentTime) {
				tOurTime = (new Date).getTime();
				tTheirTime = root.currentTime;
			}
		} else { // paused
			currentTime = root.currentTime;
		}
		var endTime = root.endTime;
		var percent = currentTime / endTime;
		var total = currentTime / 1000;
		var minutes = total / 60;
		var seconds = total - (minutes * 60);
		var t1 = minutes * 60 + seconds;
		var t2 = (endTime / 1000);
		if (t2 - t1 < -1) return;
		callback({
			now: t1,
			end: t2,
			events: noteRegistrar
		});
	}, interval);
};

// helpers

root.loadMidiFile = function() { // reads midi into javascript array of events
	root.replayer = new Replayer(MidiFile(root.currentData), root.timeWarp);
	root.data = root.replayer.getData();
	root.endTime = getLength();
};

root.loadFile = function (file, callback) {
	root.stop();
	if (file.indexOf("base64,") !== -1) {
		var data = window.atob(file.split(",")[1]);
		root.currentData = data;
		root.loadMidiFile();
		if (callback) callback(data);
		return;
	}
	///
	var title = file.split(" - ")[1] || file;
	document.getElementById("playback-title").innerHTML = title.replace(".mid","");
	///
	var fetch = new XMLHttpRequest();
	fetch.open('GET', file);
	fetch.overrideMimeType("text/plain; charset=x-user-defined");
	fetch.onreadystatechange = function () {
		if (this.readyState === 4 && this.status === 200) {
			var t = this.responseText || "";
			var ff = [];
			var mx = t.length;
			var scc = String.fromCharCode;
			for (var z = 0; z < mx; z++) {
				ff[z] = scc(t.charCodeAt(z) & 255);
			}
			var data = ff.join("");
			root.currentData = data;
			root.loadMidiFile();
			if (callback) callback(data);
		}
	};
	fetch.send();
};

// Playing the audio

var eventQueue = []; // hold events to be triggered
var queuedTime; // 
var startTime = 0; // to measure time elapse
var noteRegistrar = {}; // get event for requested note
var onMidiEvent = undefined; // listener callback
var scheduleTracking = function (channel, note, currentTime, offset, message, velocity) {
	var interval = window.setTimeout(function () {
		var data = {
			channel: channel,
			note: note,
			now: currentTime,
			end: root.endTime,
			message: message,
			velocity: velocity
		};
		//
		if (message === 128) {
			delete noteRegistrar[note];
		} else {
			noteRegistrar[note] = data;
		}
		if (onMidiEvent) {
			onMidiEvent(data);
		}
		root.currentTime = currentTime;
		if (root.currentTime === queuedTime && queuedTime < root.endTime) { // grab next sequence
			startAudio(queuedTime, true);
		}
	}, currentTime - offset);
	return interval;
};

var getContext = function() {
	if (MIDI.lang === 'WebAudioAPI') {
		return MIDI.Player.ctx;
	} else if (!root.ctx) {
		root.ctx = { currentTime: 0 };
	}
	return root.ctx;
};

var getLength = function() {
	var data =  root.data;
	var length = data.length;
	var totalTime = 0.5;
	for (var n = 0; n < length; n++) {
		totalTime += data[n][1];
	}
	return totalTime;
};

var startAudio = function (currentTime, fromCache) {
	if (!root.replayer) return;
	if (!fromCache) {
		if (typeof (currentTime) === "undefined") currentTime = root.restart;
		if (root.playing) stopAudio();
		root.playing = true;
		root.data = root.replayer.getData();
		root.endTime = getLength();
	}
	var note;
	var offset = 0;
	var messages = 0;
	var data = root.data;	
	var ctx = getContext();
	var length = data.length;
	//
	queuedTime = 0.5;
	startTime = ctx.currentTime;
	//
	for (var n = 0; n < length && messages < 100; n++) {
		queuedTime += data[n][1];
		if (queuedTime <= currentTime) {
			offset = queuedTime;
			continue;
		}
		currentTime = queuedTime - offset;
		var event = data[n][0].event;
		if (event.type !== "channel") continue;
		var channel = event.channel;
		switch (event.subtype) {
			case 'noteOn':
				if (MIDI.channels[channel].mute) break;
				note = event.noteNumber - (root.MIDIOffset || 0);
				eventQueue.push({
					event: event,
					source: MIDI.noteOn(channel, event.noteNumber, event.velocity, currentTime / 1000 + ctx.currentTime),
					interval: scheduleTracking(channel, note, queuedTime, offset, 144, event.velocity)
				});
				messages ++;
				break;
			case 'noteOff':
				if (MIDI.channels[channel].mute) break;
				note = event.noteNumber - (root.MIDIOffset || 0);
				eventQueue.push({
					event: event,
					source: MIDI.noteOff(channel, event.noteNumber, currentTime / 1000 + ctx.currentTime),
					interval: scheduleTracking(channel, note, queuedTime, offset - 10, 128)
				});
				break;
			default:
				break;
		}
	}
};

var stopAudio = function () {
	var ctx = getContext();
	root.playing = false;
	root.restart += (ctx.currentTime - startTime) * 1000;
	// stop the audio, and intervals
	while (eventQueue.length) {
		var o = eventQueue.pop();
		window.clearInterval(o.interval);
		if (!o.source) continue; // is not webaudio
		if (typeof(o.source) === "number") {
			window.clearTimeout(o.source);
		} else { // webaudio
			var source = o.source;
			source.disconnect(0);
			source.noteOff(0);
		}
	}
	// run callback to cancel any notes still playing
	for (var key in noteRegistrar) {
		var o = noteRegistrar[key]
		if (noteRegistrar[key].message === 144 && onMidiEvent) {
			onMidiEvent({
				channel: o.channel,
				note: o.note,
				now: o.now,
				end: o.end,
				message: 128,
				velocity: o.velocity
			});
		}
	}
	// reset noteRegistrar
	noteRegistrar = {};
};

})();
/*
	--------------------------------------------
	MIDI.Plugin : 0.3 : 11/20/2012
	--------------------------------------------
	https://github.com/mudcube/MIDI.js
	--------------------------------------------
	MIDI.WebAudioAPI
	MIDI.Flash
	MIDI.HTML5
	MIDI.GeneralMIDI
	MIDI.channels
	MIDI.keyToNote
	MIDI.noteToKey
	--------------------------------------------
	setMute?
	getInstruments?
	-------------------------------------
*/

if (typeof (MIDI) === "undefined") var MIDI = {};
if (typeof (MIDI.Plugin) === "undefined") MIDI.Plugin = {};

(function() { "use strict";

/*
	--------------------------------------------
	Web Audio API - OGG or MPEG Soundbank
	--------------------------------------------
	https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html
	--------------------------------------------
*/

if (typeof (MIDI.WebAudioAPI) === "undefined") MIDI.WebAudioAPI = {};

if (window.AudioContext || window.webkitAudioContext) (function () {

	var AudioContext = window.AudioContext || window.webkitAudioContext;
	var root = MIDI.WebAudioAPI;
	var ctx;
	var sources = {};
	var masterVolume = 1;
	var audioBuffers = {};
	var audioLoader = function (instrument, urlList, index, bufferList, callback) {
		var synth = MIDI.GeneralMIDI.byName[instrument];
		var instrumentId = synth.number;
		var url = urlList[index];
		var base64 = MIDI.Soundfont[instrument][url].split(",")[1];
		var buffer = Base64Binary.decodeArrayBuffer(base64);
		ctx.decodeAudioData(buffer, function (buffer) {
			var msg = url;
			while (msg.length < 3) msg += "&nbsp;";
			if (typeof (MIDI.loader) !== "undefined") {
				MIDI.loader.update(null, synth.instrument + "<br>Processing: " + (index / 87 * 100 >> 0) + "%<br>" + msg);
			}
			buffer.id = url;
			bufferList[index] = buffer;
			//
			if (bufferList.length === urlList.length) {
				while (bufferList.length) {
					buffer = bufferList.pop();
					if (!buffer) continue;
					var nodeId = MIDI.keyToNote[buffer.id];
					audioBuffers[instrumentId + "" + nodeId] = buffer;
				}
				callback(instrument);
			}
		});
	};

	root.setVolume = function (n) {
		masterVolume = n;
	};

	root.programChange = function (channel, program) {
		MIDI.channels[channel].instrument = program;
	};

	root.noteOn = function (channel, note, velocity, delay) {
		/// check whether the note exists
		if (!MIDI.channels[channel]) return;
		var instrument = MIDI.channels[channel].instrument;
		if (!audioBuffers[instrument + "" + note]) return;
		/// convert relative delay to absolute delay
		if (delay < ctx.currentTime) delay += ctx.currentTime;
		/// crate audio buffer
		var source = ctx.createBufferSource();
		sources[channel + "" + note] = source;
		source.buffer = audioBuffers[instrument + "" + note];
		source.connect(ctx.destination);
		///
		var gainNode = ctx.createGainNode();
		var value = -0.5 + (velocity / 100) * 2;
		var minus = (1 - masterVolume) * 2;
		gainNode.connect(ctx.destination);
		gainNode.gain.value = Math.max(-1, value - minus);
		source.connect(gainNode);
		source.noteOn(delay || 0);
		return source;
	};

	root.chordOn = function (channel, chord, velocity, delay) {
		var ret = {}, note;
		for (var n = 0, length = chord.length; n < length; n++) {
			ret[note = chord[n]] = root.noteOn(channel, note, velocity, delay);
		}
		return ret;
	};

	// FIX: needs some way to fade out smoothly..
	// POSSIBLE FIX: fade out smoothly using gain and ramping to value
	root.noteOff = function (channel, note, delay) {
		delay = delay || 0;
		var source = sources[channel + "" + note];
		if (!source) return;
		source.gain.linearRampToValueAtTime(1, delay);
		source.gain.linearRampToValueAtTime(0, delay + 0.75);
		source.noteOff(delay + 0.75);
		return source;
	};

	root.chordOff = function (channel, chord, delay) {
		var ret = {}, note;
		for (var n = 0, length = chord.length; n < length; n++) {
			ret[note = chord[n]] = root.noteOff(channel, note, delay);
		}
		return ret;
	};

	root.connect = function (callback) {
		MIDI.lang = 'WebAudioAPI';
		MIDI.setVolume = root.setVolume;
		MIDI.programChange = root.programChange;
		MIDI.noteOn = root.noteOn;
		MIDI.noteOff = root.noteOff;
		MIDI.chordOn = root.chordOn;
		MIDI.chordOff = root.chordOff;
		//
		MIDI.Player.ctx = ctx = new AudioContext();
		///
		var urlList = [];
		var keyToNote = MIDI.keyToNote;
		for (var key in keyToNote) urlList.push(key);
		var bufferList = [];
		var pending = {};
		var oncomplete = function(instrument) {
			delete pending[instrument];
			for (var key in pending) break;
			if (!key) callback();
		};
		for (var instrument in MIDI.Soundfont) {
			pending[instrument] = true;
			for (var i = 0; i < urlList.length; i++) {
				audioLoader(instrument, urlList, i, bufferList, oncomplete);
			}
		}
	};

})();

/*
	AudioTag <audio> - OGG or MPEG Soundbank
	--------------------------------------
	http://dev.w3.org/html5/spec/Overview.html#the-audio-element
*/

if (window.Audio) (function () {

	var root = MIDI.AudioTag = {};
	var note2id = {};
	var volume = 1; // floating point 
	var channel_nid = -1; // current channel
	var channels = []; // the audio channels
	var notes = {}; // the piano keys
	for (var nid = 0; nid < 12; nid++) {
		channels[nid] = new Audio();
	}

	var playChannel = function (channel, note) {
		if (!MIDI.channels[channel]) return;
		var instrument = MIDI.channels[channel].instrument;
		var id = MIDI.GeneralMIDI.byId[instrument].id;
		var note = notes[note];
		if (!note) return;
		var nid = (channel_nid + 1) % channels.length;
		var time = (new Date()).getTime();
		var audio = channels[nid];
		audio.src = MIDI.Soundfont[id][note.id];
		audio.volume = volume;
		audio.play();
		channel_nid = nid;
	};

	root.programChange = function (channel, program) {
		MIDI.channels[channel].instrument = program;
	};

	root.setVolume = function (n) {
		volume = n;
	};

	root.noteOn = function (channel, note, velocity, delay) {
		var id = note2id[note];
		if (!notes[id]) return;
		if (delay) {
			var interval = window.setTimeout(function () {
				playChannel(channel, id);
			}, delay * 1000);
			return interval;
		} else {
			playChannel(channel, id);
		}
	};
	
	root.noteOff = function (channel, note, delay) {

	};
	
	root.chordOn = function (channel, chord, velocity, delay) {
		for (var key in chord) {
			var n = chord[key];
			var id = note2id[n];
			if (!notes[id]) continue;
			playChannel(channel, id);
		}
	};
	
	root.chordOff = function (channel, chord, delay) {

	};
	
	root.stopAllNotes = function () {
		for (var nid = 0, length = channels.length; nid < length; nid++) {
			channels[nid].pause();
		}
	};
	root.connect = function (callback) {
		var loading = {};
		for (var key in MIDI.keyToNote) {
			note2id[MIDI.keyToNote[key]] = key;
			notes[key] = {
				id: key
			};
		}
		MIDI.lang = 'AudioTag';
		MIDI.setVolume = root.setVolume;
		MIDI.programChange = root.programChange;
		MIDI.noteOn = root.noteOn;
		MIDI.noteOff = root.noteOff;
		MIDI.chordOn = root.chordOn;
		MIDI.chordOff = root.chordOff;
		///
		if (callback) callback();
	};
})();

/*
	--------------------------------------------
	Flash - MP3 Soundbank
	--------------------------------------------
	http://www.schillmania.com/projects/soundmanager2/
	--------------------------------------------
*/
	
(function () {

	var root = MIDI.Flash = {};
	var noteReverse = {};
	var notes = {};

	root.programChange = function (channel, program) {
		MIDI.channels[channel].instrument = program;
	};

	root.setVolume = function (channel, note) {

	};

	root.noteOn = function (channel, note, velocity, delay) {
		if (!MIDI.channels[channel]) return;
		var instrument = MIDI.channels[channel].instrument;
		var id = MIDI.GeneralMIDI.byId[instrument].number;
		note = id + "" + noteReverse[note];
		if (!notes[note]) return;
		if (delay) {
			var interval = window.setTimeout(function() { 
				notes[note].play({ volume: velocity * 2 });
			}, delay * 1000);
			return interval;
		} else {
			notes[note].play({ volume: velocity * 2 });
		}
	};

	root.noteOff = function (channel, note, delay) {

	};

	root.chordOn = function (channel, chord, velocity, delay) {
		if (!MIDI.channels[channel]) return;
		var instrument = MIDI.channels[channel].instrument;
		var id = MIDI.GeneralMIDI.byId[instrument].number;
		for (var key in chord) {
			var n = chord[key];
			var note = id + "" + noteReverse[n];
			if (notes[note]) {
				notes[note].play({ volume: velocity * 2 });
			}
		}
	};

	root.chordOff = function (channel, chord, delay) {

	};

	root.stopAllNotes = function () {

	};

	root.connect = function (callback) {
		soundManager.flashVersion = 9;
		soundManager.useHTML5Audio = true;
		soundManager.url = '../inc/SoundManager2/swf/';
		soundManager.useHighPerformance = true;
		soundManager.wmode = 'transparent';
		soundManager.flashPollingInterval = 1;
		soundManager.debugMode = false;
		soundManager.onload = function () {
			var createBuffer = function(instrument, id, onload) {
				var synth = MIDI.GeneralMIDI.byName[instrument];
				var instrumentId = synth.number;
				notes[instrumentId+""+id] = soundManager.createSound({
					id: id,
					url: MIDI.soundfontUrl + instrument + "-mp3/" + id + ".mp3",
					multiShot: true,
					autoLoad: true,
					onload: onload
				});			
			};
			for (var instrument in MIDI.Soundfont) {
				var loaded = [];
				var onload = function () {
					loaded.push(this.sID);
					if (typeof (MIDI.loader) === "undefined") return;
					MIDI.loader.update(null, "Processing: " + this.sID);
				};
				for (var i = 0; i < 88; i++) {
					var id = noteReverse[i + 21];
					createBuffer(instrument, id, onload);
				}
			}
			///
			MIDI.lang = 'Flash';
			MIDI.setVolume = root.setVolume;
			MIDI.programChange = root.programChange;
			MIDI.noteOn = root.noteOn;
			MIDI.noteOff = root.noteOff;
			MIDI.chordOn = root.chordOn;
			MIDI.chordOff = root.chordOff;
			//
			var interval = window.setInterval(function () {
				if (loaded.length !== 88) return;
				window.clearInterval(interval);
				if (callback) callback();
			}, 25);
		};
		soundManager.onerror = function () {

		};
		for (var key in MIDI.keyToNote) {
			noteReverse[MIDI.keyToNote[key]] = key;
		}
	};
})();

/*
	--------------------------------------------
	Java - Native Soundbank
	--------------------------------------------
	https://github.com/abudaan/midibridge-js
	http://java.sun.com/products/java-media/sound/soundbanks.html	
	--------------------------------------------
*/

(function () {
	var root = MIDI.Java = {};
	root.connect = function (callback) {
		// deferred loading of <applet>
		MIDI.Plugin = false;
		if (!window.navigator.javaEnabled()) {
			MIDI.Flash.connect(callback);
			return;
		}
		MIDI.Java.callback = callback;
		var iframe = document.createElement('iframe');
		iframe.name = 'MIDIFrame';
		iframe.src = 'inc/midibridge/index.html';
		iframe.width = 1;
		iframe.height = 1;
		document.body.appendChild(iframe);
	};
	
	root.confirm = function (plugin) {

		MIDI.programChange = function (channel, program) {
			plugin.sendMidiEvent(0xC0, channel, program, 0);
		};

		MIDI.setVolume = function (n) {
			
		};

		MIDI.noteOn = function (channel, note, velocity, delay) {
			if (delay) {
				var interval = window.setTimeout(function() { 
					plugin.sendMidiEvent(0x90, channel, note, velocity);
				}, delay * 1000);
				return interval;
			} else {
				plugin.sendMidiEvent(0x90, channel, note, velocity);
			}
		};

		MIDI.noteOff = function (channel, note, delay) {
			if (delay) {
				var interval = window.setTimeout(function() { 
					plugin.sendMidiEvent(0x80, channel, note, 0);
				}, delay * 1000);
				return interval;
			} else {
				plugin.sendMidiEvent(0x80, channel, note, 0);
			}
		};

		MIDI.chordOn = function (channel, chord, velocity, delay) {
			for (var key in chord) {
				var n = chord[key];
				plugin.sendMidiEvent(0x90, channel, n, 100);
			}
		};
		
		MIDI.chordOff = function (channel, chord, delay) {
			for (var key in chord) {
				var n = chord[key];
				plugin.sendMidiEvent(0x80, channel, n, 100);
			}
		};
		
		MIDI.stopAllNotes = function () {

		};

		MIDI.getInstruments = function() {
			return [];
		};

		if (plugin.ready) {
			MIDI.lang = "Java";
			if (MIDI.Java.callback) {
				MIDI.Java.callback();
			}
		} else {
			MIDI.Flash.connect(MIDI.Java.callback);
		}
	};
})();

/*
	helper functions
*/

// instrument-tracker
MIDI.GeneralMIDI = (function (arr) {
	var clean = function(v) {
		return v.replace(/[^a-z0-9 ]/gi, "").replace(/[ ]/g, "_").toLowerCase();
	};
	var ret = {
		byName: {},
		byId: {},
		byCategory: {}
	};
	for (var key in arr) {
		var list = arr[key];
		for (var n = 0, length = list.length; n < length; n++) {
			var instrument = list[n];
			if (!instrument) continue;
			var num = parseInt(instrument.substr(0, instrument.indexOf(" ")), 10);
			instrument = instrument.replace(num + " ", "");
			ret.byId[--num] = 
			ret.byName[clean(instrument)] = 
			ret.byCategory[clean(key)] = {
				id: clean(instrument),
				instrument: instrument,
				number: num,
				category: key
			};
		}
	}
	return ret;
})({
	'Piano': ['1 Acoustic Grand Piano', '2 Bright Acoustic Piano', '3 Electric Grand Piano', '4 Honky-tonk Piano', '5 Electric Piano 1', '6 Electric Piano 2', '7 Harpsichord', '8 Clavinet'],
	'Chromatic Percussion': ['9 Celesta', '10 Glockenspiel', '11 Music Box', '12 Vibraphone', '13 Marimba', '14 Xylophone', '15 Tubular Bells', '16 Dulcimer'],
	'Organ': ['17 Drawbar Organ', '18 Percussive Organ', '19 Rock Organ', '20 Church Organ', '21 Reed Organ', '22 Accordion', '23 Harmonica', '24 Tango Accordion'],
	'Guitar': ['25 Acoustic Guitar (nylon)', '26 Acoustic Guitar (steel)', '27 Electric Guitar (jazz)', '28 Electric Guitar (clean)', '29 Electric Guitar (muted)', '30 Overdriven Guitar', '31 Distortion Guitar', '32 Guitar Harmonics'],
	'Bass': ['33 Acoustic Bass', '34 Electric Bass (finger)', '35 Electric Bass (pick)', '36 Fretless Bass', '37 Slap Bass 1', '38 Slap Bass 2', '39 Synth Bass 1', '40 Synth Bass 2'],
	'Strings': ['41 Violin', '42 Viola', '43 Cello', '44 Contrabass', '45 Tremolo Strings', '46 Pizzicato Strings', '47 Orchestral Harp', '48 Timpani'],
	'Ensemble': ['49 String Ensemble 1', '50 String Ensemble 2', '51 Synth Strings 1', '52 Synth Strings 2', '53 Choir Aahs', '54 Voice Oohs', '55 Synth Choir', '56 Orchestra Hit'],
	'Brass': ['57 Trumpet', '58 Trombone', '59 Tuba', '60 Muted Trumpet', '61 French Horn', '62 Brass Section', '63 Synth Brass 1', '64 Synth Brass 2'],
	'Reed': ['65 Soprano Sax', '66 Alto Sax', '67 Tenor Sax', '68 Baritone Sax', '69 Oboe', '70 English Horn', '71 Bassoon', '72 Clarinet'],
	'Pipe': ['73 Piccolo', '74 Flute', '75 Recorder', '76 Pan Flute', '77 Blown Bottle', '78 Shakuhachi', '79 Whistle', '80 Ocarina'],
	'Synth Lead': ['81 Lead 1 (square)', '82 Lead 2 (sawtooth)', '83 Lead 3 (calliope)', '84 Lead 4 (chiff)', '85 Lead 5 (charang)', '86 Lead 6 (voice)', '87 Lead 7 (fifths)', '88 Lead 8 (bass + lead)'],
	'Synth Pad': ['89 Pad 1 (new age)', '90 Pad 2 (warm)', '91 Pad 3 (polysynth)', '92 Pad 4 (choir)', '93 Pad 5 (bowed)', '94 Pad 6 (metallic)', '95 Pad 7 (halo)', '96 Pad 8 (sweep)'],
	'Synth Effects': ['97 FX 1 (rain)', '98 FX 2 (soundtrack)', '99 FX 3 (crystal)', '100 FX 4 (atmosphere)', '101 FX 5 (brightness)', '102 FX 6 (goblins)', '103 FX 7 (echoes)', '104 FX 8 (sci-fi)'],
	'Ethnic': ['105 Sitar', '106 Banjo', '107 Shamisen', '108 Koto', '109 Kalimba', '110 Bagpipe', '111 Fiddle', '112 Shanai'],
	'Percussive': ['113 Tinkle Bell', '114 Agogo', '115 Steel Drums', '116 Woodblock', '117 Taiko Drum', '118 Melodic Tom', '119 Synth Drum'],
	'Sound effects': ['120 Reverse Cymbal', '121 Guitar Fret Noise', '122 Breath Noise', '123 Seashore', '124 Bird Tweet', '125 Telephone Ring', '126 Helicopter', '127 Applause', '128 Gunshot']
});

// channel-tracker
MIDI.channels = (function () { // 0 - 15 channels
	var channels = {};
	for (var n = 0; n < 16; n++) {
		channels[n] = { // default values
			instrument: 0,
			// Acoustic Grand Piano
			mute: false,
			mono: false,
			omni: false,
			solo: false
		};
	}
	return channels;
})();

//
MIDI.pianoKeyOffset = 21;

// note conversions
MIDI.keyToNote = {}; // C8  == 108
MIDI.noteToKey = {}; // 108 ==  C8
(function () {
	var A0 = 0x15; // first note
	var C8 = 0x6C; // last note
	var number2key = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
	for (var n = A0; n <= C8; n++) {
		var octave = (n - 12) / 12 >> 0;
		var name = number2key[n % 12] + octave;
		MIDI.keyToNote[name] = n;
		MIDI.noteToKey[n] = name;
	}
})();

})();
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
/*
	------------------------------------------------------------
	MusicTheory.Synesthesia : 0.3
	------------------------------------------------------------
	Peacock:  “Instruments to perform color-music: Two centuries of technological experimentation,” Leonardo, 21 (1988), 397-406.
	Gerstner:  Karl Gerstner, The Forms of Color 1986
	Klein:  Colour-Music: The art of light, London: Crosby Lockwood and Son, 1927.
	Jameson:  “Visual music in a visual programming language,” IEEE Symposium on Visual Languages, 1999, 111-118. 
	Helmholtz:  Treatise on Physiological Optics, New York: Dover Books, 1962 
	Jones:  The art of light & color, New York: Van Nostrand Reinhold, 1972
	------------------------------------------------------------
	Reference: http://rhythmiclight.com/archives/ideas/colorscales.html
	------------------------------------------------------------
*/

if (typeof(MusicTheory) === "undefined") var MusicTheory = {};
if (typeof(MusicTheory.Synesthesia) === "undefined") MusicTheory.Synesthesia = {};

(function(root) {
	root.data = {
		'Isaac Newton (1704)': { 
			ref: "Gerstner, p.167",
			english: ['red',null,'orange',null,'yellow','green',null,'blue',null,'indigo',null,'violet'],
			0: [ 0, 96, 51 ], // C
			1: [ 0, 0, 0 ], // C#
			2: [ 29, 94, 52 ], // D
			3: [ 0, 0, 0 ], // D#
			4: [ 60, 90, 60 ], // E
			5: [ 135, 76, 32 ], // F
			6: [ 0, 0, 0 ], // F#
			7: [ 248, 82, 28 ], // G
			8: [ 0, 0, 0 ], // G#
			9: [ 302, 88, 26 ], // A
			10: [ 0, 0, 0 ], // A#
			11: [ 325, 84, 46 ] // B
		},
		'Louis Bertrand Castel (1734)': { 
			ref: 'Peacock, p.400',
			english: ['blue','blue-green','green','olive green','yellow','yellow-orange','orange','red','crimson','violet','agate','indigo'],
			0: [ 248, 82, 28 ],
			1: [ 172, 68, 34 ],
			2: [ 135, 76, 32 ],
			3: [ 79, 59, 36 ],
			4: [ 60, 90, 60 ],
			5: [ 49, 90, 60 ],
			6: [ 29, 94, 52 ],
			7: [ 360, 96, 51 ],
			8: [ 1, 89, 33 ],
			9: [ 325, 84, 46 ],
			10: [ 273, 80, 27 ],
			11: [ 302, 88, 26 ]
		},
		'George Field (1816)': { 
			ref: 'Klein, p.69',
			english: ['blue',null,'purple',null,'red','orange',null,'yellow',null,'yellow green',null,'green'],
			0: [ 248, 82, 28 ],
			1: [ 0, 0, 0 ],
			2: [ 302, 88, 26 ],
			3: [ 0, 0, 0 ],
			4: [ 360, 96, 51 ],
			5: [ 29, 94, 52 ],
			6: [ 0, 0, 0 ],
			7: [ 60, 90, 60 ],
			8: [ 0, 0, 0 ],
			9: [ 79, 59, 36 ],
			10: [ 0, 0, 0 ],
			11: [ 135, 76, 32 ]
		},
		'D. D. Jameson (1844)': { 
			ref: 'Jameson, p.12',
			english: ['red','red-orange','orange','orange-yellow','yellow','green','green-blue','blue','blue-purple','purple','purple-violet','violet'],
			0: [ 360, 96, 51 ],
			1: [ 14, 91, 51 ],
			2: [ 29, 94, 52 ],
			3: [ 49, 90, 60 ],
			4: [ 60, 90, 60 ],
			5: [ 135, 76, 32 ],
			6: [ 172, 68, 34 ],
			7: [ 248, 82, 28 ],
			8: [ 273, 80, 27 ],
			9: [ 302, 88, 26 ],
			10: [ 313, 78, 37 ],
			11: [ 325, 84, 46 ]
		},
		'Theodor Seemann (1881)': { 
			ref: 'Klein, p.86',
			english: ['carmine','scarlet','orange','yellow-orange','yellow','green','green blue','blue','indigo','violet','brown','black'],
			0: [ 0, 58, 26 ],
			1: [ 360, 96, 51 ],
			2: [ 29, 94, 52 ],
			3: [ 49, 90, 60 ],
			4: [ 60, 90, 60 ],
			5: [ 135, 76, 32 ],
			6: [ 172, 68, 34 ],
			7: [ 248, 82, 28 ],
			8: [ 302, 88, 26 ],
			9: [ 325, 84, 46 ],
			10: [ 0, 58, 26 ],
			11: [ 0, 0, 3 ]
		},
		'A. Wallace Rimington (1893)': { 
			ref: 'Peacock, p.402',
			english: ['deep red','crimson','orange-crimson','orange','yellow','yellow-green','green','blueish green','blue-green','indigo','deep blue','violet'],
			0: [ 360, 96, 51 ],
			1: [ 1, 89, 33 ],
			2: [ 14, 91, 51 ],
			3: [ 29, 94, 52 ],
			4: [ 60, 90, 60 ],
			5: [ 79, 59, 36 ],
			6: [ 135, 76, 32 ],
			7: [ 163, 62, 40 ],
			8: [ 172, 68, 34 ],
			9: [ 302, 88, 26 ],
			10: [ 248, 82, 28 ],
			11: [ 325, 84, 46 ]
		},
		'Bainbridge Bishop (1893)': { 
			ref: 'Bishop, p.11',
			english: ['red','orange-red or scarlet','orange','gold or yellow-orange','yellow or green-gold','yellow-green','green','greenish-blue or aquamarine','blue','indigo or violet-blue','violet','violet-red','red'],
			0: [ 360, 96, 51 ],
			1: [ 1, 89, 33 ],
			2: [ 29, 94, 52 ],
			3: [ 50, 93, 52 ],
			4: [ 60, 90, 60 ],
			5: [ 73, 73, 55 ],
			6: [ 135, 76, 32 ],
			7: [ 163, 62, 40 ],
			8: [ 302, 88, 26 ],
			9: [ 325, 84, 46 ],
			10: [ 343, 79, 47 ],
			11: [ 360, 96, 51 ]
		},
		'H. von Helmholtz (1910)': { 
			ref: 'Helmholtz, p.22',
			english: ['yellow','green','greenish blue','cayan-blue','indigo blue','violet','end of red','red','red','red','red orange','orange'],
			0: [ 60, 90, 60 ],
			1: [ 135, 76, 32 ],
			2: [ 172, 68, 34 ],
			3: [ 211, 70, 37 ],
			4: [ 302, 88, 26 ],
			5: [ 325, 84, 46 ],
			6: [ 330, 84, 34 ],
			7: [ 360, 96, 51 ],
			8: [ 10, 91, 43 ],
			9: [ 10, 91, 43 ],
			10: [ 8, 93, 51 ],
			11: [ 28, 89, 50 ]
		},
		'Alexander Scriabin (1911)': { 
			ref: 'Jones, p.104',
			english: ['red','violet','yellow','steely with the glint of metal','pearly blue the shimmer of moonshine','dark red','bright blue','rosy orange','purple','green','steely with a glint of metal','pearly blue the shimmer of moonshine'],
			0: [ 360, 96, 51 ],
			1: [ 325, 84, 46 ],
			2: [ 60, 90, 60 ],
			3: [ 245, 21, 43 ],
			4: [ 211, 70, 37 ],
			5: [ 1, 89, 33 ],
			6: [ 248, 82, 28 ],
			7: [ 29, 94, 52 ],
			8: [ 302, 88, 26 ],
			9: [ 135, 76, 32 ],
			10: [ 245, 21, 43 ],
			11: [ 211, 70, 37 ]
		},
		'Adrian Bernard Klein (1930)': { 
			ref: 'Klein, p.209',
			english: ['dark red','red','red orange','orange','yellow','yellow green','green','blue-green','blue','blue violet','violet','dark violet'],
			0: [ 0, 91, 40 ],
			1: [ 360, 96, 51 ],
			2: [ 14, 91, 51 ],
			3: [ 29, 94, 52 ],
			4: [ 60, 90, 60 ],
			5: [ 73, 73, 55 ],
			6: [ 135, 76, 32 ],
			7: [ 172, 68, 34 ],
			8: [ 248, 82, 28 ],
			9: [ 292, 70, 31 ],
			10: [ 325, 84, 46 ],
			11: [ 330, 84, 34 ]
		},
		'August Aeppli (1940)': { 
			ref: 'Gerstner, p.169',
			english: ['red',null,'orange',null,'yellow',null,'green','blue-green',null,'ultramarine blue','violet','purple'],
			0: [ 0, 96, 51 ],
			1: [ 0, 0, 0 ],
			2: [ 29, 94, 52 ],
			3: [ 0, 0, 0 ],
			4: [ 60, 90, 60 ],
			5: [ 0, 0, 0 ],
			6: [ 135, 76, 32 ],
			7: [ 172, 68, 34 ],
			8: [ 0, 0, 0 ],
			9: [ 211, 70, 37 ],
			10: [ 273, 80, 27 ],
			11: [ 302, 88, 26 ]
		},
		'I. J. Belmont (1944)': { 
			ref: 'Belmont, p.226',
			english: ['red','red-orange','orange','yellow-orange','yellow','yellow-green','green','blue-green','blue','blue-violet','violet','red-violet'],
			0: [ 360, 96, 51 ],
			1: [ 14, 91, 51 ],
			2: [ 29, 94, 52 ],
			3: [ 50, 93, 52 ],
			4: [ 60, 90, 60 ],
			5: [ 73, 73, 55 ],
			6: [ 135, 76, 32 ],
			7: [ 172, 68, 34 ],
			8: [ 248, 82, 28 ],
			9: [ 313, 78, 37 ],
			10: [ 325, 84, 46 ],
			11: [ 338, 85, 37 ]
		},
		'Steve Zieverink (2004)': { 
			ref: 'Cincinnati Contemporary Art Center',
			english: ['yellow-green','green','blue-green','blue','indigo','violet','ultra violet','infra red','red','orange','yellow-white','yellow'],
			0: [ 73, 73, 55 ],
			1: [ 135, 76, 32 ],
			2: [ 172, 68, 34 ],
			3: [ 248, 82, 28 ],
			4: [ 302, 88, 26 ],
			5: [ 325, 84, 46 ],
			6: [ 326, 79, 24 ],
			7: [ 1, 89, 33 ],
			8: [ 360, 96, 51 ],
			9: [ 29, 94, 52 ],
			10: [ 62, 78, 74 ],
			11: [ 60, 90, 60 ]
		},
		'Circle of Fifths (2012)': {
			ref: "Stuart Wheatman", // http://www.valleysfamilychurch.org/
			english: [],
			data: ['#122400', '#2E002E', '#002914', '#470000', '#002142', '#2E2E00', '#290052', '#003D00', '#520029', '#003D3D', '#522900', '#000080', '#244700', '#570057', '#004D26', '#7A0000', '#003B75', '#4C4D00', '#47008F', '#006100', '#850042', '#005C5C', '#804000', '#0000C7', '#366B00', '#80007F', '#00753B', '#B80000', '#0057AD', '#6B6B00', '#6600CC', '#008A00', '#B8005C', '#007F80', '#B35900', '#2424FF', '#478F00', '#AD00AD', '#00994D', '#F00000', '#0073E6', '#8F8F00', '#8A14FF', '#00AD00', '#EB0075', '#00A3A3', '#E07000', '#6B6BFF', '#5CB800', '#DB00DB', '#00C261', '#FF5757', '#3399FF', '#ADAD00', '#B56BFF', '#00D600', '#FF57AB', '#00C7C7', '#FF9124', '#9999FF', '#6EDB00', '#FF29FF', '#00E070', '#FF9999', '#7ABDFF', '#D1D100', '#D1A3FF', '#00FA00', '#FFA3D1', '#00E5E6', '#FFC285', '#C2C2FF', '#80FF00', '#FFA8FF', '#00E070', '#FFCCCC', '#C2E0FF', '#F0F000', '#EBD6FF', '#ADFFAD', '#FFD6EB', '#8AFFFF', '#FFEBD6', '#EBEBFF', '#E0FFC2', '#FFEBFF', '#E5FFF2', '#FFF5F5']		}
	};

	root.map = function(type) {
		var data = {};
		var blend = function(a, b) {
			return [ // blend two colors and round results
				(a[0] * 0.5 + b[0] * 0.5 + 0.5) >> 0, 
				(a[1] * 0.5 + b[1] * 0.5 + 0.5) >> 0,
				(a[2] * 0.5 + b[2] * 0.5 + 0.5) >> 0
			];
		};
		var syn = root.data;
		var colors = syn[type] || syn["D. D. Jameson (1844)"];
		for (var note = 0; note <= 88; note ++) { // creates mapping for 88 notes
			if (colors.data) {
				data[note] = {
					hsl: colors.data[note],
					hex: colors.data[note] 
				}
			} else {
				var clr = colors[(note + 9) % 12];
				var H = clr.H || clr[0];
				var S = clr.S || clr[1];
				var L = clr.L || clr[2];
				if (H == S && S == L) {
					clr = blend(parray, colors[(note + 10) % 12]);
				}		
				var amount = L / 10;
				var octave = note / 12 >> 0;
				var octaveLum = L + amount * octave - 3 * amount; // map luminance to octave		
				data[note] = {
					hsl: 'hsla(' + H + ',' + S + '%,' + octaveLum + '%, 1)',
					hex: Color.Space({H:H, S:S, L:octaveLum}, "HSL>RGB>HEX>W3")
				};
				var parray = clr;
			}
		}
		return data;
	};

})(MusicTheory.Synesthesia);
// http://ntt.cc/2008/01/19/base64-encoder-decoder-with-javascript.html

// window.atob and window.btoa

(function (window) {

	var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	
	window.btoa || (window.btoa = function encode64(input) {
		input = escape(input);
		var output = "";
		var chr1, chr2, chr3 = "";
		var enc1, enc2, enc3, enc4 = "";
		var i = 0;
		do {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
			output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
			chr1 = chr2 = chr3 = "";
			enc1 = enc2 = enc3 = enc4 = "";
		} while (i < input.length);
		return output;
	});
	
	window.atob || (window.atob = function(input) {
		var output = "";
		var chr1, chr2, chr3 = "";
		var enc1, enc2, enc3, enc4 = "";
		var i = 0;
		// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
		var base64test = /[^A-Za-z0-9\+\/\=]/g;
		if (base64test.exec(input)) {
			alert("There were invalid base64 characters in the input text.\n" + "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" + "Expect errors in decoding.");
		}
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		do {
			enc1 = keyStr.indexOf(input.charAt(i++));
			enc2 = keyStr.indexOf(input.charAt(i++));
			enc3 = keyStr.indexOf(input.charAt(i++));
			enc4 = keyStr.indexOf(input.charAt(i++));
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
			output = output + String.fromCharCode(chr1);
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
			chr1 = chr2 = chr3 = "";
			enc1 = enc2 = enc3 = enc4 = "";
		} while (i < input.length);
		return unescape(output);
	});

}(this));
/* 
	----------------------------------------------------
	Loader.js : 0.4.2 : 2012/11/09
	----------------------------------------------------
	https://github.com/mudcube/Loader.js
	----------------------------------------------------
	/// Simple setup.
	var loader = new widgets.Loader;
	
	/// More complex setup.
	var loader = new widgets.Loader({
		id: "loader",
		bars: 12,
		radius: 0,
		lineWidth: 20,
		lineHeight: 70,
		timeout: 30, // maximum timeout in seconds.
		background: "rgba(0,0,0,0.5)",
		container: document.body,
		oncomplete: function() {
			// call function once loader has completed
		},
		onstart: function() {
			// call function once loader has started	
		}
	});
	
	/// Add a new message to the queue.
	var loaderId = loader.add({
		message: "test",
		getProgress: function() { // sends progress to loader.js
			return progress; // value between 1-100
		}
	});
	
	/// Remove a specific loader message.
	loader.remove(loaderId); 
	
	/// Recenter the loader within container (run onresize)
	loader.center(); 
	
	/// Stop all loader instances.
	loader.stop(); 
*/

if (typeof (widgets) === "undefined") var widgets = {};

(function() { "use strict";

var PI = Math.PI;
var noCanvas = !document.createElement("canvas").getContext;
var fadeOutSpeed = 400;
var defaultConfig = {
	id: "loader",
	bars: 12,
	radius: 0,
	lineWidth: 20,
	lineHeight: 70,
	timeout: 0,
	display: true
};

widgets.Loader = function (configure) {
	if (noCanvas) return;
	var that = this;
	if (typeof (configure) === "string") configure = { message: configure };
	if (typeof (configure) === "boolean") configure = { display: false };
	if (typeof (configure) === "undefined") configure = {};
	configure.container = configure.container || document.body;
	if (!configure.container) return;

	/// Mixin the default configurations.
	for (var key in defaultConfig) {
		if (typeof (configure[key]) === "undefined") {
			configure[key] = defaultConfig[key];
		}
	}

	/// Setup element
	var canvas = document.getElementById(configure.id);
	if (!canvas) {
		var div = document.createElement("div");
		var span = document.createElement("span");
		span.className = "message";
		div.appendChild(span);
		div.className = defaultConfig.id;
		div.style.cssText = transitionCSS("opacity", fadeOutSpeed);
		this.span = span;
		this.div = div;
		var canvas = document.createElement("canvas");
		document.body.appendChild(canvas);
		canvas.id = configure.id;
		canvas.style.cssText = "opacity: 1; position: absolute; z-index: 10000;";
		div.appendChild(canvas);
		configure.container.appendChild(div);
	} else {
		this.span = canvas.parentNode.getElementsByTagName("span")[0];
	}

	/// Configure
	var delay = configure.delay;
	var bars = configure.bars;
	var radius = configure.radius;
	var max = configure.lineHeight + 20;
	var size = max * 2 + configure.radius * 2;
	var windowSize = getWindowSize(configure.container);
	var width = windowSize.width - size;
	var height = windowSize.height - size;
	var deviceRatio = window.devicePixelRatio || 1;
	///
	canvas.width = size * deviceRatio;
	canvas.height = size  * deviceRatio;
	///
	var iteration = 0;
	var ctx = canvas.getContext("2d");
	ctx.globalCompositeOperation = "lighter";
	ctx.shadowOffsetX = 1;
	ctx.shadowOffsetY = 1;
	ctx.shadowBlur = 1;
	ctx.shadowColor = "rgba(0, 0, 0, 0.5)";

	/// Public functions.
	this.messages = {};
	this.message = function (message, onstart) {
		if (!this.interval) return this.start(onstart, message);
		return this.add({
			message: message, 
			onstart: onstart
		});
	};
	
	this.update = function(id, message, percent) {
		if (!id) for (var id in this.messages);
		var item = this.messages[id];
		item.message = message;
		if (typeof(percent) === "number") item.span.innerHTML = percent + "%";
		if (message.substr(-3) === "...") { // animated dots
			item._message = message.substr(0, message.length - 3);
			item.messageAnimate = [".&nbsp;&nbsp;", "..&nbsp;", "..."].reverse();
		} else { // normal
			item._message = message;
			item.messageAnimate = false;
		}
		///
		item.element.innerHTML = message;
	};
	
	this.add = function (conf) {
		if (typeof(conf) === "string") conf = { message: conf };
		var background = configure.background ? configure.background : "rgba(0,0,0,0.65)";
		this.span.style.cssText = "background: " + background + ";";
		this.div.style.cssText = transitionCSS("opacity", fadeOutSpeed);
		if (this.stopPropagation) {
			this.div.style.cssText += "background: rgba(0,0,0,0.25);";
		} else {
			this.div.style.cssText += "pointer-events: none;";
		}
		///
		canvas.parentNode.style.opacity = 1;
		canvas.parentNode.style.display = "block";
		if (configure.background) this.div.style.background = configure.backgrond;
		///
		var timestamp = (new Date()).getTime();
		var seed = Math.abs(timestamp * Math.random() >> 0);
		var message = conf.message;
		///
		var container = document.createElement("div");
		container.style.cssText = transitionCSS("opacity", 500);
		var span = document.createElement("span");
		span.style.cssText = "float: right; width: 50px;";
		var node = document.createElement("span");
		node.innerHTML = message;
		///
		container.appendChild(node);
		container.appendChild(span);
		///
		var item = this.messages[seed] = {
			seed: seed,
			container: container,
			element: node,
			span: span,
			message: message,
			timeout: (conf.timeout || configure.timeout) * 1000,
			timestamp: timestamp,
			getProgress: conf.getProgress
		};
		this.span.appendChild(container);
		this.span.style.display = "block";
		this.update(item.seed, message);
		/// Escape event loop.
		if (conf.onstart) {
			window.setTimeout(conf.onstart, 50);
		}
		///
		this.center();
		///
		if (!this.interval) {
			if (!conf.delay) renderAnimation();
			window.clearInterval(this.interval);
			this.interval = window.setInterval(renderAnimation, 30);
		}
		/// Return identifier.
		return seed;
	};
	
	this.remove = function (seed) {
		iteration += 0.07;
		var timestamp = (new Date()).getTime();
		if (typeof(seed) === "object") seed = seed.join(":");
		if (seed) seed = ":" + seed + ":";
		/// Remove element.
		for (var key in this.messages) {
			var item = this.messages[key];
			if (!seed || seed.indexOf(":" + item.seed + ":") !== -1) {
				delete this.messages[item.seed];
				item.container.style.color = "#99ff88";
				removeChild(item);
				if (item.getProgress) item.span.innerHTML = "100%";
			}
		}
	};
	
	this.start = function (onstart, message) {
		if (!(message || configure.message)) return;
		return this.add({
			message: message || configure.message, 
			onstart: onstart
		});
	};
	
	this.stop = function () {
		this.remove();
		window.clearInterval(this.interval);
		delete this.interval;
		if (configure.oncomplete) configure.oncomplete();
		if (canvas && canvas.style) {
			div.style.cssText += "pointer-events: none;";
			window.setTimeout(function() {
				that.div.style.opacity = 0;
			}, 1);
			window.setTimeout(function () {
				if (that.interval) return;
				that.stopPropagation = false;
				canvas.parentNode.style.display = "none";
				ctx.clearRect(0, 0, size, size);
			}, fadeOutSpeed * 1000);
		}
	};

	this.center = function() {
		var windowSize = getWindowSize(configure.container);
		var width = windowSize.width - size;
		var height = windowSize.height - size;
		/// Center the animation within the content.
		canvas.style.left = (width / 2) + "px";
		canvas.style.top = (height / 2) + "px";
		canvas.style.width = (size) + "px";
		canvas.style.height = (size) + "px";
		that.span.style.top = (height / 2 + size - 10) + "px";
	};

	var style = document.createElement("style");
	style.innerHTML = '\
.loader { color: #fff; position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 100000; opacity: 0; display: none; }\
.loader span.message { line-height: 1.5em; font-family: monospace; font-size: 14px; margin: auto; opacity: 1; display: none; border-radius: 10px; padding: 0px; width: 300px; text-align: center; position: absolute; z-index: 10000; left: 0; right: 0; }\
.loader span.message div { border-bottom: 1px solid #222; padding: 5px 10px; clear: both; text-align: left; opacity: 1; }\
.loader span.message div:last-child { border-bottom: none; }\
';
	document.head.appendChild(style);
	/// Private functions.
	var removeChild = function(item) {
		window.setTimeout(function() { // timeout in case within same event loop.
			item.container.style.opacity = 0;
		}, 1);
		window.setTimeout(function() { // wait for opacity=0 before removing the element.
			item.container.parentNode.removeChild(item.container);
		}, 250);
	};
	var renderAnimation = function () {
		var timestamp = (new Date()).getTime();
		for (var key in that.messages) {
			var item = that.messages[key];
			var nid = iteration / 0.07 >> 0;
			if (nid % 5 === 0 && item.getProgress) {
				if (item.timeout && item.timestamp && timestamp - item.timestamp > item.timeout) {
					that.remove(item.seed);
					continue;
				}
				var progress = item.getProgress();
				if (progress >= 100) {
					that.remove(item.seed);
					continue;
				}
				item.span.innerHTML = (progress >> 0) + "%";
			}
			if (nid % 10 === 0) {
				if (item.messageAnimate) {
						var length = item.messageAnimate.length;
						var n = nid / 10 % length;
						var text = item._message + item.messageAnimate[n];
						item.element.innerHTML = text;
				}
			}
		}
		if (!key) {
			that.stop();
		}
		//
		ctx.save();
		ctx.clearRect(0, 0, size * deviceRatio, size * deviceRatio);
		ctx.scale(deviceRatio, deviceRatio);
		ctx.translate(size / 2, size / 2);
		var hues = 360 - 360 / bars;
		for (var i = 0; i < bars; i++) {
			var angle = (i / bars * 2 * PI) + iteration;
			ctx.save();
			ctx.translate(radius * Math.sin(-angle), radius * Math.cos(-angle));
			ctx.rotate(angle);
			// round-rect properties
			var x = -configure.lineWidth / 2;
			var y = 0;
			var width = configure.lineWidth;
			var height = configure.lineHeight;
			var curve = width / 2;
			// round-rect path
			ctx.beginPath();
			ctx.moveTo(x + curve, y);
			ctx.lineTo(x + width - curve, y);
			ctx.quadraticCurveTo(x + width, y, x + width, y + curve);
			ctx.lineTo(x + width, y + height - curve);
			ctx.quadraticCurveTo(x + width, y + height, x + width - curve, y + height);
			ctx.lineTo(x + curve, y + height);
			ctx.quadraticCurveTo(x, y + height, x, y + height - curve);
			ctx.lineTo(x, y + curve);
			ctx.quadraticCurveTo(x, y, x + curve, y);
			// round-rect fill
			var hue = ((i / (bars - 1)) * hues);
			ctx.fillStyle = "hsla(" + hue + ", 100%, 50%, 0.85)";
			ctx.fill();
			ctx.restore();
		}
		ctx.restore();
		iteration += 0.07;
	};
	//
	if (configure.display === false) return this;
	//
	this.start();
	//
	return this;
};

////

var transitionCSS = function(type, ms) {
	return '\
		-webkit-transition-property: '+type+';\
		-webkit-transition-duration: '+ms+'ms;\
		-moz-transition-property: '+type+';\
		-moz-transition-duration: '+ms+'ms;\
		-o-transition-property: '+type+';\
		-o-transition-duration: '+ms+'ms;\
		-ms-transition-property: '+type+';\
		-ms-transition-duration: '+ms+'ms;';
};

var getWindowSize = function (element) {
	if (window.innerWidth && window.innerHeight) {
		var width = window.innerWidth;
		var height = window.innerHeight;
	} else if (document.compatMode === "CSS1Compat" && document.documentElement && document.documentElement.offsetWidth) {
		var width = document.documentElement.offsetWidth;
		var height = document.documentElement.offsetHeight;
	} else if (document.body && document.body.offsetWidth) {
		var width = document.body.offsetWidth;
		var height = document.body.offsetHeight;
	}
	if (element) {
		var width = element.offsetWidth;
	}
	return {
		width: width,
		height: height
	};
};

})();
/*
	----------------------------------------------------
	DOMLoader.script.js : 0.1.2 : 2012/09/08 : http://mudcu.be
	----------------------------------------------------
	Copyright 2011-2012 Mudcube. All rights reserved.
	----------------------------------------------------
	/// No verification
	DOMLoader.script.add("../js/jszip/jszip.js");
	/// Strict loading order and verification.
	DOMLoader.script.add({
		strictOrder: true,
		srcs: [
			{
				src: "../js/jszip/jszip.js",
				verify: "JSZip",
				callback: function() {
					console.log(1)
				}
			},
			{ 
				src: "../inc/downloadify/js/swfobject.js",
				verify: "swfobject",
				callback: function() {
					console.log(2)
				}
			}
		],
		callback: function() {
			console.log(3)
		}
	});
	/// Just verification.
	DOMLoader.script.add({
		src: "../js/jszip/jszip.js",
		verify: "JSZip",
		callback: function() {
			console.log(1)
		}
	});
*/

if (typeof(DOMLoader) === "undefined") var DOMLoader = {};

(function() { "use strict";

DOMLoader.script = function() {
	this.loaded = {};
	this.loading = {};
	return this;
};

DOMLoader.script.prototype.add = function(config) {
	var that = this;
	if (typeof(config) === "string") {
		config = { src: config };
	}
	var srcs = config.srcs;
	if (typeof(srcs) === "undefined") {
		srcs = [{ 
			src: config.src, 
			verify: config.verify
		}];
	}
	/// adding the elements to the head
	var doc = document.getElementsByTagName("head")[0];
	/// 
	var testElement = function(element, test) {
		if (that.loaded[element.src]) return;
		if (test && typeof(window[test]) === "undefined") return;
		that.loaded[element.src] = true;
		//
		if (that.loading[element.src]) that.loading[element.src]();
		delete that.loading[element.src];
		//
		if (element.callback) element.callback();
		if (typeof(getNext) !== "undefined") getNext();
	};
	///
	var batchTest = [];
	var addElement = function(element) {
		if (typeof(element) === "string") {
			element = {
				src: element,
				verify: config.verify
			};
		}
		if (/([\w\d.])$/.test(element.verify)) { // check whether its a variable reference
			element.test = element.verify;
			if (typeof(element.test) === "object") {
				for (var key in element.test) {
					batchTest.push(element.test[key]);
				}			
			} else {
				batchTest.push(element.test);
			}
		}
		if (that.loaded[element.src]) return;
		var script = document.createElement("script");
		script.onreadystatechange = function() {
			if (this.readyState !== "loaded" && this.readyState !== "complete") return;
			testElement(element);
		};
		script.onload = function() {
			testElement(element);
		};
		script.onerror = function() {

		};
		script.setAttribute("type", "text/javascript");
		script.setAttribute("src", element.src);
		doc.appendChild(script);
		that.loading[element.src] = function() {};
	};
	/// checking to see whether everything loaded properly
	var onLoad = function(element) {
		if (element) {
			testElement(element, element.test);
		} else {
			for (var n = 0; n < srcs.length; n ++) {
				testElement(srcs[n], srcs[n].test);
			}
		}
		var istrue = true;
		for (var n = 0; n < batchTest.length; n ++) {
			var test = batchTest[n];
			if (test && test.indexOf(".") !== -1) {
				test = test.split(".");
				var level0 = window[test[0]];
				if (typeof(level0) === "undefined") continue;
				if (test.length === 2) { //- this is a bit messy and could handle more cases
					if (typeof(level0[test[1]]) === "undefined") {
						istrue = false;
					}
				} else if (test.length === 3) {
					if (typeof(level0[test[1]][test[2]]) === "undefined") {
						istrue = false;
					}
				}
			} else {
				if (typeof(window[test]) === "undefined") {
					istrue = false;
				}
			}
		}
		if (!config.strictOrder && istrue) { // finished loading all the requested scripts
			if (config.callback) config.callback();
		} else { // keep calling back the function
			setTimeout(function() { //- should get slower over time?
				onLoad(element);
			}, 10);
		}
	};
	/// loading methods;  strict ordering or loose ordering
	if (config.strictOrder) {
		var ID = -1;
		var getNext = function() {
			ID ++;
			if (!srcs[ID]) { // all elements are loaded
				if (config.callback) config.callback();
			} else { // loading new script
				var element = srcs[ID];
				var src = element.src;
				if (that.loading[src]) { // already loading from another call (attach to event)
					that.loading[src] = function() {
						if (element.callback) element.callback();
						getNext();
					}
				} else if (!that.loaded[src]) { // create script element
					addElement(element);
					onLoad(element);
				} else { // it's already been successfully loaded
					getNext();
				}
			}
		};
		getNext();
	} else { // loose ordering
		for (var ID = 0; ID < srcs.length; ID ++) {
			addElement(srcs[ID]);
		}
		onLoad();
	}
};

DOMLoader.script = (new DOMLoader.script());

})();
/*

	DOMLoader.XMLHttp
	--------------------------
	DOMLoader.sendRequest({
		url: "./dir/something.extension",
		data: "test!",
		onerror: function(event) {
			console.log(event);
		},
		onload: function(response) {
			console.log(response.responseText);
		}, 
		onprogress: function (event) {
			var percent = event.loaded / event.total * 100 >> 0;
			loader.message("loading: " + percent + "%");
		}
	});
	
*/

if (typeof(DOMLoader) === "undefined") var DOMLoader = {};

// Add XMLHttpRequest when not available

if (typeof (XMLHttpRequest) === "undefined") {
	var XMLHttpRequest;
	(function () { // find equivalent for IE
		var factories = [
		function () {
			return new ActiveXObject("Msxml2.XMLHTTP")
		}, function () {
			return new ActiveXObject("Msxml3.XMLHTTP")
		}, function () {
			return new ActiveXObject("Microsoft.XMLHTTP")
		}];
		for (var i = 0; i < factories.length; i++) {
			try {
				factories[i]();
			} catch (e) {
				continue;
			}
			break;
		}
		XMLHttpRequest = factories[i];
	})();
}

if (typeof ((new XMLHttpRequest()).responseText) === "undefined") {
	// http://stackoverflow.com/questions/1919972/how-do-i-access-xhr-responsebody-for-binary-data-from-javascript-in-ie
    var IEBinaryToArray_ByteStr_Script =
    "<!-- IEBinaryToArray_ByteStr -->\r\n"+
    "<script type='text/vbscript'>\r\n"+
    "Function IEBinaryToArray_ByteStr(Binary)\r\n"+
    "   IEBinaryToArray_ByteStr = CStr(Binary)\r\n"+
    "End Function\r\n"+
    "Function IEBinaryToArray_ByteStr_Last(Binary)\r\n"+
    "   Dim lastIndex\r\n"+
    "   lastIndex = LenB(Binary)\r\n"+
    "   if lastIndex mod 2 Then\r\n"+
    "       IEBinaryToArray_ByteStr_Last = Chr( AscB( MidB( Binary, lastIndex, 1 ) ) )\r\n"+
    "   Else\r\n"+
    "       IEBinaryToArray_ByteStr_Last = "+'""'+"\r\n"+
    "   End If\r\n"+
    "End Function\r\n"+
    "</script>\r\n";

	// inject VBScript
	document.write(IEBinaryToArray_ByteStr_Script);

	DOMLoader.sendRequest = function(conf) {
		// helper to convert from responseBody to a "responseText" like thing
		function getResponseText(binary) {
			var byteMapping = {};
			for (var i = 0; i < 256; i++) {
				for (var j = 0; j < 256; j++) {
					byteMapping[String.fromCharCode(i + j * 256)] = String.fromCharCode(i) + String.fromCharCode(j);
				}
			}
			// call into VBScript utility fns
			var rawBytes = IEBinaryToArray_ByteStr(binary);
			var lastChr = IEBinaryToArray_ByteStr_Last(binary);
			return rawBytes.replace(/[\s\S]/g, function (match) {
				return byteMapping[match];
			}) + lastChr;
		};
		//
		var req = XMLHttpRequest();
		req.open("GET", conf.url, true);
		if (conf.responseType) req.responseType = conf.responseType;
		if (conf.onerror) req.onerror = conf.onerror;
		if (conf.onprogress) req.onprogress = conf.onprogress;
		req.onreadystatechange = function (event) {
			if (req.readyState === 4) {
				if (req.status === 200) {
					req.responseText = getResponseText(req.responseBody);
				} else {
					req = false;
				}
				if (conf.onload) conf.onload(req);
			}
		};
		req.setRequestHeader("Accept-Charset", "x-user-defined");
		req.send(null);
		return req;
	}
} else {
	DOMLoader.sendRequest = function(conf) {
		var req = new XMLHttpRequest();
		req.open(conf.data ? "POST" : "GET", conf.url, true);
		if (req.overrideMimeType) req.overrideMimeType("text/plain; charset=x-user-defined");
		if (conf.data) req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
		if (conf.responseType) req.responseType = conf.responseType;
		if (conf.onerror) req.onerror = conf.onerror;
		if (conf.onprogress) req.onprogress = conf.onprogress;
		req.onreadystatechange = function (event) {
			if (req.readyState === 4) {
				if (req.status !== 200 && req.status != 304) {
					if (conf.onerror) conf.onerror(event, false);
					return;
				}
				if (conf.onload) {
					conf.onload(req);
				}
			}
		};
		req.send(conf.data);
		return req;
	};
}
/*
	----------------------------------------------------
	Event.js : 1.1.1 : 2012/11/19 : MIT License
	----------------------------------------------------
	https://github.com/mudcube/Event.js
	----------------------------------------------------
	1	: click, dblclick, dbltap
	1+	: tap, longpress, drag, swipe
	2+	: pinch, rotate
		: mousewheel, devicemotion, shake
	----------------------------------------------------
	TODO
	----------------------------------------------------
		* switch configuration to 4th argument on addEventListener
		* bbox calculation for elements scaled with transform.
	----------------------------------------------------
	NOTES
	----------------------------------------------------
	* When using other libraries that may have built in "Event" namespace,
		i.e. Typescript, you can use "eventjs" instead of "Event" for all example calls.
	----------------------------------------------------
	REQUIREMENTS: querySelector, querySelectorAll
	----------------------------------------------------
	*	There are two ways to add/remove events with this library.
	----------------------------------------------------
	// Retains "this" attribute as target, and overrides native addEventListener.
	target.addEventListener(type, listener, useCapture); 
	target.removeEventListener(type, listener, useCapture);

	// Attempts to perform as fast as possible.
	Event.add(type, listener, configure); 
	Event.remove(type, listener, configure);

	*	You can turn prototyping on/off for individual features.
	----------------------------------------------------
	Event.modifyEventListener = true; // add custom *EventListener commands to HTMLElements.
	Event.modifySelectors = true; // add bulk *EventListener commands on NodeLists from querySelectorAll and others.

	*	Example of setting up a single listener with a custom configuration.
	----------------------------------------------------
	// optional configuration.
	var configure = {
		fingers: 2, // listen for specifically two fingers.
		snap: 90 // snap to 90 degree intervals.
	};
	// adding with addEventListener()
	target.addEventListener("swipe", function(event) {
		// additional variables can be found on the event object.
		console.log(event.velocity, event.angle, event.fingers);
	}, configure);
	
	// adding with Event.add()
	Event.add("swipe", function(event, self) {
		// additional variables can be found on the self object.
		console.log(self.velocity, self.angle, self.fingers);
	}, configure);

	*	Multiple listeners glued together.
	----------------------------------------------------
	// adding with addEventListener()
	target.addEventListener("click swipe", function(event) { });

	// adding with Event.add()
	Event.add(target, "click swipe", function(event, self) { });

	*	Use query selectors to create an event (querySelectorAll)
	----------------------------------------------------
	// adding events to NodeList from querySelectorAll()
	document.querySelectorAll("#element a.link").addEventListener("click", callback);

	// adding with Event.add()
	Event.add("#element a.link", "click", callback);

	*	Listen for selector to become available (querySelector)
	----------------------------------------------------
	Event.add("body", "ready", callback);
	// or...
	Event.add({
		target: "body", 
		type: "ready", 
		timeout: 10000, // set a timeout to stop checking.
		interval: 30, // set how often to check for element.
		listener: callback
	});

	*	Multiple listeners bound to one callback w/ single configuration.
	----------------------------------------------------
	var bindings = Event.add({
		target: target,
		type: "click swipe",
		snap: 90, // snap to 90 degree intervals.
		minFingers: 2, // minimum required fingers to start event.
		maxFingers: 4, // maximum fingers in one event.
		listener: function(event, self) {
			console.log(self.gesture); // will be click or swipe.
			console.log(self.x);
			console.log(self.y);
			console.log(self.identifier);
			console.log(self.start);
			console.log(self.fingers); // somewhere between "2" and "4".
			self.pause(); // disable event.
			self.resume(); // enable event.
			self.remove(); // remove event.
		}
	});

	*	Multiple listeners bound to multiple callbacks w/ single configuration.
	----------------------------------------------------
	var bindings = Event.add({
		target: target,
		minFingers: 1,
		maxFingers: 12,
		listeners: {
			click: function(event, self) {
				self.remove(); // removes this click listener.
			},
			swipe: function(event, self) {
				binding.remove(); // removes both the click + swipe listeners.
			}
		}
	});

	*	Multiple listeners bound to multiple callbacks w/ multiple configurations.
	----------------------------------------------------
	var binding = Event.add({
		target: target,
		listeners: {
			longpress: {
				fingers: 1,
				wait: 500, // milliseconds
				listener: function(event, self) {
					console.log(self.fingers); // "1" finger.
				}
			},
			drag: {
				fingers: 3,
				position: "relative", // "relative", "absolute", "difference", "move"
				listener: function(event, self) {
					console.log(self.fingers); // "3" fingers.
					console.log(self.x); // coordinate is relative to edge of target.
				}
			}
		}
	});

	*	Capturing an event and manually forwarding it to a proxy (tiered events).
	----------------------------------------------------
	Event.add(target, "down", function(event, self) {
		var x = event.pageX; // local variables that wont change.
		var y = event.pageY;
		Event.proxy.drag({
			event: event,
			target: target,
			listener: function(event, self) {
				console.log(x - event.pageX); // measure movement.
				console.log(y - event.pageY);
			}
		});
	});
	----------------------------------------------------

	*	Event proxies.
	*	type, fingers, state, start, x, y, position, bbox
	*	rotation, scale, velocity, angle, delay, timeout
	----------------------------------------------------
	// "Click" :: fingers, minFingers, maxFingers.
	Event.add(window, "click", function(event, self) {
		console.log(self.gesture, self.x, self.y);
	});
	// "Double-Click" :: fingers, minFingers, maxFingers.
	Event.add(window, "dblclick", function(event, self) {
		console.log(self.gesture, self.x, self.y);
	});
	// "Drag" :: fingers, maxFingers, position
	Event.add(window, "drag", function(event, self) {
		console.log(self.gesture, self.fingers, self.state, self.start, self.x, self.y, self.bbox);
	});
	// "Gesture" :: fingers, minFingers, maxFingers.
	Event.add(window, "gesture", function(event, self) {
		console.log(self.gesture, self.fingers, self.state, self.rotation, self.scale);
	});
	// "Swipe" :: fingers, minFingers, maxFingers, snap, threshold.
	Event.add(window, "swipe", function(event, self) {
		console.log(self.gesture, self.fingers, self.velocity, self.angle);
	});
	// "Tap" :: fingers, minFingers, maxFingers, timeout.
	Event.add(window, "tap", function(event, self) {
		console.log(self.gesture, self.fingers);
	});
	// "Longpress" :: fingers, minFingers, maxFingers, delay.
	Event.add(window, "longpress", function(event, self) {
		console.log(self.gesture, self.fingers);
	});
	//
	Event.add(window, "shake", function(event, self) {
		console.log(self.gesture, self.acceleration, self.accelerationIncludingGravity);
	});
	//
	Event.add(window, "devicemotion", function(event, self) {
		console.log(self.gesture, self.acceleration, self.accelerationIncludingGravity);
	});
	//
	Event.add(window, "wheel", function(event, self) {
		console.log(self.gesture, self.state, self.wheelDelta);
	});

	*	Stop, prevent and cancel.
	----------------------------------------------------
	Event.stop(event); // stop bubble.
	Event.prevent(event); // prevent default.
	Event.cancel(event); // stop and prevent.

	*	Track for proper command/control-key for Mac/PC.
	----------------------------------------------------
	Event.add(window, "keyup keydown", Event.proxy.metaTracker);
	console.log(Event.proxy.metaKey);

	*	Test for event features, in this example Drag & Drop file support.
	----------------------------------------------------
	console.log(Event.supports('dragstart') && Event.supports('drop') && !!window.FileReader);

*/

if (typeof(Event) === "undefined") var Event = {};
if (typeof(eventjs) === "undefined") var eventjs = Event;

Event = (function(root) { "use strict";

// Add custom *EventListener commands to HTMLElements.
root.modifyEventListener = false;

// Add bulk *EventListener commands on NodeLists from querySelectorAll and others.
root.modifySelectors = false;

// Event maintenance.
root.add = function(target, type, listener, configure) {
	return eventManager(target, type, listener, configure, "add");
};

root.remove = function(target, type, listener, configure) {
	return eventManager(target, type, listener, configure, "remove");
};

root.stop = function(event) {
	if (event.stopPropagation) event.stopPropagation();
	event.cancelBubble = true; // <= IE8
	event.bubble = 0;
};

root.prevent = function(event) {
	if (event.preventDefault) event.preventDefault();
	event.returnValue = false; // <= IE8
};

root.cancel = function(event) {
	root.stop(event);
	root.prevent(event);
};

// Check whether event is natively supported (via @kangax)
root.supports = function (target, type) {
	if (typeof(target) === "string") {
		type = target;
		target = window;
	}
	type = "on" + type;
	if (type in target) return true;
	if (!target.setAttribute) target = document.createElement("div");
	if (target.setAttribute && target.removeAttribute) {
		target.setAttribute(type, "");
		var isSupported = typeof target[type] === "function";
		if (typeof target[type] !== "undefined") target[type] = null;
		target.removeAttribute(type);
		return isSupported;
	}
};

var clone = function (obj) {
	if (!obj || typeof (obj) !== 'object') return obj;
	var temp = new obj.constructor();
	for (var key in obj) {
		if (!obj[key] || typeof (obj[key]) !== 'object') {
			temp[key] = obj[key];
		} else { // clone sub-object
			temp[key] = clone(obj[key]);
		}
	}
	return temp;
};

/// Handle custom *EventListener commands.
var eventManager = function(target, type, listener, configure, trigger, fromOverwrite) {
	configure = configure || {};
	// Check for element to load on interval (before onload).
	if (typeof(target) === "string" && type === "ready") {
		var time = (new Date()).getTime();
		var timeout = configure.timeout;
		var ms = configure.interval || 1000 / 60;
		var interval = window.setInterval(function() {
			if ((new Date()).getTime() - time > timeout) {
				window.clearInterval(interval);
			}
			if (document.querySelector(target)) {
				window.clearInterval(interval);
				listener();
			}
		}, ms);
		return;
	}
	// Get DOM element from Query Selector.
	if (typeof(target) === "string") {
		target = document.querySelectorAll(target);
		if (target.length === 0) return createError("Missing target on listener!"); // No results.
		if (target.length === 1) { // Single target.
			target = target[0];
		}
	}
	/// Handle multiple targets.
	var event;
	var events = {};
	if (target.length > 0) { 
		for (var n0 = 0, length0 = target.length; n0 < length0; n0 ++) {
			event = eventManager(target[n0], type, listener, clone(configure), trigger);
			if (event) events[n0] = event;
		}	
		return createBatchCommands(events);
	}
	// Check for multiple events in one string.
	if (type.indexOf && type.indexOf(" ") !== -1) type = type.split(" ");
	if (type.indexOf && type.indexOf(",") !== -1) type = type.split(",");
	// Attach or remove multiple events associated with a target.
	if (typeof(type) !== "string") { // Has multiple events.
		if (typeof(type.length) === "number") { // Handle multiple listeners glued together.
			for (var n1 = 0, length1 = type.length; n1 < length1; n1 ++) { // Array [type]
				event = eventManager(target, type[n1], listener, clone(configure), trigger);
				if (event) events[type[n1]] = event;
			}
		} else { // Handle multiple listeners.
			for (var key in type) { // Object {type}
				if (typeof(type[key]) === "function") { // without configuration.
					event = eventManager(target, key, type[key], clone(configure), trigger);
				} else { // with configuration.
					event = eventManager(target, key, type[key].listener, clone(type[key]), trigger);
				}
				if (event) events[key] = event;
			}
		}
		return createBatchCommands(events);
	}
	// Ensure listener is a function.
	if (typeof(listener) !== "function") return createError("Listener is not a function!");
	// Generate a unique wrapper identifier.
	var useCapture = configure.useCapture || false;
	var id = normalize(type) + getID(target) + "." + getID(listener) + "." + (useCapture ? 1 : 0);
	// Handle the event.
	if (root.Gesture && root.Gesture._gestureHandlers[type]) { // Fire custom event.
		if (trigger === "remove") { // Remove event listener.
			if (!wrappers[id]) return; // Already removed.
			wrappers[id].remove();
			delete wrappers[id];
		} else if (trigger === "add") { // Attach event listener.
			if (wrappers[id]) return wrappers[id]; // Already attached.
			// Retains "this" orientation.
			if (configure.useCall && !root.modifyEventListener) {
				var tmp = listener;
				listener = function(event, self) {
					for (var key in self) event[key] = self[key];
					return tmp.call(target, event);
				};
			}
			// Create listener proxy.
			configure.gesture = type; 
			configure.target = target;
			configure.listener = listener;
			configure.fromOverwrite = fromOverwrite;
			// Record wrapper.
			wrappers[id] = root.proxy[type](configure); 
		}
	} else { // Fire native event.
		type = normalize(type);
		if (trigger === "remove") { // Remove event listener.
			if (!wrappers[id]) return; // Already removed.
			target[remove](type, listener, useCapture); 
			delete wrappers[id];
		} else if (trigger === "add") { // Attach event listener.
			if (wrappers[id]) return wrappers[id]; // Already attached.
			target[add](type, listener, useCapture); 
			// Record wrapper.
			wrappers[id] = { 
				type: type,
				target: target,
				listener: listener,
				remove: function() {
					root.remove(target, type, listener, configure);
				}
			};				
		}
	}
	return wrappers[id];
};

/// Perform batch actions on multiple events.
var createBatchCommands = function(events) {
	return {
		remove: function() { // Remove multiple events.
			for (var key in events) {
				events[key].remove();
			}
		},
		add: function() { // Add multiple events.
			for (var key in events) {
				events[key].add();
			}
		}
	};
};

/// Display error message in console.
var createError = function(message) {
	if (typeof(console) === "undefined") return;
	if (typeof(console.error) === "undefined") return;
	console.error(message);
};

/// Handle naming discrepancies between platforms.
var normalize = (function() {
	var translate = {};
	return function(type) {
		if (!root.pointerType) {
			if (window.navigator.msPointerEnabled) {
				root.pointerType = "mspointer";
				translate = {
					"mousedown": "MSPointerDown",
					"mousemove": "MSPointerMove",
					"mouseup": "MSPointerUp"
				};
			} else if (root.supports("touchstart")) {
				root.pointerType = "touch";
				translate = {
					"mousedown": "touchstart",
					"mouseup": "touchend",
					"mousemove": "touchmove"
				};	
			} else {
				root.pointerType = "mouse";
			}
		}	
		if (translate[type]) type = translate[type];
		if (!document.addEventListener) { // IE
			return "on" + type;
		} else {
			return type;
		}
	};
})();

/// Event wrappers to keep track of all events placed in the window.
var wrappers = {};
var counter = 0;
var getID = function(object) {
	if (object === window) return "#window";
	if (object === document) return "#document";
	if (!object) return createError("Missing target on listener!");
	if (!object.uniqueID) object.uniqueID = "id" + counter ++;
	return object.uniqueID;
};

/// Detect platforms native *EventListener command.
var add = document.addEventListener ? "addEventListener" : "attachEvent";
var remove = document.removeEventListener ? "removeEventListener" : "detachEvent";

/*
	Pointer.js
	------------------------
	Modified from; https://github.com/borismus/pointer.js
*/

root.createPointerEvent = function (event, self, preventRecord) {
	var eventName = self.gesture;
	var target = self.target;
	var pts = event.changedTouches || root.proxy.getCoords(event);
	if (pts.length) {
		var pt = pts[0];
		self.pointers = preventRecord ? [] : pts;
		self.pageX = pt.pageX;
		self.pageY = pt.pageY;
		self.x = self.pageX;
		self.y = self.pageY;
	}
	///
	var newEvent = document.createEvent("Event");
	newEvent.initEvent(eventName, true, true);
	newEvent.originalEvent = event;
	for (var k in self) newEvent[k] = self[k];
	target.dispatchEvent(newEvent);
};

/// Allows *EventListener to use custom event proxies.
if (root.modifyEventListener) (function() {
	var augmentEventListener = function(proto) {
		var recall = function(trigger) { // overwrite native *EventListener's
			var handle = trigger + "EventListener";
			var handler = proto[handle];
			proto[handle] = function (type, listener, useCapture) {
				if (root.Gesture && root.Gesture._gestureHandlers[type]) { // capture custom events.
					var configure = useCapture;
					if (typeof(useCapture) === "object") {
						configure.useCall = true;
					} else { // convert to configuration object.
						configure = {
							useCall: true,
							useCapture: useCapture
						};
					}
					eventManager(this, type, listener, configure, trigger, true);
					handler.call(this, type, listener, useCapture);
				} else { // use native function.
					handler.call(this, normalize(type), listener, useCapture);
				}
			};
		};
		recall("add");
		recall("remove");
	};
	// NOTE: overwriting HTMLElement doesn't do anything in Firefox.
	if (navigator.userAgent.match(/Firefox/)) {
		// TODO: fix Firefox for the general case.
		augmentEventListener(HTMLDivElement.prototype);
		augmentEventListener(HTMLCanvasElement.prototype);
	} else {
		augmentEventListener(HTMLElement.prototype);
	}
	augmentEventListener(document);
	augmentEventListener(window);
})();

/// Allows querySelectorAll and other NodeLists to perform *EventListener commands in bulk.
if (root.modifySelectors) (function() {
	var proto = NodeList.prototype;
	proto.removeEventListener = function(type, listener, useCapture) {
		for (var n = 0, length = this.length; n < length; n ++) {
			this[n].removeEventListener(type, listener, useCapture);
		}
	};
	proto.addEventListener = function(type, listener, useCapture) {
		for (var n = 0, length = this.length; n < length; n ++) {
			this[n].addEventListener(type, listener, useCapture);
		}
	};
})();

return root;

})(Event);
/*
	----------------------------------------------------
	Event.proxy : 0.4.2 : 2012/07/29 : MIT License
	----------------------------------------------------
	https://github.com/mudcube/Event.js
	----------------------------------------------------
	Pointer Gestures
	----------------------------------------------------
	1  : click, dblclick, dbltap
	1+ : tap, taphold, drag, swipe
	2+ : pinch, rotate
	----------------------------------------------------
	Gyroscope Gestures
	----------------------------------------------------
	* shake
	----------------------------------------------------
	Fixes issues with
	----------------------------------------------------
	* mousewheel-Firefox uses DOMMouseScroll and does not return wheelDelta. 
	* devicemotion-Fixes issue where event.acceleration is not returned.
	----------------------------------------------------
	Ideas for the future
	----------------------------------------------------
	* Keyboard, GamePad, and other input abstractions.
	* Event batching - i.e. for every x fingers down a new gesture is created.
*/

if (typeof(Event) === "undefined") var Event = {};
if (typeof(Event.proxy) === "undefined") Event.proxy = {};

Event.proxy = (function(root) { "use strict";

/*
	Create a new pointer gesture instance.
*/

root.pointerSetup = function(conf, self) {
	/// Configure.
	conf.doc = conf.target.ownerDocument || conf.target; // Associated document.
	conf.minFingers = conf.minFingers || conf.fingers || 1; // Minimum required fingers.
	conf.maxFingers = conf.maxFingers || conf.fingers || Infinity; // Maximum allowed fingers.
	conf.position = conf.position || "relative"; // Determines what coordinate system points are returned.
	/// Convenience data.
	self = self || {};
	self.gesture = conf.gesture;
	self.target = conf.target;
	self.pointerType = Event.pointerType;
	///
	if (Event.modifyEventListener && conf.fromOverwrite) conf.listener = Event.createPointerEvent;
	/// Convenience commands.
	var fingers = 0;
	var type = self.gesture.indexOf("pointer") === 0 && Event.modifyEventListener ? "pointer" : "mouse";
	self.proxy = function(listener) {
		self.defaultListener = conf.listener;
		conf.listener = listener;
		listener(conf.event, self);
	};
	self.remove = function() {
		if (conf.onPointerDown) Event.remove(conf.target, type + "down", conf.onPointerDown);
		if (conf.onPointerMove) Event.remove(conf.doc, type + "move", conf.onPointerMove);
		if (conf.onPointerUp) Event.remove(conf.doc, type + "up", conf.onPointerUp);
	};
	self.resume = function(opt) {
		if (conf.onPointerMove && (!opt || opt.move)) Event.add(conf.doc, type + "move", conf.onPointerMove);
		if (conf.onPointerUp && (!opt || opt.move)) Event.add(conf.doc, type + "up", conf.onPointerUp);
		conf.fingers = fingers;
	};
	self.pause = function(opt) {
		fingers = conf.fingers;
		if (conf.onPointerMove && (!opt || opt.move)) Event.remove(conf.doc, type + "move", conf.onPointerMove);
		if (conf.onPointerUp && (!opt || opt.up)) Event.remove(conf.doc, type + "up", conf.onPointerUp);
		conf.fingers = 0;
	};
	///
	return self;
};

/*
	Begin proxied pointer command.
*/

root.pointerStart = function(event, self, conf) {
	var addTouchStart = function(touch, sid) {	
		var bbox = conf.bbox;
		var pt = track[sid] = {};
		///
		switch(conf.position) {
			case "absolute": // Absolute from within window.
				pt.offsetX = 0;
				pt.offsetY = 0;
				break;
			case "difference": // Relative from origin.
				pt.offsetX = touch.pageX;
				pt.offsetY = touch.pageY;
				break;
			case "move": // Move target element.
				pt.offsetX = touch.pageX - bbox.x1;
				pt.offsetY = touch.pageY - bbox.y1;
				break;
			default: // Relative from within target.
				pt.offsetX = bbox.x1;
				pt.offsetY = bbox.y1;
				break;
		}
		///
		if (conf.position === "relative") {
			var x = (touch.pageX + bbox.scrollLeft - pt.offsetX) * bbox.scaleX;
			var y = (touch.pageY + bbox.scrollTop - pt.offsetY) * bbox.scaleY;
		} else {
			var x = (touch.pageX - pt.offsetX);
			var y = (touch.pageY - pt.offsetY);
		}
		///
		pt.rotation = 0;
		pt.scale = 1;
		pt.startTime = pt.moveTime = (new Date).getTime();
		pt.move = { x: x, y: y };
		pt.start = { x: x, y: y };
		///
		conf.fingers ++;
	};
	///
	conf.event = event;
	if (self.defaultListener) {
		conf.listener = self.defaultListener;
		delete self.defaultListener;
	}
	///
	var isTouchStart = !conf.fingers;
	var track = conf.tracker;
	var touches = event.changedTouches || root.getCoords(event);
	var length = touches.length;
	// Adding touch events to tracking.
	for (var i = 0; i < length; i ++) {
		var touch = touches[i];
		var sid = touch.identifier || Infinity; // Touch ID.
		// Track the current state of the touches.
		if (conf.fingers) {
			if (conf.fingers >= conf.maxFingers) {
				var ids = [];
				for (var sid in conf.tracker) ids.push(sid);
				self.identifier = ids.join(",");
				return isTouchStart;
			}
			var fingers = 0; // Finger ID.
			for (var rid in track) {
				// Replace removed finger.
				if (track[rid].up) {
					delete track[rid];
					addTouchStart(touch, sid);
					conf.cancel = true;
					break;
				}
				fingers ++;
			}
			// Add additional finger.
			if (track[sid]) continue;
			addTouchStart(touch, sid);
		} else { // Start tracking fingers.
			track = conf.tracker = {};
			self.bbox = conf.bbox = root.getBoundingBox(conf.target);
			conf.fingers = 0;
			conf.cancel = false;
			addTouchStart(touch, sid);
		}
	}
	///
	var ids = [];
	for (var sid in conf.tracker) ids.push(sid);
	self.identifier = ids.join(",");
	///
	return isTouchStart;
};

/*
	End proxied pointer command.
*/

root.pointerEnd = function(event, self, conf, onPointerUp) {
	// Record changed touches have ended (iOS changedTouches is not reliable).
	var touches = event.touches || [];
	var length = touches.length;
	var exists = {};
	for (var i = 0; i < length; i ++) {
		var touch = touches[i];
		exists[touch.identifier || Infinity] = true;
	}
	for (var key in conf.tracker) {
		var track = conf.tracker[key];
		if (!exists[key] && !track.up) {
			if (onPointerUp) { // add changedTouches to mouse.
				event.changedTouches = [{
					pageX: track.pageX,
					pageY: track.pageY,
					identifier: key === "Infinity" ? Infinity : key 
				}];
				onPointerUp(event, "up");
			}
			conf.tracker[key].up = true;
			conf.fingers --;
		}
	}
/*
	// This should work but fails in Safari on iOS4 so not using it.
	var touches = event.changedTouches || root.getCoords(event);
	var length = touches.length;
	// Record changed touches have ended (this should work).
	for (var i = 0; i < length; i ++) {
		var touch = touches[i];
		var sid = touch.identifier || Infinity;
		if (conf.tracker[sid]) {
			conf.tracker[sid].up = true;
			conf.fingers --;
		}
	}
*/
	// Wait for all fingers to be released.
	if (conf.fingers !== 0) return false;
	// Record total number of fingers gesture used.
	var ids = [];
	conf.gestureFingers = 0;
	for (var sid in conf.tracker) {
		conf.gestureFingers ++;
		ids.push(sid);
	}
	self.identifier = ids.join(",");
	// Our pointer gesture has ended.
	return true;
};

/*
	Returns mouse coords in an array to match event.*Touches
	------------------------------------------------------------
	var touch = event.changedTouches || root.getCoords(event);
*/

root.getCoords = function(event) {
	if (typeof(event.pageX) !== "undefined") { // Desktop browsers.
		root.getCoords = function(event) {
			return Array({
				type: "mouse",
				x: event.pageX,
				y: event.pageY,
				pageX: event.pageX,
				pageY: event.pageY,
				identifier: Infinity
			});
		};
	} else { // Internet Explorer <= 8.0
		root.getCoords = function(event) {
			event = event || window.event;
			return Array({
				type: "mouse",
				x: event.clientX + document.documentElement.scrollLeft,
				y: event.clientY + document.documentElement.scrollTop,
				pageX: event.clientX + document.documentElement.scrollLeft,
				pageY: event.clientY + document.documentElement.scrollTop,
				identifier: Infinity
			});
		};
	}
	return root.getCoords(event);
};

/*
	Returns single coords in an object.
	------------------------------------------------------------
	var mouse = root.getCoord(event);
*/

root.getCoord = function(event) {
	if ("ontouchstart" in window) { // Mobile browsers.
		var pX = 0;
		var pY = 0;
		root.getCoord = function(event) {
			var touches = event.changedTouches;
			if (touches.length) { // ontouchstart + ontouchmove
				return {
					x: pX = touches[0].pageX,
					y: pY = touches[0].pageY
				};
			} else { // ontouchend
				return {
					x: pX,
					y: pY
				};
			}
		};
	} else if(typeof(event.pageX) !== "undefined" && typeof(event.pageY) !== "undefined") { // Desktop browsers.
		root.getCoord = function(event) {
			return {
				x: event.pageX,
				y: event.pageY
			};
		};
	} else { // Internet Explorer <=8.0
		root.getCoord = function(event) {
			event = event || window.event;
			return {
				x: event.clientX + document.documentElement.scrollLeft,
				y: event.clientY + document.documentElement.scrollTop
			};
		};
	}
	return root.getCoord(event);
};

/*
	Get target scale and position in space.	
*/

root.getBoundingBox = function(o) { 
	if (o === window || o === document) o = document.body;
	///
	var bbox = {
		x1: 0,
		y1: 0,
		x2: 0,
		y2: 0,
		scrollLeft: 0,
		scrollTop: 0
	};
	///
	if (o === document.body) {
		bbox.height = window.innerHeight;
		bbox.width = window.innerWidth;
	} else {
		bbox.height = o.offsetHeight;
		bbox.width = o.offsetWidth;
	}
	/// Get the scale of the element.
	bbox.scaleX = o.width / bbox.width || 1;
	bbox.scaleY = o.height / bbox.height || 1;
	/// Get the offset of element.
	var tmp = o;
	while (tmp !== null) {
		bbox.x1 += tmp.offsetLeft; 
		bbox.y1 += tmp.offsetTop; 
		tmp = tmp.offsetParent;
	};
	/// Get the scroll of container element.
	var tmp = o.parentNode;
	while (tmp !== null) {
		if (tmp === document.body) break;
		if (tmp.scrollTop === undefined) break;
		bbox.scrollLeft += tmp.scrollLeft;
		bbox.scrollTop += tmp.scrollTop;
		tmp = tmp.parentNode;
	};
	/// Record the extent of box.
	bbox.x2 = bbox.x1 + bbox.width;
	bbox.y2 = bbox.y1 + bbox.height;
	///
	return bbox;
};

/*
	Keep track of metaKey, the proper ctrlKey for users platform.
*/

(function() {
	var agent = navigator.userAgent.toLowerCase();
	var mac = agent.indexOf("macintosh") !== -1;
	if (mac && agent.indexOf("khtml") !== -1) { // chrome, safari.
		var watch = { 91: true, 93: true };
	} else if (mac && agent.indexOf("firefox") !== -1) {  // mac firefox.
		var watch = { 224: true };
	} else { // windows, linux, or mac opera.
		var watch = { 17: true };
	}
	root.isMetaKey = function(event) {
		return !!watch[event.keyCode];
	};
	root.metaTracker = function(event) {
		if (watch[event.keyCode]) {
			root.metaKey = event.type === "keydown";
		}
	};
})();

return root;

})(Event.proxy);
/*
	"Click" event proxy.
	----------------------------------------------------
	Event.add(window, "click", function(event, self) {});
*/

if (typeof(Event) === "undefined") var Event = {};
if (typeof(Event.proxy) === "undefined") Event.proxy = {};

Event.proxy = (function(root) { "use strict";

root.click = function(conf) {
	conf.maxFingers = conf.maxFingers || conf.fingers || 1;
	// Setting up local variables.
	var EVENT;
	// Tracking the events.
	conf.onPointerDown = function (event) {
		if (root.pointerStart(event, self, conf)) {
			Event.add(conf.doc, "mousemove", conf.onPointerMove).listener(event);
			Event.add(conf.doc, "mouseup", conf.onPointerUp);
		}
	};
	conf.onPointerMove = function (event) {
		EVENT = event;
	};
	conf.onPointerUp = function(event) {
		if (root.pointerEnd(event, self, conf)) {
			Event.remove(conf.doc, "mousemove", conf.onPointerMove);
			Event.remove(conf.doc, "mouseup", conf.onPointerUp);
			if (EVENT.cancelBubble && ++ EVENT.bubble > 1) return;
			var pointers = EVENT.changedTouches || root.getCoords(EVENT);
			var pointer = pointers[0];
			var bbox = conf.bbox;
			var newbbox = root.getBoundingBox(conf.target);
			if (conf.position === "relative") {
				var ax = (pointer.pageX + bbox.scrollLeft - bbox.x1) * bbox.scaleX;
				var ay = (pointer.pageY + bbox.scrollTop - bbox.y1) * bbox.scaleY;
			} else {
				var ax = (pointer.pageX - bbox.x1);
				var ay = (pointer.pageY - bbox.y1);
			}
			if (ax > 0 && ax < bbox.width && // Within target coordinates.
				ay > 0 && ay < bbox.height &&
				bbox.scrollTop === newbbox.scrollTop) {
				conf.listener(EVENT, self);
			}
		}
	};
	// Generate maintenance commands, and other configurations.
	var self = root.pointerSetup(conf);
	self.state = "click";
	// Attach events.
	Event.add(conf.target, "mousedown", conf.onPointerDown);
	// Return this object.
	return self;
};

Event.Gesture = Event.Gesture || {};
Event.Gesture._gestureHandlers = Event.Gesture._gestureHandlers || {};
Event.Gesture._gestureHandlers.click = root.click;

return root;

})(Event.proxy);
/*
	"Double-Click" aka "Double-Tap" event proxy.
	----------------------------------------------------
	Event.add(window, "dblclick", function(event, self) {});
	----------------------------------------------------
	Touch an target twice for <= 700ms, with less than 25 pixel drift.
*/

if (typeof(Event) === "undefined") var Event = {};
if (typeof(Event.proxy) === "undefined") Event.proxy = {};

Event.proxy = (function(root) { "use strict";

root.dbltap =
root.dblclick = function(conf) {
	conf.maxFingers = conf.maxFingers || conf.fingers || 1;
	// Setting up local variables.
	var delay = 700; // in milliseconds
	var time0, time1, timeout; 
	var pointer0, pointer1;
	// Tracking the events.
	conf.onPointerDown = function (event) {
		var pointers = event.changedTouches || root.getCoords(event);
		if (time0 && !time1) { // Click #2
			pointer1 = pointers[0];
			time1 = (new Date).getTime() - time0;
		} else { // Click #1
			pointer0 = pointers[0];
			time0 = (new Date).getTime();
			time1 = 0;
			clearTimeout(timeout);
			timeout = setTimeout(function() {
				time0 = 0;
			}, delay);
		}
		if (root.pointerStart(event, self, conf)) {
			Event.add(conf.doc, "mousemove", conf.onPointerMove).listener(event);
			Event.add(conf.doc, "mouseup", conf.onPointerUp);
		}
	};
	conf.onPointerMove = function (event) {
		if (time0 && !time1) {
			var pointers = event.changedTouches || root.getCoords(event);
			pointer1 = pointers[0];
		}
		var bbox = conf.bbox;
		if (conf.position === "relative") {
			var ax = (pointer1.pageX + bbox.scrollLeft - bbox.x1) * bbox.scaleX;
			var ay = (pointer1.pageY + bbox.scrollTop - bbox.y1) * bbox.scaleY;
		} else {
			var ax = (pointer1.pageX - bbox.x1);
			var ay = (pointer1.pageY - bbox.y1);
		}
		if (!(ax > 0 && ax < bbox.width && // Within target coordinates..
			  ay > 0 && ay < bbox.height &&
			  Math.abs(pointer1.pageX - pointer0.pageX) <= 25 && // Within drift deviance.
			  Math.abs(pointer1.pageY - pointer0.pageY) <= 25)) {
			// Cancel out this listener.
			Event.remove(conf.doc, "mousemove", conf.onPointerMove);
			clearTimeout(timeout);
			time0 = time1 = 0;
		}
	};
	conf.onPointerUp = function(event) {
		if (root.pointerEnd(event, self, conf)) {
			Event.remove(conf.doc, "mousemove", conf.onPointerMove);
			Event.remove(conf.doc, "mouseup", conf.onPointerUp);
		}
		if (time0 && time1) {
			if (time1 <= delay && !(event.cancelBubble && ++event.bubble > 1)) {
				self.state = conf.gesture;
				conf.listener(event, self);
			}
			clearTimeout(timeout);
			time0 = time1 = 0;
		}
	};
	// Generate maintenance commands, and other configurations.
	var self = root.pointerSetup(conf);
	self.state = "dblclick";
	// Attach events.
	Event.add(conf.target, "mousedown", conf.onPointerDown);
	// Return this object.
	return self;
};

Event.Gesture = Event.Gesture || {};
Event.Gesture._gestureHandlers = Event.Gesture._gestureHandlers || {};
Event.Gesture._gestureHandlers.dbltap = root.dbltap;
Event.Gesture._gestureHandlers.dblclick = root.dblclick;

return root;

})(Event.proxy);
/*
	"Drag" event proxy (1+ fingers).
	----------------------------------------------------
	CONFIGURE: maxFingers, position.
	----------------------------------------------------
	Event.add(window, "drag", function(event, self) {
		console.log(self.gesture, self.state, self.start, self.x, self.y, self.bbox);
	});
*/

if (typeof(Event) === "undefined") var Event = {};
if (typeof(Event.proxy) === "undefined") Event.proxy = {};

Event.proxy = (function(root) { "use strict";

root.dragElement = function(that, event) {
	root.drag({
		event: event,
		target: that,
		position: "move",
		listener: function(event, self) {
			that.style.left = self.x + "px";
			that.style.top = self.y + "px";
		}
	});
};

root.drag = function(conf) {
	conf.gesture = "drag";
	conf.onPointerDown = function (event) {
		if (root.pointerStart(event, self, conf)) {
			Event.add(conf.doc, "mousemove", conf.onPointerMove);
			Event.add(conf.doc, "mouseup", conf.onPointerUp);
		}
		// Process event listener.
		conf.onPointerMove(event, "down");
	};
	conf.onPointerMove = function (event, state) {
		var bbox = conf.bbox;
		var touches = event.changedTouches || root.getCoords(event);
		var length = touches.length;
		for (var i = 0; i < length; i ++) {
			var touch = touches[i];
			var identifier = touch.identifier || Infinity;
			var pt = conf.tracker[identifier];
			// Identifier defined outside of listener.
			if (!pt) continue;
			pt.pageX = touch.pageX;
			pt.pageY = touch.pageY;
			// Record data.
			self.state = state || "move";
			self.identifier = identifier;
			self.start = pt.start;
			self.fingers = 1; // TODO(mud): option to track as single set, or individually.
			if (conf.position === "relative") {
				self.x = (pt.pageX + bbox.scrollLeft - pt.offsetX) * bbox.scaleX;
				self.y = (pt.pageY + bbox.scrollTop - pt.offsetY) * bbox.scaleY;
			} else {
				self.x = (pt.pageX - pt.offsetX);
				self.y = (pt.pageY - pt.offsetY);
			}
			///
			conf.listener(event, self);
		}
	};
	conf.onPointerUp = function(event) {
		// Remove tracking for touch.
		if (root.pointerEnd(event, self, conf, conf.onPointerMove)) {
			Event.remove(conf.doc, "mousemove", conf.onPointerMove);
			Event.remove(conf.doc, "mouseup", conf.onPointerUp);
		}
	};
	// Generate maintenance commands, and other configurations.
	var self = root.pointerSetup(conf);
	// Attach events.
	if (conf.event) {
		conf.onPointerDown(conf.event);
	} else {
		Event.add(conf.target, "mousedown", conf.onPointerDown);
	}
	// Return this object.
	return self;
};

Event.Gesture = Event.Gesture || {};
Event.Gesture._gestureHandlers = Event.Gesture._gestureHandlers || {};
Event.Gesture._gestureHandlers.drag = root.drag;

return root;

})(Event.proxy);
/*
	"Gesture" event proxy (2+ fingers).
	----------------------------------------------------
	CONFIGURE: minFingers, maxFingers.
	----------------------------------------------------
	Event.add(window, "gesture", function(event, self) {
		console.log(self.rotation, self.scale, self.fingers, self.state);
	});
*/

if (typeof(Event) === "undefined") var Event = {};
if (typeof(Event.proxy) === "undefined") Event.proxy = {};

Event.proxy = (function(root) { "use strict";

var RAD_DEG = Math.PI / 180;

root.gesture = function(conf) {
	conf.minFingers = conf.minFingers || conf.fingers || 2;
	// Tracking the events.
	conf.onPointerDown = function (event) {
		var fingers = conf.fingers;
		if (root.pointerStart(event, self, conf)) {
			Event.add(conf.doc, "mousemove", conf.onPointerMove);
			Event.add(conf.doc, "mouseup", conf.onPointerUp);
		}
		// Record gesture start.
		if (conf.fingers === conf.minFingers && fingers !== conf.fingers) {
			self.fingers = conf.minFingers;
			self.scale = 1;
			self.rotation = 0;
			self.state = "start";
			var sids = ""; //- FIXME(mud): can generate duplicate IDs.
			for (var key in conf.tracker) sids += key;
			self.identifier = parseInt(sids);
			conf.listener(event, self);
		}
	};
	///
	conf.onPointerMove = function (event, state) {
		var bbox = conf.bbox;
		var points = conf.tracker;
		var touches = event.changedTouches || root.getCoords(event);
		var length = touches.length;
		// Update tracker coordinates.
		for (var i = 0; i < length; i ++) {
			var touch = touches[i];
			var sid = touch.identifier || Infinity;
			var pt = points[sid];
			// Check whether "pt" is used by another gesture.
			if (!pt) continue; 
			// Find the actual coordinates.
			if (conf.position === "relative") {
				pt.move.x = (touch.pageX + bbox.scrollLeft - bbox.x1) * bbox.scaleX;
				pt.move.y = (touch.pageY + bbox.scrollTop - bbox.y1) * bbox.scaleY;
			} else {
				pt.move.x = (touch.pageX - bbox.x1);
				pt.move.y = (touch.pageY - bbox.y1);
			}
		}
		///
		if (conf.fingers < conf.minFingers) return;
		///
		var touches = [];
		var scale = 0;
		var rotation = 0;
		/// Calculate centroid of gesture.
		var centroidx = 0;
		var centroidy = 0;
		var length = 0;
		for (var sid in points) {
			var touch = points[sid];
			if (touch.up) continue;
			centroidx += touch.move.x;
			centroidy += touch.move.y;
			length ++;
		}
		centroidx /= length;
		centroidy /= length;
		///
		for (var sid in points) {
			var touch = points[sid];
			if (touch.up) continue;
			var start = touch.start;
			if (!start.distance) {
				var dx = start.x - centroidx;
				var dy = start.y - centroidy;
				start.distance = Math.sqrt(dx * dx + dy * dy);
				start.angle = Math.atan2(dx, dy) / RAD_DEG;
			}
			// Calculate scale.
			var dx = touch.move.x - centroidx;
			var dy = touch.move.y - centroidy;
			var distance = Math.sqrt(dx * dx + dy * dy);
			scale += distance / start.distance;
			// Calculate rotation.
			var angle = Math.atan2(dx, dy) / RAD_DEG;
			var rotate = (start.angle - angle + 360) % 360 - 180;
			touch.DEG2 = touch.DEG1; // Previous degree.
			touch.DEG1 = rotate > 0 ? rotate : -rotate; // Current degree.
			if (typeof(touch.DEG2) !== "undefined") {
				if (rotate > 0) {
					touch.rotation += touch.DEG1 - touch.DEG2;
				} else {
					touch.rotation -= touch.DEG1 - touch.DEG2;
				}
				rotation += touch.rotation;
			}
			// Attach current points to self.
			touches.push(touch.move);
		}
		///
		self.touches = touches;
		self.fingers = conf.fingers;
		self.scale = scale / conf.fingers;
		self.rotation = rotation / conf.fingers;
		self.state = "change";
		conf.listener(event, self);
	};
	conf.onPointerUp = function(event) {
		// Remove tracking for touch.
		var fingers = conf.fingers;
		if (root.pointerEnd(event, self, conf)) {
			Event.remove(conf.doc, "mousemove", conf.onPointerMove);
			Event.remove(conf.doc, "mouseup", conf.onPointerUp);
		}
		// Check whether fingers has dropped below minFingers.
		if (fingers === conf.minFingers && conf.fingers < conf.minFingers) {
			self.fingers = conf.fingers;
			self.state = "end";
			conf.listener(event, self);
		}
	};
	// Generate maintenance commands, and other configurations.
	var self = root.pointerSetup(conf);
	// Attach events.
	Event.add(conf.target, "mousedown", conf.onPointerDown);
	// Return this object.
	return self;
};

Event.Gesture = Event.Gesture || {};
Event.Gesture._gestureHandlers = Event.Gesture._gestureHandlers || {};
Event.Gesture._gestureHandlers.gesture = root.gesture;

return root;

})(Event.proxy);
/*
	"Pointer" event proxy (1+ fingers).
	----------------------------------------------------
	CONFIGURE: minFingers, maxFingers.
	----------------------------------------------------
	Event.add(window, "gesture", function(event, self) {
		console.log(self.rotation, self.scale, self.fingers, self.state);
	});
*/

if (typeof(Event) === "undefined") var Event = {};
if (typeof(Event.proxy) === "undefined") Event.proxy = {};

Event.proxy = (function(root) { "use strict";

root.pointerdown = 
root.pointermove = 
root.pointerup = function(conf) {
	if (conf.target.isPointerEmitter) return;
	// Tracking the events.
	var isDown = true;
	conf.onPointerDown = function (event) {
		isDown = false;
		self.gesture = "pointerdown";
		conf.listener(event, self);
	};
	conf.onPointerMove = function (event) {
		self.gesture = "pointermove";
		conf.listener(event, self, isDown);
	};
	conf.onPointerUp = function (event) {
		isDown = true;
		self.gesture = "pointerup";
		conf.listener(event, self, true);
	};
	// Generate maintenance commands, and other configurations.
	var self = root.pointerSetup(conf);
	// Attach events.
	Event.add(conf.target, "mousedown", conf.onPointerDown);
	Event.add(conf.target, "mousemove", conf.onPointerMove);
	Event.add(conf.doc, "mouseup", conf.onPointerUp);
	// Return this object.
	conf.target.isPointerEmitter = true;
	return self;
};

Event.Gesture = Event.Gesture || {};
Event.Gesture._gestureHandlers = Event.Gesture._gestureHandlers || {};
Event.Gesture._gestureHandlers.pointerdown = root.pointerdown;
Event.Gesture._gestureHandlers.pointermove = root.pointermove;
Event.Gesture._gestureHandlers.pointerup = root.pointerup;

return root;

})(Event.proxy);
/*
	"Device Motion" and "Shake" event proxy.
	----------------------------------------------------
	http://developer.android.com/reference/android/hardware/SensorEvent.html#values
	----------------------------------------------------
	Event.add(window, "shake", function(event, self) {});
	Event.add(window, "devicemotion", function(event, self) {
		console.log(self.acceleration, self.accelerationIncludingGravity);
	});
*/

if (typeof(Event) === "undefined") var Event = {};
if (typeof(Event.proxy) === "undefined") Event.proxy = {};

Event.proxy = (function(root) { "use strict";

root.shake = function(conf) {
	// Externally accessible data.
	var self = {
		gesture: "devicemotion",
		acceleration: {},
		accelerationIncludingGravity: {},
		target: conf.target,
		listener: conf.listener,
		remove: function() {
			window.removeEventListener('devicemotion', onDeviceMotion, false);
		}
	};
	// Setting up local variables.
	var threshold = 4; // Gravitational threshold.
	var timeout = 1000; // Timeout between shake events.
	var timeframe = 200; // Time between shakes.
	var shakes = 3; // Minimum shakes to trigger event.
	var lastShake = (new Date).getTime();
	var gravity = { x: 0, y: 0, z: 0 };
	var delta = {
		x: { count: 0, value: 0 },
		y: { count: 0, value: 0 },
		z: { count: 0, value: 0 }
	};
	// Tracking the events.
	var onDeviceMotion = function(e) {
		var alpha = 0.8; // Low pass filter.
		var o = e.accelerationIncludingGravity;
		gravity.x = alpha * gravity.x + (1 - alpha) * o.x;
		gravity.y = alpha * gravity.y + (1 - alpha) * o.y;
		gravity.z = alpha * gravity.z + (1 - alpha) * o.z; 
		self.accelerationIncludingGravity = gravity;
		self.acceleration.x = o.x - gravity.x;
		self.acceleration.y = o.y - gravity.y;
		self.acceleration.z = o.z - gravity.z;
		///
		if (conf.gesture === "devicemotion") {
			conf.listener(e, self);
			return;
		} 
		var data = "xyz";
		var now = (new Date).getTime();
		for (var n = 0, length = data.length; n < length; n ++) {
			var letter = data[n];
			var ACCELERATION = self.acceleration[letter];
			var DELTA = delta[letter];
			var abs = Math.abs(ACCELERATION);
			/// Check whether another shake event was recently registered.
			if (now - lastShake < timeout) continue;
			/// Check whether delta surpasses threshold.
			if (abs > threshold) {
				var idx = now * ACCELERATION / abs;
				var span = Math.abs(idx + DELTA.value);
				// Check whether last delta was registered within timeframe.
				if (DELTA.value && span < timeframe) {
					DELTA.value = idx;
					DELTA.count ++;
					// Check whether delta count has enough shakes.
					if (DELTA.count === shakes) {
						conf.listener(e, self);
						// Reset tracking.
						lastShake = now;
						DELTA.value = 0;
						DELTA.count = 0;
					}
				} else {
					// Track first shake.
					DELTA.value = idx;
					DELTA.count = 1;
				}
			}
		}
	};
	// Attach events.
	if (!window.addEventListener) return;
	window.addEventListener('devicemotion', onDeviceMotion, false);
	// Return this object.
	return self;
};

Event.Gesture = Event.Gesture || {};
Event.Gesture._gestureHandlers = Event.Gesture._gestureHandlers || {};
Event.Gesture._gestureHandlers.shake = root.shake;

return root;

})(Event.proxy);
/*
	"Swipe" event proxy (1+ fingers).
	----------------------------------------------------
	CONFIGURE: snap, threshold, maxFingers.
	----------------------------------------------------
	Event.add(window, "swipe", function(event, self) {
		console.log(self.velocity, self.angle);
	});
*/

if (typeof(Event) === "undefined") var Event = {};
if (typeof(Event.proxy) === "undefined") Event.proxy = {};

Event.proxy = (function(root) { "use strict";

var RAD_DEG = Math.PI / 180;

root.swipe = function(conf) {
	conf.snap = conf.snap || 90; // angle snap.
	conf.threshold = conf.threshold || 1; // velocity threshold.
	// Tracking the events.
	conf.onPointerDown = function (event) {
		if (root.pointerStart(event, self, conf)) {
			Event.add(conf.doc, "mousemove", conf.onPointerMove).listener(event);
			Event.add(conf.doc, "mouseup", conf.onPointerUp);
		}
	};
	conf.onPointerMove = function (event) {
		var touches = event.changedTouches || root.getCoords(event);
		var length = touches.length;
		for (var i = 0; i < length; i ++) {
			var touch = touches[i];
			var sid = touch.identifier || Infinity;
			var o = conf.tracker[sid];
			// Identifier defined outside of listener.
			if (!o) continue; 
			o.move.x = touch.pageX;
			o.move.y = touch.pageY;
			o.moveTime = (new Date).getTime();
		}
	};
	conf.onPointerUp = function(event) {
		if (root.pointerEnd(event, self, conf)) {
			Event.remove(conf.doc, "mousemove", conf.onPointerMove);
			Event.remove(conf.doc, "mouseup", conf.onPointerUp);
			///
			var velocity1;
			var velocity2
			var degree1;
			var degree2;
		/// Calculate centroid of gesture.
		var start = { x: 0, y: 0 };
		var endx = 0;
		var endy = 0;
		var length = 0;
			///
			for (var sid in conf.tracker) {
				var touch = conf.tracker[sid];
				var xdist = touch.move.x - touch.start.x;
				var ydist = touch.move.y - touch.start.y;

			endx += touch.move.x;
			endy += touch.move.y;
			start.x += touch.start.x;
			start.y += touch.start.y;
			length ++;


				var distance = Math.sqrt(xdist * xdist + ydist * ydist);
				var ms = touch.moveTime - touch.startTime;
				var degree2 = Math.atan2(xdist, ydist) / RAD_DEG + 180;
				var velocity2 = ms ? distance / ms : 0;
				if (typeof(degree1) === "undefined") {
					degree1 = degree2;
					velocity1 = velocity2;
				} else if (Math.abs(degree2 - degree1) <= 20) {
					degree1 = (degree1 + degree2) / 2;
					velocity1 = (velocity1 + velocity2) / 2;
				} else {
					return;
				}
			}
			///
			if (velocity1 > conf.threshold) {
				start.x /= length;
				start.y /= length;
				self.start = start;
				self.x = endx / length;
				self.y = endy / length;
				self.angle = -((((degree1 / conf.snap + 0.5) >> 0) * conf.snap || 360) - 360);
				self.velocity = velocity1;
				self.fingers = conf.gestureFingers;
				self.state = "swipe";
				conf.listener(event, self);
			}
		}
	};
	// Generate maintenance commands, and other configurations.
	var self = root.pointerSetup(conf);
	// Attach events.
	Event.add(conf.target, "mousedown", conf.onPointerDown);
	// Return this object.
	return self;
};

Event.Gesture = Event.Gesture || {};
Event.Gesture._gestureHandlers = Event.Gesture._gestureHandlers || {};
Event.Gesture._gestureHandlers.swipe = root.swipe;

return root;

})(Event.proxy);
/*
	"Tap" and "Longpress" event proxy.
	----------------------------------------------------
	CONFIGURE: delay (longpress), timeout (tap).
	----------------------------------------------------
	Event.add(window, "tap", function(event, self) {
		console.log(self.fingers);
	});
	----------------------------------------------------
	multi-finger tap // touch an target for <= 250ms.
	multi-finger longpress // touch an target for >= 500ms
*/

if (typeof(Event) === "undefined") var Event = {};
if (typeof(Event.proxy) === "undefined") Event.proxy = {};

Event.proxy = (function(root) { "use strict";

root.tap = 
root.longpress = function(conf) {
	conf.delay = conf.delay || 500;
	conf.timeout = conf.timeout || 250;
	// Setting up local variables.
	var timestamp, timeout;
	// Tracking the events.
	conf.onPointerDown = function (event) {
		if (root.pointerStart(event, self, conf)) {
			timestamp = (new Date).getTime();
			// Initialize event listeners.
			Event.add(conf.doc, "mousemove", conf.onPointerMove).listener(event);
			Event.add(conf.doc, "mouseup", conf.onPointerUp);
			// Make sure this is a "longpress" event.
			if (conf.gesture !== "longpress") return;
			timeout = setTimeout(function() {
				if (event.cancelBubble && ++event.bubble > 1) return;
				// Make sure no fingers have been changed.
				var fingers = 0;
				for (var key in conf.tracker) {
					if (conf.tracker[key].end === true) return;
					if (conf.cancel) return;
					fingers ++;
				}
				// Send callback.
				self.state = "start";
				self.fingers = fingers;
				conf.listener(event, self);
			}, conf.delay);
		}
	};
	conf.onPointerMove = function (event) {
		var bbox = conf.bbox;
		var touches = event.changedTouches || root.getCoords(event);
		var length = touches.length;
		for (var i = 0; i < length; i ++) {
			var touch = touches[i];
			var identifier = touch.identifier || Infinity;
			var pt = conf.tracker[identifier];
			if (!pt) continue;
			if (conf.position === "relative") {
				var x = (touch.pageX + bbox.scrollLeft - bbox.x1) * bbox.scaleX;
				var y = (touch.pageY + bbox.scrollTop - bbox.y1) * bbox.scaleY;
			} else {
				var x = (touch.pageX - bbox.x1);
				var y = (touch.pageY - bbox.y1);
			}
			if (!(x > 0 && x < bbox.width && // Within target coordinates..
				  y > 0 && y < bbox.height &&
				  Math.abs(x - pt.start.x) <= 25 && // Within drift deviance.
				  Math.abs(y - pt.start.y) <= 25)) {
				// Cancel out this listener.
				Event.remove(conf.doc, "mousemove", conf.onPointerMove);
				conf.cancel = true;
				return;
			}
		}
	};
	conf.onPointerUp = function(event) {
		if (root.pointerEnd(event, self, conf)) {
			clearTimeout(timeout);
			Event.remove(conf.doc, "mousemove", conf.onPointerMove);
			Event.remove(conf.doc, "mouseup", conf.onPointerUp);
			if (event.cancelBubble && ++event.bubble > 1) return;
			// Callback release on longpress.
			if (conf.gesture === "longpress") {
				if (self.state === "start") {
					self.state = "end";
					conf.listener(event, self);
				}
				return;
			}
			// Cancel event due to movement.
			if (conf.cancel) return;
			// Ensure delay is within margins.
			if ((new Date).getTime() - timestamp > conf.timeout) return;
			// Send callback.
			self.state = "tap";
			self.fingers = conf.gestureFingers;
			conf.listener(event, self);
		}
	};
	// Generate maintenance commands, and other configurations.
	var self = root.pointerSetup(conf);
	// Attach events.
	Event.add(conf.target, "mousedown", conf.onPointerDown);
	// Return this object.
	return self;
};

Event.Gesture = Event.Gesture || {};
Event.Gesture._gestureHandlers = Event.Gesture._gestureHandlers || {};
Event.Gesture._gestureHandlers.tap = root.tap;
Event.Gesture._gestureHandlers.longpress = root.longpress;

return root;

})(Event.proxy);
/*
	"Mouse Wheel" event proxy.
	----------------------------------------------------
	Event.add(window, "wheel", function(event, self) {
		console.log(self.state, self.wheelDelta);
	});
*/

if (typeof(Event) === "undefined") var Event = {};
if (typeof(Event.proxy) === "undefined") Event.proxy = {};

Event.proxy = (function(root) { "use strict";

root.wheel = function(conf) {
	// Configure event listener.
	var interval;
	var timeout = conf.timeout || 150;
	var count = 0;
	// Externally accessible data.
	var self = {
		gesture: "wheel",
		state: "start",
		wheelDelta: 0,
		target: conf.target,
		listener: conf.listener,
		remove: function() {
			conf.target[remove](type, onMouseWheel, false);
		}
	};
	// Tracking the events.
	var onMouseWheel = function(event) {
		event = event || window.event;
		self.state = count++ ? "change" : "start";
		self.wheelDelta = event.detail ? event.detail * -20 : event.wheelDelta;
		conf.listener(event, self);
		clearTimeout(interval);
		interval = setTimeout(function() {
			count = 0;
			self.state = "end";
			self.wheelDelta = 0;
			conf.listener(event, self);
		}, timeout);
	};
	// Attach events.
	var add = document.addEventListener ? "addEventListener" : "attachEvent";
	var remove = document.removeEventListener ? "removeEventListener" : "detachEvent";
	var type = Event.supports("mousewheel") ? "mousewheel" : "DOMMouseScroll";
	conf.target[add](type, onMouseWheel, false);
	// Return this object.
	return self;
};

Event.Gesture = Event.Gesture || {};
Event.Gesture._gestureHandlers = Event.Gesture._gestureHandlers || {};
Event.Gesture._gestureHandlers.wheel = root.wheel;

return root;

})(Event.proxy);