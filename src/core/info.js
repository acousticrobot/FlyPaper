/*
 * This file is part of the flypaper.js build. 
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

fly.grantInfo = function(o) {
	// store the properties sent to infoController via call to info()
	var name = o.name || fly.name,
		version = o.version || fly.version,
		_info = {
			version : { val: version, type: "version"}
		};

	function mergeInfo (_i,args) {
		// private utility to add object in args to info i
		var el, v, t;
		for (el in args) {
			if (args[el].val && args[el].type) {
				v = args[el].val,
				t = args[el].type;
				_i[el] = {"val":v,"type":t};
			}
		}
		return _i;
	}

	o.addInfo = function(args){
		// add property to track to the infoArray
		// ex. args = {info1:{val:"sam",type:"i am"}}
		// ex. args = {info1:{val:"sam",type:"i am"},info2:{val:"foo",type:"bar"}}
		mergeInfo(_info,args);
		return o;
	};

	o.deleteInfo = function(args) {
		// delete existing property from the infoArray
		// ex args = "sam" || ["sam","foo"]
		if (typeof args === "string") {
			delete _info[args];
		} else if (args instanceof Array) {
			var el;
			for (var i=0; i < args.length; i++) {
				if (args[i] in _info) {
					delete _info[args[i]];
				}
			}
		}
		return o;
	};

	o.info = function(){
		// method called by the InfoCtrlr, should return:
		// { name: "name", var1:{val: var1, type:"val"},var2:{..}..},
		var _i = {};
		_i.name = name;
		_i = mergeInfo(_i,_info);
		return _i;
	};

	return o;

};
