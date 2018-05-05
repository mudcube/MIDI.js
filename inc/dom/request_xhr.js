/*
	----------------------------------------------------------
	util/Request : 0.1.1 : 2015-07-12 : https://sketch.io
	----------------------------------------------------------
	XMLHttpRequest - IE7+ | Chrome 1+ | Firefox 1+ | Safari 1.2+
	CORS - IE10+ | Chrome 3+ | Firefox 3.5+ | Safari 4+
	----------------------------------------------------------
	galactic.request({
		url: './dir/something.extension',
		data: 'test!',
		format: 'text', // text | xml | json
		responseType: 'text', // arraybuffer | blob | document | json | text
		headers: {},
		withCredentials: true, // true | false
		///
		onerror: function(e) {
			console.log(e);
		},
		onsuccess: function(e, res) {
			console.log(res);
		},
		onprogress: function(e, progress) {
			progress = Math.round(progress * 100);
			loader.create('thread', 'loading... ', progress);
		}
	});
*/

if (typeof galactic === 'undefined') galactic = {};

(function(root) { 'use strict';

	root.request = function(args, onsuccess, onerror, onprogress) {
		if (typeof args === 'string') args = {url: args};
		var data = args.data;
		var url = args.url;
		var method = args.method || (args.data ? 'POST' : 'GET');
		var format = args.format;
		var headers = args.headers;
		var mimeType = args.mimeType;
		var responseType = args.responseType;
		var withCredentials = args.withCredentials || false;
		var onprogress = onprogress || args.onprogress;
		var onsuccess = onsuccess || args.onsuccess;
		var onerror = onerror || args.onerror;
		///
		if (typeof NodeFS !== 'undefined' && root.loc.isLocalUrl(url)) {
			NodeFS.readFile(url, 'utf8', function(err, res) {
				if (err) {
					onerror && onerror(err);
				} else {
					onsuccess && onsuccess({responseText: res}, res);
				}
			});
		} else {
			var xhr = new XMLHttpRequest();
			xhr.open(method, url, true);
			///
			if (headers) {
				for (var type in headers) {
					xhr.setRequestHeader(type, headers[type]);
				}
			} else if (data) { // set the default headers for POST
				xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			}
			if (mimeType) {
				xhr.overrideMimeType(mimeType);
			}
			if (responseType) {
				xhr.responseType = responseType;
			}
			if (withCredentials) {
				xhr.withCredentials = true;
			}
			if (onerror && 'onerror' in xhr) {
				xhr.onerror = onerror;
			}
			if (onprogress && xhr.upload && 'onprogress' in xhr.upload) {
				if (data) { // send
					xhr.upload.onprogress = function(evt) {
						onprogress.call(xhr, evt, event.loaded / event.total);
					};
				} else { // receive
					xhr.addEventListener('progress', function(evt) {
						var totalBytes = 0;
						if (evt.lengthComputable) {
							totalBytes = evt.total;
						} else if (xhr.totalBytes) {
							totalBytes = xhr.totalBytes;
						} else {
							var rawBytes = parseInt(xhr.getResponseHeader('Content-Length-Raw'));
							if (isFinite(rawBytes)) {
								xhr.totalBytes = totalBytes = rawBytes;
							} else {
								return;
							}
						}
						onprogress.call(xhr, evt, evt.loaded / totalBytes);
					}, false);
				}
			}
			///
			xhr.onreadystatechange = function(evt) {
				if (xhr.readyState === 4) { // The request is complete
					if (xhr.status === 200 || // Response OK
						xhr.status === 304 || // Not Modified
						xhr.status === 308 || // Permanent Redirect
						xhr.status === 0 && !!window.top.cordova // Cordova quirk
					) {
						if (onsuccess) {
							var res;
							if (format === 'json') {
								try {
									res = JSON.parse(evt.target.response);
								} catch(err) {
									onerror && onerror.call(xhr, evt);
								}
							} else if (format === 'xml') {
								res = evt.target.responseXML;
							} else if (format === 'text') {
								res = evt.target.responseText;
							} else {
								res = evt.target.response;
							}
							///
							onsuccess.call(xhr, evt, res);
						}
					} else {
						onerror && onerror.call(xhr, evt);
					}
				}
			};
			///
			xhr.send(data);
			///
			return xhr;
		}
	};

	/* NodeJS
	------------------------------------------------------ */
	if (typeof module === 'object' && module.exports) {
//TODO-PER: to make it compile		var NodeFS = require('fs');
		module.exports = root.request;
	}

})(galactic);