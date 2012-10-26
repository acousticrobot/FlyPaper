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
*	v 0.4 Beta
*					
*	Handles scrolling and object in one direction:
*		"left","right","up","down"
*/
//--------------------- BEGIN Scroll -----------------------//

fly.Scroll = function (args){
	var args = args || {};
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
}

fly.Scroll.prototype.register = function (display) {
	if (fly.debug) {
		var display = display || false;
		fly.infoCtrlr.register(this,display);
	};
}			

fly.Scroll.prototype.update = function (args) {
	this.curSpeed = args.delta * this.speed * 8;
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
*	v 0.4.1
*					
*	Moves and object up and down repeatedly
*/
//--------------------- BEGIN Bob -----------------------//

fly.Bob = function (args){
	var args = args || {};
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

fly.Bob.prototype.update = function (e) {
		// send event from frameEvent
		// this keeps bobbing in real time
		var p = new paper.Point(this.origin);
		var d = Math.sin(e.time * this.speed) * this.delta;
		p.y += d;
		this.reposition(p);		
};


//------------- END Bob	 ------------------------------//
