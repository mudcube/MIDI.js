/*
	Copyright (c) 2012 DinahMoe AB

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
	files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy,
	modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
	is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
	OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	Bitcrusher & Moog Filter by Zach Denton
*/

// https://developer.mozilla.org/en-US/docs/Web_Audio_API/Porting_webkitAudioContext_code_to_standards_based_AudioContext

// Originally written by Alessandro Saccoia, Chris Coniglio and Oskar Eriksson

// Synced w/ Jul 23, 2014

(function(window) {
	var userContext;
	var userInstance;
	var Tuna = function(context) {
			if (!window.AudioContext) {
				window.AudioContext = window.webkitAudioContext;
			}
			if (!context) {
				console.log('tuna.js: Missing audio context! Creating a new context for you.');
				context = window.AudioContext && (new window.AudioContext());
			}
			userContext = context;
			userInstance = this;
		},
		version = '0.1',
		set = 'setValueAtTime',
		linear = 'linearRampToValueAtTime',
		pipe = function(param, val) {
			param.value = val;
		},
		Super = Object.create(null, {
			activate: {
				writable: true,
				value: function(doActivate) {
					if (doActivate) {
						this.input.disconnect();
						this.input.connect(this.activateNode);
						if (this.activateCallback) {
							this.activateCallback(doActivate);
						}
					} else {
						this.input.disconnect();
						this.input.connect(this.output);
					}
				}
			},
			bypass: {
				get: function() {
					return this._bypass;
				},
				set: function(value) {
					if (this._lastBypassValue === value) {
						return;
					}
					this._bypass = value;
					this.activate(!value);
					this._lastBypassValue = value;
				}
			},
			connect: {
				value: function(target) {
					this.output.connect(target);
				}
			},
			disconnect: {
				value: function(target) {
					this.output.disconnect(target);
				}
			},
			connectInOrder: {
				value: function(nodeArray) {
					var i = nodeArray.length - 1;
					while(i--) {
						if (!nodeArray[i].connect) {
							return console.error('AudioNode.connectInOrder: TypeError: Not an AudioNode.', nodeArray[i]);
						}
						if (nodeArray[i + 1].input) {
							nodeArray[i].connect(nodeArray[i + 1].input);
						} else {
							nodeArray[i].connect(nodeArray[i + 1]);
						}
					}
				}
			},
			getDefaults: {
				value: function() {
					var result = {};
					for(var key in this.defaults) {
						result[key] = this.defaults[key].value;
					}
					return result;
				}
			},
			getValues: {
				value: function() {
					var result = {};
					for(var key in this.defaults) {
						result[key] = this[key];
					}
					return result;
				}
			},
			automate: {
				value: function(property, value, duration, startTime) {
					var start = startTime ? ~~ (startTime / 1000) : userContext.currentTime,
						dur = duration ? ~~ (duration / 1000) : 0,
						_is = this.defaults[property],
						param = this[property],
						method;

					if (param) {
						if (_is.automatable) {
							if (!duration) {
								method = set;
							} else {
								method = linear;
								param.cancelScheduledValues(start);
								param.setValueAtTime(param.value, start);
							}
							param[method](value, dur + start);
						} else {
							param = value;
						}
					} else {
						console.error('Invalid Property for ' + this.name);
					}
				}
			}
		}),
		FLOAT = 'float',
		BOOLEAN = 'boolean',
		STRING = 'string',
		INT = 'int';

	function dbToWAVolume(db) {
		return Math.max(0, Math.round(100 * Math.pow(2, db / 6)) / 100);
	}

	function fmod(x, y) {
		// http://kevin.vanzonneveld.net
		// +   original by: Onno Marsman
		// +	  input by: Brett Zamir (http://brett-zamir.me)
		// +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// *	 example 1: fmod(5.7, 1.3);
		// *	 returns 1: 0.5
		var tmp, tmp2, p = 0,
			pY = 0,
			l = 0.0,
			l2 = 0.0;

		tmp = x.toExponential().match(/^.\.?(.*)e(.+)$/);
		p = parseInt(tmp[2], 10) - (tmp[1] + '').length;
		tmp = y.toExponential().match(/^.\.?(.*)e(.+)$/);
		pY = parseInt(tmp[2], 10) - (tmp[1] + '').length;

		if (pY > p) {
			p = pY;
		}

		tmp2 = (x % y);

		if (p < -100 || p > 20) {
			// toFixed will give an out of bound error so we fix it like this:
			l = Math.round(Math.log(tmp2) / Math.log(10));
			l2 = Math.pow(10, l);

			return(tmp2 / l2).toFixed(l - p) * l2;
		} else {
			return parseFloat(tmp2.toFixed(-p));
		}
	}

	function sign(x) {
		if (x === 0) {
			return 1;
		} else {
			return Math.abs(x) / x;
		}
	}

	function tanh(n) {
		return(Math.exp(n) - Math.exp(-n)) / (Math.exp(n) + Math.exp(-n));
	};
	
	var proto = Tuna.prototype;

	Tuna.toString = proto.toString = function() {
		return 'You are running Tuna version ' + version + ' by Dinahmoe!';
	};

	proto.Filter = function(args) {
		args = args || this.getDefaults();
		
		this.input = userContext.createGain();
		this.activateNode = userContext.createGain();
		this.filter = userContext.createBiquadFilter();
		this.output = userContext.createGain();

		this.activateNode.connect(this.filter);
		this.filter.connect(this.output);

		this.frequency = args.frequency || this.defaults.frequency.value;
		this.Q = args.resonance || this.defaults.Q.value;
		this.filterType = args.filterType || this.defaults.filterType.value;
		this.gain = args.gain || this.defaults.gain.value;
		this.bypass = args.bypass || false;
	};

	proto.Filter.prototype = Object.create(Super, {
		name: {
			value: 'Filter'
		},
		defaults: {
			writable: true,
			value: {
				frequency: {
					value: 800,
					min: 20,
					max: 22050,
					automatable: true
				},
				Q: {
					value: 1,
					min: 0.001,
					max: 100,
					automatable: true
				},
				gain: {
					value: 0,
					min: -40,
					max: 40,
					automatable: true
				},
				bypass: {
					value: true,
					automatable: false,
					type: BOOLEAN
				},
				filterType: {
					value: 1,
					min: 0,
					max: 7,
					automatable: false,
					type: INT
				}
			}
		},
		filterType: {
			enumerable: true,
			get: function() {
				return this.filter.type;
			},
			set: function(value) {
				this.filter.type = value;
			}
		},
		Q: {
			enumerable: true,
			get: function() {
				return this.filter.Q;
			},
			set: function(value) {
				this.filter.Q.value = value;
			}
		},
		gain: {
			enumerable: true,
			get: function() {
				return this.filter.gain;
			},
			set: function(value) {
				this.filter.gain.value = value;
			}
		},
		frequency: {
			enumerable: true,
			get: function() {
				return this.filter.frequency;
			},
			set: function(value) {
				this.filter.frequency.value = value;
			}
		}
	});

	proto.Bitcrusher = function(args) {
		args = args || this.getDefaults();

		this.bufferSize = args.bufferSize || this.defaults.bufferSize.value;

		this.input = userContext.createGain();
		this.activateNode = userContext.createGain();
		this.processor = userContext.createScriptProcessor(this.bufferSize, 1, 1);
		this.output = userContext.createGain();

		this.activateNode.connect(this.processor);
		this.processor.connect(this.output);

		var phaser = 0, last = 0;
		this.processor.onaudioprocess = function(e) {
			var input = e.inputBuffer.getChannelData(0),
				output = e.outputBuffer.getChannelData(0),
				step = Math.pow(1/2, this.bits);
			for(var i = 0; i < input.length; i++) {
				phaser += this.normfreq;
				if (phaser >= 1.0) {
					phaser -= 1.0;
					last = step * Math.floor(input[i] / step + 0.5);
				}
				output[i] = last;
			}
		};

		this.bits = args.bits || this.defaults.bits.value;
		this.normfreq = args.normfreq || this.defaults.normfreq.value;
		this.bypass = args.bypass || false;
	};

	proto.Bitcrusher.prototype = Object.create(Super, {
		name: {
			value: 'Bitcrusher'
		},
		defaults: {
			writable: true,
			value: {
				bits: {
					value: 4,
					min: 1,
					max: 16,
					automatable: false,
					type: INT
				},
				bufferSize: {
					value: 4096,
					min: 256,
					max: 16384,
					automatable: false,
					type: INT
				},
				bypass: {
					value: false,
					automatable: false,
					type: BOOLEAN
				},
				normfreq: {
					value: 0.1,
					min: 0.0001,
					max: 1.0,
					automatable: false,
				}
			}
		},
		bits: {
			enumerable: true,
			get: function() {
				return this.processor.bits;
			},
			set: function(value) {
				this.processor.bits = value;
			}
		},
		normfreq: {
			enumerable: true,
			get: function() {
				return this.processor.normfreq;
			},
			set: function(value) {
				this.processor.normfreq = value;
			}
		}
	});

	proto.Cabinet = function(args) {
		args = args || this.getDefaults();

		this.input = userContext.createGain();
		this.activateNode = userContext.createGain();
		this.convolver = this.newConvolver(args.impulsePath || '../impulses/impulse_guitar.wav');
		this.makeupNode = userContext.createGain();
		this.output = userContext.createGain();

		this.activateNode.connect(this.convolver.input);
		this.convolver.output.connect(this.makeupNode);
		this.makeupNode.connect(this.output);

		this.makeupGain = args.makeupGain || this.defaults.makeupGain;
		this.bypass = args.bypass || false;
	};

	proto.Cabinet.prototype = Object.create(Super, {
		name: {
			value: 'Cabinet'
		},
		defaults: {
			writable: true,
			value: {
				makeupGain: {
					value: 1,
					min: 0,
					max: 20,
					automatable: true
				},
				bypass: {
					value: false,
					automatable: false,
					type: BOOLEAN
				}
			}
		},
		makeupGain: {
			enumerable: true,
			get: function() {
				return this.makeupNode.gain;
			},
			set: function(value) {
				this.makeupNode.gain.value = value;
			}
		},
		newConvolver: {
			value: function(impulsePath) {
				return new userInstance.Convolver({
					impulse: impulsePath,
					dryLevel: 0,
					wetLevel: 1
				});
			}
		}
	});

	proto.Chorus = function(args) {
		args = args || this.getDefaults();

		this.input = userContext.createGain();
		this.attenuator = this.activateNode = userContext.createGain();
		this.splitter = userContext.createChannelSplitter(2);
		this.delayL = userContext.createDelay();
		this.delayR = userContext.createDelay();
		this.feedbackGainNodeLR = userContext.createGain();
		this.feedbackGainNodeRL = userContext.createGain();
		this.merger = userContext.createChannelMerger(2);
		this.output = userContext.createGain();

		this.lfoL = new userInstance.LFO({
			target: this.delayL.delayTime,
			callback: pipe
		});
		this.lfoR = new userInstance.LFO({
			target: this.delayR.delayTime,
			callback: pipe
		});

		this.input.connect(this.attenuator);
		this.attenuator.connect(this.output);
		this.attenuator.connect(this.splitter);
		this.splitter.connect(this.delayL, 0);
		this.splitter.connect(this.delayR, 1);
		this.delayL.connect(this.feedbackGainNodeLR);
		this.delayR.connect(this.feedbackGainNodeRL);
		this.feedbackGainNodeLR.connect(this.delayR);
		this.feedbackGainNodeRL.connect(this.delayL);
		this.delayL.connect(this.merger, 0, 0);
		this.delayR.connect(this.merger, 0, 1);
		this.merger.connect(this.output);

		this.feedback = args.feedback || this.defaults.feedback.value;
		this.rate = args.rate || this.defaults.rate.value;
		this.delay = args.delay || this.defaults.delay.value;
		this.depth = args.depth || this.defaults.depth.value;
		this.lfoR.phase = Math.PI / 2;
		this.attenuator.gain.value = 0.6934; // 1 / (10 ^ (((20 * log10(3)) / 3) / 20))
		this.lfoL.activate(true);
		this.lfoR.activate(true);
		this.bypass = args.bypass || false;
	};

	proto.Chorus.prototype = Object.create(Super, {
		name: {
			value: 'Chorus'
		},
		defaults: {
			writable: true,
			value: {
				feedback: {
					value: 0.4,
					min: 0,
					max: 0.95,
					automatable: false,
				},
				delay: {
					value: 0.0045,
					min: 0,
					max: 1,
					automatable: false,
				},
				depth: {
					value: 0.7,
					min: 0,
					max: 1,
					automatable: false,
				},
				rate: {
					value: 1.5,
					min: 0,
					max: 8,
					automatable: false,
				},
				bypass: {
					value: true,
					automatable: false,
					type: BOOLEAN
				}
			}
		},
		delay: {
			enumerable: true,
			get: function() {
				return this._delay;
			},
			set: function(value) {
				this._delay = 0.0002 * (Math.pow(10, value) * 2);
				this.lfoL.offset = this._delay;
				this.lfoR.offset = this._delay;
				this._depth = this._depth;
			}
		},
		depth: {
			enumerable: true,
			get: function() {
				return this._depth;
			},
			set: function(value) {
				this._depth = value;
				this.lfoL.oscillation = this._depth * this._delay;
				this.lfoR.oscillation = this._depth * this._delay;
			}
		},
		feedback: {
			enumerable: true,
			get: function() {
				return this._feedback;
			},
			set: function(value) {
				this._feedback = value;
				this.feedbackGainNodeLR.gain.value = this._feedback;
				this.feedbackGainNodeRL.gain.value = this._feedback;
			}
		},
		rate: {
			enumerable: true,
			get: function() {
				return this._rate;
			},
			set: function(value) {
				this._rate = value;
				this.lfoL.frequency = this._rate;
				this.lfoR.frequency = this._rate;
			}
		}
	});

	proto.Compressor = function(args) {
		args = args || this.getDefaults();

		this.input = userContext.createGain();
		this.compNode = this.activateNode = userContext.createDynamicsCompressor();
		this.makeupNode = userContext.createGain();
		this.output = userContext.createGain();

		this.compNode.connect(this.makeupNode);
		this.makeupNode.connect(this.output);

		this.automakeup = args.automakeup || this.defaults.automakeup.value;
		this.makeupGain = args.makeupGain || this.defaults.makeupGain.value;
		this.threshold = args.threshold || this.defaults.threshold.value;
		this.release = args.release || this.defaults.release.value;
		this.attack = args.attack || this.defaults.attack.value;
		this.ratio = args.ratio || this.defaults.ratio.value;
		this.knee = args.knee || this.defaults.knee.value;
		this.bypass = args.bypass || false;
	};

	proto.Compressor.prototype = Object.create(Super, {
		name: {
			value: 'Compressor'
		},
		defaults: {
			writable: true,
			value: {
				threshold: {
					value: -20,
					min: -60,
					max: 0,
					automatable: true
				},
				release: {
					value: 250,
					min: 10,
					max: 2000,
					automatable: true
				},
				makeupGain: {
					value: 1,
					min: 1,
					max: 100,
					automatable: true
				},
				attack: {
					value: 1,
					min: 0,
					max: 1000,
					automatable: true
				},
				ratio: {
					value: 4,
					min: 1,
					max: 50,
					automatable: true
				},
				knee: {
					value: 5,
					min: 0,
					max: 40,
					automatable: true
				},
				automakeup: {
					value: false,
					automatable: false,
					type: BOOLEAN
				},
				bypass: {
					value: true,
					automatable: false,
					type: BOOLEAN
				}
			}
		},
		computeMakeup: {
			value: function() {
				var magicCoefficient = 4,
					// raise me if the output is too hot
					c = this.compNode;
				return -(c.threshold.value - c.threshold.value / c.ratio.value) / magicCoefficient;
			}
		},
		automakeup: {
			enumerable: true,
			get: function() {
				return this._automakeup;
			},
			set: function(value) {
				this._automakeup = value;
				if (this._automakeup) this.makeupGain = this.computeMakeup();
			}
		},
		threshold: {
			enumerable: true,
			get: function() {
				return this.compNode.threshold;
			},
			set: function(value) {
				this.compNode.threshold.value = value;
				if (this._automakeup) this.makeupGain = this.computeMakeup();
			}
		},
		ratio: {
			enumerable: true,
			get: function() {
				return this.compNode.ratio;
			},
			set: function(value) {
				this.compNode.ratio.value = value;
				if (this._automakeup) this.makeupGain = this.computeMakeup();
			}
		},
		knee: {
			enumerable: true,
			get: function() {
				return this.compNode.knee;
			},
			set: function(value) {
				this.compNode.knee.value = value;
				if (this._automakeup) this.makeupGain = this.computeMakeup();
			}
		},
		attack: {
			enumerable: true,
			get: function() {
				return this.compNode.attack;
			},
			set: function(value) {
				this.compNode.attack.value = value / 1000;
			}
		},
		release: {
			enumerable: true,
			get: function() {
				return this.compNode.release;
			},
			set: function(value) {
				this.compNode.release = value / 1000;
			}
		},
		makeupGain: {
			enumerable: true,
			get: function() {
				return this.makeupNode.gain;
			},
			set: function(value) {
				this.makeupNode.gain.value = dbToWAVolume(value);
			}
		}
	});

	proto.Convolver = function(args) {
		args = args || this.getDefaults();

		this.input = userContext.createGain();
		this.activateNode = userContext.createGain();
		this.convolver = userContext.createConvolver();
		this.dry = userContext.createGain();
		this.filterLow = userContext.createBiquadFilter();
		this.filterHigh = userContext.createBiquadFilter();
		this.wet = userContext.createGain();
		this.output = userContext.createGain();

		this.activateNode.connect(this.filterLow);
		this.activateNode.connect(this.dry);
		this.filterLow.connect(this.filterHigh);
		this.filterHigh.connect(this.convolver);
		this.convolver.connect(this.wet);
		this.wet.connect(this.output);
		this.dry.connect(this.output);

		this.dryLevel = args.dryLevel || this.defaults.dryLevel.value;
		this.wetLevel = args.wetLevel || this.defaults.wetLevel.value;
		this.highCut = args.highCut || this.defaults.highCut.value;
		this.buffer = args.impulse || '../impulses/ir_rev_short.wav';
		this.lowCut = args.lowCut || this.defaults.lowCut.value;
		this.level = args.level || this.defaults.level.value;
		this.filterHigh.type = 'lowpass';
		this.filterLow.type = 'highpass';
		this.bypass = args.bypass || false;
	};

	proto.Convolver.prototype = Object.create(Super, {
		name: {
			value: 'Convolver'
		},
		defaults: {
			writable: true,
			value: {
				highCut: {
					value: 22050,
					min: 20,
					max: 22050,
					automatable: true
				},
				lowCut: {
					value: 20,
					min: 20,
					max: 22050,
					automatable: true
				},
				dryLevel: {
					value: 1,
					min: 0,
					max: 1,
					automatable: true
				},
				wetLevel: {
					value: 1,
					min: 0,
					max: 1,
					automatable: true
				},
				level: {
					value: 1,
					min: 0,
					max: 1,
					automatable: true
				}
			}
		},
		lowCut: {
			get: function() {
				return this.filterLow.frequency;
			},
			set: function(value) {
				this.filterLow.frequency.value = value;
			}
		},
		highCut: {
			get: function() {
				return this.filterHigh.frequency;
			},
			set: function(value) {
				this.filterHigh.frequency.value = value;
			}
		},
		level: {
			get: function() {
				return this.output.gain;
			},
			set: function(value) {
				this.output.gain.value = value;
			}
		},
		dryLevel: {
			get: function() {
				return this.dry.gain
			},
			set: function(value) {
				this.dry.gain.value = value;
			}
		},
		wetLevel: {
			get: function() {
				return this.wet.gain;
			},
			set: function(value) {
				this.wet.gain.value = value;
			}
		},
		buffer: {
			enumerable: false,
			get: function() {
				return this.convolver.buffer;
			},
			set: function(impulse) {
				var convolver = this.convolver,
					xhr = new XMLHttpRequest();
				if (!impulse) {
					console.log('Tuna.Convolver.setBuffer: Missing impulse path!');
					return;
				}
				xhr.open('GET', impulse, true);
				xhr.responseType = 'arraybuffer';
				xhr.onreadystatechange = function() {
					if (xhr.readyState === 4) {
						if (xhr.status < 300 && xhr.status > 199 || xhr.status === 302) {
							userContext.decodeAudioData(xhr.response, function(buffer) {
								convolver.buffer = buffer;
							}, function(e) {
								if (e) console.log('Tuna.Convolver.setBuffer: Error decoding data' + e);
							});
						}
					}
				};
				xhr.send(null);
			}
		}
	});

	proto.Delay = function(args) {
		args = args || this.getDefaults();

		this.input = userContext.createGain();
		this.activateNode = userContext.createGain();
		this.dry = userContext.createGain();
		this.wet = userContext.createGain();
		this.filter = userContext.createBiquadFilter();
		this.delay = userContext.createDelay();
		this.feedbackNode = userContext.createGain();
		this.output = userContext.createGain();

		this.activateNode.connect(this.delay);
		this.activateNode.connect(this.dry);
		this.delay.connect(this.filter);
		this.filter.connect(this.feedbackNode);
		this.feedbackNode.connect(this.delay);
		this.feedbackNode.connect(this.wet);
		this.wet.connect(this.output);
		this.dry.connect(this.output);

		this.delayTime = args.delayTime || this.defaults.delayTime.value;
		this.feedback = args.feedback || this.defaults.feedback.value;
		this.wetLevel = args.wetLevel || this.defaults.wetLevel.value;
		this.dryLevel = args.dryLevel || this.defaults.dryLevel.value;
		this.cutoff = args.cutoff || this.defaults.cutoff.value;
		this.filter.type = 'lowpass';
		this.bypass = args.bypass || false;
	};
	
	proto.Delay.prototype = Object.create(Super, {
		name: {
			value: 'Delay'
		},
		defaults: {
			writable: true,
			value: {
				delayTime: {
					value: 100,
					min: 20,
					max: 1000,
					automatable: false,
				},
				feedback: {
					value: 0.45,
					min: 0,
					max: 0.9,
					automatable: true
				},
				cutoff: {
					value: 20000,
					min: 20,
					max: 20000,
					automatable: true
				},
				wetLevel: {
					value: 0.5,
					min: 0,
					max: 1,
					automatable: true
				},
				dryLevel: {
					value: 1,
					min: 0,
					max: 1,
					automatable: true
				}
			}
		},
		delayTime: {
			enumerable: true,
			get: function() {
				return this.delay.delayTime;
			},
			set: function(value) {
				this.delay.delayTime.value = value / 1000;
			}
		},
		wetLevel: {
			enumerable: true,
			get: function() {
				return this.wet.gain;
			},
			set: function(value) {
				this.wet.gain.value = value;
			}
		},
		dryLevel: {
			enumerable: true,
			get: function() {
				return this.dry.gain;
			},
			set: function(value) {
				this.dry.gain.value = value;
			}
		},
		feedback: {
			enumerable: true,
			get: function() {
				return this.feedbackNode.gain;
			},
			set: function(value) {
				this.feedbackNode.gain.value = value;
			}
		},
		cutoff: {
			enumerable: true,
			get: function() {
				return this.filter.frequency;
			},
			set: function(value) {
				this.filter.frequency.value = value;
			}
		}
	});

	proto.MoogFilter = function(args) {
		args = args || this.getDefaults();

		this.bufferSize = args.bufferSize || this.defaults.bufferSize.value;

		this.input = userContext.createGain();
		this.activateNode = userContext.createGain();
		this.processor = userContext.createScriptProcessor(this.bufferSize, 1, 1);
		this.output = userContext.createGain();

		this.activateNode.connect(this.processor);
		this.processor.connect(this.output);

		var in1, in2, in3, in4, out1, out2, out3, out4;
		in1 = in2 = in3 = in4 = out1 = out2 = out3 = out4 = 0.0;
		this.processor.onaudioprocess = function(e) {
			var input = e.inputBuffer.getChannelData(0),
				output = e.outputBuffer.getChannelData(0),
				f = this.cutoff * 1.16,
				fb = this.resonance * (1.0 - 0.15 * f * f);
			for(var i = 0; i < input.length; i++) {
				input[i] -= out4 * fb;
				input[i] *= 0.35013 * (f*f)*(f*f);
				out1 = input[i] + 0.3 * in1 + (1 - f) * out1; // Pole 1
				in1 = input[i];
				out2 = out1 + 0.3 * in2 + (1 - f) * out2; // Pole 2
				in2 = out1;
				out3 = out2 + 0.3 * in3 + (1 - f) * out3; // Pole 3
				in3 = out2;
				out4 = out3 + 0.3 * in4 + (1 - f) * out4; // Pole 4
				in4 = out3;
				output[i] = out4;
			}
		};

		this.cutoff = args.cutoff || this.defaults.cutoff.value;
		this.resonance = args.resonance || this.defaults.resonance.value;
		this.bypass = args.bypass || false;
	};

	proto.MoogFilter.prototype = Object.create(Super, {
		name: {
			value: 'MoogFilter'
		},
		defaults: {
			writable: true,
			value: {
				bufferSize: {
					value: 4096,
					min: 256,
					max: 16384,
					automatable: false,
					type: INT
				},
				bypass: {
					value: false,
					automatable: false,
					type: BOOLEAN
				},
				cutoff: {
					value: 0.065,
					min: 0.0001,
					max: 1.0,
					automatable: false,
				},
				resonance: {
					value: 3.5,
					min: 0.0,
					max: 4.0,
					automatable: false,
				}
			}
		},
		cutoff: {
			enumerable: true,
			get: function() {
				return this.processor.cutoff;
			},
			set: function(value) {
				this.processor.cutoff = value;
			}
		},
		resonance: {
			enumerable: true,
			get: function() {
				return this.processor.resonance;
			},
			set: function(value) {
				this.processor.resonance = value;
			}
		}
	});

	proto.Overdrive = function(args) {
		args = args || this.getDefaults();

		this.input = userContext.createGain();
		this.activateNode = userContext.createGain();
		this.inputDrive = userContext.createGain();
		this.waveshaper = userContext.createWaveShaper();
		this.outputDrive = userContext.createGain();
		this.output = userContext.createGain();

		this.activateNode.connect(this.inputDrive);
		this.inputDrive.connect(this.waveshaper);
		this.waveshaper.connect(this.outputDrive);
		this.outputDrive.connect(this.output);

		this.ws_table = new Float32Array(this.k_nSamples);
		this.drive = args.drive || this.defaults.drive.value;
		this.outputGain = args.outputGain || this.defaults.outputGain.value;
		this.curveAmount = args.curveAmount || this.defaults.curveAmount.value;
		this.algorithmIndex = args.algorithmIndex || this.defaults.algorithmIndex.value;
		this.bypass = args.bypass || false;
	};

	proto.Overdrive.prototype = Object.create(Super, {
		name: {
			value: 'Overdrive'
		},
		defaults: {
			writable: true,
			value: {
				drive: {
					value: 1,
					min: 0,
					max: 1,
					automatable: true,
					type: FLOAT,
					scaled: true
				},
				outputGain: {
					value: 1,
					min: 0,
					max: 1,
					automatable: true,
					type: FLOAT,
					scaled: true
				},
				curveAmount: {
					value: 0.725,
					min: 0,
					max: 1,
					automatable: false,
				},
				algorithmIndex: {
					value: 0,
					min: 0,
					max: 5,
					automatable: false,
					type: INT
				}
			}
		},
		k_nSamples: {
			value: 8192
		},
		drive: {
			get: function() {
				return this.inputDrive.gain;
			},
			set: function(value) {
				this._drive = value;
			}
		},
		curveAmount: {
			get: function() {
				return this._curveAmount;
			},
			set: function(value) {
				this._curveAmount = value;
				if (this._algorithmIndex === undefined) {
					this._algorithmIndex = 0;
				}
				this.waveshaperAlgorithms[this._algorithmIndex](this._curveAmount, this.k_nSamples, this.ws_table);
				this.waveshaper.curve = this.ws_table;
			}
		},
		outputGain: {
			get: function() {
				return this.outputDrive.gain;
			},
			set: function(value) {
				this._outputGain = dbToWAVolume(value);
			}
		},
		algorithmIndex: {
			get: function() {
				return this._algorithmIndex;
			},
			set: function(value) {
				this._algorithmIndex = value>>0;
				this.curveAmount = this._curveAmount;
			}
		},
		waveshaperAlgorithms: {
			value: [

			function(amount, n_samples, ws_table) {
				amount = Math.min(amount, 0.9999);
				var k = 2 * amount / (1 - amount),
					i, x;
				for(i = 0; i < n_samples; i++) {
					x = i * 2 / n_samples - 1;
					ws_table[i] = (1 + k) * x / (1 + k * Math.abs(x));
				}
			}, function(amount, n_samples, ws_table) {
				var i, x, y;
				for(i = 0; i < n_samples; i++) {
					x = i * 2 / n_samples - 1;
					y = ((0.5 * Math.pow((x + 1.4), 2)) - 1) * y >= 0 ? 5.8 : 1.2;
					ws_table[i] = tanh(y);
				}
			}, function(amount, n_samples, ws_table) {
				var i, x, y, a = 1 - amount;
				for(i = 0; i < n_samples; i++) {
					x = i * 2 / n_samples - 1;
					y = x < 0 ? -Math.pow(Math.abs(x), a + 0.04) : Math.pow(x, a);
					ws_table[i] = tanh(y * 2);
				}
			}, function(amount, n_samples, ws_table) {
				var i, x, y, abx, a = 1 - amount > 0.99 ? 0.99 : 1 - amount;
				for(i = 0; i < n_samples; i++) {
					x = i * 2 / n_samples - 1;
					abx = Math.abs(x);
					if (abx < a) y = abx;
					else if (abx > a) y = a + (abx - a) / (1 + Math.pow((abx - a) / (1 - a), 2));
					else if (abx > 1) y = abx;
					ws_table[i] = sign(x) * y * (1 / ((a + 1) / 2));
				}
			}, function(amount, n_samples, ws_table) { // fixed curve, amount doesn't do anything, the distortion is just from the drive
				var i, x;
				for(i = 0; i < n_samples; i++) {
					x = i * 2 / n_samples - 1;
					if (x < -0.08905) {
						ws_table[i] = (-3 / 4) * (1 - (Math.pow((1 - (Math.abs(x) - 0.032857)), 12)) + (1 / 3) * (Math.abs(x) - 0.032847)) + 0.01;
					} else if (x >= -0.08905 && x < 0.320018) {
						ws_table[i] = (-6.153 * (x * x)) + 3.9375 * x;
					} else {
						ws_table[i] = 0.630035;
					}
				}
			}, function(amount, n_samples, ws_table) {
				var a = 2 + Math.round(amount * 14),
					// we go from 2 to 16 bits, keep in mind for the UI
					bits = Math.round(Math.pow(2, a - 1)),
					// real number of quantization steps divided by 2
					i, x;
				for(i = 0; i < n_samples; i++) {
					x = i * 2 / n_samples - 1;
					ws_table[i] = Math.round(x * bits) / bits;
				}
			}]
		}
	});

	proto.Phaser = function(args) {
		args = args || this.getDefaults();

		this.input = userContext.createGain();
		this.splitter = this.activateNode = userContext.createChannelSplitter(2);
		this.filtersL = [];
		this.filtersR = [];
		this.feedbackGainNodeL = userContext.createGain();
		this.feedbackGainNodeR = userContext.createGain();
		this.merger = userContext.createChannelMerger(2);
		this.filteredSignal = userContext.createGain();
		this.output = userContext.createGain();
		this.lfoL = new userInstance.LFO({
			target: this.filtersL,
			callback: this.callback
		});
		this.lfoR = new userInstance.LFO({
			target: this.filtersR,
			callback: this.callback
		});

		var i = this.stage;
		while(i--) {
			this.filtersL[i] = userContext.createBiquadFilter();
			this.filtersR[i] = userContext.createBiquadFilter();
			this.filtersL[i].type = 'allpass';
			this.filtersR[i].type = 'allpass';
		}
		this.input.connect(this.splitter);
		this.input.connect(this.output);
		this.splitter.connect(this.filtersL[0], 0, 0);
		this.splitter.connect(this.filtersR[0], 1, 0);
		this.connectInOrder(this.filtersL);
		this.connectInOrder(this.filtersR);
		this.filtersL[this.stage - 1].connect(this.feedbackGainNodeL);
		this.filtersL[this.stage - 1].connect(this.merger, 0, 0);
		this.filtersR[this.stage - 1].connect(this.feedbackGainNodeR);
		this.filtersR[this.stage - 1].connect(this.merger, 0, 1);
		this.feedbackGainNodeL.connect(this.filtersL[0]);
		this.feedbackGainNodeR.connect(this.filtersR[0]);
		this.merger.connect(this.output);

		this.rate = args.rate || this.defaults.rate.value;
		this.baseModulationFrequency = args.baseModulationFrequency || this.defaults.baseModulationFrequency.value;
		this.depth = args.depth || this.defaults.depth.value;
		this.feedback = args.feedback || this.defaults.feedback.value;
		this.stereoPhase = args.stereoPhase || this.defaults.stereoPhase.value;

		this.lfoL.activate(true);
		this.lfoR.activate(true);
		this.bypass = args.bypass || false;
	};

	proto.Phaser.prototype = Object.create(Super, {
		name: {
			value: 'Phaser'
		},
		stage: {
			value: 4
		},
		defaults: {
			writable: true,
			value: {
				rate: {
					value: 0.1,
					min: 0,
					max: 8,
					automatable: false,
				},
				depth: {
					value: 0.6,
					min: 0,
					max: 1,
					automatable: false,
				},
				feedback: {
					value: 0.7,
					min: 0,
					max: 1,
					automatable: false,
				},
				stereoPhase: {
					value: 40,
					min: 0,
					max: 180,
					automatable: false,
				},
				baseModulationFrequency: {
					value: 700,
					min: 500,
					max: 1500,
					automatable: false,
				}
			}
		},
		callback: {
			value: function(filters, value) {
				for(var stage = 0; stage < 4; stage++) {
					filters[stage].frequency.value = value;
				}
			}
		},
		depth: {
			get: function() {
				return this._depth;
			},
			set: function(value) {
				this._depth = value;
				this.lfoL.oscillation = this._baseModulationFrequency * this._depth;
				this.lfoR.oscillation = this._baseModulationFrequency * this._depth;
			}
		},
		rate: {
			get: function() {
				return this._rate;
			},
			set: function(value) {
				this._rate = value;
				this.lfoL.frequency = this._rate;
				this.lfoR.frequency = this._rate;
			}
		},
		baseModulationFrequency: {
			enumerable: true,
			get: function() {
				return this._baseModulationFrequency;
			},
			set: function(value) {
				this._baseModulationFrequency = value;
				this.lfoL.offset = this._baseModulationFrequency;
				this.lfoR.offset = this._baseModulationFrequency;
				this._depth = this._depth;
			}
		},
		feedback: {
			get: function() {
				return this._feedback;
			},
			set: function(value) {
				this._feedback = value;
				this.feedbackGainNodeL.gain.value = this._feedback;
				this.feedbackGainNodeR.gain.value = this._feedback;
			}
		},
		stereoPhase: {
			get: function() {
				return this._stereoPhase;
			},
			set: function(value) {
				this._stereoPhase = value;
				var newPhase = this.lfoL._phase + this._stereoPhase * Math.PI / 180;
				newPhase = fmod(newPhase, 2 * Math.PI);
				this.lfoR._phase = newPhase;
			}
		}
	});

	proto.Tremolo = function(args) {
		args = args || this.getDefaults();

		this.input = userContext.createGain();
		this.splitter = this.activateNode = userContext.createChannelSplitter(2), this.amplitudeL = userContext.createGain(), this.amplitudeR = userContext.createGain(), this.merger = userContext.createChannelMerger(2), this.output = userContext.createGain();
		this.lfoL = new userInstance.LFO({
			target: this.amplitudeL.gain,
			callback: pipe
		});
		this.lfoR = new userInstance.LFO({
			target: this.amplitudeR.gain,
			callback: pipe
		});

		this.input.connect(this.splitter);
		this.splitter.connect(this.amplitudeL, 0);
		this.splitter.connect(this.amplitudeR, 1);
		this.amplitudeL.connect(this.merger, 0, 0);
		this.amplitudeR.connect(this.merger, 0, 1);
		this.merger.connect(this.output);

		this.rate = args.rate || this.defaults.rate.value;
		this.intensity = args.intensity || this.defaults.intensity.value;
		this.stereoPhase = args.stereoPhase || this.defaults.stereoPhase.value;

		this.lfoL.offset = 1 - (this.intensity / 2);
		this.lfoR.offset = 1 - (this.intensity / 2);
		this.lfoL.phase = this.stereoPhase * Math.PI / 180;

		this.lfoL.activate(true);
		this.lfoR.activate(true);
		this.bypass = args.bypass || false;
	};

	proto.Tremolo.prototype = Object.create(Super, {
		name: {
			value: 'Tremolo'
		},
		defaults: {
			writable: true,
			value: {
				intensity: {
					value: 0.3,
					min: 0,
					max: 1,
					automatable: false,
				},
				stereoPhase: {
					value: 0,
					min: 0,
					max: 180,
					automatable: false,
				},
				rate: {
					value: 5,
					min: 0.1,
					max: 11,
					automatable: false,
				}
			}
		},
		intensity: {
			enumerable: true,
			get: function() {
				return this._intensity;
			},
			set: function(value) {
				this._intensity = value;
				this.lfoL.offset = 1 - this._intensity / 2;
				this.lfoR.offset = 1 - this._intensity / 2;
				this.lfoL.oscillation = this._intensity;
				this.lfoR.oscillation = this._intensity;
			}
		},
		rate: {
			enumerable: true,
			get: function() {
				return this._rate;
			},
			set: function(value) {
				this._rate = value;
				this.lfoL.frequency = this._rate;
				this.lfoR.frequency = this._rate;
			}
		},
		stereoPhase: {
			enumerable: true,
			get: function() {
				return this._rate;
			},
			set: function(value) {
				this._stereoPhase = value;
				var newPhase = this.lfoL._phase + this._stereoPhase * Math.PI / 180;
				newPhase = fmod(newPhase, 2 * Math.PI);
				this.lfoR.phase = newPhase;
			}
		}
	});

	proto.WahWah = function(args) {
		args = args || this.getDefaults();

		this.input = userContext.createGain();
		this.activateNode = userContext.createGain();
		this.envelopeFollower = new userInstance.EnvelopeFollower({
			target: this,
			callback: function(context, value) {
				context.sweep = value;
			}
		});
		this.filterBp = userContext.createBiquadFilter();
		this.filterPeaking = userContext.createBiquadFilter();
		this.output = userContext.createGain();

		// Connect AudioNodes
		this.activateNode.connect(this.filterBp);
		this.filterBp.connect(this.filterPeaking);
		this.filterPeaking.connect(this.output);

		// Set Properties
		this.init();
		this.automode = initValue(args.enableAutoMode, this.defaults.automode.value);
		this.resonance = args.resonance || this.defaults.resonance.value;
		this.sensitivity = initValue(args.sensitivity, this.defaults.sensitivity.value);
		this.baseFrequency = initValue(args.baseFrequency, this.defaults.baseFrequency.value);
		this.excursionOctaves = args.excursionOctaves || this.defaults.excursionOctaves.value;
		this.sweep = initValue(args.sweep, this.defaults.sweep.value);

		this.activateNode.gain.value = 2;
		this.envelopeFollower.activate(true);
		this.bypass = args.bypass || false;
	};

	proto.WahWah.prototype = Object.create(Super, {
		name: {
			value: 'WahWah'
		},
		defaults: {
			writable: true,
			value: {
				automode: {
					value: true,
					automatable: false,
					type: BOOLEAN
				},
				baseFrequency: {
					value: 0.5,
					min: 0,
					max: 1,
					automatable: false,
					type: FLOAT
				},
				excursionOctaves: {
					value: 2,
					min: 1,
					max: 6,
					automatable: false,
					type: FLOAT
				},
				sweep: {
					value: 0.2,
					min: 0,
					max: 1,
					automatable: false,
					type: FLOAT
				},
				resonance: {
					value: 10,
					min: 1,
					max: 100,
					automatable: false,
					type: FLOAT
				},
				sensitivity: {
					value: 0.5,
					min: -1,
					max: 1,
					automatable: false,
					type: FLOAT
				}
			}
		},
		activateCallback: {
			value: function(value) {
				this.automode = value;
			}
		},
		automode: {
			get: function() {
				return this._automode;
			},
			set: function(value) {
				this._automode = value;
				if (value) {
					this.activateNode.connect(this.envelopeFollower.input);
					this.envelopeFollower.activate(true);
				} else {
					this.envelopeFollower.activate(false);
					this.activateNode.disconnect();
					this.activateNode.connect(this.filterBp);
				}
			}
		},
		filterFreqTimeout: {
			value: 0
		},
		setFilterFreq: {
			value: function() {
				try {
					this.filterBp.frequency.value = this._baseFrequency + this._excursionFrequency * this._sweep;
					this.filterPeaking.frequency.value = this._baseFrequency + this._excursionFrequency * this._sweep;
				} catch (e) {
					clearTimeout(this.filterFreqTimeout);
					// put on the next cycle to let all init properties be set
					this.filterFreqTimeout = setTimeout(function() {
						this.setFilterFreq();
					}.bind(this), 0);
				}
			}
		},
		sweep: {
			enumerable: true,
			get: function() {
				return this._sweep.value;
			},
			set: function(value) {
				this._sweep = Math.pow(value > 1 ? 1 : value < 0 ? 0 : value, this._sensitivity);
				this.setFilterFreq();
			}
		},
		baseFrequency: {
			enumerable: true,
			get: function() {
				return this._baseFrequency;
			},
			set: function(value) {
				this._baseFrequency = 50 * Math.pow(10, value * 2);
				this._excursionFrequency = Math.min(userContext.sampleRate / 2, this.baseFrequency * Math.pow(2, this._excursionOctaves));
				this.setFilterFreq();
			}
		},
		excursionOctaves: {
			enumerable: true,
			get: function() {
				return this._excursionOctaves;
			},
			set: function(value) {
				this._excursionOctaves = value;
				this._excursionFrequency = Math.min(userContext.sampleRate / 2, this.baseFrequency * Math.pow(2, this._excursionOctaves));
				this.setFilterFreq();
			}
		},
		sensitivity: {
			enumerable: true,
			get: function() {
				return this._sensitivity;
			},
			set: function(value) {
				this._sensitivity = Math.pow(10, value);
			}
		},
		resonance: {
			enumerable: true,
			get: function() {
				return this._resonance;
			},
			set: function(value) {
				this._resonance = value;
				this.filterPeaking.Q = this._resonance;
			}
		},
		init: {
			value: function() {
				this.output.gain.value = 1;
				this.filterPeaking.type = 'peaking';
				this.filterBp.type = 'bandpass';
				this.filterPeaking.frequency.value = 100;
				this.filterPeaking.gain.value = 20;
				this.filterPeaking.Q.value = 5;
				this.filterBp.frequency.value = 100;
				this.filterBp.Q.value = 1;
			}
		}
	});


	proto.EnvelopeFollower = function(args) {
		args = args || this.getDefaults();

		this.input = userContext.createGain();
		this.jsNode = this.output = userContext.createScriptProcessor(this.buffersize, 1, 1);

		this.input.connect(this.output);

		this.attackTime = args.attackTime || this.defaults.attackTime.value;
		this.releaseTime = args.releaseTime || this.defaults.releaseTime.value;
		this._envelope = 0;
		this.target = args.target || {};
		this.callback = args.callback || function() {};
	};

	proto.EnvelopeFollower.prototype = Object.create(Super, {
		name: {
			value: 'EnvelopeFollower'
		},
		defaults: {
			value: {
				attackTime: {
					value: 0.003,
					min: 0,
					max: 0.5,
					automatable: false,
				},
				releaseTime: {
					value: 0.5,
					min: 0,
					max: 0.5,
					automatable: false,
				}
			}
		},
		buffersize: {
			value: 256
		},
		envelope: {
			value: 0
		},
		sampleRate: {
			value: 44100
		},
		attackTime: {
			enumerable: true,
			get: function() {
				return this._attackTime;
			},
			set: function(value) {
				this._attackTime = value;
				this._attackC = Math.exp(-1 / this._attackTime * this.sampleRate / this.buffersize);
			}
		},
		releaseTime: {
			enumerable: true,
			get: function() {
				return this._releaseTime;
			},
			set: function(value) {
				this._releaseTime = value;
				this._releaseC = Math.exp(-1 / this._releaseTime * this.sampleRate / this.buffersize);
			}
		},
		callback: {
			get: function() {
				return this._callback;
			},
			set: function(value) {
				if (typeof value === 'function') {
					this._callback = value;
				} else {
					console.error('tuna.js: ' + this.name + ': Callback must be a function!');
				}
			}
		},
		target: {
			get: function() {
				return this._target;
			},
			set: function(value) {
				this._target = value;
			}
		},
		activate: {
			value: function(doActivate) {
				this.activated = doActivate;
				if (doActivate) {
					this.jsNode.connect(userContext.destination);
					this.jsNode.onaudioprocess = this.returnCompute(this);
				} else {
					this.jsNode.disconnect();
					this.jsNode.onaudioprocess = null;
				}
			}
		},
		returnCompute: {
			value: function(instance) {
				return function(event) {
					instance.compute(event);
				};
			}
		},
		compute: {
			value: function(event) {
				var count = event.inputBuffer.getChannelData(0).length,
					channels = event.inputBuffer.numberOfChannels,
					current, chan, rms, i;
				chan = rms = i = 0;
				if (channels > 1) { //need to mixdown
					for(i = 0; i < count; ++i) {
						for(; chan < channels; ++chan) {
							current = event.inputBuffer.getChannelData(chan)[i];
							rms += (current * current) / channels;
						}
					}
				} else {
					for(i = 0; i < count; ++i) {
						current = event.inputBuffer.getChannelData(0)[i];
						rms += (current * current);
					}
				}
				rms = Math.sqrt(rms);

				if (this._envelope < rms) {
					this._envelope *= this._attackC;
					this._envelope += (1 - this._attackC) * rms;
				} else {
					this._envelope *= this._releaseC;
					this._envelope += (1 - this._releaseC) * rms;
				}
				this._callback(this._target, this._envelope);
			}
		}
	});
	
	// Low-frequency oscillation
	proto.LFO = function(args) {
		args = args || this.getDefaults();

		this.output = userContext.createScriptProcessor(256, 1, 1);
		this.activateNode = userContext.destination;

		this.frequency = args.frequency || this.defaults.frequency.value;
		this.offset = args.offset || this.defaults.offset.value;
		this.oscillation = args.oscillation || this.defaults.oscillation.value;
		this.phase = args.phase || this.defaults.phase.value;
		this.target = args.target || {};
		this.output.onaudioprocess = this.callback(args.callback || function() {});
		this.bypass = args.bypass || false;
	};

	proto.LFO.prototype = Object.create(Super, {
		name: {
			value: 'LFO'
		},
		bufferSize: {
			value: 256
		},
		sampleRate: {
			value: 44100
		},
		defaults: {
			value: {
				frequency: {
					value: 1,
					min: 0,
					max: 20,
					automatable: false,
				},
				offset: {
					value: 0.85,
					min: 0,
					max: 22049,
					automatable: false,
				},
				oscillation: {
					value: 0.3,
					min: -22050,
					max: 22050,
					automatable: false,
				},
				phase: {
					value: 0,
					min: 0,
					max: 2 * Math.PI,
					automatable: false,
				}
			}
		},
		frequency: {
			get: function() {
				return this._frequency;
			},
			set: function(value) {
				this._frequency = value;
				this._phaseInc = 2 * Math.PI * this._frequency * this.bufferSize / this.sampleRate;
			}
		},
		offset: {
			get: function() {
				return this._offset;
			},
			set: function(value) {
				this._offset = value;
			}
		},
		oscillation: {
			get: function() {
				return this._oscillation;
			},
			set: function(value) {
				this._oscillation = value;
			}
		},
		phase: {
			get: function() {
				return this._phase;
			},
			set: function(value) {
				this._phase = value;
			}
		},
		target: {
			get: function() {
				return this._target;
			},
			set: function(value) {
				this._target = value;
			}
		},
		activate: {
			value: function(doActivate) {
				if (!doActivate) {
					this.output.disconnect(userContext.destination);
				} else {
					this.output.connect(userContext.destination);
				}
			}
		},
		callback: {
			value: function(callback) {
				var that = this;
				return function() {
					that._phase += that._phaseInc;
					if (that._phase > 2 * Math.PI) {
						that._phase = 0;
					}
					callback(that._target, that._offset + that._oscillation * Math.sin(that._phase));
				};
			}
		}
	});

	/* Panner 
	------------------------------------------------*/
	proto.Panner = function(args) {
		args = args || this.getDefaults();

		this.input = userContext.createGain();
		this.activateNode = userContext.createGain();
		this.output = userContext.createGain();
		this.panner = userContext.createPanner();

		this.activateNode.connect(this.panner);
		this.panner.connect(this.output);

		this.bypass = args.bypass || false;
		this.x = args.x || 0;
		this.y = args.y || 1;
		this.z = args.z || 1;
		this.panningModel = args.panningModel || 0;
		this.distanceModel = args.distanceModel || 0;
	};

	function PannerPosition(type) {
		return {
			enumerable: true,
			get: function() {
				return this['_' + type];
			},
			set: function(value) {
				this['_' + type] = value;
				this.panner.setPosition(this._x || 0, this._y || 0, this._z || 0);
			}
		}
	};
	
	function PannerModel(type) {
		return {
			enumerable: true,
			get: function() {
				return this['_' + type];
			},
			set: function(value) {
				this['_' + type] = value;
				this.panner[type] = value;
			}
		}
	};
	
	function Clamp(value, min, max, automatable) {
		return {
			value: value,
			min: min,
			max: max,
			automatable: automatable
		};
	};
	
	proto.Panner.prototype = Object.create(Super, {
		name: {
			value: 'Panner'
		},
		defaults: {
			writable: true,
			value: {
				x: Clamp(0, -20, 20, false),
				y: Clamp(0, -20, 20, false),
				z: Clamp(0, -20, 20, false),
				distanceModel: Clamp(0, 0, 2, false),
				panningModel: Clamp(0, 0, 2, false)
			}
		},
		x: PannerPosition('x'),
		y: PannerPosition('y'),
		z: PannerPosition('z'),
		panningModel: PannerModel('panningModel'),
		distanceModel: PannerModel('distanceModel')
	});


	/* Volume 
	------------------------------------------------*/
	proto.Volume = function(args) {
		args = args || this.getDefaults();

		this.input = userContext.createGain();
		this.activateNode = userContext.createGain();
		this.output = userContext.createGain();

		this.activateNode.connect(this.output);

		this.bypass = args.bypass || false;
		this.amount = args.amount || this.defaults.amount.value || 1.0;
		this.mute = args.mute || false;
	};

	proto.Volume.prototype = Object.create(Super, {
		name: {
			value: 'Volume'
		},
		defaults: {
			writable: true,
			value: {
				amount: Clamp(0, 0, 2, false),
				mute: Clamp(0, 0, 1, false)
			}
		},
		mute: {
			enumerable: true,
			get: function() {
				return this._mute;
			},
			set: function(truthy) {
				var _mute = this._mute;
				if (_mute !== truthy) {
					if (this._mute = truthy) {
						this._amountOnMute = this._amount;
						this.amount = 0.0;
					} else if (_mute !== undefined) {
						this.amount = this._amountOnMute;
					}
				}
			}
		},
		amount: {
			enumerable: true,
			get: function() {
				return this._amount;
			},
			set: function(value) {
				this._amount = value;
				this.activateNode.gain.value = value;
			}
		}
	});


	/* Frequency 
	------------------------------------------------*/
	proto.Frequency = function(args) {
		args = args || this.getDefaults();

		this.trebleFilter = userContext.createBiquadFilter();
		this.trebleFilter.type = 'highshelf';
		this.trebleFilter.frequency.value = 8000; // 1k+
		this.trebleFilter.Q.value = 0;
		this.midtoneFilter = userContext.createBiquadFilter();
		this.midtoneFilter.type = 'peaking';
		this.midtoneFilter.frequency.value = 1000; // 200-1k
		this.midtoneFilter.Q.value = 0;
		this.bassFilter = userContext.createBiquadFilter();
		this.bassFilter.type = 'lowshelf';
		this.bassFilter.frequency.value = 200; // 60-200k
		this.bassFilter.Q.value = 0;
		
		this.input = userContext.createGain();
		this.activateNode = userContext.createGain();
		this.output = userContext.createGain();

		this.activateNode.connect(this.bassFilter);
		this.bassFilter.connect(this.midtoneFilter);
		this.midtoneFilter.connect(this.trebleFilter);
		this.trebleFilter.connect(this.output);

		this.bypass = args.bypass || false;
		this.volume = args.volume || false;
		this.treble = args.treble || false;
		this.midtone = args.midtone || false;
		this.bass = args.bass || false;
	};

	function GainValue(type, nodeId) {
		return {
			enumerable: true,
			get: function() {
				return this['_' + type];
			},
			set: function(value) {
				this['_' + type] = value;
				this[nodeId || type + 'Filter'].gain.value = value;
			}
		};
	};

	proto.Frequency.prototype = Object.create(Super, {
		name: {
			value: 'Frequency'
		},
		defaults: {
			writable: true,
			value: {
				volume: Clamp(1, 0, 2, false),
				treble: Clamp(0, -20, 20, false),
				midtone: Clamp(0, -20, 20, false),
				bass: Clamp(0, -20, 20, false)
			}
		},
		volume: GainValue('volume', 'activateNode'),
		treble: GainValue('treble'),
		midtone: GainValue('midtone'),
		bass: GainValue('bass')
	});

	if (typeof define === 'function') {
		define('Tuna', [], function() {
			return Tuna;
		});
	} else {
		window.Tuna = Tuna;
	}

	function initValue(userVal, defaultVal) {
		return userVal === undefined ? defaultVal : userVal;
	}
})(this);