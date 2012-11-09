# FlyPaper.js

version 0.4.0

author [Jonathan Gabel](http://jonathangabel.com)

*Note: There is a proof-of-concept site I put up using this framework if you want to see it in action: [YunKaiGo](http://yunkaigo.com/) .  It's currently set for debugging, if you press the 'i' key it will bring up the debug panel.*


FlyPaper is an add-on to [Paper.js](http://paperjs.org) for creating javascript animations in the HTML5 canvas. FlyPaper grew from an initial desire to allow easy debugging of more complicated systems, quickly displaying variables directly on the canvas so I didn't have to console.log them at 5 - 50 frames per second.  Additionally is adds basic functionality [ dragging and dropping, rotating, selecting, pull-bars ] and motions [ swing, bob, custom ] to shapes or groups of shapes. Lastly, it allows you to register objects to listen for events, or publish events for other shapes to respond to.

FlyPaper.js adds the fly namespace to a project using the [Paper.js](http://paperjs.org) framework. FlyPaper uses JavaScript directly so that a project can be composed of multiple files, please see ["using JavaScript directly"](http://paperjs.org/tutorials/getting-started/using-javascript-directly/) for more info on how this differs from using PaperScript.

*Please note:* FlyPaper is still in an experimental stage, I can't say for sure what will be backwards compatible.

## Setting up a scope

basic-example.html contains everything you need to initialize FlyPaper and add a simple object. It calls templates.js, which contains the window.onload function required to initialize FlyPaper, and a couple examples of FlyPaper objects:

	window.onload = function() {
		// start by initializing Paper.js
		var canvas = document.getElementById('ctx');
		paper.setup(canvas);

		// initialize FlyPaper and set the canvas to 800 x 500
		fly.init({width:800,height:500});
		// when fly.debug is set to true, the info panel is accessible
		fly.debug = true;

		// All mouse events are handled within FlyPaper
		// the onFrame handler must be installed here:
		paper.view.onFrame = function(event) {
		fly.eventCtrlr.publish("frame",event);
		};

		// Now we can add a FlyPaper object
		// fly.Template is a basic example of a FlyPaper object
		var myFly = new fly.Template(
			{name:"My Fly", handle:[100,100,300,250],
			selectable:true, // default: false
			dragable: true, // default: true
			rotatable: true // default: false
		});

	};


If you run this page in a browser, you should see a red 300 x 250 pixel oval sitting within the canvas, which you can drag around, select with the 's' key, and rotate with the 'r' key. All that fly.Template builds is this one oval shape inside of the handle (origin at 100,100 width: 300, height:250), but it plugs into the functionality shared by all FlyPaper objects. Because we set fly.debug to true, if you press the 'i' key, you will see the information panel that is tracking everything within the FlyPaper context, including our object which we named "My Fly".

More information about this example below in [Template Objects: a basic example][]

## FlyPaper basic features

### Initialization: fly.init()

fly.init() initializes the drawing space and inits other "smart" objects within the Paper.js context.
It accepts a number of arguments, all of them optional. Here is a quick rundown of possible args:

  * width & height: change the size of the canvass
  * stageLayers: the number of layers to initialize on the drawing stage (default 1)
  * backgroundColor: string color value for the background color.
  * colorPalette: string based color palette selector for color presets
  * colorSet: color presets array , set colorPalette to "custom"
  * info: object literal of controls for the info controller

### Layers: fly.layers

FlyPaper is initialized with several layers:

  * background -- a background layer containing a colored rectangle the size of the canvass
  * stage -- an array of drawing layers for the main drawing
  * infoLayer -- this is where the debug panel lives, above everything

After init, the active drawing layer is **fly.layers.stage[0]**. You can ignore the layers if you don't need more than one, or add layers to the stage.

### Colors: fly.color

FlyPaper comes with several color utilities, as well as as preset color palettes.  All palettes come in spectrum arrays of 9 values in the following names: red, orange, yellow, blue, green, purple, and grey.  They run from dark to light, so fly.color.grey[0] is black or almost black, and fly.color.grey[8] is white or nearly white in all palettes. Additionally you can initialize your own color presets.


### The Event Contoller: fly.eventCtrlr

The fly.eventCtrlr is the publication / subscription (pub/sub) object within FlyPaper. New objects can subscribe to receive event announcements, event controllers and objects can send events information through fly.eventCtrlr w/o having to know about specific objects. The fly
.eventCtrlr accepts incoming registrations as objects are created.The frame event from the example above is handled as one such event:

	fly.eventCtrlr.publish("frame",event);
	};


### The Info Controller: fly.infoCtrlr

The fly.infoCtrlr keeps track of objects that register with it and collects any information they want to share.  It displays this in the info control panel.  The main purpose of the fly.infoCtrlr is debugging.  When fly.debug is set to true, pressing the "i" key will bring up the info panel.  Additionally, infoController keeps track of time past and frame rates.  This can be used to standardize running speeds across browsers.

FlyPaper on init accepts many values to alter the behavior and look of the info controller. For example, you may need the i key for something else, you can change the keyTrigger to 'shift-i-key' to only trigger the info panel when both the shift and i keys are pressed.  In the info panel under eventCtrlr, you can see a record of the last key pressed -- use this to figure out the string name for any key combination.

Here is the example from above with the default values for the info panel added in:

	fly.init({
		width:800, height:500,
		infoPrefs: {
			keyTrigger: 'i-key', // if you need "i" for something else, change it here
			screen : fly.color.grey[1], // the backround screen
			screenBars : fly.color.grey[0], // the grip and title bars
			opacity : .95, // the opacity of the screen
			size : 11, // font size
				// colors matching value types:
			titles: fly.color.blue[9], // titles on the collapsing bars
			version : fly.color.grey[5],
			info : fly.color.purple[4],
			val : fly.color.green[2],
			string : fly.color.grey[4],
			btrue : fly.color.orange[5], // boolean set to true
			bfalse : fly.color.orange[3],
			event : fly.color.red[4]
			eventFiring : fly.color.red[7]
			plain : fly.color.grey[4], // default color for unknown value types
		}
	});

## Ananda

At the heart of FlyPaper objects is the abstract class Ananda. Ananda takes the arguments sent to and tries to initialize an object with them. The Ananda is initialized when the object calls this.init(args).  The args can take a number of forms:

  * nothing: (). Returns a square handle 100 x 100 and a build string that usually means something went wrong: n[-1]
  * number: (x). creates a square handle x by x. build: n[x]
  * string("my object"). Creates a named object with no handle. build: s["my object"]
  * array: creates a handle for dragging. build a[...]
		* [w&h]
		* [width, height]
		* [xOrigin,yOrigin,w&h]
		* [xOrigin,yOrigin,width,height]
  * from rectangle: crates a handle
  * from object literal: {name:"my object",handle:[20]} (see another example in basic-example.html or basic-pullbar.html)

The ananda can include a number of properties:

  * the handle is a paper.Path.Rectangle used for dragging, by default it is invisible.
  * the group, initially this.group includes the handle if there is one
  * selectable (default false, unselectable when fly.debug is false)
  * draggable (default true)
  * rotatable (default false)


## FlyPaper Objects

FlyPaper Objects, which is what you will be writing, all inherit from [Ananda][]. The easiest way to build one is to copy and paste the Template object and alter the build() to include your own shapes.

### Template Objects: a basic example

Inside flyTemplates.js you will find the window.onload function from above (you can adapt this to your jQuery or equivalent load function), and a couple FlyPaper template objects, the most simple being fly.Template. This contains everything you need to plug into the FlyPaper functionality.  It builds a paper.Path.Oval so you can see it on the canvas. This call supplies two arguments: the name of the object "My Template Objects", and the handle.  If you supply a handle, the object will respond to drag and drop requests select and rotate requests by moving the handle.

Open basic-example.html in your favorite browser (assuming it's not IE) and you should see a really simple oval. The only things that makes it different from your usual oval on rectangle is it has the capability to be dragged around, rotated with the "r" key, selected with the "s" key, and it is smart enough to tell you anything you want to know about it.  Press the "i" key and it should bring up the info panel.


#### Adding info to the fly.infoCtrlr

Open the "My Fly" sub-panel (the name we gave it in the imbedded script) and you should see the information it is already set to give. The only information the template object itself is adding is the dummy variable "foo" which was set within the object to "bar".  The template is passing all of the other values through info() from the object's prototype [Ananda][].  You can pass them all in one go, or just select to see the ones that are relevant to your object. Here's a rundown of the values supplied by Ananda:

  * version: set within the object at init, or defaults to the prototype's
  * build: a string mash up of what went into the building of the object on init.
  * point: the upper left origin of the object
  * size: the object's size
  * group: The number of paper.paths that comprise the object.  If you specify a handle, this will be one of the paths.
  * draggable: boolean, set in the args
  * moving: boolean, currently moving
  * selectable: boolean, set in the args
  * selected: boolean, currently selected
  * rotatable: boolean, set in the args

Once your object had registered with the infoCtrlr, whenever the info panel is visible, and opened to your object, fly.infoCtrlr sends regular requests to  your object for info via YourObject.info(). It expects an object to be returned with the form:

{ name: "an identifying name", foo: {val:bar, type:"var"}, foo2: ... }

## Building your own

First copy and paste the window.onload function and fly.Template into your own javascript file and then replace "Template" everywhere with your own name to begin building your own objects.  Add the initial construction of your object in the empty build function.  Add any variables you need to keep track of in the info function.


## Another example: pullbar.html

Back in basic-example.com, replace the fly.Template constructor with the following:

	var myFly2 = new fly.PullGroup(
		{name:"My Sizable Fly",handle:[200,200,300],
	});

This object creates it's own fly.Pullbar and uses it to resize the shapes in its group. Press the s key to bring up the pullbar, press the i key to watch how the information sent from the object's pullbar is used.


----

## License

Copyright (c) 2012 Jonathan Gabel
http://jonathangabel.com
Licensed under the MIT license.