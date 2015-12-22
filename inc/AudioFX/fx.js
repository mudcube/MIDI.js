/*
	------------------------------------------------------------
	Tuna Presets
	------------------------------------------------------------
	{
		type: 'Phaser',
		rate: 1.2, //0.01 to 8 is a decent range, but higher values are possible
		depth: 0.3, //0 to 1
		feedback: 0.2, //0 to 1+
		stereoPhase: 30, //0 to 180
		baseModulationFrequency: 700, //500 to 1500
		bypass: false
	},
	{
		type: 'Chorus',
		rate: 1.5,
		feedback: 0.2,
		delay: 0.0045,
		bypass: false
	},
	{
		type: 'Delay',
		feedback: 0.45, //0 to 1+
		delayTime: 150, //how many milliseconds should the wet signal be delayed? 
		wetLevel: 0.25, //0 to 1+
		dryLevel: 1, //0 to 1+
		cutoff: 20, //cutoff frequency of the built in highpass-filter. 20 to 22050
		bypass: false
	},
	{
		type: 'Overdrive',
		outputGain: 0.5, //0 to 1+
		drive: 0.7, //0 to 1
		curveAmount: 1, //0 to 1
		algorithmIndex: 0, //0 to 5, selects one of our drive algorithms
		bypass: false
	},
	{
		type: 'Compressor',
		threshold: 0.5, //-100 to 0
		makeupGain: 1, //0 and up
		attack: 1, //0 to 1000
		release: 0, //0 to 3000
		ratio: 4, //1 to 20
		knee: 5, //0 to 40
		automakeup: true, //true/false
		bypass: false
	},
	{
		type: 'Convolver',
		highCut: 22050, //20 to 22050
		lowCut: 20, //20 to 22050
		dryLevel: 1, //0 to 1+
		wetLevel: 1, //0 to 1+
		level: 1, //0 to 1+, adjusts total output of both wet and dry
//		impulse: './js/tuna/impulses/impulse_rev.wav', //the path to your impulse response
		impulse: 'audio/filter/s3_r4_bd.wav', // http://chromium.googlecode.com/svn/trunk/samples/audio/simple.html
		bypass: false
	},
	{
		type: 'Filter',
		frequency: 20, //20 to 22050
		Q: 1, //0.001 to 100
		gain: 0, //-40 to 40
		bypass: 1, //0 to 1+
		filterType: 0 //0 to 7, corresponds to the filter types in the native filter node: lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass in that order
	},
	{
		type: 'Cabinet',
		makeupGain: 2, //0 to 20
		impulsePath: './js/tuna/impulses/impulse_guitar.wav', //path to your speaker impulse
		bypass: false
	},
	{
		type: 'Tremolo',
		intensity: 0.3, //0 to 1
		rate: 0.1, //0.001 to 8
		stereoPhase: 0, //0 to 180
		bypass: false
	},
		{
		type: 'WahWah',
		automode: true, //true/false
		baseFrequency: 0.5, //0 to 1
		excursionOctaves: 2, //1 to 6
		sweep: 0.2, //0 to 1
		resonance: 10, //1 to 100
		sensitivity: 0.5, //-1 to 1
		bypass: false
	},
	{
		type: 'Frequency',
		treble: 0,
		midtone: 0,
		bass: 0,
		bypass: false
	},
	{
		type: 'Panner',
		x: 0,
		y: 0,
		z: 0,
		distanceModel: 0, // 0-2 [linear, inverse, exponential]
		panningModel: 0, // 0-2 [equal-power, HRTF, pass-through]
		bypass: false
	},
	{
		type: 'Volume',
		amount: 1,
		bypass: false
	}
*/

if (typeof tuna === 'undefined') tuna = {};

tuna.filters = {};
tuna.filters.defaults = [
/*	{
		type: 'Cabinet',
		makeupGain: 2, //0 to 20
		impulsePath: './js/tuna/impulses/impulse_guitar.wav', //path to your speaker impulse
		bypass: false
	},
	{
		type: 'Tremolo',
		intensity: 0.3, //0 to 1
		rate: 0.1, //0.001 to 8
		stereoPhase: 0, //0 to 180
		bypass: false
	},
	{
		type: 'Panner',
		x: 0,
		y: 0,
		z: 0,
//		coneOuterGain: 0,
//		coneOuterAngle: 0,
//		coneInnerAngle: 0,
		distanceModel: 0, // 0-2 [linear, inverse, exponential]
		panningModel: 0, // 0-2 [equal-power, HRTF, pass-through]
		bypass: false
	},
	{
		type: 'Volume',
		amount: 1,
		bypass: false
	},
*/
	{
		type: 'Frequency',
		treble: 0,
		midtone: 0,
		bass: 0,
		volume: 1,
		bypass: false
	}
];

tuna.filters.defs = {
	Phaser: {
		 rate: [1.2, 0.01, 8], // is a decent range, but higher values are possible
		 depth: [0.3, 0, 1],
		 feedback: [0.2, 0, 1], // 0 to 1+
		 stereoPhase: [30, 0, 180],
		 baseModulationFrequency: [700, 500, 1500],
		 bypass: false
	},
	Chorus: {
		 rate: [1.5, 0, 10],
		 feedback:6[0.2, 0, 1],
		 delay: [0.03, 0, 1],
		 bypass: false
	},
	Delay: {
		feedback: [0.45, 0, 1], //+
		delayTime: [150, 0, 1000], //how many milliseconds should the wet signal be delayed? 
		wetLevel: [0.25, 0, 1], //+
		dryLevel: [1, 0, 1], //+
		cutoff: [20, 20, 22050], //cutoff frequency of the built in highpass-filter. 
		bypass: false
	},
	Overdrive: {
		outputGain: [0.5, 0, 1],//+
		drive: [0.7, 0, 1],
		curveAmount: [0.97, 0, 0.97],
		algorithmIndex: [0, 0, 5],// selects one of our drive algorithms
		bypass: false
	},
	Compressor: {
		 threshold: [0.5, -100, 0],
		 makeupGain: [1, 0, 20],
		 attack: [1, 0, 1000],
		 release: [0, 0, 3000],
		 ratio: [4, 1, 20],
		 knee: [5, 0, 40],
		 automakeup: true,
		 bypass: false
	},
	Convolver: {
		highCut: [22050, 20, 22050],
		lowCut: [20, 20, 22050],
		dryLevel: [1, 0, 1],//+
		wetLevel: [1, 0, 1],//+
		level: [1, 0, 1],//+, adjusts total output of both wet and dry
//			impulse: './js/tuna/impulses/impulse_rev.wav', //the path, your impulse response
		impulse: 'audio/filter/s3_r4_bd.wav', // http://chromium.googlecode.com/svn/trunk/samples/audio/simple.html
		bypass: false
	},
	Filter: {
		frequency: [20, 20, 22050],
		Q: [1, 0.001, 100],
		gain: [0, -40, 40],
		bypass: [1, 0, 1],//+
		filterType: [0, 0, 7],// corresponds, the filter types in the native filter node: [lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass in that order
		bypass: false
	},
	Cabinet: {
		makeupGain: [1, 0, 20],
		impulsePath: './js/tuna/impulses/impulse_guitar.wav', //path, your speaker impulse
		bypass: false
	},
	Tremolo: {
		intensity: [0.3, 0, 1],
		rate: [0.1, 0.001, 8],
		stereoPhase: [0, 0, 180],
		bypass: false
	},
	WahWah: {
		automode: true,
		baseFrequency: [0.5, 0, 1],
		excursionOctaves: [2, 1, 6],
		sweep: [0.2, 0, 1],
		resonance: [10, 1, 100],
		sensitivity: [0.5, -1, 1],
		bypass: false
	},
	EnvelopeFollower: {
		attackTime: [0.003, 0, 0.5],
		releaseTime: [0.5, 0, 0.5]
	},
	LFO: {
		frequency: [1, 0, 20],
		offset: [0.85, 0, 22049],
		oscillation: [0.3, -22050, 22050],
		phase: [0, 0, 2 * Math.PI]
	},		
	Frequency: {
		treble: [0, -20, 20],
		midtone: [0, -20, 20],
		bass: [0, -20, 20],
		volume: [1, 0, 2],
		bypass: false
	},
	Panner: {
		x: [0, -20, 20],
//		y: [0, -20, 20],
//		z: [0, -20, 20],
//		coneOuterGain: [0],
//		coneOuterAngle: [0],
//		coneInnerAngle: [0],
		distanceModel: [0, 0, 2],
		panningModel: [0, 0, 2],
		bypass: false
	},
	Volume: {
		amount: [1, 0, 2],
		bypass: false
	}
};

// tuna.filters.names = Object.keys(tuna.filters.defs).sort();
tuna.filters.names = ['Cabinet', 'Chorus', 'Convolver', 'Delay', 'Filter', 'Frequency', 'Overdrive', 'Panner', 'Tremolo', 'WahWah'] ;