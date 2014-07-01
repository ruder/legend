var Events=require("../../legend/event.js");
var BaseEffect = function () {
    this.needTarget = false;
};

BaseEffect.prototype.event = function (obj, cb) {

    var e = this[obj.name];
    if (!e) {
        cb();
        return;
    }

    e.call(this,obj, cb);
};


module.exports = BaseEffect;