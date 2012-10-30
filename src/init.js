/*
 * This file is part of the flypaper.js build. 
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

//--------------------- BEGIN FLYPAPER INIT ----------------//
/*
*	initializes the canvas for all drawing
*	inits eventCtrlr and infoCtrlr	
*	accepts the following in args:	
*		width: canvas width
*		height: canvas height
*		debug: turns on debug info and makes infoCtrlr visible
*		colorPalette: "standard","neon","pastel","custom"
*		colorSet: [ ['red','#400000','#FF0000','#FFC0C0',],[.,.,.,.],...]
*			colorSet is used when colorPalette is "custom"
*		backgroundColor: "#F00F00", "red[4]"
*		stageLayers: number of layers in fly.layers.stage[]
*
*	version 0.4			
*/
//--------------------------------------------------------//

fly.init = function (args) {
	fly.name = "flypaper";
	fly.version = "0.4";
	if (args === undefined) {
		args = {};
	}
	fly.debug = args.debug || false;	
	
	if (args.width && args.height) {
		fly.width = args.width; // canvas width
		fly.height = args.height; // canvas width
		paper.view.viewSize = new paper.Size(fly.width,fly.height);
	} else {
		fly.width = paper.view.viewSize.width;
		fly.height = paper.view.viewSize.height;
	}

	var stageLayers = args.stageLayers || {};
	fly.initLayers(stageLayers);

	var colorPalette = args.colorPalette || {};
	fly.colorPalette(colorPalette);
	
	fly.info = function() {
		// fly namespace is the first member of fly.infoCtrlr
		var i = {};
		i.name = fly.name;
		i.version = { val: fly.version, type: "version"};
		i.debug = { val: fly.debug, type: "bool" };
		i.width = { val: fly.width, type: "val" };
		i.height = { val: fly.height, type: "val" };
		i.stage_layers = { val: fly.layers.stage.length, type: "val"};
		i.color_palette = { val: fly.color.palette, type: "val"};
		//i.keys = {val: "[i]nfo, [s]elect, [r]otate", type: "string" };
		return i;
	};

	fly.eventCtrlrInit();
	
	fly.infoCtrlrInit();
	
	fly.layers.stage[0].activate();
	
	fly.initEventHandlers();

};
