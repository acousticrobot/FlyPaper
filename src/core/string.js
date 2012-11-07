/*
 * This file is part of the flypaper.js build. 
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

/*
 * To String recursive method, use through
 * fly.toString(object) or use mixin to 
 * grant string control
*/

fly.toString = function(args,toDepth,currDepth) {
	// initial depth = 0, toDepth is the last depth examined
	args = args || this;
	var s = "",
		p,
		ends = "",
		isarray = false;
	if (args instanceof Array) {
		s += "[";
		isarray = true;
		ends = "]";
	} else if (typeof args === "object") {
		s += "{";
		ends = "}";
	}
	toDepth = toDepth || 0;
	currDepth = currDepth || 0;
	for (p in args) {
		if (args.hasOwnProperty(p)) {
			if (!isarray && typeof args[p] !== "function") {
				s += '"' + p + '":';
			}
			if (typeof args[p] === "function") {
				s += p + "()";
			} else if (typeof args[p] === "object") {
				if (currDepth < toDepth) {
					s += fly.toString(args[p],toDepth,currDepth+1);
				} else {
					s += "object";
				}
			} else if (typeof args[p] === "string") {
				s += '"' + args[p] + '"';
			} else {
				s += args[p];
			}
			s += ",";
		}
	}
	if (s.length > 1) {
		s = s.slice(0,-1);
	}
	s += ends;
	return s;
};

fly.grantString = function(o) {
	o.toString = function(depth){
		return fly.toString(this,depth,0);
	};
	return o;
};
