/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/

/*
 component testing: paper is setup, but flypaper init is not called.
*/

window.onload = function() {
	// start by initializing Paper.js
	var canvas = document.getElementById('ctx');
	paper.setup(canvas);

test("ToString", 10, function(){
	equal(fly.toString([0,[1,2,3],[4,5,[6,7]]]),
		"[0,object,object]", "toString Method should match");
	equal(fly.toString([0,[1,2,3],[4,5,[6,7]]],1),
		"[0,[1,2,3],[4,5,object]]", "toString Method should match");
	equal(fly.toString([0,[1,2,3],[4,5,[6,[7]]]],2),
		"[0,[1,2,3],[4,5,[6,object]]]", "toString Method should match");
	equal(fly.toString([0,[1,2,3],[4,5,[6,[7]]]],3,0),
		"[0,[1,2,3],[4,5,[6,[7]]]]", "toString Method should match");
	equal(fly.toString({a:0,b:[0,[1,2,3],[4,5,{"six":6,"seven":"seven"}]]}),
		'{"a":0,"b":object}', "toString Method should match");
	equal(fly.toString({a:0,b:[0,[1,2,3],[4,5,{"six":6,"seven":"seven"}]]},1),
		'{"a":0,"b":[0,object,object]}', "toString Method should match");
	equal(fly.toString({a:0,b:[0,[1,2,3],[4,5,{"six":6,"seven":"seven"}]]},2),
		'{"a":0,"b":[0,[1,2,3],[4,5,object]]}', "toString Method should match");
	equal(fly.toString({a:0,b:[0,[1,2,3],[4,5,{"six":6,"seven":"seven"}]]},3),
		'{"a":0,"b":[0,[1,2,3],[4,5,{"six":6,"seven":"seven"}]]}',
		"toString Method should match");
	var tester = fly.base();
	equal(fly.toString(tester,2),
		'{"name":"fly base","version":"0.5beta",register(),toString(),addInfo(),deleteInfo(),info(),registerEvent(),deregisterEvent(),eventCall(),logEvents()}',
		"toString Method should match");
	equal(tester.toString(1),
		'{"name":"fly base","version":"0.5beta",register(),toString(),addInfo(),deleteInfo(),info(),registerEvent(),deregisterEvent(),eventCall(),logEvents()}',
		"toString Method should match");
});

test("Granting Info", 10, function(){
	var dummy = {name:"dummy",age:"20",IQ:"400"};
	fly.grantInfo(dummy).addInfo({age:{val:"age",type:"val"},IQ:{val:dummy.IQ,type:"string"}});
	ok(dummy.info,"should have info packet after granting info");
	strictEqual(fly.toString(dummy.info(),2),
		'{"name":"dummy","version":{"val":"0.5beta","type":"version"},"age":{"val":"20","type":"val"},"IQ":{"val":"400","type":"string"}}',
		"Should be able to add 'val' and 'string' types to info packet");

	dummy.age = "40";
	dummy.IQ = "500";
	strictEqual(fly.toString(dummy.info(),2),
		'{"name":"dummy","version":{"val":"0.5beta","type":"version"},"age":{"val":"40","type":"val"},"IQ":{"val":"400","type":"string"}}',
		"Should be able to update 'val' types in info packet and not string types");
	dummy.IQ = "400";

	dummy.deleteInfo("age");
	strictEqual(fly.toString(dummy.info(),2),
		'{"name":"dummy","version":{"val":"0.5beta","type":"version"},"IQ":{"val":"400","type":"string"}}',
		"Should be able to update 'val' types in info packet");
	strictEqual(dummy.age, "40", "deleteInfo should not affect object properties");

	dummy.smart = false;
	dummy.dumb = true;
	dummy.addInfo({smart:{val:"smart", type: "bool"},dumb:{val:"dumb", type: "bool"}});
	strictEqual(fly.toString(dummy.info(),2),
		'{"name":"dummy","version":{"val":"0.5beta","type":"version"},"IQ":{"val":"400","type":"string"},"smart":{"val":false,"type":"bool"},"dumb":{"val":true,"type":"bool"}}',
		"Should be able to add 'bool' types to info packet");

	dummy.smart = true;
	dummy.dumb = false;
	strictEqual(fly.toString(dummy.info(),2),
		'{"name":"dummy","version":{"val":"0.5beta","type":"version"},"IQ":{"val":"400","type":"string"},"smart":{"val":true,"type":"bool"},"dumb":{"val":false,"type":"bool"}}',
		"Should be able to update 'bool' types in the info packet");

	dummy.deleteInfo(["smart","dumb"]);
	strictEqual(fly.toString(dummy.info(),2),
		'{"name":"dummy","version":{"val":"0.5beta","type":"version"},"IQ":{"val":"400","type":"string"}}',
		"Should be able to delete multiple values from the info packet");

	dummy.doubleIQ = function() { return this.IQ * 2; };
	dummy.addInfo({doubleIQ:{val:'doubleIQ',type:'func'}});
	strictEqual(fly.toString(dummy.info(),2),
		'{"name":"dummy","version":{"val":"0.5beta","type":"version"},"IQ":{"val":"400","type":"string"},"doubleIQ":{"val":800,"type":"val"}}',
		"Should be able to add 'func' types to info packet and call a function");

	dummy.addInfo({age:{val:"age",type:"val"}}).deleteInfo("IQ").deleteInfo("doubleIQ");
	strictEqual(fly.toString(dummy.info(),2),
		'{"name":"dummy","version":{"val":"0.5beta","type":"version"},"age":{"val":"40","type":"val"}}',
		"Should be able to add 'func' types to info packet and call a function");

});

test("Granting Events", 4, function(){
	// test subscribing / unsubscribing with eventController
	ok(fly.eventCtrlr, "fly event controller exists");
	var dummy = {};
	fly.grantEvents(dummy);
	fly.grantString(dummy);
	dummy.registerEvent({frame:'update','i-key':'showInfo'});
	equal(fly.eventCtrlr.logEvents(),
		'{"frame":object,"i-key":object}','should be able to register for events');
	dummy.deregisterEvent('i-key');
	equal(fly.eventCtrlr.logEvents(),
		'{"frame":object}','should be able to deregister from events');
	dummy.registerEvent({'i-key':'showInfo'}).deregisterEvent('all');
	equal(fly.eventCtrlr.logEvents(),
		'{}','events in EC should match');
});

test("Fly Base", 4, function(){

	var base = fly.base();

	strictEqual( base.toString(),
		'{"name":"fly base","version":"0.5beta",register(),toString(),addInfo(),deleteInfo(),info(),registerEvent(),deregisterEvent(),eventCall(),logEvents()}',
		"Base should have a toString method");

	strictEqual( fly.toString(base.info(),2),
		'{"name":"fly base","version":{"val":"0.5beta","type":"version"}}',
		"Base should have info packet with name and version");

	base.addInfo({"foo":{"val":"bar","type":"string"}});
	strictEqual( fly.toString(base.info(),2),
		'{"name":"fly base","version":{"val":"0.5beta","type":"version"},"foo":{"val":"bar","type":"string"}}',
		"Base should respond to addInfo method for string type");

	base.deleteInfo("foo");
	strictEqual( fly.toString(base.info(),2),
		'{"name":"fly base","version":{"val":"0.5beta","type":"version"}}',
		"Base should respond to deleteInfo method");


});

test("Building Layers", function(){
	function resetStage() {
		paper.project.remove();
		delete fly.layers;
		new paper.Project();
	}
	function buildLayers (layers,background) {
		var n;
		if (typeof layers === "number") {
			n = layers > 0 ? layers : 1;
		} else if (layers instanceof Array ) {
			n = layers.length;
		}
		n = background ? n + 2 : n + 1;
		fly.initLayers(layers,background);
		if (background) {
			ok(fly.layer("background"),"Should have background layer");
			equal(fly.layers.names[0], "background", "Background should be layer zero");
		} else {
			equal(fly.layers.names.indexOf("background"), -1, "Shouldn't have background layer");
		}
		ok(fly.layers, "fly.layers exists");
		ok(fly.layers.stage[0], "The stage layer exists.");
		ok(fly.layer("info"), "The info layer exists.");

		strictEqual(fly.layers.stage.length, n,
			"'" + layers + ' and background is ' + background + "' should create " + n+ " stage layer.");
		strictEqual(paper.project.layers.length, n,
			"'" + layers + ' and background is ' + background + "' should create " + n + " paper layers.");
		resetStage();
	}
	var i;
	if (fly.layers !== undefined) {
		resetStage();
	}
	for (i=0; i < 3; i++) {
		buildLayers(i,true);
	}
	for (i=0; i < 3; i++) {
		buildLayers(i,false);
	}
	buildLayers(["Mo","Larry","Curly"],true);
	buildLayers(["Keaton","Arbuckle"],false);
});

test("Color Utilities", 13, function(){

	ok(fly.color, "color exists");
	ok(fly.colorUtil, "color Util exists");

	equal(fly.colorUtil.limit(700),255,"color should be limited to 255 max");
	equal(fly.colorUtil.limit(-70),0,"color should be limited to 0 min");
	deepEqual(fly.colorUtil.split("#102030"),[16,32,48],"hex color should be split into RGB");
	strictEqual(fly.colorUtil.splice([16,32,48]),"#102030","color array should translate to hex string");
	strictEqual(fly.colorUtil.mix("#F000FF","#0df0ff"),"#7e78ff","should mix to hex string");
	strictEqual(fly.colorUtil.totalValue("#102030"),96,"should add r g b together from hex color");

	deepEqual(fly.colorUtil.spectrum("dark-grey","#000000","#222222",3),
		["#000000","#111111","#222222"],"color in array should match");

	deepEqual(fly.colorUtil.bispectrum("#000000","#FFFFFF",5),
		["#000000","#3f3f3f","#7f7f7f","#bfbfbf","#FFFFFF"],"colors in array should match");

	deepEqual(fly.colorUtil.trispectrum("#000000","#FF00FF","#FFFFFF"),
		["#000000","#3f003f","#7f007f","#bf00bf","#FF00FF","#ff3fff","#ff7fff","#ffbfff","#FFFFFF"],
		"colors in array should match");

	deepEqual(fly.colorUtil.trispectrum("#000000","#FF00FF","#FFFFFF",5),
		["#000000","#7f007f","#FF00FF","#ff7fff","#FFFFFF"],
		"colors in array should match");

	deepEqual(fly.colorUtil.spectrum("rainbow", "#000000","#FF00FF","#FFFFFF"),
		["#000000","#3f003f","#7f007f","#bf00bf","#FF00FF","#ff3fff","#ff7fff","#ffbfff","#FFFFFF"],
		"colors in array should match");

});

test("Color Palette", 10, function(){
	ok(fly.color.palette, "colorPalette should exist");
	strictEqual(fly.color.palette(),"not yet defined","should return colorPalette name as undefined");
	fly.color.palette("neon");
	strictEqual(fly.color.palette(),"neon","should return color palette name");
	strictEqual(fly.color.red[4],"#FF0023","should return predefined color");

	var drab = { name: "drab", set: [
		['red','#000000','#FF8080','#FFDDDD'],
		['green','#000000','#80FF80','#DDFFDD'],
		['palette','#000000','#8080FF','#DDDDFF'],
		['grubby','#000000','#808080','#FFFFFF']
		]};
	fly.color.palette(drab);
	strictEqual(fly.color.palette(),"drab","palette name should be drab");
	strictEqual(fly.color.red[4],"#FF8080","should return redefined color");
	strictEqual(fly.color.palette_color[4], "#8080FF", "should append reserved words with '_color'");
	strictEqual(fly.color.grubby[8], "#FFFFFF", "should return custom named colors");
	strictEqual(fly.layers, undefined, "(test to confirm there is no background layer)");
	strictEqual(fly.color.background(), "no background layer", "Should confirm absence of background layer");
});

test("Info Controller", function() {
	fly.grantInfo(fly);
	fly.initLayers();
	fly.infoCtrlrInit();
	ok(fly.infoCtrlr, "InfoCtrlr should exist");

});



}; // end window on-load

