/*
 * This file is part of the flypaper.js build.
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

/*

## Events
Objects can subscribe to event through the event Controller (EC)
Grant events will give any object all the necessary functions to
register and receive events.

### Registry
The registry is a private object pairing events and handlers.
    {"frame":"update","beat wing":"updateWing",...}

### Register Event
RegisterEvent adds events to the registry and subscribes to events
through the EC. Event objects take the form:
    {"event 1":"handlerOne","event 2":"handlerTwo",...}
Each handler should be a public method which can accept the event
args. Events can be any event expected from another object, or any
paper.js events ("mouse up","frame" etc.). For paper events, expect
the event args passed by paper.js. If events already exist in the
objects registry, they will be replaced with the new handler.

### Deregister Event
DeregisterEvent(event) unsubscribes the event from the EC and removes
it from the registry. (event) can be a string representing one event
name, an array of events, or the string "all" to deregister from all
events.

### Event Call
eventCall(event,args) is the method called by eventCtrlr for registered
events. event is a string which should match the event in the registry.

*/


fly.grantEvents = function (o) {
	var registry = {};

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

	o.deregisterEvent = function (event) {
		var e;
		var	dereg = function (e) {
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
	};

	o.eventCall = function (event,args) {
		if (registry.hasOwnProperty(event) && o.hasOwnProperty(registry[event])) {
			var func = registry[event];
			this[func](args);
		}
		return o;
	};

	o.logEvents = function(){
		return fly.toString(registry);
	};

	return o;
};