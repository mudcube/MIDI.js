Latest news
====
New effects added: Chorus, Phaser, and Tremolo. <br /> Be sure to follow us at <a href="https://twitter.com/DinahmoeSTHLM">@DinahmoeSTHLM</a> for future updates. Feel free to create your own effects and give us a pull request!

tuna
====

An audio effects library for the Web Audio API. Created by <a href="http://www.dinahmoe.com">DinahMoe</a>

<img src="https://i.chzbgr.com/completestore/12/9/4/rjttPiC7WE6S4Bi22aYp1A2.jpg" alt="tuna, tuna, tuna"/>

Effect list:
====
<ul>
    <li>Overdrive (6 different algorithms)</li>
    <li>Filter</li>
    <li>Cabinet</li>
    <li>Delay</li>
    <li>Convolver (Reverb)</li>
    <li>Compressor</li>
    <li>WahWah</li>
    <li>Tremolo</li>
    <li>Phaser</li>
    <li>Chorus</li>
</ul>

Usage
====

Start by creating a new Tuna object like so:

<pre>
var context = new webkitAudioContext();
var tuna = new Tuna(context);
</pre>

You need to pass the audio context you're using in your application. Tuna will be using it to create its effects.

You create a new tuna node as such:

<pre>
var chorus = new tuna.Chorus({
                 rate: 1.5,
                 feedback: 0.2,
                 delay: 0.0045,
                 bypass: 0
             });
</pre>
You can then connect the tuna node to native Web Audio nodes by doing:
<pre>
nativeNode.connect(chorus.input);
chorus.connect(anotherNativeNode);
</pre>
or to other tuna nodes by doing:
<pre>
tunaNode.connect(chorus.input);
chorus.connect(anotherTunaNode.input);
</pre>
All tuna nodes are connected TO by using the nodes input property, but connecting FROM the tuna node works as it does with ordinary native AudioNodes.


The nodes
====

A basic chorus effect.
<pre>
var chorus = new tuna.Chorus({
                 rate: 1.5,         //0.01 to 8+
                 feedback: 0.2,     //0 to 1+
                 delay: 0.0045,     //0 to 1
                 bypass: 0          //the value 1 starts the effect as bypassed, 0 or 1
             });
</pre>

A delay effect with feedback and a highpass filter applied to the delayed signal.
<pre>
var delay = new tuna.Delay({
                feedback: 0.45,    //0 to 1+
                delayTime: 150,    //how many milliseconds should the wet signal be delayed? 
                wetLevel: 0.25,    //0 to 1+
                dryLevel: 1,       //0 to 1+
                cutoff: 20,        //cutoff frequency of the built in highpass-filter. 20 to 22050
                bypass: 0
            });
</pre>

A basic phaser effect.
<pre>
var phaser = new tuna.Phaser({
                 rate: 1.2,                     //0.01 to 8 is a decent range, but higher values are possible
                 depth: 0.3,                    //0 to 1
                 feedback: 0.2,                 //0 to 1+
                 stereoPhase: 30,               //0 to 180
                 baseModulationFrequency: 700,  //500 to 1500
                 bypass: 0
             });
</pre>

A basic overdrive effect.
<pre>
var overdrive = new tuna.Overdrive({
                    outputGain: 0.5,         //0 to 1+
                    drive: 0.7,              //0 to 1
                    curveAmount: 1,          //0 to 1
                    algorithmIndex: 0,       //0 to 5, selects one of our drive algorithms
                    bypass: 0
                });
</pre>

A compressor with the option to use automatic makeup gain.
<pre>
var compressor = new tuna.Compressor({
                     threshold: 0.5,    //-100 to 0
                     makeupGain: 1,     //0 and up
                     attack: 1,         //0 to 1000
                     release: 0,        //0 to 3000
                     ratio: 4,          //1 to 20
                     knee: 5,           //0 to 40
                     automakeup: true,  //true/false
                     bypass: 0
                 });
</pre>

A convolver with high- and lowcut. You can find a lot of impulse resonses <a href="http://chromium.googlecode.com/svn/trunk/samples/audio/impulse-responses/">here</a>
<pre>
var convolver = new tuna.Convolver({
                    highCut: 22050,                         //20 to 22050
                    lowCut: 20,                             //20 to 22050
                    dryLevel: 1,                            //0 to 1+
                    wetLevel: 1,                            //0 to 1+
                    level: 1,                               //0 to 1+, adjusts total output of both wet and dry
                    impulse: "impulses/impulse_rev.wav",    //the path to your impulse response
                    bypass: 0
                });
</pre>

A basic filter.
<pre>
var filter = new tuna.Filter({
                 frequency: 20,         //20 to 22050
                 Q: 1,                  //0.001 to 100
                 gain: 0,               //-40 to 40
                 bypass: 1,             //0 to 1+
                 filterType: 0,         //0 to 7, corresponds to the filter types in the native filter node: lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass in that order
                 bypass: 0
             });
</pre>

A cabinet/speaker emulator.
<pre>
var cabinet = new tuna.Cabinet({
                  makeupGain: 1,                                 //0 to 20
                  impulsePath: "impulses/impulse_guitar.wav",    //path to your speaker impulse
                  bypass: 0
              });
</pre>

A basic tremolo.
<pre>
var tremolo = new tuna.Tremolo({
                  intensity: 0.3,    //0 to 1
                  rate: 0.1,         //0.001 to 8
                  stereoPhase: 0,    //0 to 180
                  bypass: 0
              });
</pre>

A wahwah with an auto wah option.
<pre>
var wahwah = new tuna.WahWah({
                 automode: true,                //true/false
                 baseFrequency: 0.5,            //0 to 1
                 excursionOctaves: 2,           //1 to 6
                 sweep: 0.2,                    //0 to 1
                 resonance: 10,                 //1 to 100
                 sensitivity: 0.5,              //-1 to 1
                 bypass: 0
             });
</pre>