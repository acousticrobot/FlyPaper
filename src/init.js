/*
 * This file is part of the flypaper.js build.
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

/**
 * initializes the canvas for all drawing
 * inits eventCtrlr and infoCtrlr
 * accepts the following in args:
 *
 *       width: canvas width
 *       height: canvas height
 *       debug: turns on debug info and makes infoCtrlr visible
 *       colorPalette: "standard","neon","pastel","custom"
 *       colorSet: [ ['red','#400000','#FF0000','#FFC0C0',],[.,.,.,.],...]
 *           colorSet is used when colorPalette is "custom"
 *       backgroundColor: "#F00F00", "red[4]"
 *       background: bool, adds background layer
 *       stageLayers: number of layers in fly.layers.stage[]
 *
 * @param  {Object} args
 * @return {nil}
 */
fly.init = function (args) {

    if (args === undefined) {
        args = {};
    }
    fly.debug = args.debug || false;
    var layers = args.layers || 1,
        background = args.background || true,
        colorPalette = args.colorPalette || "default",
        infoPrefs = args.infoPrefs || {};

    if (args.width && args.height) {
        fly.width = args.width; // canvas width
        fly.height = args.height; // canvas width
        paper.view.viewSize = new paper.Size(fly.width,fly.height);
    } else {
        fly.width = paper.view.viewSize.width;
        fly.height = paper.view.viewSize.height;
    }

    fly.foo = "foo";
    fly.grantInfo(fly).addInfo({
        debug : { val: "debug", type: "val" },
        width : { val: "width", type: "val" },
        height : { val: "height", type: "val" }
    });

    fly.initLayers(layers,background);

    fly.colorPalette(colorPalette);

    fly.infoCtrlrInit(infoPrefs);

    if (fly.layer("background")) {
        fly.layers.activate(1);
    } else {
        fly.layers.activate(0);
    }

    fly.initPaperTool();

};
