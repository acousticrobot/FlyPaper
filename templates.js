"use strict"
//-------------- BEGIN FLYPAPER TEMPLATE-------------//
/*
*	Namespace FLYPAPER
*	abbreviated: fly
*	v 0.3.6
*								
*	A collection of FlyPaper Object Templates
* Use these templates to create your own fly objects
*
//-------------- BEGIN FLYPAPER TEMPLATE-------------//

//--------------------- BEGIN Template --------------//
/*					
*	Template for basic FlyPaper smart object
*	Extends Ananda
*	v 0.3.6
*/
//--------------------- BEGIN Template -------------//

fly.Template = function (args){
	this.version = "0.3.6";
	fly.Ananda.call(this);
	
	// initialize from args (in prototype Ananda)
	this.init(args);	 
	
	// send a name in args, take the one created in init
	// or add one after init that describes the object type
    this.name = args && args.name ? args.name : "Template Object";
	// example variable, see info()
	this.foo = "bar";	

	// add initial drawing to build
	this.build();

	// register with fly.infoCtrlr and fly.eventCtrlr
	this.register();
};

fly.Template.prototype = new fly.Ananda;

fly.Template.prototype.constructor = fly.Template;

fly.Template.prototype.build = function () {
	// add initial build here:	
	
	// for example:
	if (this.handle !== undefined) {
		var myShape = paper.Path.Oval(this.handle.bounds);
		myShape.fillColor = "red";
	}
	this.group.addChild(myShape);
};

fly.Template.prototype.info = function (){
	// override Ananda info() to add other info,
	var i = this.anandaInfo();
	// example varible sent to infoCtrlr
	i.foo = {val: this.foo, type:"val"};
	return i;
}

fly.Template.prototype.update = function (args) {
	// add "on frame" events here
};

//--------------------- END Template ----------------//


//--------------------- BEGIN PullGroup --------------------//
/*
* 				v 0.3.6
* Template for object with handle.
* Creates an array that can be filled with a more
* complicated shape.  Redraws the shape to the bounds of
* the handle. handle's size is controlled by the pullbar.
*/
//--------------------- BEGIN PullGroup --------------------//

fly.PullGroup = function(args){
	this.version = "0.3.6";
	var args = args || {};	
	fly.Ananda.call(this);
	this.init(args);
	this.name = args && args.name ? args.name : "Pull Group Object";
	this.reset = false; // trigger attached to pullbar, refresh on release
	this.selected = false; // needed because group.selection lost on draw()
	this.style = args.style || 
		[{
			fillColor: fly.colors.main[0],
			strokeColor: fly.colors.main[1],
			strokeWidth: 5,
		},
		{
			fillColor: fly.colors.main[2],
			strokeColor: fly.colors.main[1],
			strokeWidth: 5,
		}
		];
	this.build();
	this.register();
};

fly.PullGroup.prototype = new fly.Ananda;

fly.PullGroup.prototype.constructor = fly.PullGroup;

fly.PullGroup.prototype.toggleSelected = function() {
		this.selected = !this.selected;
	this.pullbar.toggleSelected(this.selected);
	if (this.selectable === true) {
		this.group.selected = this.selected;		
	};
}

fly.PullGroup.prototype.build = function() {
	this.bones = [];		
	this.addPullbar();
	this.draw();
};

fly.PullGroup.prototype.addPullbar = function() {
	// add a pullbar, sized to handle
	this.pullbar = new fly.Pullbar(
		{name:this.name,
		vectorCtr: this.handle.bounds.center,
		vector: this.handle.bounds.center.subtract(
			this.handle.bounds.bottomLeft)
		}
	);
};

fly.PullGroup.prototype.draw = function() {
	for (var i=0; i < this.bones.length; i++) {
		this.bones[i].remove();
	};
	this.bones[0] = new paper.Path.RoundRectangle(this.handle.bounds,30);
	this.bones[1] = new paper.Path.Circle(this.handle.bounds.center,this.handle.bounds.width/3);
	this.bones[0].style = this.style[0];
	this.bones[1].style = this.style[1];
	this.group.addChildren(this.bones);
	if (this.selectable === true) {
		this.group.selected = true;
	};
};

fly.PullGroup.prototype.update = function() {
	if (this.pullbar.moving === true) {
		this.reset = true;
		this.updateHandle(this.pullbar.group.bounds);
		this.draw();
	};
	if (this.reset == true && !this.pullbar.moving ) {
		this.reset = false;
		// reset finished, add one-time reset actions here:
	};
};

fly.PullGroup.prototype.drag = function(event) {
		// adds check for pullbar moving and updates pullbar location
	if (this.moving && !this.pullbar.moving && fly.infoCtrlr.moving() == false) {
		this.group.position = event.point.subtract(this.moveOrigin);
		this.pullbar.reposition(this.group.bounds.center);
		this.pullbar.draw();
	};
};


//--------------------- END PullGroup -----------------------//

