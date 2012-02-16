/*

	Event.js : v1.1 : mudcu.be
	-----------------------
	/// calling "Event" with "new" provides additional support;
	Event(syntax.area, "click", function(event, self) {
		self.stop().prevent().remove();
	});

	/// calling "Event" without "new" also works, but requires more work (and is faster);
	var click = Event.add(syntax.area, "click", function(event) {
		Event.stop(event);
		Event.prevent(event);
		Event.remove(syntax.area, "click", click);
	});

	/// multiple event-types bound to one function
	var binding = Event(window, "click,mousemove,mousemove,mouseup", function(event, self) {
		self.stop().prevent(); // stopPropagation and preventDefault
		binding.remove(); // removes all the listeners
	});

	/// multiple events bound to one element
	var binding = Event(window, {
		"mousedown": function(event, self) {
			self.remove(); // remove all the listeners
		},
		"mouseup": function(event, self) {
			binding.remove(); // just remove this listener
		}	
	});

*/

var Event = (function(root) { "use strict";
	var add = document.addEventListener ? 'addEventListener' : 'attachEvent';
	var remove = document.removeEventListener ? 'removeEventListener' : 'detachEvent';
	var isEvent = (function () {
		var events = {};
		var types = [ 
			'abort', 'beforeunload', 'blur', 'broadcast', 'change', 'click', 'close', 
			'command', 'commandupdate', 'contextmenu', 'dblclick', 'dragdrop', 
			'dragenter', 'dragexit', 'draggesture', 'dragover', 'error', 'focus', 
			'input', 'keydown', 'keypress', 'keyup', 'load', 'mousedown', 
			'mousewheel', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 
			'mouseup', 'move', 'overflow', 'overflowchanged', 'popuphidden', 
			'popuphiding', 'popupshowing', 'popupshown', 'select', 'scroll', 
			'syncfrompreference', 'synctopreference', 'readystatechange', 
			'reset', 'resize', 'select', 'submit', 'underflow', 'unload'
		];
		for (var n = 0, length = types.length; n < length; n ++) {
			events[types[n]] = true;
		}
		return events; 
	})();
	// event wrappers, and associated variables
	var wrappers = {};
	var counter = 0;
	var testElement = document.createElement("div");
	var getEventID = function(object) {
		if (object === window) return "#window";
		if (object === document) return "#document";
		if (!object) object = {}; // FIXME: Happens in iOS
		if (!object.uniqueID) {
			object.uniqueID = "id" + counter ++;
		}
		return object.uniqueID;
	};
	// function to create new Events
	root = {}; // double type the root function as object + function
	root = function(target, type, listener, scope) {
		// find the where function was called from (window is undefined)
		var that = typeof(this) !== "undefined" ? this : {};
		// check for multiple events in one string
		if (type.indexOf && type.indexOf(",") !== -1) { 
			type = type.split(",");
		}
		// check type for multipel events
		if (typeof(type) !== "string") { // has multiple events
			that.events = {};
			if (typeof(type.length) === "undefined") { // has multiple listeners (object)
				for (var key in type) {
					if (isEvent[key] && typeof(type[key]) === "function") {
						that.events[key] = Event(target, key, type[key], scope);
					}
				}
			} else { // has multiple listeners glued together (array)
				for (var n = 0, length = type.length; n < length; n ++) {
					that.events[type[n]] = Event(target, type[n], listener, scope);
				}
			}
			that.remove = function() { // remove multiple events
				for (var key in that.events) {
					that.events[key].remove();
				}
				return that;
			};
			that.add = function() { // add multiple events
				for (var key in that.events) {
					that.events[key].add();
				}
				return that;
			};
			return that;
		} else { // is single call
			if (!(target && type && listener)) return "missing data.";
			type = standardize(type);
		}
		// tracked wrapper
		var wrapperID = type + getEventID(target) + "." + getEventID(listener);
		if (!wrappers[wrapperID]) { // create new wrapper
			wrappers[wrapperID] = function(event) {
				return listener.call(scope, that.event = event, that);
			};
		}
		// the wrapped listener
		var wrapper = wrappers[wrapperID];
		target[add](type, wrapper, false);
		// 
		that.stop = function(event) {
			event = event || that.event;
			if (event.stopPropagation) {
				event.stopPropagation();
			} else { // <= IE8
				event.cancelBubble = true;
			}
			return that;
		};
		that.prevent = function(event) {
			event = event || that.event;
			if (event.preventDefault) {
				event.preventDefault();
			} else { // <= IE8
				event.returnValue = false;
			}
			return that;
		};
		that.add = function() { // so you can add it back
			target[add](type, wrapper, false);
			return that;
		};
		that.remove = function() { 
			target[remove](type, wrapper, false);
			return that;
		};
		return that;
	};	

	root.add = function(target, type, listener, scope) {
		type = standardize(type);
		target[add](type, wrap(type, target, listener, scope || target), false);
		return listener;
	};
	
	root.remove = function(target, type, listener, scope) {
		type = standardize(type);
		target[remove](type, wrap(type, target, listener, scope || target), false);
		return listener;
	};
	
	root.stop =	
	root.stopPropagation = function(event) {
		if (event.stopPropagation) {
			event.stopPropagation();
		} else { // <= IE8
			event.cancelBubble = true;
		}
	};
	
	root.prevent = 
	root.preventDefault = function(event) {
		if (event.preventDefault) {
			event.preventDefault();
		} else { // <= IE8
			event.returnValue = false;
		}
	};
	
	///////////// 

	var standardize = function(type) { // fix any browser discrepancies
		if (!document.addEventListener) {
			return "on" + type;
		} else if (type === "mousewheel" && !("onmousewheel" in testElement)) {
			return "DOMMouseScroll";
		} else { // 
			return type;
		}
	};
	 
	var wrap = function(type, target, listener, scope) { // un-tracked wrapper
		var wrapperID = type + getEventID(target) + "." + getEventID(listener);
		if (!wrappers[wrapperID]) {
			wrappers[wrapperID] = function(event) {
				return listener.call(scope, event);
			};
		}
		return wrappers[wrapperID];
	};
	//
	return root;
	//
})(Event);