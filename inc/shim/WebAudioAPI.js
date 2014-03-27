/**
 * @license -------------------------------------------------------------------
 *   module: WebAudioShim - Fix naming issues for WebAudioAPI supports
 *      src: https://github.com/Dinahmoe/webaudioshim
 *   author: Dinahmoe AB
 * -------------------------------------------------------------------
 * Copyright (c) 2012 DinahMoe AB
 * 
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

window.AudioContext = window.AudioContext || window.webkitAudioContext || null;
window.OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext || null;

(function (Context) {
	var isFunction = function (f) {
		return Object.prototype.toString.call(f) === "[object Function]" ||
			Object.prototype.toString.call(f) === "[object AudioContextConstructor]";
	};
	var contextMethods = [
		["createGainNode", "createGain"],
		["createDelayNode", "createDelay"],
		["createJavaScriptNode", "createScriptProcessor"]
	];
	///
	var proto;
	var instance;
	var sourceProto;
	///
	if (!isFunction(Context)) {
		return;
	}
	instance = new Context();
	if (!instance.destination || !instance.sampleRate) {
		return;
	}
	proto = Context.prototype;
	sourceProto = Object.getPrototypeOf(instance.createBufferSource());

	if (!isFunction(sourceProto.start)) {
		if (isFunction(sourceProto.noteOn)) {
			sourceProto.start = function (when, offset, duration) {
				switch (arguments.length) {
					case 0:
						throw new Error("Not enough arguments.");
					case 1:
						this.noteOn(when);
						break;
					case 2:
						if (this.buffer) {
							this.noteGrainOn(when, offset, this.buffer.duration - offset);
						} else {
							throw new Error("Missing AudioBuffer");
						}
						break;
					case 3:
						this.noteGrainOn(when, offset, duration);
				}
			};
		}
	}

	if (!isFunction(sourceProto.noteOn)) {
		sourceProto.noteOn = sourceProto.start;
	}

	if (!isFunction(sourceProto.noteGrainOn)) {
		sourceProto.noteGrainOn = sourceProto.start;
	}

	if (!isFunction(sourceProto.stop)) {
		sourceProto.stop = sourceProto.noteOff;
	}

	if (!isFunction(sourceProto.noteOff)) {
		sourceProto.noteOff = sourceProto.stop;
	}

	contextMethods.forEach(function (names) {
		var name1;
		var name2;
		while (names.length) {
			name1 = names.pop();
			if (isFunction(this[name1])) {
				this[names.pop()] = this[name1];
			} else {
				name2 = names.pop();
				this[name1] = this[name2];
			}
		}
	}, proto);
})(window.AudioContext);