/*
	Build environment
	----------------------------------------
	1) Install NodeJS:
		http://nodejs.org/
	2) Install Grunt
		npm install grunt
*/

module.exports = function (grunt) {
	grunt.initConfig({
		concat: {
			'build/MIDI.js': "./js/**"
		},
		min: {
			'build/MIDI.min.js': ['build/MIDI.js']
		}
	});
	///
	grunt.registerTask('default', 'concat min');
	///
};