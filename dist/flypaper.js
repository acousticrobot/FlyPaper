/**
 * flypaper --v 0.5.0-120 alpha
 *
 * Date 2014-06-22 16:49:04
 *
 * @name flypaper
 * @author Jonathan Gabel
 * @email post@jonathangabel.com}
 * {@linkplain http://jonathangabel.com}
 * {@linkplain https://github.com/josankapo/FlyPaper}
 * @Copyright (C) 2014
 * @License MIT
 *
 */


/**
 * @namespace fly
 *
 * @description All flypaper objects and methods reside in the fly namespace
 */

var fly = fly === undefined ? {} : fly ;
if (typeof fly !== 'object') {
    throw new Error('fly is not an object!');
}

fly.name = 'flypaper';
fly.version = '0.5beta';

if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        var F = function () {};
        var t = typeof o; // Otherwise do some more type checking
        if (t !== 'object' && t !== 'function') {
            throw new TypeError();
        }
        F.prototype = o;
        return new F();
    };
}


/**
 * A method for parsing an object or array to a string.
 * An object can be passed to `fly.toString(object)`,
 * or the method can be granted to an object using {@link fly.grantString}.
 *
 * @param  {Object|Array} o The object to parse as string, not used if calling object.toString()
 * @param  {Number} [toDepth=0] used to increase the depth of recursion
 * @returns {String} A string version of the object or array
 *
 * @example
 * myObject = {a:0,b:[0,[1,2,3],[4,5,{"six":6,"seven":"seven"}]]};
 *
 * // Examine any object by passing as a parameter
 * fly.toString(myObject);
 * // returns: '{"a":0,"b":object}'
 *
 * // Examine nested objects more deeply
 * fly.toString(myObject,2);
 * // returns: '{"a":0,"b":[0,[1,2,3],[4,5,object]]}'
 *
 * // Grant the method to an object
 * fly.grantString(myObject);
 *
 * // Then call the method directly on the object
 * myObject.toString(3)
 * // returns: '{"a":0,"b":[0,[1,2,3],[4,5,{"six":6,"seven":"seven"}]]}'
 *
 */

fly.toString = function(o,toDepth,_currDepth) {
    // don't use _currDepth on initial call, it is
    // Used by the function on recursive calls
    o = o || this;
    var s = '',
        p,
        ends = '',
        isarray = false;
    if (o instanceof Array) {
        s += '[';
        isarray = true;
        ends = ']';
    } else if (typeof o === 'object') {
        s += '{';
        ends = '}';
    }
    toDepth = toDepth || 0;
    _currDepth = _currDepth || 0;
    for (p in o) {
        if (o.hasOwnProperty(p)) {
            if (!isarray && typeof o[p] !== 'function') {
                s += '"' + p + '":';
            }
            if (typeof o[p] === 'function') {
                s += p + '()';
            } else if (typeof o[p] === 'object') {
                if (_currDepth < toDepth) {
                    s += fly.toString(o[p],toDepth,_currDepth+1);
                } else {
                    s += 'object';
                }
            } else if (typeof o[p] === 'string') {
                s += '"' + o[p] + '"';
            } else {
                s += o[p];
            }
            s += ',';
        }
    }
    if (s.length > 1) {
        s = s.slice(0,-1);
    }
    s += ends;
    return s;
};

/**
 * @method toString
 *
 * @description Base has been granted the {@link fly.toString} method
 * @param  {Number} [toDepth=0] used to increase the depth of recursion
 * @todo example of base.toString()
 *
 * @memberOf base
 */

/**
 * Mixin to grant the flypaper [toString]{@link fly.toString} method to an object
 * @param {Object} o The object to grant string functionality
 * @returns {Object} with new method toString()
 *
 * @example
 * // grant the method to an object
 * fly.grantString(myObject);
 * // then call the method on the object
 * myObject.toString()
 *
 * @mixin Grant String
 */
fly.grantString = function(o) {
    o.toString = function(depth){
        return fly.toString(this,depth,0);
    };
    return o;
};


/**
 *
 * Grants objects the ability to send info packets,
 * and to define what properties will be sent in the info packet.
 *
 * #### Granting Info
 * Objects inheriting from {@link base} already have info methods, and are
 * registered with the Info Controller. To grant info to other types of object,
 * use `fly.grantInfo(myObject)`.
 *
 * #### Registering with the Info Controller
 *
 * To begin tracking your object, your must register with the
 * [Info Controller]{@link fly.infoCtrlr}.
 *
 * #### Types of Info
 *
 *  * 'val' : a public property of your object of type string or number
 *  * 'bool' : a public property of your object of type boolean
 *  * 'func' : a callable method of your object which returns a string or number
 *  * 'string' : a string value that is not updated once it is set
 *
 * #### Adding Info
 * To add info to the info packet, use [addInfo()]{@link fly.base.addInfo}
 *
 * #### Deleting Info
 * To delete info, use [deleteInfo()]{@link fly.base.deleteInfo}
 *
 * @param {Object} o The object to be granted info functionality
 * @return {Object}   The object with method info
 * @mixin Grant Info
 *
 *
 */

fly.grantInfo = function(o) {
    // store the properties sent to infoController via call to info()
    var name = o.name || fly.name,
        version = o.version || fly.version,
        _info = {
            version : { val: version, type: 'version'}
        };

    function mergeInfo (o,_i,args) {
        // private utility to add objects in args to info _info
        // used by info() to return to IC, as well as addInfo
        // to add into private _info object
        // reading is tripped when exporting to IC, reading dynamic
        // varibles rather than stored info
        var el, v, t,
            reading = false; // reading from object, not storing in _info
        if (args === _info) {
            reading = true;
        }
        for (el in args) {
            if (args[el].val && args[el].type) {
                v = args[el].val,
                t = args[el].type;
                if (reading) {
                    if (t === 'val' || t === 'bool') {
                        v = o[v];
                    } else if (t.match(/^f$|func|function/)) {
                        v = o[v]();
                        t = 'val';
                    }
                    // type cast bool style values as bool
                    if (v === true || v === false) {
                        t = 'bool';
                    }
                }
                _i[el] = {'val':v,'type':t};
            }
        }
        return _i;
    }

    /**
     * @method addInfo
     *
     * @description Add info that the {@link infoCtrlr} will track about your object.
     *
     * If the property type is `bool`, `func`, `val`, these must be callable
     * by your object to obtain the value as a string, number, or boolean.
     * So for the example you need to be able to call:
     *
     *     'bool': myObject['sleeping'] // returns true or false
     *     'val': myObject['speed'] // public property
     *     myObject['position']() // function which returns a number or string
     *
     * @example
     * // myObject.sleeping should be true or false
     * // myObject.speed should be a number or string
     * // myObject.pos() should return an integer or string
     * // 'birthday' will always be 'Feb 12th'
     * myObject.addInfo(
     *   sleeping:{val:'sleeping',type:'bool'},
     *   speed:{val:'speed',type:'val'},
     *   position:{val:'pos',type:'func'}
     *   birthday:{val:'Feb 12th',type:'string'}
     * )
     *
     * @param {Object} args {infoToTrack:{val:'foo',type:'bar'},..}
     * @returns {this} This is a chainable method
     * @todo describe other types, custom types
     * @todo is 'name' reserved, 'version' reserved ?
     * @memberof fly.base
     */
    o.addInfo = function(args){
        mergeInfo(this,_info,args);
        return o;
    };

    /**
     * @method deleteInfo
     *
     * @description You can delete info you no longer wish to track through the {@link infoController}
     *
     * @param {String|Array} args String value of one or more `val` in the info array
     * @returns {this} This is a chainable method
     * @memberof fly.base
     *
     * @example
     * myObject.deleteInfo('sleeping');
     * myObject.deleteInfo(['speed','val1']);
     *
     */
    o.deleteInfo = function(args) {
        // delete existing property from the infoArray
        // ex args = 'sam' || ['sam','foo']
        if (typeof args === 'string') {
            delete _info[args];
        } else if (args instanceof Array) {
            var el;
            for (var i=0; i < args.length; i++) {
                if (args[i] in _info) {
                    delete _info[args[i]];
                }
            }
        }
        return o;
    };

    /**
     * @method info
     *
     * @description This is the method called by the {@link Info Controller}. It should
     * return and object in the form:
     *
     *
     * If you need to add anything more complicated into the info packet,
     * you can override the info method. See {@link fly.eventCtrlr} for an example
     * of a custom info method.
     *
     * @example
     * myObject.info(); // returns:
     * { name:'myName', var1:{val:30, type:'val'}, var2:{val:true, type:'bool'}..}
     *
     * @returns {Object} info object
     *
     * @memberOf fly.base
     */
    o.info = function(){
        var _i = {};
        _i.name = name;
        _i = mergeInfo(this,_i,_info);
        return _i;
    };

    return o;

};

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
/**
 * @class
 * @classdesc The base for most fly objects. Through mixins it has
 * been granted the ability to create the info object that the
 * {@link Info Controller} requests, and can add and delete tracked items.
 * It also can register for events with the {@link Event Controller}.
 *
 * It is not necessary to use 'new' when creating a new base object
 *
 * @param   {String} n Name of the object
 * @returns {Object}   New object with base fly functionality
 *
 * @example
 * myBaseObject = fly.base('My Base');
 *
 */

fly.base = function(n){
    var o = {};
    o.name =  n || 'fly base',
    o.version =  '0.5beta';

    o.register = function () {
        fly.infoCtrlr.register(this);
        return this;
    };

    o.deregister = function () {
        fly.infoCtrlr.deregister(this);
        return this;
    };

    fly.grantString(o);
    fly.grantInfo(o);
    fly.grantEvents(o);
    return o;
};

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

fly.initLayers = function(layers,background){

    /**
     * The Stage layers are created on {@link fly.init}.
     * Defaults to "background", "layer 1", and "info"
     *
     * #### reserved words
     * "background" and "info" are reserved layer names,
     * background is primarily used for a solid color. See
     * {@link fly.colorUtil.background} for setting background
     * color.
     *
     * @param   {Integer|Array} layers     Defaults to 1.
     * Integer values will create that many layers,
     * plus the background and info layers,
     * layers will be named "layer 1", "layer 2" etc.
     * Array of names will create that many layers,
     * each can be referanced by that name.
     *
     * @param   {Boolean} background Defaults true.
     * If set to false, no background layer is created,
     * first layer by integer is named "layer 0"
     *
     * @todo describe use cases
     *
     * @class
     * @classDesc
     * The object responsible for containing the drawing layers.
     * By default, there will be a background layer for color or
     * animations, the main drawing layer, and a top layer for
     * the info controller.
     *
     *
     */
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
        for (j=0; j < fly.layers.names.length; j++) {
            _i[fly.layers.names[j]] = ipacket(fly.layers.stage[j]);
        }
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

/**
 *
 * The [Color Palette]{@link colorPalette} initializes fly.color
 * during {@link fly.init}
 * After initialization by the [color Palette]{@link fly.colorPalette},
 * color is [granted info]{@link Grant Info}.
 *
 * @example
 * fly.color.blue[4]
 * // returns # '#0000FF' with the default palette
 *
 * @class
 * @classDesc
 * Color maintains a palette of colors defined by the
 * [Color Palette]{@link fly.colorPalette}.
 * It is reinitialized and repopulated every time the
 * [Color Palette]{@link fly.colorPalette} is reset.
 * When a color is defined in a palette (ex. 'blue'),
 * its colors are accessible as an array via fly.color.
 *
*/

fly.color = {

    name: "color",
    _paletteName: "not yet defined",

    /**
     * In the event that you name a color in your color palette as something that
     * is already being used, the name will be appended with "_color",
     * for example info will become `info_color`. To check if a word is reserved, call
     * `fly.color.reserved('color name');`
     *
     * @param  {String} word word to check
     * @return {Boolean}      true if word is reserved
     *
     * @memberOf fly.color
     */
    reserved: function(word) {
        var reservedWords = [ '_paletteName', 'add', 'background', 'delete',
                              'info', 'name', 'palette', 'reserved' ];
        if (reservedWords.indexOf(word) === -1) {
            return false;
        }
        return true;
    },

    /**
     * Sets the background color, or returns the current
     * background color if no args sent
     * @param  {Hex-Color-String} [col]
     * @return {Hex-Color-String}
     *
     * @memberOf fly.color
     */
    background : function(col) {
        if(!col) {
            if (!fly.layers || fly.layers.names.indexOf("background") === -1 ) {

                return "no background layer";

            } else if (fly.layers.backRect) {

                return fly.layers.backRect.fillColor.toCssString();

            } else {

                return "no background color set";
            }
        }
        if (fly.layers && fly.layer("background")) {

            if (fly.layers.backRect === undefined) {

                var l = paper.project.activeLayer;
                fly.layers.activate("background");
                fly.layers.backRect = new paper.Path.Rectangle(paper.view.bounds);
                l.activate();
            }

            col = col !== undefined ? col : "#FFFFFF";
            fly.layers.backRect.fillColor = col;
            return fly.layers.backRect.fillColor.toCssString();
        }
    }

};

fly.grantInfo(fly.color);

/**
 * The Color Utility is created on {@link fly.init}.
 *
 *
 * @class
 * @classDesc
 * The Color Utility has methods for reading and manipulating
 * hex values and creating color presets.  Preset color arrays
 * are made out of three values, typically
 * darkest, saturated, lightest.  Two linear progressions
 * are made from the ends to the middle value.
 * Color arrays default to 9 segments in length. Presets can
 * be altered and new sets made through the {@link colorUtil.spectrum}.
 *
 * @todo change cola to rgba and include alpha in calculations. Deal with rgba
 * internally and return hex only when specified 'hex' in params. For example:
 * `fly.color.background(new paper.RgbColor([0,.75,0.5,0.5]))`
 *
 */

fly.colorUtil = {

    /**
     *
     * Computation to make sure
     * color calculations don't pass color
     * limits. Bounded between 0 and 255
     *
     * @param  {Integer} col
     * @return {Integer}     integer limited between 0 and 255
     */
    limit : function(col){
        // limit col between 0 and 255
        // color is any int
        col = Math.min(Math.max(col, 0),255);
        return col;
    },

    /**
     * Splits a hex color into an [r,g,b] array
     * @param  {Hex-Color-String} hexCol
     * @return {Array}
     *
     * *Note: These rgb values are between 0 and 255,
     * and do not translate into paper.js rgb values
     * which range between 0 and 1*
     *
     * @example
     * fly.colorUtil.split("#102030")
     * // returns [16,32,48]
     */
    split : function(hexCol){
        // split a hex color into array [r,g,b]
        //assumes hex color w/ leading #
        var col = hexCol.slice(1);
        col = parseInt(col,16);
        var r = (col >> 16);
        var g = ((col >> 8) & 0xFF);
        var b = (col & 0xFF);
        return([r,g,b]);
    },

    /**
     * Splices an RGB array [r,g,b] into a hex color
     * @param  {Array} cola
     * @return {Hex-Color-String}
     *
     * *Note: These rgb values are between 0 and 255,
     * and do not translate into paper.js rgb values
     * which range between 0 and 1*
     *
     * @example
     * fly.colorUtil.split([16,32,48])
     * // returns "#102030"
     */
    splice : function(cola){
        // takes a cola and returns the hex string value
        // cola is a color array [r,g,b], are all int
        var r = cola[0],
            g = cola[1],
            b = cola[2];
        var s = ((r << 16) | (g << 8) | b ).toString(16);
        // if r < 10, pad with a zero in front
        while (s.length < 6) {
            s = "0" + s;
        }
        s = "#" + s;
        return s;
    },

    /**
     * mixes 2 hex colors together
     * @param  {Hex-Color-String} col1
     * @param  {Hex-Color-String} col2
     * @param  {Float} [ratio=0.5] Between 0 and 1, Determines ratio color 1 to color 2
     * @return {Hex-Color-String}
     */
    mix : function(col1,col2,ratio){

        ratio = ratio !== undefined ? ratio : 0.5;
        var col1a = this.split(col1),
            col2a = this.split(col2);
        for (var i=0; i < col1a.length; i++) {
            col1a[i] = (col1a[i]*(1-ratio)) + (col2a[i]*(ratio));
        }
        return this.splice(col1a);
    },

    /**
     * Returns the r g b values (0 - 255)
     * added together for a total value. Useful for
     * comparing color values disregarding the hue
     *
     * @param  {Hex-Color-Value} col
     * @return {Integer}
     */
    totalValue  : function(col) {
        // adds the R,G,B values together
        var cola = this.split(col);
        return cola[0] + cola[1] + cola[2];
    },

    /*
     * Creates a spectrum of hex colors
     * @param  {Hex-Color-String} col1 First color in the spectrum
     * @param  {Hex-Color-String} col2 Last color in the spectrum
     * @param  {Integer} [seg=5] Number of colors in the spectrum
     * @return {Array}
     *
     * @private
     */

    bispectrum : function(col1,col2,seg){
        // takes two colors, returns array of seg sements
        // each a hex color. sent colors are first and last
        // colors in the array
        seg = seg !== undefined ? seg : 5;
        if (seg < 3) {
            return [col1,col2];
        }
        var spec = [col1];
        for (var i=1; i < seg-1; i++) {
            spec.push(this.mix(col1,col2,i/(seg-1)));
        }
        spec.push(col2);
        return spec;
    },

    /*
     * takes three hex colors and creates a (default 9)
     * segment spectrum. Made for bringing saturated
     * colors to light and dark.
     * standard use: (lightest, saturated, darkest)
     * sent colors are first, middle, and last of the array
     * spectrum length defaults to 9, and will always be odd*
     *
     * @param  {Hex-Color-String} col1 First color in the spectrum
     * @param  {Hex-Color-String} col2 Middle color in the spectrum
     * @param  {Hex-Color-String} col2 Last color in the spectrum
     * @param  {Integer} [seg=9] Number of colors in the spectrum
     * @return {Array}
     *
     * @Private
     */

    trispectrum : function(col1,col2,col3,seg) {

        seg = seg !== undefined ? seg : 9;
        var midseg = Math.ceil(seg/2);
        var lights = this.bispectrum(col1,col2,midseg),
            darks = this.bispectrum(col2,col3,midseg);
            // remove duplicate color in middle and merge
            lights.pop();
            var spec = lights.concat(darks);
            return spec;
    },

    /**
     * Takes two or three hex colors and creates a array of
     * colors. Defaults to 9 segments for three colors and 5 for
     * two colors. Using three colors works well for a creating
     * a color spectrum with a saturated color in the middle.
     * Standard use: (lightest, saturated, darkest)
     * sent colors are first, middle, and last of the array
     * spectrum length defaults to 9, and will always be odd*
     *
     * @param  {String} name
     * @param  {Hex-Color-String} col1 First color in the spectrum
     * @param  {Hex-Color-String} col2 Middle or Last color in the spectrum
     * @param  {Hex-Color-String} [col3] Last color in the spectrum
     * @param  {Integer} [seg] Number of colors in the spectrum
     * @return {Array}
     *
     * @example
     * fly.colorUtil.spectrum("dark-grey","#000000","#222222",3)
     * // returns ["#00000","#11111","#22222"]
     *
     * fly.colorUtil.spectrum("grey","#00000","#FFFFFF")
     * // returns ["#000000","#3f3f3f","#7f7f7f","#bfbfbf","#FFFFFF"]
     *
     * fly.colorUtil.spectrum("hot-pink","#000000","#FF00FF","#FFFFFF")
     * // returns ["#000000","#3f003f","#7f007f","#bf00bf","#FF00FF","#ff3fff","#ff7fff","#ffbfff","#FFFFFF"]
     *
     * fly.colorUtil.spectrum("pink","#000000","#FF00FF","#FFFFFF",5)
     * // returns ["#000000","#7f007f","#FF00FF","#ff7fff","#FFFFFF"]
     *
     */

    spectrum : function(name,col1,col2,col3,seg) {

        /** @TODO Why is this pushed to colorSets w/o the array? */
        // Should this be removed?
        fly.colorSets.push(name);
        var spec;
        if (col3 !== undefined) {
            if (typeof col3 === "string" ) {
                spec = this.trispectrum(col1,col2,col3,seg);
            } else if (typeof col3 === "number" ) {
                // col3 is actually seg
                spec = this.bispectrum(col1,col2,col3);
            } else {
                seg = this.bispectrum(col1,col2);
            }
        }
        return spec;
    }

};

/**
 * FlyPaper color sets are used to quickly establish
 * a color palette that can be changed dynamically.
 * Color sets are managed through the [Color Palette]{@link fly.color.palette}.
 * Sets can be added or swapped out.
 *
 * ### Predefined Custom Color Palettes
 *
 *  * default
 *  * pastel
 *  * sunny day
 *  * monotone
 *  * neon
 *
 * Each color set has a name "name" and an array "set"
 * of colors.  Each "set" is an array with the color
 * name followed by three hex values: darkest, saturated, and
 * lightest.  A spectrum of nine colors is calculated out
 * of these three for the color.  The color is then accessed
 * through fly.color, for example: `fly.color.blue[5]`.
 * Note that the "default" set is based around  the 'pure'
 * RGB color spectrum, with saturated valued
 *
 * See [color]{@link fly.color} and [Color Utility]{@link fly.colorUtil} for more
 * info on using colors.
 *
 * @example
 *
 * // Swap for a new predefined set:
 * fly.color.palette("neon");
 *
 * // Define a custom color set:
 * fly.color.palette({
 *      name: "my color set", set: [
 *          ['red','#F04510','#FF7070','#FFD3C0'],
 *          ['orange','#F28614','#FFB444','#FFE8C0'],
 *          ['yellow','#CDB211','#FFFF70','#FFFFC0'],
 *          ['green','#42622D','#89C234','#C0FFC0'],
 *          ['blue','#00597C','#00A9EB','#B0E5FF'],
 *          ['purple','#6F006F','#9F3DBF','#FFC0FF'],
 *          ['grey','#383633','#A7A097','#FFFFFF']
 *      ]
 * })
 *
 * @namespace colorSets
 */
fly.colorSets = [
        { name: "default", set: [
            ['red','#400000','#FF0000','#FFC0C0'],
            ['orange','#402900','#FFA500','#FFE8C0'],
            ['yellow','#404000','#FFFF00','#FFFFC0'],
            ['green','#004000','#00FF00','#C0FFC0'],
            ['blue','#000040','#0000FF','#C0C0FF'],
            ['purple','#400040','#800080','#FFC0FF'],
            ['grey','#000000','#808080','#FFFFFF']
        ]},
        { name: "pastel", set: [
            ['red','#F04510','#FF7070','#FFD3C0'],
            ['orange','#F28614','#FFB444','#FFE8C0'],
            ['yellow','#CDB211','#FFFF70','#FFFFC0'],
            ['green','#42622D','#89C234','#C0FFC0'],
            ['blue','#00597C','#00A9EB','#B0E5FF'],
            ['purple','#6F006F','#9F3DBF','#FFC0FF'],
            ['grey','#383633','#A7A097','#FFFFFF']
        ]},
        { name: "sunny day", set: [
            ['red','#2F060D','#FF361F','#FFCFC5'],
            ['orange','#6D3200','#FF8125','#FFD1B6'],
            ['yellow','#D6FF43','#FFFA95','#F4FFDA'],
            ['green','#3B4D2A','#89C234','#A0FFA0'],
            ['blue','#1D3852','#00A9EB','#9BCAE1'],
            ['purple','#4C244C','#893DB3','#D0B8FF'],
            ['grey','#1E2421','#848179','#D3FFE9']
        ]},
        { name: "monotone", set: [
            ['red','#1B1414','#584444','#FFE7E3'],
            ['orange','#2A2620','#4D463A','#FFE9CC'],
            ['yellow','#313125','#808061','#FAFFE0'],
            ['green','#111611','#6E936E','#E7FFD3'],
            ['blue','#0A0A0D','#696991','#E5D9FF'],
            ['purple','#0D090D','#684E68','#FFE3EC'],
            ['grey','#000000','#808080','#FFFFFF']
        ]},
        { name: "neon", set: [
            ['red','#6A0032','#FF0023','#FFC0F2'],
            ['orange','#BD2E00','#FFA500','#FFE8C0'],
            ['yellow','#ACFF02','#FFFF00','#FFFFC0'],
            ['green','#133B0F','#38FF41','#BFFF68'],
            ['blue','#010654','#013BFF','#4FFFF8'],
            ['purple','#3B034C','#9800B3','#CC5FFF'],
            ['grey','#0A0511','#696281','#E3E8FF']
        ]}
    ];

/**
 * Returns the name of the current color palette if no
 * args are passed in. Arguments passed on {@link fly.init}
 * will be passed to the color palette.
 * Args can be a string matched against predefined
 * sets of colors in the [Color Sets]{@link colorSets}. Args can also be an
 * object containing a name and a color set. The set will be added to
 * the colorSets array, or if the name exists already,
 * the new set will replace the old.
 *
 * @example
 * // Set the predefined 'neon' color set on init
 * fly.init({palette:"neon"})
 *
 * // Change to the predefined "pastel" color set
 * fly.color.palette("pastel")
 *
 * // Change to a custom color set, and redefine fly.colors
 * // To use the custom colors
 * fly.color.palette({
 *      name: "my color set", set: [
 *          ['ruby','#F04510','#FF7070','#FFD3C0'],
 *          ['orange','#F28614','#FFB444','#FFE8C0'],
 *          ['sunshine','#CDB211','#FFFF70','#FFFFC0'],
 *          ['grass','#42622D','#89C234','#C0FFC0'],
 *          ['berry','#00597C','#00A9EB','#B0E5FF'],
 *          ['very berry','#6F006F','#9F3DBF','#FFC0FF'],
 *          ['clouds','#383633','#A7A097','#FFFFFF']
 *      ]
 * })
 *
 * fly.color.palette()
 * // returns "my color set"
 *
 * @param  {String | Object} args See examples
 *
 * @extends color
 *
 */

fly.color.palette = function(args){

    var
        i,
        index = -1;

    // If no-args passed, return existing palette
    if (!args) {
        return fly.color._paletteName;
    }

    function checkSet(p) {
        // sanity type check args args:
        if (!p.name || !p.set) {
            return 'Palette must have a name and a set';
        }
        if (typeof p.name !== "string") {
            return 'Palette name must be string';
        }
        if (p.set instanceof Array === false) {
            return 'Palette set must be an array';
        }
        for (i=0; i < p.set.length; i++) {
            if (p.set[i] instanceof Array === false || p.set[i].length !== 4) {
                return 'Palette set of unknown type';
            }
            if (fly.color.reserved(p.set[i][0])) {
                p.set[i][0] = p.set[i][0] + '_color';
            }
        }
        return true;
    }

    function findInSet(n) {
        for (i=0; i < fly.colorSets.length; i++) {
            if (fly.colorSets[i].name === n) {
                return i;
            }
        }
        return -1;
    }

    // type check args, add set to colorSets if new

    function prepSet() {

        var check;

        if (typeof args === "object" && args.name && args.set ) {
            check = checkSet(args);
            if (check !== true) {
                throw new TypeError (check);
            }
            index = findInSet(args.name);
            if (index === -1) {
                // create a new set
                index = fly.colorSets.length;
                fly.colorSets.push(args);
            } else {
                // replace old set with new one
                fly.colorSets[index].set = args.set;
            }

        } else if (typeof args === "string") {
            index = findInSet(args);
            if (index === -1) {
                index = 0; // use default set
            }
        } else {
            return new TypeError ('Unknown type sent as args to color palette');
        }
    }

    // rebuild fly.Color with the new palette

    function resetColor(colorSet) {

        fly.color._paletteName = colorSet.name;

        var newInfo = {palette : {val: "_paletteName", type: "val"}},
            spec,
            v;
        for (var i=0; i < colorSet.set.length; i++) {
            spec = colorSet.set[i];
            v = spec[1] + '-' + spec[2] + '-' + spec[3];
            newInfo[spec[0]] = {val:v,type:"string"};
        }
        fly.grantInfo(fly.color).addInfo(newInfo);
    }

    // After sanity checks, load the color set into fly.colors

    function setPalette() {

        // spec: color spectrum array ['red',#000000,#FF0000,#FFFFFF]
        // colorSet: name and a set of spectrum arrays (see fly.colorSet)
        var spec,
            colorSet;

        try {
            prepSet();
        }

        catch(e) {

            // string passed doesn't match a preset, so
            // we set it to the default
            if (fly.color._paletteName === "not yet defined") {
                index = 0;

            // args are of an unknown type, return an
            // error without changing anything
            } else {
                return(e);
            }
        }

        colorSet = fly.colorSets[index];
        resetColor(colorSet);

        for (i=0; i < colorSet.set.length; i++) {
            spec = colorSet.set[i];
            fly.color[spec[0]] = fly.colorUtil.spectrum(spec[0],spec[1],spec[2],spec[3]);
        }
    }

    setPalette();

};

// TODO:
// add colors to current set: fly.color.add(...)
// add into current in colorSets
//



fly.infoCtrlrInit = function(infoPrefs) {

    var events, key;

    /**
     * The Info Controller is created on {@link fly.init}.
     *
     * @class
     * @classDesc
     *
     * The info controller allows information to be displayed
     * in a window within the canvas.  Objects register to
     * be tracked by the IC. They must have a method info
     * which returns an info packet to the IC.
     *
     *
     * ### info
     * On frame events, infoCtrlr sends a request to members
     * via object.info() for an info packet.
     * Info packets are of the form:
     *
     *     { name: "name", var1:{val: var1, type:"val"},var2:{..}..}
     *
     * See info in the [Grant Info]{@link fly.grantInfo} Mixin for details on the info packet.
     *
     * @example
     * // Here are all the info panel parameters adjustable on fly.init,
     * // with the default values filled in
     * fly.init({
     *     infoPrefs: {
     *         keyTrigger: 'i-key', // if you need "i" for something else, change it here
     *         screen : fly.color.grey[1], // the backround screen
     *         screenBars : fly.color.grey[0], // the grip and title bars
     *         opacity : .95, // the opacity of the screen
     *         size : 11, // font size
     *         // colors matching value types:
     *         titles: fly.color.blue[9], // titles on the collapsing bars
     *         version : fly.color.grey[5],
     *         info : fly.color.purple[4],
     *         val : fly.color.green[2],
     *         string : fly.color.grey[4],
     *         btrue : fly.color.orange[5], // boolean set to true
     *         bfalse : fly.color.orange[3],
     *         event : fly.color.red[4],
     *         eventFiring : fly.color.red[7],
     *         plain : fly.color.grey[4] // default color for unknown value types
     *     }
     * });
     *
     */

    fly.infoCtrlr = (function(infoPrefs) {

        var name = 'Info Controller';
        var version = '0.5alpha';
        // register members who already exist
        var members = [
            { obj : fly, display : false },
            { obj : fly.eventCtrlr, display : false },
            { obj : fly.layers, display : false },
            { obj : fly.color, display : false }
        ];

        infoPrefs = infoPrefs || {};
        if (fly.color.palette === 'not yet defined') {
            fly.colorPalette('default');
        }
        var keyTrigger = infoPrefs.keyTrigger || 'i-key';
        var style = {},
            fullcolor = true,
            // check that we have all the colors needed
            colors = ['blue', 'grey', 'green', 'orange', 'red', 'purple'];
        for ( var i = 0; i < colors.length; i++) {
            if (!fly.color[colors[i]] || fly.color[colors[i]].length < 8) {
                fullcolor = false;
                break;
            }
        }
        if (fullcolor) {
            // base text colors:
            style.titles = infoPrefs.titleBar || fly.color.blue[7];
            style.plain = fly.color.grey[4] || '#89C234';
            // screen and bar colors:
            style.screen = infoPrefs.screen || fly.color.grey[1];
            style.screenBars = infoPrefs.screenBars || fly.color.grey[0];
            // colors matching value types:
            style.val = infoPrefs.val || fly.color.green[2];
            style.string = infoPrefs.string || fly.color.grey[4];
            style.btrue = infoPrefs.btrue || fly.color.orange[6];
            style.bfalse = infoPrefs.bfalse || fly.color.orange[3];
            style.event = infoPrefs.event || fly.color.red[4];
            style.eventFiring = infoPrefs.eventFiring || fly.color.red[7];
            style.version = infoPrefs.version || fly.color.grey[5];
            style.info = infoPrefs.info || fly.color.blue[7];
        } else {
            // base text colors:
            style.titles = infoPrefs.titleBar || '#9BCAE1';
            style.plain = '#89C234';
            // screen and bar colors:
            style.screen = infoPrefs.screen || '#0D1927';
            style.screenBars = infoPrefs.screenBars || 'black';
            // colors matching value types:
            style.val = infoPrefs.val || '#89C234';
            style.string = infoPrefs.string || '#691BE2';
            style.btrue = infoPrefs.btrue || '#66FF99';
            style.bfalse = infoPrefs.bfalse || '#3D9199';
            style.event = infoPrefs.event || '#BC4500';
            style.eventFiring = infoPrefs.eventFiring || '#FF5E00';
            style.version = infoPrefs.version || '#8A8A39';
            style.info = infoPrefs.info || '#CCB599';
        }
        // font styles
        style.size = infoPrefs.size || 11;
        style.spacing = style.size * 1.75;
        style.offset = style.size;
        style.opacity = infoPrefs.opacity || 0.95;
        // info panel styles
        var ibox = {};
        ibox.handle = {}; // for move events
        ibox.origin = new paper.Point(10, 10);
        ibox.txtOffset = [ style.size, style.size * 3.5 ];
        ibox.txtOrigin = ibox.origin.add(ibox.txtOffset);
        ibox.txtLen = 0;
        ibox.txtWidth = 0;
        ibox.titleBars = [];
        ibox.visible = fly.debug; // start visible in debug mode
        // set up path groups for drawing
        var infoGroup = [];
        infoGroup.box = new paper.Group();
        infoGroup.bars = new paper.Group();
        infoGroup.txt = new paper.Group();
        var moving = false;
        // time counter, eventually to base speed on environment
        var _time = {};
        _time.refresh = 0;
        _time.frame = 0;
        _time.time = 0;
        _time.fps = {
            curr : 0,
            avg : 0
        };
        var device = {}; // for device detection
        device.isIpad = navigator.userAgent.match(/iPad/) !== null;
        device.isMobile = (function() {
            var user = navigator.userAgent.toLowerCase();
            var agents = /android|webos|iphone/;
            if (user.match(agents)) {
                return true;
            }
            return false;
        })();

        // ------------------- registration --------------------//

        /**
         * New objects can register as a member with infoCtrlr to be
         * displayed in the info panel. Optional second boolean parameter
         * will initialize this object's panel as open or closed.
         *
         * @param  {object} o this
         * @param  {Boolean} d Display open or closed
         * @return {this}   this is a chainable method
         *
         * @example
         * fly.infocontroller.register(this);
         * // -- or --
         * fly.infocontroller.register(this,true);
         *
         * @memberOf fly.infoCtrlr
         *
         */
        function register(o, d) {
            // override register function from grantInfo
            // the IC gets requests via register,
            // everything else requests via resister to the IC
            d = typeof (d) !== 'undefined' ? d : false;
            // new objects register to become a member
            for ( var i = 0; i < members.length; i++) {
                if (members[i].obj === o) {
                    return 'error: object already exists';
                }
            }
            members.push( {
                obj : o,
                display : d,
                info : {}
            });
            updateInfo(true);
            resetBars();
            return this;
        }

        /**
         * You can deregister at any time if you no longer want an
         * object to be viewable in the info panel.
         *
         * @param  {Object} o this
         * @return {this}   this is a chainable method
         *
         * @example
         * fly.infocontroller.deregister(this);
         *
         * @memberOf fly.infoCtrlr
         *
         */
        function deregister(o) {
            for ( var i = 0; i < members.length; i++) {
                if (members[i].obj === o) {
                    members.splice(i, 1);
                    return;
                }
            }
            reset();
            return this;
        }

        // ------------------- drawing -------------------------//

        function reset() {
            ibox.txtWidth = 0;
            updateInfo(true);
            resetBars();
        }

        function printTxtLine(key, val) {
            // printText() sends:
            // (name,'openTitle) or (name,'closedTitle')
            // or (key,{v:val,t:type})
            if (key === undefined || val === undefined) {
                return 'Error printing info';
            }
            updateWidth(key, val);
            var text = new paper.PointText(ibox.cursor);
            text.paragraphStyle.justification = 'left';
            text.characterStyle.fontSize = style.size;
            var _t = '';
            if (val === 'openTitle') {
                // object name line, style as title
                _t += '\u25BC  ' + key; // down triangle
                text.fillColor = style.titles;
            } else if (val === 'closedTitle') {
                _t += '\u25B6 ' + key; // right triangle
                text.fillColor = style.titles;
                ibox.cursor.y += 2;
            } else { // styles for other items
                var _s; // style by type
                if (val.type === 'bool') {
                    _s = 'b' + val.val; // btrue or bfalse
                } else {
                    _s = val.type;
                }
                if (style[_s] !== undefined) {
                    text.fillColor = style[_s];
                } else {
                    text.fillColor = style.plain;
                }
                _t += key + ': ' + val.val;
            }
            text.content = _t;
            infoGroup.txt.addChild(text);
            ibox.cursor.y += style.spacing;
        }

        function printText() {
            // starting at text origin point
            // create each new line of text
            ibox.cursor = new paper.Point(ibox.txtOrigin);
            for ( var i = 0; i < members.length; i++) {
                // add location to titleBar array
                setBars();
                if (members[i].display === true) {
                    // add line with name
                    printTxtLine(members[i].info.name, 'openTitle');
                    // if member's display, make line for each in
                    for ( var item in members[i].info) {
                        if (item !== 'name') {
                            printTxtLine(item, members[i].info[item]);
                        }
                    }
                } else {
                    printTxtLine(members[i].info.name, 'closedTitle');
                }
            }
        }

        function resetBars() {
            ibox.titleBars = [];
        }

        function setBars() {
            // for collapsable bars behind titles
            // called from printText as titles are printed
            if (ibox.titleBars.length !== members.length) {
                var _p = new paper.Point(ibox.cursor.x - style.offset,
                        ibox.cursor.y - 1.2 * style.offset);
                ibox.titleBars.push(_p);
            }
        }

        function drawBars() {
            for ( var i = 0; i < ibox.titleBars.length; i++) {
                var _s = new paper.Size(ibox.txtWidth + 2 * style.offset,
                        style.spacing);
                var bar = new paper.Path.Rectangle(ibox.titleBars[i], _s);
                bar.fillColor = style.screenBars;
                bar.opacity = 0.50;
                infoGroup.bars.addChild(bar);
            }
        }

        function drawGrip() {
            var _s2 = new paper.Size(ibox.boxWidth, 30);
            var grip = new paper.Path.Rectangle(ibox.origin, _s2);
            grip.name = 'grip';
            grip.fillColor = style.plain; // needs a fill color to work!
            grip.visible = false;
            infoGroup.box.addChild(grip);

            for ( var i = 0; i < 7; i++) {
                var from = new paper.Point(
                        ibox.origin.x,
                        ibox.origin.y + 0.3 * style.size * i + 2);
                var to = new paper.Point(from.x + ibox.boxWidth, from.y);
                var gripLine = new paper.Path.Line(from, to);
                gripLine.strokeColor = style.screenBars;
                gripLine.strokeWidth = 2;
                infoGroup.box.addChild(gripLine);
            }
        }

        function drawBox() {
            ibox.txtWidth = ibox.txtLen * style.size * 0.68;
            ibox.boxWidth = ibox.txtWidth + 2 * style.offset;
            var _s = new paper.Size(
                    ibox.boxWidth,
                    ibox.cursor.y - ibox.origin.y - style.offset);
            var _r = new paper.Rectangle(ibox.origin, _s);
            var clipper = new paper.Path.RoundRectangle(_r, 10);
            var screen = new paper.Path.Rectangle(_r);
            screen.fillColor = style.screen;
            screen.opacity = style.opacity;
            infoGroup.box.addChild(clipper);
            infoGroup.box.addChild(screen);
            infoGroup.box.clipped = true;
            drawGrip();
            drawBars();
            fly.layer('info').visible = ibox.visible;
        }

        // ------------------- animation ----------------------//

        function toggleDisplay() {
            if (fly.debug) {
                ibox.visible = !ibox.visible;
                if (ibox.origin.x < 1 || ibox.origin.x > fly.height ||
                        ibox.origin.y < 1 || ibox.origin.y > fly.width) {
                        ibox.origin.x = 10;
                        ibox.origin.y = 10;
                        ibox.txtOrigin = ibox.origin.add(ibox.txtOffset);
                        resetBars();
                }
            }
        }

        /**
         * @todo Use grab drag and drop from basic fly object
         * This grab includes  hit test for each infoGroup
         */

        function grab(args) {
            var point = args.point;
            // ignore if not visible, else animate arrows and dragging
            if (!fly.layer('info').visible) {
                return;
            }
            for ( var i = 0; i < infoGroup.bars.children.length; i++) {
                if (infoGroup.bars.children[i].hitTest(point)) {
                    members[i].display = !members[i].display;
                    reset(); // clear & force reset;
                }
            }
            if (infoGroup.box.children['grip'].hitTest(point)) {
                ibox.handle.or = point.subtract(ibox.origin);
                moving = true;

            }
        }

        function drag(args) {
            var point = args.point;
            if (moving) {
                ibox.origin = point.subtract(ibox.handle.or);
                ibox.txtOrigin = ibox.origin.add(ibox.txtOffset);
                resetBars();
            }
        }

        function drop(args) {
            var point = args.point;
            moving = false;
        }

        function updateWidth(key, value) {
            // approximates width needed for info box
            key = key || 0;
            value = value || 0;
            key = key.toString() || 0;
            value = value.toString() || 0;
            var _l = key.length + value.length;
            if (_l > ibox.txtLen) {
                ibox.txtLen = _l;
            }
            if (ibox.txtLen > 50) {
                ibox.txtLen = 50;
            }
        }

        // ------------------- information collection ---------//

        function updateTime(args) {
            _time.frame = args.count; // frames since start
            _time.time = args.time; // seconds since start
            if (args.time - _time.refresh > 0.1) {
                _time.refresh = args.time;
                _time.fps.avg = _time.frame / _time.time;
                _time.fps.curr = 1 / args.delta;
            }
        }


        function updateInfo(force) {
            // v 0.3.6
            // gather most recent info
            // from members with display === true
            // use force === true on registration or to update all
            // this is used to adjust width of box to length of info
            for ( var i = 0; i < members.length; i++) {
                if (members[i].display || force) {
                    members[i].info = members[i].obj.info();
                    if (force) { // recheck max width of infobox
                        var key;
                        for (key in members[i].info) {
                            if (members[i].info.hasOwnProperty(key)) {
                                try {
                                    if (key === 'name') {
                                        updateWidth('name',
                                                members[i].info.name);
                                    } else {
                                        updateWidth(key,
                                                members[i].info[key].val);
                                    }
                                } catch (ex) {
                                    return (ex);
                                }
                            }
                        }
                    }
                }
            }
        }

        function update(args) {
            updateTime(args);
            // only update panel if visible or visibility has changed
            if (fly.layer('info').visible || ibox.visible) {
                if (infoGroup.box.hasChildren()) {
                    infoGroup.box.removeChildren();
                }
                if (infoGroup.bars.hasChildren()) {
                    infoGroup.bars.removeChildren();
                }
                if (infoGroup.txt.hasChildren()) {
                    infoGroup.txt.removeChildren();
                }
                updateInfo();
                printText();
                drawBox();
            }
        }

        return {
            name: name,
            version: version,
            'key trigger': keyTrigger,
            members: members,
            numMembers: function(){
                return members.length;
            },
            /**
             * The number of frames elapsed
             * @return {Integer} number of frames
             * @memberOf fly.infoCtrlr
             */
            frame : function() {
                return _time.frame;
            },
            /**
             * Object containing info on the time
             * passed, fps, etc.
             * @return {Object} time object
             *
             * @example
             * time = fly.info.time()
             * // returns {"refresh":0,"frame":0,"time":0,"fps":{"curr":0,"avg":0}}
             * @memberOf fly.infoCtrlr
             * @todo explain what refresh is
             */
            time : function() {
                return _time;
            },
            "time passed": function () {
                return _time.time.toFixed(1);
            },
            fps: function() {
                return _time.fps.curr.toFixed(1);
            },
            fpsAvg: function() {
                return _time.fps.avg.toFixed(1);
            },
            moving : function() {
                return moving;
            },
            isMobile : function() {
                return device.isMobile;
            },
            isIpad : function() {
                return device.isIpad;
            },
            update: update,
            register : register,
            deregister : deregister,
            toggleDisplay : toggleDisplay,
            grab: grab,
            drag: drag,
            drop: drop
        };

    })(infoPrefs); // END infoCntrlr construction

    // ------------------- initialize ----------------------//

    fly.grantString(fly.infoCtrlr);
    fly.grantInfo(fly.infoCtrlr).addInfo({
        'key trigger': { val: 'key trigger', type: 'val' },
        'members' : { val: 'numMembers', type: 'func' },
        'time passed' : {val: 'time passed', type: 'func'},
        'frames per second' : {val: 'fps', type: 'func'},
        'fps average' : {val: 'fpsAvg',type: 'func'},
        'mobile': {val: 'isMobile', type: 'func'},
        'ipad' : {val: 'isIpad', type: 'func'}
    });
    fly.infoCtrlr.register(fly.infoCtrlr);
    events = {
        'frame': "update",
        'mouse move': "update",
        'mouse down': 'grab',
        'mouse drag': 'drag',
        'mouse up' : 'drop'
    },
        key = fly.infoCtrlr['key trigger'];
    events[key] = "toggleDisplay";
    fly.grantEvents(fly.infoCtrlr).registerEvent(events);
    fly.infoCtrlr.toggleDisplay();

}; // END infoCntrlrInit


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

/**
 * Returns a paper point midway between two paperpoints
 * @param  {Point} p1 a paper.js Point Object
 * @param  {Point} p2 a paper.js Point Object
 * @return {Point}    a paper.js Point Object
 */
fly.midpoint = function (p1,p2) {
        // returns the point between two points
    var _p = new paper.Point(p1.add(p2));
    _p = _p.divide([2,2]);
    return _p;
};

/**
 * Takes a paper Item, or array of Items and places each of their
 * centers randomly within the bounds of the rectangle. Primarily used
 * with Path Items, the obejcts passed in must have the paper `position`
 * method in order to be scattered.
 *
 * @param  {Object | Array} o    paper.js Items or array of Items
 * @param  {Rectangle} rect paper.js Rectangle
 */
fly.scatter = function (o,rect) {
        // takes an paper object or array of objects o
        // and places their centers randomly within rectangle rect
        // start in lower right corner, multiply x and y by random 0 to 1
        // point will land somewhere in the rect
        // TODO: optional place within rect bounds
    if (o instanceof Array === false) {
        o = [o];
    }
    for (var i=0; i < o.length; i++) {
        if (o.position === 'function') {
            var randomPoint = new paper.Point(    // point at lower right corner
                rect.width,rect.height
            );
            var randomLocation = randomPoint.multiply(paper.Size.random()); // point within rect
            o[i].position = rect.point.add(randomLocation);
        }
    }
};

//@TODO change to randomPoint?
fly.randomizePt = function (point,delta,constrain) {
    // adds variance delta to point
    // constrain === "x" or "y" or default none
    var c = constrain || "none";
    if (c !== "y") {
        var x = (- delta) + (2 * delta * Math.random());
        point.x += x;
    }
    if (c !== "x") {
        var y = (- delta) +  (2 * delta * Math.random());
        point.y += y;
    }
    return point;
};

//---- methods for working with grids: myGrid[x][y]

fly.eachCell = function (o,f) {
    // call by object o to iterate through grid[x][y]
    // call: fly.eachCell(this,function (o,x,y) { ... });
    // "this" o must have this.cols and this.rows
    for (var x=0; x < o.cols; x++) {
        for (var y=0; y < o.rows; y++) {
            f(o,x,y);
        }
    }
};

/**
 * Returns an array of array of points.
 * It is important to note that the rows and columns of points will
 * be one greater than the columns and rows passed in. The additional column
 * and row define the bottom and side edges. This allows the rows and columns
 * of the rectangles defined by the points to equal the number passed in.
 * @param  {Integer} columns     number of columns
 * @param  {Integer} rows        number of rows
 * @param  {Rectangle} rectangle paper.js Rectangle used to set the bounds
 * @param  {String} direction    optional direction for the grid, defaults to "down-left", can also be
 *                            "down-right","up-right" and "up-left"
 * @return {Array} Array of Arrays of paper.Point
 */

fly.gridPlot = function (columns,rows,rectangle,direction) {

    // NOTE: rectangle is a paper.rectangle, not a path, use
    // this.handle.bounds to send bounds
    // note-to-self: this breaks junkaigo v 0.3.1 !!!
    // TODO: accept both a rectangle and a path.Rectangle?

    direction = direction || "down-left";
    var rect = new paper.Path.Rectangle(rectangle);
    var points = [];
    for (var i=0; i <= columns; i++) {
        points[i] = [];
    }
    var w = rect.bounds.width / columns;
    var h = rect.bounds.height / rows;
    for (var x=0; x <= columns; x++) {
        for (var y=0; y <= rows; y++) {
            var pt = new paper.Point( rect.bounds.x + x * w,
                                rect.bounds.y + y * h);
            switch (direction) {
                case "down-right" :
                case "right" :
                    points[columns-x][y] = pt;
                    break;
                case "up-left" :
                    points[x][rows-y] = pt;
                    break;
                case "up-right" :
                    points[columns-x][rows-y] = pt;
                    break;
                default : // "down-left"
                    points[x][y] = pt;
            }
        }
    }
    return points;
};

fly.initArray = function (columns,rows) {
    // init 3-d array
    var a = [];
    for (var x=0; x < columns; x++) {
        a[x] = [];
        for (var y=0; y < rows; y++) {
            a[x][y] = [];
        }
    }
    return a;
};

//------------- BEGIN FLYPAPER MOTION --------------------//
/*
*   Motion  Methods
*
*   version 0.4
*/
//--------------------------------------------------------//

//--------------------- BEGIN Scroll -----------------------//
/*
*   Motion: Scroll
*   v 0.4 Beta
*
*   Handles scrolling and object in one direction:
*       "left","right","up","down"
*/
//--------------------- BEGIN Scroll -----------------------//

fly.Scroll = function (args){
    args = args || {};
    this.name = args.name + " scroll" || "scroll";
    this.version = "0.4 Beta";
    this.position = args.position || new paper.Point(0,0);
    this.direction = args.direction || "left";
    this.speed = args.speed !== undefined ? args.speed : 5;
    this.curSpeed = 0;
    this.repeat = args.repeat || true;
        // when the moving point in position (x or y) reaches resetAt
        // this.reset is set to true,
        // if repeat is true, position is set to resetPosition;
    this.reset = false;
    this.resetAt = args.resetAt || fly.width;
    this.resetPos = args.resetPos || this.position;
    this.register();
};

fly.Scroll.prototype.info = function (){
    var i = {};
    i.name = this.name;
    i.version = { val: this.version, type: "version"};
    i.position = { val: this.position, type: "val" };
    i.speed = { val: this.speed, type: "val" };
    i.curSpeed = {val: this.curSpeed, type: "val"};
    i.direction = { val: this.direction, type:"val"};
    i.repeat = {val: this.repeat, type:"bool"};
    i.reset = {val: this.reset, type:"bool"};
    return i;
};

fly.Scroll.prototype.register = function () {
    if (fly.debug) {
        fly.infoCtrlr.register(this);
    }
};

fly.Scroll.prototype.update = function (args) {
    this.curSpeed = args.delta * this.speed * 8;
    switch (this.direction) {
        case "up" :
            this.position.y -= this.curSpeed;
            if (this.position.y < this.resetAt) {
                this.reset = true;
            }
            break;
        case "down" :
            this.position.y += this.curSpeed;
            if (this.position.y > this.resetAt) {
                this.reset = true;
            }
            break;
        case "right" :
            this.position.x -= this.curSpeed;
            if (this.position.x < this.resetAt) {
                this.reset = true;
            }
            break;
        default : // "left"
            this.position.x += this.curSpeed;
            if (this.position.x > this.resetAt) {
                this.reset = true;
            }
            break;
    }
    if (this.reset === true) {
        this.position = new paper.Point(this.resetPos);
        this.reset = false;
    }
};

fly.Scroll.prototype.reposition = function (point) {
    this.position = new paper.Point(point);
};

//--------------------- BEGIN Bob -----------------------//
/*
*   Motion: Bob
*   v 0.4.1
*
*   Moves and object up and down repeatedly
*/
//--------------------- BEGIN Bob -----------------------//

fly.Bob = function (args){
    args = args || {};
    this.name = args.name + "'s motion: bob" || "bob";
    this.version = "0.4";
    this.position = new paper.Point(args.position) || new paper.Point(0,0);
    this.origin = new paper.Point(this.position);
    this.speed = args.speed !== undefined ? args.speed : 5;
    this.delta = args.delta !== undefined ? args.delta : 33;
    this.register();
};

fly.Bob.prototype.info = function (){
    var i = {};
    i.name = this.name;
    i.version = { val: this.version, type: "version"};
    i.position = { val:
                    "x: " + this.position.x.toFixed(0) +
                    ", y: " + this.position.y.toFixed(0), type: "val" };
    i.speed = { val: this.speed, type: "val" };
    i.delta = {val: this.delta, type:"val"};
    return i;
};

fly.Bob.prototype.register = function (display) {
    if (fly.debug) {
        display = display || false;
        fly.infoCtrlr.register(this,display);
    }
};

fly.Bob.prototype.reposition = function (point) {
    this.position = new paper.Point(point);
};

fly.Bob.prototype.move = function (point) {
    this.origin = new paper.Point(point);
};

fly.Bob.prototype.update = function (e) {
        // send event from frameEvent
        // this keeps bobbing in real time
        var p = new paper.Point(this.origin);
        var d = Math.sin(e.time * this.speed) * this.delta;
        p.y += d;
        this.reposition(p);
};

//--------------------- BEGIN Swing -----------------------//
/*
*   Motion: Swing
*   version 0.3.3
*   TODO: V0.3.4 using fly.infoCtrlr.fps()
*/
//--------------------- BEGIN Swing -----------------------//

fly.Swing = function (args){
    args = args || {name : "", maxRotation : 90,decay : 0, timestep : 0.01};
    this.name = args.name + " swing" || "swing";
    this.version = "0.3.3";
    this.maxR = args.maxRotation || 90;
    this.decay = 1 + (args.decay/1000) || 1; // damping
    this.velocity = 3; // stays true to maxRot when gravity = 10, l = 1
    this.angle = 0;
    this.deg = 0;
    this.gravity = 10;
    this.l = 1; //length
    this.k = -this.gravity/this.l;
    this.timestep = args.timestep || 0.0001;
    this.acceleration = 0;
    this.register();
};

fly.Swing.prototype.info = function (){
    var i = {};
    i.name = this.name;
    i.version = { val: this.version, type: "version"};
    if (fly.debug) {
        // i.paperID = { val: this.handle.id, type: "val"};
        i.length = { val: this.l.toFixed(2), type: "val" };
        i.timestep = { val: this.timestep.toFixed(3), type: "val"};
        i.decay = { val: this.decay, type: "val"};
        i.velocity = { val: this.velocity.toFixed(0), type: "val"};
        i.angle = { val: this.angle.toFixed(0), type: "val"};
        i.degree = {val: this.deg.toFixed(0), type: "val"};
        i.acceleration = { val: this.acceleration.toFixed(0), type: "val" };
    }
    return i;
};

fly.Swing.prototype.add = function () {
        // v 0.1, force between 0 and 10;
    if (this.velocity > 0) {
        this.velocity += this.force / 10 ;
    }
    else if (this.velocity < 0) {
        this.velocity -= this.force / 10;
    }
};

fly.Swing.prototype.update = function () {
    this.acceleration = this.k * Math.sin(this.angle);
    this.velocity += this.acceleration * this.timestep;
    this.angle    += this.velocity * this.timestep;
    if (this.decay) {
        this.velocity /= this.decay;
    }
};

fly.Swing.prototype.rotation = function () {
    this.deg = this.angle * this.maxR;
    if (this.deg > 0 && this.deg > this.maxR) {
        this.deg = this.maxR;
        this.velocity = 0;
    }
    else if (this.deg < 0 && this.deg < -this.maxR) {
        this.deg = -this.maxR;
        this.velocity = 0;
    }
    return this.deg.toFixed(2);

};
//--------------------- BEGIN ANANDA ---------------------//
/*
*   abstract Class fly.Ananda
*   v 0.4
*
* use as a drawing context and main handle for structures
* creates an object with and optional rectangle handle
* methods:
* - Communication with infoCtrlr & eventCtrlr
* - dragable
*
* takes one parameter: 'args' which can be:
*   a number (square size for handle),
*   a string (name),
*   an array of numbers:
        [s] same as number,
        [w,h]:rect,
*       [x,y,s], [x,y,w,h], larger object:
*  {name:"name",handle:[...],...}
*/
//--------------------- BEGIN ANANDA ---------------------//

fly.Ananda = function () {
    if (this.version === undefined) {
        this.version = "0.3.6";
    }
    if (this.name === undefined) {
        this.name = "Ananda ";
    }
    // empty constructor
};

fly.Ananda.prototype.init = function (args){

    args = typeof(args) !== 'undefined' ? args : -1;
    var iA = {};    // initialization arguments
        iA.n = "";  // name
        iA.bld = "";    // build record
        iA.ds = 50; // default size

    function buildHandle() {
        if (iA.Pt === undefined) {
            iA.Pt = new paper.Point(0,0);
        }
        if (iA.Sz === undefined) {
            iA.Sz = new paper.Size(iA.ds,iA.ds);
        }
        if (iA.Rect === undefined) {
            iA.Rect = new paper.Rectangle(iA.Pt,iA.Sz);
        }

        iA.handle = new paper.Path.Rectangle(iA.Rect);

        iA.handle.selected = false;

        iA.handle.style = iA.style || {fillColor: 'white'};

        iA.handle.visible = iA.visible || false;
    }

    function initFromNum (n) {
        if (args < 0) { // illegal value
                        // or constructed w/ no parameters
            iA.n = "born";
            iA.Sz = new paper.Size(100,100);
            buildHandle();
        } else {
            iA.n = "Numborn";
            iA.Sz = new paper.Size(n,n);
            buildHandle();
        }
        iA.bld += "n(" + n + ")";
    }

    function initFromStr (s) {
        iA.n = s;
        iA.bld += "s(" + s + ")";
    }

    function initFromNumArray (a) {
        // numbers only array
        iA.n = "NArrborn";
        iA.bld += "a[";
        switch (a.length) {
        case 0 :    // empty array
            return;
        case 1 :    // use for size of square
            iA.bld += a[0];
            initFromNum(a[0]);
            return;
        case 2 :    // use as width and height
            iA.bld += a[0] + "." + a[1];
            iA.Sz = new paper.Size(a[0],a[1]);
            break;
        case 3 :    // use as point and square size
            iA.bld += a[0] + "." + a[1] + "." + a[2];
            iA.Pt = new paper.Point(a[0],a[1]);
            iA.Sz = new paper.Size(a[2],a[2]);
        break;
        case 4 :  // use as x,y,w,h
            iA.bld += a[0] + "." + a[1] + "." + a[2] + "." + a[3];
            iA.Pt = new paper.Point(a[0],a[1]);
            iA.Sz = new paper.Size(a[2],a[3]);
        }
        iA.bld +="]";
        buildHandle();
    }

    function checkArray (a) {
            // check all elements are numbers
        var nArray = true;
        for (var i=0; i < a.length; i++) {
            if (typeof a[i] !== "number") {
                nArray = false;
                break;
            }
        }
        if (nArray) {  // array elements all numbers
            initFromNumArray(a);
        } else {
                // todo: array of objects? [pt,size]?
            iA.n = "errorArray";
        }
    }

    function initFromRect(h) {
        iA.Rect = new paper.Rectangle(h);
    }

    function checkHandle (h) {
        if (typeof h === "number") {
            initFromNum(h);
        } else if (h instanceof Array) {
            checkArray(h);
        } else if (typeof h === "object" ) {
            if (h.x !== undefined && h.y !== undefined &&
                h.width !== undefined && h.height !== undefined) {
                    initFromRect(h);
            }
        //  TODO:
        // if (h some kind of path) {
        }
        buildHandle();
    }

    function initFromObj (o) {
        if (o.style) { // paper.js style
            iA.style = o.style;
        }
        if (o.visible) {
            iA.visible = o.visible;
        }
        if (o.handle) {
            checkHandle(o.handle);
        }
        if (o.name) {
            initFromStr(o.name);
        } else {
            iA.n = "Objborn";
        }
    }

    switch (typeof args) {
        case "number" :
            initFromNum(args);
            break;
        case "string" :
            initFromStr(args);
            break;
        case "object" :
            if (args instanceof Array) {
                checkArray(args);
            } else {
                initFromObj(args);
            }
            break;
        default :
            iA.n = "errNoType";
    } // END switch

    this.name = iA.n;
    this.buildRecord = iA.bld;
    this.selectable = args.selectable !== undefined ? args.selectable : false;
    this.dragable = args.dragable !== undefined ? args.dragable : true;
    this.rotatable = args.rotatable !== undefined ? args.rotatable : false;
    this.moving = false;
    this.group = new paper.Group();
    if (iA.handle) {
        this.handle = iA.handle;
        this.handle.name = "handle";
        this.group.addChild(this.handle);
    }
};

fly.Ananda.prototype.info = function (){
    // override this.info to add other info,
    var _i = this.anandaInfo();
    // _i.foo = {val:"foo",type:"val"};
    return _i;
};

fly.Ananda.prototype.anandaInfo = function () {
    var _i = {};
    _i.name = this.name;
    _i.version = { val: this.version, type: "version"};
    if (fly.debug) {
        // _i.paperID = { val: this.handle.id, type: "val"};
        _i.build = { val: this.buildRecord, type: "string"};
        if (this.handle) {
            _i.point = { val:this.handle.bounds.x.toFixed(2) + " x " +
                            this.handle.bounds.y.toFixed(2), type: "val"};
            _i.size = { val: this.handle.bounds.width.toFixed(2) + " x " +
                            this.handle.bounds.height.toFixed(2), type: "val"};
        }
        _i.group = {val: this.group._children.length, type: "val"};
        _i.dragable = {val: this.dragable, type: "bool"};
        _i.moving = { val: this.moving, type: "bool" };
        _i.selectable = { val: this.selectable, type: "bool" };
        _i.selected = { val: this.group.selected, type: "bool" };
        _i.rotatable = {val: this.rotatable, type:"val"};
        // _i.speed = {val: this.speed().toFixed(2), type:"val"};
    }
    return _i;
};

fly.Ananda.prototype.register = function (display) {
    display = display || false;
    fly.infoCtrlr.register(this,display);
    fly.eventCtrlr.subscribe(["mouse down","mouse drag", "mouse up", "frame","r-key", "s-key"],this);
};

//---------- Ananda: animation -----------------------------//

fly.Ananda.prototype.updateHandle = function (rect) {
        // replaces handle with one that is still dragable etc.
    var _r = rect || this.handle.bounds;
    var _s = this.handle.style;
    var _o = this.handle.opacity;
    var _v = this.handle.visible;
    this.handle.remove();
    this.handle = new paper.Path.Rectangle(_r);
    if (this.group.selected === true) {
        this.handle.selected = true;
    }
    this.handle.style = _s;
    this.handle.opacity = _o;
    this.handle.visible = _v;
    this.group.addChild(this.handle);
};

fly.Ananda.prototype.toggleDisplay = function (){
    this.group.visible = !this.group.visible;
};

fly.Ananda.prototype.toggleSelected = function () {
    if (fly.debug && this.selectable) {
        this.group.selected = !this.group.selected;
    }
};

fly.Ananda.prototype.grab = function (event) {
    // WARNING: trying to drag an invisible handle if it is the only
    //          member of this.group will produce an error, make
    //          handle visible first if you need to drag it around.
    // dragging by handle if it has one (efficiency etc.)
    // override if you want a handle but not for hitTests
    // requires redrawing based on handle location;
    if (this.handle) { // drag by handle not by group
        if (this.handle.hitTest(event.point)) {
            this.moveOrigin = event.point.subtract(this.handle.bounds.center);
            this.moving = true;
        }
    } else if (this.group.hitTest(event.point)) {
        this.moveOrigin = event.point.subtract(this.group.bounds.center);
        this.moving = true;
    }
};

fly.Ananda.prototype.drag = function (event) {
    // don't move it if it's under a visible info controller
    if (this.moving && this.dragable && fly.infoCtrlr.moving() === false) {
        this.group.position = event.point.subtract(this.moveOrigin);
    }
};

fly.Ananda.prototype.drop = function (event) {
    this.moving = false;
};

fly.Ananda.prototype.rotate = function (deg) {
    if (this.rotatable) {
        deg = deg || 3;
        this.group.rotate(deg,this.handle.bounds.center);
    }
};

fly.Ananda.prototype.update = function (args) {
    // empty call, replace in concrete classes...
};

fly.Ananda.prototype.eventCall = function (e,args) {
    switch (e) {
        case "r-key" :
            this.rotate();
            break;
        case "s-key" :
            this.toggleSelected();
            break;
        case "frame" :
            this.update(args);
            break;
        case "mouse down" :
            this.grab(args);
            break;
        case "mouse drag" :
            this.drag(args);
            break;
        case "mouse up" :
            this.drop(args);
            break;
    default :
    }
};

//--------------------- END Ananda -------------------------//

//--------------------- BEGIN Pullbar ---------------------//
/*
*   Pullbar extends Ananda, creates grabbable handles
*
*   adaptation of vektor.js from:
*   http://paperjs.org/tutorials/geometry/vector-geometry/
*
*   args = {    fixLength:bool,fixAngle:bool,
*           this.visible: bool,
*           vectorCtr:point,
*           vector:point,   // length from center
*           handle: see ananda // creates pullBall size
*           color: #e4141b  // any valid color val
*       }
*
*   version 0.3.6
*/
//--------------------- BEGIN Pullbar --------------------//

fly.Pullbar = function (args){
    this.version = "0.4";
    args = args || {};
    args.name = args.name + "'s pullbar" || "pullbar";
    if (args.handle === undefined) {
        args.handle = 10; // default size = 50;
    }
    fly.Ananda.call(this);
    this.init(args);
    this.fixLength = args.fixLength || false;
    this.fixAngle = args.fixAngle || false;
    this.vectorCtr = args.vectorCtr || new paper.Point(paper.view.center);
    this.vector = args.vector || new paper.Point(0,0);
    this.color = args.color || '#E4141B';
    this.selected = args.selected || false;
    this.vectorPrevious = this.vector;
    this.joints = [];
    this.build();
    this.draw();
    this.moving = false;
    this.register();
};

fly.Pullbar.prototype = new fly.Ananda();

fly.Pullbar.prototype.constructor = fly.Pullbar;

fly.Pullbar.prototype.info = function (){
    var ia = this.anandaInfo();
    var i = {};
        i.name = ia.name;
        i.moving = ia.moving;
        i.selected = { val: this.selected, type: "bool" };
    if (fly.debug) {
        i.fixedLength = {val: this.fixLength, type:"bool"};
        i.fixedAngle = {val: this.fixAngle, type:"bool"};
        i.vectorStart = {val: this.vectorCtr, type: "val"};
        i.vector = {val: this.vector, type: "val"};
        if (this.vector) {
            i.vectorLength = {val: this.vector.length.toFixed(2), type: "val"};
            i.vectorAngle = {val: this.vector.angle.toFixed(2), type: "val"};
        }
        i.vectorPrevious = {val: this.vectorPrevious, type: "val"};
    }
    return i;
};

fly.Pullbar.prototype.register = function (display) {
    display = display || false;
    fly.infoCtrlr.register(this,display);
    fly.eventCtrlr.subscribe(["mouse down","mouse drag", "mouse up", "s-key"],this);
};

fly.Pullbar.prototype.toggleSelected = function (state) {
    // state is an optional bool
    // change selected state to state, or toggle if no arg sent
    if (state !== undefined) {
        this.selected = state;
    } else {
        this.selected = !this.selected;
    }
    this.group.visible = this.selected;
};

fly.Pullbar.prototype.locate = function (point) {
    this.vectorCtr = point || this.vectorCtr;
    this.joints[0] = this.vectorCtr; // center joint
    this.joints[1] = this.vectorCtr.add(this.vector); // end 1
    this.joints[2] = this.vectorCtr.subtract(this.vector); // end 2
    this.handle.position = this.joints[1];
    return this.handle.bounds.center;
};

fly.Pullbar.prototype.reposition = function (point) {
    // move the pullbar to point and redraw
    // this is intended as a public method
    this.locate(point);
    this.draw();
};

fly.Pullbar.prototype.build = function () {
    this.locate();
    this.bones = [];  // 0:center, 1:bar, 2 & 3:handles
    this.bones[0] = new paper.Path.Circle(this.joints[0], 3); // center
    this.bones[1] = new paper.Path([this.joints[0],this.joints[1]]); // pull bar
    this.bones[1].strokeWidth = 1.75;
    this.bones[1].strokeColor = '#e4141b';

    var o1 = new paper.Path.Oval(this.handle.bounds);  // first grip handle
    var o2 = o1.clone();
    o2.scale(0.5,o2.bounds.center);
    this.bones[2] = new paper.Group([o1,o2]);
    this.bones[3] = this.bones[2].clone();  // second grip handle
    this.bones[3].position = this.joints[1];
    for (var i=0; i < this.bones.length; i++) {
        this.bones[i].strokeWidth = 1.75;
        this.bones[i].strokeColor = this.color;
        this.bones[i].fillColor = 'white';
    }
    this.bones[0].fillColor = this.color;
    this.handle.remove(); // no more need for the handle
    this.group.addChildren(this.bones);
    this.group.visible = this.visible;
};

fly.Pullbar.prototype.processVector = function (point) {
    //
    this.vector = point.subtract(this.vectorCtr);
    if (this.vectorPrevious) {
        if (this.fixLength && this.fixAngle) {
            this.vector = this.vectorPrevious;
        } else if (this.fixLength) {
            this.vector.length = this.vectorPrevious.length;
        } else if (this.fixAngle) {
            this.vector = this.vector.project(this.vectorPrevious);
        }
    }
    this.locate();
    this.draw();
};

fly.Pullbar.prototype.draw = function () {
    this.bones[0].position = this.joints[0];
    this.bones[1].segments[0].point = this.joints[1];
    this.bones[1].segments[1].point = this.joints[2];
    this.bones[2].position = this.joints[1];
    this.bones[3].position = this.joints[2];
};

fly.Pullbar.prototype.grab = function (event) {
    if (this.selected) {
        if (this.bones[2].hitTest(event.point) ||
            this.bones[3].hitTest(event.point)) {
            this.moving = true;
            this.processVector(event.point);
        }
    }
};

fly.Pullbar.prototype.drag = function (event) {
    if (this.moving === true) {
        if (!event.modifiers.shift && this.fixLength && this.fixAngle) {
            this.vectorCtr = event.point;
        }
        this.processVector(event.point);
    }
};

fly.Pullbar.prototype.drop = function (event) {
    if (this.moving === true) {
        this.processVector(event.point);
        // if (this.dashItem) {
        //  this.dashItem.dashArray = [1, 2];
        //  this.dashItem = null;
        // }
        this.vectorPrevious = this.vector;
        this.moving = false;
    }
};