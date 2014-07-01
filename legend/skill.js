var Control=require("../legend/control.js");
var Skill = function (name, remark, cost, needTarget, oper) {
    this.name = name;
    this.remark = remark;
    this.cost = cost;
    this.needTarget = needTarget;
    this.oper = oper;
};

Skill.prototype.use = function (player) {
    if (player.power < this.cost)
        return;

    player.power_cut(this.cost);
    if (!this.needTarget) {
        this.oper(player);
        return;
    }

    var me = this;
    player.control.chooseTarget(Control.TARGET_SCOPE_ALL, function (target) {
        me.oper(player, target);
    });
}

module.exports = Skill;