var BaseEffect = require("../../legend/effects/baseeffect.js");
var Events = require("../../legend/event.js");
var util = require("../../util.js");


var Taunt = function () {
    BaseEffect.call(this);
    this.name = "嘲讽";
}

util.inherits(Taunt, BaseEffect);

Taunt.prototype[Events.MINION_CREATE] = function (obj, cb) {

    var m = obj.fromminion;

    if (m && m.exist(this)) {
        m.state_sitelevel(1);
    }
    cb();
};



module.exports = Taunt;