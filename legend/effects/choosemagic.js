var BaseEffect = require("../../legend/effects/baseeffect.js");
var Control = require("../../legend/control.js");
var Events = require("../../legend/event.js");
var util = require("../../util.js");


var ChooseMagic = function (name) {
    BaseEffect.call(this);
    this.name = name;
    this.needTarget = false;
    this.scope = Control.TARGET_SCOPE_SELF;
    this.oper = null;
    return this;
}

util.inherits(ChooseMagic, BaseEffect);

ChooseMagic.prototype[Events.CARD_USE] = function (obj, cb) {
    var player = obj.player;
    var c = obj.card;
    if (obj.card == obj.fromcard) {
        this.oper(obj,cb);
    }
    else {
        cb();
    }

};

ChooseMagic.prototype.silent = function (m) {
    
};

ChooseMagic.prototype.setOper = function (oper) {
    this.oper = oper;
    return this;
};

module.exports = ChooseMagic;