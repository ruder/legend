var BaseEffect = require("../../legend/effects/baseeffect.js");
var Events = require("../../legend/event.js");
var util = require("../../util.js");


var PickCard = function (event, count, name) {
    BaseEffect.call(this);
    this.count = count;
    this.name = name;

    this[event] = function (obj, cb) {

        if (obj.fromminion == obj.minion) {
            for (var i = 0; i < this.count; i++)
                obj.player.card_pick();
        }
        cb();
    };

}

util.inherits(PickCard, BaseEffect);

module.exports = PickCard;