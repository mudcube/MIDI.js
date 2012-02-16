/**
 * This version is supported by all browsers that support native JSON parsing:
 *  - Firefox 3.5+
 *  - Chrome 4.0+
 *  - Safari 4.0+
 *  - Opera 10.5+
 *  - Internet Explorer 8.0+
 *
 * If you want this version to work with other browsers, you can use the JSON parsing methods of your favorite Javascript
 * framework (e.g. jQuery, Dojo, YUI, Mootools, etc.)
 *
 * Note for IE8 users: if you include MidiBridge.js (or preferably the minified version of it: midibridge-0.5.min.js) in your html,
 * the method addEventListener will be added to the window object. In fact this method is just a wrapper around the attachEvent method,
 * see code at the bottom of this file.
 */

(function() {
    var midiBridge = {
        NOTE_OFF : 0x80, //128
        NOTE_ON : 0x90, //144
        POLY_PRESSURE : 0xA0, //160
        CONTROL_CHANGE : 0xB0, //176
        PROGRAM_CHANGE : 0xC0, //192
        CHANNEL_PRESSURE : 0xD0, //208
        PITCH_BEND : 0xE0, //224
        SYSTEM_EXCLUSIVE : 0xF0, //240
        NOTE_NAMES_SHARP : "sharp",
        NOTE_NAMES_FLAT : "flat",
        NOTE_NAMES_SOUNDFONT : "soundfont",
        NOTE_NAMES_ENHARMONIC_SHARP : "enh-sharp",
        NOTE_NAMES_ENHARMONIC_FLAT : "enh-flat"

    };
    //human readable representation of status byte midi data
    var status = [];
    status[0x80] = "NOTE OFF";
    status[0x90] = "NOTE ON";
    status[0xA0] = "POLY PRESSURE";
    status[0xB0] = "CONTROL CHANGE";
    status[0xC0] = "PROGRAM CHANGE";
    status[0xD0] = "CHANNEL PRESSURE";
    status[0xE0] = "PITCH BEND";
    status[0xF0] = "SYSTEM EXCLUSIVE";
    //notenames in different modi
    var noteNames = {
        "sharp" : ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
        "flat" : ["C", "Dâ™­", "D", "Eâ™­", "E", "F", "Gâ™­", "G", "Aâ™­", "A", "Bâ™­", "B"],
        "soundfont" : ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"],
        "enh-sharp" : ["B#", "C#", "C##", "D#", "D##", "E#", "F#", "F##", "G#", "G##", "A#", "A##"],
        "enh-flat" : ["Dâ™­â™­", "Dâ™­", "Eâ™­â™­", "Eâ™­", "Fâ™­", "Gâ™­â™­", "Gâ™­", "Aâ™­â™­", "Aâ™­", "Bâ™­", "Bâ™­", "Câ™­"]
    }
    //variable that holds a reference to the JSON parser method of your liking, defaults to native JSON parsing
    var parseJSON = JSON.parse;
    //method that gets called when midi note events arrive from the applet
    var ondata = null;
    var onerror = null;
    var onready = null;
    //the applet object
    var applet = null;
    var connectAllInputs = false;
    var connectFirstInput = false;
    var connectFirstOutput = false;
    var connectAllInputsToFirstOutput = true;
    var javaDir = "java";
    var devices = {};
    midiBridge.version = "0.5.1";
    midiBridge.ready = false;
    midiBridge.noteNameModus = midiBridge.NOTE_NAMES_SHARP;

    /**
     *  static method called to initialize the MidiBridge
     *  possible arguments:
     *  1) callback [function] callback when midi data has arrived
     *  2) config object
     *      - ready : [function] callback when midibridge is ready/initialized
     *      - error : [function] callback in case of an error
     *      - data : [function] callback when midi data has arrived
     *      - connectAllInputs : [true,false] all found midi input devices get connected automatically
     *      - connectFirstInput : [true,false] the first found midi input device gets connected automatically
     *      - connectFirstOutput : [true,false] the first found midi output device gets connected automatically
     *      - connectAllInputsToFirstOutput : [true,false] all found midi input devices will be automatically connected to the first found midi output device
     *      - javaDir : [string] the folder where you store the midiapplet.jar on your webserver, defaults to "java"
     */
    midiBridge.init = function(arg) {

        //var args = Array.prototype.slice.call(arguments);
        if( typeof arg === "function") {
            ondata = arg;
        } else if( typeof arg === "object") {
            var config = arg;
            connectAllInputs = config.connectAllInputs;
            connectFirstInput = config.connectFirstInput;
            connectFirstOutput = config.connectFirstOutput;
            connectAllInputsToFirstOutput = config.connectAllInputsToFirstOutput;
            ondata = config.data;
            onready = config.ready;
            onerror = config.error;
            switch(true) {
                case connectAllInputs && connectFirstOutput:
                    connectAllInputs = false;
                    connectFirstInput = false;
                    connectFirstOutput = false;
                    connectAllInputsToFirstOutput = true;
                    break;
                case connectAllInputsToFirstOutput:
                    connectAllInputs = false;
                    connectFirstInput = false;
                    connectFirstInput = false;
                    connectFirstOutput = false;
                    break;
                case connectFirstInput:
                    connectAllInputs = false;
                    connectAllInputsToFirstOutput = false;
                    break;
                case connectFirstOutput:
                    connectAllInputs = false;
                    connectAllInputsToFirstOutput = false;
                    break;
                case connectAllInputs:
                    connectFirstInput = false;
                    connectFirstOutput = false;
                    connectAllInputsToFirstOutput = false;
                    break;
            }
        }

        /**
         * Very simple java plugin detection
         */
        if(!navigator.javaEnabled()) {
            if(onerror) {
                onerror("no java plugin found; install or enable the java plugin")
            } else {
                console.log("no java plugin found; install or enable the java plugin");
            }
            return;
        }

        /**
         * If you are using the JSON parse method of your favorite Javascript framework replace the followingn lines by onlu:
         *
         *  loadJava();
         */

           loadJava();

    };

    /**
     * static method called by the applet
     */
    midiBridge.msgFromJava = function(jsonString) {
        var data = parseJSON(jsonString);
        var msgId = data.msgId;
        //console.log(jsonString);
        //console.log(msgId);
        switch(msgId) {
            case "upgrade-java":
                if(onerror) {
                    onerror("please upgrade your java plugin!")
                } else {
                    console.log("please upgrade your java plugin!");
                }
                break;
            case "midi-started":
                getApplet();
                if(applet) {
                    devices = data.devices;
                    midiBridge.ready = true;
                    if(connectAllInputs) {
                        midiBridge.connectAllInputs();
                    }
                    if(connectFirstInput) {
                        midiBridge.connectFirstInput();
                    }
                    if(connectFirstOutput) {
                        midiBridge.connectFirstOutput();
                    }
                    if(connectAllInputsToFirstOutput) {
                        midiBridge.connectAllInputsToFirstOutput();
                    }
                    if(onready) {
                        onready("midibridge started");
                    }
                }
                //console.log("applet:",applet);
                break;
            case "midi-data":
                if(ondata) {
                    ondata(new MidiMessage(data));
                }
                break;
            case "error":
                if(onerror) {
                    onerror(data.code);
                }
                break;
        }
    };

    /**
     * Send a midi event from javascript to java
     * @param status : the midi status byte, e.g. NOTE ON, NOTE OFF, PITCH BEND and so on
     * @param channel : the midi channel that this event will be sent to 0 - 15
     * @param data1 : the midi note number
     * @param data2 : the second data byte, when the status byte is NOTE ON or NOTE OFF, data2 is the velocity
     */
    midiBridge.sendMidiEvent = function(status, channel, data1, data2) {
        if(checkIfReady()) {
            return parseJSON(applet.processMidiEvent(status, channel, data1, data2));
        }
    };

    /**
     *  Get the list of all currently connected midi devices
     */
    midiBridge.getDevices = function() {
        return devices;
    };

    /**
     * Refresh the list of all currently connected midi devices
     */
    midiBridge.refreshDevices = function() {
        if(checkIfReady()) {
            return parseJSON(applet.getDevices());
        }
    };

    /**
     *  Connect all found midi inputs to the midibridge right after the midibridge has been initialized
     */
    midiBridge.connectAllInputs = function() {
        if(checkIfReady()) {
            return parseJSON(applet.connectAllInputs());
        }
    };

    /**
     *  Connect the first found midi input to the midibridge right after the midibridge has been initialized
     */
    midiBridge.connectFirstInput = function() {
        if(checkIfReady()) {
            return parseJSON(applet.connectFirstInput());
        }
    };

    /**
     *  Connect the first found midi output to the midibridge right after the midibridge has been initialized
     */
    midiBridge.connectFirstOutput = function() {
        if(checkIfReady()) {
            return parseJSON(applet.connectFirstOutput());
        }
    };

    /**
     *  Connect the first found midi output to all connected midi inputs right after the midibridge has been initialized
     */
    midiBridge.connectAllInputsToFirstOutput = function() {
        if(checkIfReady()) {
            return parseJSON(applet.connectAllInputsToFirstOutput());
        }
    };

    /**
     * Connect midi a midi input to the bridge, and/or a midi input to a midi output
     * @param midiInId : [int] id of the midi input that will be connected to the bridge, use the ids as retrieved by getDevices()
     * @param midiOutId : [int] optional, the id of the midi output that will be connected to the chosen midi input
     * @param filter : [array] an array containing status codes that will *not* be sent from the chosen midi input to the chosen midi output
     *  e.g. if you supply the array [midiBridge.PITCH_BEND, midiBridge.POLY_PRESSURE], pitch bend and poly pressure midi messages will not be forwarded to the output
     */
    midiBridge.addConnection = function(midiInId, midiOutId, filter) {
        if(checkIfReady()) {
            midiOutId = midiOutId == undefined ? -1 : midiOutId;
            filter = filter == undefined ? [] : filter;
            return parseJSON(applet.addConnection(midiInId, midiOutId, filter));
        }
    };

    /**
     * Remove a midi connection between between an input and the midibridge, and/or the given in- and output
     * @param midiIdIn : [int] the midi input
     * @param midiIdOut : [int] optional, the midi output
     */
    midiBridge.removeConnection = function(midiInId, midiOutId) {
        if(checkIfReady()) {
            return parseJSON(applet.removeConnection(midiInId, midiOutId));
        }
    };

    /**
     * All previously setup midi connections will be disconnected
     */
    midiBridge.disconnectAll = function() {
        if(checkIfReady()) {
            return parseJSON(applet.disconnectAll());
        }
    };
    
    midiBridge.loadBase64String = function(data){
        return parseJSON(applet.loadBase64String(data));
    }

    midiBridge.playBase64String = function(data){
        return parseJSON(applet.playBase64String(data));
    }

    midiBridge.loadMidiFile = function(url){
        return parseJSON(applet.loadMidiFile(url));
    }

    midiBridge.playMidiFile = function(url){
        return parseJSON(applet.playMidiFile(url));
    }

    midiBridge.startSequencer = function(){
        applet.startSequencer();
    }

    midiBridge.pauseSequencer = function(){
        applet.pauseSequencer();
    }

    midiBridge.stopSequencer = function(){
        applet.stopSequencer();
    }

    midiBridge.closeSequencer = function(){
        applet.closeSequencer();
    }

    midiBridge.getSequencerPosition = function(){
        return applet.getSequencerPosition();
    }

    midiBridge.setSequencerPosition = function(pos){
        applet.setSequencerPosition(pos);
    }

    /**
     * Check if a midiBridge function is called before initialization
     */
    function checkIfReady() {
        if(!midiBridge.ready) {
            if(onerror) {
                onerror("midibridge not ready!");
            }
            return "midibridge not ready!";
        }
        return true;
    }

    /**
     * A div with the applet object is added to the body of your html document
     */
    function loadJava() {
        //console.log("loadJava");
        var javaDiv = document.createElement("div");
        javaDiv.setAttribute("id", "midibridge-java");
        var html = "";
        html += '<object tabindex="0" id="midibridge-applet" type="application/x-java-applet" height="1" width="1">';
        html += '<param name="codebase" value="' + javaDir + '/" />';
        html += '<param name="archive" value="midiapplet.jar" />';
        html += '<param name="code" value="net.abumarkub.midi.applet.MidiApplet" />';
        html += '<param name="scriptable" value="true" />';
        html += '<param name="minJavaVersion" value="1.5" />';
        //html += 'Your browser needs the Java plugin to use the midibridge. You can download it <a href="http://www.java.com/en/" target="blank" title="abumarkub midibridge download java" rel="abumarkub midibridge download java">here</a>';
        html += '</object>';
        javaDiv.innerHTML = html;
        document.body.appendChild(javaDiv);
    }

    /**
     * class MidiMessage is used to wrap the midi note data that arrives from the applet
     */
    var MidiMessage = (function()//constructor
    {
        var _constructor = function(data) {
            this.data1 = data.data1;
            this.data2 = data.data2;
            this.status = data.status;
            this.status = this.data2 == 0 && this.status == midiBridge.NOTE_ON ? midiBridge.NOTE_OFF : this.status;
            this.channel = data.channel;
            this.noteName = midiBridge.getNoteName(this.data1, midiBridge.noteNameModus);
            this.statusCode = midiBridge.getStatus(this.status);
            this.microsecond = data.microsecond;
            this.time = midiBridge.getNiceTime(this.microsecond);
        };

        _constructor.prototype = {
            toString : function() {
                var s = "";
                s += this.noteName + " " + this.statusCode + " " + this.data1 + " " + this.data2 + " " + this.status;
                s += this.microsecond ? this.microsecond + " " + this.time : "";
                //console.log(s);
                return s;
            },
            toJSONString : function() {
                var s;
                if(this.microsecond){
                    s= "{'notename':" + this.noteName + ", 'status':" + this.status + ", 'data1':" + this.data1 + ", 'data2':" + this.data2 + ", 'microsecond':" + this.microsecond + ", 'time':" + this.time + "}";
                }else{
                    s= "{'notename':" + this.noteName + ", 'status':" + this.status + ", 'data1':" + this.data1 + ", 'data2':" + this.data2 + "}";
                }
                //console.log(s);
                return s;
            }
        }
        
        return _constructor;
    })();


    midiBridge.getNoteName = function(noteNumber, mode) {

        var octave = Math.floor(((noteNumber) / 12) - 1);
        var noteName = noteNames[mode][noteNumber % 12];
        return noteName + "" + octave;
    };


    midiBridge.getNoteNumber = function(noteName, octave) {
        var index = -1;
        noteName = noteName.toUpperCase();
        for(var key in noteNames) {
            var modus = noteNames[key];
            for(var i = 0, max = modus.length; i < max; i++) {
                if(modus[i] === noteName) {
                    index = i;
                    break;
                }
            }
        }
        if(index === -1) {
            return "invalid note name";
        }
        noteNumber = (12 + index) + (octave * 12);
        return noteNumber;
    }


    midiBridge.getStatus = function($statusCode) {
        return status[$statusCode];
    };
    
    midiBridge.getNiceTime = function(microseconds)
    {
        //console.log(microseconds);
        var r	= "";
			
        var t 		= (microseconds / 1000 / 1000) >> 0;
        var h 		= (t / (60 * 60)) >> 0;
        var m 		= ((t % (60 * 60)) / 60) >> 0;
        var s 		= t % (60);
        var ms          = (((microseconds /1000) - (h * 3600000) - (m * 60000) - (s * 1000)) + 0.5) >> 0;
	
        //console.log(t,h,m,s,ms);
        
        r               += h > 0 ?  h + ":" : "";
        r		+= h > 0 ? m < 10 ? "0" + m : m : m;
        r 		+= ":";
        r		+= s < 10 ? "0" + s : s;
        r		+= ":";
        r		+= ms == 0 ? "000" : ms < 10 ? "00" + ms : ms < 100 ? "0" + ms : ms;
        
        return r;
    }   


    function getApplet() {
        try {
            applet = midiBridge.getObject("midibridge-applet");
        } catch(e) {
            //console.log(e)
            //Firefox needs more time to initialize the Applet
            setTimeout(getApplet, 25);
            return;
        }
    }

    midiBridge.getObject = function(objectName) {
        var ua = navigator.userAgent.toLowerCase();
        //console.log(ua);
        if(ua.indexOf("msie") !== -1 || ua.indexOf("webkit") !== -1) {
            return window[objectName];
        } else {
            return document[objectName];
        }
    }

    //add addEventListener to IE8
    if(!window.addEventListener) {
        window.addEventListener = function($id, $callback, $bubble) {
            window.attachEvent('onload', $callback);
        }

    }

    window.midiBridge = midiBridge;

})(window);