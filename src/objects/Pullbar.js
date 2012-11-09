//--------------------- BEGIN Pullbar ---------------------//
/*
*	Pullbar extends Ananda, creates grabbable handles
*
*	adaptation of vektor.js from:
*	http://paperjs.org/tutorials/geometry/vector-geometry/
*
*	args = {	fixLength:bool,fixAngle:bool,
*			this.visible: bool,
*			vectorCtr:point,
*			vector:point,	// length from center
*			handle: see ananda // creates pullBall size
*			color: #e4141b	// any valid color val
*		}
*
*	version 0.3.6
*/
//--------------------- BEGIN Pullbar --------------------//

fly.Pullbar = function (args){
	this.version = "0.4";
	args = args || {};
	args.name = args.name + "'s pullbar" || "pullbar";
	if (args.handle === undefined) {
		args.handle = 10; // default size = 50;
	}
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

fly.Pullbar.prototype = new fly.Ananda();

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
		}
		i.vectorPrevious = {val: this.vectorPrevious, type: "val"};
	}
	return i;
};

fly.Pullbar.prototype.register = function (display) {
	display = display || false;
	fly.infoCtrlr.register(this,display);
	fly.eventCtrlr.subscribe(["mouse down","mouse drag", "mouse up", "s-key"],this);
};

fly.Pullbar.prototype.toggleSelected = function (state) {
	// state is an optional bool
	// change selected state to state, or toggle if no arg sent
	if (state !== undefined) {
		this.selected = state;
	} else {
		this.selected = !this.selected;
	}
	this.group.visible = this.selected;
};

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
	o2.scale(0.5,o2.bounds.center);
	this.bones[2] = new paper.Group([o1,o2]);
	this.bones[3] = this.bones[2].clone();	// second grip handle
	this.bones[3].position = this.joints[1];
	for (var i=0; i < this.bones.length; i++) {
		this.bones[i].strokeWidth = 1.75;
		this.bones[i].strokeColor = this.color;
		this.bones[i].fillColor = 'white';
	}
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
	}
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
		}
	}
};

fly.Pullbar.prototype.drag = function (event) {
	if (this.moving === true) {
		if (!event.modifiers.shift && this.fixLength && this.fixAngle) {
			this.vectorCtr = event.point;
		}
		this.processVector(event.point);
	}
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
	}
};