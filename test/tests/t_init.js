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
	fly.init({debug:true});

module("test init");

test("the build", 11, function(){
	ok(paper, "paper exists");
	ok(fly, "fly namespace exists");
	equal(fly.debug,true, "fly.debug should be true");
	ok(fly.layers, "fly.layers exists");
	ok(fly.layers.background, "The background layer exists.");
	ok(fly.layers.stage[0], "The stage layer exists.");
	ok(fly.layers.infoLayer, "The info layer exists.");
	ok(fly.color, "fly.color exists");
	ok(fly.colorPalette, "fly.colorPalette exists");
	ok(fly.eventCtrlr, "fly event controller exists");
	ok(fly.infoCtrlr, "fly event controller exists");
});

test("infoCtrlr", 1, function(){
	var ICinfo = fly.infoCtrlr.info();
	var members = ICinfo.members;
	equal(members.val,3, "the IC should have three members");
});

}; // end window on-load