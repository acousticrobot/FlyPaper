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

fly.initLayers = function(args){

	args = args || 1;
	
	fly.layers = {
		name: "layers",
		version: "0.5beta"
	};
	
	fly.layers.names = (function(args){
		var names = [],
			i;
		if (typeof args === "number") {
			for (i=0; i < args; i++) {
				names[i] = "stage-" + i;
			}
		} else if (args instanceof Array ) {
			for (i=0; i < args.length; i++) {
				if (typeof args[i] === "string") {
					names[i] = args[i];
				} else {
					names[i] = "stage-" + i;
				}
			}
		}
		return names;
	})(args);
	
	// init background and fill with a rectangle	
	fly.layers.background = paper.project.activeLayer;
	fly.layers.backRect = new paper.Path.Rectangle(paper.view.bounds);
	fly.layers.stage = (function(){
		// TD: better error check only num or array
		var stage = [],
			i;
		for (i=0; i < fly.layers.names.length; i++) {
			stage[i] = new paper.Layer();
			// paper error to investigate:
			// TypeError: Cannot read property '_children' of undefined
			// paper.js: 1873;
			//stage[i].name = names[i];
		}
		return stage;
	})();
	
	fly.layers.infoLayer = new paper.Layer();
	
	fly.layers.activate = function(id) {
		if (typeof id === "number" && fly.layers.stage[id]) {
			fly.layers.stage[id].activate();
		} else if (typeof id === "string" && fly.layers.names.indexOf(id) > -1) {
			fly.layers.stage[fly.layers.names.indexOf(id)].activate();
		}
	};
			
	fly.layers.info = function() {
		var _i = {},
			j = 0,			
			ipacket = function(layer) {
				var v, t;
				v = layer.children.length;
				v += v === 1 ? " child" : " children";
				t = layer === paper.project.activeLayer ? "btrue" : "string";
				if (t === "btrue") {
					v += " <active>";
				}
				return { 'val': v, 'type': t };
			};

		_i.name = this.name;
		_i.background = ipacket(fly.layers.background);
		for (j=0; j < fly.layers.names.length; j++) {
			_i[fly.layers.names[j]] = ipacket(fly.layers.stage[j]);
		}
		_i["info layer"] = ipacket(fly.layers.infoLayer);
		return _i;
	};
	
};


