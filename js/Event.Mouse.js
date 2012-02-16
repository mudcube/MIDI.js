/*

	Event.Mouse : 0.3.1 : mudcu.be
	-------------------------------------
	Event.add(document, "mousedown", function(event) {
		Event.drag({
			type: "absolute",
			event: event,
			element: document,
			callback: function (event, coords, state, self) {
				Event.stopPropagation(event);
				Event.preventDefault(event);
				console.log(coords);
			}
		});
	});
	
	// this does the same thing	
	Event.drag({
		type: "absolute",
		element: document,
		callback: function (event, coords, state, self) {
			console.log(coords);
		}
	});
	
	/// easier mousewheel events
	Event.mousewheel(window, function(event, state, wheelData, self) {
		self.stop.prevent.remove();		
	});

*/

if (typeof(Event) === "undefined") var Event = {};

Event.drag = 
Event.dragElement = function(props) {
	var el = props.element || document.body;
	var doc = el.ownerDocument; // could be within an iframe
	if (typeof(props.event) === "undefined") { // create event
		Event.add(el, "mousedown", function(event) {
			props.event = event;
			Event.dragElement(props);
			Event.preventDefault(event);
			Event.stopPropagation(event);
		});
		return;
	}
	// functions accessible externally
	var self = {
		cancel: function() {
			Event.remove(doc, "mousemove", mouseMove);
			Event.remove(doc, "mouseup", mouseUp);
		}
	};
	// event move
	var mouseMove = function (event, state) {
		if (typeof(state) === "undefined") state = "move";
		var coord = Event.coords(event);
		switch (props.type) {
			case "move": // move
				props.callback(event, {
					x: coord.x + oX - eX,
					y: coord.y + oY - eY
				}, state, self);
				break;
			case "difference": // relative, from position within element
				props.callback(event, {
					x: coord.x - oX,
					y: coord.y - oY
				}, state, self);
				break;
			case "relative": // eveything is relative from origin
				props.callback(event, {
					x: coord.x - eX,
					y: coord.y - eY
				}, state, self);
				break;
			default: // "absolute", origin is 0x0
				props.callback(event, {
					x: coord.x,
					y: coord.y
				}, state, self);
				break;
		}
	};
	// event up
	var mouseUp = function(event) {
		self.cancel();
		mouseMove(event, "up");
	};
	// current element position
	var origin = abPos(el);
	var oX = origin.x;
	var oY = origin.y;
	// current mouse position
	var event = props.event;
	var coord = Event.coords(event);
	var eX = coord.x;
	var eY = coord.y;
	// events
	Event.add(doc, "mousemove", mouseMove);
	Event.add(doc, "mouseup", mouseUp);
	mouseMove(event, "down"); // run mouse-down
	//
	return self;
};

Event.coords = (function() {
	if (window.ActiveXObject) {
		return function(event) {
			return {
				x: event.clientX + document.documentElement.scrollLeft,
				y: event.clientY + document.documentElement.scrollTop
			};
		};
	} else {
		return function(event) {
			return {
				x: event.pageX,
				y: event.pageY
			};
		};
	}
})();

//////////////// MouseWheel ////////////////

Event.mousewheel = function(target, listener, timeout) {
	var interval = 0;
	var self = Event(target, "mousewheel", function(event) {
		event = event || window.event;
		var wheelData = event.detail ? event.detail * -1 : event.wheelDelta / 40;
		listener(event, "wheel", wheelData);
		window.clearInterval(interval);
		interval = window.setInterval(function() {
			window.clearInterval(interval);
			listener(event, "wheelup", wheelData, self);
		}, timeout || 150);
	});
	return self;
};

///// DOM.absPos

var abPos = function(o) { 
	o = typeof(o) === 'object' ? o : document.getElementById(o);
	var offset = { x: 0, y: 0 };
	while(o != null) { 
		offset.x += o.offsetLeft; 
		offset.y += o.offsetTop; 
		o = o.offsetParent; 
	};
	return offset;
};