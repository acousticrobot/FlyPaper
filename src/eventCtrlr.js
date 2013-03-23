/*
 * This file is part of the flypaper.js build.
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

/**
 * The event controller is constructed on fly.init().
 * All mouse and key events are handled with paper tools and
 * implemented within flypaper.
 *
 * On-frame events *must* be initiated
 * in the main JavaScript on window load.
 *
 * @example
 *     // The eventCtrlr is created on init
 *     fly.init();
 *     // The frame events must be created on window load
 *     paper.view.onFrame = function(event) {
 *        fly.eventCtrlr.publish("frame");
 *     };
 *
 * @class
 * @classDesc
 * eventCtrlr is the main pub/sub object, paper events all publish
 * through it, and objects can subscribe to events which are
 * handled through their [eventCall]{@link base.eventCall} method.
 *
 */

fly.eventCtrlr = (function () {

    var name = "eventCtrlr",
        version = "0.5beta",
        events = {},
        firing = {}, //  used by isFiring
        firePulse = 10, // isFiring countdown
        keyRegex = /.*-key$/, // for matching key events
        lastKey = "",
        errors = [];

    function isFiring(e) {
        // registers an event as firing for next
        // firePulse number of events
        // firing > 0 is sent to infoCtrlr as "firing"
        var event;
        for (event in firing) {
            if (firing[event] > 0 ) {
                firing[event] = firing[event] - 1;
            }
        }
        firing[e] = firePulse;
    }

    /**
     * Publish events to the Event Controller. Events are
     * passed on as strings, with the arguments that should
     * be passed on to the handling event. If the event is a
     * paperscript event, the args passed are typically the
     * same args returned by the event.
     *
     * @example
     * fly.eventCtrlr.publish("my event",event);
     *
     * @param   {String} e    an event to fire
     * @param   {Args} args Args to pass on with the event
     *
     * @memberOf fly.eventCtrlr
     *
     */
    function publish(e,args) {
        if (fly.debug) {
            isFiring(e);
            if (e.match(keyRegex)) {
                lastKey = e;
            }
        }
        if (events[e]) {
            for (var i=0; i < events[e].length; i++) {
                try {
                    if (args !== undefined) {
                        events[e][i].eventCall(e,args);
                    } else {
                        events[e][i].eventCall(e);
                    }
                }
                catch(ex) {
                    addError(ex, events[e][i]);
                }
            }
        }
    }


    /**
     * @method subscribe
     *
     * @description
     * Objects subscribe to events through the event controller to be
     * notified when an event occurs.
     *
     * #### common events include:
     * "mouse down","mouse drag", "mouse up",
     * "frame", and "x-key" where x is any key
     *
     * @example
     * fly.eventCtrlr.subscribe(["event1","event2"],this);
     *
     * @param   {String|Array} e an event or array of events
     * @param   {Object} o the 'this' keyword
     * @returns {null}
     * @todo return object and test
     *
     * @memberOf fly.eventCtrlr
     */
    function subscribe(e,o) {
        // e can be string "event" or array ["event","event",...]
        if (typeof e === 'string') {
            e = [e];
        }
        for (var i=0, j = e.length; i < j ; i++) {
            if (!events[e[i]]) {
                // add to events
                events[e[i]] = [o];
                firing[e[i]] = firePulse;
            } else {
                events[e[i]].push(o);
            }
        }
    }

    /**
     * @method unsubscribe
     *
     * @description
     * Unsubsribe and object from event notifications
     *
     * @param   {String|Array} e an event or array of events
     * @param   {Object} o the 'this' keyword
     *
     * @returns {null}
     * @todo return object and test
     * @memberOf fly.eventCtrlr
     */
    function unsubscribe(e,o) {

        var remove = function(_e) {
            for (var i=0, j = events[_e].length; i < j; i++) {
                if (events[_e][i] === o) {
                    events[_e].splice(i,1); // remove 0 events;
                }
                if (events[_e].length === 0) {
                    delete events[_e];
                }
            }
        };

        // e = "single event" or "all" keyword to unsubscribe o from all events
        if (e === "all") {
            for (var event in events) {
                if (events.hasOwnProperty[event]) {
                    remove(event);
                }
            }
        } else {
            if (events.hasOwnProperty(e)) {
                remove(e);
            }

        }
    }

    function register() {
        // infoCtrlr requests registration
        fly.infoCtrlr.register(this);
    }

    /*
     * Although you probably will never need to call eventContrlr.info,
     * it is an example of overriding the
     * default info method of a fly object.  It iterates over
     * the events stored in its `event` object, and assigns them
     * a either a type of "event", or "eventFiring" if they have
     * recently fired. This is all returned in the standard info packet
     * format expected by the [info controller]{@link infoCtrlr}.
     *
     * @example
     *
     * function info() {
     *      var _i = {
     *          name: name,
     *          v: { val: version, type: "version" },
     *          errors: {val: errors.length, type: "val"}
     *      };
     *      var event, _t;
     *      for (event in events) {
     *          if (events.hasOwnProperty(event)) {
     *              if (firing[event] > 0) {
     *                  _t = "eventFiring";
     *              } else {
     *                  _t = "event";
     *              }
     *              var subs = events[event].length > 1 ? " subscribers" : " subscriber";
     *              _i[event] = {val: events[event].length + subs, type: _t};
     *          }
     *      }
     *      _i.last_key = {val: lastKey, type: "string"};
     *      return _i;
     *  }
     *
     * @returns {Object} an info packet expected by the info Controller
     * @memberOf fly.eventCtrlr
     */
    function info() {
        var _i = {
            name: name,
            v: { val: version, type: "version" },
            errors: {val: errors.length, type: "val"}
        };
        var event, _t;
        for (event in events) {
            if (events.hasOwnProperty(event)) {
                if (firing[event] > 0) {
                    _t = "eventFiring";
                } else {
                    _t = "event";
                }
                var subs = events[event].length > 1 ? " subscribers" : " subscriber";
                _i[event] = {val: events[event].length + subs, type: _t};
            }
        }
        _i.last_key = {val: lastKey, type: "string"};
        return _i;
    }

    function addError(ex,obj) {
        var _er = "Error: ";
        if (ex === "TypeError: events[e][i].eventCall is not a function") {
            if (obj.info().name) {
                _er += obj.info().name;
            }
            _er += " has no event call";
        }
        for (var i=0; i < errors.length; i++) {
            if (errors[i] === _er) {return;}
        }
        errors.push(_er);
    }

    return {
        publish: publish,
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        info: info,
        reqInfo: register,
        logErrors: function() {return fly.toString(errors);},
        logEvents: function() {return fly.toString(events);}
    };
})();

fly.grantString(fly.eventCtrlr);
