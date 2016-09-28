/*
	----------------------------------------------------------
	ui/Timer : 0.1.1 : 2015-03-23 : https://sketch.io
	----------------------------------------------------------
*/

if (typeof sketch === 'undefined') sketch = {};

(function(root) { 'use strict';

root.ui = root.ui || {};
root.ui.Timer = function(opts) {
	opts = opts || {};
	///
	var that = this;
	///
	var size;
	var format;
	var container;
	var endValue;
	var value;
	///
	var RAD_DEG = 180.0 / Math.PI; // Radians to Degrees
	var DEG_RAD = 1.0 / RAD_DEG; // Degrees to Radians
	///
	var setParams = function(opts) {
		size = opts.size || 120;
		format = opts.format || 'percent';
		container = opts.container || document.body;
		endValue = opts.endValue;
		value = opts.value || 0;
	};
	///
	var getPosition = function() {
		if (format === 'percent') {
			return {
				value: value,
				format: 'PERCENT',
				percent: value / 100
			}
		} else if (format === 'time') {
			var elapse = (Date.now() - startTime) / 1000;
			var otime = endValue - elapse;
			var percent = elapse / endValue;
			///
			var time = Math.max(0, Math.round(otime));
			var hours = (time / 3600) >> 0;
			var minutes = ((time - (hours * 3600)) / 60) >> 0;
			var seconds = time - (hours * 3600) - (minutes * 60);
			if (seconds < 10 && minutes) seconds = '0' + seconds;
			///
			if (minutes) {
				return {
					value: minutes,
					format: 'MINUTES',
					percent: percent
				};
			} else {
				return {
					value: seconds,
					format: 'SECONDS',
					percent: percent
				};
			}
		}
	};

	var gradient = ['#9cdb7d', '#99d97f', '#97d782', '#95d684', '#93d487', '#91d38a', '#8fd18c', '#8dcf8f', '#8bce91', '#89cc94', '#87cb97', '#85c999', '#83c89c', '#81c69e', '#7fc4a1', '#7dc3a4', '#7bc1a6', '#79c0a9', '#77beab', '#75bcae', '#73bbb1', '#71b9b3', '#6fb8b6', '#6db6b8', '#6bb5bb', '#69b3be', '#67b1c0', '#65b0c3', '#63aec5', '#61adc8', '#5fabcb', '#5daacd', '#5ba8d0', '#59a6d2', '#57a5d5', '#55a3d8', '#53a2da', '#51a0dd', '#4f9edf', '#4d9de2', '#4b9be5', '#499ae7', '#4798ea', '#4597ec', '#4395ef', '#4193f2', '#3f92f4', '#3d90f7', '#3b8ff9', '#398dfc', '#378cff'];
	///
	var requestId;
	var pulse = 0;
	var startTime = Date.now(); // 'time' format
	var render = function() {
		var obj = getPosition();
		///
		ctx.fillStyle = gradient[Math.round((1.0 - obj.percent) * 50)];
		///
// 		pulse ++;
		///
		var startAngle = -360 * DEG_RAD;
		var endAngle = obj.percent * 360 * DEG_RAD;
		var outerRadius = size / 2.0 + (pulse % 20);
		var innerRadius = size / 2.0 * 0.61 + (pulse % 20);
		///
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		ctx.save();
		///
		ctx.beginPath()
		ctx.arc(outerRadius, outerRadius, outerRadius, startAngle, endAngle, false);
		ctx.arc(outerRadius, outerRadius, innerRadius, endAngle, startAngle, true);
		ctx.globalAlpha = 0.25;
		ctx.fill();
		///
		startAngle += 360 * DEG_RAD;
		///
		ctx.beginPath()
		ctx.arc(outerRadius, outerRadius, outerRadius, startAngle, endAngle, false);
		ctx.arc(outerRadius, outerRadius, innerRadius, endAngle, startAngle, true);
		ctx.globalAlpha = 1.0;
		ctx.fill();
		///
		var ratio = size / 260;
		var fontSize = ratio * 26;
		var fontFamily = '"Trebuchet MS", Arial, Helvetica, sans-serif';
		ctx.font = 'bold ' + fontSize + 'px ' + fontFamily;
		ctx.textBaseline = 'top';
		ctx.textAlign = 'center';
		ctx.fillText(obj.format, outerRadius, outerRadius + ratio * 14);
		///
		var fontSize = ratio * 46;
		ctx.font = 'bold ' + fontSize + 'px ' + fontFamily;
		ctx.fillStyle = '#ffffff';
		ctx.fillText(obj.value, outerRadius, outerRadius - ratio * 44);
		ctx.restore();
		///
		if (obj.percent < 1.0) {
			requestId = requestAnimationFrame(render);
		}
	};
	///
	setParams(opts);
	///
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = size;
	canvas.height = size;
	///
	var parent = document.createElement('div');
	parent.style.display = 'none';
	parent.className = 'sk-timer';
	parent.appendChild(canvas);
	///
	container.appendChild(parent);
	///
	if (opts.onstart) {
		setTimeout(opts.onstart, 250);
	}

	/* Public 
	---------------------------------------------------------- */
	that.reset = function() {
		setParams(opts);
	};

	that.destroy = function() {
		container.removeChild(canvas);
	};

	that.hidden = false;

	that.hide = function(callback) {
		cancelAnimationFrame(requestId);
		///
		that.hidden = true;
		parent.style.transition = 'opacity .35s';
		parent.style.opacity = 0;
		setTimeout(function() {
			parent.style.display = 'none';
			callback && callback();
		}, 350);
	};

	that.setValue = function(percent) {
		cancelAnimationFrame(requestId);
		///
		that.hidden = false;
		parent.style.display = 'block';
		parent.style.opacity = 1.0;
		///
		if ((value = Math.ceil(percent)) >= 100) {
			that.hide();
		}
		///
		render();
	};

	addStyleSheet();

	return that;

};

var addStyleSheet = function() {
	if (document.getElementById('sk-timer-stylesheet') == null) {
		var style = document.createElement('style');
		style.id = 'sk-timer-stylesheet';
		style.innerHTML = '.sk-timer {\
				position: absolute;\
				z-index: 1000;\
				top: 0;\
				left: 0;\
				width: 100%;\
				height: 100%;\
			}\
			.sk-timer canvas {\
				border: 3px solid #000;\
				border-radius: 50%;\
				background: #000;\
				margin: auto;\
				position: absolute;\
				top: 0;\
				left: 0;\
				right: 0;\
				bottom: 0;\
			}\
		';
		document.head.appendChild(style);
	}
};

})(sketch);