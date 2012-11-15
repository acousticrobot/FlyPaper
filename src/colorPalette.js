/*
 * This file is part of the flypaper.js build.
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */


/*
 * ## Color Palette
 * Populates  fly.color with a colorset.
 * checks args passed on init for color palette info.
 * args can be a string matched against predefined
 * sets of colors in colorSets. args can also be an
 * object containing a name and a color set (see
 * fly.colorSets for the pattern). If the set is
 * legit, it will be added to the colorSets array,
 * if the name exists already, the new set will
 * replace the old.
 *
 * *ex. args:*
 * "neon"
 * {name:"new neon",set:[['red','#400000','#FF0000','#FFC0C0',],...]}
 *
*/


fly.colorPalette = function(args){

	var i,
		index = -1;

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
			if (p.set[i][0] === "palette") {
				return 'palette is a reserved word in color sets';
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

	function prepSet() {
		// type check args, add set to colorSets if new
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
	
	function resetColor(colorSet) {
		fly.color = {
			name: "color",
			palette: colorSet.name
		};
		fly.grantInfo(fly.color).addInfo({
			palette : {val: fly.color.palette, type: "string"}
		});
	}

	function setPalette() {
		// colorSet is an array of color arrays, example:
		// [ ['red','#400000','#FF0000','#FFC0C0',],[.,.,.,.],...]
		var spec,
			colorSet;
		try {
			prepSet();
		}
		catch(e) {
			if (fly.color.palette === "not yet defined") {
				index = 0;
			} else {
				return(e);
			}
		}
		
		colorSet = fly.colorSets[index];
		resetColor(colorSet);
		
		for (i=0; i < colorSet.set.length; i++) {
			spec = colorSet.set[i];
			fly.color[spec[0]] = fly.colorAid.spectrum(spec[0],spec[1],spec[2],spec[3]);
		}
	}

	// If no-args passed, return existing palette
	if (!args) {
		return fly.color.palette;
	}
	
	setPalette();

};

// TODO: add colors to current set: fly.colorPalette.add ...
// add into current in colorSets
// add into fly.color

