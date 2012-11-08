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
 *    * pass number of layers or array of names for layers
 *    * defaults to one layer (fly.layers.stage[0])
 *  * fly.layer("info"):
 *     * 1 layer for info panel
 *
 */

fly.initLayers = function(layers,background){

	fly.layers = {
		"name": "layers",
		"version": "0.5beta"
	};
	
	fly.layers.names = (function(layers,background){
		var names = background ? ["background"] : [],
			i;
		if (typeof layers === "number") {
			// sanity check
			if (layers < 1 || layers > 100) {
				layers = 1;
			}
			for (i=0; i < layers; i++) {
				names.push("stage " + names.length);
			}
		} else if (layers instanceof Array ) {
			for (i=0; i < layers.length; i++) {
				if (typeof layers[i] === "string") {
					names.push(layers[i]);
				} else {
					names.push("stage-" + names.length);
				}
			}
		}
		return names;
	})(layers,background);
	
	fly.layers.stage = (function(){
		var stage = [],
			i;
		for (i=0; i < fly.layers.names.length; i++) {
			if (i === 0) {
				stage[i] = paper.project.activeLayer;
			} else {
				stage[i] = new paper.Layer();
			}
			// error to investigate:
			// TypeError: Cannot read property '_children' of undefined
			// paper.js: 1873; given when:
			//stage[i].name = names[i];
		}
		return stage;
	})();
	

	var infoLayer = new paper.Layer();
	fly.layers.stage.push(infoLayer);
	fly.layers.names.push("info");
		
	fly.layer = function(id) {
		if (typeof id === "number" && fly.layers.stage[id]) {
			return fly.layers.stage[id];
		} else if (typeof id === "string" && fly.layers.names.indexOf(id) > -1) {
			return fly.layers.stage[fly.layers.names.indexOf(id)];
		}
		return false;
	};
	
	fly.layers.activate = function(id) {
		// id of layer (by index number or name) to make the active layer
		fly.layer(id).activate();
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
//		_i.background = ipacket(fly.layers.background);
		for (j=0; j < fly.layers.names.length; j++) {
			_i[fly.layers.names[j]] = ipacket(fly.layers.stage[j]);
		}
//		_i["info layer"] = ipacket(fly.layer("info"));
		return _i;
	};
	
	fly.layers.toString = function(){
		var s = '[',
			i;
		for (i=0; i < this.names.length; i++) {
			s += '"' + this.names[i] + '",';
		}
		s = s.slice(0,-1);
		s += ']';
		return s;
	};
	
};
