/*

	DOMLoader.XMLHttp : 0.1 : mudcu.be
	-----------------------------------
	DOMLoader.sendRequest({
		url: "./dir/something.extension",
		error: function(event) {
			console.log(event);
		},
		callback: function(response) {
			console.log(response.responseText);
		}, 
		progress: function (event) {
			var percent = event.loaded / event.total * 100 >> 0;
			loader.message("loading: " + percent + "%");
		}
	});
	
*/

if (typeof(DOMLoader) === "undefined") DOMLoader = {};

(function() { "use strict";

// Add XMLHttpRequest when not available

if (typeof (window.XMLHttpRequest) === "undefined") {
	(function () { // http://www.quirksmode.org/js/xmlhttp.html
		var factories = [
		function () {
			return new ActiveXObject("Msxml2.XMLHTTP");
		}, function () {
			return new ActiveXObject("Msxml3.XMLHTTP");
		}, function () {
			return new ActiveXObject("Microsoft.XMLHTTP");
		}];
		for (var i = 0; i < factories.length; i++) {
			try {
				factories[i]();
			} catch (e) {
				continue;
			}
			break;
		}
		window.XMLHttpRequest = factories[i];
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

	DOMLoader.sendRequest = function(config) {
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
		}
		//
		var req = new XMLHttpRequest();
		req.open("GET", config.url, true);
		req.setRequestHeader("Accept-Charset", "x-user-defined");
		if (config.responseType) req.responseType = config.responseType;
		if (config.error) req.onerror = config.error;
		if (config.progress) req.onprogress = config.progress;
		req.onreadystatechange = function (event) {
			if (req.readyState === 4) {
				if (req.status === 200) {
					req.responseText = getResponseText(req.responseBody);
				} else {
					req = false;
				}
				if (config.callback) config.callback(req);
			}
		};
		req.send(null);
		return req;
	}
} else {
	DOMLoader.sendRequest = function(config) {
		var req = new XMLHttpRequest();
		req.open('GET', config.url, true);
        if (req.overrideMimeType) req.overrideMimeType("text/plain; charset=x-user-defined");
		if (config.responseType) req.responseType = config.responseType;
		if (config.error) req.onerror = config.error;
		if (config.progress) req.onprogress = config.progress;
		req.onreadystatechange = function (event) {
			if (req.readyState === 4) {
				if (req.status !== 200) req = false;
				if (config.callback) config.callback(req);
			}
		};
		req.send("");
		return req;
	};
}

})();