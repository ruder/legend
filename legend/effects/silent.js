var BaseEffect = require("../../legend/effects/baseeffect.js");
var Events = require("../../legend/event.js");
var Control = require("../../legend/effects/silent.js");
var util = require("../../util.js");


var Silent = function () {
    BaseEffect.call(this);
    this.needTarget = true;
    this.name = "沉默";
}

util.inherits(Silent, BaseEffect);

Silent.prototype[Events.CARD_USE] = function (obj, cb) {
    
    if (obj.card==obj.fromcard) {

        obj.card.player.control.chooseTarget(Control.TARGET_SCOPE_ALL,function(m){
            m.silent();
            cb();
        });
        return ;      
    }
    cb();
};



module.exports = Silent;