/*
	-------------------------------------------------------
	dom/Animate : 0.2.1 : 2015-05-03 : https://sketch.io
	-------------------------------------------------------
	var animation = dom.animate(document.body, {
		keyframes: [
			{transform: 'scale(1)'},
			{transform: 'scale(1.1)'},
			{transform: 'scale(1)'}
		],
		timing: {
			duration: 250,
			iterations: 1
		}
	});
	
	var animation = dom.animate(document.body, {
		name: 'fadein'
	});
	
	animation.cancel();
	
*/

if (typeof galactic === 'undefined') galactic = {};

(function(root) {

	var dom = root.dom || (root.dom = {});
	var util = root.util || (root.util = {});

	/* Animations
	---------------------------------------------------------- */
	var defs = {};
	
	function initialize() {
		defs.fadein = {
			keyframes: [
				{opacity: 0},
				{opacity: 1}
			],
			timing: {
				ease: 'ease-out',
				duration: 250,
				iterations: 1
			}
		};

		defs.fadeout = {
			keyframes: [
				{opacity: 1},
				{opacity: 0}
			],
			timing: {
				ease: 'ease-out',
				duration: 250,
				iterations: 1
			}
		};

		defs.zoomout = {
			keyframes: [
				{transform: 'scale(1) rotate(0deg)'},
				{transform: 'scale(0) rotate(180deg)'}
			],
			timing: {
				ease: 'ease-out',
				duration: 250,
				iterations: 1
			}
		};

		defs.radar = {
			keyframes: [
				{offset: 0.00, opacity: 0.00, transform: 'scale(1)'},
				{offset: 0.01, opacity: 0.35, transform: 'scale(1)'},
				{offset: 0.80, opacity: 0.00, transform: 'scale(1.1)'},
				{offset: 1.00, opacity: 0.00, transform: 'scale(1.1)'}
			],
			timing: {
				duration: 1250,
				iterations: Infinity
			}
		};

		defs.pulse = {
			keyframes: [
				{transform: 'scale(1)'},
				{transform: 'scale(1.1)'},
				{transform: 'scale(1)'}
			],
			timing: {
				duration: 250,
				iterations: 1
			}
		};

		defs.heartbeat = util.copyInto({
			timing: {
				iterations: 2
			}
		}, util.copy(defs.pulse));
	};


	/* Animate
	---------------------------------------------------------- */
	function extend(param, from, to) {
		to[param] = function() {
			from[param].call(from, arguments);
		};
	};

	dom.animate = function(node, opts) {
		if (!defs.fadein) initialize();
		///	
		if (typeof opts === 'string') opts = {name: opts};
		var node = dom.$(node);
		var onfinish = opts.onfinish;
		var retainState = opts.retainState;
		///
		var res = {};
		var animation = defs[opts.name];
		if (animation) {
			var keyframes = util.copy(animation.keyframes);
			var timing = util.copy(animation.timing);
			for (var opt in opts) {
				timing[opt] = opts[opt];
			}
		} else {
			var keyframes = opts.keyframes;
			var timing = opts.timing;
		}
		///
		requestAnimationFrame(function() {
			var now = Date.now();
			var player = node.animate(keyframes, timing);
			player.onfinish = function() {
				if (retainState) {
					var keyframe = keyframes[keyframes.length - 1];
					for (var param in keyframe) {
						node.style[param] = keyframe[param];
					}
				}
				///
// 				console.log(player.canceled);
				///
				onfinish && onfinish();
			};
			///
			for (var param in player) {
				extend(param, player, res);
			}
		});

		return res;
	};
	
	dom.animate.cancel = function(player) {
		if (player && player.cancel) {
			player.canceled = true;
			player.cancel();
		};
	};

})(galactic);