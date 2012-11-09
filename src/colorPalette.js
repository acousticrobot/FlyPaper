/*
 * This file is part of the flypaper.js build.
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */


/*
 * ## ColorPalette
 * Populate the colorspace with a colorset:
 * check args passed on init for color palette info.
 * palette is a string matched against predefined
 * sets of colors. It can also be set to "custom", in
 * which case a second parameter, colorSet, should contain
 * the list of colors to be included in the set.
*/

// palette = "name" || {name:"name",set:[[]...]}
// beta5: add new sets in, check against registry

fly.colorPalette = function(palette){

	var i, _name, _set,
	sets = [
		{ name: "default", set: [
			['red','#400000','#FF0000','#FFC0C0'],
			['orange','#402900','#FFA500','#FFE8C0'],
			['yellow','#404000','#FFFF00','#FFFFC0'],
			['green','#004000','#00FF00','#C0FFC0'],
			['blue','#000040','#0000FF','#C0C0FF'],
			['purple','#400040','#800080','#FFC0FF'],
			['grey','#000000','#808080','#FFFFFF']
		]},
		{ name: "pastel", set: [
			['red','#F04510','#FF7070','#FFD3C0'],
			['orange','#F28614','#FFB444','#FFE8C0'],
			['yellow','#CDB211','#FFFF70','#FFFFC0'],
			['green','#42622D','#89C234','#C0FFC0'],
			['blue','#00597C','#00A9EB','#B0E5FF'],
			['purple','#6F006F','#9F3DBF','#FFC0FF'],
			['grey','#383633','#A7A097','#FFFFFF']
		]},
		{ name: "sunny day", set: [
			['red','#2F060D','#FF361F','#FFCFC5'],
			['orange','#6D3200','#FF8125','#FFD1B6'],
			['yellow','#D6FF43','#FFFA95','#F4FFDA'],
			['green','#3B4D2A','#89C234','#A0FFA0'],
			['blue','#1D3852','#00A9EB','#9BCAE1'],
			['purple','#4C244C','#893DB3','#D0B8FF'],
			['grey','#1E2421','#848179','#D3FFE9']
		]},
		{ name: "monotone", set: [
			['red','#1B1414','#584444','#FFE7E3'],
			['orange','#2A2620','#4D463A','#FFE9CC'],
			['yellow','#313125','#808061','#FAFFE0'],
			['green','#111611','#6E936E','#E7FFD3'],
			['blue','#0A0A0D','#696991','#E5D9FF'],
			['purple','#0D090D','#684E68','#FFE3EC'],
			['grey','#000000','#808080','#FFFFFF']
		]},
		{ name: "neon", set: [
			['red','#6A0032','#FF0023','#FFC0F2'],
			['orange','#BD2E00','#FFA500','#FFE8C0'],
			['yellow','#ACFF02','#FFFF00','#FFFFC0'],
			['green','#133B0F','#38FF41','#BFFF68'],
			['blue','#010654','#013BFF','#4FFFF8'],
			['purple','#3B034C','#9800B3','#CC5FFF'],
			['grey','#0A0511','#696281','#E3E8FF']
		]}
	];

	// don't allow no-args passed to reset existing palette
	// returned defined palette name via fly.color instead
	if (!palette && fly.color.palette !== "not yet defined") {
		return fly.color.palette;
	}

	if (typeof palette === "object" && palette.name && palette.set ) {
		_name = palette.name;
		_set = palette.set;
		
		// error check set here:
		// has 'string', hex, hex, hex, or return
		
		for (i=0; i < sets.length; i++) {
			if (sets[i].name === _name) {
				sets[i].set = _set;
			}
		}
	} else if (typeof palette === "string") {
		_name = palette;
		for (i=0; i < sets.length; i++) {
			if (sets[i].name === _name) {
				_set = sets[i].set;
			}
		}
		if (_set === "undefined") {
			_name = "default";
			_set = sets[0].set;
		}
	} else {
		return new TypeError ('unknown type "palette" on init');
	}

	fly.color.palette = palette;
	fly.color.setPalette(_set);
	fly.color.background();
};
