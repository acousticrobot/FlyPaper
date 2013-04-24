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
    var myGrid = new fly.Grid(
        {name:"My Grid", handle:[0,0,400,400],
        selectable:true, // default: false
        dragable: true, // default: true
        rotatable: true // default: false
    });
};

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
*   v 0.4
*/
//--------------------- BEGIN Grid  -----------------------//

fly.Grid = function(args){
    this.version = "0.4";
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
            var rect = new paper.Path.Rectangle(points[x][y], cellSize);
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