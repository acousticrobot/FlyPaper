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


test("building layers", function(){
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

test("toString", 10, function(){
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

test("base", 7, function(){
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

test("events", 4, function(){
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
});

test("color", function(){
	ok(fly.color, "color exists");
	ok(fly.colorPalette, "colorPalette exists");
	ok(fly.colorAid, "color aid exists");
	equal(fly.colorAid.limit(700),255,"color should be limited to 255 max");
	equal(fly.colorAid.limit(-70),0,"color should be limited to 0 min");
	deepEqual(fly.colorAid.split("#102030"),[16,32,48],"hex color should be split into RGB");
	strictEqual(fly.colorAid.splice([16,32,48]),"#102030","color array should translate to hex string");
	strictEqual(fly.colorAid.mix("#F000FF","#0df0ff"),"#7e78ff","should mix to hex string");
	strictEqual(fly.colorAid.totalValue("#102030"),96,"should mix componenst of hex color");
	deepEqual(fly.colorAid.bispectrum("#000000","#FFFFFF",5),
		["#000000","#3f3f3f","#7f7f7f","#bfbfbf","#FFFFFF"],"colors in array should match");
	deepEqual(fly.colorAid.trispectrum("#000000","#FF00FF","#FFFFFF"),
		["#000000","#3f003f","#7f007f","#bf00bf","#FF00FF","#ff3fff","#ff7fff","#ffbfff","#FFFFFF"],
		"colors in array should match");
	strictEqual(fly.colorPalette(),"not yet defined","should return color.palette");
	fly.colorPalette("neon");
	strictEqual(fly.color.red[4],"#FF0023","should return color.palette");
	strictEqual(fly.color.palette,"neon","palette name should be neon");
	strictEqual(fly.colorPalette(),"neon","should return color.palette");
	var drab = { name: "drab", set: [
		['red','#000000','#FF8080','#FFDDDD'],
		['green','#000000','#80FF80','#DDFFDD'],
		['pal','#000000','#8080FF','#DDDDFF'],
		['grubby','#000000','#808080','#FFFFFF']
		]};
	fly.colorPalette(drab);
	strictEqual(fly.color.palette,"drab","palette name should be drab");
});

}; // end window on-load