/*
	-------------------------------------------------------
	util/DOMMisc : 0.2.1 : 2015-04-27 : https://sketch.io
	-------------------------------------------------------
*/

if (typeof galactic === 'undefined') galactic = {};

(function(root) { 'use strict';

root.module = root.module || {};
root.module.DOMMisc = function(root) {

	var util = root.util || (root.util = {});

	/* Inherits
	---------------------------------------------------------- */
	util.inherits = function(child, parent) {
		function temp() {};
		temp.prototype = parent.prototype;
		child.prototype = new temp();
		child.prototype.constructor = child;
	};


	/* Error handler
	---------------------------------------------------------- */
	util.errorHandler = function(type) {
		return function() {
			console.warn(type, arguments);
		};
	};


	/* Kiosk
	---------------------------------------------------------- */
	util.requestKioskMode = function() {
		if (root.client.nodewebkit) {
			//TODO-PER: to make it compile			var win = require('nw.gui').Window.get();
			win.enterKioskMode();
		} else {
//			root.FullScreen.enter();
		}
	};


	/* Diff
	---------------------------------------------------------- */
	util.diff = function(_from, _to, _retain) { // see style.js
		if (_from === _to) return;
		///
		var from = new _from.constructor();
		var to = new _to.constructor();
		var equal = true;
		for (var key in _from) {
			if (_retain && _retain.indexOf(key) !== -1) {
				from[key] = _from[key];
				to[key] = _to[key];
			} else if (!(key in _to)) {
				equal = false;
				from[key] = _from[key];
				to[key] = _to[key];
			} else {
				if (_from[key] !== _to[key]) {
					if (typeof _from[key] === 'object' && typeof _to[key] === 'object') {
						var diff = util.diff(_from[key], _to[key], _retain);
						if (diff !== undefined) {
							equal = false;
							from[key] = diff.from;
							to[key] = diff.to;
						}
					} else {
						equal = false;
						from[key] = _from[key];
						to[key] = _to[key];
					}
				}
			}
		}
		for (var key in _to) {
			if (!(key in _from)) {
				equal = false;
				from[key] = _from[key];
				to[key] = _to[key];
			}
		}
		if (!equal) {
			return {
				from: from,
				to: to
			};
		}
	};


	/* Sort
	--------------------------------------------------- 
		util.sort({
			fn: 'natural', // string | custom function
			data: {},
			param: 'columnId'
		});
	*/
	util.sort = function(opts) {
		var fn = util.sort[opts.fn] || opts.fn;
		var data = opts.data || opts;
		var param = opts.param;
		///
		var res;
		if (Array.isArray(data)) { // sort arrays
			if (param) { // sort array by param
				res = data.sort(function(a, b) {
					return fn(a[param], b[param]);
				});
			} else { // sort array with custom function
				res = data.sort(fn);
			}
		} else { // sort object by key
			res = {};
			Object.keys(data).sort(fn).forEach(function(idx) {
				res[idx] = data[idx];
			});
		}
		return res;
	};
	
	util.sort.numeric = function(a, b) {
		return a - b;
	};

	/*
	 * Natural Sort algorithm for Javascript - Version 0.6 - Released under MIT license
	 * Author: Jim Palmer (based on chunking idea from Dave Koelle)
	 * Contributors: Mike Grier (mgrier.com), Clint Priest, Kyle Adams, guillermo
	 */
	util.sort.natural = function(a, b) { // http://www.overset.com/2008/09/01/javascript-natural-sort-algorithm-with-unicode-support/
		var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi;
		var sre = /(^[ ]*|[ ]*$)/g;
		var dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/;
		var hre = /^0x[0-9a-f]+$/i;
		var ore = /^0/;
		// convert all to strings and trim()
		var x = a.toString().replace(sre, '') || '';
		var y = b.toString().replace(sre, '') || '';
		// chunk/tokenize
		var xN = x.replace(re, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').split('\0');
		var yN = y.replace(re, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').split('\0');
		// numeric, hex or date detection
		var xD = parseInt(x.match(hre)) || (xN.length != 1 && x.match(dre) && Date.parse(x));
		var yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null;

		// first try and sort Hex codes or Dates
		if (yD) {
			if (xD < yD) {
				return -1;
			} else if (xD > yD) {
				return 1;
			}
		}

		// natural sorting through split numeric strings and default strings
		for (var cLoc = 0, numS = Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
			// find floats not starting with '0', string or 0 if not defined (Clint Priest)
			var oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
			var oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
			// handle numeric vs string comparison - number < string - (Kyle Adams)
			if (isNaN(oFxNcL) !== isNaN(oFyNcL)) {
				return (isNaN(oFxNcL)) ? 1 : -1;
			} else if (typeof oFxNcL !== typeof oFyNcL) {
				// rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
				oFxNcL += '';
				oFyNcL += '';
			}
			if (oFxNcL < oFyNcL) {
				return -1;
			} else if (oFxNcL > oFyNcL) {
				return 1;
			}
		}
		return 0;
	};


	/* LocalStorage
	--------------------------------------------------- */
	util.getItems = function(keys, onsuccess) {
		var pending = keys.length;
		var res = {};
		util.each(keys, function(key) {
			util.getItem(key, function(value) {
				res[key] = value;
				///
				if (!--pending) {
					onsuccess(res);
				}
			});
		});
	};

	util.getItem = function(key, onsuccess) {
		onsuccess = onsuccess || function(value) {
		    console.log(value);
		};
		///
		var parse = function(value) {
			if (value) {
				try {
					value = JSON.parse(value);
				} catch(err) {}
			}
			///
			onsuccess(value);
		};
		///
		if (util.exists('chrome.storage.local')) { // Chrome Packaged Apps
			chrome.storage.local.get(key, function(data) {
				parse(data[key]);
			});
		} else {
			var prefix = root.feature && root.feature.prefix || '';
			var prefixed = prefix + '/' + key;
			var data = localStorage.getItem(prefixed) || '';
			parse(data);
		}
	};

	util.setItem = function(key, value) {
		if (util.exists('chrome.storage.local')) { // Chrome Packaged Apps
			var obj = {};
			obj[key] = value;
			chrome.storage.local.set(obj);
		} else {
			var prefix = root.feature && root.feature.prefix || '';
			var prefixed = prefix + '/' + key;
			localStorage.setItem(prefixed, value);
		}
	};


	/* Canvas
	--------------------------------------------------- */
	util.Canvas = function(width, height, type) {
		if (typeof document === 'undefined') { // NodeJS
			if (Canvas === undefined) {
				return {ctx: {}};
			} else {
				var canvas = new Canvas;
			}
		} else { // FlashCanvas | DOM
			var canvas = document.createElement('canvas');
			if (typeof FlashCanvas === 'function') {
				canvas.onload = root.client.fn.detect;
			}
		}
		///
		canvas.ctx = canvas.getContext(type || '2d');
		///
		if (isFinite(width)) {
			canvas.width = width || 1;
		}
		if (isFinite(height)) {
			canvas.height = height || 1;
		}
		return canvas;
	};

	util.Canvas.resize = function(canvas, width, height) { // clear context
		if (width && height) {
			canvas.width = width;
			canvas.height = height;
		} else {
			canvas.width = canvas.width;
		}
	};

	util.Canvas.clear = function(canvas) { // clear context rectangle
		canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
	};


	/* Context
	--------------------------------------------------- */
	util.Context3d = function(width, height) {
		return util.Canvas(width, height, 'webgl').ctx;
	};
	
	util.Context2d = function(width, height) {
		return util.Canvas(width, height, '2d').ctx;
	};
	

	/* JSON
	--------------------------------------------------- */
	util.json = {};
	util.json.pretty = function(data) {
		return JSON.stringify(data, null, '\t');
	};

	util.json.stringify = function(data) {
		return JSON.stringify(data, function(key, value) { // filter circular
			if (typeof value === 'object') {
				if (value === null) return; // NULL
				if (value.nodeName) return; // DOM Node
				if (value.tagName) return; // DOM Element
			}
			return value;
		});
	};


	/* Timestamp
	--------------------------------------------------- */
	util.timestamp = (function() {
		if (typeof window === 'object') {
			var performance = window.performance;
			if (performance && performance.now) {
				return performance.now.bind(performance);
			}
		}
		return Date.now;
	})();


	/* Perf
	--------------------------------------------------- */
	util.perf = function(fn, amount, title) {
		if (amount && fn) {
			var perf = util.perf();
			for (var n = 0; n < amount; n ++) fn();
			console.log(perf() + 'ms', title || '');
		} else {
			var start = util.timestamp();
			return function(title, reset) {
				var now = util.timestamp();
				var diff = Math.round(now - start);
				if (title) {
					console.log(diff + 'ms', title);
				}
				if (reset) {
					start = now;
				}
				return diff;
			};
		}
	};

	util.exists = function(path, base) { // exists('scene.children', sketch)
		try {
			var parts = path.split('.');
			var obj = base || window;
			for (var n = 0, length = parts.length; n < length; n ++) {
				var key = parts[n];
				if (obj[key] == null) {
					return false;
				} else {
					obj = obj[key];
				}
			}
			return true;
		} catch(err) {
			return false;
		}
	};


	/* Clone objects
	--------------------------------------------------- */
	util.copy = (function() {
		var excludePattern = typeof CanvasPattern === 'function';
		var copy = function(src) {
			if (!src || typeof src !== 'object') {
				return src;
			} else if (src.nodeType) {
				return; // dom element
			} else if (excludePattern && src instanceof CanvasPattern) {
				return;
			} else if (src.clone && typeof src.clone === 'function') {
				return src.clone();
			} else if (src.constructor) {
				var temp = new src.constructor();
				for (var key in src) {
					var fvalue = src[key];
					if (!fvalue || typeof fvalue !== 'object') {
						temp[key] = fvalue;
					} else { // clone sub-object
						temp[key] = copy(fvalue);
					}
				}
				return temp;
			}
		};
		return copy;
	})();


	/* Merge objects
	--------------------------------------------------- */
	util.copyInto = (function() {
		var copyInto = function(src, dst, opts) {
			opts = opts || {};
			if (src && typeof src === 'object') {
				for (var key in src) {
					var tvalue = dst[key];
					var fvalue = src[key];
					///
					var filter = opts.filter;
					if (filter && filter(fvalue, tvalue)) {
						continue;
					}
					///
					var ftype = typeof fvalue;
					if (fvalue && ftype === 'object') {
						if (fvalue.nodeType) {
							if (opts.referenceNodes) {
								dst[key] = fvalue;
							} else {
								continue; // dom element
							}
						} else {
							if (typeof tvalue === ftype) {
								dst[key] = copyInto(fvalue, tvalue, opts);
							} else {
								dst[key] = copyInto(fvalue, new fvalue.constructor(), opts);
							}
						}
					} else {
						dst[key] = fvalue;
					}
				}
			}
			return dst;
		};
		return copyInto;
	})();


	/* Count objects
	--------------------------------------------------- */
	util.count = function(obj, whereKey, whereValue) {
		if (obj) {
			if (isFinite(obj.length)) {
				return obj.length;
			} else if (typeof obj === 'object') {
				var length = 0;
				var useKey = whereKey !== undefined; //- replace with filter()
				var useValue = whereValue !== undefined;
				if (useKey && useValue) {
					for (var key in obj) {
						if (obj[key] && obj[key][whereKey] === whereValue) {
							++ length;
						}
					}
				} else if (useKey) {
					for (var key in obj) {
						if (obj[key] !== undefined) {
							++ length;
						}
					}
				} else {
					for (var key in obj) ++ length;
				}
				return length;
			}
		} else {
			return 0;
		}
	};

	util.isEmpty = function(obj) {
		if (obj == null) { // undefined | null
			return true;
		} else if (obj.length >= 0) { // array | string | arguments
			return !obj.length;
		} else { // object
			for (var key in obj) {
				return false;
			}
			return true;
		}
	};

	util.isNotEmpty = function(obj) {
		return !util.isEmpty(obj);
	};

	util.clamp = function(min, max, value) {
		return (value < min) ? min : ((value > max) ? max : value);
	};

	util.clampFinite = function(value) {
		var INFINITY = util.INFINITY;
		if (value > +INFINITY) value = +INFINITY;
		if (value < -INFINITY) value = -INFINITY;
		return value;
	};
	
	util.arrayEmpty = function(arr) {
		arr.splice(0, arr.length);
	};
	
	util.arrayIntersects = function(haystack, arr) {
		return arr.some(function(value) {
			return haystack.indexOf(value) !== -1;
		});
	};

	util.inArray = function(array, value) {
		return array.indexOf(value) !== -1;
	};

	util.isArray = function(obj) {
		return Array.isArray(obj) || obj instanceof NodeList;
	};

	util.each = function(obj, callback) {
		if (util.isArray(obj)) {
			for (var idx = 0; idx < obj.length; idx ++) {
				callback(obj[idx], idx);
			}
		} else {
			for (var key in obj) {
				callback(obj[key], key);
			}
		}
	};

	util.equals = function(a, b) {
		if (typeof a === 'object') {
			if (typeof b === 'object') {
				return util.json.stringify(a) === util.json.stringify(b);
			} else {
				return false;
			}
		} else {
			return a === b;
		}
	};


	/* Convert objects
	--------------------------------------------------- */
	util.objectToArray = function(obj) {
		var res = [];
		for (var key in obj) {
			res.push(obj[key]);
		}
		return res;
	};

	util.arrayToObject = function(arr) {
		var res = {};
		for (var n = 0, length = arr.length; n < length; n ++) {
			res[arr[n]] = true;
		}
		return res;
	};


	/* Uploader
	--------------------------------------------------- */
	util.addFileInput = function(data, openAsNew) {
		root.uploader.addFileInput({
			target: data,
			onchange: function(uploader) {
				uploader.fileInput.value = '';
				uploader.addMedia({
					openAsNew: openAsNew,
					self: root.uploader
				});
			}
		});
	};


	/* Format bytes
	---------------------------------------------------------- */
	util.bytesToSize = function(bytes, precision) {
		if (bytes) {
			precision = precision || 1;
			var names = ['Bytes', 'kb', 'mb', 'gb', 'tb'];
			var n = Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024));
			return (bytes / Math.pow(1024, n)).toFixed(precision) + names[n];
		} else {
			return '0Bytes';
		}
	};


	/* Format time
	---------------------------------------------------------- */
	util.getTimeFormat = function(timestamp, toString) { // in milliseconds
		timestamp /= 1000;
		var hours = (timestamp / 3600) >> 0;
		var minutes = ((timestamp - (hours * 3600)) / 60) >> 0;
		var seconds = (timestamp - (hours * 3600) - (minutes * 60)) >> 0;
		if (toString) {
			if (hours < 10) hours = '0' + hours;
			if (minutes < 10) minutes = '0' + minutes;
			if (seconds < 10) seconds = '0' + seconds;
			return hours + ':' + minutes + ':' + seconds;
		} else {
			return {
				hours: hours,
				minutes: minutes,
				seconds: seconds
			};
		}
	};

	util.require = function(opts) {
		if (typeof opts === 'string') opts = {url: opts};
		var url = opts.url;
		var type = opts.type || (url.indexOf('.css') !== -1 ? 'css' : 'js');
		var async = opts.async || false;
		var onsuccess = opts.onsuccess;
		///
		if (type === 'css') {
			if (async) {
				setTimeout(addCSS, 0);
			} else {
				addCSS();
			}
		} else {
			var script = document.createElement('script');
			script.src = url;
			script.async = async;
			///
			if (onsuccess) { // influenced by jQuery
				var loaded = false;
				script.onload = script.onreadystatechange = function() {
					if (loaded === false) {
						var readyState = script.readyState;
						if (!readyState || /loaded|complete/.test(readyState)) {
							loaded = true;
							onsuccess();
							// Handle memory leak in IE
							script.onload = script.onreadystatechange = null;
						}
					};
				};
			}
			///
			document.head.appendChild(script);
		}
		
		function addCSS() {
			var link = document.createElement('link');
			link.href = url;
			link.setAttribute('type', 'text/css');
			link.setAttribute('rel', 'stylesheet');
			document.head.appendChild(link);
		};
	};


	/* Detect whether focus element is editable node
	---------------------------------------------------------- */
	util.isEditingText = function() { // from eventjs
		var node = document.activeElement;
		if (!node) return false;
		var nodeName = node.nodeName;
		if (nodeName === 'INPUT' || nodeName === 'TEXTAREA' || node.contentEditable === 'true') {
			if (node.classList.contains('sk-canvas-dummy')) return false;
			return true;
		} else {
			return false;
		}
	};


	/* Pending queue
	---------------------------------------------------------- */
	util.pending = function(length, onsuccess) {
		var pending = length;
		return {
			add: function(amount) {
				pending += amount || 1;
			},
			next: function() {
				if (!--pending) {
					onsuccess();
				}
			}
		};
	};
};

/// NodeJS
if (typeof module !== 'undefined' && module.exports) {
	try {
		//TODO-PER: to make it compile var Canvas = require('canvas');
	} catch(e) {}
	///
	module.exports = root.module.DOMMisc;
} else {
	root.module.DOMMisc(galactic);
}

})(galactic);