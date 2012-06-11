//--------------------- BEGIN FLYPAPER ---------------------//
/*
*			Namespace FLYPAPER
*			abbreviated: fly
*				v 0.3.6
*								
* flypaper init() creates a drawing and animation context
* using the paper.js library
*	
* fly.init() includes:
* all internal variables for style, size etc.
* three layers: background, stage, and info
*	
* - infoCtrlr() for info regarding all objects
* - eventCtrlr() for pub/sub and event handling
*
//--------------------- BEGIN FLYPAPER --------------------//

/* global paper */

"use strict"

var fly = fly == undefined ? {} : fly ;
if (typeof fly !== "object") {
	throw new Error("fly is not an object!");
}

//--------------------- BEGIN FLYPAPER INIT -----------------//
/*
*						FLYPAPER INIT v0.3.6
*	inits the canvas for all drawing
*	contains eventCtrlr and infoCtrlr	
*	accepts args: {	
*		width: canvas width
*		height: canvas height
*		}			
*/
//--------------------- BEGIN FLYPAPER INIT ---------------//


fly.init = function (args) {
	fly.name = "flypaper";
	fly.version = "0.3.6";
	if (args === undefined) {
		args = {};
	};
	fly.debug = false; // turns on extra debug info	
	fly.width = args.width || 600; // canvas width
	fly.height = args.height || 600; // canvas width
	
	paper.view.viewSize = new paper.Size(fly.width,fly.height);
	
	if (args.color === undefined) {
		args.colors = {};
	};
	//	 TODO: CREATE COLOR FUNCTION THAT CREATES COLOR SET
	fly.colors = {	// add any presets colors here
		bkg: ["#00A9EB","#B0E5FF"], 
		main: ["#FDE8A3","#8A8A39","#C6F063","#FF77CD"],
		outln: ["#666666"],
		selected: [],
		info:{	title:	"#9BCAE1",	// sky blue
				val:	"#89C234",	// apple green
				btrue: "#66FF99",	// aqua
				bfalse: "#3D9199", // dull aqua
				event:	"#BC4500",
				eventFiring: "#FF5E00",
				version:"#8A8A39",	// pine green
				info:	"#8A8A39",
				screen: "#0D1927",	// skim mil
				bar:	"black"
			}
	}; 
	
	fly.layers = {};	// add new layers to fly.layers
						// init creates three layers:
						// fly.layers.background w/ 1 colored square
						// fly.layers.stage for main drawing
						// fly.layers.info for info panel

	fly.layers.background = paper.view.activeLayer;

	var bkg = new paper.Path.Rectangle(paper.view.bounds);
	if (fly.colors.bkg) {
		bkg.fillColor = fly.colors.bkg[0];
	};

	fly.layers.backstage = new paper.Layer();	
	fly.layers.stage = new paper.Layer(); 
		// after info layer is created we step
		// back to this one for all drawing
	fly.layers.frontstage = new paper.Layer();

/*
*	CONTROLLERS -- Init InfoController and EventController 
*/

	fly.layers.info = new paper.Layer();
	
	fly.info = function() {
		// fly namespace is the first member of fly.infoCtrlr
			var i = {};
			i.name = fly.name;
			i.version = { val: fly.version, type: "version"};
			i.debug = { val: fly.debug, type: "bool" };
			i.width = { val: fly.width, type: "val" };
			i.height = { val: fly.height, type: "val" };
			i.keys = {val: "[i]nfo, [s]elect, [r]otate", type: "string" };
			return i;
	};
							
	fly.eventCtrlr = (function () {
	// v0.3.6
	// eventCtrlr is the main pub/sub object, paper events
	// all publish through it, objects listening for events
	// SUBSCRIBE to events with: 
	//		fly.eventCtrlr.subscribe("event",this);
	// See fly.Ananda.prototype.register for an example.
	// common events include: 
	// "mouse down","mouse drag", "mouse up",	
	// "frame", and "x-key" where x is any key
	// PUBLISH events with:
	// fly.eventCtrlr.publish("mouse down",event);
	// mouse and key events are handled with paper tools
	// within flypaper.
	  
	// IMPORTANT! On-frame events must be initaited
	// in the main javascript on window load. Use:	
	// paper.view.onFrame = fu*c*ion(event) {
	//		fly.eventCtrlr.publish("frame");
	//	};

	// TODO: frame beats needs better implementation
	// should it be every x frames or every x ms ?
	
		var name = "eventCtrlr",
			version = "0.3.6",
			events = {},
			beats = [], // register for beats (2,4,8, etc.)
			beat = 1,
			maxBeats = 128,
			frameRegex = /frame \d+/,
			firing = {}, //  used by isFiring
			firePulse = 10, // isFiring countdown
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

		function frameBeats() {
			if (beat > maxBeats) {
				beat = 1
			};
			for (var i=0; i < beats.length; i++) {
				if (beat % beats[i] === 0) {
						// question, why does this work with "frame", not "frame "?
					var frito = "frame" + beats[i];
					publish(frito);
				};
			};
			beat++;
		}

		function publish(e,args) {
			if (fly.debug) {
				isFiring(e);
			};
			if (e === "frame") {
				frameBeats();
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
					// check if its a beat:
					if (e[i].match(frameRegex)) {
						beats.push(e[i].slice(5))
					};
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
				// beatCount: {val: beat, type: "val"},
				// beats: {val: beats, type: "array"},
				errors: {val: errors.length, type: "val"}
			};
			var event;
			for (event in events) {
				if (firing[event] > 0) {
					var _t = "eventFiring";
				} else {
					var _t = "event";
				};
				i[event] = {val: events[event].length, type: _t};
			}
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
	// v 0.3.6
	// new objects can register as a member with infoCtrlr 
	// by sending the request: fly.infocontroller.register(this);
	// optional second boolean parameter display: (this,false)
	// will initialize this objects panel as open or closed.
	// On frame events, infoCtrlr sends a request to members
	// for an info packet.  v0.2 infopackets are of the form:
	// { name: "name", info1:{val:"info",type:"val"},...}
	// infoCtrlr will attempt to match the type to a type in
	// fly.colors.info for a color for that type.
			
		var name = "infoCtrlr";
		var version = "0.3.6";
		 // fly is members[0], infoCtlr is member[1] after infoCtrlr.init();
		var members = [{obj:fly,display:false}];
		var style = {};
			style.c1 = fly.colors.info.title || 'black';
			style.c2 = fly.colors.info.val || 'red';
			style.s = fly.colors.info.screen || 'grey';
			style.sb = fly.colors.info.bar || 'white';
			style.size = 10;
			style.spacing = style.size * 1.75;
			style.offset = style.size;
			style.opacity = .75;
		var ibox = {};
			ibox.handle = {}; // for move events
			ibox.origin = new paper.Point(10,10);
			ibox.txtOffset = [10,35];
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

			// time.Ccur = 0;
			// time.average = 0;
			// time.fps = 0; // frames per second
			// time._c = 0; // time counter
			// time._t1 = 0; // time 1
			// time._t2 = 0; // time 2
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
				["i-key","frame","mouse down","mouse drag","mouse up"],this
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
				text.fillColor = style.c1;
			} else if (val === "closedTitle") {
				_t += "\u25B6 " + key; // right triangle
				text.fillColor = style.c1;
				ibox.cursor.y += 2;
			} else {	// styles for other items
				var _s;	// style by type
				if (val.type === "bool") {
					_s = "b" + val.val; // btrue or bfalse
				} else {
					_s = val.type;
				};
				if (fly.colors.info[_s] !== undefined) {
					text.fillColor = fly.colors.info[_s];
				} else {
					text.fillColor = style.c2;
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
					bar.fillColor = style.sb;
				bar.opacity = .50; 
				infoGroup.bars.addChild(bar);
			};			
		}

		function drawGrip() {
			var _s2 = new paper.Size( ibox.boxWidth, 30);
			var grip = new paper.Path.Rectangle(ibox.origin, _s2);
			grip.name = "grip";
			grip.fillColor = style.s; // needs fill to work!
			grip.visible = false;
			infoGroup.box.addChild(grip);
						
			for (var i=0; i < 7; i++) {
				var from = new paper.Point(ibox.origin.x, ibox.origin.y + 3 * i + 2);
				var to = new paper.Point(from.x + ibox.boxWidth, from.y);
				var gripLine = new paper.Path.Line(from, to);
				gripLine.strokeColor = 'black';
				gripLine.strokeWidth = 2;
				gripLine.opacity = .4;
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
			screen.fillColor = style.s;
			screen.opacity = style.opacity; 
			infoGroup.box.addChild(clipper);
			infoGroup.box.addChild(screen);
			infoGroup.box.clipped = true;
			drawGrip();
			drawBars();
			fly.layers.info.visible = ibox.visible;
		}
		
		//------------------- animation ----------------------//

		function toggleDisplay(){
			ibox.visible = !ibox.visible;
		}
		
		function grab(point){
			// ignore if not visible, else animate arrows and dragging
			if (!fly.layers.info.visible) {
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
			i.members = { val: members.length, type:"val"}
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
			if (fly.layers.info.visible || ibox.visible) { 
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
			case "i-key" :
				if (fly.debug) {
					toggleDisplay();
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
// temp patch
			fps : function () { return time.fps.ave; }, 
//  temp patch 
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

	fly.layers.stage.activate(); // back to drawing layer
	
/*
*	END CONTROLLERS -- InfoController and EventController
*/


/*
*	INIT EVENT HANDLER TOOLS -------------------------------//
*		published to event controller
*		NOTE: frame is handled by view, this must be
*		initialized on the window load
*		frameCounter takes "frame" events and breaks
*		them into beats: every : 2,4,8,16,32,64,128
*/
	fly.tool = new paper.Tool();
	
	fly.tool.onKeyDown = function (event) {
		var pub_e = event.key + "-key";
		var report = fly.eventCtrlr.publish(pub_e);
		paper.view.draw();
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

/*
*	END FLY TOOL --------------------------------------//
*/

}; // END flypaper init


//--------------------- END FLYPAPER INIT -----------------//


//------------- BEGIN FLYPAPER MATH AND MOTION ------------//
/*					
*				Math and Motion	Methods
*				v 0.3.6
*/
//------------- BEGIN FLYPAPER MATH AND MOTION ------------//

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
	// v 0.3.6
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
	// v.0.3.6
	// returns an array of arrays of points
	// c + 1 columns by r + 1 rows inside paper.rectangle r
	// last column and row run along right and bottom edges
	// dir is a bool, false reverses the grid right to left
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
	// v.0.3.0	
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
*				Motion: Swing
*				v 0.3.3
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
*				Motion: Scroll
*				v 0.3.6
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
*				Motion: Bob
*				v 0.3.6
*					
*	Moves and object up and down repeatedly
*/
//--------------------- BEGIN Bob -----------------------//

fly.Bob = function (args){
	this.name = args.name + " bob" || "bob";
	this.version = "0.3.4";
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
	i.position = { val: this.position, type: "val" };
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
*				abstract Class fly.Ananda
*				v 0.3.6
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
		iA.dv = 50; // default size
		
	function buildHandle() {
		if (iA.Pt === undefined) { 
			iA.Pt = new paper.Point(0,0); 
		};
		if (iA.Sz === undefined) { 
			iA.Sz = new paper.Size(iA.dv,iA.dv); 
		};
		if (iA.Rect === undefined) { 
			iA.Rect = new paper.Rectangle(iA.Pt,iA.Sz); 
		};

		iA.handle = new paper.Path.Rectangle(iA.Rect);

		iA.handle.selected = false;

		iA.handle.style = iA.style || {fillColor: fly.colors.main[0]};

		iA.handle.visible = iA.visible || false;	
	}
		
	function initFromNum (n) {
		if (args < 0) { // illegal value 
						// or contructed w/ no parameters
			iA.n = "NaNborn";
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
		i.dragable = {val: this.dragable, type: "val"};
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
	if (this.handle) {
		if (this.moving && this.dragable && fly.infoCtrlr.moving() === false) {
			this.handle.position = event.point.subtract(this.moveOrigin);
		};
	};
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
*				v 0.3.6
* Pullbar extends Ananda, creates grabbable handles
*					
* adaptation of vektor.js from:
* http://paperjs.org/tutorials/geometry/vector-geometry/
*					
* args = {	fixLength:bool,fixAngle:bool,
*			this.visible: bool,
*			vectorCtr:point,
*			vector:point,	// length from center
*			handle: see ananda // creates pullBall size
*			color: #e4141b  // any valid color val
*		 }			
*					
*/
//--------------------- BEGIN Pullbar --------------------//

fly.Pullbar = function (args){
	this.version = "0.3.6";
	var args = args || {};
	args.name = args.name + " pullbar" || "pullbar";
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
