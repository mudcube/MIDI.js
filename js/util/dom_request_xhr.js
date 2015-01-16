/*
	----------------------------------------------------------
	util/Request : 0.1.1 : 2014-10-17
	----------------------------------------------------------
	util.request({
		url: './dir/something.extension',
		body: 'test!',
		onerror: function(event) {
			console.log(event);
		},
		onload: function(response) {
			console.log(response.responseText);
		},
		onprogress: function(event) {
			var percent = event.loaded / event.total * 100 >> 0;
			loader.create('thread', 'loading... ', percent);
		}
	});
*/

if (typeof MIDI === 'undefined') MIDI = {};

(function(root) {

	var util = root.util || (root.util = {});

	util.request = function(params, onload, onerror, onprogress) { 'use strict';
		if (typeof(params) === 'string') params = {url: params};
		///
		var body = params.body;
		var url = params.url;
		var headers = params.headers;
		var responseType = params.responseType;
		var withCredentials = params.withCredentials;
		var asBinaryString = params.asBinaryString;
		var onload = onload || params.onload;
		var onerror = onerror || params.onerror;
		var onprogress = onprogress || params.onprogress;
		///
		if (typeof(NodeFS) !== 'undefined' && root.loc.isLocalUrl(url)) {
			NodeFS.readFile(url, 'utf8', function(error, data) {
				if (error) {
					onerror && onerror(error, false);
				} else {
					onload && onload({responseText: data});
				}
			});
			return;
		}
		///
		var xhr = new XMLHttpRequest();
		xhr.open(body ? 'POST' : 'GET', url, true);
		///
		if (headers) {
			for (var key in headers) {
				xhr.setRequestHeader(key, headers[key]);
			}
		} else if (body) { // set the default headers for POST
			xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		}
		if (asBinaryString) { //- default to responseType="blob" when supported
			if (xhr.overrideMimeType) {
				xhr.overrideMimeType('text/plain; charset=x-user-defined');
			}
		}
		if (responseType) {
			xhr.responseType = responseType;
		}
		if (withCredentials) {
			xhr.withCredentials = 'true';
		}
		if (onerror && 'onerror' in xhr) {
			xhr.onerror = onerror;
		}
		if (onprogress && xhr.upload && 'onprogress' in xhr.upload) {
			if (body) {
				xhr.upload.onprogress = onprogress;
			} else {
				xhr.onprogress = onprogress;
			}
		}
		///
		xhr.onreadystatechange = function(event) {
			if (xhr.readyState === 4) { // The request is complete
				if (xhr.status === 200 || // Response OK
					xhr.status === 304 || // Not Modified
					xhr.status === 0 && root.client && root.client.cordova // Cordova quirk
				) {
					onload && onload(xhr);
				} else {
					onerror && onerror(event, false);
				}
			}
		};
		xhr.send(body);
		return xhr;
	};

	/// NodeJS
	if (typeof module !== 'undefined' && module.exports) {
		var NodeFS = require('fs');
		XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
		module.exports = root.util.request;
	}

})(MIDI);