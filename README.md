# FlyPaper.js
version 3.5 author [Jonathan Gabel](http://jonathangabel.com)

FlyPaper.js adds the fly namespace to a project using the [Paper.js](http://paperjs.org) framework. It's main purpose is to add communication and animation functionality.  FlyPaper uses JavaScript directly so that it can be used used across multiple files, please see ["using JavaScript directly"](http://paperjs.org/tutorials/getting-started/using-javascript-directly/) for more info on how this differs from using PaperScript.

*please note:* FlyPaper is still in an experimental stage, I can't say for sure what will be backwards compatible.

## Setting up a scope

basic.html contains a basic example of initializing FlyPaper and adding a basic template object:  

	window.onload = function() {
		// start by initializing Paper.js
		var canvas = document.getElementById('ctx');
		paper.setup(canvas);
	
		// initialize FlyPaper and set the canvas to 800 x 500 
		fly.init({width:800,height:500});
		// when fly.debug is set to true, the info panel is accessible
		fly.debug = true;
	
		// mouse events are handles within FlyPaper
		// the onFrame handler is installed here
		paper.view.onFrame = function(event) {
		fly.eventCtrlr.publish("frame",event);
		};

		// fly.Template is the most basic object in FlyPaper
		// use it to create your own FlyPaper constructions
		var myFly = new fly.Template(
			// create an object at 100,100 with a draggable handle 300px x 250px 
			{name:"My FlyPaper Template",handle:[100,100,300,250],
			selectable:true, // default: false
			dragable: true, // default: true
			rotatable: true // default: false
		});
	}; // END window onLoad

fly.Template builds a sample oval shape inside of the handle. If you run this in a browser, you should see a 300 x 250 pixel oval sitting within the canvas. If you press the 'i' key, you will see the information panel that is tracking everything within the FlyPaper context.

## FlyPaper basic features

### fly.init()

fly.init() initializes the drawing space and inits other "smart" objects within the Paper.js context. Currently it only looks for two values: the width and height for the canvas.
Eventually it should take arguments that can control the colors and other aspects of the FlyPaper. For now you will have to look for fly.colors, fly.info etc. and change these within the script.  

### The Event Contoller: fly.eventCtrlr

The fly.eventCtrlr is the pub/sub object within FlyPaper. New objects can subscribe to receive event announcements, event contollers and objects can send events information through fly.eventCtrlr w/o having to know about specific objects. The fly.eventCtrlr accepts incoming registrations as objects are created.

### The Info Controller: fly.infoCtrlr

The fly.infoCtrlr keeps track of objects that register with it and collects any information they want to share.  It displays this in the info control panel.  The main purpose of the fly.infoCtrlr is debugging.  When fly.debug is set to true, pressing the 'i' key will bring up the info panel.  Additionally, infoController keeps track of time past and frame rates.  This can be used to standardize running speeds across browsers.

## FlyPaper Objects

The main purpose of the FlyPaper framework is to allow easy debugging of more complicated systems, quickly adding variables to the canvas so you don't have to console.log them at 5 - 50 frames per second.  Additionally is adds basic functionality [ dragging and dropping, rotating, selecting, pull-bars ] and motions [ swing, bob, custom ] to shapes or groups of shapes. Lastly, it allows you to register objects to listen for events, or publish events for other shapes to respond to.

### Template Objects

Inside flytemplates.js you will find several template FlyPaper objects, the most simple being fly.Template. This contains everything you need to plug into the FlyPaper functionality.  

First copy and paste fly.Template into your own javascript file and then replace "Template" everywhere with your own name to begin building your own objects.  Add the initial construction of your object in the empty build function.  Add any variables you need to keep track of in the info function.

### Adding info to the fly.infoCtrlr

Once your object had registered with the infoCtrlr, whenever the info panel is visible, and opened to your object, fly.infoCtrlr sends a regular requests to your object for info via YourObject.info(). It expects an object to be returned with the form: { name: "name", foo: {val:"bar", type:"var"}, ... }

## Another example: pullbar.html

This file shows an example of a simple object with a pullbar. The object fly.PullGroup included in FlyPaper is one example of how to add multiple shapes using the build function, and define they way they update based on stimuli.  This object creates it's own fly.Pullbar and uses it to resize the shapes in its group. Press the s key to bring up the pullbar, press the i key to watch how the information sent from the objects pullbar is used. 

## Ananda 

At the heart of Template is the abstract class Ananda. Ananda takes the arguments sent to and tries to initialize an object with them. The Ananda is initialized when the object calls this.init(args).  The args can take a number of forms:

  * number: creates a square handle
  * string: "my object" is the name, no handle 
  * array: creates a handle for dragging
		* [w&h]
		* [width, height]
		* [xOrigin,yOrigin,w&h]
		* [xOrigin,yOrigin,width,height]
  * from rectangle: crates a handle 
  * from object literal: {name:"my object",handle:[20]} (see another example in basic.html)

It can have a number of properties:

  * the handle is a paper.Path.Rectangle used for dragging, by default it is invisible
  * the group, initially this.group includes the handle if there is one
  * selectable (default false, in effect when fly.debug is false)
  * draggable (default true)
  * rotatable (default false)

----

## FlyPaper TODO next up:
  * color handling cleanup
  * better organization of layers [background layer | stage layer array [] | info layer ]
  * add better timing functionality
  * ability to add information into fly.info

----

## License

Copyright (C) 2012 Jonathan Gabel
http://jonathangabel.com
All rights reserved.


Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.