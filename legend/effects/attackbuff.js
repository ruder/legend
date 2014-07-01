var BaseEffect = require("../../legend/effects/baseeffect.js");
var Events = require("../../legend/event.js");
var util = require("../../util.js");


var AttackBuff = function (count) {
    BaseEffect.call(this);
    this.count = count;
    this.name = "你的其他仆从获得+"+count+"攻击。";
}

util.inherits(AttackBuff, BaseEffect);

AttackBuff.prototype[Events.MINION_CREATE] = function (obj, cb) {

    var m = obj.fromminion;
    var player = obj.fromplayer;

    if (obj.fromminion == obj.minion) {
        for (var i = 0; i < player.minions.length; i++) {
            var pm = player.minions[i];
            if (pm != m) {
                pm.attack_add(this.count);
            }
        }
    }
    else if (player && obj.minion && player === obj.minion.player) {
        m.attack_add(this.count);
    }

    cb();
};

AttackBuff.prototype[Events.MINION_DISTORY] = function (obj, cb) {
    var m = obj.fromminion;
    var player = obj.fromplayer;
    if (obj.fromminion == obj.minion) {
        for (var i = 0; i < player.minions.length; i++) {
            var pm = player.minions[i];
            if (pm != m)
                pm.attack_cut(this.count);
        }
    }
    cb();
};

AttackBuff.prototype.silent = function (m) {
    var player = m.player;
    for (var i = 0; i < player.minions.length; i++) {
        var pm = player.minions[i];
        if(pm!=m)
            pm.attack_cut(this.count);
    }
};


module.exports = AttackBuff;