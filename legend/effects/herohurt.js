var BaseEffect = require("../../legend/effects/baseeffect.js");
var Events = require("../../legend/event.js");
var util = require("../../util.js");


var HeroHurt = function (event, count, name) {
    BaseEffect.call(this);
    this.count = count;
    this.name = name;

    this[event] = function (obj, cb) {

        if (obj.fromminion == obj.minion) {
            obj.minion.player.enemy.blood_cut(count);
        }
        cb();
    };
}

util.inherits(HeroHurt, BaseEffect);

module.exports = HeroHurt;