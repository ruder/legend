var BaseEffect = require("../../legend/effects/baseeffect.js");
var Events = require("../../legend/event.js");
var util = require("../../util.js");


var Windfury = function () {
    BaseEffect.call(this);
    this.name = "风怒";
}

util.inherits(Windfury, BaseEffect);

Windfury.prototype[Events.MINION_CREATE] = function (obj, cb) {

    var m = obj.fromminion;

    if (m && m.exist(this)) {
        m.state_dblfire(true);
    }
    cb();
};

module.exports = Windfury;