/*
 * This file is part of the flypaper.js build.
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

//  private registry = {"frame":"update","beat wing":"updateWing",...etc.}

fly.grantEvents = function (o) {
	var registry = {};

	o.registerEvent = function (eventObj) {
		// eventObj = {"event 1":"handlerOne","event 2":"handlerTwo",...}
		// record event(s) and handling method in registry
		// if event exists in registry, the handler will be replaced.
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
		// events can be a string representing one event name, an
		// array of events, or the string "all" to deregister all
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
		// method called by eventCtrlr for registered events
		// event = "event" as string
		// optional args contain the event (usually as sent by paper.js)
		if (registry.hasOwnProperty(event) && o.hasOwnProperty(registry[event])) {
			var func = registry[event];
			o[func](args);
		}
		return o;
	};

	o.logEvents = function(){
		return fly.toString(registry);
	};

	return o;
};