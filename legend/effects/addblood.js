var BaseEffect = require("../../legend/effects/baseeffect.js");
var Control = require("../../legend/control.js");
var Events = require("../../legend/event.js");
var util = require("../../util.js");

var AddBlood = function (eventName, count, name) {
    BaseEffect.call(this);

    this.needTarget = true;
    this.name = name;
    this.count = count;
    this.eventName = eventName;

    this[eventName] = function (obj, cb) {
        var player = obj.fromplayer;
        var m = obj.fromminion;
        if (m && m.exist(this)) {
            var me = this;
            player.control.chooseTarget(Control.TARGET_SCOPE_SELF, function (minion) {
                minion.blood_add(me.count);
                cb();
            })
            return;
        }
        cb();
    };
}


util.inherits(AddBlood, BaseEffect);


module.exports = AddBlood;
