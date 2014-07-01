var BaseEffect = require("../../legend/effects/baseeffect.js");
var Events = require("../../legend/event.js");
var util = require("../../util.js");


var MinionBack = function (event, count, name) {
    BaseEffect.call(this);
    this.count = count;
    this.name = name;

    this[event] = function (obj, cb) {

        if (obj.fromminion == obj.minion) {
            var objs = [];
            var ms = obj.minion.player.minions;
            for (var i = 0; i < ms.length; i++) {
                if (ms[i] != obj.minion)
                    objs.push(ms[i]);
            }
            for (var i = 0; i < this.count; i++) {
                if (objs.length <= 0)
                    break;
                var index = Math.floor(Math.random() * objs.length);
                var m = objs[index];
                m.backToPlayer();
                objs.splice(index, 0);
            };
        }
        cb();
    };

}

util.inherits(MinionBack, BaseEffect);

module.exports = MinionBack;