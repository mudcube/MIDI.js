// Web Audio API Simulator
// Copyright (c) 2013 g200kg
// http://www.g200kg.com/
//         Released under the MIT-License
//         http://opensource.org/licenses/MIT
//
//  Great thanks :
//  FFT algo for AnalyserNode and Convolver is based on Takuya OOURA's explanation.
//   http://www.kurims.kyoto-u.ac.jp/~ooura/fftman/index.html

if(typeof(waapisimLogEnable)==="undefined")
	var waapisimLogEnable=0;

// Support Float32Array&Uint8Array if unavailable (for IE9)
if(typeof(Float32Array)==="undefined") {
	Float32Array=function(n) {
		if(n instanceof Array)
			return n;
		var a=new Array(n);
		a.subarray=function(x,y) {return this.slice(x,y);};
		a.set=function(x,off) {for(var i=0;i<x.length;++i) a[off+i]=x[i];};
		return a;
	};
}
if(typeof(Uint8Array)==="undefined") {
	Uint8Array=function(n) {
		if(n instanceof Array)
			return n;
		var a=new Array(n);
		a.subarray=function(x,y) {return this.slice(x,y);};
		a.set=function(x,off) {for(var i=0;i<x.length;++i) a[off+i]=x[i];};
		return a;
	};
}

if(typeof(waapisimLogEnable)!=="undefined"&&waapisimLogEnable)
	waapisimDebug=function(a) {console.log(a);};
else
	waapisimDebug=function(){};

if(typeof(webkitAudioContext)!=="undefined") {
	if(typeof(webkitAudioContext.prototype.createGain)==="undefined") {
		webkitAudioContext.prototype.createScriptProcessor=webkitAudioContext.prototype.createJavaScriptNode;
		webkitAudioContext.prototype.createGain=(function(){
			var o=webkitAudioContext.prototype.createGainNode.call(this);
			o._gain=o.gain; o.gain=o._gain;
			o.gain.setTargetAtTime=o._gain.setTargetValueAtTime;
			return o;
		});
		webkitAudioContext.prototype.createDelay=(function(){
			var o=webkitAudioContext.prototype.createDelayNode.call(this);
			o._delayTime=o.delayTime; o.delayTime=o._delayTime;
			o.delayTime.setTargetAtTime=o._delayTime.setTargetValueAtTime;
			return o;
		});
		webkitAudioContext.prototype._createOscillator=webkitAudioContext.prototype.createOscillator;
		webkitAudioContext.prototype.createOscillator=(function() {
			var o=webkitAudioContext.prototype._createOscillator.call(this);
			o._frequency=o.frequency; o.frequency=o._frequency;
			o.frequency.setTargetAtTime=o._frequency.setTargetValueAtTime;
			o._detune=o.detune; o.detune=o._detune;
			o.detune.setTargetAtTime=o._detune.setTargetValueAtTime;
			o.start=o.noteOn;
			o.stop=o.noteOff;
			return o;
		});
		webkitAudioContext.prototype._createBufferSource=webkitAudioContext.prototype.createBufferSource;
		webkitAudioContext.prototype.createBufferSource=(function() {
			var o=webkitAudioContext.prototype._createBufferSource.call(this);
			o._playbackRate=o.playbackRate; o.playbackRate=o._playbackRate;
			o.playbackRate.setTargetAtTime=o._playbackRate.setTargetValueAtTime;
			o.start=function(w,off,dur) {
				if(off===undefined)
					o.noteOn(w);
				else
					o.noteGrainOn(w,off,dur);
			};
			o.stop=o.noteOff;
			return o;
		});
		webkitAudioContext.prototype._createBiquadFilter=webkitAudioContext.prototype.createBiquadFilter;
		webkitAudioContext.prototype.createBiquadFilter=(function() {
			var o=webkitAudioContext.prototype._createBiquadFilter.call(this);
			o._frequency=o.frequency; o.frequency=o._frequency;
			o.frequency.setTargetAtTime=o._frequency.setTargetValueAtTime;
			o._Q=o.Q; o.Q=o._Q;
			o.Q.setTargetAtTime=o._Q.setTargetValueAtTime;
			o._gain=o.gain; o.gain=o._gain;
			o.gain.setTargetAtTime=o._gain.setTargetValueAtTime;
			return o;
		});
		webkitAudioContext.prototype._createDynamicsCompressor=webkitAudioContext.prototype.createDynamicsCompressor;
		webkitAudioContext.prototype.createDynamicsCompressor=(function() {
			var o=webkitAudioContext.prototype._createDynamicsCompressor.call(this);
			o._threshold=o.threshold; o.threshold=o._threshold;
			o.threshold.setTargetAtTime=o._threshold.setTargetValueAtTime;
			o._knee=o.knee; o.knee=o._knee;
			o.knee.setTargetAtTime=o._knee.setTargetValueAtTime;
			o._ratio=o.ratio; o.ratio=o._ratio;
			o.ratio.setTargetAtTime=o._ratio.setTargetValueAtTime;
			o._attack=o.attack; o.attack=o._attack;
			o.attack.setTargetAtTime=o._attack.setTargetValueAtTime;
			return o;
		});
	}
}
if((typeof(waapisimForceSim)!=="undefined"&&waapisimForceSim)
		||(typeof(AudioContext)!=="undefined"&&typeof(AudioContext.prototype.createOscillator)==="undefined"&&(typeof(waapisimForceSimWhenLackOsc)==="undefined"||(typeof(waapisimForceSimWhenLackOsc)!=="undefined"&&waapisimForceSimWhenLackOsc)))
		||(typeof(webkitAudioContext)==="undefined" && typeof(waapisimForceSimWhenNotWebkit)!=="undefined"&&waapisimForceSimWhenNotWebkit)
		||(typeof(webkitAudioContext)==="undefined" && typeof(AudioContext)==="undefined")) {
	waapisimSampleRate=44100;
	waapisimAudioIf=0;
	waapisimBufSize=1024;
	waapisimFlashBufSize=1024*3;
	if(typeof(Audio)!=="undefined") {
		waapisimAudio=new Audio();
		if(typeof(waapisimAudio.mozSetup)!=="undefined")
			waapisimAudioIf=1;
	}
	if(waapisimAudioIf===0) {
		waapisimOutBufSize=waapisimFlashBufSize;
		waapisimOutBuf=new Array(waapisimOutBufSize*2);
	}
	else {
		waapisimOutBufSize=waapisimBufSize;
		waapisimOutBuf=new Float32Array(waapisimOutBufSize*2);
		waapisimAudio.mozSetup(2,waapisimSampleRate);
	}
	for(var l=waapisimOutBuf.length,i=0;i<l;++i)
		waapisimOutBuf[i]=0;
	waapisimWrittenpos=0;
	waapisimNodeId=0;
	waapisimContexts=[];
	waapisimAudioBuffer=function(ch,len,rate) {
		var i,j;
		if(typeof(ch)=="number") {
			len|=0;
			this.sampleRate=rate;
			this.length=len;
			this.duration=len/this.sampleRate;
			this.numberOfChannels=ch;
			this.buf=[];
			for(i=0;i<2;++i) {
				this.buf[i]=new Float32Array(len);
				for(j=0;j<len;++j)
					this.buf[i][j]=0;
			}
		}
		else {
			var inbuf;
			this.sampleRate=44100;
			this.buf=[];
			this.buf[0]=new Float32Array(0);
			this.buf[1]=new Float32Array(0);
			this.Get4BStr=function(b,n) {
				return String.fromCharCode(b[n],b[n+1],b[n+2],b[n+3]);
			};
			this.GetDw=function(b,n) {
				return b[n]+(b[n+1]<<8)+(b[n+2]<<16)+(b[n+3]<<24);
			};
			this.GetWd=function(b,n) {
				return b[n]+(b[n+1]<<8);
			};
			inbuf=new Uint8Array(ch);
			var mixtomono=len;
			var riff=this.Get4BStr(inbuf,0);
			this.length=0;
			if(riff=="RIFF") {
				var filesize=this.GetDw(inbuf,4)+8;
				var wave=this.Get4BStr(inbuf,8);
				var fmtid=0;
				var wavch=1;
				var wavbits=16;
				if(wave=="WAVE") {
					var idx=12;
					while(idx<filesize) {
						var chunk=this.Get4BStr(inbuf,idx);
						var chunksz=this.GetDw(inbuf,idx+4);
						if(chunk=="fmt ") {
							fmtid=this.GetWd(inbuf,idx+8);
							wavch=this.GetWd(inbuf,idx+10);
							this.sampleRate=this.GetDw(inbuf,idx+12);
							wavbits=this.GetWd(inbuf,idx+22);
						}
						if(chunk=="data") {
							this.length=(chunksz/wavch/(wavbits/8))|0;
							this.buf[0]=new Float32Array(this.length);
							this.buf[1]=new Float32Array(this.length);
							this.numberOfChannels=wavch;
							this.duration=this.length/this.sampleRate;
							var v0,v1;
							for(i=0,j=0;i<this.length;++i) {
								if(wavbits==24) {
									if(wavch==2) {
										v0=inbuf[idx+j+9]+(inbuf[idx+j+10]<<8);
										v1=inbuf[idx+j+12]+(inbuf[idx+j+13]<<8);
										if(v0>=32768) v0=v0-65536;
										if(v1>=32768) v1=v1-65536;
										if(mixtomono===true)
											v0=v1=(v0+v1)*0.5;
										this.buf[0][i]=v0/32768;
										this.buf[1][i]=v1/32768;
										j+=6;
									}
									else {
										v=inbuf[idx+j+9]+(inbuf[idx+j+10]<<8);
										if(v>=32768) v=v-65536;
										this.buf[0][i]=this.buf[1][i]=v/32768;
										j+=3;
									}
								}
								else if(wavbits==16) {
									if(wavch==2) {
										v0=inbuf[idx+j+8]+(inbuf[idx+j+9]<<8);
										v1=inbuf[idx+j+10]+(inbuf[idx+j+11]<<8);
										if(v0>=32768) v0=v0-65536;
										if(v1>=32768) v1=v1-65536;
										if(mixtomono===true)
											v0=v1=(v0+v1)*0.5;
										this.buf[0][i]=v0/32768;
										this.buf[1][i]=v1/32768;
										j+=4;
									}
									else {
										v=inbuf[idx+j+8]+(inbuf[idx+j+9]<<8);
										if(v>=32768) v=v-65536;
										this.buf[0][i]=this.buf[1][i]=v/32768;
										j+=2;
									}
								}
								else {
									if(wavch==2) {
										v0=inbuf[idx+j+8]/128-1;
										v1=inbuf[idx+j+9]/128-1;
										if(mixtomono===true)
											v0=v1=(v0+v1)*0.5;
										this.buf[0][i]=v0;
										this.buf[1][i]=v1;
										j+=2;
									}
									else {
										this.buf[0][i]=this.buf[1][i]=inbuf[idx+j+8]/128-1;
										j++;
									}
								}
							}
						}
						idx+=(chunksz+8);
					}
				}
			}
		}
		this.getChannelData=function(i) {
			return this.buf[i];
		};
		return this;
	};
	waapisimDummybuf=new waapisimAudioBuffer(2,waapisimBufSize,waapisimSampleRate);
	waapisimSetupOutBuf=function(offset) {
		var numctx=waapisimContexts.length;
		var l,i,j,k,n,node;
		for(l=(offset+waapisimBufSize)*2,i=offset*2;i<l;i+=2)
			waapisimOutBuf[i]=waapisimOutBuf[i+1]=0;
		for(n=0;n<numctx;++n) {
			var ctx=waapisimContexts[n];
			for(;;) {
				for(l=ctx._Nodes.length,i=0;i<l;++i) {
					node=ctx._Nodes[i];
					if(node.playbackState==3) {
						node.disconnect();
						ctx._UnregisterNode(node);
						break;
					}
				}
				if(i==l)
					break;
			}
			for(l=ctx._Nodes.length,i=0;i<l;++i)
				ctx._Nodes[i]._Process();
			node=ctx.destination;
			if(node._nodein[0].from.length>0) {
				var buf=node._nodein[0].inbuf.buf;
				for(i=0;i<waapisimBufSize;++i) {
					waapisimOutBuf[(i+offset)*2]+=buf[0][i];
					waapisimOutBuf[(i+offset)*2+1]+=buf[1][i];
				}
			}
			node._nodein[0].NodeClear();
		}
	};
	waapisimUpdateCurrentTime=function(t) {
		for(var i=waapisimContexts.length;i--;)
			waapisimContexts[i].currentTime=t;
	};
	waapisimInterval=function() {
		var curpos=waapisimAudio.mozCurrentSampleOffset();
		var buffered=waapisimWrittenpos-curpos;
		var vl,vr;
		waapisimUpdateCurrentTime(curpos/(waapisimSampleRate*2));
		if(buffered<16384) {
			waapisimSetupOutBuf(0);
			waapisimWrittenpos+=waapisimAudio.mozWriteAudio(waapisimOutBuf);
		}
	};
	waapisimGetSwfPath=function() {
		var scr=document.getElementsByTagName("SCRIPT");
		if(scr&&scr.length>0) {
			for(var i in scr) {
				if(scr[i].src && scr[i].src.match(/waapisim\.js$/)) {
					var s=scr[i].src;
					return s.substring(0,s.length-2)+"swf";
				}
			}
		}
		return "";
	};
	waapisimAddFlashObj=function() {
		var div=document.createElement("DIV");
		div.setAttribute("id","WAAPISIMFLASHOBJ");
		div.setAttribute("style","background:#ff00ff;position:static;");
		var body=document.getElementsByTagName("BODY");
		body[0].appendChild(div);
		document.getElementById("WAAPISIMFLASHOBJ").innerHTML="<div style='position:fixed;right:0px;bottom:0px'> <object id='waapisim_swf' CLASSID='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' CODEBASE='http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=4,0,0,0' width=150 height=20><param name=movie value='"+waapisimSwfPath+"'><PARAM NAME=bgcolor VALUE=#FFFFFF><PARAM NAME=LOOP VALUE=false><PARAM NAME=quality VALUE=high><param name='allowScriptAccess' value='always'><embed src='"+waapisimSwfPath+"' width=150 height=20 bgcolor=#FFFFFF loop=false quality=high pluginspage='http://www.macromedia.com/shockwave/download/index.cgi?P1_Prod_Version=ShockwaveFlash' type='application/x-shockwave-flash' allowScriptAccess='always'></embed></object></div>";
		if(typeof(document.getElementById("waapisim_swf").SetReturnValue)==="undefined")
			document.getElementById("waapisim_swf").SetReturnValue=function(v){document.getElementById("waapisim_swf").impl.SetReturnValue(v);};
	};
	waapisimFlashOffset=function(pos) {
		waapisimUpdateCurrentTime(pos/1000);
	};
	waapisimFlashGetData=function() {
		var s="";
		var l;
		for(l=waapisimOutBufSize/waapisimBufSize,i=0;i<l;++i) {
			waapisimSetupOutBuf(waapisimBufSize*i);
		}
		waapisimWrittenpos+=waapisimOutBufSize*2;
		for(l=waapisimOutBufSize*2,i=0;i<l;++i) {
			var v=(waapisimOutBuf[i]*16384+32768)|0;
			if(isNaN(v)) v=32768;
			v = Math.min(49152, Math.max(16384, v));
			s+=String.fromCharCode(v);
		}
		return s;
	};
	switch(waapisimAudioIf) {
	case 0:
		waapisimSwfPath=waapisimGetSwfPath();
		window.addEventListener("load",waapisimAddFlashObj,false);
		break;
	case 1:
		setInterval(waapisimInterval,10);
		break;
	}
	AudioContext=webkitAudioContext=function() {
		waapisimContexts.push(this);
		this._Nodes=[];
		this.destination=new waapisimAudioDestinationNode(this);
		this.sampleRate=44100;
		this.currentTime=0;
		this.activeSourceCount=0;
		this.listener=new waapisimAudioListener();
		this.createBuffer=function(ch,len,rate) {
			return new waapisimAudioBuffer(ch,len,rate);
		};
		this.createBufferSource=function() {
			return new waapisimAudioBufferSource(this);
		};
		this.createScriptProcessor=this.createJavaScriptNode=function(bufsize,inch,outch) {
			return new waapisimScriptProcessor(this,bufsize,inch,outch);
		};
		this.createBiquadFilter=function() {
			return new waapisimBiquadFilter(this);
		};
		this.createGain=this.createGainNode=function() {
			return new waapisimGain(this);
		};
		this.createDelay=this.createDelayNode=function() {
			return new waapisimDelay(this);
		};
		this.createOscillator=function() {
			return new waapisimOscillator(this);
		};
		this.createAnalyser=function() {
			return new waapisimAnalyser(this);
		};
		this.createConvolver=function() {
			return new waapisimConvolver(this);
		};
		this.createDynamicsCompressor=function() {
			return new waapisimDynamicsCompressor(this);
		};
		this.createPanner=function() {
			return new waapisimPanner(this);
		};
		this.createChannelSplitter=function(ch) {
			return new waapisimChannelSplitter(this,ch);
		};
		this.createChannelMerger=function(ch) {
			return new waapisimChannelMerger(this,ch);
		};
		this.createWaveShaper=function() {
			return new waapisimWaveShaper(this);
		};
		this.decodeAudioData=function(audioData,successCallback,errorCallback) {
			var buf=new waapisimAudioBuffer(audioData,false);
			if(buf.length>0)
				successCallback(buf);
			else
				errorCallback();
		};
		this.createPeriodicWave=this.createWaveTable=function(real,imag) {
			return new waapisimPeriodicWave(real,imag);
		};
		this._SortNode=function() {
			var i,j,k,n;
			for(i=0;i<this._Nodes.length;++i) {
				n=this._Nodes[i];
				if(n._order>0) {
					for(j=0;j<n._nodein.length;++j) {
						for(k=0;k<n._nodein[j].from.length;++k) {
							var o=n._nodein[j].from[k].node._order;
							if(n._order<o+1)
								n._order=o+1;
						}
					}
				}
			}
			this._Nodes.sort(function(a,b){return b._order-a._order;});
		}
		this._RegisterNode=function(node) {
			for(var i=this._Nodes.length;i--;) {
				if(this._Nodes[i]===node) {
					return false;
				}
			}
			this._Nodes.push(node);
			this._SortNode();
			return true;
		};
		this._UnregisterNode=function(node) {
			for(var i=this._Nodes.length;i--;) {
				if(this._Nodes[i]==node) {
					this._Nodes.splice(i,1);
				}
			}
		};
	};
	waapisimAudioListener=function() {
		this.px=0; this.py=0; this.pz=0;
		this.ox=0; this.oy=0; this.oz=-1;
		this.ux=0; this.uy=1; this.uz=0;
		this.dopplerFactor=1;
		this.speedOfSound=343.3;
		this.setPosition=function(x,y,z) {this.px=x;this.py=y;this.pz=z;};
		this.setOrientation=function(x,y,z,ux,uy,uz) {this.ox=x;this.oy=y;this.oz=z;this.ux=ux;this.uy=uy;this.uz=uz;};
		this.setVelocity=function(x,y,z) {};
	};
	waapisimPeriodicWave=function(real,imag) {
		var n=4096;
		var ar=new Array(n);
		var ai=new Array(n);
		this.buf=new Float32Array(n);
		var m, mh, i, j, k;
		var wr, wi, xr, xi;
		for(i=0;i<n;++i)
			ar[i]=ai[i]=0;
		i=j=0;
		do {
			ar[i]=real[j];
			ai[i]=-imag[j];
			for(var k=n>>1;k>(i^=k);k>>=1)
				;
		} while(++j<real.length);
		var theta=2*Math.PI;
		for(mh=1;(m=mh<<1)<=n;mh=m) {
			theta *= 0.5;
			for(i=0;i<mh;i++) {
				wr=Math.cos(theta*i);
				wi=Math.sin(theta*i);
				for(j=i;j<n;j+=m) {
					k=j+mh;
					xr=wr*ar[k]-wi*ai[k];
					xi=wr*ai[k]+wi*ar[k];
					ar[k]=ar[j]-xr;
					ai[k]=ai[j]-xi;
					ar[j]+=xr;
					ai[j]+=xi;
				}
			}
		}
		var max=0;
		for(i=0;i<n;++i) {
			var v=Math.abs(ar[i]);
			if(v>max)
				max=v;
		}
		if(max==0) {
			for(i=0;i<n;++i)
				this.buf[i]=0;
		}
		else {
			for(i=0;i<n;++i)
				this.buf[i]=ar[i]/max;
		}
	};
	waapisimAudioNode=function(size,numin,numout) {
		this.numberOfInputs=numin;
		this.numberOfOutputs=numout;
		this._nodeId=waapisimNodeId;
		this._order=1;
		++waapisimNodeId;
		this._targettype=1;
		this.context=null;
		this._nodein=[];
		this._nodeout=[];
		var i;
		for(i=0;i<numin;++i)
			this._nodein[i]=new waapisimAudioNodeIn(this,size);
		for(i=0;i<numout;++i)
			this._nodeout[i]=new waapisimAudioNodeOut(this,size);
		this.connect=function(next,output,input) {
			if(typeof(output)==="undefined")
				output=0;
			if(typeof(input)==="undefined")
				input=0;
			if(this._nodeout[output]) {
				if(next._targettype!==0)
					this._nodeout[output].connect(next._nodein[input]);
				else
					this._nodeout[output].connect(next);
			}
		};
		this.disconnect=function(output) {
			if(typeof(this._nodeout[output])==="undefined")
				output=0;
			this._nodeout[output].disconnect();
		};
	};
	waapisimAudioNodeIn=function(node,size) {
		this.node=node;
		this.from=[];
		this.inbuf=new waapisimAudioBuffer(2,size,waapisimSampleRate);
		this.NodeClear=function() {
			for(var i=0;i<waapisimBufSize;++i)
				this.inbuf.buf[0][i]=this.inbuf.buf[1][i]=0;
		};
	};
	waapisimAudioNodeOut=function(node,size) {
		this.node=node;
		this.to=[];

		this.connect=function(next) {
			waapisimDebug("connect "+this.node._nodetype+this.node._nodeId+"=>"+next.node._nodetype+next.node._nodeId);
			if(next===undefined)
				return;
			if(next.from.indexOf(this)!=-1)
				return;
			next.from.push(this);
			if(this.to.indexOf(next)==-1)
				this.to.push(next);
			if(next.node._targettype!==0) {
				if(this.node.context._RegisterNode(next.node)) {
					for(var i=0;i<next.node._nodeout.length;++i) {
						for(var ii=0;ii<next.node._nodeout[i].to.length;++ii) {
							next.node._nodeout[i].connect(next.node._nodeout[i].to[ii]);
						}
					}
				}
			}
		};
		this.disconnectTemp=function() {
			var i,j,k,l,n,ii,jj,ll,node,node2;
			waapisimDebug("disconnect "+this.node._nodetype+this.node._nodeId);
			var nodes=this.node.context._Nodes;
			for(l=nodes.length,i=0;i<l;++i) {
				for(ll=nodes[i]._nodein.length,ii=0;ii<ll;++ii) {
					j=nodes[i]._nodein[ii].from.indexOf(this);
					if(j>=0) {
						waapisimDebug("  :"+this.node._nodeId+"=>"+nodes[i]._nodeId);
						nodes[i]._nodein[ii].from.splice(j,1);
					}
				}
			}
			for(i=0;i<nodes.length;++i) {
				node=nodes[i];
				if(node._targettype==1) {
					n=0;
					for(ii=0;ii<node._nodein.length;++ii)
						n+=node._nodein[ii].from.length;
					if(n===0) {
						this.node.context._UnregisterNode(node);
						for(ii=0;ii<node._nodeout.length;++ii)
							node._nodeout[ii].disconnectTemp();
						break;
					}
				}
			}
		};
		this.disconnect=function() {
			this.disconnectTemp();
			this.to.length=0;
		};
		this.NodeEmit=function(idx,v1,v2) {
			for(var l=this.to.length,i=0;i<l;++i) {
				var buf=this.to[i].inbuf.buf;
				buf[0][idx]+=v1;
				buf[1][idx]+=v2;
			}
		};
		this.NodeEmitBuf=function() {
			for(var l=this.to.length,i=0;i<l;++i) {
				var b0=this.to[i].inbuf.buf[0];
				var b1=this.to[i].inbuf.buf[1];
				for(var j=0;j<waapisimBufSize;++j) {
					b0[j]+=this.outbuf.buf[0][j];
					b1[j]+=this.outbuf.buf[1][j];
				}
			}
		};
		this.outbuf=new waapisimAudioBuffer(2,size,waapisimSampleRate);
	};
	waapisimAudioProcessingEvent=function() {
	};
	waapisimAudioDestinationNode=function(ctx) {
		waapisimAudioNode.call(this,waapisimBufSize,1,0);
		this._nodetype="Destination";
		waapisimDebug("create "+this._nodetype+this._nodeId);
		this._targettype=2;
		this.context=ctx;
		this.playbackState=0;
		this.maxNumberOfChannels=2;
		this.numberOfChannels=2;
		this._Process=function() {};
		ctx._Nodes.push(this);
	};
	
	waapisimAudioBufferSource=webkitAudioBufferSourceNode=AudioBufferSourceNode=function(ctx) {
		waapisimAudioNode.call(this,waapisimBufSize,0,1);
		this._nodetype="BufSrc";
		waapisimDebug("create "+this._nodetype+this._nodeId);
		this._targettype=3;
		this._order=0;
		this.context=ctx;
		this.playbackState=0;
		this.buffer=null;
		this.playbackRate=new waapisimAudioParam(ctx,this,0,10,1);
		this.gain=new waapisimAudioParam(ctx,this,0,1,1); // Undocumented
		this.loop=false;
		this.loopStart=0;
		this.loopEnd=0;
		this._bufferindex=0;
		this._whenstart=0;
		this._whenstop=Number.MAX_VALUE;
		this._endindex=0;
		this._actualLoopStart=0;
		this._actualLoopEnd=0;
		this.start=this.noteOn=this.noteGrainOn=function(w,off,dur) {
			if(this.buffer===null)
				return;
			this.playbackState=1;
			this._whenstart=w;
			if(off>0)
				this._bufferindex=off*waapisimSampleRate;
			this._endindex=this.buffer.length;
			if(dur>0)
				this._endindex=Math.min(this.buffer.length,(dur+off)*waapisimSampleRate);
			if(this.loop) {
				if((this.loopStart||this.loopEnd)&&this.loopStart>=0&&this.loopEnd>0&&this.loopStart<this.loopEnd) {
					this._actualLoopStart=this.loopStart;
					this._actualLoopEnd=Math.min(this.loopEnd,this.buffer.length);
				}
				else {
					this._actualLoopStart=0;
					this._actualLoopEnd=this.buffer.length;
				}
			}
			this.context._RegisterNode(this);
		};
		this.stop=this.noteOff=function(w) {
			this._whenstop=w;
		};
		this._Process=function() {
			this.playbackRate._Process();
			if(this.buffer!==null && this._bufferindex>=this._endindex) {
				if(this.playbackState==2)
					--this.context.activeSourceCount;
				this.playbackState=3;
			}
			if(this.playbackState==1 && this.context.currentTime>=this._whenstart) {
				this.playbackState=2;
				++this.context.activeSourceCount;
			}
			if(this.playbackState==2 && this.context.currentTime>=this._whenstop) {
				this.playbackState=3;
				--this.context.activeSourceCount;
			}
			if(this.playbackState!=2)
				return;
			var b0=this.buffer.getChannelData(0);
			var b1=this.buffer.getChannelData(1);
			var rate=this.buffer.sampleRate/44100;
			if(this._nodeout[0].to.length>0) {
				for(var i=0;i<waapisimBufSize;++i) {
					if(this._bufferindex<this._endindex) {
						var g=this.gain.Get(i);
						var idx=this._bufferindex|0;
						this._nodeout[0].outbuf.buf[0][i]=b0[idx]*g;
						this._nodeout[0].outbuf.buf[1][i]=b1[idx]*g;
					}
					this._bufferindex+=rate*this.playbackRate.Get(i);
					if(this.loop) {
						if(this._bufferindex>=this._actualLoopEnd)
							this._bufferindex=this._actualLoopStart;
					}
				}
				this._nodeout[0].NodeEmitBuf();
				this.playbackRate.Clear(true);
			}
		};
	};
	waapisimAudioBufferSource.UNSCHEDULED_STATE=waapisimAudioBufferSource.prototype.UNSCHEDULED_STATE=0;
	waapisimAudioBufferSource.SCHEDULED_STATE=waapisimAudioBufferSource.prototype.SCHEDULED_STATE=1;
	waapisimAudioBufferSource.PLAYING_STATE=waapisimAudioBufferSource.prototype.PLAYING_STATE=2;
	waapisimAudioBufferSource.FINISHED_STATE=waapisimAudioBufferSource.prototype.FINISHED_STATE=3;
	
	waapisimScriptProcessor=function(ctx,bufsize,inch,outch) {
		waapisimAudioNode.call(this,waapisimBufSize,1,1);
		this._nodetype="ScrProc";
		waapisimDebug("create "+this._nodetype+this._nodeId);
		this._targettype=2;
		this.context=ctx;
		this.playbackState=0;
		if(typeof(bufsize)!=="number")
			throw(new TypeError("ScriptProcessor:bufferSize"));
		if(typeof(inch)==="undefined")
			inch=2;
		if(typeof(outch)==="undefined")
			outch=2;
		this.bufferSize=bufsize;
		this._scrinbuf=new waapisimAudioBuffer(inch,bufsize,waapisimSampleRate);
		this._scroutbuf=new waapisimAudioBuffer(outch,bufsize,waapisimSampleRate);
		this._index=bufsize;
		this.onaudioprocess=null;
		this._Process=function() {
			var inb=this._nodein[0].inbuf;
			if(inb===null)
				inb=waapisimDummybuf;
			for(var i=0;i<waapisimBufSize;++i) {
				if(this._index>=this.bufferSize) {
					if(this.onaudioprocess) {
						var ev=new waapisimAudioProcessingEvent();
						ev.node=this;
						ev.inputBuffer=this._scrinbuf;
						ev.outputBuffer=this._scroutbuf;
						this.onaudioprocess(ev);
					}
					this._index=0;
				}
				this._scrinbuf.buf[0][this._index]=inb.buf[0][i];
				if(this._scrinbuf.numberOfChannels>=2)
					this._scrinbuf.buf[1][this._index]=inb.buf[1][i];
				if(this._scroutbuf.numberOfChannels>=2)
					this._nodeout[0].NodeEmit(i,this._scroutbuf.buf[0][this._index],this._scroutbuf.buf[1][this._index]);
				else
					this._nodeout[0].NodeEmit(i,this._scroutbuf.buf[0][this._index],this._scroutbuf.buf[0][this._index]);
				this._index++;
			}
			this._nodein[0].NodeClear();
		};
		ctx._RegisterNode(this);
	};
	waapisimBiquadFilter=webkitBiquadFilterNode=BiquadFilterNode=function(ctx) {
		waapisimAudioNode.call(this,waapisimBufSize,1,1);
		this._nodetype="Filter";
		waapisimDebug("create "+this._nodetype+this._nodeId);
		this.context=ctx;
		this.playbackState=0;
		this.type=0;
		this.frequency=new waapisimAudioParam(ctx,this,10,24000,350,0.5);
		this.detune=new waapisimAudioParam(ctx,this,-4800,4800,0,0.5);
		this.Q=new waapisimAudioParam(ctx,this,0.0001,1000,1,0.5);
		this.gain=new waapisimAudioParam(ctx,this,-40,40,0,0.5);
		this._a1=this._a2=0;
		this._b0=this._b1=this._b2=0;
		this._x1l=this._x1r=this._x2l=this._x2r=0;
		this._y1l=this._y1r=this._y2l=this._y2r=0;
		this._nodein[0].NodeClear();
		this._Setup=function(fil) {
			var f=fil.frequency.Get(0)*Math.pow(2,fil.detune.Get(0)/1200);
			var q=Math.max(0.001,fil.Q.Get(0));
			var alpha,ra0,g;
			var w0=2*Math.PI*f/fil.context.sampleRate;
			var cos=Math.cos(w0);
			switch(fil.type) {
			case "lowpass":
			case 0:
				q=Math.pow(10,q/20);
				alpha=Math.sin(w0)/(2*q);
				ra0=1/(1+alpha);
				fil._a1=-2*cos*ra0;
				fil._a2=(1-alpha)*ra0;
				fil._b0=fil._b2=(1-cos)/2*ra0;
				fil._b1=(1-cos)*ra0;
				break;
			case "highpass":
			case 1:
				q=Math.pow(10,q/20);
				alpha=Math.sin(w0)/(2*q);
				ra0=1/(1+alpha);
				fil._a1=-2*cos*ra0;
				fil._a2=(1-alpha)*ra0;
				fil._b0=fil._b2=(1+cos)/2*ra0;
				fil._b1=-(1+cos)*ra0;
				break;
			case "bandpass":
			case 2:
				alpha=Math.sin(w0)/(2*q);
				ra0=1/(1+alpha);
				fil._a1=-2*cos*ra0;
				fil._a2=(1-alpha)*ra0;
				fil._b0=alpha;
				fil._b1=0;
				fil._b2=-alpha;
				break;
			case "lowshelf":
			case 3:
				alpha=Math.sin(w0)/2*Math.sqrt(2);
				g=Math.pow(10,fil.gain.Get(0)/40);
				ra0=1/((g+1)+(g-1)*cos+2*Math.sqrt(g)*alpha);
				fil._a1=-2*((g-1)+(g+1)*cos)*ra0;
				fil._a2=((g+1)+(g-1)*cos-2*Math.sqrt(g)*alpha)*ra0;
				fil._b0=g*((g+1)-(g-1)*cos+2*Math.sqrt(g)*alpha)*ra0;
				fil._b1=2*g*((g-1)-(g+1)*cos)*ra0;
				fil._b2=g*((g+1)-(g-1)*cos-2*Math.sqrt(g)*alpha)*ra0;
				break;
			case "highshelf":
			case 4:
				alpha=Math.sin(w0)/2*Math.sqrt(2);
				g=Math.pow(10,fil.gain.Get(0)/40);
				ra0=1/((g+1)-(g-1)*cos+2*Math.sqrt(g)*alpha);
				fil._a1=2*((g-1)-(g+1)*cos)*ra0;
				fil._a2=((g+1)-(g-1)*cos-2*Math.sqrt(g)*alpha)*ra0;
				fil._b0=g*((g+1)+(g-1)*cos+2*Math.sqrt(g)*alpha)*ra0;
				fil._b1=-2*g*((g-1)+(g+1)*cos)*ra0;
				fil._b2=g*((g+1)+(g-1)*cos-2*Math.sqrt(g)*alpha)*ra0;
				break;
			case "peaking":
			case 5:
				alpha=Math.sin(w0)/(2*q);
				g=Math.pow(10,fil.gain.Get(0)/40);
				ra0=1/(1+alpha/g);
				fil._a1=-2*cos*ra0;
				fil._a2=(1-alpha/g)*ra0;
				fil._b0=(1+alpha*g)*ra0;
				fil._b1=-2*cos*ra0;
				fil._b2=(1-alpha*g)*ra0;
				break;
			case "notch":
			case 6:
				alpha=Math.sin(w0)/(2*q);
				ra0=1/(1+alpha);
				fil._a1=-2*cos*ra0;
				fil._a2=(1-alpha)*ra0;
				fil._b0=fil._b2=ra0;
				fil._b1=-2*cos*ra0;
				break;
			case "allpass":
			case 7:
				alpha=Math.sin(w0)/(2*q);
				ra0=1/(1+alpha);
				fil._a1=-2*cos*ra0;
				fil._a2=(1-alpha)*ra0;
				fil._b0=(1-alpha)*ra0;
				fil._b1=-2*cos*ra0;
				fil._b2=(1+alpha)*ra0;
				break;
			}
		};
		this._Process=function() {
			var xl,xr,yl,yr;
			this.frequency._Process();
			this.detune._Process();
			this.Q._Process();
			this.gain._Process();
			this._Setup(this);
			var inbuf=this._nodein[0].inbuf.buf;
			var outbuf=this._nodeout[0].outbuf.buf;
			for(var i=0;i<waapisimBufSize;++i) {
				xl=inbuf[0][i];
				xr=inbuf[1][i];
				yl=this._b0*xl+this._b1*this._x1l+this._b2*this._x2l-this._a1*this._y1l-this._a2*this._y2l;
				yr=this._b0*xr+this._b1*this._x1r+this._b2*this._x2r-this._a1*this._y1r-this._a2*this._y2r;
				this._x2l=this._x1l; this._x2r=this._x1r;
				this._x1l=xl; this._x1r=xr;
				this._y2l=this._y1l; this._y2r=this._y1r;
				this._y1l=yl; this._y1r=yr;
				outbuf[0][i]=yl;
				outbuf[1][i]=yr;
			}
			this._nodeout[0].NodeEmitBuf();
			this._nodein[0].NodeClear();
			this.frequency.Clear(false);
			this.detune.Clear(false);
			this.Q.Clear(false);
			this.gain.Clear(false);
		};
		this.getFrequencyResponse=function(f,m,p) {
			for(var l=f.length,i=0;i<l;++i) {
				var w=2*Math.PI*f[i]/this.context.sampleRate;
				var cw=Math.cos(w);
				var cw2=Math.cos(w*2);
				var sw=Math.sin(w);
				var sw2=Math.sin(w*2);
				var ca=1+this._a1*cw+this._a2*cw2;
				var sa=this._a1*sw+this._a2*sw2;
				var cb=this._b0+this._b1*cw+this._b2*cw2;
				var sb=this._b1*sw+this._b2*sw2;
				m[i]=Math.sqrt((cb*cb+sb*sb)/(ca*ca+sa*sa));
				p[i]=Math.atan2(sa,ca)-Math.atan2(sb,cb);
			}
		}
	};
	waapisimBiquadFilter.LOWPASS=waapisimBiquadFilter.prototype.LOWPASS=0;
	waapisimBiquadFilter.HIGHPASS=waapisimBiquadFilter.prototype.HIGHPASS=1;
	waapisimBiquadFilter.BANDPASS=waapisimBiquadFilter.prototype.BANDPASS=2;
	waapisimBiquadFilter.LOWSHELF=waapisimBiquadFilter.prototype.LOWSHELF=3;
	waapisimBiquadFilter.HIGHSHELF=waapisimBiquadFilter.prototype.HIGHSHELF=4;
	waapisimBiquadFilter.PEAKING=waapisimBiquadFilter.prototype.PEAKING=5;
	waapisimBiquadFilter.NOTCH=waapisimBiquadFilter.prototype.NOTCH=6;
	waapisimBiquadFilter.ALLPASS=waapisimBiquadFilter.prototype.ALLPASS=7;

	waapisimGain=function(ctx) {
		waapisimAudioNode.call(this,waapisimBufSize,1,1);
		this._nodetype="Gain";
		waapisimDebug("create "+this._nodetype+this._nodeId);
		this.context=ctx;
		this.playbackState=0;
		this.gain=new waapisimAudioParam(ctx,this,0,1,1);
		this._nodein[0].NodeClear();
		this._curgain=1;
		this._Process=function() {
			var i;
			this.gain._Process();
			var inbuf=this._nodein[0].inbuf.buf;
			switch(this._nodeout[0].to.length) {
			case 0:
				this._curgain=this.gain.Get(0);
				break;
			case 1:
				var b=this._nodeout[0].to[0].inbuf.buf;
				for(i=0;i<waapisimBufSize;++i) {
					var g=this.gain.Get(i);
					this._curgain+=(g-this._curgain)*0.01;
					b[0][i]+=inbuf[0][i]*this._curgain;
					b[1][i]+=inbuf[1][i]*this._curgain;
				}
				break;
			default:
				for(i=0;i<waapisimBufSize;++i) {
					var g=this.gain.Get(i);
					this._curgain+=(g-this._curgain)*0.01;
					this._nodeout[0].NodeEmit(i,inbuf[0][i]*this._curgain,inbuf[1][i]*this._curgain);
				}
				break;
			}
			this._nodein[0].NodeClear();
			this.gain.Clear(true);
		};
	};

	waapisimDelay=function(ctx) {
		waapisimAudioNode.call(this,waapisimBufSize,1,1);
		this._nodetype="Delay";
		waapisimDebug("create "+this._nodetype+this._nodeId);
		this.context=ctx;
		this.playbackState=0;
		this.delayTime=new waapisimAudioParam(ctx,this,0,1,0);
		this._bufl=new Float32Array(waapisimSampleRate);
		this._bufr=new Float32Array(waapisimSampleRate);
		for(var i=0;i<waapisimSampleRate;++i)
			this._bufl[i]=this._bufr[i]=0;
		this._index=0;
		this._offscur=0;
		this._Process=function() {
			this.delayTime._Process();
			var inbuf=this._nodein[0].inbuf.buf;
			var outbuf=this._nodeout[0].outbuf.buf;
			var offs=Math.floor(this.delayTime.Get(0)*this.context.sampleRate);
			if(offs<0)
				offs=0;
			if(offs>=this.context.sampleRate)
				offs=this.context.sampleRate-1;
			var deltaoff=(offs-this._offscur)/waapisimBufSize;
			for(var i=0;i<waapisimBufSize;++i) {
				var idxr=this._index-(this._offscur|0);
				if(idxr<0)
					idxr+=waapisimSampleRate;
				this._bufl[this._index]=inbuf[0][i];
				this._bufr[this._index]=inbuf[1][i];
				outbuf[0][i]=this._bufl[idxr];
				outbuf[1][i]=this._bufr[idxr];
				if(++this._index>=waapisimSampleRate)
					this._index=0;
				this._offscur+=deltaoff;
			}
			this._nodeout[0].NodeEmitBuf();
			this._nodein[0].NodeClear();
			this.delayTime.Clear(false);
		};
	};
	waapisimOscillator=webkitOscillatorNode=OscillatorNode=function(ctx) {
		waapisimAudioNode.call(this,waapisimBufSize,0,1);
		this._nodetype="Osc";
		waapisimDebug("create "+this._nodetype+this._nodeId);
		this._targettype=3;
		this._order=0;
		this.context=ctx;
		this.type=0;
		this._wavtable=null;
		this.frequency=new waapisimAudioParam(ctx,this,1,20000,440,0.9995);
		this.detune=new waapisimAudioParam(ctx,this,-4800,4800,0,0.9995);
		this.playbackState=0;
		this._phase=0.5;
		this._whenstart=0;
		this._whenstop=Number.MAX_VALUE;
		this._init=0;
		this.start=this.noteOn=function(w) {
			this._whenstart=w;
			this.playbackState=1;
			this.context._RegisterNode(this);
		};
		this.stop=this.noteOff=function(w) {
			this._whenstop=w;
		};
		this.setPeriodicWave=this.setWaveTable=function(tab) {
			this.type=4;
			this._wavtable=tab;
		};
		this._Process=function() {
			var i;
			if(this._init==0) {
				this.frequency.Init();
				this.detune.Init();
				this._init=1;
			}
			this.frequency._Process();
			this.detune._Process();
			if(this.playbackState==1 && this.context.currentTime>=this._whenstart)
				this.playbackState=2;
			if(this.playbackState==2 && this.context.currentTime>=this._whenstop)
				this.playbackState=3;
			if(this.playbackState!=2) {
				for(i=0;i<waapisimBufSize;++i)
					this._nodeout[0].outbuf.buf[0][i]=this._nodeout[0].outbuf.buf[1][i]=0;
				return;
			}
			var t,x1,x2,y,z;
			var obuf=this._nodeout[0].outbuf.buf;
			var ph=this._phase;
			var r=1/this.context.sampleRate;
			var freq=this.frequency;
			var detu=this.detune;
			switch(this.type) {
			case "sine":
			case 0:
				x1=0.5; x2=1.5; y=2*Math.PI; z=1/6.78;
				break;
			case "square":
			case 1:
				x1=0.5; x2=1.5; y=100000; z=0;
				break;
			case "sawtooth":
			case 2:
				x1=0; x2=2; y=2; z=0;
				break;
			case "triangle":
			case 3:
				x1=0.5; x2=1.5; y=4; z=0;
				break;
			case "custom":
			case 4:
				for(i=0;i<waapisimBufSize;++i) {
					var f=freq.Get(i)*Math.pow(2,detu.Get(i)/1200);
					ph+=f*r;
					ph=ph-Math.floor(ph);
					var out=0;
					if(this._wavtable)
						out=this._wavtable.buf[(4096*ph)|0];
					obuf[0][i]=obuf[1][i]=out;
				}
				this._phase=ph;
				this._nodeout[0].NodeEmitBuf();
				this.frequency.Clear(true);
				this.detune.Clear(true);
				return;
			}
			for(i=0;i<waapisimBufSize;++i) {
				var f=freq.Get(i)*Math.pow(2,detu.Get(i)/1200);
				ph+=f*r;
				ph=ph-Math.floor(ph);
				t = ( Math.min( Math.max(ph ,x1 - ph), x2 - ph) - 0.5) * y;
				var out=t-t*t*t*z;
				if(out>1) out=1;
				if(out<-1) out=-1;
				obuf[0][i]=obuf[1][i]=out;
			}
			this._phase=ph;
			this._nodeout[0].NodeEmitBuf();
			this.frequency.Clear(true);
			this.detune.Clear(true);
		};
	};
	waapisimOscillator.SINE=waapisimOscillator.prototype.SINE=0;
	waapisimOscillator.SQUARE=waapisimOscillator.prototype.SQUARE=1;
	waapisimOscillator.SAWTOOTH=waapisimOscillator.prototype.SAWTOOTH=2;
	waapisimOscillator.TRIANGLE=waapisimOscillator.prototype.TRIANGLE=3;
	waapisimOscillator.CUSTOM=waapisimOscillator.prototype.CUSTOM=4;
	waapisimOscillator.UNSCHEDULED_STATE=waapisimOscillator.prototype.UNSCHEDULED_STATE=0;
	waapisimOscillator.SCHEDULED_STATE=waapisimOscillator.prototype.SCHEDULED_STATE=1;
	waapisimOscillator.PLAYING_STATE=waapisimOscillator.prototype.PLAYING_STATE=2;
	waapisimOscillator.FINISHED_STATE=waapisimOscillator.prototype.FINISHED_STATE=3;
	
	waapisimAnalyser=function(ctx) {
		waapisimAudioNode.call(this,waapisimBufSize,1,1);
		this._nodetype="Analyser";
		waapisimDebug("create "+this._nodetype+this._nodeId);
		this.context=ctx;
		this.playbackState=0;
		this.fftSize=2048;
		this.frequencyBinCount=1024;
		this.minDecibels=-100;
		this.maxDecibels=-30;
		this.smoothingTimeConstant=0;
		this._fftInData=new Array(2048);
		this._fftOutData=new Array(2048);
		this._timeData=new Array(2048);
		this._fftIndex=0;
		this._fftCurrentSize=0;
		this._fftrev=new Array(256);
		this._fft=function(n,data,mag) {
			var nh=n>>1;
			var t=-2*Math.PI;
			var m,mh,mq,i,j,jr,ji,kr,ki,xr,xi;
			for(mh=1;(m=mh<<1)<=n;mh=m) {
				mq=mh>>1;
				t*=0.5;
				for(jr=0;jr<n;jr+=m) {
					kr=jr+mh;
					xr=data[kr];
					data[kr]=data[jr]-xr;
					data[jr]+=xr;
				}
				for(i=1;i<mq;++i) {
					var wr=Math.cos(t*i);
					var wi=Math.sin(t*i);
					for(j=0;j<n;j+=m) {
						jr=j+i;
						ji=j+mh-i;
						kr=j+mh+i;
						ki=j+m-i;
						xr=wr*data[kr]+wi*data[ki];
						xi=wr*data[ki]-wi*data[kr];
						data[kr]=-data[ji]+xi;
						data[ki]=data[ji]+xi;
						data[ji]=data[jr]-xr;
						data[jr]=data[jr]+xr;
					}
				}
			}
			data[0]=Math.min(1e-100,Math.abs(data[0]/n));
			var stc=Math.min(1,Math.max(0,this.smoothingTimeConstant));
			mag[0]=mag[0]*stc+(1-stc)*data[0];
			for(i=0;i<nh;++i) {
				var v=Math.sqrt(data[i]*data[i]+data[n-i]*data[n-i])/n;
				if(v<1e-100)
					v=1e-100;
				mag[i]=mag[i]*stc+(1-stc)*v;
			}
		};
		this.getByteFrequencyData=function(array) {
			var range=this.maxDecibels-this.minDecibels;
			for(var l=Math.min(array.length,this.frequencyBinCount),i=0;i<l;++i) {
				var v=20*Math.LOG10E*Math.log(this._fftOutData[i]);
				array[i]=((Math.min(this.maxDecibels,Math.max(this.minDecibels,v))-this.minDecibels)*255/range)|0;
			}
		};
		this.getFloatFrequencyData=function(array) {
			for(var l=Math.min(array.length,this.frequencyBinCount),i=0;i<l;++i)
				array[i]=20*Math.LOG10E*Math.log(this._fftOutData[i]);
		};
		this.getByteTimeDomainData=function(array) {
			for(var l=Math.min(this.frequencyBinCount,array.length),i=0;i<l;++i) {
				var v=Math.min(1,Math.max(-1,this._timeData[i]));
				array[i]=v*127+128;
			}
		};
		this._Process=function() {
			var i,j,k;
			var inbuf=this._nodein[0].inbuf.buf;
			if(this.fftSize!=this._fftCurrentSize) {
				var n=this.fftSize;
				for(i=0;i<n;++i)
					this._fftInData[i]=this._fftOutData[i]=0;
				this._fftCurrentSize=n;
				this.frequencyBinCount=n*0.5;
				this._fftIndex=0;
				this._fftrev[0]=0;
				this._fftrev[n-1]=n-1;
				for(i=0,j=1;j<n-1;++j) {
					for(k=n>>1;k>(i^=k);k>>=1)
						;
					this._fftrev[j]=i;
				}
			}
			for(i=0;i<waapisimBufSize;++i) {
				var xl=inbuf[0][i];
				var xr=inbuf[1][i];
				this._nodeout[0].NodeEmit(i,xl,xr);
				var v=this._timeData[this._fftIndex]=(xl+xr)*0.5;
				var t=2*Math.PI*this._fftIndex/this._fftCurrentSize;
//				this._fftInData[this._fftrev[this._fftIndex]]=v*(0.42-0.5*Math.cos(t)+0.08*Math.cos(t*2));
				this._fftInData[this._fftrev[this._fftIndex]]=v*(0.5-0.5*Math.cos(t));
				if(++this._fftIndex>=this._fftCurrentSize) {
					this._fftIndex=0;
					this._fft(this._fftCurrentSize,this._fftInData,this._fftOutData);
				}
			}
			this._nodein[0].NodeClear();
		};
	};
	waapisimConvolver=function(ctx) {
		waapisimAudioNode.call(this,waapisimBufSize,1,1);
		this._nodetype="Convolver";
		waapisimDebug("create "+this._nodetype+this._nodeId);
		this.context=ctx;
		this.playbackState=0;
		this.buffer=null;
		this.normalize=true;
		this._scale=1;
		this._analyzed=null;
		this._dlybufsize=waapisimSampleRate*5;
		this._dlybuf=new waapisimAudioBuffer(2,this._dlybufsize,44100);
		this._dlyidx=0;
		this._tapsize=20;
		this._tap=[];
		this._kernel=null;
		this._sum=[];
		this._sum[0]=[];
		this._sum[1]=[];
		this._bitrev=[];
		this._bitrev[0]=0;
		this._bitrev[waapisimBufSize-1]=waapisimBufSize-1;
		var i,j,k;
		for(i=0,j=1;j<waapisimBufSize-1;++j) {
			for(k=waapisimBufSize>>1;k>(i^=k);k>>=1)
				;
			this._bitrev[j]=i;
		}
		for(i=0;i<2;++i)
			for(j=0;j<2;++j)
				this._sum[i][j]=new Float32Array(waapisimSampleRate);
		this._Normalize=function(buffer) {
			var GainCalibration=0.00125;
			var GainCalibrationSampleRate=44100;
			var MinPower=0.000125;
			var numberOfChannels=2;
			var length=buffer.length;
			var power=0;
			for(var i=0;i<numberOfChannels;++i) {
				var sourceP=0;
				var channelPower=0;
				var n=length;
				while(n--) {
					var sample=buffer.buf[i][sourceP++];
					channelPower+=sample*sample;
				}
				power+=channelPower;
			}
			power=Math.sqrt(power/(numberOfChannels*length));
			if(isFinite(power)===false||isNaN(power)||power<MinPower)
				power=MinPower;
			var scale=1/power;
			scale*=GainCalibration;
			return scale;
		};
		this._Fft=function(n,a) {
			var m,mh,mq,i,j,k,jr,ji,kr,ki;
			var theta, wr, wi, xr, xi;
			i=0;
			for(j=1;j<n-1;j++) {
				for(k=n>>1;k>(i^=k);k>>=1)
					;
				if(j<i) {
					xr=a[j];
					a[j]=a[i];
					a[i]=xr;
				}
			}
			theta=-2*Math.PI;
			for(mh=1;(m=mh<<1)<=n;mh=m) {
				mq=mh>>1;
				theta*=0.5;
				for(jr=0;jr<n;jr+=m) {
					kr=jr+mh;
					xr=a[kr];
					a[kr]=a[jr]-xr;
					a[jr]+=xr;
				}
				for(i=1;i<mq;i++) {
					wr=Math.cos(theta*i);
					wi=Math.sin(theta*i);
					for(j=0;j<n;j+=m) {
						jr=j+i;
						ji=j+mh-i;
						kr=j+mh+i;
						ki=j+m-i;
						xr=wr*a[kr]+wi*a[ki];
						xi=wr*a[ki]-wi*a[kr];
						a[kr]=-a[ji]+xi;
						a[ki]=a[ji]+xi;
						a[ji]=a[jr]-xr;
						a[jr]=a[jr]+xr;
					}
				}
			}
		};
		this._Fft2=function(n,ar,ai) {
			var m, mh, i, j, k;
			var wr, wi, xr, xi;
			var theta=2*Math.PI;
			i=0;
			for(j=1;j<n-1;j++) {
				for(k=n>>1;k>(i^=k);k>>=1)
					;
				if(j<i) {
					xr=ar[j];
					xi=ai[j];
					ar[j]=ar[i];
					ai[j]=ai[i];
					ar[i]=xr;
					ai[i]=xi;
				}
			}
			for(mh=1;(m=mh<<1)<=n;mh=m) {
				theta *= 0.5;
				for(i=0;i<mh;i++) {
					wr=Math.cos(theta*i);
					wi=Math.sin(theta*i);
					for(j=i;j<n;j+=m) {
						k=j+mh;
						xr=wr*ar[k]-wi*ai[k];
						xi=wr*ai[k]+wi*ar[k];
						ar[k]=ar[j]-xr;
						ai[k]=ai[j]-xi;
						ar[j]+=xr;
						ai[j]+=xi;
					}
				}
			}
			for(i=0;i<n;++i)
				ar[i]=ar[i]/n;
		};
		this._Process=function() {
			var inbuf=this._nodein[0].inbuf.buf;
			var nh=(waapisimBufSize*0.5)|0;
			var i,j,k,l,px,v0,v1;
			
			if(this.buffer!==null) {
				if(this.buffer!=this._analyzed) {
					var kbuf=[];
					for(i=0;i<4;++i)
						kbuf[i]=new waapisimAudioBuffer(2,waapisimBufSize,44100);
					this._scale=1;
					if(this.normalize)
						this._scale=this._Normalize(this.buffer);
					var len=this.buffer.length;
					for(i=len-1;i;--i) {
						if(Math.abs(this.buffer.buf[0][i])>1e-3)
							break;
						if(Math.abs(this.buffer.buf[1][i])>1e-3)
							break;
					}
					len=i+1;
					for(i=0,px=0;i<this._tapsize;++i) {
						var x=(i*len/this._tapsize)|0;
						var sz=x-px;
						v0=0;
						v1=0;
						if(sz>0) {
							while(px<x) {
								v0+=this.buffer.buf[0][px]*this.buffer.buf[0][px];
								v1+=this.buffer.buf[1][px]*this.buffer.buf[1][px];
								++px;
							}
							v0=Math.sqrt(v0)*this._scale*0.5;
							v1=Math.sqrt(v1)*this._scale*0.5;
						}
						this._tap[i]=[x,v0,v1];
					}
					this._kernel=new waapisimAudioBuffer(2,waapisimBufSize,44100);
					var p=0,maxp=0;
					for(l=Math.min(this.buffer.length,waapisimBufSize*4),i=0,j=0,k=0;i<l;++i) {
						v0=this.buffer.buf[0][i];
						v1=this.buffer.buf[1][i];
						kbuf[k].buf[0][j]=v0;
						kbuf[k].buf[1][j]=v1;
						p+=(v0*v0+v1*v1);
						if(++j>=waapisimBufSize) {
							if(p>maxp) {
								this._kernel=kbuf[k];
								maxp=p;
							}
							j=0;
							p=0;
							++k;
						}
					}
					if(p>maxp||this._kernel===null)
						this._kernel=kbuf[k];
					this._Fft(waapisimBufSize,this._kernel.buf[0]);
					this._Fft(waapisimBufSize,this._kernel.buf[1]);
					this._analyzed=this.buffer;
				}
				this._Fft(waapisimBufSize,inbuf[0]);
				this._Fft(waapisimBufSize,inbuf[1]);
				this._sum[0][0][0]=this._sum[1][0][0]=this._sum[0][1][0]=this._sum[1][1][0]=0;
				for(i=1,j=waapisimBufSize-1;i<nh;++i,--j) {
					var real0=inbuf[0][i]*this._kernel.buf[0][i]-inbuf[0][j]*this._kernel.buf[0][j];
					var imag0=inbuf[0][i]*this._kernel.buf[0][j]+inbuf[0][j]*this._kernel.buf[0][i];
					this._sum[0][0][i]=real0;
					this._sum[0][0][j]=real0;
					this._sum[0][1][i]=-imag0;
					this._sum[0][1][j]=imag0;
					var real1=inbuf[1][i]*this._kernel.buf[1][i]-inbuf[1][j]*this._kernel.buf[1][j];
					var imag1=inbuf[1][i]*this._kernel.buf[1][j]+inbuf[1][j]*this._kernel.buf[1][i];
					this._sum[1][0][i]=real1;
					this._sum[1][0][j]=real1;
					this._sum[1][1][i]=-imag1;
					this._sum[1][1][j]=imag1;
				}
				this._Fft2(waapisimBufSize,this._sum[0][0],this._sum[0][1]);
				this._Fft2(waapisimBufSize,this._sum[1][0],this._sum[1][1]);
				for(i=0;i<waapisimBufSize;++i) {
					var v=(nh-Math.abs(i-nh))/nh;
					this._dlybuf.buf[0][this._dlyidx]=this._sum[0][0][i]*v;
					this._dlybuf.buf[1][this._dlyidx]=this._sum[1][0][i]*v;
					v0=0; v1=0;
					for(l=this._tap.length,j=0;j<l;++j) {
						var idx=this._dlyidx-this._tap[j][0];
						while(idx<0)
							idx+=this._dlybufsize;
						v0+=this._dlybuf.buf[0][idx]*this._tap[j][1];
						v1+=this._dlybuf.buf[1][idx]*this._tap[j][2];
					}
					this._nodeout[0].NodeEmit(i,v0,v1);
					if(++this._dlyidx>=this._dlybufsize)
						this._dlyidx=0;
				}
			}
			this._nodein[0].NodeClear();
		};
	};
	waapisimDynamicsCompressor=function(ctx) {
		waapisimAudioNode.call(this,waapisimBufSize,1,1);
		this._nodetype="DynComp";
		waapisimDebug("create "+this._nodetype+this._nodeId);
		this.context=ctx;
		this.playbackState=0;
		this.threshold=new waapisimAudioParam(ctx,this,-100,0,-24);
		this.knee=new waapisimAudioParam(ctx,this,0,40,30);
		this.ratio=new waapisimAudioParam(ctx,this,1,20,12);
		this.reduction=new waapisimAudioParam(ctx,this,-20,0,0);//ReadOnly
		this.attack=new waapisimAudioParam(ctx,this,0,1,0.003);
		this.release=new waapisimAudioParam(ctx,this,0,1,0.25);
		this._maxl=0;
		this._maxr=0;
		this._gain=1;
		this._Process=function() {
			this.threshold._Process();
			this.knee._Process();
			this.ratio._Process();
			this.attack._Process();
			this.release._Process();
			var inbuf=this._nodein[0].inbuf.buf;
			var relratio=this.release.Get(0)*waapisimSampleRate;
			relratio=Math.pow(1/3.16,1/relratio);
			var atkratio=this.attack.Get(0)*waapisimSampleRate;
			atkratio=Math.pow(1/3.16,1/atkratio);
			var reduc=this.reduction.value;
			var thresh=Math.pow(10,this.threshold.Get(0)/20);
			var knee=Math.pow(10,this.knee.Get(0)/20*0.5);
			var makeup=1/Math.sqrt(thresh)/Math.pow(10,this.knee.Get(0)/80);
			var maxratio=0.99105;
			var ratio=this.ratio.Get(0);
			if(ratio<=1)
				ratio=1;
			for(var i=0;i<waapisimBufSize;++i) {
				this._maxl=maxratio*this._maxl+(1-maxratio)*inbuf[0][i]*inbuf[0][i];
				this._maxr=maxratio*this._maxr+(1-maxratio)*inbuf[1][i]*inbuf[1][i];
				var maxc=Math.sqrt(Math.max(this._maxl,this._maxr))*1.414;
				if(maxc>thresh) {
					var v=Math.pow(thresh*Math.min(knee,maxc/thresh)/maxc,1-1/ratio);
					this._gain=v+(this._gain-v)*atkratio;
				}
				else
					this._gain=1+(this._gain-1)*relratio;
				var g=this._gain*makeup;
				this._nodeout[0].NodeEmit(i,inbuf[0][i]*g,inbuf[1][i]*g);
			}
			this.reduction.value=this.reduction.computedValue=reduc;
			this._nodein[0].NodeClear();
			this.threshold.Clear(false);
			this.knee.Clear(false);
			this.ratio.Clear(false);
			this.reduction.Clear(false);
			this.attack.Clear(false);
			this.release.Clear(false);
		};
	};
	waapisimPanner=webkitAudioPannerNode=AudioPannerNode=function(ctx) {
		waapisimAudioNode.call(this,waapisimBufSize,1,1);
		this._nodetype="Panner";
		waapisimDebug("create "+this._nodetype+this._nodeId);
		this.context=ctx;
		this.playbackState=0;
		this.panningModel=0;
		this.distanceModel=1;
		this.refDistance=1;
		this.maxDistance=10000;
		this.rolloffFactor=1;
		this.coneInnerAngle=360;
		this.coneOuterAngle=360;
		this.coneOuterGain=0;
		this.px=0;
		this.py=0;
		this.pz=0;
		this.setPosition=function(x,y,z) {this.px=x;this.py=y;this.pz=z;};
		this.setOrientation=function(x,y,z) {};
		this.setVelocity=function(x,y,z) {};
		this._Process=function() {
			var inbuf=this._nodein[0].inbuf.buf;
			var listener=this.context.listener;
			var dx=this.px-listener.px;
			var dy=this.py-listener.py;
			var dz=this.pz-listener.pz;
			var d=Math.max(1,Math.sqrt(dx*dx+dy*dy+dz*dz));
			var dgain;
			switch(this.distanceModel) {
			case "linear":
			case 0:
				dgain=1-this.rolloffFactor*(d-this.refDistance)/(this.maxDistance-this.refDistance);
				break;
			case "inverse":
			case 1:
				dgain=this.refDistance/(this.refDistance+this.rolloffFactor*(d-this.refDistance));
				break;
			case "exponential":
			case 2:
				dgain=Math.pow(d/this.refDistance,-this.rolloffFactor);
				break;
			}
			var rgain,lgain,tr;
			if(Math.abs(dz)<0.001) {
				lgain=rgain=1;
			}
			else {
				tr=Math.atan(dx/dz);
				if(dz<=0) {
					rgain=-tr+Math.PI*0.5;
					lgain=tr+Math.PI*0.5;
				}
				else {
					switch(this.panningModel) {
					case 0:
					case "equalpower":
						rgain=tr+Math.PI*0.5;
						lgain=-tr+Math.PI*0.5;
						break;
					default:
						if(dx>=0) {
							rgain=tr+Math.PI*0.5;
							lgain=-(-tr+Math.PI*0.5);
						}
						else {
							rgain=-(tr+Math.PI*0.5);
							lgain=-tr+Math.PI*0.5;
						}
					}
				}
			}
			var rl=Math.sqrt(rgain*rgain+lgain*lgain);
			rgain=rgain/rl;
			lgain=lgain/rl;
			var a=Math.sqrt(rgain*rgain+lgain*lgain);
			rgain=rgain/a*2*dgain; lgain=lgain/a*2*dgain;
			for(var i=0;i<waapisimBufSize;++i)
				this._nodeout[0].NodeEmit(i,inbuf[0][i]*lgain,inbuf[1][i]*rgain);
			this._nodein[0].NodeClear();
		};
	};
	waapisimPanner.EQUALPOWER=waapisimPanner.prototype.EQUALPOWER=0;
	waapisimPanner.HRTF=waapisimPanner.prototype.HRTF=1;
	waapisimPanner.SOUNDFIELD=waapisimPanner.prototype.SOUNDFIELD=2;
	waapisimPanner.LINEAR_DISTANCE=waapisimPanner.prototype.LINEAR_DISTANCE=0;
	waapisimPanner.INVERSE_DISTANCE=waapisimPanner.prototype.INVERSE_DISTANCE=1;
	waapisimPanner.EXPONENTIAL_DISTANCE=waapisimPanner.prototype.EXPONENTIAL_DISTANCE=2;
	
	waapisimChannelSplitter=function(ctx,ch) {
		this._nodetype="ChSplit";
		waapisimDebug("create "+this._nodetype+this._nodeId);
		if(typeof(ch)==="undefined")
			ch=6;
		waapisimAudioNode.call(this,waapisimBufSize,1,ch);
		this.context=ctx;
		this.playbackState=0;
		this._Process=function() {
			var inbuf=this._nodein[0].inbuf.buf;
			for(var i=0;i<waapisimBufSize;++i) {
				this._nodeout[0].NodeEmit(i,inbuf[0][i],inbuf[0][i]);
				this._nodeout[1].NodeEmit(i,inbuf[1][i],inbuf[1][i]);
			}
			this._nodein[0].NodeClear();
		};
	};
	waapisimChannelMerger=function(ctx,ch) {
		this._nodetype="ChMerge";
		waapisimDebug("create "+this._nodetype+this._nodeId);
		if(typeof(ch)==="undefined")
			ch=6;
		waapisimAudioNode.call(this,waapisimBufSize,ch,1);
		this.context=ctx;
		this.playbackState=0;
		this._Process=function() {
			var inbuf0=this._nodein[0].inbuf.buf;
			var inbuf1=this._nodein[1].inbuf.buf;
			for(var i=0;i<waapisimBufSize;++i)
				this._nodeout[0].NodeEmit(i,(inbuf0[0][i]+inbuf0[1][i])*0.5,(inbuf1[0][i]+inbuf1[1][i])*0.5);
			this._nodein[0].NodeClear();
			this._nodein[1].NodeClear();
		};
	};
	waapisimWaveShaper=function(ctx) {
		waapisimAudioNode.call(this,waapisimBufSize,1,1);
		this._nodetype="Shaper";
		waapisimDebug("create "+this._nodetype+this._nodeId);
		this.context=ctx;
		this.playbackState=0;
		this.curve=null;
		var i;
		this._Process=function() {
			var inbuf=this._nodein[0].inbuf.buf;
			var curve=this.curve;
			if(curve!==null) {
				var len=curve.length-1;
				if(len>=0) {
					for(i=0;i<waapisimBufSize;++i) {
						var xl=Math.max(-1,Math.min(1,inbuf[0][i]));
						var xr=Math.max(-1,Math.min(1,inbuf[1][i]));
						xl=curve[((xl+1)*0.5*len+0.5)|0];
						xr=curve[((xr+1)*0.5*len+0.5)|0];
						this._nodeout[0].NodeEmit(i,xl,xr);
					}
					this._nodein[0].NodeClear();
					return;
				}
			}
			for(i=0;i<waapisimBufSize;++i)
				this._nodeout[0].NodeEmit(i,inbuf[0][i],inbuf[1][i]);
			this._nodein[0].NodeClear();
		};
	};
	waapisimAudioParam=function(ctx,node,min,max,def,tcon) {
		this.context=ctx;
		this._targettype=0;
		this.node=node;
		this.value=def;
		this.computedValue=def;
		this.minValue=min;
		this.maxValue=max;
		this.defaultValue=def;
		if(typeof(tcon)==="undefined")
			this.timeconst=0;
		else
			this.timeconst=tcon;
		this.from=[];
		this.inbuf={};
		this.inbuf.buf=[];
		this.inbuf.buf[0]=new Float32Array(waapisimBufSize);
		this.inbuf.buf[1]=new Float32Array(waapisimBufSize);
		this.automation=[];
		this.deltaAdd=0;
		this.deltaMul=1;
		this.deltaTarget=0;
		this.currentEvent=null;
		for(var i=0;i<waapisimBufSize;++i)
			this.inbuf.buf[0][i]=this.inbuf.buf[1][i]=0;
		this.AddEvent=function(ev) {
			var t=ev[0];
			for(var l=this.automation.length,i=0;i<l;++i) {
				if(this.automation[i][0]>t)
					break;
			}
			this.automation.splice(i,0,ev);
		};
		this.setValueAtTime=function(v,t) {
			this.AddEvent([t,0,v]);
		};
		this.linearRampToValueAtTime=function(v,t) {
			this.AddEvent([t,1,v]);
		};
		this.exponentialRampToValueAtTime=function(v,t) {
			this.AddEvent([t,2,v]);
		};
		this.setTargetAtTime=this.setTargetValueAtTime=function(v,t,c) {
			this.AddEvent([t,3,v,c]);
		};
		this.setValueCurveAtTime=function(values,t,d) {
			this.AddEvent([t,4,values,d]);
		};
		this.cancelScheduledValues=function(t) {
			for(var l=this.automation.length,i=0;i<l;++i) {
				if(this.automation[i][0]>=t) {
					this.automation.length=i;
					return;
				}
			}
		};
		this._Process=function() {
			this.value+=this.deltaAdd;
			this.value=(this.value-this.deltaTarget)*this.deltaMul+this.deltaTarget;
			if(this.currentEvent!==null) {
				if(this.currentEvent[1]==4) {
					var i=(this.currentEvent[2].length-1)*(this.context.currentTime-this.currentEvent[0])/this.currentEvent[3];
					this.value=this.currentEvent[2][Math.min(this.currentEvent[2].length-1,i)|0];
				}
			}
			if(this.automation.length>0) {
				if(this.context.currentTime>=this.automation[0][0]) {
					this.deltaAdd=0;
					this.deltaMul=1;
					this.deltaTarget=0;
					this.currentEvent=this.automation.shift();
					switch(this.currentEvent[1]) {
					case 0:
					case 1:
					case 2:
						this.value=this.currentEvent[2];
						break;
					case 3:
						this.deltaMul=Math.pow(0.367879,1/(waapisimSampleRate/waapisimBufSize*this.currentEvent[3]));
						this.deltaTarget=this.currentEvent[2];
						break;
					}
					if(this.automation.length>0) {
						var n=waapisimSampleRate/waapisimBufSize*(this.automation[0][0]-this.context.currentTime);
						switch(this.automation[0][1]) {
						case 1:
							this.deltaAdd=(this.automation[0][2]-this.value)/n;
							break;
						case 2:
							this.deltaMul=Math.pow(this.automation[0][2]/this.value,1/n);
							break;
						}
					}
				}
			}
		};
		this.Init=function() {
			this.computedValue=parseFloat(this.value);
		}
		this.Get=function(n) {
			if(this.from.length>0)
				this.computedValue=parseFloat(this.value)+(this.inbuf.buf[0][n]+this.inbuf.buf[1][n])*0.5;
			else
				this.computedValue=this.computedValue*this.timeconst+(1-this.timeconst)*parseFloat(this.value);
			return this.computedValue;
		};
		this.Clear=function(arate) {
			if(arate) {
				for(var i=0;i<waapisimBufSize;++i)
					this.inbuf.buf[0][i]=this.inbuf.buf[1][i]=0;
			}
			else
				this.inbuf.buf[0][0]=this.inbuf.buf[1][0]=0;
		};
	};
}
