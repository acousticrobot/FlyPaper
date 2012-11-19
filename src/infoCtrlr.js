/*
 * This file is part of the flypaper.js build.
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

/*
 * ## InfoCtrlr (IC)
 * The info controller allows information to be displayed
 * in a window within the canvas.  Objects register to
 * be tracked by the IC. They must have a method info
 * which returns an info packet to the IC.
 * ### register
 * New objects can register as a member with infoCtrlr
 * by sending the request: fly.infocontroller.register(this);
 * optional second boolean parameter display: (this,false)
 * will initialize this objects panel as open or closed.
 * ### info method
 * On frame events, infoCtrlr sends a request to members
 * for an info packet.	Info packets are of the form:
 * { name: "name", var1:{val: var1, type:"val"},var2:{..}..},
 * See info in grantinfo for details on the info packet.
 */

fly.infoCtrlrInit = function(infoPrefs) {
	
	var events, key;

	fly.infoCtrlr = (function(infoPrefs) {

		var name = 'Info Controller';
		var version = '0.5beta';
		// register members who already exist
		var members = [ {
			obj : fly,
			display : false
		}, {
			obj : fly.eventCtrlr,
			display : false
		}, {
			obj : fly.layers,
			display : false
		}, {
			obj : fly.color,
			display : false
		} ];
		infoPrefs = infoPrefs || {};
		if (fly.color.palette === 'not yet defined') {
			fly.colorPalette('default');
		}
		var keyTrigger = infoPrefs.keyTrigger || 'i-key';
		var style = {},
			fullcolor = true,
			// check that we have all the colors needed
			colors = ['blue', 'grey', 'green', 'orange', 'red', 'purple'];
		for ( var i = 0; i < colors.length; i++) {
			if (!fly.color[colors[i]] || fly.color[colors[i]].length < 8) {
				fullcolor = false;
				break;
			}
		}
		if (fullcolor) {
			// base text colors:
			style.titles = infoPrefs.titleBar || fly.color.blue[7];
			style.plain = fly.color.grey[4] || '#89C234';
			// screen and bar colors:
			style.screen = infoPrefs.screen || fly.color.grey[1];
			style.screenBars = infoPrefs.screenBars || fly.color.grey[0];
			// colors matching value types:
			style.val = infoPrefs.val || fly.color.green[2];
			style.string = infoPrefs.string || fly.color.grey[4];
			style.btrue = infoPrefs.btrue || fly.color.orange[6];
			style.bfalse = infoPrefs.bfalse || fly.color.orange[3];
			style.event = infoPrefs.event || fly.color.red[4];
			style.eventFiring = infoPrefs.eventFiring || fly.color.red[7];
			style.version = infoPrefs.version || fly.color.grey[5];
			style.info = infoPrefs.info || fly.color.blue[7];
		} else {
			// base text colors:
			style.titles = infoPrefs.titleBar || '#9BCAE1';
			style.plain = '#89C234';
			// screen and bar colors:
			style.screen = infoPrefs.screen || '#0D1927';
			style.screenBars = infoPrefs.screenBars || 'black';
			// colors matching value types:
			style.val = infoPrefs.val || '#89C234';
			style.string = infoPrefs.string || '#691BE2';
			style.btrue = infoPrefs.btrue || '#66FF99';
			style.bfalse = infoPrefs.bfalse || '#3D9199';
			style.event = infoPrefs.event || '#BC4500';
			style.eventFiring = infoPrefs.eventFiring || '#FF5E00';
			style.version = infoPrefs.version || '#8A8A39';
			style.info = infoPrefs.info || '#CCB599';
		}
		// font styles
		style.size = infoPrefs.size || 11;
		style.spacing = style.size * 1.75;
		style.offset = style.size;
		style.opacity = infoPrefs.opacity || 0.95;
		// info panel styles
		var ibox = {};
		ibox.handle = {}; // for move events
		ibox.origin = new paper.Point(10, 10);
		ibox.txtOffset = [ style.size, style.size * 3.5 ];
		ibox.txtOrigin = ibox.origin.add(ibox.txtOffset);
		ibox.txtLen = 0;
		ibox.txtWidth = 0;
		ibox.titleBars = [];
		ibox.visible = fly.debug; // start visible in debug mode
		// set up path groups for drawing
		var infoGroup = [];
		infoGroup.box = new paper.Group();
		infoGroup.bars = new paper.Group();
		infoGroup.txt = new paper.Group();
		var moving = false;
		// time counter, eventually to base speed on environment
		var _time = {};
		_time.refresh = 0;
		_time.frame = 0;
		_time.time = 0;
		_time.fps = {
			curr : 0,
			avg : 0
		};
		var device = {}; // for device detection
		device.isIpad = navigator.userAgent.match(/iPad/) !== null;
		device.isMobile = (function() {
			var user = navigator.userAgent.toLowerCase();
			var agents = /android|webos|iphone/;
			if (user.match(agents)) {
				return true;
			}
			return false;
		})();

		// ------------------- registration --------------------//

		function register(o, d) {
			// override register function from grantInfo
			// the IC gets requests via register,
			// everything else requests via resister to the IC
			d = typeof (d) !== 'undefined' ? d : false;
			// new objects register to become a member
			for ( var i = 0; i < members.length; i++) {
				if (members[i].obj === o) {
					return 'error: object already exists';
				}
			}
			members.push( {
				obj : o,
				display : d,
				info : {}
			});
			updateInfo(true);
			resetBars();
		}

		function deregister(o) {
			for ( var i = 0; i < members.length; i++) {
				if (members[i].obj === o) {
					members.splice(i, 1);
					return;
				}
			}
			reset();
		}

		// ------------------- drawing -------------------------//

		function reset() {
			ibox.txtWidth = 0;
			updateInfo(true);
			resetBars();
		}

		function printTxtLine(key, val) {
			// printText() sends:
			// (name,'openTitle) or (name,'closedTitle')
			// or (key,{v:val,t:type})
			if (key === undefined || val === undefined) {
				return 'Error printing info';
			}
			updateWidth(key, val);
			var text = new paper.PointText(ibox.cursor);
			text.paragraphStyle.justification = 'left';
			text.characterStyle.fontSize = style.size;
			var _t = '';
			if (val === 'openTitle') {
				// object name line, style as title
				_t += '\u25BC  ' + key; // down triangle
				text.fillColor = style.titles;
			} else if (val === 'closedTitle') {
				_t += '\u25B6 ' + key; // right triangle
				text.fillColor = style.titles;
				ibox.cursor.y += 2;
			} else { // styles for other items
				var _s; // style by type
				if (val.type === 'bool') {
					_s = 'b' + val.val; // btrue or bfalse
				} else {
					_s = val.type;
				}
				if (style[_s] !== undefined) {
					text.fillColor = style[_s];
				} else {
					text.fillColor = style.plain;
				}
				_t += key + ': ' + val.val;
			}
			text.content = _t;
			infoGroup.txt.addChild(text);
			ibox.cursor.y += style.spacing;
		}

		function printText() {
			// starting at text origin point
			// create each new line of text
			ibox.cursor = new paper.Point(ibox.txtOrigin);
			for ( var i = 0; i < members.length; i++) {
				// add location to titleBar array
				setBars();
				if (members[i].display === true) {
					// add line with name
					printTxtLine(members[i].info.name, 'openTitle');
					// if member's display, make line for each in
					for ( var item in members[i].info) {
						if (item !== 'name') {
							printTxtLine(item, members[i].info[item]);
						}
					}
				} else {
					printTxtLine(members[i].info.name, 'closedTitle');
				}
			}
		}

		function resetBars() {
			ibox.titleBars = [];
		}

		function setBars() {
			// for collapsable bars behind titles
			// called from printText as titles are printed
			if (ibox.titleBars.length !== members.length) {
				var _p = new paper.Point(ibox.cursor.x - style.offset,
						ibox.cursor.y - 1.2 * style.offset);
				ibox.titleBars.push(_p);
			}
		}

		function drawBars() {
			for ( var i = 0; i < ibox.titleBars.length; i++) {
				var _s = new paper.Size(ibox.txtWidth + 2 * style.offset,
						style.spacing);
				var bar = new paper.Path.Rectangle(ibox.titleBars[i], _s);
				bar.fillColor = style.screenBars;
				bar.opacity = 0.50;
				infoGroup.bars.addChild(bar);
			}
		}

		function drawGrip() {
			var _s2 = new paper.Size(ibox.boxWidth, 30);
			var grip = new paper.Path.Rectangle(ibox.origin, _s2);
			grip.name = 'grip';
			grip.fillColor = style.plain; // needs a fill color to work!
			grip.visible = false;
			infoGroup.box.addChild(grip);

			for ( var i = 0; i < 7; i++) {
				var from = new paper.Point(
						ibox.origin.x,
						ibox.origin.y + 0.3 * style.size * i + 2);
				var to = new paper.Point(from.x + ibox.boxWidth, from.y);
				var gripLine = new paper.Path.Line(from, to);
				gripLine.strokeColor = style.screenBars;
				gripLine.strokeWidth = 2;
				infoGroup.box.addChild(gripLine);
			}
		}

		function drawBox() {
			ibox.txtWidth = ibox.txtLen * style.size * 0.68;
			ibox.boxWidth = ibox.txtWidth + 2 * style.offset;
			var _s = new paper.Size(
					ibox.boxWidth,
					ibox.cursor.y - ibox.origin.y - style.offset);
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
			fly.layer('info').visible = ibox.visible;
		}

		// ------------------- animation ----------------------//

		function toggleDisplay() {
			if (fly.debug) {
				ibox.visible = !ibox.visible;
				if (ibox.origin.x < 1 || ibox.origin.x > fly.height ||
						ibox.origin.y < 1 || ibox.origin.y > fly.width) {
						ibox.origin.x = 10;
						ibox.origin.y = 10;
						ibox.txtOrigin = ibox.origin.add(ibox.txtOffset);
						resetBars();
				}
			}
		}

		function grab(args) {
			var point = args.point;
			// ignore if not visible, else animate arrows and dragging
			if (!fly.layer('info').visible) {
				return;
			}
			for ( var i = 0; i < infoGroup.bars.children.length; i++) {
				if (infoGroup.bars.children[i].hitTest(point)) {
					members[i].display = !members[i].display;
					reset(); // clear & force reset;
				}
			}
			if (infoGroup.box.children['grip'].hitTest(point)) {
				ibox.handle.or = point.subtract(ibox.origin);
				moving = true;

			}
		}

		function drag(args) {
			var point = args.point;
			if (moving) {
				ibox.origin = point.subtract(ibox.handle.or);
				ibox.txtOrigin = ibox.origin.add(ibox.txtOffset);
				resetBars();
			}
		}

		function drop(args) {
			var point = args.point;
			moving = false;
		}

		function updateWidth(key, value) {
			// approximates width needed for info box
			key = key || 0;
			value = value || 0;
			key = key.toString() || 0;
			value = value.toString() || 0;
			var _l = key.length + value.length;
			if (_l > ibox.txtLen) {
				ibox.txtLen = _l;
			}
			if (ibox.txtLen > 50) {
				ibox.txtLen = 50;
			}
		}

		// ------------------- information collection ---------//

		function updateTime(args) {
			_time.frame = args.count; // frames since start
			_time.time = args.time; // seconds since start
			if (args.time - _time.refresh > 0.1) {
				_time.refresh = args.time;
				_time.fps.avg = _time.frame / _time.time;
				_time.fps.curr = 1 / args.delta;
			}
		}

// NOTE: info is now controlled via grantInfo methods for the IC as well
// this is here to view past info monitoring, once time is adjusted,
// this can be removed

//		function info() {
//			// for self-monitoring, also a model for member's info method
//			var _i = {};
//			_i.name = name;
//			_i.version = {
//				val : version,
//				type : 'version'
//			};
//			_i.origin_pt = {
//				val : ibox.origin,
//				type : 'val'
//			};
//			_i.members = {
//				val : members.length,
//				type : 'val'
//			};
//			// _i.width = { val: ibox.txtWidth.toFixed(2), type: 'val' };
//			_i.frame = {
//				val : _time.frame,
//				type : 'val'
//			};
//			_i.time = {
//				val : _time.time.toFixed(2),
//				type : 'val'
//			};
//			_i.fpsAve = {
//				val : _time.fps.avg.toFixed(2),
//				type : 'val'
//			};
//			_i.fpsCurr = {
//				val : _time.fps.curr.toFixed(2),
//				type : 'val'
//			};
//			// _i.moving = { val: moving, type: 'bool' };
//			_i.mobile = {
//				val : device.isMobile,
//				type : 'bool'
//			};
//			_i.ipad = {
//				val : device.isIpad,
//				type : 'bool'
//			};
//			return _i;
//		}

		function updateInfo(force) {
			// v 0.3.6
			// gather most recent info
			// from members with display === true
			// use force === true on resistration or to update all
			// this is used to adjust width of box to length of info
			for ( var i = 0; i < members.length; i++) {
				if (members[i].display || force) {
					members[i].info = members[i].obj.info();
					if (force) { // recheck max width of infobox
						var key;
						for (key in members[i].info) {
							if (members[i].info.hasOwnProperty(key)) {
								try {
									if (key === 'name') {
										updateWidth('name',
												members[i].info.name);
									} else {
										updateWidth(key,
												members[i].info[key].val);
									}
								} catch (ex) {
									return (ex);
								}
							}
						}
					}
				}
			}
		}

		function update(args) {
			updateTime(args);
			// only update panel if visible or visibility has changed
			if (fly.layer('info').visible || ibox.visible) {
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
			}
		}

//		function eventCall(e, args) {
//			switch (e) {
//			case keyTrigger:
//				if (fly.debug) {
//					toggleDisplay();
//					// make sure handle isn't off screen:
//					if (ibox.origin.x < 1 || ibox.origin.x > fly.height ||
//						ibox.origin.y < 1 || ibox.origin.y > fly.width) {
//						ibox.origin.x = 10;
//						ibox.origin.y = 10;
//						ibox.txtOrigin = ibox.origin.add(ibox.txtOffset);
//						resetBars();
//					}
//				}
//				break;
//			case 'frame':
//				update(args);
//				break;
//			case 'mouse down':
//				grab(args.point);
//				break;
//			case 'mouse drag':
//				drag(args.point);
//				break;
//			case 'mouse up':
//				drop(args.point);
//				break;
//			default:
//			}
//		}

		return {
			name: name,
			version: version,
			'key trigger': keyTrigger,
			members: members,
			numMembers: function(){
				return members.length;
			},
			// time information:
			frame : function() {
				return _time.frame;
			},
			time : function() {
				return _time;
			},
			"time passed": function () {
				return _time.time.toFixed(1);
			},
			fps: function() {
				return _time.fps.curr.toFixed(1);
			},
			fpsAvg: function() {
				return _time.fps.avg.toFixed(1);
			},
			moving : function() {
				return moving;
			},
			isMobile : function() {
				return device.isMobile;
			},
			isIpad : function() {
				return device.isIpad;
			},
			update: update,
			register : register,
			deregister : deregister,
			toggleDisplay : toggleDisplay,
			grab: grab,
			drag: drag,
			drop: drop
//			eventCall : eventCall
		};

	})(infoPrefs); // END infoCntrlr construction

	// ------------------- initialize ----------------------//

	fly.grantString(fly.infoCtrlr);
	fly.grantInfo(fly.infoCtrlr).addInfo({
		'key trigger': { val: 'key trigger', type: 'val' },
		'members' : { val: 'numMembers', type: 'func' },
		'time passed' : {val: 'time passed', type: 'func'},
		'frames per second' : {val: 'fps', type: 'func'},
		'fps average' : {val: 'fpsAvg',type: 'func'},
//		'moving': {val: 'moving', type: 'func'}
		'mobile': {val: 'isMobile', type: 'func'},
		'ipad' : {val: 'isIpad', type: 'func'}
	});
	fly.infoCtrlr.register(fly.infoCtrlr);
	events = {
		'frame': "update",
		'mouse down': 'grab',
		'mouse drag': 'drag',
		'mouse up' : 'drop'
	},
		key = fly.infoCtrlr['key trigger'];
	events[key] = "toggleDisplay";
	fly.grantEvents(fly.infoCtrlr).registerEvent(events);
	fly.infoCtrlr.toggleDisplay();
//	fly.eventCtrlr.subscribe( [ fly.infoCtrlr['key trigger'], 'frame', 'mouse down',
//			'mouse drag', 'mouse up' ], fly.infoCtrlr);
	
}; // END infoCntrlrInit

