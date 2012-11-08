/*
 * This file is part of the flypaper.js build. 
 * Use grunt to assemble the completed file.
 * Find the full file in dist/flypaper.js
 * globals paper, fly
 */

/*
 *  ## Layers
 *
 *	*called on init, creates drawing layers in fly.layers*
 *
 *	### Creates layers in three parts:
 *  * fly.layers.background:
 *    * 1 layer with 1 paper.Rectangle backRect
 *    * backRect is colored after fly.color init
 *  * fly.layers.stage: an array of layers for main drawing
 *    * pass number of layers in args as stageLayers
 *    * defaults to one layer (fly.layers.stage[0])
 *  * fly.layers.infoLayer:
 *     * 1 layer for info panel
 *
 */

fly.initLayers = function(stageLayers){
		
	fly.layers = fly.base("layers");
	fly.layers.background = paper.project.activeLayer;
	fly.layers.backRect = new paper.Path.Rectangle(paper.view.bounds);

	fly.layers.stage = (function(stageLayers){
		// TD: better error check only num or array
		stageLayers = stageLayers || 1;
		var names = [],
			stage = [],
			i = 0;
		if (typeof stageLayers === "number") {
			for (i=0; i < stageLayers; i++) {
				names[i] = "layer-" + i;
			}
		} else if (stageLayers instanceof Array ) {
			names = stageLayers;
		}
		for (i=0; i < names.length; i++) {
			stage[i] = new paper.Layer();
			// paper error to investigate:
			// TypeError: Cannot read property '_children' of undefined
			// paper.js: 1873;
			//stage[i].name = names[i];
		}
		return stage;
	})(stageLayers);
	
	fly.layers.infoLayer = new paper.Layer();
	
};


