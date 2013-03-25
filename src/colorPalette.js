/*
 * This file is part of the flypaper.js build.
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */


/**
 * Returns the name of the current color palette if no
 * args are passed in. Arguments passed on {@link fly.init}
 * will be passed to the color palette.
 * Args can be a string matched against predefined
 * sets of colors in the [Color Sets]{@link colorSets}. Args can also be an
 * object containing a name and a color set. The set will be added to
 * the colorSets array, or if the name exists already,
 * the new set will replace the old.
 *
 * @example
 * // Set the predefined 'neon' color set on init
 * fly.init({palette:"neon"})
 *
 * // Change to the predefined "pastel" color set
 * fly.color.palette("pastel")
 *
 * // Change to a custom color set, and redefine fly.colors
 * // To use the custom colors
 * fly.color.palette({
 *      name: "my color set", set: [
 *          ['ruby','#F04510','#FF7070','#FFD3C0'],
 *          ['orange','#F28614','#FFB444','#FFE8C0'],
 *          ['sunshine','#CDB211','#FFFF70','#FFFFC0'],
 *          ['grass','#42622D','#89C234','#C0FFC0'],
 *          ['berry','#00597C','#00A9EB','#B0E5FF'],
 *          ['very berry','#6F006F','#9F3DBF','#FFC0FF'],
 *          ['clouds','#383633','#A7A097','#FFFFFF']
 *      ]
 * })
 *
 * fly.color.palette()
 * // returns "my color set"
 *
 * @param  {String, Object} args See examples
 *
 * @extends color
 *
 */

fly.color.palette = function(args){

    var
        i,
        index = -1;

    // If no-args passed, return existing palette
    if (!args) {
        return fly.color._paletteName;
    }

    function checkSet(p) {
        // sanity type check args args:
        if (!p.name || !p.set) {
            return 'Palette must have a name and a set';
        }
        if (typeof p.name !== "string") {
            return 'Palette name must be string';
        }
        if (p.set instanceof Array === false) {
            return 'Palette set must be an array';
        }
        for (i=0; i < p.set.length; i++) {
            if (p.set[i] instanceof Array === false || p.set[i].length !== 4) {
                return 'Palette set of unknown type';
            }
            if (fly.color.reserved.indexOf(p.set[i][0]) > -1) {
                p.set[i][0] = p.set[i][0] + '_color';
            }
        }
        return true;
    }

    function findInSet(n) {
        for (i=0; i < fly.colorSets.length; i++) {
            if (fly.colorSets[i].name === n) {
                return i;
            }
        }
        return -1;
    }

    // type check args, add set to colorSets if new

    function prepSet() {

        var check;

        if (typeof args === "object" && args.name && args.set ) {
            check = checkSet(args);
            if (check !== true) {
                throw new TypeError (check);
            }
            index = findInSet(args.name);
            if (index === -1) {
                // create a new set
                index = fly.colorSets.length;
                fly.colorSets.push(args);
            } else {
                // replace old set with new one
                fly.colorSets[index].set = args.set;
            }

        } else if (typeof args === "string") {
            index = findInSet(args);
            if (index === -1) {
                index = 0; // use default set
            }
        } else {
            return new TypeError ('Unknown type sent as args to color palette');
        }
    }

    // rebuild fly.Color with the new palette

    function resetColor(colorSet) {

        fly.color._paletteName = colorSet.name;

        var newInfo = {palette : {val: "_paletteName", type: "val"}},
            spec,
            v;
        for (var i=0; i < colorSet.set.length; i++) {
            spec = colorSet.set[i];
            v = spec[1] + '-' + spec[2] + '-' + spec[3];
            newInfo[spec[0]] = {val:v,type:"string"};
        }
        fly.grantInfo(fly.color).addInfo(newInfo);
    }

    // After sanity checks, load the color set into fly.colors

    function setPalette() {

        // spec: color spectrum array ['red',#000000,#FF0000,#FFFFFF]
        // colorSet: name and a set of spectrum arrays (see fly.colorSet)
        var spec,
            colorSet;

        try {
            prepSet();
        }

        catch(e) {

            // string passed doesn't match a preset, so
            // we set it to the default
            if (fly.color._paletteName === "not yet defined") {
                index = 0;

            // args are of an unknown type, return an
            // error without changing anything
            } else {
                return(e);
            }
        }

        colorSet = fly.colorSets[index];
        resetColor(colorSet);

        for (i=0; i < colorSet.set.length; i++) {
            spec = colorSet.set[i];
            fly.color[spec[0]] = fly.colorUtil.spectrum(spec[0],spec[1],spec[2],spec[3]);
        }
    }

    setPalette();

};

// TODO:
// define reserved color words [palette,_palette,add,remove]
// add colors to current set: fly.color.add(...)
// add into current in colorSets


