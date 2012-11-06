/*
 * This file is part of the flypaper.js build. 
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

/*
 * fly base is the starting point for most fly
 * objects. Through mixins it has the ability to create the info
 * object that the info controller requests, and can
 * add and delete items from the list.
 */

fly.base = (function(){

	var name =  "fly base",
		version =  "0.5beta";

	return {
		name: name,
		version: version
	};

})();

fly.grantString(fly.base);
fly.grantInfo(fly.base);
