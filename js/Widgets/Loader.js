/* 
	----------------------------------------------------
	Loader.js : 0.3 : 2012/04/12
	----------------------------------------------------
	https://github.com/mudcube/Loader.js
	----------------------------------------------------
	var loader = new widgets.Loader({ message: "loading: New loading message..." });
	----------------------------------------------------
	var loader = new widgets.Loader({
		id: "loader",
		bars: 12,
		radius: 0,
		lineWidth: 20,
		lineHeight: 70,
		background: "rgba(0,0,0,0.5)",
		message: "loading...",
		callback: function() {
			// call function once loader has started	
		}
	});
	loader.stop();	
	----------------------------------------------------
	loader.message("loading: New loading message...", function() {
		// call function once loader has started	
	});
*/

if (typeof(widgets) === "undefined") var widgets = {};

widgets.Loader = (function(root) { "use strict";

var PI = Math.PI;
var defaultConfig = { 
	id: "loader",
	bars: 12,
	radius: 0,
	lineWidth: 20,
	lineHeight: 70,
	display: true
};

var getWindowSize = function() {
	if (window.innerWidth && window.innerHeight) {
		var width = window.innerWidth;
		var height = window.innerHeight;
	} else if (document.compatMode === 'CSS1Compat' && document.documentElement && document.documentElement.offsetWidth) {
		var width = document.documentElement.offsetWidth;
		var height = document.documentElement.offsetHeight;
	} else if (document.body && document.body.offsetWidth) {
		var width = document.body.offsetWidth;
		var height = document.body.offsetHeight;
	}
	return {
		width: width,
		height: height
	};
};

return function (conf) {
	var that = this;
	if (!document.createElement("canvas").getContext) return;
	var that = this;
	if (!document.body) return;
	if (typeof(conf) === "string") conf = { message: conf };
	if (typeof(conf) === "undefined") conf = {};
	if (typeof(conf) === "boolean") conf = { display: false };
	for (var key in defaultConfig) {
		if (typeof(conf[key]) === "undefined") {
			conf[key] = defaultConfig[key];
		}
	}
	//
	function centerSpan() {
		if (conf.message) {
			var windowSize = getWindowSize();
			var width = windowSize.width - size;
			var height = windowSize.height - size;
			that.span.style.left = ((width + size) / 2  - that.span.offsetWidth/2) + "px";
			that.span.style.top = (height / 2 + size - 10) + "px";
		}
	};
	///
	var canvas = document.getElementById(conf.id);
	var timeout = 1;
	if (!canvas) {
		var div = document.createElement("div");
		var span = document.createElement("span");
		div.appendChild(span);
		div.className = defaultConfig.id;
		that.span = span;
		that.div = div;
		var canvas = document.createElement("canvas");
		document.body.appendChild(canvas);
		canvas.id = conf.id;
		canvas.style.cssText = "opacity: 1; position: absolute; z-index: 10000;";
		div.appendChild(canvas);
		document.body.appendChild(div);
	} else {
		that.span = canvas.parentNode.getElementsByTagName("span")[0];
	}
	//
	var delay = conf.delay;
	var bars = conf.bars;
	var radius = conf.radius;
	var max = conf.lineHeight + 20;
	var size = max * 2 + conf.radius * 2;
	var windowSize = getWindowSize();
	var width = windowSize.width - size;
	var height = windowSize.height - size;
	///
	canvas.width = size;
	canvas.height = size;
	canvas.style.left = (width / 2) + "px";
	canvas.style.top = (height / 2) + "px";
	///
	centerSpan();
	///
	var offset = 0;
	var ctx = canvas.getContext('2d');
	ctx.globalCompositeOperation = "lighter";
	ctx.shadowOffsetX = 1;
	ctx.shadowOffsetY = 1;
	ctx.shadowBlur = 1;
	ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
	//
	function animate() {
		var windowSize = getWindowSize();
		var width = windowSize.width - size;
		var height = windowSize.height - size;
		//
		canvas.style.left = (width / 2) + "px";
		canvas.style.top = (height / 2) + "px";
		centerSpan();
		//
		ctx.save();
		ctx.clearRect(0, 0, size, size);
		ctx.translate(size / 2, size / 2);
		var hues = 360 - 360 / bars;
		for (var i = 0; i < bars; i++) {
			var angle = (i / bars * 2 * PI) + offset;
			ctx.save();
			ctx.translate(radius * Math.sin(-angle), radius * Math.cos(-angle));
			ctx.rotate(angle);
			// round-rect properties
			var x = -conf.lineWidth / 2;
			var y = 0;
			var width = conf.lineWidth;
			var height = conf.lineHeight;
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
		offset += 0.07;
		//
		if (conf.messageAnimate) {
			var iteration = offset / 0.07 >> 0;
			if (iteration % 10 === 0) {
				var length = conf.messageAnimate.length;
				var n = iteration / 10 % length;
				that.span.innerHTML = conf.message + conf.messageAnimate[n];
			}
		}
	};
	this.css = function() {
		var background = conf.background ? conf.background : "rgba(0,0,0,0.65)";
		span.style.cssText = "font-family: monospace; font-size: 14px; opacity: 1; display: none; background: "+background+"; border-radius: 10px; padding: 10px; width: 200px; text-align: center; position: absolute; z-index: 10000;";
		div.style.cssText = "color: #fff; -webkit-transition-property: opacity; -webkit-transition-duration: " + timeout + "s; position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 100000; opacity: 0; display: none";
		if (this.stopPropagation) {
			div.style.cssText += "background: rgba(0,0,0,0.25);";
		} else {
			div.style.cssText += "pointer-events: none;";
		}
	};
	this.stop = function () {
		setTimeout(function() {
			window.clearInterval(that.interval);
			delete that.interval;
		}, 50);
		if (canvas && canvas.style) {
			div.style.cssText += "pointer-events: none;";
			canvas.parentNode.style.opacity = 0;
			window.setTimeout(function () {
				that.stopPropagation = false;
				canvas.parentNode.style.display = "none";
				ctx.clearRect(0, 0, size, size);
			}, timeout * 1000);
		}
	};
	this.start = function (callback) {
		this.css();
		var windowSize = getWindowSize();
		var width = windowSize.width - size;
		var height = windowSize.height - size;
		canvas.parentNode.style.opacity = 1;
		canvas.parentNode.style.display = "block";
		that.span.style.display = conf.message ? "block" : "none";
		if (conf.background) that.div.style.background = conf.backgrond;
		canvas.style.left = (width / 2) + "px";
		canvas.style.top = (height / 2) + "px";
		if (!conf.delay) animate();
		window.clearInterval(this.interval);
		this.interval = window.setInterval(animate, 30);
		if (conf.message) {
			compileMessage(conf.message, callback);
		}
	};
	this.message = function(message, callback) {
		conf.message = message;
		if (!this.interval) return this.start(callback);
		if (conf.background) that.span.style.background = conf.backgrond;
		compileMessage(conf.message, callback);
		that.span.style.display = conf.message ? "block" : "none";
	};
	var compileMessage = function(message, callback) {
		if (message.substr(-3) === "...") {
			conf.message = message.substr(0, message.length - 3);
			conf.messageAnimate = [ ".&nbsp;&nbsp;","..&nbsp;","..." ].reverse();
			that.span.innerHTML = conf.message + conf.messageAnimate[0];
		} else {
			conf.messageAnimate = false;
			that.span.innerHTML = conf.message;
		}
		if (callback) {
			setTimeout(callback, 50);
		}
	};
	//
	if (conf.display === false) return this;
	//
	this.css();
	this.start();
	//
	return this;
};

})(widgets);