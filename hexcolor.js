"use strict"
var fly = {};

fly.color = (function() {
// version 0.4
// color utility with methods for reading hex color values
// and stored color presets.  Preset color arrays are made
// out of three values: darkest/saturated/lightest a linear
// progression is made from both ends towards the middle.
// Color arrays are 9 segments in length stored in arrays. 
// presets can be altered and new sets made through the
// public method trispectrum:
//	fly.color.rainbow = fly.color.trispectrum('#FF0000','#00FF00','0000FF')
// common variables: 
//	col is used for passed hex color values, ex. "#789ABC"
// 	cola for color arrays, [r,g,b] ex [0,127,255]

	var name = "infoCtrlr",
		version = "0.3.7beta";

	function limit(col){
	    // limit col between 0 and 255
	    // color is any int
	    return col = Math.min(Math.max(col, 0),255);
	};
	
	function split(hexCol){
	    // split a hex color into array [r,g,b]
	    //assumes hex color w/ leading #
	    var col = hexCol.slice(1);
	    var col = parseInt(col,16);
	    var r = (col >> 16);
	    var g = ((col >> 8) & 0xFF);
	    var b = (col & 0xFF);
	    return([r,g,b]);
	};
	
	function splice(cola){
		// takes a cola and returns the hex string value
	    // cola is a color array [r,g,b], are all int
	    var r = cola[0],
	        g = cola[1],
	        b = cola[2];
	    var splice = ((r << 16) | (g << 8) | b ).toString(16);
	    // if r < 10, pad with a zero in front
	    while (splice.length < 6) {
	        splice = "0" + splice
	    }
	    splice = "#" + splice;
	    return splice;    
	};
	
	function mix(col1,col2,amt){
	    // mixes 2 hex colors together, amt (0 to 1) determines ratio
	    // amt defaults to .5, mixes 50/50

	    var amt = amt !== undefined ? amt : 0.5; 
	    var col1a = split(col1),
	        col2a = split(col2);
	    for (var i=0; i < col1a.length; i++) {
	        col1a[i] = (col1a[i]*(1-amt)) + (col2a[i]*(amt));
	    };
	    return splice(col1a);
	};
	
	function spectrum(col1,col2,seg){
		// takes two colors, returns array of seg sements
		// each a hex color. sent colors are first and last 
		// colors in the array
		var seg = seg !== undefined ? seg : 5;
	    if (seg < 3) {
	        return [col1,col2];
	    };
	    var spec = [col1];
	    for (var i=1; i < seg-1; i++) {
	        spec.push(mix(col1,col2,i/(seg-1)))
	    };
	    spec.push(col2);
	    return spec;
	};
	
	function trispectrum(col1,col2,col3){
		// takes three hex colors and creates a 9 segment spectrum
		// made for bringing saturated colors to light and dark
		// standard use: (lightest, saturated, darkest)
		// sent colors are first, middle, and last of the array
		var lights = spectrum(col1,col2),
			darks = spectrum(col2,col3);
			// remove duplicate color in middle and merge
			lights.pop();
			var spec = lights.concat(darks);	
			return spec;
	};
		
	return {
		// LEGACY COLORS:
		bkg: ["#00A9EB","#B0E5FF"], 
		main: ["#FDE8A3","#8A8A39","#C6F063","#FF77CD"],
		outln: ["#666666"],
		selected: [],
		info : { // colors used by infoCtrlr
				title:	"#9BCAE1",	// sky blue
				val:	"#89C234",	// apple green
				btrue: "#66FF99",	// aqua
				bfalse: "#3D9199", // dull aqua
				event:	"#BC4500",
				eventFiring: "#FF5E00",
				version:"#8A8A39",	// pine green
				info:	"#8A8A39",
				screen: "#0D1927",	// skim milk
				bar:	"black"
		},
			// preset color arrays
		red : trispectrum('#400000','#FF0000','#FFC0C0'),
		orange : trispectrum('#402900','#FFA500','#FFE8C0'),
		yellow : trispectrum('#404000','#FFFF00','#FFFFC0'),
		green : trispectrum('#004000','#00FF00','#C0FFC0'),
		blue : trispectrum('#000040','#0000FF','#C0C0FF'),
		purple: trispectrum('#400040','#800080','#FFC0FF'),
		mono : trispectrum('#000000','#808080','#FFFFFF'),
			// public methods 
		mix : mix,
		spectrum : spectrum,
		trispectrum : trispectrum		
	};
	
})();

document.write("red = " + fly.color.red + '</br>');
document.write("orange = " + fly.color.orange + '</br>');
document.write("yellow = " + fly.color.yellow + '</br>');
document.write("green = " + fly.color.green + '</br>');
document.write("blue = " + fly.color.blue + '</br>');
document.write("purple = " + fly.color.purple + '</br>');
document.write("mono = " + fly.color.mono + '</br>');
fly.color.red = fly.color.trispectrum('#AABBCC','#FFFFFF','#DD0000');
document.write("red2 = " + fly.color.red + '</br>');
