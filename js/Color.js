/*

	Color.Space : 0.3 : mudcu.be
	-----------------------------
	STRING <-> HEX <-> RGB <-> HSL
	-----------------------------
	var HEX = 0xFF0000;
	var HSL = Color.Space(HEX, "HEX>RGB>HSL");
	
*/

if (!window.Color) Color = {};
if (!window.Color.Space) Color.Space = {};

(function () {

var DEG_RAD = Math.PI / 180;
var RAD_DEG = 1 / DEG_RAD;

var shortcuts = { };
var root = Color.Space = function(color, route) {
	if (shortcuts[route]) {
		route = shortcuts[route];
	}
	var arr = route.split(">");
	var key = "";
	for (var n = 0; n < arr.length; n ++) {
		if (n > 1) {
			key = key.split("_");
			key.shift();
			key = key.join("_");
		}
		key += (n == 0 ? "" : "_") + arr[n];
		if (n > 0) color = root[key](color);
	}
	return color;
};

// STRING = 'FFFFFF' | 'FFFFFFFF'

root.STRING_HEX = function (o) {
	return parseInt('0x' + o);
};

// HEX = 0x000000 -> 0xFFFFFF

root.HEX_STRING = function (o, maxLength) {
	if (!maxLength) maxLength = 6;
	if (!o) o = 0;
	var z = o.toString(16);
	// when string is lesser than maxLength
	var n = z.length;
	while (n < maxLength) {
		z = '0' + z;
		n++;
	}
	// when string is greater than maxLength
	var n = z.length;
	while (n > maxLength) {
		z = z.substr(1);
		n--;
	}
	return z;
};

root.HEX_RGB = function (o) {
	return {
		R: (o >> 16),
		G: (o >> 8) & 0xFF,
		B: o & 0xFF
	};
};

// RGB = R: Red / G: Green / B: Blue

root.RGB_HEX = function (o) {
	if (o.R < 0) o.R = 0;
	if (o.G < 0) o.G = 0;
	if (o.B < 0) o.B = 0;
	if (o.R > 255) o.R = 255;
	if (o.G > 255) o.G = 255;
	if (o.B > 255) o.B = 255;
	return o.R << 16 | o.G << 8 | o.B;
};

root.RGB_HSL = function (o) { // RGB from 0 to 1
	// http://www.easyrgb.com/index.php?X=MATH&H=18#text18
	var _R = o.R / 255,
		_G = o.G / 255,
		_B = o.B / 255,
		min = Math.min(_R, _G, _B),
		max = Math.max(_R, _G, _B),
		D = max - min,
		H,
		S,
		L = (max + min) / 2;
	if (D == 0) { // No chroma
			H = 0;
			S = 0;
	} else { // Chromatic data
		if (L < 0.5) S = D / (max + min);
		else S = D / (2 - max - min);
		var DR = (((max - _R) / 6) + (D / 2)) / D;
		var DG = (((max - _G) / 6) + (D / 2)) / D;
		var DB = (((max - _B) / 6) + (D / 2)) / D;
		if (_R == max) H = DB - DG;
		else if (_G == max) H = (1 / 3) + DR - DB;
		else if (_B == max) H = (2 / 3) + DG - DR;
		if (H < 0) H += 1;
		if (H > 1) H -= 1;
	}
	return {
		H: H * 360,
		S: S * 100,
		L: L * 100
	};
};

// HSL (1978) = H: Hue / S: Saturation / L: Lightess

root.HSL_RGB = function (o) {
	// http://www.easyrgb.com/index.php?X=MATH&H=19
	var H = o.H / 360,
		S = o.S / 100,
		L = o.L / 100,
		R, G, B, _1, _2;
	function Hue_2_RGB(v1, v2, vH) {
		if (vH < 0) vH += 1;
		if (vH > 1) vH -= 1;
		if ((6 * vH) < 1) return v1 + (v2 - v1) * 6 * vH;
		if ((2 * vH) < 1) return v2;
		if ((3 * vH) < 2) return v1 + (v2 - v1) * ((2 / 3) - vH) * 6;
		return v1;
	}
	if (S == 0) { // HSL from 0 to 1
		R = L * 255;
		G = L * 255;
		B = L * 255;
	} else {
		if (L < 0.5) _2 = L * (1 + S);
		else _2 = (L + S) - (S * L);
		_1 = 2 * L - _2;
		R = 255 * Hue_2_RGB(_1, _2, H + (1 / 3));
		G = 255 * Hue_2_RGB(_1, _2, H);
		B = 255 * Hue_2_RGB(_1, _2, H - (1 / 3));
	}
	return {
		R: R,
		G: G,
		B: B
	};
};

})();