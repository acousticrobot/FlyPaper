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
 *  * width: canvas width
 *  * height: canvas height
 *  * debug: turns on debug info and makes the [Info Controller]{@link fly.infoCtrlr} visible
 *  * palette: defines the [palette]{@link fly.color.palette}
 *  * backgroundColor: "#F00F00", "red[4]"
 *  * background: bool, adds background layer
 *  * stageLayers: number of layers in fly.layers.stage[]
 *
 * @example
 * fly.init({
 *     width:800,
 *     height:500,
 *     debug: true,
 *     palette: [ "custom palette",
 *         ['ruby','#F04510','#FF7070','#FFD3C0'],
 *         ['orange','#F28614','#FFB444','#FFE8C0'],
 *         ['sunshine','#CDB211','#FFFF70','#FFFFC0'],
 *         ['grass','#42622D','#89C234','#C0FFC0'],
 *         ['berry','#00597C','#00A9EB','#B0E5FF'],
 *         ['very berry','#6F006F','#9F3DBF','#FFC0FF'],
 *         ['clouds','#383633','#A7A097','#FFFFFF']
 *     ]
 * });
 *
 * @param  {Object} args
 * @return {nil}
 * @todo test that palette works as advertised
 */
fly.init = function (args) {

    if (args === undefined) {
        args = {};
    }
    fly.debug = args.debug || false;
    var layers = args.layers || 1,
        background = args.background || true,
        palette = args.palette || "default",
        infoPrefs = args.infoPrefs || {};

    if (args.width && args.height) {
        fly.width = args.width; // canvas width
        fly.height = args.height; // canvas width
        paper.view.viewSize = new paper.Size(fly.width,fly.height);
    } else {
        fly.width = paper.view.viewSize.width;
        fly.height = paper.view.viewSize.height;
    }

    fly.grantInfo(fly).addInfo({
        debug : { val: "debug", type: "val" },
        width : { val: "width", type: "val" },
        height : { val: "height", type: "val" }
    });

    fly.initLayers(layers,background);

    fly.color.palette(palette);

    fly.infoCtrlrInit(infoPrefs);

    if (fly.layer("background")) {
        fly.layers.activate(1);
    } else {
        fly.layers.activate(0);
    }

    fly.initPaperTool();

};
