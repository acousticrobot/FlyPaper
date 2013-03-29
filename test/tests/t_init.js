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
	ok(fly.layer("background"), "The background layer exists.");
	ok(fly.layers.stage, "The stage array exists.");
	ok(fly.layer("info"), "The info layer exists.");
	ok(fly.color, "fly color exists");
	ok(fly.color.palette, "fly color palette exists");
	ok(fly.eventCtrlr, "fly event controller exists");
	ok(fly.infoCtrlr, "fly info controller exists");
});

test("color", 3, function(){
	equal(fly.color.background(), "no background color set", "color confirms no background color");
	equal(fly.color.background("00FF00"), "rgba(0, 255, 0, 1)", "color background return confirms new background color");
	equal(fly.color.background(), "rgba(0, 255, 0, 1)", "new background color should have been set");
});

test("infoCtrlr", 1, function(){
	var ICinfo = fly.infoCtrlr.info();
	var members = ICinfo.members;
	equal(members.val,5, "the IC should have five members");
});

}; // end window on-load