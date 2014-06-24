/*
 * This file is part of the flypaper.js build.
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */


/**
 * Returns a paper point midway between two paperpoints
 * @param  {Point} p1 a paper.js Point Object
 * @param  {Point} p2 a paper.js Point Object
 * @return {Point}    a paper.js Point Object
 */
fly.midpoint = function (p1,p2) {
        // returns the point between two points
    var _p = new paper.Point(p1.add(p2));
    _p = _p.divide([2,2]);
    return _p;
};

/**
 * Takes a paper Item, or array of Items and places each of their
 * centers randomly within the bounds of the rectangle. Primarily used
 * with Path Items, the obejcts passed in must have the paper `position`
 * method in order to be scattered.
 *
 * @param  {Object | Array} o    paper.js Items or array of Items
 * @param  {Rectangle} rect paper.js Rectangle
 */
fly.scatter = function (o,rect) {
        // takes an paper object or array of objects o
        // and places their centers randomly within rectangle rect
        // start in lower right corner, multiply x and y by random 0 to 1
        // point will land somewhere in the rect
        // TODO: optional place within rect bounds
    if (o instanceof Array === false) {
        o = [o];
    }
    for (var i=0; i < o.length; i++) {
        if (o.position === 'function') {
            var randomPoint = new paper.Point(    // point at lower right corner
                rect.width,rect.height
            );
            var randomLocation = randomPoint.multiply(paper.Size.random()); // point within rect
            o[i].position = rect.point.add(randomLocation);
        }
    }
};

//@TODO change to randomPoint?
fly.randomizePt = function (point,delta,constrain) {
    // adds variance delta to point
    // constrain === "x" or "y" or default none
    var c = constrain || "none";
    if (c !== "y") {
        var x = (- delta) + (2 * delta * Math.random());
        point.x += x;
    }
    if (c !== "x") {
        var y = (- delta) +  (2 * delta * Math.random());
        point.y += y;
    }
    return point;
};

//---- methods for working with grids: myGrid[x][y]

fly.eachCell = function (o,f) {
    // call by object o to iterate through grid[x][y]
    // call: fly.eachCell(this,function (o,x,y) { ... });
    // "this" o must have this.cols and this.rows
    for (var x=0; x < o.cols; x++) {
        for (var y=0; y < o.rows; y++) {
            f(o,x,y);
        }
    }
};

/**
 * Returns an array of array of points.
 * It is important to note that the rows and columns of points will
 * be one greater than the columns and rows passed in. The additional column
 * and row define the bottom and side edges. This allows the rows and columns
 * of the rectangles defined by the points to equal the number passed in.
 * @param  {Integer} columns     number of columns
 * @param  {Integer} rows        number of rows
 * @param  {Rectangle} rectangle paper.js Rectangle used to set the bounds
 * @param  {String} direction    optional direction for the grid, defaults to "down-left", can also be
 *                            "down-right","up-right" and "up-left"
 * @return {Array} Array of Arrays of paper.Point
 */

fly.gridPlot = function (columns,rows,rectangle,direction) {

    // NOTE: rectangle is a paper.rectangle, not a path, use
    // this.handle.bounds to send bounds
    // note-to-self: this breaks junkaigo v 0.3.1 !!!
    // TODO: accept both a rectangle and a path.Rectangle?

    direction = direction || "down-left";
    var rect = new paper.Path.Rectangle(rectangle);
    var points = [];
    for (var i=0; i <= columns; i++) {
        points[i] = [];
    }
    var w = rect.bounds.width / columns;
    var h = rect.bounds.height / rows;
    for (var x=0; x <= columns; x++) {
        for (var y=0; y <= rows; y++) {
            var pt = new paper.Point( rect.bounds.x + x * w,
                                rect.bounds.y + y * h);
            switch (direction) {
                case "down-right" :
                case "right" :
                    points[columns-x][y] = pt;
                    break;
                case "up-left" :
                    points[x][rows-y] = pt;
                    break;
                case "up-right" :
                    points[columns-x][rows-y] = pt;
                    break;
                default : // "down-left"
                    points[x][y] = pt;
            }
        }
    }
    return points;
};

fly.initArray = function (columns,rows) {
    // init 3-d array
    var a = [];
    for (var x=0; x < columns; x++) {
        a[x] = [];
        for (var y=0; y < rows; y++) {
            a[x][y] = [];
        }
    }
    return a;
};
