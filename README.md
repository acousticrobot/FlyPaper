# FlyPaper.js
version 3.6 author [Jonathan Gabel](http://jonathangabel.com)

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
		// when fly.debug is set to true, the info panel is accesible
		fly.debug = true;
	
		// All mouse events are handled within FlyPaper
		// the onFrame handler must be installed here:
		paper.view.onFrame = function(event) {
		fly.eventCtrlr.publish("frame",event);
		};
		
		// Now we can add a FlyPaper object 
		// fly.Template is a basic example of a FlyPaper object
		var myFly = new fly.Template(
			{name:"My Template Object", handle:[100,100,300,250],
			selectable:true, // default: false
			dragable: true, // default: true
			rotatable: true // default: false
		});
	
	};


If you run this page in a browser, you should see a 300 x 250 pixel oval sitting within the canvas, which you can drag around, select with the 's' key, and rotate with the 'r' key. All that fly.Template builds is this one oval shape inside of the handle (origin at 100,100 width: 300, height:250), but it plugs into the functionality shared by all FlyPaper objects. Because we set fly.debug to true, if you press the 'i' key, you will see the information panel that is tracking everything within the FlyPaper context, including our object which we named "My Template Object".

More information about this example below in [Template Objects: a basic example][]

## FlyPaper basic features

### fly.init()

fly.init() initializes the drawing space and inits other "smart" objects within the Paper.js context. Currently it only looks for two values: the width and height for the canvas.
Eventually it should take arguments that can control the colors and other aspects of the FlyPaper. For now you will have to look for fly.color, fly.info etc. and change these within the script. 
### The Event Contoller: fly.eventCtrlr

The fly.eventCtrlr is the publication / subscription (pub/sub) object within FlyPaper. New objects can subscribe to receive event announcements, event controllers and objects can send events information through fly.eventCtrlr w/o having to know about specific objects. The fly
.eventCtrlr accepts incoming registrations as objects are created.The frame event above is handled as one such event:

	fly.eventCtrlr.publish("frame",event);
	};


### The Info Controller: fly.infoCtrlr

The fly.infoCtrlr keeps track of objects that register with it and collects any information they want to share.  It displays this in the info control panel.  The main purpose of the fly.infoCtrlr is debugging.  When fly.debug is set to true, pressing the 'i' key will bring up the info panel.  Additionally, infoController keeps track of time past and frame rates.  This can be used to standardize running speeds across browsers.

## FlyPaper Objects

FlyPaper Objects, which is what you will be writing, all inherit from [Ananda][]. The easiest way to build one is to copy and paste the Template object and alter the build() to include your own shapes.

### Template Objects: a basic example

Inside flyTemplates.js you will find a couple template FlyPaper objects, the most simple being fly.Template. This contains everything you need to plug into the FlyPaper functionality.  It builds a paper.Path.Oval so you can see it on the canvas. Everything you need to initialize the canvas and create a new template object is in basic-example.html. This call supplies two arguments: the name of the object "My Template Objects", and the handle.  If you supply a handle, the object will respond to drag and drop requests select and rotate requests by moving the handle.  

Take a look at basic-example.html in your favorite browser (assuming it's not IE) and you should see a really simple oval sitting in a blue field. The only things that makes it different from your usual oval on rectangle is it has the capability to be dragged around, rotated with the "r" key, selected with the "s" key, and it is smart enough to tell you anything you want to know about it.  Press the "i" key and it should bring up the info panel. Open the "My Template Object" sub-panel (the name we gave it in the imbedded script) and you should see the information it is already set to give. The only information the template object itself is adding is the dummy variable "foo" which was set within the object to "bar".  The template is passing all of the other values through info() from the object's prototype [Ananda][].  You can pass them all in one go, or just select to see the ones that are relevant to your object. Here's a rundown of the default values: 
  
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

First copy and paste fly.Template into your own javascript file and then replace "Template" everywhere with your own name to begin building your own objects.  Add the initial construction of your object in the empty build function.  Add any variables you need to keep track of in the info function.

### Adding info to the fly.infoCtrlr

Once your object had registered with the infoCtrlr, whenever the info panel is visible, and opened to your object, fly.infoCtrlr sends regular requests to  your object for info via YourObject.info(). It expects an object to be returned with the form: 
{ name: "an identifying name", foo: {val:bar, type:"var"}, foo2: ... }

## Another example: pullbar.html

This file shows an example of a simple object with a pullbar. The object fly.PullGroup included in FlyPaper is one example of how to add multiple shapes using the build function, and define they way they update based on stimuli.  This object creates it's own fly.Pullbar and uses it to resize the shapes in its group. Press the s key to bring up the pullbar, press the i key to watch how the information sent from the objects pullbar is used. 

## Ananda 

At the heart of Template is the abstract class Ananda. Ananda takes the arguments sent to and tries to initialize an object with them. The Ananda is initialized when the object calls this.init(args).  The args can take a number of forms:

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

----

## FlyPaper TODO next up:
  * better organization of layers [background layer | stage layer array [] | info layer ]
  * add better timing functionality
  * ability to add information into flypaper section of the info panel.

----

## License

Copyright (C) 2012 Jonathan Gabel
http://jonathangabel.com
All rights reserved


Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.