//--------------------- BEGIN FLYPAPER ---------------------//
/*
*	Author Jonathan Gabel
*	website jonathangabel.com
*	Namespace FLYPAPER
*	abbreviated: fly
*	version 0.4
*								
* flypaper init() creates a drawing and animation context
* using the paper.js library. View README for more info.
*	
*/
//--------------------------------------------------------//

"use strict"
var fly = fly == undefined ? {} : fly ;
if (typeof fly !== "object") {
	throw new Error("fly is not an object!");
}

//--------------------- BEGIN FLYPAPER INIT ----------------//
/*
*	initializes the canvas for all drawing
*	contains eventCtrlr and infoCtrlr	
*	accepts the following in args:	
*		width: canvas width
*		height: canvas height
*		colorPalette: "standard","neon","pastel","custom"
*		colorSet: [ ['red','#400000','#FF0000','#FFC0C0',],[.,.,.,.],...]
*			colorSet is used when colorPalette is "custom"
*		backgroundColor: "#F00F00", "red[4]"
*		stageLayers: number of layers in fly.layers.stage[]
*
*	version 0.4			
*/
//--------------------------------------------------------//

fly.init = function (args) {

	fly.name = "flypaper";
	fly.version = "0.4";
	if (args === undefined) {
		args = {};
	};
	fly.debug = false; // turns on extra debug info	
	
	if (args.width && args.height) {
		fly.width = args.width; // canvas width
		fly.height = args.height; // canvas width
		paper.view.viewSize = new paper.Size(fly.width,fly.height);
	} else {
		console.log(paper.view);
		fly.width = paper.view.viewSize.width;
		fly.height = paper.view.viewSize.height;
	}

//--------------------- BEGIN LAYERS INIT ----------------//
/*
*	Initialize drawing layers in fly.layers
*	Init creates layers in three parts:
*	- fly.layers.background: 1 layer with 1 paper.Rectangle
*		backRect, which is colored after fly.color init
*	- fly.layers.stage: an array of layers for main drawing
*		pass number of layers in args as stageLayers,
*		defaults to one layer (fly.layers.stage[0])
*	- fly.layers.infoLayer: 1 layer for info panel
*
*	version 0.4
*/
//--------------------------------------------------------//


	fly.layers = (function() {
		var background = paper.view.activeLayer,
			backRect = new paper.Path.Rectangle(paper.view.bounds),
			stage = [];
			
		if (args.stageLayers !== undefined && args.stagelayers > 0) {
			for (var i=0; i < args.Stagelayers; i++) {
				stage[i] = new paper.Layer();
			};
		} else {
			stage[0] = new paper.Layer();
		}
		var infoLayer = new paper.Layer;	
		return {
			background : background,
			backRect : backRect,
			stage : stage,
			infoLayer : infoLayer,
		}
	})();


//--------------------- BEGIN COLORSPACE INIT ------------//
/*
*	Initialize color utility with methods for reading hex values
*	and stored color presets.  Preset color arrays are made
*	out of three values: darkest/saturated/lightest, two linear
*	progression are made from the ends to the middle value.
*	Color arrays default to 9 segments in length. 
*	Presets can be altered and new sets made through the
*	public method spectrum. example use:
*		fly.color.rainbow = fly.color.spectrum('#FF0000','#00FF00','0000FF',13);
*	This creates an 13 segment color spectrum, fly.color.rainbow[7] == '#00FF00' 
*	common variables: 
*		col is used for passed hex color values, ex. "#789ABC"
*		cola for color arrays, [r,g,b] ex [0,127,255]
*
*	version 0.4
*/
//--------------------------------------------------------//

	fly.color = (function() {

		var name = "fly colors",
			version = "0.3.9",
			colorPresets = [],
			bkgCol = args.backgroundColor !== undefined ?
				args.backgroundColor : '#FFFFFF';
		
		if (args.colorPalette === undefined) {
			args.colorPalette = "standard";
		};
		var palette = args.colorPalette;
			
		function limit(col){
		    // limit col between 0 and 255
		    // color is any int
		    return col = Math.min(Math.max(col, 0),255);
		};

		function split(hexCol){
		    // split a hex color into array [r,g,b]
		    //assumes hex color w/ leading #
		    var col = hexCol.slice(1);
		    var col = parseInt(col,16);
		    var r = (col >> 16);
		    var g = ((col >> 8) & 0xFF);
		    var b = (col & 0xFF);
		    return([r,g,b]);
		};

		function splice(cola){
			// takes a cola and returns the hex string value
		    // cola is a color array [r,g,b], are all int
		    var r = cola[0],
		        g = cola[1],
		        b = cola[2];
		    var splice = ((r << 16) | (g << 8) | b ).toString(16);
		    // if r < 10, pad with a zero in front
		    while (splice.length < 6) {
		        splice = "0" + splice
		    }
		    splice = "#" + splice;
		    return splice;    
		};

		function mix(col1,col2,amt){
		    // mixes 2 hex colors together, amt (0 to 1) determines ratio
		    // amt defaults to .5, mixes 50/50

		    var amt = amt !== undefined ? amt : 0.5; 
		    var col1a = split(col1),
		        col2a = split(col2);
		    for (var i=0; i < col1a.length; i++) {
		        col1a[i] = (col1a[i]*(1-amt)) + (col2a[i]*(amt));
		    };
		    return splice(col1a);
		};
		
		function totalValue (col) {
			// adds the R,G,B values together
			var cola = split(col);
			return cola[0] + cola[1] + cola[2];
		}

		function bispectrum(col1,col2,seg){
			// takes two colors, returns array of seg sements
			// each a hex color. sent colors are first and last 
			// colors in the array
			var seg = seg !== undefined ? seg : 5;
		    if (seg < 3) {
		        return [col1,col2];
		    };
		    var spec = [col1];
		    for (var i=1; i < seg-1; i++) {
		        spec.push(mix(col1,col2,i/(seg-1)))
		    };
		    spec.push(col2);
		    return spec;
		};

		function trispectrum(col1,col2,col3,seg){
			// takes three hex colors and creates a 9 segment spectrum
			// made for bringing saturated colors to light and dark
			// standard use: (lightest, saturated, darkest)
			// sent colors are first, middle, and last of the array
			// spectrum length defaults to 9, and will always be odd
			var seg = seg !== undefined ? seg : 9;
			var midseg = Math.ceil(seg/2);
			var lights = bispectrum(col1,col2,midseg),
				darks = bispectrum(col2,col3,midseg);
				// remove duplicate color in middle and merge
				lights.pop();
				var spec = lights.concat(darks);	
				return spec;
		};
		
		function spectrum(name,col1,col2,col3,seg) {
			// name: string for name of color set
			// send two hex colors for a bispectrum
			// three colors for a trispectrum
			// possible args sent:
			//	(name,col1,col2)
			//	(name,col1,col2,seg)
			//	(name,col1,col2,col3)
			//	(name,col1,col2,col3,seg)
			colorPresets.push(name);      
			var spec;
			if (col3 !== undefined) {
				if (typeof col3 == "string" ) {
					spec = trispectrum(col1,col2,col3,seg);
				} else if (typeof col3 == "number" ) {
					// col3 is actually seg
					spec = bispectrum(col1,col2,col3);
				} else seg = bispectrum(col1,col2);
			};
			return spec;
		};
		
		function setPalette (colorSet) {
			// colorSet is an array of color arrays, example:
			// [ ['red','#400000','#FF0000','#FFC0C0',],[.,.,.,.],...]
			for (var i=0; i < colorSet.length; i++) {
				var spec = colorSet[i];
				fly.color[spec[0]] = fly.color.spectrum(spec[0],spec[1],spec[2],spec[3]);	
			};
		}
		
		function background (col) {
			bkgCol = col !== undefined ? col : bkgCol;
			fly.layers.backRect.fillColor = bkgCol;
			return bkgCol;
		}

		return {
			// public vars
			palette : palette,
			// public methods 
			mix : mix,
			totalValue : totalValue,
			spectrum : spectrum,
			setPalette : setPalette,
			background : background
		};

	})();

	// check args passed on init for color palette info:	
	
		
	// Populate the colorspace with a colorset:	
	fly.initColorPalette = (function() { 
							
		switch(args.colorPalette) {

			case "custom":
				var set = args.colorSet;
				break;

			case "pastel":
				var set = [
					['red','#F04510','#FF7070','#FFD3C0',],
					['orange','#F28614','#FFB444','#FFE8C0'],
					['yellow','#CDB211','#FFFF70','#FFFFC0'],
					['green','#42622D','#89C234','#C0FFC0'],
					['blue','#00597C','#00A9EB','#B0E5FF'],
					['purple','#6F006F','#9F3DBF','#FFC0FF'],
					['grey','#383633','#A7A097','#FFFFFF']
				];
				break;
				
			case "sunny day":
				var set = [
					['red','#2F060D','#FF361F','#FFCFC5',],
					['orange','#6D3200','#FF8125','#FFD1B6'],
					['yellow','#D6FF43','#FFFA95','#F4FFDA'],
					['green','#3B4D2A','#89C234','#A0FFA0'],
					['blue','#1D3852','#00A9EB','#9BCAE1'],
					['purple','#4C244C','#893DB3','#D0B8FF'],
					['grey','#1E2421','#848179','#D3FFE9']
				]
				break;			

			case "monotone":
				var set = [
					['red','#1B1414','#584444','#FFE7E3',],
					['orange','#2A2620','#4D463A','#FFE9CC'],
					['yellow','#313125','#808061','#FAFFE0'],
					['green','#111611','#6E936E','#E7FFD3'],
					['blue','#0A0A0D','#696991','#E5D9FF'],
					['purple','#0D090D','#684E68','#FFE3EC'],
					['grey','#000000','#808080','#FFFFFF']
				];
				break;

			case "neon":
				var set = [
					['red','#6A0032','#FF0023','#FFC0F2',],
					['orange','#BD2E00','#FFA500','#FFE8C0'],
					['yellow','#ACFF02','#FFFF00','#FFFFC0'],
					['green','#133B0F','#38FF41','#BFFF68'],
					['blue','#010654','#013BFF','#4FFFF8'],
					['purple','#3B034C','#9800B3','#CC5FFF'],
					['grey','#0A0511','#696281','#E3E8FF']           
				];
				break;

			case "standard":
			default:
				var set = [
					['red','#400000','#FF0000','#FFC0C0',],
					['orange','#402900','#FFA500','#FFE8C0'],
					['yellow','#404000','#FFFF00','#FFFFC0'],
					['green','#004000','#00FF00','#C0FFC0'],
					['blue','#000040','#0000FF','#C0C0FF'],
					['purple','#400040','#800080','#FFC0FF'],
					['grey','#000000','#808080','#FFFFFF']
				];
		};

		fly.color.setPalette(set);		
		fly.color.background();
		
	})();
		
	
//--------------------- BEGIN CONTROLLERS INIT ------------//
/*
*	Initialize InfoController and EventController
*
*	version 0.4
*/
//--------------------------------------------------------//

	
	fly.info = function() {
		// fly namespace is the first member of fly.infoCtrlr
			var i = {};
			i.name = fly.name;
			i.version = { val: fly.version, type: "version"};
			i.debug = { val: fly.debug, type: "bool" };
			i.width = { val: fly.width, type: "val" };
			i.height = { val: fly.height, type: "val" };
			i.stage_layers = { val: fly.layers.stage.length, type: "val"};
			i.color_palette = { val: fly.color.palette, type: "val"};
//			i.keys = {val: "[i]nfo, [s]elect, [r]otate", type: "string" };
			return i;
	};
							
	fly.eventCtrlr = (function () {
	// eventCtrlr is the main pub/sub object, 
	// paper events all publish through it, 
	// objects listening for events
	// SUBSCRIBE to events with: 
	//		fly.eventCtrlr.subscribe("event",this);
	// See fly.Ananda.prototype.register for an example.
	// common events include: 
	// "mouse down","mouse drag", "mouse up",	
	// "frame", and "x-key" where x is any key
	// PUBLISH events with:
	// fly.eventCtrlr.publish("mouse down",event);
	// mouse and key events are handled with paper tools
	// implemented within flypaper.
	  
	// IMPORTANT! On-frame events must be initaited
	// in the main javascript on window load. Use:	
	// paper.view.onFrame = fu*c*ion(event) {
	//		fly.eventCtrlr.publish("frame");
	//	};
	
		var name = "eventCtrlr",
			version = "0.4",
			events = {},			
			firing = {}, //  used by isFiring
			firePulse = 10, // isFiring countdown
			keyRegex = /.*-key$/, // for matching key events
			lastKey = "",
			errors = [];

		function isFiring(e) {
			// registers an event as firing for next
			// firePulse number of events
			// firing > 0 is sent to infoCtrlr as "firing"
			var event;
			for (event in firing) {
				if (firing[event] > 0 ) {
					firing[event] = firing[event] - 1;
				};
			};
			firing[e] = firePulse;
		}

		function publish(e,args) {
			if (fly.debug) {
				isFiring(e);
				if (e.match(keyRegex)) {
					lastKey = e;
				};
			};
			if (events[e]) {
				for (var i=0; i < events[e].length; i++) {
					try {
						if (args !== undefined) {
							events[e][i].eventCall(e,args);
						} else {
							events[e][i].eventCall(e);
						}
					}
					catch(ex) {
						addError(ex, events[e][i]);
					};
				};
			};
		}
		
		function subscribe(e,o) {
				// e = ["event","event",...], o = registering object 
			for (var i=0, j = e.length; i < j ; i++) {							
				if (!events[e[i]]) {
					// add to events
					events[e[i]] = [o];
					firing[e[i]] = firePulse;
				} else {
					events[e[i]].push(o);
				};
			};
		}
		
		function unsubscribe(o) {
			for (var e in events) {
				for (var i=0, j = events[e].length; i < j; i++) {
					if (events[e][i] === o) {
						events[e].splice(i,1); // remove 0 events;
					};
					if (events[e].length === 0) {
						delete events[e];
					}
				};
			};
		}
		
		function register() {
			fly.infoCtrlr.register(this);
		}
		
		function info() {
			var i = {
				name: name,
				v: { val: version, type: "version" },
				errors: {val: errors.length, type: "val"}
			};
			var event;
			for (event in events) {
				if (firing[event] > 0) {
					var _t = "eventFiring";
				} else {
					var _t = "event";
				};
				var subs = events[event].length > 1 ? " subscribers" : " subscriber"
				i[event] = {val: events[event].length + subs, type: _t};
			}
			i.last_key = {val: lastKey, type: "string"};
			return i;
		}
		
		function addError(ex,obj) {
			var _er = "Error: ";
			if (ex === "TypeError: events[e][i].eventCall is not a function") {
				if (obj.info().name) {
					_er += obj.info().name;
				};
				_er += " has no event call";
			};
			for (var i=0; i < errors.length; i++) {
				if (errors[i] === _er) {return};
			};
			errors.push(_er);
		}
		
		function reportErrors(){return errors};

		return {
			publish: publish,
			subscribe: subscribe,
			unsubscribe: unsubscribe,
			info: info,
			reqInfo: register,	// infoCtrlr requests registration
			reportErrors: reportErrors
		};
	})();

	fly.infoCtrlr = (function () {
	// new objects can register as a member with infoCtrlr 
	// by sending the request: fly.infocontroller.register(this);
	// optional second boolean parameter display: (this,false)
	// will initialize this objects panel as open or closed.
	// On frame events, infoCtrlr sends a request to members
	// for an info packet.  v0.2 infopackets are of the form:
	// { name: "name", var1:{val: var1, type:"val"},var2:{..}..},
	// infoCtrlr will attempt to match the type to a type in
	// fly.color.info for a color for that type.
			
		var name = "infoCtrlr";
		var version = "0.4";
		 // fly is members[0], infoCtlr is member[1] after infoCtrlr.init();
		var members = [{obj:fly,display:false}];
		args.info = args.info || {};
		var keyTrigger = args.info.keyTrigger || 'i-key';
		var style = {};
			// base text colors:
			style.titles = args.info.titleBar || fly.color.blue[9] || "#9BCAE1";
			style.plain = fly.color.grey[4] || "#89C234";
			// screen and bar colors:
			style.screen = args.info.screen  || fly.color.grey[1] || "#0D1927";
			style.screenBars = args.info.screenBars || fly.color.grey[0] || 'black';
			// colors matching value types:
			style.val = args.info.val || fly.color.green[2] || "#89C234";
			style.string = args.info.string || fly.color.grey[4] || "#691BE2";
			style.btrue = args.info.btrue || fly.color.orange[5] || "#66FF99";
			style.bfalse = args.info.bfalse || fly.color.orange[3]|| "#3D9199";
			style.event = args.info.event || fly.color.red[4]|| "#BC4500";
			style.eventFiring = args.info.eventFiring || fly.color.red[7]|| "#FF5E00";
			style.version = args.info.version || fly.color.grey[5] || "#8A8A39";
			style.info = args.info.info || fly.color.purple[4] || "#8A8A39";
			// font styles
			style.size = args.info.size || 11;
			style.spacing = style.size * 1.75;
			style.offset = style.size;
			style.opacity = args.info.opacity || .95;
		var ibox = {};
			ibox.handle = {}; // for move events
			ibox.origin = new paper.Point(10,10);
			ibox.txtOffset = [style.size,style.size * 3.5];
			ibox.txtOrigin = ibox.origin.add(ibox.txtOffset);
			ibox.txtLen = 0;	
			ibox.txtWidth = 0;
			ibox.titleBars = [];
			ibox.visible = fly.debug; // start visible in debug mode;
		var infoGroup = [];
			infoGroup.box = new paper.Group();
			infoGroup.bars = new paper.Group();
			infoGroup.txt = new paper.Group();
		var moving = false;
			// time counter, eventually to base speed on environment
		var _time = {};
			_time._c
			_time.frame = 0;
			_time.time = 0;
			_time.fps = {curr:0,ave:0};
		var device = {}; // for device detection
			device.isIpad = navigator.userAgent.match(/iPad/i) !== null;	
			device.isMobile = (function () {
				var user = navigator.userAgent.toLowerCase();
				var agents = /android|webos|iphone/;
				if (user.match(agents)) {
					return true;
				};
				return false;
			})();
					
		//------------------- registration --------------------//

		function reset() {
			ibox.txtWidth = 0;
			updateInfo(true);
			resetBars();
		}
		
		function register(o,d){
			d = typeof(d) !== 'undefined' ? d : false;			
				// new objects register to become a member
			for (var i=0; i < members.length; i++) {
				if (members[i].obj === o) {
					return "error: object already exists";
				}; 
			};
			members.push({ obj:o, display:d, info:{} });
			updateInfo(true);
			resetBars();
		}

		function deregister(o){
			for (var i=0; i < members.length; i++) {
				if (members[i].obj === o) {
					members.splice(i,1);
					return;
				}; 
			};
			reset();
		}
		
		function request(o){
			try { 
				o.reqInfo();
			}
			catch(ex) {
				return ("error request did not go through");
			};
		}

		function init() {
			fly.infoCtrlr.register(this);
			fly.eventCtrlr.subscribe(
				[keyTrigger,"frame","mouse down","mouse drag","mouse up"],this
			);
		}

		//------------------- drawing -------------------------//

		function printTxtLine(key,val) {
				// printText() sends:
				// (name,"openTitle) or (name,"closedTitle")
				// or (key,{v:val,t:type})	
				if (key === undefined || val === undefined) {
					return "Error printing info";
				};
				updateWidth(key,val);				
			var text = new paper.PointText(ibox.cursor);
				text.paragraphStyle.justification = 'left';
				text.characterStyle.fontSize = style.size;
			var _t = "";
			if (val === "openTitle") { 
					// object name line, style as title	
				_t += "\u25BC  " + key; // down triangle
				text.fillColor = style.titles;
			} else if (val === "closedTitle") {
				_t += "\u25B6 " + key; // right triangle
				text.fillColor = style.titles;
				ibox.cursor.y += 2;
			} else {	// styles for other items
				var _s;	// style by type
				if (val.type === "bool") {
					_s = "b" + val.val; // btrue or bfalse
				} else {
					_s = val.type;
				};
				if (style[_s] !== undefined) {
					text.fillColor = style[_s];
				} else {
					text.fillColor = style.plain;
				}
				_t += key + ": " + val.val;
			}
			text.content = _t;
			infoGroup.txt.addChild(text);
			ibox.cursor.y += style.spacing;
		}

		function printText(){
				// starting at text origin point
				// create each new line of text
			ibox.cursor = new paper.Point(ibox.txtOrigin);
			for (var i=0; i < members.length; i++) {
					// add location to titleBar array
				setBars();
				if (members[i].display === true) {
						// add line with name
					printTxtLine(members[i].info.name,"openTitle");
						// if member's display, make line for each in
					for (var item in members[i].info) {
						if (item !== "name") {
							printTxtLine(item, members[i].info[item]);
						};
					}
				} else {
					printTxtLine(members[i].info.name,"closedTitle");
				};
			};	
		}

		function resetBars() {
			ibox.titleBars = [];
		}
		
		function setBars() {
				// for collapsable bars behind titles
				// called from printText as titles are printed
			if (ibox.titleBars.length !== members.length)  {
				var _p = new paper.Point(	ibox.cursor.x - style.offset,
									ibox.cursor.y - 1.2 * style.offset);
				ibox.titleBars.push(_p);
			};
		}
		
		function drawBars() {
			for (var i=0; i < ibox.titleBars.length; i++) {
				var _s = new paper.Size( ibox.txtWidth + 2 * style.offset, style.spacing);
				var bar = new paper.Path.Rectangle(ibox.titleBars[i], _s);
					bar.fillColor = style.screenBars;
				bar.opacity = .50; 
				infoGroup.bars.addChild(bar);
			};			
		}

		function drawGrip() {
			var _s2 = new paper.Size( ibox.boxWidth, 30);
			var grip = new paper.Path.Rectangle(ibox.origin, _s2);
			grip.name = "grip";
			grip.fillColor = style.plain; // needs a fill color to work!
			grip.visible = false;
			infoGroup.box.addChild(grip);
						
			for (var i=0; i < 7; i++) {
				var from = new paper.Point(ibox.origin.x, ibox.origin.y + .3 * style.size * i + 2);
				var to = new paper.Point(from.x + ibox.boxWidth, from.y);
				var gripLine = new paper.Path.Line(from, to);
				gripLine.strokeColor = style.screenBars;
				gripLine.strokeWidth = 2;
				infoGroup.box.addChild(gripLine);
			};
		}
	
		function drawBox() {
			ibox.txtWidth = ibox.txtLen * style.size * 0.68;
			ibox.boxWidth = ibox.txtWidth + 2 * style.offset;
			var _s = new paper.Size (	
						ibox.boxWidth, 
						ibox.cursor.y - ibox.origin.y - style.offset
						);
			var _r = new paper.Rectangle(ibox.origin, _s);
			var clipper = new paper.Path.RoundRectangle(_r, 10);
			var screen = new paper.Path.Rectangle(_r);
			screen.fillColor = style.screen;
			screen.opacity = style.opacity; 
			infoGroup.box.addChild(clipper);
			infoGroup.box.addChild(screen);
			infoGroup.box.clipped = true;
			drawGrip();
			drawBars();
			fly.layers.infoLayer.visible = ibox.visible;
		}
		
		//------------------- animation ----------------------//

		function toggleDisplay(){
			ibox.visible = !ibox.visible;
		}
		
		function grab(point){
			// ignore if not visible, else animate arrows and dragging
			if (!fly.layers.infoLayer.visible) {
				return;
			};
			for (var i=0; i < infoGroup.bars.children.length; i++) {
				if (infoGroup.bars.children[i].hitTest(point)) {
					members[i].display = !members[i].display;
					reset(); // clear & force reset;							
				};
			};
			if (infoGroup.box.children['grip'].hitTest(point)) {
				ibox.handle.or = point.subtract(ibox.origin);
				moving = true;
				
			};				
		}
		
		function drag(point){
			if (moving) {
				ibox.origin = point.subtract(ibox.handle.or);
				ibox.txtOrigin = ibox.origin.add(ibox.txtOffset);
				resetBars();
			}
		}
		
		function drop(point) {
			moving = false;	
		}
		
		function updateWidth (key,value) {
				// approximates width needed for info box
			key = key || 0;
			value = value || 0;
			key = key.toString() || 0;
			value = value.toString() || 0;
			var _l = key.length + value.length;
			if (_l > ibox.txtLen) {
				ibox.txtLen = _l;
			};
			if (ibox.txtLen > 50) {
				ibox.txtLen = 50;
			};
		}

		//------------------- information collection ---------//
		function time() {
			return _time;
		}
		
		function updateTime(args) {
			// v 0.3.6
			// args from frameUpdate {delta,time,count}
			// if args is undefined, check paper onFrame is publishing: ("frame",event);
			if (args === undefined) {
				_time.frame++;
				return;
			};
			_time.frame = args.count; // frames since start
			_time.time = args.time; // seconds since start
			_time.fps.ave = args.count / args.time;
			_time.fps.curr = 1 / args.delta;
		}
		
		function info(){
		// for self-monitoring, also a model for member's info method 
			var i = {};
			i.name = name;
			i.version = { val: version, type: "version"};
			i.origin_pt = { val: ibox.origin, type: "val"};
			i.members = { val: members.length, type:"val"};
			// i.width = { val: ibox.txtWidth.toFixed(2), type: "val" };
			i.frame = { val: _time.frame, type: "val"};
			i.time = { val: _time.time.toFixed(2), type: "val"};
			i.fpsAve = { val: _time.fps.ave.toFixed(2), type: "val"};
			i.fpsCurr = {val: _time.fps.curr.toFixed(2), type:"val"};
			// i.moving = { val: moving, type: "bool" };
			i.mobile = { val: device.isMobile, type: "bool"};
			i.ipad = { val: device.isIpad, type: "bool"};
			return i;
		};
				
		function updateInfo(force){
			// v 0.3.6
				//	gather most recent info 
				//	from members with display = true 
				//	use force === true on resistration or to update all
				//  this is used to adjust width of box to lngth of info
			for (var i=0; i < members.length; i++) {
				if (members[i].display || force) {
					members[i].info = members[i].obj.info();
					if (force) { // recheck max width of infobox
						var key;
						for (key in members[i].info) {
							try {
								if (key === "name") {
									updateWidth("name", members[i].info.name);
								} else {
									updateWidth(key, members[i].info[key].val);
								};
							}
							catch(ex) {
								return(ex);
							}
						};
					};
				};
			};
		}
					
		function update(args){
			updateTime(args);
			
					// only update panel if visible or visibility has changed
			if (fly.layers.infoLayer.visible || ibox.visible) { 
				if (infoGroup.box.hasChildren()) {
					infoGroup.box.removeChildren();
				}
				if (infoGroup.bars.hasChildren()) {
					infoGroup.bars.removeChildren();
				}
				if (infoGroup.txt.hasChildren()) {
					infoGroup.txt.removeChildren();
				}
				updateInfo();
				printText();
				drawBox();
			};
		}
		
		function eventCall(e,args) {
			switch (e) {
			case keyTrigger :
				if (fly.debug) {
					toggleDisplay();
					// make sure handle isn't off screen:
					if (ibox.origin.x < 1 || ibox.origin.x > fly.height
						|| ibox.origin.y < 1 || ibox.origin.y > fly.width) {
						ibox.origin.x = 10;
						ibox.origin.y = 10;
						ibox.txtOrigin = ibox.origin.add(ibox.txtOffset);
						resetBars();
					};
				};
				break;
			case "frame" :
				update(args);
				break;
			case "mouse down" :
				grab(args.point);
				break;
			case "mouse drag" :
				drag(args.point);
				break;
			case "mouse up" :
				drop(args.point);
				break;
			default :
			}
		};
		

		return {
			moving: function () { return moving; },
// temp patch ???
			fps : function () { return time.fps.ave; }, 
//  temp patch ???
			isMobile :	function () {return device.isMobile},
			isIpad : function () {return device.isIpad},
			init: init,
			time : time,
			register: register,
			deregister: deregister,
			request: request,
			info: info,
			eventCall: eventCall
		};
	})(); // END infoCntrlr
	
	fly.infoCtrlr.init();
			
	fly.infoCtrlr.request(fly.eventCtrlr);

//--------------------- END CONTROLLERS INIT ------------//	


fly.layers.stage[0].activate(); // back to drawing layer


//--------------------- BEGIN EVENT HANDLERS ------------//
/*
*	published to event controller
*	NOTE: frame is handled by view, this must be
*	initialized on the window load
*
*	version 0.4
*/
//--------------------------------------------------------//

	fly.tool = new paper.Tool();
	
	fly.tool.onKeyDown = function (event) {
		var pub_e = "";
		if (event.key.length == 1) {
			if (event.modifiers.shift == true) {
					pub_e += "shift-";
			};
			if (event.modifiers.control == true) {
				// paper.js issue: event.key w/ control modify?
				pub_e += "control-";
			};
			if (event.modifiers.option == true) {
				pub_e += "option-";
			};
			if (event.modifiers.command == true) {
				pub_e += "command-";
			};
			if (event.modifiers.capsLock == true) {
				pub_e += "capsLock-";
			};
		};
		pub_e += event.key + "-key";
		var report = fly.eventCtrlr.publish(pub_e);
	};
	
	fly.tool.onMouseDown = function (event) {
		fly.eventCtrlr.publish("mouse down",event);
	};

	fly.tool.onMouseDrag = function (event) {
		fly.eventCtrlr.publish("mouse drag",event);
	};

	fly.tool.onMouseUp = function (event) {
		fly.eventCtrlr.publish("mouse up",event);
	};
	
	fly.tool.onMouseMove = function (event) {
		fly.eventCtrlr.publish("mouse move",event);
	};


}; // END flypaper init


//--------------------- END FLYPAPER INIT -----------------//


//------------- BEGIN FLYPAPER MATH AND MOTION ------------//
/*					
*	Math and Motion	Methods
*
*	versions 0.3 - 0.4
*/
//--------------------------------------------------------//

fly.midpoint = function (p1,p2) {
		// returns the point between two points
	var _p = new paper.Point(p1.add(p2));
	_p = _p.divide([2,2]);
	return _p;
}

fly.scatter = function (o,rect) {
		// takes an object or array of objects o 
		// and places it's center randomly within rectangle rect
		// start in lower right corner, multiply x and y by random 0 to 1
		// point will land somewhere in the rect
		// TODO: optional place within rect bounds
	if (o instanceof Array === false) {
		o = [o];
	};
	for (var i=0; i < o.length; i++) {
		var randPoint = new paper.Point(	// point at lower right corner
			rect.width,rect.height
		);
		var randLoc = randPoint.multiply(paper.Size.random()); // point within rect
		o[i].position = rect.point.add(randLoc);
	};
};

fly.randomizePt = function (point,delta,constrain) {
	// adds variance delta to point
	// constrain === "x" or "y" or default none
	var c = constrain || "none";
	if (c !== "y") {
		var x = (- delta) + (2 * delta * Math.random());
		point.x += x;
	};
	if (c !== "x") {
		var y = (- delta) +  (2 * delta * Math.random());
		point.y += y;
	};
	return point;
};

//---- methods for working with grids: myGrid[x][y]

fly.eachCell = function (o,f) {
	// call by object o to iterate through grid[x][y]
	// call: fly.eachCell(this,function (o,x,y) { ... });
	// "this" o must have this.cols and this.rows
	for (var x=0; x < o.cols; x++) {
		for (var y=0; y < o.rows; y++) {
			f(o,x,y);
		};
	};
};

fly.gridPlot = function (c,r,rectangle,dir) {
	// v.0.4
	// returns an array of arrays of points
	// c + 1 columns by r + 1 rows inside paper.rectangle r
	// last column and row run along right and bottom edges
	// dir is an optional string, which controls the direction
	// (top down, left to right etc.) that the grid travels.
	// Use this to quickly change the orientation of an object
	// aligned to a grid.
	// CHANGE: rectangle is a paper.rectangle, not a path, use
	// this.handle.bounds to send bounds 
	// note-to-self: this breaks junkaigo v 0.3.1 !!!
	// TODO: accept both a rectangle and a path.Rectangle?
	
	var dir = dir || "down-left";
	var rect = new paper.Path.Rectangle(rectangle);
	var points = [];
	for (var i=0; i <= c; i++) {
		points[i] = [];
	};
	var w = rect.bounds.width / c;
	var h = rect.bounds.height / r;
	for (var x=0; x <= c; x++) {
		for (var y=0; y <= r; y++) {
			var pt = new paper.Point( rect.bounds.x + x * w,
								rect.bounds.y + y * h);
			switch (dir) {
				case "down-right" :
				case "right" :
					points[c-x][y] = pt;
					break;
				case "up-left" :
					points[x][r-y] = pt;
					break;
				case "up-right" :
					points[c-x][r-y] = pt;
					break;
				case "down-left"  :
				default :
					points[x][y] = pt;
			}
		};
	};
	return points;
};

fly.initArray = function (c,r) {
	// init 3-d array
	var a = [];
	for (var x=0; x < c; x++) {
		a[x] = [];
		for (var y=0; y < r; y++) {
			a[x][y] = []; 
		};
	};	
	return a;
};

//--------------------- BEGIN Swing -----------------------//
/*					
*	Motion: Swing
*	version 0.3.3
*	TODO: V0.3.4 using fly.infoCtrlr.fps()
*/
//--------------------- BEGIN Swing -----------------------//

fly.Swing = function (args){
	args = args || {name:"",maxRotation:90,decay:0,timestep:.01};
	this.name = args.name + " swing" || "swing";
	this.version = "0.3.3";
	this.maxR = args.maxRotation || 90;
	this.decay = 1 + (args.decay/1000) || 1; // damping
	this.velocity = 3; // stays true to maxRot when gravity = 10, l = 1
	this.angle = 0;
	this.deg = 0;
	this.gravity = 10;
	this.l = 1; //length
	this.k = -this.gravity/this.l;
	this.timestep = args.timestep || .0001;
	this.acceleration = 0;
	this.register();
};

fly.Swing.prototype.info = function (){
	var i = {};
	i.name = this.name;
	i.version = { val: this.version, type: "version"};
	if (fly.debug) {
		// i.paperID = { val: this.handle.id, type: "val"};
		i.length = { val: this.l.toFixed(2), type: "val" };
		i.timestep = { val: this.timestep.toFixed(3), type: "val"};
		i.decay = { val: this.decay, type: "val"};
		i.velocity = { val: this.velocity.toFixed(0), type: "val"};
		i.angle = { val: this.angle.toFixed(0), type: "val"};
		i.degree = {val: this.deg.toFixed(0), type: "val"};
		i.acceleration = { val: this.acceleration.toFixed(0), type: "val" };
	};
	return i;
}

fly.Swing.prototype.register = function () {
		// TODO: how much eventCtrlr substriptions are necessary?
	fly.infoCtrlr.register(this,true);
	fly.eventCtrlr.subscribe(["mouse down","mouse drag", "mouse up", "frame","r-key", "s-key"],this);
}			

fly.Swing.prototype.add = function () {
		// v 0.1, force between 0 and 10;
	if (this.velocity > 0) {
		this.velocity += this.force / 10 ;
	}
	else if (this.velocity < 0) {
		this.velocity -= this.force / 10;
	}
};

fly.Swing.prototype.update = function () {
	this.acceleration = this.k * Math.sin(this.angle);
	this.velocity += this.acceleration * this.timestep;
	this.angle    += this.velocity * this.timestep;
	if (this.decay) {
		this.velocity /= this.decay;
	}
};

fly.Swing.prototype.rotation = function () {
	this.deg = this.angle * this.maxR;
	if (this.deg > 0 && this.deg > this.maxR) {
		this.deg = this.maxR;
		this.velocity = 0;
	}
	else if (this.deg < 0 && this.deg < -this.maxR) {
		this.deg = -this.maxR;
		this.velocity = 0;
	};
	return this.deg.toFixed(2);

};

//------------- END SWING	 ------------------------------//


//--------------------- BEGIN Scroll -----------------------//
/*					
*	Motion: Scroll
*	v 0.3.6
*					
*	Handles scrolling and object in one direction:
*		"left","right","up","down"
*/
//--------------------- BEGIN Scroll -----------------------//

fly.Scroll = function (args){
	args = args || {};
	this.name = args.name + " scroll" || "scroll";
	this.version = "0.3.6";
	this.position = args.position || new paper.Point(0,0);
	this.direction = args.direction || "left";
	this.speed = args.speed !== undefined ? args.speed : 5;
	this.curSpeed = 0;
	this.repeat = args.repeat || true;
		// when the moving point in position (x or y) reaches resetAt
		// this.reset is set to true, 
		// if repeat is true, position is set to resetPosition;
	this.reset = false;
	this.resetAt = args.resetAt || fly.width;
	this.resetPos = args.resetPos || this.position;
	this.register();
};

fly.Scroll.prototype.info = function (){
	var i = {};
	i.name = this.name;
	i.version = { val: this.version, type: "version"};
	i.position = { val: this.position, type: "val" };
	i.speed = { val: this.speed, type: "val" };
	i.curSpeed = {val: this.curSpeed, type: "val"};
	i.direction = { val: this.direction, type:"val"};
	i.repeat = {val: this.repeat, type:"bool"};
	i.reset = {val: this.reset, type:"bool"};
	return i;
}

fly.Scroll.prototype.register = function (display) {
	if (fly.debug) {
		var display = display || false;
		fly.infoCtrlr.register(this,display);
	};
}			

fly.Scroll.prototype.update = function (args) {
	this.curSpeed = args.delta * this.speed;
	switch (this.direction) {
		case "up" :
			this.position.y -= this.curSpeed;
			if (this.position.y < this.resetAt) {
				this.reset = true;
			};
			break;
		case "down" :
			this.position.y += this.curSpeed;		
			if (this.position.y > this.resetAt) {
				this.reset = true;
			};
			break;
		case "right" :
			this.position.x -= this.curSpeed;
			if (this.position.x < this.resetAt) {
				this.reset = true;
			};
			break;
		case "left":
		default : // left
			this.position.x += this.curSpeed;
			if (this.position.x > this.resetAt) {
				this.reset = true;
			};
			break;
	}
	if (this.reset === true) {
		this.position = new paper.Point(this.resetPos);
		this.reset = false;
	};
};

fly.Scroll.prototype.reposition = function (point) {
	this.position = new paper.Point(point);
};

//------------- END SCROLL	 ------------------------------//

//--------------------- BEGIN Bob -----------------------//
/*					
*	Motion: Bob
*	v 0.4
*					
*	Moves and object up and down repeatedly
*/
//--------------------- BEGIN Bob -----------------------//

fly.Bob = function (args){
	this.name = args.name + "'s motion: bob" || "bob";
	this.version = "0.4";
	this.position = new paper.Point(args.position) || new paper.Point(0,0);
	this.origin = new paper.Point(this.position);
	this.speed = args.speed !== undefined ? args.speed : 5;
	this.delta = args.delta !== undefined ? args.delta : 33;
	this.register();
};

fly.Bob.prototype.info = function (){
	var i = {};
	i.name = this.name;
	i.version = { val: this.version, type: "version"};
	i.position = { val: 
					"x: " + this.position.x.toFixed(0) +
					", y: " + this.position.y.toFixed(0), type: "val" };
	i.speed = { val: this.speed, type: "val" };
	i.delta = {val: this.delta, type:"val"};
	return i;
}

fly.Bob.prototype.register = function (display) {
	if (fly.debug) {
		var display = display || false;
		fly.infoCtrlr.register(this,display);
	};
};			

fly.Bob.prototype.reposition = function (point) {
	this.position = new paper.Point(point);
};

fly.Bob.prototype.move = function (point) {
	this.origin = new paper.Point(point);
};

fly.Bob.prototype.update = function (time) {
		// send time from frameEvent event.time
		// this keeps bobbing in real time
		var p = new paper.Point(this.origin);
		var d = Math.sin(time * this.speed) * this.delta;
		p.y += d;
		this.reposition(p);		
};


//------------- END Bob	 ------------------------------//


//------------- END FLYPAPER MATH AND MOTION	 ----------//


//--------------------- BEGIN ANANDA ---------------------//
/*					
*	abstract Class fly.Ananda
*	v 0.4
*					
* use as a drawing context and main handle for structures 
* creates an object with and optional rectangle handle
* methods:			
* - Communication with infoCtrlr & eventCtrlr	
* - dragable		
*					
* takes one parameter: 'args' which can be:
* 	a number (square size for handle),
*	a string (name),	
*	an array of numbers:
		[s] same as number,
		[w,h]:rect,
*		[x,y,s], [x,y,w,h], larger object:
*  {name:"name",handle:[...],...}	
*/
//--------------------- BEGIN ANANDA ---------------------//

fly.Ananda = function () {
	if (this.version === undefined) {
		this.version = "0.3.6";
	};
	if (this.name === undefined) {
		this.name = "Ananda ";
	};
	// empty constructor
};	

fly.Ananda.prototype.init = function (args){

	args = typeof(args) !== 'undefined' ? args : -1;
	var iA = {};	// initialization arguments
		iA.n = "";	// name
		iA.bld = "";	// build record
		iA.ds = 50; // default size

	function buildHandle() {
		if (iA.Pt === undefined) { 
			iA.Pt = new paper.Point(0,0); 
		};
		if (iA.Sz === undefined) { 
			iA.Sz = new paper.Size(iA.ds,iA.ds); 
		};
		if (iA.Rect === undefined) { 
			iA.Rect = new paper.Rectangle(iA.Pt,iA.Sz); 
		};

		iA.handle = new paper.Path.Rectangle(iA.Rect);

		iA.handle.selected = false;

		iA.handle.style = iA.style || {fillColor: 'white'};

		iA.handle.visible = iA.visible || false;	
	}
		
	function initFromNum (n) {
		if (args < 0) { // illegal value 
						// or contructed w/ no parameters
			iA.n = "born";
			iA.Sz = new paper.Size(100,100);
			buildHandle();
		} else {
			iA.n = "Numborn";
			iA.Sz = new paper.Size(n,n);
			buildHandle();
		};
		iA.bld += "n(" + n + ")";
	}

	function initFromStr (s) {
		iA.n = s;
		iA.bld += "s(" + s + ")";
	}

	function initFromNumArray (a) {
		// numbers only array
		iA.n = "NArrborn"
		iA.bld += "a["
		switch (a.length) {
		case 0 :	// empty array
			return;
		case 1 :	// use for size of square
			iA.bld += a[0];
			initFromNum(a[0]);
			return;
		case 2 :	// use as width and height
			iA.bld += a[0] + "." + a[1];
			iA.Sz = new paper.Size(a[0],a[1]);
			break;
		case 3 :	// use as point and square size
			iA.bld += a[0] + "." + a[1] + "." + a[2];
			iA.Pt = new paper.Point(a[0],a[1]);
			iA.Sz = new paper.Size(a[2],a[2]);
		break;						
		case 4 :  // use as x,y,w,h
			iA.bld += a[0] + "." + a[1] + 
				 "." + a[2] + "." + a[3];
			iA.Pt = new paper.Point(a[0],a[1]);
			iA.Sz = new paper.Size(a[2],a[3]);
		};
		iA.bld +="]";
		buildHandle();
	}

	function checkArray (a) {
			// check all elements are numbers
		var nArray = true;
		for (var i=0; i < a.length; i++) {
			if (typeof a[i] !== "number") {
				nArray = false;
				break;
			};
		};
		if (nArray) {  // array elements all numbers
			initFromNumArray(a);
		} else { 
				// todo: array of objects? [pt,size]?
			iA.n = "errorArray";  
		};
	}

	function initFromRect(h) {
		iA.Rect = new paper.Rectangle(h); 
	}

	function checkHandle (h) {
		if (typeof h === "number") {
			initFromNum(h);
		} else if (h instanceof Array) {
			checkArray(h);
		} else if (typeof h === "object" ) {
			if (h.x !== undefined && h.y !== undefined &&
				h.width !== undefined && h.height !== undefined) {
					initFromRect(h);
				};
		//	TODO:
		// if (h some kind of path) {
		};
		buildHandle();
	}

	function initFromObj (o) {
		if (o.style) { // paper.js style 
			iA.style = o.style;
		};
		if (o.visible) {
			iA.visible = o.visible;
		};
		if (o.handle) {	
			checkHandle(o.handle);
		};
		if (o.name) {
			initFromStr(o.name);
		} else {
			iA.n = "Objborn";
		};
	}
	switch (typeof args) {			
		case "number" :
			initFromNum(args);
			break;
		case "string" :
			initFromStr(s);
			break;
		case "object" :
			if (args instanceof Array) {
				checkArray(args);
			} else {
				initFromObj(args);
			};
			break;
		default :
			iA.n = "errNoType";
	}; // END switch

	this.name = iA.n;
	this.buildRecord = iA.bld;
	this.selectable = args.selectable !== undefined ? args.selectable : false;
	this.dragable = args.dragable !== undefined ? args.dragable : true;
	this.rotatable = args.rotatable !== undefined ? args.rotatable : false;
	this.moving = false;
	this.group = new paper.Group();
	if (iA.handle) {
		this.handle = iA.handle;
		this.handle.name = "handle";
		this.group.addChild(this.handle);
	};
};

fly.Ananda.prototype.info = function (){
	// override this.info to add other info,
	var i = this.anandaInfo();
	// i.foo = {val:"foo",type:"val"};
	return i;
}

fly.Ananda.prototype.anandaInfo = function () {
	var i = {};
	i.name = this.name;
	i.version = { val: this.version, type: "version"};
	if (fly.debug) {
		// i.paperID = { val: this.handle.id, type: "val"};
		i.build = { val: this.buildRecord, type: "val"};
		if (this.handle) {
			i.point = { val: this.handle.bounds.x.toFixed(2) + " x "  
							+ this.handle.bounds.y.toFixed(2), type: "val"};
			i.size = { val:  this.handle.bounds.width.toFixed(2) + " x " 
							+ this.handle.bounds.height.toFixed(2), type: "val"};
		};
		i.group = {val: this.group._children.length, type: "val"};
		i.dragable = {val: this.dragable, type: "bool"};
		i.moving = { val: this.moving, type: "bool" };
		i.selectable = { val: this.selectable, type: "bool" };
		i.selected = { val: this.group.selected, type: "bool" };
		i.rotatable = {val: this.rotatable, type:"val"};
		// i.speed = {val: this.speed().toFixed(2), type:"val"};
	};
	return i;
};

fly.Ananda.prototype.register = function (display) {
	var display = display || false;
	fly.infoCtrlr.register(this,display);
	fly.eventCtrlr.subscribe(["mouse down","mouse drag", "mouse up", "frame","r-key", "s-key"],this);
}			

//---------- Ananda: animation -----------------------------//

fly.Ananda.prototype.updateHandle = function (rect) {
		// replaces handle with one that is still dragable etc.
	var _r = rect || this.handle.bounds;
	var _s = this.handle.style;
	var _o = this.handle.opacity;
	var _v = this.handle.visible;
	this.handle.remove();
	this.handle = new paper.Path.Rectangle(_r);
	if (this.group.selected === true) {
		this.handle.selected = true;	
	};
	this.handle.style = _s;
	this.handle.opacity = _o;
	this.handle.visible = _v
	this.group.addChild(this.handle);
};

fly.Ananda.prototype.toggleDisplay = function (){
	this.group.visible = !this.group.visible;
}

fly.Ananda.prototype.toggleSelected = function () {
	if (fly.debug && this.selectable) {
		this.group.selected = !this.group.selected;		
	};
}

fly.Ananda.prototype.grab = function (event) {
	// WARNING: trying to drag an invisible handle if it is the only
	//			member of this.group will produce an error, make
	//			handle visible first if you need to drag it around.
	// dragging by handle if it has one (efficiency etc.)
	// override if you want a handle but not for hitTests
	// requires redrawing based on handle location;
	if (this.handle) { // drag by handle not by group
		if (this.handle.hitTest(event.point)) {
			this.moveOrigin = event.point.subtract(this.handle.bounds.center);
			this.moving = true;
		}
	} else
	 if (this.group.hitTest(event.point)) {
		this.moveOrigin = event.point.subtract(this.group.bounds.center);
		this.moving = true;
	};
};

fly.Ananda.prototype.drag = function (event) {
	// don't move it if it's under a visible info controller
	if (this.moving && this.dragable && fly.infoCtrlr.moving() === false) {
		this.group.position = event.point.subtract(this.moveOrigin);
	};
};

fly.Ananda.prototype.drop = function (event) {
	this.moving = false;
};

fly.Ananda.prototype.rotate = function (deg) {
	if (this.rotatable) {
		deg = deg || 3;
		this.group.rotate(deg,this.handle.bounds.center);
	};
};

fly.Ananda.prototype.update = function (args) {
	// empty call, replace in concrete classes...
};

fly.Ananda.prototype.eventCall = function (e,args) {
	switch (e) {
		case "r-key" :
			this.rotate();
			break;
		case "s-key" :
			this.toggleSelected();
			break;
		case "frame" :
			this.update(args);
			break;
		case "mouse down" :
			this.grab(args);
			break;
		case "mouse drag" :
			this.drag(args);
			break;
		case "mouse up" :
			this.drop(args);
			break;
	default :
	};
};

//--------------------- END Ananda -------------------------//


//--------------------- BEGIN Pullbar ---------------------//
/*					
*	Pullbar extends Ananda, creates grabbable handles
*					
* 	adaptation of vektor.js from:
*	http://paperjs.org/tutorials/geometry/vector-geometry/
*					
* 	args = {	fixLength:bool,fixAngle:bool,
*			this.visible: bool,
*			vectorCtr:point,
*			vector:point,	// length from center
*			handle: see ananda // creates pullBall size
*			color: #e4141b  // any valid color val
*		 }			
*
*	version 0.3.6				
*/
//--------------------- BEGIN Pullbar --------------------//

fly.Pullbar = function (args){
	this.version = "0.4";
	var args = args || {};
	args.name = args.name + "'s pullbar" || "pullbar";
	if (args.handle === undefined) { 
		args.handle = 10; // default size = 50;
	};
	fly.Ananda.call(this);
	this.init(args);
	this.fixLength = args.fixLength || false;
	this.fixAngle = args.fixAngle || false;
	this.vectorCtr = args.vectorCtr || new paper.Point(paper.view.center);	
	this.vector = args.vector || new paper.Point(0,0);
	this.color = args.color || '#E4141B';
	this.selected = args.selected || false;
	this.vectorPrevious = this.vector;
	this.joints = [];
	this.build();
	this.draw();
	this.moving = false;
	this.register();
};

fly.Pullbar.prototype = new fly.Ananda;

fly.Pullbar.prototype.constructor = fly.Pullbar;

fly.Pullbar.prototype.info = function (){
	var ia = this.anandaInfo();
	var i = {};
		i.name = ia.name;
		i.moving = ia.moving;
		i.selected = { val: this.selected, type: "bool" };
	if (fly.debug) {
		i.fixedLength = {val: this.fixLength, type:"bool"};
		i.fixedAngle = {val: this.fixAngle, type:"bool"};
		i.vectorStart = {val: this.vectorCtr, type: "val"};
		i.vector = {val: this.vector, type: "val"};
		if (this.vector) {
			i.vectorLength = {val: this.vector.length.toFixed(2), type: "val"};
			i.vectorAngle = {val: this.vector.angle.toFixed(2), type: "val"};
		};
		i.vectorPrevious = {val: this.vectorPrevious, type: "val"};
	};
	return i;
}

fly.Pullbar.prototype.register = function (display) {
	display = display || false;
	fly.infoCtrlr.register(this,display);
	fly.eventCtrlr.subscribe(["mouse down","mouse drag", "mouse up", "s-key"],this);
}			

fly.Pullbar.prototype.toggleSelected = function (state) {
	// state is an optional bool
	// change selected state to state, or toggle if no arg sent
	if (state !== undefined) {
		this.selected = state;
	} else {
		this.selected = !this.selected;
	}
	this.group.visible = this.selected;
}

fly.Pullbar.prototype.locate = function (point) {
	this.vectorCtr = point || this.vectorCtr;
	this.joints[0] = this.vectorCtr; // center joint
	this.joints[1] = this.vectorCtr.add(this.vector); // end 1
	this.joints[2] = this.vectorCtr.subtract(this.vector); // end 2
	this.handle.position = this.joints[1];
	return this.handle.bounds.center;
};

fly.Pullbar.prototype.reposition = function (point) {
	// move the pullbar to point and redraw
	// this is intended as a public method
	this.locate(point);
	this.draw();
};

fly.Pullbar.prototype.build = function () {
	this.locate();
	this.bones = [];  // 0:center, 1:bar, 2 & 3:handles
	this.bones[0] = new paper.Path.Circle(this.joints[0], 3); // center 
	this.bones[1] = new paper.Path([this.joints[0],this.joints[1]]); // pull bar
	this.bones[1].strokeWidth = 1.75;
	this.bones[1].strokeColor = '#e4141b';
	
	var o1 = new paper.Path.Oval(this.handle.bounds);  // first grip handle
	var o2 = o1.clone();
	o2.scale(.5,o2.bounds.center);
	this.bones[2] = new paper.Group([o1,o2]);
	this.bones[3] = this.bones[2].clone();   // second grip handle
	this.bones[3].position = this.joints[1];
	for (var i=0; i < this.bones.length; i++) {
		this.bones[i].strokeWidth = 1.75;
		this.bones[i].strokeColor = this.color;
		this.bones[i].fillColor = 'white';
	};
	this.bones[0].fillColor = this.color;
	this.handle.remove(); // no more need for the handle
	this.group.addChildren(this.bones);
	this.group.visible = this.visible;
};

fly.Pullbar.prototype.processVector = function (point) {
	// 
    this.vector = point.subtract(this.vectorCtr);
	if (this.vectorPrevious) {
        if (this.fixLength && this.fixAngle) {
            this.vector = this.vectorPrevious;
        } else if (this.fixLength) {
            this.vector.length = this.vectorPrevious.length;
        } else if (this.fixAngle) {
            this.vector = this.vector.project(this.vectorPrevious);
        }		
	};
	this.locate();
    this.draw();
};

fly.Pullbar.prototype.draw = function () {
	this.bones[0].position = this.joints[0];
	this.bones[1].segments[0].point = this.joints[1];
	this.bones[1].segments[1].point = this.joints[2];
	this.bones[2].position = this.joints[1];
	this.bones[3].position = this.joints[2];
};

fly.Pullbar.prototype.grab = function (event) {
	if (this.selected) {
		if (this.bones[2].hitTest(event.point) ||
			this.bones[3].hitTest(event.point)) {
			this.moving = true;
		    this.processVector(event.point);
		};
	};
};

fly.Pullbar.prototype.drag = function (event) {
	if (this.moving === true) {
		if (!event.modifiers.shift && this.fixLength && this.fixAngle) {
			this.vectorCtr = event.point;		
		};
		this.processVector(event.point);
	};
};

fly.Pullbar.prototype.drop = function (event) {
	if (this.moving === true) {
		this.processVector(event.point);
		// if (this.dashItem) {
		//	this.dashItem.dashArray = [1, 2];
		//	this.dashItem = null;
		// }
		this.vectorPrevious = this.vector;
		this.moving = false;
	};
};

//--------------------- END Pullbar -----------------------//
