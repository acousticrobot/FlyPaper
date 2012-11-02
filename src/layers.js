/*
 * This file is part of the flypaper.js build. 
 * Use grunt to assemble the completed file.
 * Find the full file in dist/flypaper.js
 * globals paper, fly
 */

//--------------------- BEGIN LAYERS INIT ----------------//
/*
*	Initialize drawing layers in fly.layers
*	Init creates layers in three parts:
*	- fly.layers.background: 1 layer with 1 paper.Rectangle
*		backRect, which is colored after fly.color init
*	- fly.layers.stage: an array of layers for main drawing
*		pass number of layers in args as stageLayers,
*		defaults to one layer (fly.layers.stage[0])
*	- fly.layers.infoLayer: 1 layer for info panel
*
*	version 0.4
*/
//--------------------------------------------------------//
fly.initLayers = function(stageLayers){

	// if (paper.project.layers.length > 1) {
	// console.log("layers init at greater than 1");
	// }

	fly.layers = (function(stageLayers) {
		var background = paper.project.activeLayer,
			backRect = new paper.Path.Rectangle(paper.view.bounds),
			stage = [];
		if (stageLayers !== undefined && stageLayers > 0) {
			for (var i=0; i < stageLayers; i++) {
				stage[i] = new paper.Layer();
			}
		} else {
			stage[0] = new paper.Layer();
		}
		var infoLayer = new paper.Layer();
		return {
			background : background,
			backRect : backRect,
			stage : stage,
			infoLayer : infoLayer,
			remove : function() {
				delete fly.layers;
			}
		};
	})(stageLayers);

};


