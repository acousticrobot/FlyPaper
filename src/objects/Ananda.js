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
*	a number (square size for handle),
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
	}
	if (this.name === undefined) {
		this.name = "Ananda ";
	}
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
		}
		if (iA.Sz === undefined) { 
			iA.Sz = new paper.Size(iA.ds,iA.ds); 
		}
		if (iA.Rect === undefined) { 
			iA.Rect = new paper.Rectangle(iA.Pt,iA.Sz); 
		}

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
		}
		iA.bld += "n(" + n + ")";
	}

	function initFromStr (s) {
		iA.n = s;
		iA.bld += "s(" + s + ")";
	}

	function initFromNumArray (a) {
		// numbers only array
		iA.n = "NArrborn";
		iA.bld += "a[";
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
			iA.bld += a[0] + "." + a[1] + "." + a[2] + "." + a[3];
			iA.Pt = new paper.Point(a[0],a[1]);
			iA.Sz = new paper.Size(a[2],a[3]);
		}
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
			}
		}
		if (nArray) {  // array elements all numbers
			initFromNumArray(a);
		} else { 
				// todo: array of objects? [pt,size]?
			iA.n = "errorArray";  
		}
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
			}
		//	TODO:
		// if (h some kind of path) {
		}
		buildHandle();
	}

	function initFromObj (o) {
		if (o.style) { // paper.js style 
			iA.style = o.style;
		}
		if (o.visible) {
			iA.visible = o.visible;
		}
		if (o.handle) { 
			checkHandle(o.handle);
		}
		if (o.name) {
			initFromStr(o.name);
		} else {
			iA.n = "Objborn";
		}
	}

	switch (typeof args) {
		case "number" :
			initFromNum(args);
			break;
		case "string" :
			initFromStr(args);
			break;
		case "object" :
			if (args instanceof Array) {
				checkArray(args);
			} else {
				initFromObj(args);
			}
			break;
		default :
			iA.n = "errNoType";
	} // END switch

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
	}
};

fly.Ananda.prototype.info = function (){
	// override this.info to add other info,
	var _i = this.anandaInfo();
	// _i.foo = {val:"foo",type:"val"};
	return _i;
};

fly.Ananda.prototype.anandaInfo = function () {
	var _i = {};
	_i.name = this.name;
	_i.version = { val: this.version, type: "version"};
	if (fly.debug) {
		// _i.paperID = { val: this.handle.id, type: "val"};
		_i.build = { val: this.buildRecord, type: "string"};
		if (this.handle) {
			_i.point = { val:this.handle.bounds.x.toFixed(2) + " x " +
							this.handle.bounds.y.toFixed(2), type: "val"};
			_i.size = { val: this.handle.bounds.width.toFixed(2) + " x " +
							this.handle.bounds.height.toFixed(2), type: "val"};
		}
		_i.group = {val: this.group._children.length, type: "val"};
		_i.dragable = {val: this.dragable, type: "bool"};
		_i.moving = { val: this.moving, type: "bool" };
		_i.selectable = { val: this.selectable, type: "bool" };
		_i.selected = { val: this.group.selected, type: "bool" };
		_i.rotatable = {val: this.rotatable, type:"val"};
		// _i.speed = {val: this.speed().toFixed(2), type:"val"};
	}
	return _i;
};

fly.Ananda.prototype.register = function (display) {
	display = display || false;
	fly.infoCtrlr.register(this,display);
	fly.eventCtrlr.subscribe(["mouse down","mouse drag", "mouse up", "frame","r-key", "s-key"],this);
};

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
	}
	this.handle.style = _s;
	this.handle.opacity = _o;
	this.handle.visible = _v;
	this.group.addChild(this.handle);
};

fly.Ananda.prototype.toggleDisplay = function (){
	this.group.visible = !this.group.visible;
};

fly.Ananda.prototype.toggleSelected = function () {
	if (fly.debug && this.selectable) {
		this.group.selected = !this.group.selected;
	}
};

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
	} else if (this.group.hitTest(event.point)) {
		this.moveOrigin = event.point.subtract(this.group.bounds.center);
		this.moving = true;
	}
};

fly.Ananda.prototype.drag = function (event) {
	// don't move it if it's under a visible info controller
	if (this.moving && this.dragable && fly.infoCtrlr.moving() === false) {
		this.group.position = event.point.subtract(this.moveOrigin);
	}
};

fly.Ananda.prototype.drop = function (event) {
	this.moving = false;
};

fly.Ananda.prototype.rotate = function (deg) {
	if (this.rotatable) {
		deg = deg || 3;
		this.group.rotate(deg,this.handle.bounds.center);
	}
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
	}
};

//--------------------- END Ananda -------------------------//
