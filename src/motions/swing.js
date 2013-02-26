/*
 * This file is part of the flypaper.js build.
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

//--------------------- BEGIN Swing -----------------------//
/*
*   Motion: Swing
*   version 0.3.3
*   TODO: V0.3.4 using fly.infoCtrlr.fps()
*/
//--------------------- BEGIN Swing -----------------------//

fly.Swing = function (args){
    args = args || {name : "", maxRotation : 90,decay : 0, timestep : 0.01};
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
    this.timestep = args.timestep || 0.0001;
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
    }
    return i;
};

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
    }
    return this.deg.toFixed(2);

};