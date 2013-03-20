/*
 * This file is part of the flypaper.js build.
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

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

    fly.grantString(o);
    fly.grantInfo(o);
    fly.grantEvents(o);
    return o;
};
