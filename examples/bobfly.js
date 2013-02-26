//--------------------- Initialization and new BobFly object --------//

window.onload = function() {

    var canvas = document.getElementById('ctx');
    paper.setup(canvas);
    fly.init({  width : 800, height : 500,
                colorPalette : "sunny day"
            });
    fly.debug = true;

    fly.colorUtil.background(fly.color.blue[4]);

    paper.view.onFrame = function(event) {
        fly.eventCtrlr.publish("frame",event);
        paper.view.draw();
    };

    var myFly = new fly.BobFly(
        {   name:"Bee",handle:[300,150,200,120],
            selectable:false,
            dragable: true
        });
};

//--------------------- BEGIN BobFly --------------------//
/*
* v 0.4
* A simple bug that floats up and down using fly.Bob()
*   -draggable
*   -eyes follow mouse movements
*   -bob and eyeblink follow realtime
*   -wings beat as fast as frame updates
*/
//--------------------- BEGIN BobFly --------------------//
fly.BobFly = function(args){
    this.version = "0.4";
    args = args || {};
    this.name = args.name || "BobFly";
    fly.Ananda.call(this);
    this.setStyle(args);
    this.init(args);
    this.bobHeight = args.bobHeight || this.handle.bounds.height/10 ; // float delta
    this.speed = args.speed !== undefined ? args.speed : 5;
    this.looseness = args.looseness || 1; // for random points
    this.roundHead = args.roundHead || true;
    this.direction = ["left","forward"];
    this.rWings = [0,0]; // keep track of wing rotation
    this.rLegs = [0,0,0,0,0,0]; // keep track of leg vibrations
    this.blinkCount = 0;
    this.build();
};

fly.BobFly.prototype = new fly.Ananda();

fly.BobFly.prototype.constructor = fly.BobFly;

//--------------------- init and build --------------------//

fly.BobFly.prototype.setStyle = function(args) {
    this.style = {};
    this.style.body = args.body ||
        {
            fillColor: fly.color.green[4]
        };
    this.style.shade = args.shade ||
        {
            fillColor: fly.color.green[3]
        };
    this.style.face = {};
    this.style.face.mask = args.mask ||
            {
                fillColor: fly.color.green[8]
            };
    this.style.face.iris = args.iris ||
            {
                fillColor: fly.color.green[1]
            };
    this.style.face.pupils = args.pupils ||
            {
                fillColor: fly.color.grey[0]
            };
    this.style.face.mouth = args.mouth ||
            {
                fillColor: fly.colorUtil.background()
            };
    this.style.legs = args.legs ||
        {
            strokeColor: fly.color.green[1],
            strokeWidth: 1
        };
};

fly.BobFly.prototype.build = function() {
        // bones holds all the shapes
        // that make up the fly:
        // [abdomen,wing,wing,head,]
    this.bones = [];
    this.draw();
    this.register();
    this.Bob = new fly.Bob(
        {   name:  this.name,
            speed: this.speed,
            delta: this.bobHeight,
            position: this.handle.bounds
        });
};

fly.BobFly.prototype.rebuild = function() {
    var h = new paper.Path.Rectangle(this.handle.bounds);
    this.group.removeChildren();
    this.handle = h;
    this.group.addChild(this.handle);
    this.draw();
};

fly.BobFly.prototype.rebuildFace = function() {
    for (var i=0; i < this.face.length; i++) {
        this.face[i].remove();
    }
    this.buildJoints();
    this.buildFace();
};

fly.BobFly.prototype.draw = function() {
    this.buildJoints();
        // build abdomen
    this.buildAbdomen();
        // wings
    this.bones[1] = this.buildWing(true);
    this.bones[2] = this.buildWing(false);
        // head
    if (this.roundHead) {
        this.bones[3] = new paper.Path.Circle(this.joints[2][2],this.handle.bounds.height/2);
    } else {
        this.bones[3] = new paper.Path.Oval(this.joints[0][0],this.joints[4][4]);
    }
    this.bones[3].style = this.style.body;
        // add parts in order
    this.buildLegs();
    this.group.addChildren(this.bones);
    this.buildFace();
};

fly.BobFly.prototype.buildJoints = function() {
    // make a 8 x 4 grid of points to plot out drawing paths
    if (this.direction[0] === "right") {
        this.joints = fly.gridPlot(8,4,this.handle.bounds,"right");
    } else {
        this.joints = fly.gridPlot(8,4,this.handle.bounds);
    }
};

fly.BobFly.prototype.buildAbdomen = function() {
    var abWiggle = this.looseness * this.handle.bounds.height / 40;
    var abSegs = [];
        abSegs[0] = this.joints[2][0],
        abSegs[1] = fly.randomizePt(this.joints[6][3],abWiggle);
        abSegs[2] = fly.randomizePt(this.joints[8][2],abWiggle);
        abSegs[3] = fly.randomizePt(this.joints[6][2],abWiggle);
        abSegs[4] = this.joints[2][4],
    this.bones[0] = new paper.Path(abSegs);
    this.bones[0].closed = true;
    this.bones[0].smooth();
        // make the hidden points sharp to keep behind head
    this.bones[0].segments[0].handleIn = new paper.Point(0,0);
    this.bones[0].segments[0].handleOut = new paper.Point(0,0);
    this.bones[0].segments[2].handleIn = new paper.Point(0,0);
    this.bones[0].segments[2].handleOut = new paper.Point(0,0);
    this.bones[0].segments[4].handleIn = new paper.Point(0,0);
    this.bones[0].segments[4].handleOut = new paper.Point(0,0);
    this.bones[0].style = this.style.body;
};

fly.BobFly.prototype.buildWing = function(top) {
    var wing;
    if (top) {
        wing = new paper.Path([this.joints[4][1],this.joints[7][2],this.joints[8][1]]);
    } else {
        wing = new paper.Path([this.joints[4][1],this.joints[7][0],this.joints[8][1]]);
    }
    wing.fillColor = fly.color.grey[7];
    wing.opacity = 0.5;
    wing.closePath();
    wing.smooth();
    return wing;
};

fly.BobFly.prototype.buildFace = function() {
    var faceRect = new paper.Rectangle(this.joints[0][1],this.joints[3][3]);
    var grid = new fly.gridPlot(8,8,faceRect,this.direction[0]);
    this.face = [];
    // compound mask
    var f = [];
    f[0] = new paper.Path.Rectangle(faceRect);
    f[0].style = this.style.face.mask;
    f[1] = new paper.Path.Rectangle(grid[1][1],grid[3][5]);
    f[2] = new paper.Path.Rectangle(grid[4][1],grid[6][5]);
    f[3] = new paper.Path.Rectangle(grid[0][6],grid[6][7]);
    // shading
    this.face[0] = new paper.Path.Rectangle(grid[0][0],grid[7][5]);
    this.face[0].style = this.style.shade;
    var eyeY;
    switch (this.direction[1]) {
        case "up" :
            eyeY = 1;
            break;
        case "down" :
            eyeY = 3;
            break;
        default: // "forward"
            eyeY = 2;
            break;
    }
    // iris
    this.face[1] = new paper.Path.Rectangle(grid[0][eyeY],grid[7][eyeY + 2]);
    this.face[1].style = this.style.face.iris;
    // pupils
    var rad = (grid[1][0].x - grid[0][0].x) * 0.75;
    this.face[2] = new paper.Path.Circle(grid[2][eyeY + 1],rad);
    this.face[3] = new paper.Path.Circle(grid[5][eyeY + 1],rad);
    this.face[2].style = this.style.face.pupils;
    this.face[3].style = this.style.face.pupils;
    // blink
    this.face[4] = this.face[0].clone();
    this.face[4].visible = false;
        // mouth -- should be background color!
    this.face[5] = new paper.Path.Rectangle(grid[0][6],grid[8][8]);
    this.face[5].style = this.style.face.mouth;
    this.face[6] = new paper.CompoundPath(f);
    var group = new paper.Group(this.face);
    var s = this.direction[0] === "right" ? -0.125 : 0.125;
    group.shear(0,s);
    group.scale(1.25);
    this.group.addChildren(this.face);
};

fly.BobFly.prototype.buildLegs = function() {
    this.legs = [];
    var size = this.handle.bounds.width/40;
    var dir = this.direction[0] === "left" ? 1 : -1;
    for (var i=0; i < 6; i++) {
        var shift = new paper.Point(dir * i * size,0);
        var j0 = this.joints[3][3].add(shift),
            j1,
            j2,
            r;
        if (i < 2) {
            j1 = fly.randomizePt(this.joints[4][4],size);
            j2 = fly.randomizePt(this.joints[5][4],size);
            r = 15 + i*6;
        } else if (i < 4) {
            j1 = fly.randomizePt(this.joints[4][4].add(shift),size);
            j2 = fly.randomizePt(this.joints[6][4].add(shift),size);
            r = i/2;
        } else {
            j1 = fly.randomizePt(this.joints[4][4].add(shift),size);
            j2 = fly.randomizePt(this.joints[7][4].add(shift),size);
            r = -i*2;
        }
        this.legs[i] = new paper.Path(j0,j1,j2);
        var LorR = dir === 1 ? "topLeft" : "topRight";
        this.legs[i].rotate(dir * r, this.legs[i].bounds[LorR]);
        this.legs[i].style = this.style.legs;
        this.legs[i].strokeWidth = this.style.legs.strokeWidth;
        this.group.addChildren(this.legs);
    }
};

//--------------------- animation --------------------------//

fly.BobFly.prototype.fly = function() {
    var dir = this.direction[0] === "right" ? 1 : -1;
    var o = new paper.Point(this.bones[1].segments[0].point);
    var r = dir * 45 * Math.random();
    var r2 = dir * 45 * Math.random() + dir * 45;
    this.bones[1].rotate(r - this.rWings[0],o);
    this.bones[2].rotate(r2 - this.rWings[1],o);
    this.rWings[0] = r;
    this.rWings[1] = r2;
};

fly.BobFly.prototype.shakeALeg = function() {
    var o = new paper.Point(this.legs[0].segments[0].point);
    for (var i=0; i < this.legs.length; i++) {
        var r = -5 * Math.random();
        this.legs[i].rotate(r - this.rLegs[i],o);
        this.rLegs[i] = r;
    }
};

fly.BobFly.prototype.updateDirection = function(args) {
    if (this.direction[0] !== "right" && args.point.x > this.handle.bounds.center.x) {
            this.direction[0] = "right";
            this.rebuild();
    } else if (this.direction[0] !== "left" && args.point.x < this.handle.bounds.center.x ) {
            this.direction[0] = "left";
            this.rebuild();
    }

    if (args.point.y > this.handle.bounds.bottomCenter.y) {
        if (this.direction[1] === "down") {
            return;
        }
        this.direction[1] = "down";
        this.rebuildFace();
        return;
    } else if (args.point.y < this.handle.bounds.topCenter.y) {
        if (this.direction[1] === "up") {
            this.rebuildFace();
            return;
        }
        this.direction[1] = "up";
        return;
    } else if (this.direction[1] !== "forward") {
        this.direction[1] = "forward";
        this.rebuildFace();
        return;
    }

    if (args.point.y > paper.view.bounds.bottomCenter.y && this.direction[1] !== "down") {
        this.direction[1] = "down";
    } else if (args.point.y < paper.view.bounds.topCenter.y && this.direction[1] !== "up") {
        this.direction[1] = "up";
    } else if (this.direction[1] !== "forward") {
        this.direction[1] = "forward";
    }
};

fly.BobFly.prototype.blink = function(b) {
    this.face[4].visible = b;
    this.blinking = b;
};

//--------------------- information collection ------------//

fly.BobFly.prototype.info = function(){
    // override Ananda info() to add other info,
    var i = this.anandaInfo();
    i.facing = {val: this.direction[0],type:"val"};
    i.looking = {val: this.direction[1],type:"val"};
    i.blinking = {val: this.blinking, type:"bool"};
    i.drift = {val: this.drift, type: "val"};
    return i;
};

fly.Ananda.prototype.register = function(display) {
    display = display || false;
    fly.infoCtrlr.register(this,display);
    fly.eventCtrlr.subscribe(["mouse move","mouse down","mouse drag", "mouse up", "frame", "s-key"],this);
};

fly.BobFly.prototype.grab = function(event) {
    if (this.bones[3].hitTest(event.point)) {
        this.moveOrigin = event.point.subtract(this.group.bounds.center);
        this.moving = true;
    }
};

fly.BobFly.prototype.drag = function(event) {
    if (this.moving && this.dragable && fly.infoCtrlr.moving() === false) {
        this.group.position = event.point.subtract(this.moveOrigin);
        this.Bob.move(this.handle.bounds.center);
    }
};

fly.BobFly.prototype.update = function(e) {
    if (!this.moving) {
        this.Bob.update(e);
        this.group.position = this.Bob.position;
        this.fly();
        this.shakeALeg();
    }
    if (e.time > this.blinkCount + 4) {
        this.blink(true);
        this.blinkCount = e.time;
    } else if (this.blinking && e.time > this.blinkCount + 0.25) {
        this.blink(false);
        this.blinkCount = e.time + 5 * Math.random();
    }
};

fly.BobFly.prototype.eventCall = function(e,args) {
    switch (e) {
        case "mouse move" :
            this.updateDirection(args);
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
    }
};


//--------------------- END BobFly -----------------------//