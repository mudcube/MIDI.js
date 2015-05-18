/*
	----------------------------------------------------------
	util.request : 0.1.1 : 2015-04-12 : https://mudcu.be
	----------------------------------------------------------
	XMLHttpRequest - IE7+ | Chrome 1+ | Firefox 1+ | Safari 1.2+
	CORS - IE10+ | Chrome 3+ | Firefox 3.5+ | Safari 4+
	----------------------------------------------------------
	util.request({
		url: './dir/something.extension',
		data: 'test!',
		format: 'text', // text | xml | json
		responseType: 'text', // arraybuffer | blob | document | json | text
		headers: {},
		withCredentials: true, // true | false
		///
		onerror: function(evt, percent) {
			console.log(evt);
		},
		onsuccess: function(evt, responseText) {
			console.log(responseText);
		},
		onprogress: function(evt, percent) {
			percent = Math.round(percent * 100);
			loader.create('thread', 'loading... ', percent);
		}
	});
	
	
	https://mathiasbynens.be/demo/xhr-responsetype //- shim for responseType='json'
	
*/

if (typeof galactic === 'undefined') galactic = {};

(function(root) {

	var util = root.util || (root.util = {});

	util.request = function(opts, onsuccess, onerror, onprogress) { 'use strict';
		if (typeof opts === 'string') opts = {url: opts};
		///
		var data = opts.data;
		var url = opts.url;
		var method = opts.method || (opts.data ? 'POST' : 'GET');
		var format = opts.format;
		var headers = opts.headers;
		var responseType = opts.responseType;
		var withCredentials = opts.withCredentials || false;
		///
		var onprogress = onprogress || opts.onprogress;
		var onsuccess = onsuccess || opts.onsuccess;
		var onerror = onerror || opts.onerror;
		///
		if (typeof NodeFS !== 'undefined' && root.loc.isLocalUrl(url)) {
			NodeFS.readFile(url, 'utf8', function(err, res) {
				if (err) {
					onerror && onerror(err);
				} else {
					onsuccess && onsuccess({responseText: res});
				}
			});
			return;
		}
		///
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
			if (data) {
				xhr.upload.onprogress = function(evt) {
					onprogress.call(xhr, evt, event.loaded / event.total);
				};
			} else {
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
				});
			}
		}

		xhr.onreadystatechange = function(evt) {
			if (xhr.readyState === 4) { // The request is complete
				if (xhr.status === 200 || // Response OK
					xhr.status === 304 || // Not Modified
					xhr.status === 308 || // Permanent Redirect
					xhr.status === 0 && root.client.cordova // Cordova quirk
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
		xhr.send(data);
		return xhr;
	};

	/// NodeJS
	if (typeof module !== 'undefined' && module.exports) {
		var NodeFS = require('fs');
		XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
		module.exports = root.util.request;
	}

})(galactic);