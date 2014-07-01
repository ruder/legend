var BaseEffect = require("../../legend/effects/baseeffect.js");
var Events = require("../../legend/event.js");
var util = require("../../util.js");


var Snake = function () {
    BaseEffect.call(this);
    this.name = "潜行";
}

util.inherits(Snake, BaseEffect);

Snake.prototype[Events.MINION_CREATE] = function (obj, cb) {
    
    var m = obj.fromminion;
    
    if (m && m.exist(this)) {
        m.state_sitelevel(-1);
    }
    cb();
};

Snake.prototype[Events.MINION_ATTACK] = function (obj, cb) {
    var m = obj.fromminion;
    
    if (m && m.exist(this)) {
        m.state_sitelevel(0);
    }
    cb();
};



module.exports = Snake;
