var fs = require('fs');
var file = process.argv[2];

fs.readFile(file, 'binary', function(err, data) {
    var base64 = new Buffer(data, 'binary').toString('base64');
	console.log(base64);
});