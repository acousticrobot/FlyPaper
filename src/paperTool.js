/*
 * This file is part of the flypaper.js build.
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

fly.initPaperTool = function() {

    /**
     * Fly Tool initializes a new paper Tool on {@link fly.init}, which takes care
     * of publishing the following events through the event
     * controller:
     *
     *  * onKeyDown
     *  * onMouseDown
     *  * onMouseDrag
     *  * onMouseUp
     *  * onMouseMove
     *
     * The paper events are passed along with the published events.
     *
     * Frame events are handled by the view, and must be initialized
     * on window load.
     *
     * @example
     *
     * fly.init();
     * // when you initialize fly, include this call:
     *
     * paper.view.onFrame = function(event) {
     *     fly.eventCtrlr.publish("frame",event);
     * };
     *
     */
    fly.tool = new paper.Tool();

    fly.tool.onKeyDown = function (event) {
        var pub_e = "";
        if (event.key.length === 1) {
            if (event.modifiers.shift ===true) {
                    pub_e += "shift-";
            }
            if (event.modifiers.control ===true) {
                // paper.js issue: event.key w/ control modify?
                pub_e += "control-";
            }
            if (event.modifiers.option ===true) {
                pub_e += "option-";
            }
            if (event.modifiers.command ===true) {
                pub_e += "command-";
            }
            if (event.modifiers.capsLock ===true) {
                pub_e += "capsLock-";
            }
        }
        pub_e += event.key + "-key";
        var report = fly.eventCtrlr.publish(pub_e);
    };

    fly.tool.onMouseDown = function (event) {
        fly.eventCtrlr.publish("mouse down",event);
    };

    fly.tool.onMouseDrag = function (event) {
        fly.eventCtrlr.publish("mouse drag",event);
    };

    fly.tool.onMouseUp = function (event) {
        fly.eventCtrlr.publish("mouse up",event);
    };

    fly.tool.onMouseMove = function (event) {
        fly.eventCtrlr.publish("mouse move",event);
    };

};
