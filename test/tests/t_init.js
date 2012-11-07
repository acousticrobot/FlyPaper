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

test("toString", function(){
	equal(fly.toString([0,[1,2,3],[4,5,[6,7]]]),"[0,object,object]", "toString Method should match");
	equal(fly.toString([0,[1,2,3],[4,5,[6,7]]],1),"[0,[1,2,3],[4,5,object]]", "toString Method should match");
	equal(fly.toString([0,[1,2,3],[4,5,[6,[7]]]],2),"[0,[1,2,3],[4,5,[6,object]]]", "toString Method should match");
	equal(fly.toString([0,[1,2,3],[4,5,[6,[7]]]],3,0),"[0,[1,2,3],[4,5,[6,[7]]]]", "toString Method should match");
	equal(fly.toString({a:0,b:[0,[1,2,3],[4,5,{six:6,seven:"seven"}]]}),"{a:0,b:object}", "toString Method should match");
	equal(fly.toString({a:0,b:[0,[1,2,3],[4,5,{six:6,seven:"seven"}]]},1),
		"{a:0,b:[0,object,object]}", "toString Method should match");
	equal(fly.toString({a:0,b:[0,[1,2,3],[4,5,{six:6,seven:"seven"}]]},2),
		"{a:0,b:[0,[1,2,3],[4,5,object]]}", "toString Method should match");
	equal(fly.toString({a:0,b:[0,[1,2,3],[4,5,{six:6,seven:"seven"}]]},3),
		'{a:0,b:[0,[1,2,3],[4,5,{six:6,seven:"seven"}]]}', "toString Method should match");
	equal(fly.toString(fly.base,2),
		'{name:"fly base",version:"0.5beta",toString(),addInfo(),deleteInfo(),info()}',
		"toString Method should match");
	equal(fly.base.toString(1),
		'{name:"fly base",version:"0.5beta",toString(),addInfo(),deleteInfo(),info()}',
		"toString Method should match");
});

test("base", 6, function(){

	// 1. Check base info object
	var _i_string = fly.toString(fly.base.info(),2);
	equal(_i_string, '{name:"fly base",version:{val:"0.5beta",type:"version"}}',"string should match");

	// 2. Test adding single info
	fly.base.addInfo({foo:{val:"bar",type:"string"}});
	_i_string = fly.toString(fly.base.info(),2);
	equal(_i_string, '{name:"fly base",version:{val:"0.5beta",type:"version"},foo:{val:"bar",type:"string"}}',"string should match");
	
	// 3. Test deleting single info
	fly.base.deleteInfo("foo");
	_i_string = fly.toString(fly.base.info(),2);
	equal(_i_string, '{name:"fly base",version:{val:"0.5beta",type:"version"}}',"string should match");
	
	// 4. Test adding multiple info 
	fly.base.addInfo({foo:{val:"bar",type:"string"},ifoo:{val:5,type:"val"}});
	_i_string = fly.toString(fly.base.info(),2);
	equal(_i_string, '{name:"fly base",version:{val:"0.5beta",type:"version"},foo:{val:"bar",type:"string"},ifoo:{val:5,type:"val"}}',"string should match");

	// 5.Test deleteInfo
	fly.base.deleteInfo(["foo","ifoo"]);
	_i_string = fly.toString(fly.base.info(),2);
	equal(_i_string, '{name:"fly base",version:{val:"0.5beta",type:"version"}}',"string should match");

	// 6.Test chaining methods addInfo and deleteInfo
	fly.base.addInfo({foo:{val:"bar",type:"string"},ifoo:{val:5,type:"val"}}).deleteInfo(["foo","ifoo"]);
	_i_string = fly.toString(fly.base.info(),2);
	equal(_i_string, '{name:"fly base",version:{val:"0.5beta",type:"version"}}',"string should match");
});

test("infoCtrlr", 1, function(){
	var ICinfo = fly.infoCtrlr.info();
	var members = ICinfo.members;
	equal(members.val,3, "the IC should have three members");
});

}; // end window on-load