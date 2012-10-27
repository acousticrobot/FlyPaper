// In preparation for breaking flypaper into sections, and creating new prototypes

fly.Motion = function () {
	// empty constructor
};
	

fly.Motion.prototype.init = function(args) {
	var args = args || {};
	this.name = args.name + "'s motion: bob" || "bob";
	this.version = "0.4";
	this.position = new paper.Point(args.position) || new paper.Point(0,0);
//	this.origin = new paper.Point(this.position);
	this.speed = args.speed !== undefined ? args.speed : 5;
//	this.delta = args.delta !== undefined ? args.delta : 33;
	this.register();
};

fly.Motion.prototype.info = function (){
	var i = {};
	i.name = this.name;
	i.version = { val: this.version, type: "version"};
	i.position = { val: 
					"x: " + this.position.x.toFixed(0) +
					", y: " + this.position.y.toFixed(0), type: "val" };
	i.speed = { val: this.speed, type: "val" };
	return i;
}

fly.Motion.prototype.register = function () {
	if (fly.debug) {
		fly.infoCtrlr.register(this);
	};
};			

