var BaseCard = require("../../legend/cards/basecard.js");
var util = require("../../util.js");

var SecretCard = function (name, job, rate, cost, effects) {
    BaseCard.call(this, name, job,"Magic", rate, cost, effects);
};

util.inherits(SecretCard, BaseCard);

SecretCard.prototype.use = function (player) {
    if (player.power < this.cost)
        return;
    player.power_cut(this.cost);
    player.card_trash(this);
};


module.exports = SecretCard;