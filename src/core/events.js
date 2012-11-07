/*
 * This file is part of the flypaper.js build. 
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

// TODO:
// -don't need to pass functions, just function name
// -passing args to functions should suffice
// - need and registerEvent and deregisterEvent
// - register/deregister multiple events
// -only need single event handler function for each event (no eventArray)
// -send events to EC.subscribe
// -EC 

var grantEventHandling = function (o) {
	var registry = {};

	o.registerEvent = function (type, method, parameters) {
	//Makes a handler record. Put it
	// in a handler array, making one if it doesn't yet
	// exist for this type.

		var handler = {
			method: method,
			parameters: parameters
		};
		if (registry.hasOwnProperty(type)) {
			registry[type].push(handler);
		} else {
			registry[type] = [handler];
		}
		return this;
	};

	o.eventCall = function (event,args) {
	// event = "event" as string
	// optional args contain the event (usually as sent by paper.js)
		var eventArray,
			func,
			handler;
			
		// If an array of handlers exist for this event, then
		// loop through it and execute the handlers in order.
		if (registry.hasOwnProperty(event)) {
			eventArray = registry[event];
			for ( var i = 0; i < eventArray.length; i += 1) {
				handler = eventArray[i];

		// A handler record contains a method and an optional
		// array of parameters. If the method is a name, look
		// up the function.
		func = handler.method;
		if (typeof func === 'string') {
			func = this[func];
		}

// Invoke a handler. If the record contained
// parameters, then pass them. Otherwise, pass the
// event object.

				func.apply(this,
					handler.parameters || [event]);
			}
		}
		return this;
	};

	return o;
};