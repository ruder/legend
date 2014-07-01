var BaseCard = require("../../legend/cards/basecard.js");
var Weapon = require("../../legend/weapon.js");
var util = require("../../util.js");

var WeaponCard = function (name, job, rate, cost, attack, blood,effects) {
    BaseCard.call(this, name, job,"Weapon", rate, cost, effects);

    this.attack = attack;
    this.blood = blood;
};
util.inherits(WeaponCard, BaseCard);

WeaponCard.prototype.use = function (player) {
    if (player.power < this.cost)
        return;
    player.power_cut(this.cost);

    var weapon = new Weapon(this.name, this.attack, this.blood, this.effects);
    player.hero.weapon_add(weapon);
    player.card_trash(this);
};


module.exports = WeaponCard;