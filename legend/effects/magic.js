var BaseEffect = require("../../legend/effects/baseeffect.js");
var Control = require("../../legend/control.js");
var Events = require("../../legend/event.js");
var util = require("../../util.js");


var Magic = function (name) {
    BaseEffect.call(this);
    this.name = name;
    this.needTarget = false;
    this.scope = Control.TARGET_SCOPE_SELF;
    this.oper = null;
    return this;
}

util.inherits(Magic, BaseEffect);

Magic.prototype[Events.CARD_USE] = function (obj, cb) {
    var player = obj.player;
    var c = obj.card;
    if (obj.card == obj.fromcard) {
        obj.add = 0;
        if (cb.card && cb.card.type == "技能")
            obj.add = player.magic;
        if (this.needTarget) {
            var me = this;
            player.control.chooseTarget(this.scope, function (minion) {
                obj.target = minion;
                me.oper(obj);
                cb();
            })
        }
        else {
            this.oper(obj);
            cb();
        }
    }
    else {
        cb();
    }

};

Magic.prototype.silent = function (m) {
    
};
Magic.prototype.oneEnemy = function () {
    this.needTarget = true;
    this.scope = Control.TARGET_SCOPE_ANAMY;
    return this;
};
Magic.prototype.oneSelf = function () {
    this.needTarget = true;
    this.scope = Control.TARGET_SCOPE_SELF;
    return this;
};
Magic.prototype.one = function () {
    this.needTarget = true;
    this.scope = Control.TARGET_SCOPE_ALL;
    return this;
};
Magic.prototype.setOper = function (oper) {
    this.oper = oper;
    return this;
};

module.exports = Magic;