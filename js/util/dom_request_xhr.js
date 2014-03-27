/*
	---------------------------------------------------
	dom.XMLHttp : 0.1.1 : 2013/13/28
	---------------------------------------------------
	dom.request({
		url: "./dir/something.extension",
		body: "test!",
		onerror: function(event) {
			console.log(event);
		},
		onload: function(response) {
			console.log(response.responseText);
		}, 
		onprogress: function (event) {
			var percent = event.loaded / event.total * 100 >> 0;
			loader.message("loading: " + percent + "%");
		}
	});	
*/

if (typeof(dom) === "undefined") var dom = {};

(function(root) { "use strict";

dom.request = function(conf) {
	// Add XMLHttpRequest when not available
	if (typeof (XMLHttpRequest) === "undefined") {
		XMLHttpRequest;
		(function () { // find equivalent for IE
			var factories = [
			function () {
				return new ActiveXObject("Msxml2.XMLHTTP")
			}, function () {
				return new ActiveXObject("Msxml3.XMLHTTP")
			}, function () {
				return new ActiveXObject("Microsoft.XMLHTTP")
			}];
			for (var i = 0; i < factories.length; i++) {
				try {
					factories[i]();
				} catch (e) {
					continue;
				}
				break;
			}
			XMLHttpRequest = factories[i];
		})();
	}

	if (typeof ((new XMLHttpRequest()).responseText) === "undefined") {
		// http://stackoverflow.com/questions/1919972/how-do-i-access-xhr-responsebody-for-binary-data-from-javascript-in-ie
		var IEBinaryToArray_ByteStr_Script =
		"<!-- IEBinaryToArray_ByteStr -->\r\n"+
		"<script type='text/vbscript'>\r\n"+
		"Function IEBinaryToArray_ByteStr(Binary)\r\n"+
		"   IEBinaryToArray_ByteStr = CStr(Binary)\r\n"+
		"End Function\r\n"+
		"Function IEBinaryToArray_ByteStr_Last(Binary)\r\n"+
		"   Dim lastIndex\r\n"+
		"   lastIndex = LenB(Binary)\r\n"+
		"   if lastIndex mod 2 Then\r\n"+
		"       IEBinaryToArray_ByteStr_Last = Chr( AscB( MidB( Binary, lastIndex, 1 ) ) )\r\n"+
		"   Else\r\n"+
		"       IEBinaryToArray_ByteStr_Last = "+'""'+"\r\n"+
		"   End If\r\n"+
		"End Function\r\n"+
		"</script>\r\n";

		// inject VBScript
		document.write(IEBinaryToArray_ByteStr_Script);

		dom.request = function(conf) {
			// helper to convert from responseBody to a "responseText" like thing
			function getResponseText(binary) {
				var byteMapping = {};
				for (var i = 0; i < 256; i++) {
					for (var j = 0; j < 256; j++) {
						byteMapping[String.fromCharCode(i + j * 256)] = String.fromCharCode(i) + String.fromCharCode(j);
					}
				}
				// call into VBScript utility fns
				var rawBytes = IEBinaryToArray_ByteStr(binary);
				var lastChr = IEBinaryToArray_ByteStr_Last(binary);
				return rawBytes.replace(/[\s\S]/g, function (match) {
					return byteMapping[match];
				}) + lastChr;
			};
			//
			if (typeof(conf) === "string") conf = { url: conf };
			var req = XMLHttpRequest();
			req.open(conf.body ? "POST" : "GET", conf.url, true);
			if (req.overrideMimeType) req.overrideMimeType("text/plain; charset=x-user-defined");
			if (conf.headers) { // custom headers
				for (var key in conf.headers) {
					req.setRequestHeader(key, conf.headers[key]);
				}
			} else if (conf.body) { // set the default for POST request.
				req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			}
			if (conf.responseType) req.responseType = conf.responseType;
			if (conf.onerror && "onerror" in req) req.onerror = conf.onerror;
			if (conf.onprogress && "onprogress" in req) req.onprogress = conf.onprogress;
			req.onreadystatechange = function (event) {
				if (req.readyState === 4) {
					if (req.status === 200 || req.status === 304 || req.status === 0) {
						req.responseText = getResponseText(req.responseBody);
						if (conf.onload) {
							conf.onload(req);
						}
					} else {
						if (conf.onerror) {
							conf.onerror(event, false);
						}
					}
				}
			};
			req.setRequestHeader("Accept-Charset", "x-user-defined");
			req.send(null);
			return req;
		}
	} else {
		dom.request = function(conf) {
			if (typeof(conf) === "string") conf = { url: conf };
			var req = new XMLHttpRequest();
			req.open(conf.body ? "POST" : "GET", conf.url, true);
			if (req.overrideMimeType) req.overrideMimeType("text/plain; charset=x-user-defined");
			if (conf.headers) { // custom headers
				for (var key in conf.headers) {
					req.setRequestHeader(key, conf.headers[key]);
				}
			} else if (conf.body) { // set the default for POST request.
				req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			}
			///
			if (conf.responseType) {
				req.responseType = conf.responseType;
			}
			if (conf.onerror && "onerror" in req) {
				req.onerror = conf.onerror;
			}
			if (conf.onprogress && req.upload && "onprogress" in req.upload) {
				req.upload.onprogress = conf.onprogress;
			}
			///
			req.onreadystatechange = function (event) {
				if (req.readyState === 4) { // The request is complete
					if (req.status === 200 || // Response OK
						req.status === 304 || // Not Modified
						req.status === 0 && root.userAgent && root.userAgent.cordova // Cordova quirk
					) {
						if (conf.onload) {
							conf.onload(req);
						}
					} else {
						if (conf.onerror) {
							conf.onerror(event, false);
						}
					}
				}
			};
			req.send(conf.body);
			return req;
		};
	}
	///
	dom.request(conf);
};

})(dom);

/// For NodeJS
if (typeof (module) !== "undefined" && module.exports) {
	XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
	module.exports = dom.request;
}