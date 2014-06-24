/*
 * This file is part of the flypaper.js build.
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

/**
 * Gives any object all the necessary functions to register and receive events.
 * Objects can subscribe to events through the [Event Controller]{@link fly.eventCtrlr}.
 *
 * #### Granting Events
 * Objects inheriting from {@link fly.base} already have been granted event methods. For other
 * objects, call `fly.grantEvents(myObject);`
 *
 * #### Register Event
 * To register for events, use [registerEvent()]{@link fly.base.registerEvent}
 *
 * #### Deregister Event
 * To deregister from events, use [deregisterEvent()]{@link fly.base.deregisterEvent}
 *
 * #### Event Call
 * `eventCall(event,args)` is the method called by [Event Controller]{@link fly.EventCtrlr} for registered events.
 * See [eventCall()]{@link fly.base.eventCall}
 *
 * #### Log Events
 * To log registered events to string, use [logEvents()]{@link fly.base.logEvents}
 *
 * @param   {Object} o The object to be granted events
 * @returns {Object}   The object is returned with event methods
 *
 * @example
 * fly.grantEvents(myObject);
 *
 * @mixin Grant Events
 *
 */

fly.grantEvents = function (o) {
    // The registry is a private object pairing events and handlers
    // example: {'frame':'update','beat wing':'updateWing',...}
    // publicly viewed as string through logEvents
    var registry = {};

    /**
     * @method  registerEvent
     *
     * @description adds events to the registry and subscribes to events
     * through the {@link Event Controller}.
     *
     * Each handler should be a public method which can accept the event
     * args. Events can be any event expected from another object, or any
     * paper.js events ('mouse up','frame' etc.). For paper events, expect
     * the event args passed by paper.js. If events already exist in the
     * objects registry, they will be replaced with the new handler.
     *
     * @param   {Object} eventObj {'event':'handler',...}.
     *
     * @returns {this} This is a chainable method
     *
     * @example
     * // expecting event calls to myObject.handlerOne(args) and myObject.handlerTwo()
     * myObject.registerEvent({'event 1':'handlerOne','event 2':'handlerTwo'})
     *
     * @memberOf fly.base
     */

    o.registerEvent = function (eventObj) {
        for ( var event in eventObj ) {
            if (eventObj.hasOwnProperty(event)) {
                if (!registry.hasOwnProperty(event)) {
                    fly.eventCtrlr.subscribe(event,o);
                }
                registry[event] = eventObj[event];
            }
        }
        return o;
    };

    /**
     * @method deregisterEvent
     *
     * @description Unsubscribes the event(s) from the EC and removes it from the registry. Pass in
     * the string 'all' to deregister from all event notifications.
     *
     * @param {String|Array} event An event name, an array of events names, or 'all'
     * @returns {this} this is a chainable method
     *
     * @example
     * // deregister one event
     * myObject.derigesterEvent('event 1');
     * // deregister several events
     * myObject.deregisterEvent(['event 1','event 2']);
     * // deregister all events
     * myObject.deregisterEvent('all');
     *
     * @memberOf fly.base
     */

    o.deregisterEvent = function (event) {
        var e;
        var dereg = function (e) {
            if (registry.hasOwnProperty(e)) {
                delete registry[e];
                fly.eventCtrlr.unsubscribe(e,o);
            }
        };

        if (typeof event === 'string') {
            if (event === 'all') {
                for (e in registry ) {
                    if (registry.hasOwnProperty(e)) {
                        dereg(e);
                    }
                }
            } else {
                dereg(event);
            }
        } else {
            for (e in event) {
                if (event.hasOwnProperty(e)) {
                    dereg(e);
                }
            }
        }
        return o;
    };

    /**
     * @method eventCall
     *
     * @description Called by {@link Event Controller} for registered events.
     *
     * @param   {String} event Match an event in the registry.
     * @param   {Varies} args  Args passed to the handler
     * @returns {this} This is a chainable method
     * @memberOf fly.base
     */

    o.eventCall = function (event,args) {
        if (registry.hasOwnProperty(event) && o.hasOwnProperty(registry[event])) {
            var func = registry[event];
            this[func](args);
        }
        return o;
    };

    /**
     * @method logEvents
     *
     * @description A string description of all registered events and handlers.
     *
     * @returns {String} Representation of the object's event registry
     * @memberOf fly.base
     */

    o.logEvents = function(){
        return fly.toString(registry);
    };

    return o;
};
