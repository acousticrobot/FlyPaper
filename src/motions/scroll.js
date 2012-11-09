/*
 * This file is part of the flypaper.js build.
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

//--------------------- BEGIN Scroll -----------------------//
/*
*	Motion: Scroll
*	v 0.4 Beta
*
*	Handles scrolling and object in one direction:
*		"left","right","up","down"
*/
//--------------------- BEGIN Scroll -----------------------//

fly.Scroll = function (args){
	args = args || {};
	this.name = args.name + " scroll" || "scroll";
	this.version = "0.4 Beta";
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
};

fly.Scroll.prototype.register = function () {
	if (fly.debug) {
		fly.infoCtrlr.register(this);
	}
};

fly.Scroll.prototype.update = function (args) {
	this.curSpeed = args.delta * this.speed * 8;
	switch (this.direction) {
		case "up" :
			this.position.y -= this.curSpeed;
			if (this.position.y < this.resetAt) {
				this.reset = true;
			}
			break;
		case "down" :
			this.position.y += this.curSpeed;
			if (this.position.y > this.resetAt) {
				this.reset = true;
			}
			break;
		case "right" :
			this.position.x -= this.curSpeed;
			if (this.position.x < this.resetAt) {
				this.reset = true;
			}
			break;
		default : // "left"
			this.position.x += this.curSpeed;
			if (this.position.x > this.resetAt) {
				this.reset = true;
			}
			break;
	}
	if (this.reset === true) {
		this.position = new paper.Point(this.resetPos);
		this.reset = false;
	}
};

fly.Scroll.prototype.reposition = function (point) {
	this.position = new paper.Point(point);
};
