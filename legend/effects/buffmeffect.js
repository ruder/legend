var BaseEffect = require("../../legend/effects/baseeffect.js");
var Control = require("../../legend/control.js");
var Events = require("../../legend/event.js");
var util = require("../../util.js");


var BuffMeffect = function (name) {
    BaseEffect.call(this);
    this.name = name;
    this.needTarget = false;
    this.scope = Control.TARGET_SCOPE_SELF;
    this.created_func = null;
    this.bloodAdd_func = null;
    this.bloodCut_func = null;
    this.distory_func = null;
    this.roundend_func = null;
    this.roundbegin_func = null;
    this.usercard_func = null;
    this.silent_func = null;
    return this;
}

util.inherits(BuffMeffect, BaseEffect);

BuffMeffect.prototype[Events.CARD_USE] = function (obj, cb) {
    if (!this.usercard_func) {
        cb();
        return;
    }
    this.usercard_func(obj);
    cb();

};
BuffMeffect.prototype[Events.MINION_CREATE] = function (obj, cb) {
    if (!this.created_func) {
        cb();
        return;
    }
    var player = obj.player;

    if (this.needTarget) {
        var me = this;
        player.control.chooseTarget(this.scope, function (minion) {
            if (minion) {
                obj.target = minion;
                me.created_func(obj);
            }
            cb();
        })
    }
    else {
        this.created_func(obj);
        cb();
    }


};
BuffMeffect.prototype[Events.MINION_BLOOD_ADD] = function (obj, cb) {
    if (!this.bloodAdd_func) {
        cb();
        return;
    }

    obj.effect = this;
    this.bloodAdd_func(obj);
    cb();

};
BuffMeffect.prototype[Events.MINION_BLOOD_CUT] = function (obj, cb) {
    if (!this.bloodCut_func) {
        cb();
        return;
    }
    var player = obj.player;

    obj.effect = this;
    this.bloodCut_func(obj);
    cb();


};
BuffMeffect.prototype[Events.MINION_DISTORY] = function (obj, cb) {
    if (!this.distory_func) {
        cb();
        return;
    }


    obj.effect = this;
    this.distory_func(obj);
    cb();


};
BuffMeffect.prototype[Events.ROUND_END] = function (obj, cb) {
    if (!this.roundend_func || !obj.minion){
        cb();
        return;
    }
    
    obj.effect = this;
    this.roundend_func(obj);
    cb();

};
BuffMeffect.prototype[Events.ROUND_BEGIN] = function (obj, cb) {
    if (!this.roundbegin_func || !obj.minion){
        cb();
        return;
    }
    
    obj.effect = this;
    this.roundbegin_func(obj);
    cb();

};

BuffMeffect.prototype.silent = function (m) {
    if (!this.silent_func) {
        return;
    }
    this.silent_func(m);
};
BuffMeffect.prototype.oneEnemy = function () {
    this.needTarget = true;
    this.scope = Control.TARGET_SCOPE_ANAMY;
    return this;
};
BuffMeffect.prototype.oneSelf = function () {
    this.needTarget = true;
    this.scope = Control.TARGET_SCOPE_SELF;
    return this;
};
BuffMeffect.prototype.one = function () {
    this.needTarget = true;
    this.scope = Control.TARGET_SCOPE_ALL;
    return this;
};
BuffMeffect.prototype.created = function (oper) {
    this.created_func = oper;
    return this;
};
BuffMeffect.prototype.bloodAdd = function (oper) {
    this.bloodAdd_func = oper;
    return this;
};
BuffMeffect.prototype.bloodCut = function (oper) {
    this.bloodCut_func = oper;
    return this;
};
BuffMeffect.prototype.distory = function (oper) {
    this.distory_func = oper;
    return this;
};
BuffMeffect.prototype.roundend = function (oper) {
    this.roundend_func = oper;
    return this;
};
BuffMeffect.prototype.roundbegin = function (oper) {
    this.roundbegin_func = oper;
    return this;
};
BuffMeffect.prototype.usercard = function (oper) {
    this.usercard_func = oper;
    return this;
};
BuffMeffect.prototype.whensilent = function (oper) {
    this.silent_func = oper;
    return this;
};

module.exports = BuffMeffect;