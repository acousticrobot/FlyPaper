/*
 * This file is part of the flypaper.js build. 
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

fly.base = (function(){

	var name =  "fly base",
		version =  "0.5beta",
		property =  "my property";

	// store the properties sent to infoController via call to info()
	var _info = {
		version : { val: version, type: "version"},
		"props":{val:property,type:"string"}		
	};

	function mergeInfo (i,args) {
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
		// ex. args = {info1:{val:"sam",type:"i am"},info2:{val:"sand",type:"string"}}
		mergeInfo(_info,args);
	}
	
	function deleteInfo(args) {
		var el;
		for (el in args) {
			if (_info[el]) {
				delete _info[el];
			}
		}
	}
	
	
	// method called by the InfoCtrlr, should return:
	// { name: "name", var1:{val: var1, type:"val"},var2:{..}..},
	function info(){
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
		addInfo: addInfo
	};

})();

fly.grantString(fly.base);
