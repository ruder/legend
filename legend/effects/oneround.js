var BaseEffect = require("../../legend/effects/baseeffect.js");
var Control = require("../../legend/control.js");
var Events = require("../../legend/event.js");
var util = require("../../util.js");


var OneRound = function (name) {
    BaseEffect.call(this);
    this.name = name;
    this.oper = null;
    this.endOper = null;
    this.beginOper = null;

    this.needTarget = false;
    this.scope = Control.TARGET_SCOPE_SELF;
    this.target = null;

    return this;
}

util.inherits(OneRound, BaseEffect);

OneRound.prototype[Events.CARD_USE] = function (obj, cb) {
    var player = obj.player;
    var c = obj.card;
    if (obj.card == obj.fromcard) {
        player.effect_add(this);
        obj.add = player.magic;
        if (this.needTarget) {
            var me = this;
            player.control.chooseTarget(this.scope, function (minion) {
                obj.target = minion;
                me.target = minion;
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

OneRound.prototype[Events.ROUND_END] = function (obj, cb) {
    if (!this.endOper || obj.card) {
        cb();
        return;
    }
    console.log("OneRound:r_end"+obj.card);
    var player = obj.player;
    if (obj.fromplayer == obj.player) {

        obj.target = this.target;
        this.endOper(obj);
        obj.player.effect_remove(this);

        cb();
    }
    else {
        cb();
    }
};
OneRound.prototype[Events.ROUND_BEGIN] = function (obj, cb) {
    if (!this.beginOper  || obj.card){
        cb();
        return;
    }
    console.log("OneRound:r_begin"+obj.card);
    var player = obj.player;
    if (obj.fromplayer == obj.player) {
        
            obj.target = this.target;
            this.beginOper(obj);
            obj.player.effect_remove(this);
        
        cb();
    }
    else {
        cb();
    }
};
OneRound.prototype.setOper = function (oper) {
    this.oper = oper;
    return this;
};
OneRound.prototype.round_end=function(oper){
    this.endOper = oper;
    return this;
}
OneRound.prototype.round_begin=function(oper){
    this.beginOper = oper;
    return this;
}
OneRound.prototype.oneEnemy = function () {
    this.needTarget = true;
    this.scope = Control.TARGET_SCOPE_ANAMY;
    return this;
};
OneRound.prototype.oneSelf = function () {
    this.needTarget = true;
    this.scope = Control.TARGET_SCOPE_SELF;
    return this;
};
OneRound.prototype.one = function () {
    this.needTarget = true;
    this.scope = Control.TARGET_SCOPE_ALL;
    return this;
};


module.exports = OneRound;