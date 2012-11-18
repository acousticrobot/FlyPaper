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

fly.base = function(n){
	var o = {};
	o.name =  n || "fly base",
	o.version =  "0.5beta";

	o.register = function () {
		fly.infoCtrlr.register(this);
		return this;
	};

	fly.grantString(o);
	fly.grantInfo(o);
	fly.grantEvents(o);
	return o;
};

