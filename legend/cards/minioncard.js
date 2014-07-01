var BaseCard = require("../../legend/cards/basecard.js");
var Minion = require("../../legend/minion.js");
var util = require("../../util.js");


var MinionCard = function (name, job, rate,race, cost, attack, blood, effects) {
    BaseCard.call(this, name, job,"Minion", rate, cost, effects);

    this.race= race,
    this.attack = attack;
    this.blood = blood;
};

util.inherits(MinionCard, BaseCard);

MinionCard.prototype.use = function (player,index) {
    if (player.power < this.cost)
        return;

    player.battle.log(player.name + " user the card (" + this.name + ")");

    player.power_cut(this.cost);
    var minion = new Minion(this.name, this.race, this.attack, this.blood, this, player, this.effects);
    player.minion_add(minion,index);
    player.card_trash(this);

};



module.exports = MinionCard;


