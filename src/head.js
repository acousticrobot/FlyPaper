/*
 * This file is part of the flypaper.js build. 
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

var fly = fly === undefined ? {} : fly ;
if (typeof fly !== "object") {
	throw new Error("fly is not an object!");
}
