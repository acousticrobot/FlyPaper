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

test("Base", 7, function(){
	// 1. Check base info object
	var base = fly.base();
	var _i_string = fly.toString(base.info(),2);
	equal(_i_string, '{"name":"fly base","version":{"val":"0.5beta","type":"version"}}',"string should match");
	// 2. Test adding single info
	base.addInfo({"foo":{"val":"bar","type":"string"}});
	_i_string = fly.toString(base.info(),2);
	equal(_i_string, '{"name":"fly base","version":{"val":"0.5beta","type":"version"},"foo":{"val":"bar","type":"string"}}',"string should match");
	// 3. Test deleting single info
	base.deleteInfo("foo");
	_i_string = fly.toString(base.info(),2);
	equal(_i_string, '{"name":"fly base","version":{"val":"0.5beta","type":"version"}}',"string should match");
	// 4. Test adding multiple info
	base.fooval = 5;
	base.addInfo({"foo":{"val":"bar","type":"string"},"ifoo":{"val":"fooval","type":"val"}});
	_i_string = fly.toString(base.info(),2);
	equal(_i_string, '{"name":"fly base","version":{"val":"0.5beta","type":"version"},"foo":{"val":"bar","type":"string"},"ifoo":{"val":5,"type":"val"}}',"string should match");
	// 5. Test info changes with variables
	base.fooval = 6;
	_i_string = fly.toString(base.info(),2);
	equal(_i_string, '{"name":"fly base","version":{"val":"0.5beta","type":"version"},"foo":{"val":"bar","type":"string"},"ifoo":{"val":6,"type":"val"}}',"string should match");
	// 6.Test deleteInfo
	base.deleteInfo(["foo","ifoo"]);
	_i_string = fly.toString(base.info(),2);
	equal(_i_string, '{"name":"fly base","version":{"val":"0.5beta","type":"version"}}',"string should match");
	// 7.Test chaining methods addInfo and deleteInfo
	base.addInfo({"foo":{"val":"bar","type":"string"},"ifoo":{"val":5,"type":"val"}}).deleteInfo(["foo","ifoo"]);
	_i_string = fly.toString(base.info(),2);
	equal(_i_string, '{"name":"fly base","version":{"val":"0.5beta","type":"version"}}',"string should match");
});

test("Events", 4, function(){
	// test subscribing / unsubscribing with eventController
	ok(fly.eventCtrlr, "fly event controller exists");
	var dummy = {};
	fly.grantEvents(dummy);
	fly.grantString(dummy);
	dummy.registerEvent({frame:'update','i-key':'showInfo'});
	equal(fly.eventCtrlr.logEvents(),
		'{"frame":object,"i-key":object}','events in EC should match');
	dummy.deregisterEvent('i-key');
	equal(fly.eventCtrlr.logEvents(),
		'{"frame":object}','events in EC should match');
	dummy.registerEvent({'i-key':'showInfo'}).deregisterEvent('all');
	equal(fly.eventCtrlr.logEvents(),
		'{}','events in EC should match');
});

test("info", function(){
	var dummy = {name:"dummy",age:"20"};
	fly.grantInfo(dummy).addInfo({age:{val:"age",type:"string"}});
	ok(dummy.info,"should have info packet");
	dummy.age = "40";
	// TODO: test the nature of the info packet
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
	ok(fly.color.palette, "colorPalette exists");
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
	strictEqual(fly.color.grubby[8], "#FFFFFF", "Should return custom named colors");
	strictEqual(fly.layers, undefined, "(test to confirm there is no background layer)");
	strictEqual(fly.color.background(), "no background layer", "Should confirm absence of background layer");
});

}; // end window on-load

