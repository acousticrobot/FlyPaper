/*
 * This file is part of the flypaper.js build.
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */

/**
 *
 * Grants objects the ability to send info packets,
 * and to define what properties will be sent in the info packet.
 *
 * #### Granting Info
 * Objects inheriting from {@link base} already have info methods, and are
 * registered with the Info Controller. To grant info to other types of object,
 * use `fly.grantInfo(myObject)`. Your object must also register with the
 * [Info Controller]{@link infoCtrlr}
 *
 * #### Adding Info
 * To add info to the info packet, use [addInfo()]{@link base.addInfo}
 *
 * #### Deleting Info
 * To delete info, use [deleteInfo()]{@link base.deleteInfo}
 *
 * @param {Object} o The object to grant info functionality
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
        // private utility to add objects in args to info _i
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
     * If the property type is `bool` or `val`, these must be callable
     * by your object to obtain the value as a string, number, or boolean.
     * So for the example you need to be able to call:
     *
     *     myObject['sleeping'] // true or false
     *     myObject['speed'] // number or string
     *
     * @example
     * // myObject.sleeping() should return a bool
     * // myObject.speed() should return a number or string
     * // myObject.sam() will not be querried
     * myObject.addInfo(
     *   sleeping:{val:'sleeping',type:'bool'},
     *   speed:{val:'speed',type:'val'},
     *   val1:{val:'sam',type:'i am'}
     * )
     *
     * @param {Object} args {infoToTrack:{val:'foo',type:'bar'},..}
     * @returns {this} This is a chainable method
     * @todo describe other types, custom types
     * @todo is 'name' reserved, 'version' reserved ?
     * @memberOf base
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
     *
     * @example
     * myObject.deleteInfo('sleeping');
     * myObject.deleteInfo(['speed','val1']);
     *
     * @memberOf base
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
     * @memberOf base
     */
    o.info = function(){
        var _i = {};
        _i.name = name;
        _i = mergeInfo(this,_i,_info);
        return _i;
    };

    return o;

};
