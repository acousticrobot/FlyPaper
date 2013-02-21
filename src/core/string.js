/*
 * This file is part of the flypaper.js build.
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

/**
 * A recursive method for parsing an object or array to a string. An object can be passed to fly.toString(object),
 * or the method can be granted to an object using grantString.
 *
 * @param  {Object|Array} o The object to parse as string, not used if calling object.toString()
 * @param  {Number} toDepth=0] used to increase the depth of recursion
 * @param  {Number} [currDepth=0] Used by function on recursive call, don't use on initial call
 *
 * @returns {String} A string version of the object or array
 *
 * @example
 * myObject = {a:0,b:[0,[1,2,3],[4,5,{"six":6,"seven":"seven"}]]};
 * // call using an object as a parameter
 * fly.toString(myObject);
 * // returns: '{"a":0,"b":object}'
 * fly.toString(myObject,3);
 * // returns: '{"a":0,"b":[0,[1,2,3],[4,5,{"six":6,"seven":"seven"}]]}'
 *
 * // grant the method to an object
 * fly.grantString(myObject);
 * // then call the method on the object
 * myObject.toString(2)
 * // returns: '{"a":0,"b":[0,[1,2,3],[4,5,object]]}'
 */

fly.toString = function(o,toDepth,currDepth) {
	// initial depth = 0, toDepth is the last depth examined
	o = o || this;
	var s = "",
		p,
		ends = "",
		isarray = false;
	if (o instanceof Array) {
		s += "[";
		isarray = true;
		ends = "]";
	} else if (typeof o === "object") {
		s += "{";
		ends = "}";
	}
	toDepth = toDepth || 0;
	currDepth = currDepth || 0;
	for (p in o) {
		if (o.hasOwnProperty(p)) {
			if (!isarray && typeof o[p] !== "function") {
				s += '"' + p + '":';
			}
			if (typeof o[p] === "function") {
				s += p + "()";
			} else if (typeof o[p] === "object") {
				if (currDepth < toDepth) {
					s += fly.toString(o[p],toDepth,currDepth+1);
				} else {
					s += "object";
				}
			} else if (typeof o[p] === "string") {
				s += '"' + o[p] + '"';
			} else {
				s += o[p];
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

/**
 * Mixin to grant toString method to an object
 * @param {Object} o
 * @returns {Object} with new method toString()
 *
 * @example
 * // grant the method to an object
 * fly.grantString(myObject);
 * // then call the method on the object
 * myObject.toString()
 */
fly.grantString = function(o) {
	o.toString = function(depth){
		return fly.toString(this,depth,0);
	};
	return o;
};
