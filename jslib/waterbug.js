/**
(C) Bernhard Zwischenbrugger 2012
GPL, LGPL, MIT Licence, Apache Licence, Copyleft, CC,... choose what you want


This is a simple javascript console.
safari on ios 6, lost the javascript console and if you are on linux or windows
there is no possibility to debug javascript.

If you have a mac use this: https://developer.apple.com/technologies/safari/developer-tools.html
if you have Android 4.x use adb and chrome remote debugger

Update: for iphone you can you 
http://debug.phonegap.com/ 
that's very nice, but the console didn't work for me

This is free software, do with if what you want.
*/
(function() {
        var waterbug=(function (){
                var vararray=[];                
                var orientation=0;
                var debugDiv=document.createElement("div");
                debugDiv.style.position="fixed";
                debugDiv.style.right="10px";
                debugDiv.style.bottom="10px";
                debugDiv.style.fontFamily="dejavu sans mono, monospace";
                debugDiv.style.fontSize="11px";
                debugDiv.style.cursor="default";
                debugDiv.style.backgroundColor="mintcream";
                debugDiv.style.minHeight="35%";
                debugDiv.style.maxHeight="45%";
                debugDiv.style.border = "1px solid rgba(0,0,0,0.5)";
                debugDiv.style.boxShadow ='6px 6px 6px -3px rgba(0,0,0,0.7)';

                debugDiv.style.overflow="auto";
                
                debugDiv.style.letterSpacing="0px";
                debugDiv.style.zIndex="10000";
                debugDiv.style.width="30%";

//              debugDiv.style.display="none";
                var supportsOrientationChange = "onorientationchange" in window,
                orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

//                window.addEventListener(orientationEvent, function() {
//                        if(window.orientation!=orientation && window.orientation==-90){
//				
//				window.scrollTo(1,1);	
//                                showValues();
//                        }else{
//                                if(window.orientation!=-90){
//					if(debugDiv.parentNode){
//						document.body.removeChild(debugDiv); 
//					}
//                                }
//                        }
//                        horientation=window.orientation;
//                },false);

		//window.onerror=function(msg, url, linenumber){
                window.addEventListener("error", function(error) {
//			alert('Error message: '+error.message+'nURL: '+error.filename+'nLine Number: '+error.lineno)
                        vararray.push({type:"error",message:error});
                        (SITE.properties.options.showConsole) && showValues();
                        
		});


                function showValues(){
			while(debugDiv.firstChild){debugDiv.removeChild(debugDiv.firstChild)};
			document.body.appendChild(debugDiv);
                        debugDiv.style.display="block";
			for(var i=0;i<vararray.length;i++){
				var div=document.createElement("div");
				switch(vararray[i].type){
					case "log":
						for(var j=0;j<vararray[i].message.length;j++){
							var item=formatValue(vararray[i].message[j]);
							item.style.verticalAlign="top";
							item.style.padding="2px";
						
							div.appendChild(item);
						}
						debugDiv.appendChild(div);
						break;
					case "logError":
						for(var j=0;j<vararray[i].message.length;j++){
							var item=formatValue(vararray[i].message[j]);
							item.style.verticalAlign="top";
							item.style.padding="2px";
							item.style.color="red";
						
							div.appendChild(item);
						}
						debugDiv.appendChild(div);
						break;
					case "error":
						addSpan(div,vararray[i].message.message,"red");
						addSpan(div," "+vararray[i].message.filename+"  line: "+vararray[i].message.lineno,"gray");
						debugDiv.appendChild(div);
						break;
						
				}
				div.style.borderBottom="1px solid #eeeeee";
			}
			var evalDiv=document.createElement("div");
			var evalInput=document.createElement("input");
			evalInput.style.border="0px solid red";
			evalInput.style.width="80%";
			evalDiv.style.width="100%";
			evalInput.setAttribute( "autocorrect" , "off");	
			evalInput.setAttribute( "autocapitalize" , "none");	
			evalInput.style.borderBottom="1px solid #eeeeee";
			evalInput.addEventListener("keyup",function(evt){
				if(evt.keyCode==13){
					try{
						var obj=eval(this.value);
						vararray.push({type:"log",message:[obj]});
					}catch(e){
						vararray.push({type:"error",message:[e]});
					}
					showValues();
				}
			});
			var span=document.createElement("span");
			span.appendChild(document.createTextNode(">"));
			span.style.color="lightblue";
			span.style.fontWeight="bold";
			evalDiv.appendChild(span);
			evalDiv.appendChild(evalInput);
			debugDiv.appendChild(evalDiv);
//			evalDiv.scrollIntoView();  //seams to be buggy
                }
		function formatValue(value){
			switch(typeof(value)){
				case "number":return showNumber(value);
					break; 
				case "string":return showString(value);
					break; 
				case "object":return showObject(value);
					break;
				default:
					return document.createTextNode(typeof(value));

			}
		}
		function showNumber(value){
			var div=document.createElement("div");
			div.appendChild(document.createTextNode(value));
			div.style.color="blue";
			div.style.display="inline";
			div.style.verticalAlign="top";
			return div;
		}
		function showString(value){
			var div=document.createElement("div");
			div.appendChild(document.createTextNode(value));
			div.style.color="black";
			div.style.display="inline";
			div.style.verticalAlign="top";
			return div;
		}
		function showTheHTML(value){
			var div=document.createElement("div");
			if(value.nodeType===3){  //textnode
				var div=document.createElement("span");
				addSpan(div,value.nodeValue);
				return div;
			}
			var div=document.createElement("div");
			if(value.nodeType===1){  //element
				addSpan(div,"<");
				addSpan(div,value.tagName.toLowerCase(),"purple");
				for(var i=0;i<value.attributes.length;i++){
					addSpan(div," ");
					addSpan(div,value.attributes[i].nodeName,"blue");
					addSpan(div,"='");
					addSpan(div,value.attributes[i].nodeValue,"blue");
					addSpan(div,"'");
				}
				addSpan(div,">");
				for(var i=0;i<value.childNodes.length;i++){
					// div.appendChild(showTheHTML(value.childNodes[i])); //to be continued
				}	
				addSpan(div," .... ");
				addSpan(div,"<");
				addSpan(div,value.tagName.toLowerCase(),"purple");
				addSpan(div,">");
			}
                        div.style.color="black";
                        div.style.display="inline";
                        div.style.verticalAlign="top";
                        return div;
		}
		function addSpan(target,text,color){
			var span=document.createElement("span");
			span.appendChild(document.createTextNode(text));
			if(color){
				span.style.color=color;
			}
			target.appendChild(span);
		}

		function showObject(value){
			var div=document.createElement("div");
			if(!value)return div;
			div.style.display="inline";
			if(value && value.nodeType){
				return showTheHTML(value);
			//	return div;
			}
			if(value.length){
				div.appendChild(document.createTextNode("["));
				for(var i=0;i<value.length;i++){
					div.appendChild(formatValue(value[i]));
					if(i<value.length -1){
					div.appendChild(document.createTextNode(","));
					}

				}
				div.style.verticalAlign="top";
				div.appendChild(document.createTextNode("]"));
			}else{
				var objDiv=document.createElement("div");
				var arrow=document.createElement("span");
				arrow.appendChild(document.createTextNode("▶  Object"));
				arrow.style.color="gray";
				objDiv.appendChild(arrow);
				objDiv.style.display="inline";
				arrow.style.fontSize="20px";
				objDiv.theObject=value;
				objDiv.expanded=false;
				objDiv.addEventListener("click",function(evt){
					if(this.expanded){
						this.firstChild.textContent="▶  Object";
						while(this.childNodes.length >1){
							this.removeChild(this.lastChild);
						}
						this.expanded=false;
					}else{
						var x=expandObject(this.theObject);
						this.appendChild(x);
						this.firstChild.textContent="▼  Object";
						this.expanded=true;
					}
					evt.stopPropagation(); 
				},false);
				div.appendChild(objDiv);
				div.style.display="inline-block";
			}
			return div;
		}
		function expandObject(value){
			var div=document.createElement("div");
			for(var i in value){
				var nameValueDiv=document.createElement("div");
				var nameSpan=document.createElement("span");
				nameSpan.appendChild(document.createTextNode(i+":"));
				nameSpan.style.color="purple";
				nameValueDiv.appendChild(nameSpan);
				if(i!="opener"){  //error prevent
					nameValueDiv.appendChild(formatValue(value[i]));
				}
				nameValueDiv.style.verticalAlign="top";
				nameSpan.style.verticalAlign="top";
//				nameValueDiv.style.display="inline-block";
				div.appendChild(nameValueDiv);
			}
//			div.style.border="1px solid black";
			div.style.marginLeft="14px";
			return div;
		}
                function push(type, obj){
			//if(debugDiv.parentNode)return; //console is open, don't record events
                        vararray.push({type:type,message:obj});
                }       
                return {
                        log:function(name, value ){
                                push("log", arguments);
                        },
                        logError:function(name, value ){
                                push("logError", arguments);
                        },
			show:function(){
				showValues();
			}

                }
        })();
        if ( typeof define === "function" && define.amd ) {
            define(function () { return waterbug; } );
        }
        else {
            window.waterbug = waterbug;
        }
})();