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
*/
//--------------------------------------------------------//

fly.init = function (args) {
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

	var stageLayers = args.stageLayers || 1;
	fly.initLayers(stageLayers);

	var colorPalette = args.colorPalette || {};
	var colorSet = args.colorSet || {};
	fly.colorPalette(colorPalette,colorSet);

	fly.grantInfo(fly);
	fly.addInfo({
		debug : { val: fly.debug, type: "bool" },
		width : { val: fly.width, type: "val" },
		height : { val: fly.height, type: "val" },
		stage_layers : { val: fly.layers.stage.length, type: "val"},
		color_palette : { val: fly.color.palette, type: "val"}
	});

	var infoPrefs = args.infoPrefs || {};
	fly.infoCtrlrInit(infoPrefs);

	fly.layers.stage[0].activate();

	fly.initPaperTool();

};
