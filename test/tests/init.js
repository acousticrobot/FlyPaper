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


window.onload = function() {
	// start by initializing Paper.js
	var canvas = document.getElementById('ctx');
	paper.setup(canvas);
	fly.init();

module("test init");

test("init", 1, function(){
	ok(fly, "fly namespace exists");
});

module("retest build");

test("head", 2, function(){
	ok(paper, "paper exsits");
	ok(fly, "fly namespace exists");
});

test("layers", function(){
		ok(fly.layers, "fly.layers exists");
		ok(fly.layers.background, "The background layer exists.");
		ok(fly.layers.stage[0], "The stage layer exists.");
		ok(fly.layers.infoLayer, "The info layer exists.");
});

test("color", 1, function(){
	ok(fly.color, "fly.color exists");
});
test("color palette", 1, function(){
	ok(fly.colorPalette, "fly.colorPalette exists");
});

test("eventCtrlr", 1, function(){
	ok(fly.eventCtrlr, "fly event controller exists");
});

test("infoCtrlr", 1, function(){
	ok(fly.infoCtrlr, "fly event controller exists");
});

} // end window on-load