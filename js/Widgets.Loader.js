/*
	var loader = new widgets.Loader({
		id: "loader",
		bars: 12,
		radius: 20,
		lineWidth: 3,
		lineHeight: 10
	});
	loader.stop();	

	loader.message("New loading message...");

*/

if (typeof(widgets) === "undefined") widgets = {};

(function(root) {

var PI = Math.PI;
var defaultConfig = { 
	id: "loader",
	bars: 12,
	radius: 0,
	lineWidth: 20,
	lineHeight: 70
};

root.Loader = function (config) {
	var that = this;
	if (!document.body) return;
	if (!config) config = {};
	for (var key in defaultConfig) {
		if (typeof(config[key]) === "undefined") {
			config[key] = defaultConfig[key];
		}
	}
	//
	var canvas = document.getElementById(config.id);
	if (!canvas) {
		var div = document.createElement("div");
		div.style.cssText = "color: #fff; pointer-events: none; -webkit-transition-property: opacity; -webkit-transition-duration: .5s; position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 10000; background: rgba(0,0,0,0.5); opacity: 1";
		if (config.message) {
			var span = document.createElement("span");
			span.style.cssText = "font-family: courier; opacity: 1; display: inline-block;background: rgba(0,0,0,0.65); border-radius: 10px; padding: 10px; width: 200px; text-align: center; position: absolute; z-index: 1000;";
			div.appendChild(span);
			that.span = span;
		}
		var canvas = document.createElement("canvas");
		document.body.appendChild(canvas);
		canvas.id = config.id;
		canvas.style.cssText = "opacity: 1; position: absolute; z-index: 1000;";
		div.appendChild(canvas);
		document.body.appendChild(div);
	}
	if (window.innerWidth && window.innerHeight) {
		var width = window.innerWidth;
		var height = window.innerHeight;
	} else if (document.body && document.body.offsetWidth) {
		var width = document.body.offsetWidth;
		var height = document.body.offsetHeight;
	} else if (document.compatMode === "CSS1Compat" && document.documentElement && document.documentElement.offsetWidth ) {
		var width = document.documentElement.offsetWidth;
		var height = document.documentElement.offsetHeight;
	}
	var max = config.lineHeight + 20;
	var size = max * 2 + config.radius;
	width -= size;
	height -= size;
	canvas.width = size;
	canvas.height = size;
	canvas.style.left = (width / 2) + "px";
	canvas.style.top = (height / 2) + "px";
	if (config.message) {
		that.span.style.left = ((width + size) / 2  - that.span.offsetWidth/2) + "px";
		that.span.style.top = (height / 2 + size - 10) + "px";
	}
	var that = this;
	var interval = 0;
	var offset = 0;
	var delay = config.delay;
	var bars = config.bars;
	var radius = config.radius;
	var ctx = canvas.getContext('2d');
	ctx.globalCompositeOperation = "lighter";
	ctx.shadowOffsetX = 1;
	ctx.shadowOffsetY = 1;
	ctx.shadowBlur = 1;
	ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
	//
	function animate() {
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
			var x = -config.lineWidth / 2;
			var y = 0;
			var width = config.lineWidth;
			var height = config.lineHeight;
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
		if (config.messageAnimate) {
			var iteration = offset / 0.07 >> 0;
			if (iteration % 10 == 0) {
				var length = config.messageAnimate.length;
				var n = iteration / 10 % length;
				that.span.innerHTML = config.message + config.messageAnimate[n];
			}
		}
	};
	//
	this.message = function(message) {
		if (!interval) this.start();
		config.message = message;
		if (message.substr(-3) === "...") {
			config.message = message.substr(0, message.length - 3);
			config.messageAnimate = [ ".&nbsp;&nbsp;","..&nbsp;","..." ].reverse();
		} else {
			config.messageAnimate = false;
		}
		that.span.innerHTML = config.message + (config.messageAnimate[0] || "");
	};
	//
	this.stop = function () {
		if (interval) {
			window.clearInterval(interval);
			interval = 0;
		}
		if (canvas && canvas.style) {
			canvas.parentNode.style.opacity = 0;
			window.setTimeout(function () {
				canvas.parentNode.style.display = "none";
				ctx.clearRect(0, 0, size, size);
			}, 500);
		}
	};
	//
	this.start = function (max) {
		if (interval) return;
		canvas.parentNode.style.top = document.body.scrollTop + "px";
		canvas.parentNode.style.opacity = 1;
		canvas.parentNode.style.display = "block";
		canvas.style.left = (width / 2) + "px";
		canvas.style.top = (height / 2) + "px";
		if (!config.delay) animate();
		interval = window.setInterval(animate, 30);
		if (config.message) {
			this.message(config.message);
		}
	};
	//
	this.start(30 * 1000);
	//
	return this;
};

})(widgets);