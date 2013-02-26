/*
 * This file is part of the flypaper.js build.
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

//------------- BEGIN FLYPAPER MATH AND MOTION ------------//
/*
*   Math and Motion Methods
*
*   versions 0.3 - 0.4
*/
//--------------------------------------------------------//

fly.midpoint = function (p1,p2) {
        // returns the point between two points
    var _p = new paper.Point(p1.add(p2));
    _p = _p.divide([2,2]);
    return _p;
};

fly.scatter = function (o,rect) {
        // takes an object or array of objects o
        // and places it's center randomly within rectangle rect
        // start in lower right corner, multiply x and y by random 0 to 1
        // point will land somewhere in the rect
        // TODO: optional place within rect bounds
    if (o instanceof Array === false) {
        o = [o];
    }
    for (var i=0; i < o.length; i++) {
        var randPoint = new paper.Point(    // point at lower right corner
            rect.width,rect.height
        );
        var randLoc = randPoint.multiply(paper.Size.random()); // point within rect
        o[i].position = rect.point.add(randLoc);
    }
};

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

fly.gridPlot = function (c,r,rectangle,dir) {
    // v.0.4
    // returns an array of arrays of points
    // c + 1 columns by r + 1 rows inside paper.rectangle r
    // last column and row run along right and bottom edges
    // dir is an optional string, which controls the direction
    // (top down, left to right etc.) that the grid travels.
    // Use this to quickly change the orientation of an object
    // aligned to a grid.
    // CHANGE: rectangle is a paper.rectangle, not a path, use
    // this.handle.bounds to send bounds
    // note-to-self: this breaks junkaigo v 0.3.1 !!!
    // TODO: accept both a rectangle and a path.Rectangle?

    dir = dir || "down-left";
    var rect = new paper.Path.Rectangle(rectangle);
    var points = [];
    for (var i=0; i <= c; i++) {
        points[i] = [];
    }
    var w = rect.bounds.width / c;
    var h = rect.bounds.height / r;
    for (var x=0; x <= c; x++) {
        for (var y=0; y <= r; y++) {
            var pt = new paper.Point( rect.bounds.x + x * w,
                                rect.bounds.y + y * h);
            switch (dir) {
                case "down-right" :
                case "right" :
                    points[c-x][y] = pt;
                    break;
                case "up-left" :
                    points[x][r-y] = pt;
                    break;
                case "up-right" :
                    points[c-x][r-y] = pt;
                    break;
                default : // "down-left"
                    points[x][y] = pt;
            }
        }
    }
    return points;
};

fly.initArray = function (c,r) {
    // init 3-d array
    var a = [];
    for (var x=0; x < c; x++) {
        a[x] = [];
        for (var y=0; y < r; y++) {
            a[x][y] = [];
        }
    }
    return a;
};
