/*
 * This file is part of the flypaper.js build. 
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

/*
 * fly base is the starting point for most fly
 * objects. It has the ability to create the info
 * object that the info controller requests, and can
 * add and delete items from the list.  It also
 */

fly.base = (function(){

	var name =  "fly base",
		version =  "0.5beta";
		
	// store the properties sent to infoController via call to info()
	var _info = {
		version : { val: version, type: "version"}
	};

	function mergeInfo (i,args) {
		// private utility to add object in args to info i
		var el, v, t;
		for (el in args) {
			if (args[el].val && args[el].type) {
				v = args[el].val,
				t = args[el].type;
				i[el] = {"val":v,"type":t};
			}
		}
		return i;
	}
	
	function addInfo(args){
		// add property to track to the infoArray
		// ex. args = {info1:{val:"sam",type:"i am"}}
		// ex. args = {info1:{val:"sam",type:"i am"},info2:{val:"foo",type:"bar"}}
		mergeInfo(_info,args);
	}
	
	function deleteInfo(args) {
		// delete existing property from the infoArray
		// ex args = "sam" || ["sam","foo"]
		if (typeof args === "string") {
			delete _info[args];
		} else if (args instanceof Array) {
			var el;
			for (var i=0; i < args.length; i++) {
				if (args[i] in _info) {
					delete _info[args[i]];
				};
			};
		}
	}
		
	function info(){
		// method called by the InfoCtrlr, should return:
		// { name: "name", var1:{val: var1, type:"val"},var2:{..}..},
		var i = {},
			el;
		i.name = name;
		i = mergeInfo(i,_info);
		return i;
	}

	return {
		name: name,
		version: version,
		info: info,
		addInfo: addInfo,
		deleteInfo: deleteInfo
	};

})();

fly.grantString(fly.base);
