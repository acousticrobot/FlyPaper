# flypaper.js
version 3.5 author [Jonathan Gabel](http://jonathangabel.com)

FlyPaper.js adds the fly namespace to a project using the [paper.js](http://paperjs.org) framework. It's main purpose is to add communication and animation functionality.  FlyPaper uses js directly, please see ["using JavaScript directly"](http://paperjs.org/tutorials/getting-started/using-javascript-directly/) for more info on how this differs from using paperScript. 

*please note:* flypaper is still in an experimental stage, I can't say for sure what will be backwards compatible.

## Setting up a scope

index.html contains a basic example of initializing flypaper.  

	window.onload = function() {
		// start by initializing Paper.js
		var canvas = document.getElementById('ctx');
		paper.setup(canvas);
		
		// initialize FlyPaper and set the canvas to 800 x 500 
		fly.init({width:800,height:500});
		// when fly.debug is set to true, the info panel is accessible
		fly.debug = true;
		
		// mouse events are handled within FlyPaper
		// the onFrame handler is installed here
		paper.view.onFrame = function(event) {
		fly.eventCtrlr.publish("frame",event);
		};

		// fly.Template is the most basic object in FlyPaper
		// use it to create your own FlyPaper constructions
		var myFly = new fly.Template(
		{name:"my template",handle:[100,100,300],
		style:{fillColor:fly.colors.main[0]},
		selectable:true, // default: false
		dragable: true, // default: true
		rotatable: true // default: false
		});
		
		myFly.handle.visible = true; // This is needed for dragging an object without paths

	}; // END window onLoad


## FlyPaper Objects

First copy and paste fly.Template into your own javascript file and then find "Template" and Replace All with the your own name to begin building your own objects.  This contains everything you need to plug into the FlyPaper functionality.  Add the construction of your object in the empty build function.  Add any variables you need to keep track of in the info function.

At the heart of Template is the abstract class Ananda. Ananda takes the arguments sent to and tries to give them the best life possible.

## Ananda 

TODO: explain:

  * initialize 
    * from string
    * from array
    * from rectangle
    * from object literal
  * properties: 
    * the handle 
    * the group
    * selectable
    * draggable
    * rotatable
  * methods 
    * communication 
    * adding fly motion methods
    * redrawing strategies

----

## FlyPaper TODO:

  * fly.colors
    * reorganize current set
    * add colors to current set
    * arrange color arrays dark to light (or light to dark?)
    * ability to add colors during init
    * ability to swap out color sets

  * fly.layers
    * background, stage should be arrays
    * remove front stage, backstage etc. 
    * 
  * add better timing functionality

----

## Changes Log:

#### abbreviations:
  * IC == fly.infoCtrlr
  * EC == fly.eventCtrlr

### version 0.3

#### version 0.3 takes flypaper out of the paperscript context, so that it can be used used across multiple files
  * version 0.3.5
    * Redoing timing in IC, using onFrame event {delta,time,count} 
    * onFrame function *must* pass event when it publishes to EC 
    * Ananda grab and drag checks for handle (NOT backwards compatible). 
    * fixed bug when Ananda is initialized from an array of one.
    * gridPlot takes rectangle and creates paper.Path.Rectangle 
    * IC rewritten to comply with strict mode
    * Ananda now records this.rotatable from args, default false

  * version 0.3.4
    * IC keeps track of frames per second, had fps method to help adjust across platforms
    * Ananda has speed method, stores this._speed from initial argument speed, adjusts with IC fps 

  * version 0.3.3
    * Ananda only builds handle when sent numbers arrays or obj with handle property. 
    * Ananda only toggles selected when fly.debug is true
    * Ananda now records this.selectable from args, default false
    * Ananda now records this.draggable from args, default true
    * Ananda inits from rectangle
    * Pullbar redesigned from vektor.js
    * IC has better error handling when sent improper values
    * EC now publishes frame count events, subscribe "frame x" where x is every xth frame
    * new motion: scroll
    * fly.init now takes args:
      * width 
      * height 

  * version 0.3.2
    * IC takes type "bool" and converts it to "b_true" and "b_false"
    * changes in when line length is rechecked in IC, still not perfect

### version 0.2

  * v 0.2.2.1 : Code Cleanup
    * IC deregister function
    * IC second argument to set display to true or false

  * Version 0.2.1
    * IC Adding collapsable menu items and click and drag support
    * EC is created first, then on init IC requests registration from EC
    
  * Version 0.2
    * infoCtrlr Subscribes to "frameEvent"
    * Change to the structure of info packets received:
    * infoCtrlr registration creates { obj: o, display: true }
    * values in infopacket take form: { name: "name", foo: {val:"bar", type:"var"} }
    * info packet type:"type" is checked against fly.style.color[type]
    * sends call info() to registered objects, receives info packet
    * better error handling
    
### version 0.1

  * fly.init() creates the drawing space and inits other "smart" objects
  * fly.eventCtrlr: new objects can subscribe to receive event announcements, paperscript events can send events to all objects through eventCntrlr w/o having to know about new objects. Accepts incoming registrations as objects are created
  * fly.infoCtrlr: new objects can register and their info will be collected and presented by infoCntrlr
  * fly.struct() is the basic build of a smart object ( version 0.3+ : renamed fly.Template)
