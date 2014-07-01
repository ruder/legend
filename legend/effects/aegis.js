var BaseEffect = require("../../legend/effects/baseeffect.js");
var Events = require("../../legend/event.js");
var util = require("../../util.js");


var Aegis = function () {
    BaseEffect.call(this);
    this.name = "圣盾";
}

util.inherits(Aegis, BaseEffect);

Aegis.prototype[Events.MINION_CREATE] = function (obj, cb) {
    
    var m = obj.fromminion;
    
    if (m && m.exist(this)) {
        m.state_aegis(true);
    }
    cb();
};



module.exports = Aegis;