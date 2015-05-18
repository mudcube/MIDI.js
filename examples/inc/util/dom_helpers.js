/*
	-------------------------------------------------------
	dom/Helpers : 0.2 : 2015-05-01 : https://sketch.io
	-------------------------------------------------------
*/

if (typeof galactic === 'undefined') galactic = {};

(function(root) { 'use strict';

	var dom = root.dom = root.dom || {};
	var util = root.util;

	/* querySelector
	------------------------------------------------------- */
	dom.$ = function(query, element) {
		if (typeof query === 'object') {
			return query;
		} else {
			return (element || document).querySelector(query);
		}
	};

	dom.$$ = function(query, element) {
		if (typeof query === 'object') {
			return query;
		} else {
			return (element || document).querySelectorAll(query);
		}
	};


	/* style
	------------------------------------------------------- */
	(function() {
		function setParams(node, params) {
			for (var param in params) {
				var value = params[param];
				node.style[param] = value;
			}
		};
	
		dom.style = function(nodes, params) {
			if (nodes = dom.$$(nodes)) {
				if (nodes.nodeType === 1) {
					nodes = [nodes];			
				}
				for (var n = 0, len = nodes.length; n < len; n ++) {
					setParams(nodes[n], params);
				};
			}
		};
	
		dom.styleSheet = function(selector, params) {
			var sheets = document.styleSheets;
			for (var n = 0; n < sheets.length; n++) {
				var sheet = sheets[n];
				var rules = sheet.cssRules;
				if (rules) {
					for (var i = 0; i < rules.length; i++) {
						var rule = rules[i];
						if (selector === rule.selectorText) {
							setParams(rule, params);
						}
					}
				}
			}	
		};
	})();
	

	/* clone
	------------------------------------------------------- */
	dom.clone = (function() {
		function cloneCanvas(dst, src) {
			if (dst.nodeName === 'CANVAS') {
				dst.getContext('2d').drawImage(src, 0, 0);
			}
		};

		function cloneNodeContent(src, dst) {
			cloneCanvas(dst, src);
			var dChildren = dst.childNodes;
			var sChildren = src.childNodes;
			for (var n = 0; n < dChildren.length; n ++) {
				var dstNode = dChildren[n];
				var srcNode = sChildren[n];
				if (dstNode && srcNode) {
					cloneCanvas(dstNode, srcNode);
					if (dstNode.childNodes.length && srcNode.childNodes) {
						cloneNodeContent(srcNode, dstNode);
					}
				}
			}
		};

		return function(target, id) {
			var node = target.cloneNode(true);
			cloneNodeContent(target, node);
			node.id = id;
			node.style.position = 'absolute';
			node.style.opacity = 1;
			node.style.zIndex = 1000000;
			node.style.display = 'block';
			return node;
		};
	})();


	/* empty
	------------------------------------------------------- */
	dom.empty = function(node) { // http://jsperf.com/innerhtml-vs-removechild/37
		if (typeof node === 'string') {
			node = dom.$(node);
		}
		if (node) {
			while (node.firstChild) {
				node.removeChild(node.firstChild);
			}
			return node;
		} else {
			return null;
		}
	};


	/* remove
	------------------------------------------------------- */
	dom.remove = (function() {
		function remove(node) {
			if (node.parentNode) {
				node.parentNode.removeChild(node);
			}
		};
		return function(nodes) {
			if (nodes) {
				if (nodes.nodeType === 1) {
					remove(nodes);
				} else if (util.isArray(nodes)) {
					for (var n = 0, len = nodes.length; n < len; n ++) {
						remove(nodes[n]);
					}
				}
			}
		};
	})();


	/* Get Metrics
	--------------------------------------------------- */
	dom.measure = (function() {
		function toFloat(element, type) {
			var value = element.getPropertyValue(type);
			var n = parseFloat(value, 10);
			return n === +n ? n : 0;
		};

		return function(element, opts) {
			opts = opts || {};
			///
			if (typeof element === 'string') {
				element = dom.$(element);
			}
			if (!(element = element || this.selection && this.selection[0])) {
				return {width: 0, height: 0};
			}
			if (element === window || element === document) {
				element = document.body;
			}
			///
			var bbox = {};
			var bcr = element.getBoundingClientRect();
			bbox.x1 = bcr.left;
			bbox.y1 = bcr.top;
			bbox.scrollLeft = 0;
			bbox.scrollTop = 0;
			///
			if (opts.sansScale === true) {
				bbox.width = element.offsetWidth;
				bbox.height = element.offsetHeight;
			} else {
				bbox.width = bcr.width;
				bbox.height = bcr.height;
				bbox.scaleX = bcr.width / element.offsetWidth || 1;
				bbox.scaleY = bcr.height / element.offsetHeight || 1;
			}
			///
			var style = window.getComputedStyle(element);
			///
			if (opts.sansBorder !== true) {
				var left = toFloat(style, 'border-left-width');
				var right = toFloat(style, 'border-right-width');
				var bottom = toFloat(style, 'border-bottom-width');
				var top = toFloat(style, 'border-top-width');
				bbox.border = {
					top: top,
					right: right,
					bottom: bottom,
					left: left
				};
				///
				bbox.x1 += left;
				bbox.y1 += top;
				bbox.width -= right + left;
				bbox.height -= bottom + top;
			}

			if (opts.sansMargin !== true) {
				left = toFloat(style, 'margin-left');
				right = toFloat(style, 'margin-right');
				bottom = toFloat(style, 'margin-bottom');
				top = toFloat(style, 'margin-top');
				///
				bbox.margin = {
					top: top,
					right: right,
					bottom: bottom,
					left: left
				};
				///
				bbox.x1 -= left;
				bbox.y1 -= top;
				bbox.width += right + left;
				bbox.height += bottom + top;
			}

			if (opts.sansPadding !== true) {
				left = toFloat(style, 'padding-left');
				right = toFloat(style, 'padding-right');
				bottom = toFloat(style, 'padding-bottom');
				top = toFloat(style, 'padding-top');
				///
				bbox.padding = {
					top: top,
					right: right,
					bottom: bottom,
					left: left
				};
			}

			bbox.x2 = bbox.x1 + bbox.width;
			bbox.y2 = bbox.y1 + bbox.height;

			/// Get the scroll of container element
			bbox.position = style.getPropertyValue('position');
			///
			var node = element; // bbox.position === 'fixed' ? element : element.parentNode;
			while(node !== null) {
				if (node === document.body || node.scrollTop === undefined) {
					break;
				}
				///
				var style = getComputedStyle(node);
				var position = style.getPropertyValue('position');
				if (position !== 'absolute') {
					if (position === 'fixed') { //- more testing required
						bbox.scrollTop = node.scrollLeft;
						bbox.scrollLeft = node.scrollTop;
						break;
					} else {
						bbox.scrollLeft += node.scrollLeft;
						bbox.scrollTop += node.scrollTop;
					}
				}
				///
				node = node.parentNode;
			}
			///
			eventjs.getDocumentScroll(bbox);
			///
			bbox.scrollLeft -= bbox.pageXOffset;
			bbox.scrollTop -= bbox.pageYOffset;
			///
			return bbox;
		};
	})();


	/* Append Element
	--------------------------------------------------- */
	dom.append = function(target, child, attrs) {
		var el = target;
		if (typeof el === 'string') {
			el = dom.$(el);
		}
		if (typeof child === 'string') {
			child = dom.create(child, attrs);
		}
		if (el && el.appendChild) {
			el.appendChild(child);
			return child;
		} else {
			console.warn('dom.append', arguments);
		}
	};

	dom.appendText = function(target, text) {
		dom.append(target, document.createTextNode(text));
	};


	/* Create Element
	--------------------------------------------------- */
	dom.create = function(node, attrs) {
		if (node.indexOf('<') !== -1) {
			var tmp = document.createElement('div');
			tmp.innerHTML = node.trim();
			if (!(node = tmp.firstChild)) {
				return;
			}
		} else if (node.indexOf(' ') !== -1) {
			node = document.createTextNode(node);
		} else {
			node = document.createElement(node);
		}
		if (attrs) {
			dom.setAttributes(node, attrs);
		}
		return node;
	};

	dom.setAttributes = function(target, attrs) {
		for (var key in attrs) {
			var value = attrs[key];
			if (typeof value === 'function' && key.indexOf('on') === 0) {
				eventjs.add(target, key, value);
			} else {
				target.setAttribute(key, value);
			}
		}
	};
	
	
	/* Set Class
	--------------------------------------------------- */
	dom.setClass = (function() {
		function Callback(fn, delay) {
			if (typeof fn === 'function') {
				if (delay) {
					setTimeout(fn, delay);
				} else {
					fn();
				}
			}
		};
		
		return function(opts) {
			if (opts && opts.target) {
				var target = opts.target;
				var className = opts.className;
				var on = opts.on;
				var list = opts.list;
				var delay = opts.delay;
				var fn = opts.callback;
			} else {
				var target = arguments[0];
				var className = arguments[1];
				var on = arguments[2];
				var list = arguments[3];
			}

			/// 'on' defaults to true
			if (on === undefined) {
				on = true;
			}

			/// target is string
			if (typeof target === 'string') {
				target = dom.$(target);
			}

			/// undefined opts
			if (!target || !className) {
				console.warn('setClass', arguments);
				return;
			}

			/// querySelectorAll | Array
			if (target.length) {
				for (var n = 0; n < target.length; n ++) {
					var classList = target[n].classList;
					if (classList) {
						if (on) {
							classList.add(className);
						} else {
							classList.remove(className);
						}
					}
				}
				Callback(fn, delay);
				return;
			}

			/// get list from parentNode
			if (typeof list === 'string') {
				if (target.parentNode) {
					list = dom.$$(list, target.parentNode);
				} else {
					console.warn('setClass', opts);
					return;
				}
			}

			/// ensure list is array
			if (!list || !list.length) {
				list = [target];
			}

			/// remove className from element(s)
			var classList = target.classList;
			var toggleFalse = on === 'toggle' && classList.contains(className);
			///
			for (var i = 0, length = list.length; i < length; i++) {
				var cl = list[i].classList;
				if (cl) cl.remove(className);
			}
			///
			if (classList) {
				if (on === false || toggleFalse) {
					Callback(fn, delay);
					return false;
				}
				///
				classList.add(className);
				///
				Callback(fn, delay);
				return true;
			}
		};
	})();
	
	dom.addClass = function(target, value) { //- merge into dom.setClass
		target = dom.$(target);
		if (target && value) {
			switch(typeof value) {
				case 'string':
					target.classList.add(value);
					break;
				case 'object':
					util.each(value, function(value) {
						target.classList.add(value);
					});
					break;
			}
		}
	};

	
	/* Strip HTML tags from string
	--------------------------------------------------- */
	dom.strip_html = (function() {
		var dummy = document.createElement('span');
		return function(text) {
			dummy.innerHTML = text;
			return dummy.innerText;
		};
	})();

})(galactic);