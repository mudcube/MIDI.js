/* 
	----------------------------------------------------------
	EventEmitter : 2015-09-29 : https://sketch.io
	----------------------------------------------------------
	root.EventEmitter(object);
	object.on('blah', function(){});
	object.emit('blah');
	----------------------------------------------------------
*/

if (typeof galactic === 'undefined') galactic = {};

(function(root) { 'use strict';

root.EventEmitter = function(proto) {

	var uniqueId = 1;
	function funcID(type, fn) {
		if (typeof fn === 'function') {
			var fnId = fn.uniqueId || (fn.uniqueId = uniqueId++);
			return type + '.' + fnId;
		} else {
			console.warn(type, 'listener does not exist');
		}
	};

	function listener(type) {
		if (proto.on[type]) {
			return proto.on[type];
		} else {
			return proto.on[type] = Stack(type);
		}
	};

	function Stack(type) {
		var stack = {};
		///
		function emitter() {
			var overrides = false;
			for (var key in stack) {
				if (stack[key].apply(proto, arguments)) {
					overrides = true;
				}
			}
			return overrides;
		};

		emitter.add = function(fn) {
			var fid = funcID(type, fn);
			if (stack[fid] === undefined && fn) {
				stack[fid] = fn;
				return {
					add: function() {
						stack[fid] = fn;
					},
					remove: function() {
						delete stack[fid];
					}
				};
			}
		};

		emitter.remove = function(fn) {
			var fid = funcID(type, fn);
			if (stack[fid] !== undefined && fn) {
				delete stack[fid];
			}
		};
		
		emitter.stack = stack; // easier debugging

		return emitter;
	};

	proto.on = function(type, fn) {
		return listener(type).add(fn);
	};

	proto.off = function(type, fn) {
		if (fn) {
			listener(type).remove(fn);
		} else {
			delete proto.on[type];
		}
	};

	proto.emit = function(type) {
		var stack = proto.on[type];
		if (stack) {
			var args = Array.prototype.slice.call(arguments).slice(1);
			return stack.apply(proto, args);
		}
	};
};

})(galactic);