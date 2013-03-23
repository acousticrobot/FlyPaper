/*
 * This file is part of the flypaper.js build.
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

/**
 * The Color Utility is created on {@link fly.init}.
 *
 *
 * @class
 * @classDesc
 * The Color Utility has methods for reading and manipulating
 * hex values and creating color presets.  Preset color arrays
 * are made out of three values, typically
 * darkest, saturated, lightest.  Two linear progressions
 * are made from the ends to the middle value.
 * Color arrays default to 9 segments in length. Presets can
 * be altered and new sets made through the {@link colorUtil.spectrum}.
 *
 */

fly.colorUtil = {

    /**
     *
     * Computation to make sure
     * color calculations don't pass color
     * limits. Bounded between 0 and 255
     *
     * @param  {Integer} col
     * @return {Integer}     integer limited between 0 and 255
     */
    limit : function(col){
        // limit col between 0 and 255
        // color is any int
        col = Math.min(Math.max(col, 0),255);
        return col;
    },

    /**
     * Splits a hex color into an [r,g,b] array
     * @param  {Hex Color String} hexCol
     * @return {Array}
     *
     * *Note: These rgb values are between 0 and 255,
     * and do not translate into paper.js rgb values
     * which range between 0 and 1*
     *
     * @example
     * fly.colorUtil.split("#102030")
     * // returns [16,32,48]
     */
    split : function(hexCol){
        // split a hex color into array [r,g,b]
        //assumes hex color w/ leading #
        var col = hexCol.slice(1);
        col = parseInt(col,16);
        var r = (col >> 16);
        var g = ((col >> 8) & 0xFF);
        var b = (col & 0xFF);
        return([r,g,b]);
    },

    /**
     * Splices an RGB array [r,g,b] into a hex color
     * @param  {Array} cola
     * @return {Hex Color String}
     *
     * *Note: These rgb values are between 0 and 255,
     * and do not translate into paper.js rgb values
     * which range between 0 and 1*
     *
     * @example
     * fly.colorUtil.split([16,32,48])
     * // returns "#102030"
     */
    splice : function(cola){
        // takes a cola and returns the hex string value
        // cola is a color array [r,g,b], are all int
        var r = cola[0],
            g = cola[1],
            b = cola[2];
        var s = ((r << 16) | (g << 8) | b ).toString(16);
        // if r < 10, pad with a zero in front
        while (s.length < 6) {
            s = "0" + s;
        }
        s = "#" + s;
        return s;
    },

    /**
     * mixes 2 hex colors together
     * @param  {Hex Color String} col1
     * @param  {Hex Color String} col2
     * @param  {Float between 0 and 1} [ratio=0.5] Determines ratio color 1 to color 2
     * @return {Hex Color String}
     */
    mix : function(col1,col2,ratio){

        ratio = ratio !== undefined ? ratio : 0.5;
        var col1a = this.split(col1),
            col2a = this.split(col2);
        for (var i=0; i < col1a.length; i++) {
            col1a[i] = (col1a[i]*(1-ratio)) + (col2a[i]*(ratio));
        }
        return this.splice(col1a);
    },

    /**
     * Returns the r g b values (0 -255)
     * added together for a total value. Useful for
     * comparing color values disregarding the hue
     *
     * @param  {[type]} col [description]
     * @return {[type]}     [description]
     */
    totalValue  : function(col) {
        // adds the R,G,B values together
        var cola = this.split(col);
        return cola[0] + cola[1] + cola[2];
    },

    /*
     * Creates a spectrum of hex colors
     * @param  {Hex Color String} col1 First color in the spectrum
     * @param  {Hex Color String} col2 Last color in the spectrum
     * @param  {Integer} [seg=5] Number of colors in the spectrum
     * @return {Array}
     *
     * @private
     */

    bispectrum : function(col1,col2,seg){
        // takes two colors, returns array of seg sements
        // each a hex color. sent colors are first and last
        // colors in the array
        seg = seg !== undefined ? seg : 5;
        if (seg < 3) {
            return [col1,col2];
        }
        var spec = [col1];
        for (var i=1; i < seg-1; i++) {
            spec.push(this.mix(col1,col2,i/(seg-1)));
        }
        spec.push(col2);
        return spec;
    },

    /*
     * takes three hex colors and creates a (default 9)
     * segment spectrum. Made for bringing saturated
     * colors to light and dark.
     * standard use: (lightest, saturated, darkest)
     * sent colors are first, middle, and last of the array
     * spectrum length defaults to 9, and will always be odd*
     *
     * @param  {Hex Color String} col1 First color in the spectrum
     * @param  {Hex Color String} col2 Middle color in the spectrum
     * @param  {Hex Color String} col2 Last color in the spectrum
     * @param  {Integer} [seg=9] Number of colors in the spectrum
     * @return {Array}
     *
     * @Private
     */

    trispectrum : function(col1,col2,col3,seg) {

        seg = seg !== undefined ? seg : 9;
        var midseg = Math.ceil(seg/2);
        var lights = this.bispectrum(col1,col2,midseg),
            darks = this.bispectrum(col2,col3,midseg);
            // remove duplicate color in middle and merge
            lights.pop();
            var spec = lights.concat(darks);
            return spec;
    },

    /**
     * Takes two or three hex colors and creates a array of
     * colors. Defaults to 9 segments for three colors and 5 for
     * two colors. Using three colors works well for a creating
     * a color spectrum with a saturated color in the middle.
     * Standard use: (lightest, saturated, darkest)
     * sent colors are first, middle, and last of the array
     * spectrum length defaults to 9, and will always be odd*
     *
     * @param  {String} name
     * @param  {Hex Color String} col1 First color in the spectrum
     * @param  {Hex Color String} col2 Middle or Last color in the spectrum
     * @param  {Hex Color String} [col3] Last color in the spectrum
     * @param  {Integer} [seg] Number of colors in the spectrum
     * @return {[type]}
     *
     * @example
     * fly.colorUtil.spectrum("dark-grey","#000000","#222222",3)
     * // returns ["#00000","#11111","#22222"]
     *
     * fly.colorUtil.spectrum("grey","#00000","#FFFFFF")
     * // returns ["#000000","#3f3f3f","#7f7f7f","#bfbfbf","#FFFFFF"]
     *
     * fly.colorUtil.spectrum("hot-pink","#000000","#FF00FF","#FFFFFF")
     * // returns ["#000000","#3f003f","#7f007f","#bf00bf","#FF00FF","#ff3fff","#ff7fff","#ffbfff","#FFFFFF"]
     *
     * fly.colorUtil.spectrum("pink","#000000","#FF00FF","#FFFFFF",5)
     * // returns ["#000000","#7f007f","#FF00FF","#ff7fff","#FFFFFF"]
     *
     */

    spectrum : function(name,col1,col2,col3,seg) {

        /** @TODO Why is this pushed to colorSets w/o the array? */
        // Should this be removed?
        fly.colorSets.push(name);
        var spec;
        if (col3 !== undefined) {
            if (typeof col3 === "string" ) {
                spec = this.trispectrum(col1,col2,col3,seg);
            } else if (typeof col3 === "number" ) {
                // col3 is actually seg
                spec = this.bispectrum(col1,col2,col3);
            } else {
                seg = this.bispectrum(col1,col2);
            }
        }
        return spec;
    },

    /**
     * Sets the background color, or returns the current
     * background color if no args sent
     * @param  {Hex Color String} [col]
     * @return {Hex Color String}
     * @TODO move into fly.color
     */
    background : function(col) {
        if(!col) {
            if (fly.layers.backRect) {
                return fly.layers.backRect.fillColor;
            }
            return "none set";
        }
        if (fly.layers && fly.layer("background")) {
            if (fly.layers.backRect === undefined) {
                var l = paper.project.activeLayer;
                fly.layers.activate("background");
                fly.layers.backRect = new paper.Path.Rectangle(paper.view.bounds);
                l.activate();
            }
            col = col !== undefined ? col : "#FFFFFF";
            fly.layers.backRect.fillColor = col;
        }
    }

};
