/*
 * This file is part of the flypaper.js build.
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

/*
 * ## color Util Methods
 * Initialize color utility with methods for reading hex values
 * and stored color presets.  Preset color arrays are made
 * out of three values: darkest/saturated/lightest, two linear
 * progression are made from the ends to the middle value.
 * Color arrays default to 9 segments in length.
 * Presets can be altered and new sets made through the
 * public method spectrum.
 * example use:
 * rainbow = fly.colorUtil.spectrum('#FF0000','#00FF00','0000FF',13);
 * This creates an 13 segment color spectrum, rainbow[7] == '#00FF00'
 * *common variables:*
 * col is used for passed hex color values, ex. "#789ABC"
 * cola for color arrays, [r,g,b] ex [0,127,255]
*
*/

fly.colorUtil = {

	limit : function(col){
		// limit col between 0 and 255
		// color is any int
		col = Math.min(Math.max(col, 0),255);
		return col;
	},

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

	mix : function(col1,col2,amt){
		// mixes 2 hex colors together, amt (0 to 1) determines ratio
		// amt defaults to .5, mixes 50/50

		amt = amt !== undefined ? amt : 0.5;
		var col1a = this.split(col1),
			col2a = this.split(col2);
		for (var i=0; i < col1a.length; i++) {
			col1a[i] = (col1a[i]*(1-amt)) + (col2a[i]*(amt));
		}
		return this.splice(col1a);
	},

	totalValue  : function(col) {
		// adds the R,G,B values together
		var cola = this.split(col);
		return cola[0] + cola[1] + cola[2];
	},

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

	trispectrum : function(col1,col2,col3,seg) {
		// takes three hex colors and creates a (default 9)
		// segment spectrum. made for bringing saturated
		// colors to light and dark.
		// standard use: (lightest, saturated, darkest)
		// sent colors are first, middle, and last of the array
		// spectrum length defaults to 9, and will always be odd
		seg = seg !== undefined ? seg : 9;
		var midseg = Math.ceil(seg/2);
		var lights = this.bispectrum(col1,col2,midseg),
			darks = this.bispectrum(col2,col3,midseg);
			// remove duplicate color in middle and merge
			lights.pop();
			var spec = lights.concat(darks);
			return spec;
	},

	spectrum : function(name,col1,col2,col3,seg) {
		// name: string for name of color set
		// send two hex colors for a bispectrum
		// three colors for a trispectrum
		// possible args sent:
		//	(name,col1,col2)
		//	(name,col1,col2,seg)
		//	(name,col1,col2,col3)
		//	(name,col1,col2,col3,seg)
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

	background : function(col) {
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
