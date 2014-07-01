var Action = require("../../legend/action.js");
var util = require("../../util.js");


var BaseCard = function (name, job, type, rate, cost, effects) {
    this.name = name;
    this.job = job;
    this.type = type;
    this.cost = cost;
    this.effects = effects || [];
};
BaseCard.prototype.cost_set = function (cost, player) {
    this.cost = cost;
    if (player) {
        player.battle.addAction(Action.card_cost_change(this.id, this.cost));
    }
};
BaseCard.prototype.event = function (obj, callback) {
    var nobj = {};
    for (var index in obj)
        nobj[index] = obj[index];
    nobj.card = this;

    var opers = [];
    for (var i = 0; i < this.effects.length; i++) {
        opers.push({ t: this.effects[i], oper: this.effects[i].event });
    }

    util.orderExcute(opers, nobj, callback);
};


module.exports = BaseCard;