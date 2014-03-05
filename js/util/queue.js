/*
	----------------------------------------------------
	sketch.util.Queue : 0.1.1 : https://sketch.io
	----------------------------------------------------
*/

var Queue = function(conf) {
	/*
		new sketch.util.Queue({
			items: list,
			range: { from: 0, to: 75 },
			oncomplete: function() {
	//			queue.reset(); // infinite loop!
	//			queue.next();
			},
			next: function(entry, key, index) {
				if (item[0] !== "." && item.indexOf(".") === -1) {
					readDir(dir + item + "/", this.next);
				} else {
					setTimeout(this.next, 1)
				}
			}
		});
	*/
	var that = this;
	var oncomplete = conf.oncomplete || conf.complete || conf.callback;
	var onprogress = conf.onprogress || conf.progress;
	var flatten = conf.flatten === false ? false : true;
	this.canceled = false;
	this.cancel = function() {
		if (that.canceled || that.remaining <= 0) return;
		if (conf.oncancel) conf.oncancel();
		that.canceled = true;
	};
	/// Request the next item in stack.
	this.next = function() {
		if (that.canceled) return;
		/// Emit the progress of the queue.
		var queue = that.queue;
		var remaining = that.remaining;
		var total = that.length;
		var index = (total - remaining) - 1;
		var key = that.keys[index];
		///
		if (onprogress) {
			onprogress(total ? 1 - (remaining + 1) / total : 1);
		}

		/// Check whether the queue is complete.
		if (!queue.length) {
			if (oncomplete) {
				oncomplete();
			}
			return;
		}
		/// Indicate previous element as processed.
		that.remaining --;
		///
		var isObject = String(item) === "[object Object]";
		var isArray = isObject && item.length;

		/// Single level queue
		if (flatten) {
			conf.next.call(that, queue.shift(), key, index);
		} else {
			/// Remove previously completed level in stack.
			var item = queue[0];
			if (isObject && !isArray) queue.shift();
			/// Process next item in multi-dimensional stack.
			if (isObject && isArray) {
				conf.next.call(that, item.shift(), key, index);
			} else { // ditto for single-dimensional stack.
				conf.next.call(that, queue.shift(), key, index);
			}
		}
	};
	/// 
	this.reset = function(items) {
		if (conf.range) {
			var range = conf.range;
			for (var n = range.from, items = []; n <= range.to; n++) {
				items.push(n);
			}
		} else {
			items = items || conf.items;		
		}
		///
		this.length = 0;
		this.remaining = -1;
		this.queue = [];
		this.keys = [];

		/// Flatten multi-dimensional objects.
		for (var key in items) {
			if (!items.hasOwnProperty(key)) continue; // work when Array is prototyped
			if (String(items[key]) === "[object Object]" && !flatten) {
				var sub = [];
				this.queue.push(sub);
				for (var key1 in items[key]) {
					if (!items[key].hasOwnProperty(key1)) continue; // work when Array is prototyped
					sub.push(items[key][key1]);
					this.keys.push(key1);
					this.length ++;
					this.remaining ++;
				}
			} else {
				this.keys.push(key);
				this.queue.push(items[key]);
				this.length ++;
				this.remaining ++;
			}
		}
	};
	///
	this.reset(); // populate queue
	this.next(); // start queue
	///
	return this;
};