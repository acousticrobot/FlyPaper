/*
 * This file is part of the flypaper.js build.
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

//--------------------- BEGIN Bob -----------------------//
/*
*	Motion: Bob
*	v 0.4.1
*
*	Moves and object up and down repeatedly
*/
//--------------------- BEGIN Bob -----------------------//

fly.Bob = function (args){
	args = args || {};
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
};

fly.Bob.prototype.register = function (display) {
	if (fly.debug) {
		display = display || false;
		fly.infoCtrlr.register(this,display);
	}
};

fly.Bob.prototype.reposition = function (point) {
	this.position = new paper.Point(point);
};

fly.Bob.prototype.move = function (point) {
	this.origin = new paper.Point(point);
};

fly.Bob.prototype.update = function (e) {
		// send event from frameEvent
		// this keeps bobbing in real time
		var p = new paper.Point(this.origin);
		var d = Math.sin(e.time * this.speed) * this.delta;
		p.y += d;
		this.reposition(p);
};
