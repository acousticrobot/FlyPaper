/*
 * This file is part of the flypaper.js build. 
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

/*
 * ## eventCtrlr
 * eventCtrlr is the main pub/sub object, 
 * paper events all publish through it, 
 * objects listening for events
 * 
 * ### SUBSCRIBE to events with: 
 *     fly.eventCtrlr.subscribe("event",this);
 *  See fly.Ananda.prototype.register for an example.
 *  common events include: 
 *  "mouse down","mouse drag", "mouse up",	
 *  "frame", and "x-key" where x is any key
 *  
 * ### PUBLISH events with:
 *      fly.eventCtrlr.publish("mouse down",event);
 *      mouse and key events are handled with paper tools
 *      implemented within flypaper.
 * 
 *  **IMPORTANT** On-frame events must be initaited
 *  in the main javascript on window load. Use:	   
 *      paper.view.onFrame = fu*c*ion(event) {
 * 	        fly.eventCtrlr.publish("frame");
 * 	    };
 */

fly.eventCtrlrInit = function() {
	
	fly.eventCtrlr = (function () {

		var name = "eventCtrlr",
			version = "0.4",
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

		function subscribe(e,o) {
				// e = ["event","event",...], o = registering object 
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

		function unsubscribe(o) {
			for (var e in events) {
				for (var i=0, j = events[e].length; i < j; i++) {
					if (events[e][i] === o) {
						events[e].splice(i,1); // remove 0 events;
					}
					if (events[e].length === 0) {
						delete events[e];
					}
				}
			}
		}

		function register() {
			fly.infoCtrlr.register(this);
		}

		function info() {
			var i = {
				name: name,
				v: { val: version, type: "version" },
				errors: {val: errors.length, type: "val"}
			};
			var event, _t;
			for (event in events) {
				if (firing[event] > 0) {
					_t = "eventFiring";
				} else {
					_t = "event";
				}
				var subs = events[event].length > 1 ? " subscribers" : " subscriber";
				i[event] = {val: events[event].length + subs, type: _t};
			}
			i.last_key = {val: lastKey, type: "string"};
			return i;
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

		function reportErrors(){return errors;}

		return {
			publish: publish,
			subscribe: subscribe,
			unsubscribe: unsubscribe,
			info: info,
			reqInfo: register,	// infoCtrlr requests registration
			reportErrors: reportErrors
		};
	})();	
};