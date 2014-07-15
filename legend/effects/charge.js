var BaseEffect = require("../../legend/effects/baseeffect.js");
var Events = require("../../legend/event.js");
var util = require("../../util.js");


var Charge = function () {
    BaseEffect.call(this);
    this.name = "冲锋";
}

util.inherits(Charge, BaseEffect);

Charge.prototype[Events.MINION_CREATE] = function (obj, cb) {

    var m = obj.fromminion;

    if (m && m.exist(this)) {
        m.state_ready(true);
    }
    cb();
};


module.exports = Charge;