//--------------------- FLYPAPER TEMPLATES ---------------------//
/*
*   Author Jonathan Gabel
*   website jonathangabel.com
*   Namespace FLYPAPER
*   abbreviated: fly
*   version 0.4
*
*   A collection of FlyPaper Object Templates
*   Use these templates to create your own fly
*   objects. Open example.html to view in a browser.
*
*   This file contains a series of template objects
*   for flypaper.js, to be used in conjunction with
*   paper.js.  See flypaper.js for more information.
*   These template objects can be used to assist in
*   building your own flypaper objects. This is the
*   window.onload function that initializes a basic
*   template object:
*/

window.onload = function() {
    // start by initializing Paper.js
    var canvas = document.getElementById('ctx');
    paper.setup(canvas);

    // initialize FlyPaper and set the canvas to 800 x 500
    fly.init({width:800,height:500,debug:true});
    // when fly.debug is set to true, the info panel is accessible
    fly.debug = true;

    // All mouse events are handled within FlyPaper
    // the onFrame handler must be installed here:
    paper.view.onFrame = function(event) {
    fly.eventCtrlr.publish("frame",event);
    };

    // Now we can add a FlyPaper object.
    // fly.Template is a basic example of a FlyPaper object.
    var myFly = new fly.Template(
        {name:"My Fly", handle:[100,100,300,250],
        selectable:true, // default: false
        dragable: true, // default: true
        rotatable: true // default: false
    });

};

/*  Other flypaper objects are called similarly, although
*   the arguments passed vary with the object. Below you
*   will find fly.Template, which we called above, followed
*   by a number of more complicated objects.  Find one that
*   most similarly matches your needs and alter it as you
*   see fit, or read through the examples to get a sense of
*   how to create your own from scratch.
*
*   CONTENTS:
*   ---------
*   fly.Template -- a basic flypaper object
*   fly.Grid -- an example of a gridded object
*   fly.PullGroup -- an object resized with a pullbar



//--------------------- BEGIN Template --------------//
/*
*   Template for basic FlyPaper smart object
*   Extends Ananda
*   v 0.4
*/
//--------------------- BEGIN Template -------------//

fly.Template = function (args){
    this.version = "0.4";
    fly.Ananda.call(this);

    // initialize from args (in prototype Ananda)
    this.init(args);

    // send a name in args, take the one created in init
    // or add one after init that describes the object type
    this.name = args && args.name ? args.name : "Template Object";
    // example variable, see info()
    this.foo = "bar";

    // add your initial drawing to build
    this.build();
};

fly.Template.prototype = new fly.Ananda();

fly.Template.prototype.constructor = fly.Template;

fly.Template.prototype.build = function () {
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
};

fly.Template.prototype.info = function (){
    // override Ananda info() to add other info,
    var i = this.anandaInfo();
    // example varible sent to infoCtrlr
    i.foo = {val: this.foo, type:"val"};
    return i;
};

fly.Template.prototype.update = function (args) {
    // add "on frame" events here
};

//--------------------- END Template ----------------//


//--------------------- BEGIN Grid  -----------------------//
/*
*   Grid is a template for a gridded object, bounded by the handle.
*   Handle defaults to the full canvas width and height.
*   Optional args:
*       cols: (int) number of colums
*       rows : (int) number of rows
*       styling: styling.type accepts "checkered", "color spectrum",
*       or add your own styling hook in styleCell. examples:
*           {type:"color spectrum"}
*           {type:"checkered",even:{fillColor:'black'},odd:{fillColor: 'white'}}
*       note: use 9 cols and 7 rows to view full color set
*   v 0.3.7
*/
//--------------------- BEGIN Grid  -----------------------//

fly.Grid = function(args){
    this.version = "0.3.7";
    args = args || {};
    this.name = args.name || "Grid";
    args.handle = args.handle || [0, 0, fly.width, fly.height];
    fly.Ananda.call(this);
    this.init(args);

    // optional arguments:
    this.cols = args.cols || 4;
    this.rows = args.rows || 4;
        // style is a trigger for how to fill in the grid
        // it must at a minimum have a type
        // the rest is processed in styleCell
    this.styling = args.styling || { type :"checkered" };

    this.build();
    this.register();
};

fly.Grid.prototype = new fly.Ananda();

fly.Grid.prototype.constructor = fly.Grid;

fly.Grid.prototype.info = function(){
    // override Ananda info() to add other info,
    var _i = this.anandaInfo();
    _i.rows = {val: this.rows, type:"var"};
    _i.cols = {val: this.cols, type:"var"};
    _i.styling = {val: this.styling.type, type:"var"};
    return _i;
};


fly.Grid.prototype.build = function() {

    var points = fly.gridPlot(this.cols,this.rows,this.handle.bounds,"down-left"),
        cellSize = new paper.Size(  this.handle.bounds.width / this.cols,
                                    this.handle.bounds.height / this.rows);
    for (var x=0; x < this.cols; x++) {
        for (var y=0; y < this.rows; y++) {
            var rect = new paper.Path.Rectangle(this.points[x][y], this.cellSize);
            rect.style = this.styleCell(x,y);
            this.group.addChild(rect);
        }
    }
};

fly.Grid.prototype.styleCell = function(x,y) {
    //determine style for each cell based on position and this.styling.type
    //returns the style as a paper.js PathStyle
    var s;
    switch(this.styling.type) {
        case "outline":
            s = {strokeColor:'black',strokeWidth:2};
            break;
        case "checkered":
            // send any legit paper.js PathStyle to even and odd cells
            this.styling.odd = this.styling.odd || {fillColor:"black"};
            this.styling.even = this.styling.even || {fillColor:"white"};
            if (x % 2 === y % 2) {
                s = this.styling.odd;
            } else {
                s = this.styling.even;
            }
            break;
        case "color swatches":
            // grids out the basic fly.color presets
            var col;
            x = x%9;
            y = y%7;
            var colorSet = ['red','orange','yellow','green','blue','purple','mono'];
            s = {fillColor:fly.color[colorSet[y]][x]};
            break;
        default: // "none"
            return;
    }
    return s;
};

//--------------------- END Grid --------------------------//


//--------------------- BEGIN PullGroup --------------------//
/*
*               v 0.3.6
* Template for object with handle.
* Creates an array that can be filled with a more
* complicated shape.  Redraws the shape to the bounds of
* the handle. handle's size is controlled by the pullbar.
*/
//--------------------- BEGIN PullGroup --------------------//

fly.PullGroup = function(args){
    this.version = "0.4";
    args = args || {};
    fly.Ananda.call(this);
    this.init(args);
    this.name = args && args.name ? args.name : "Pull Group Object";
    // reset is a trigger attached to pullbar, refreshed on release
    // use it to trigger comp-heavy resizes w/o constant refreshing
    this.reset = false;
    this.style = args.style ||
        [{
            fillColor: fly.color.purple[4],
            strokeColor: fly.color.purple[3],
            strokeWidth: 5
        },
        {
            fillColor: fly.color.red[2],
            strokeColor: fly.color.red[1],
            strokeWidth: 5
        }
        ];
    this.build();
    this.register();
};

fly.PullGroup.prototype = new fly.Ananda();

fly.PullGroup.prototype.constructor = fly.PullGroup;

fly.PullGroup.prototype.toggleSelected = function() {
        this.selected = !this.selected;
    this.pullbar.toggleSelected(this.selected);
    if (this.selectable === true) {
        this.group.selected = this.selected;
    }
};

fly.PullGroup.prototype.build = function() {
    // Our object is going to be refreshed as the
    // pullbar moves, so we do our initial build
    // here only, and the refreshable drawing in
    // draw.  bones is an array for storing all
    // the paper.Path objects that make up our
    // object.
    this.bones = [];
    this.addPullbar();
    this.draw();
};

fly.PullGroup.prototype.addPullbar = function() {
    // add a pullbar, sized to the handle
    this.pullbar = new fly.Pullbar(
        {name:this.name,
        vectorCtr: this.handle.bounds.center,
        vector: this.handle.bounds.center.subtract(
            this.handle.bounds.bottomLeft)
        }
    );
};

fly.PullGroup.prototype.draw = function() {
    // the handle is resized in update(), so
    // as long as our drawing is relative to
    // the handle, it will resize along with
    // the pullbar.

    // first erase all current paths, if any
    for (var i=0; i < this.bones.length; i++) {
        this.bones[i].remove();
    }

    // Our example has a round rectangle which fits inside the handle,
    // and a circle which follows handle's width but not it;s height
    this.bones[0] = new paper.Path.RoundRectangle(this.handle.bounds,30);
    this.bones[1] = new paper.Path.Circle(this.handle.bounds.center,this.handle.bounds.width/3);
    this.bones[0].style = this.style[0];
    this.bones[1].style = this.style[1];
    // add all the bones to the group, to make it draggable, etc.
    this.group.addChildren(this.bones);
    if (this.selectable === true) {
        this.group.selected = this.pullbar.selected;
    }
};

fly.PullGroup.prototype.update = function() {
    // All registered FlyPaper objects receive
    // updates on frame events. Here we check
    // our pullbar to see if it is moving.  If
    // it is, we use Ananda's updateHandle method
    // to resize the handle, and then we call our
    // draw function again to refresh our objects
    // size.

    if (this.pullbar.moving === true) {
        this.reset = true;
        this.updateHandle(this.pullbar.group.bounds);
        this.draw();
    }
    if (this.reset === true && !this.pullbar.moving ) {
        this.reset = false;
        // reset finished, add one-time reset actions here:
    }
};

fly.PullGroup.prototype.drag = function(event) {
    // Here we need to override the drag function from Ananda. We
    // add a check to see if we are dragging our object (its moving,
    // and not because we are resizing it with the pullbar). If it is,
    // we need to update and redraw the pullbar. Compare with
    // fly.Ananda.prototype.drag in flypaper.js
    if (this.moving && !this.pullbar.moving && fly.infoCtrlr.moving() === false) {
        this.group.position = event.point.subtract(this.moveOrigin);
        this.pullbar.reposition(this.group.bounds.center);
        this.pullbar.draw();
    }
};


//--------------------- END PullGroup -----------------------//

