window.onload = function() {
    // start by initializing Paper.js
    var canvas = document.getElementById('ctx');
    paper.setup(canvas);

    // initialize FlyPaper and set the canvas to 800 x 500
    fly.init({width:800,height:500});
    // when fly.debug is set to true, the info panel is accessible
    fly.debug = true;

    // All mouse events are handled within FlyPaper
    // the onFrame handler must be installed here:
    paper.view.onFrame = function(event) {
    fly.eventCtrlr.publish("frame",event);
    };

    // Now we can add a FlyPaper object.
    // fly.Template is a basic example of a FlyPaper object.
    var myFly = new fly.FlyMotion(
        {name:"My Fly", handle:[200,200,300,250],
        selectable:true, // default: false
        dragable: true, // default: true
        rotatable: true // default: false
    });

};

//--------------------- BEGIN FlyMotion --------------//
/*
*   FlyMotion for basic FlyPaper smart object
*   with tracks it's location to a fly motion
*   Extends Ananda, builds apon fly.template
*   v 0.4
*/
//--------------------- BEGIN FlyMotion -------------//

fly.FlyMotion = function (args){
    this.version = "0.4";
    fly.Ananda.call(this);

    // initialize from args (in prototype Ananda)
    this.init(args);
    this.delta = 30;
    this.speed = args.speed !== undefined ? args.speed : 5;

    // send a name in args, take the one created in init
    // or add one after init that describes the object type
    this.name = args && args.name ? args.name : "FlyMotion Object";
    // example variable, see info()

    // add your initial drawing to build
    this.build();
};

fly.FlyMotion.prototype = new fly.Ananda();

fly.FlyMotion.prototype.constructor = fly.FlyMotion;

fly.FlyMotion.prototype.build = function () {
    // add initial build here:
    // for example:
    var myShape;
    if (this.handle !== undefined) {
        myShape = paper.Path.Oval(this.handle.bounds);
        myShape.fillColor = "red";
    }
    // add your shapes to this.group to make
    // them act as one unit for dragging, rotating etc.
    this.group.addChild(myShape);

    // register with fly.infoCtrlr and fly.eventCtrlr
    this.register();
    this.Motion = new fly.Bob(
                        {   name:  this.name,
                            speed: this.speed,
                            delta: this.delta,
                            position: this.handle.bounds
                        });
};

fly.FlyMotion.prototype.info = function (){
    // override Ananda info() to add other info,
    var i = this.anandaInfo();
    // example varible sent to infoCtrlr
    i.speed = {val: this.speed, type:"val"};
    return i;
};

fly.FlyMotion.prototype.drag = function(event) {
    if (this.moving && this.dragable && fly.infoCtrlr.moving() === false) {
        this.group.position = event.point.subtract(this.moveOrigin);
        this.Motion.move(this.handle.bounds.center);
    }
};


fly.FlyMotion.prototype.update = function (e) {
        if (!this.moving) {
            this.Motion.update(e);
            this.group.position = this.Motion.position;
        }
};



//--------------------- END FlyMotion ----------------//
