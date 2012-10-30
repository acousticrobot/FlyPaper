/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/

/*
	======== A Handy Little QUnit Reference ========
	http://docs.jquery.com/QUnit

	Test methods:
		expect(numAssertions)
		stop(increment)
		start(decrement)
	Test assertions:
		ok(value, [message])
		equal(actual, expected, [message])
		notEqual(actual, expected, [message])
		deepEqual(actual, expected, [message])
		notDeepEqual(actual, expected, [message])
		strictEqual(actual, expected, [message])
		notStrictEqual(actual, expected, [message])
		raises(block, [expected], [message])
*/	
test("head", 2, function(){
	ok(paper, "paper exsits");
	ok(fly, "fly namespace exists");
});

test("layers", function(){
	function buildLayers (stageLayers) {
		fly.initLayers(stageLayers);
		var n = stageLayers || 1;
		ok(fly.layers, "fly.layers exists");
		ok(fly.layers.background, "The background layer exists.");
		ok(fly.layers.stage[0], "The stage layer exists.");
		ok(fly.layers.infoLayer, "The info layer exists.");
		strictEqual(fly.layers.stage.length, n, "'" + stageLayers + "' should create " + n + " stage layer.");
		strictEqual(paper.project.layers.length, n + 2, "'" + stageLayers + "' should create " + (n + 2) + " paper layers.");
		paper.project.remove();
		fly.layers.remove();
		new paper.Project();
	}
	buildLayers(1);
	for (var i=0; i < 3; i++) {
		buildLayers(i);
	}
});

test("color", 1, function(){
	ok(fly.color, "fly.color exists");
});
test("color palette", 1, function(){
	ok(fly.colorPalette, "fly.colorPalette exists");
});

test("eventCtrlr", 1, function(){
	fly.eventCtrlrInit();
	ok(fly.eventCtrlr, "fly event controller exists");
});

test("infoCtrlr", 1, function(){
	fly.init();
	ok(fly.infoCtrlr, "fly info controller exists");
});