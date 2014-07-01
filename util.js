var Util={}

Util.orderExcute = function (opers, obj, callback) {
    if (!opers || !opers.length || opers.length <= 0) {
        callback();
        return;
    }

    var index = 0;
    var cb = function () {
        index++;
        if (index >= opers.length) {
            callback();
            return;
        }
        try {
            opers[index].oper.call(opers[index].t, obj, cb);
        }
        catch (e) {
            console.error(e.stack || e);
            cb();
        }
    };
    try {
        opers[index].oper.call(opers[index].t, obj, cb);
    }
    catch (e) {
        console.error(e.stack || e);
        cb();
    }
};

Util.syncExcute = function (opers, obj, callback) {
    if (!opers || !opers.length || opers.length <= 0) {
        callback();
        return;
    }
    var count = 0;
    var cb = function () {
        count++;
        if (count >= opers.length)
            callback();
    }
    for (var i = 0; i < opers.length; i++) {
        try {
            opers[i].oper.call(opers[i].t, obj, cb);
        }
        catch (e) {
            console.error(e.stack || e);
            cb();
        }
    }
};

Util.clone = function (obj) {
    var o;
    if (typeof obj == "object") {
        if (obj === null) {
            o = null;
        } else {
            if (obj instanceof Array) {
                o = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    o.push(Util.clone(obj[i]));
                }
            } else {
                o = {};
                for (var j in obj) {
                    o[j] = Util.clone(obj[j]);
                }
            }
        }
    } else {
        o = obj;
    }
    return o;
};

Util.inherits = function(childCtrl, parentCtrl) {
    /** @constructor */
    function tempCtrl() { };
    tempCtrl.prototype = parentCtrl.prototype;
    childCtrl.superClass = parentCtrl.prototype;
    childCtrl.prototype = new tempCtrl();
    childCtrl.prototype.constructor = childCtrl;
};

Util.random = function (array) {
    if (array.length <= 0)
        return null;
    var index = Math.floor(Math.random() * array.length);
    return array[index];
};

Util.each = function (array, func) {
    if (typeof array == "number") {
        for (var i = 0; i < array; i++)
            if (func(i))
                break;

        return;
    }

    for (var i = array.length - 1; i >= 0; i--) {
        if (func(array[i], i))
            break;
    }
};

Util.remove = function (array, obj) {
    Util.each(array, function (c, i) {
        if (c == obj) {
            array.splice(i, 1);
            return true;
        }
        return false;
    });
};
Util.add = function (array, ay) {
    if (ay.length) {
        Util.each(ay, function (c) {
            array.push(c);
        });
    }
    else
        array.push(ay);
}

module.exports = Util;