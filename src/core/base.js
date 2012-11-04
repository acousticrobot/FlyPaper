/*
 * This file is part of the flypaper.js build. 
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

fly.base = (function(){

	var name =  "fly base",
		version =  "0.5beta",
		property =  "my property";

	var infoArray = [
		{name:"props",val:property,type:"string"}
	];

	function info(){
		var i = {},
			el;
		i.name = name;
		i.version = { val: version, type: "version"};
		for (el in infoArray) {
			var n = el.name,
				val = el.val,
				type = el.type;
			i[n] = {"val":val,"type":type};
		}
		return i;
	}

	return {
		name: name,
		version: version,
		infoArray: infoArray,
		info: info
	};

})();

fly.grantString(fly.base);
