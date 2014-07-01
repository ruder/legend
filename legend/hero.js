var Events = require("../legend/event.js");
var Action = require("../legend/action.js");
var Minion = require("../legend/minion.js");
var util = require("../util.js");

var Hero = function (player, name, blood, race, weapon, skill) {
    Minion.call(this, name, race, 0, blood, null, player, []);
    this.ishero = true;
    this.id = undefined;
    this.weapon = weapon;
    this.skill = skill;
    this.guard = 0;

    this.skillUsed = false;
    if (this.weapon)
        this.attack = this.weapon.attack;
};

util.inherits(Hero, Minion);
Hero.prototype.roundend = function () {
    if (!this.weapon) {
        if (this.attack > 0) {
            this.attack_cut(this.attack);
        }
    }
    else if(this.attack>this.weapon.attack){
        this.attack_cut(this.attack-this.weapon.attack);
    }
    else if(this.attack<this.weapon.attack){
        this.attack_add(this.weapon.attack-this.attack);
    }

    this.skillUsed = false;
};
Hero.prototype.remove = function () {
    this.player.battle.addAction(Action.hero_die(this.id));
    this.player.enemy.win();
};
Hero.prototype.backToPlayer = function () {

};
Hero.prototype.silent = function () {
 
}
Hero.prototype.attackTarget = function (minion) {
    this.player.battle.addAction(Action.minion_attack(this.id, minion.id));

    minion.blood_cut(this.attack);

    if (!minion.ishero) {
        this.blood_cut(minion.attack);
    }

    if (this.weapon)
        this.weapon.attacked();
};
Hero.prototype.blood_cut = function (count) {
    if (this.aegis) {
        this.state_aegis(false);
        return;
    }
    if (this.guard > 0) {
        var gcount = count;
        if (this.guard > count)
            count = 0;
        else {
            gcount = this.guard;
            count = count - this.guard;
        }


        this.guard -= gcount;
        this.player.battle.addAction(Action.hero_guard_hurt(this.id, gcount));
    }

    if (count <= 0)
        return;

    this.blood -= count;
    this.player.battle.addAction(Action.minion_hurt(this.id, count));
    this.player.battle.event({ name: Events.MINION_BLOOD_CUT, fromplayer: this.player, fromminion: this }, function () { });
    if (this.blood <= 0) {
        this.remove();
    }
};
Hero.prototype.guard_add = function (count) {
    this.guard += count;
    this.player.battle.addAction(Action.hero_guard_cure(this.id, count));
};
Hero.prototype.state_silent = function () { };

Hero.prototype.weapon_remove = function () {
    this.weapon = null;
    this.attack_cut(this.attack);
    this.player.battle.addAction(Action.weapon_remove(this.id));
};
Hero.prototype.weapon_add = function (weapon) {
    if (this.weapon)
        this.weapon_remove();
    this.weapon = weapon;
    this.weapon.hero = this;
    this.attack = weapon.attack;
    this.player.battle.addAction(Action.weapon_add(this.id, this.weapon.name, this.weapon.attack, this.weapon.blood));
};
Hero.prototype.weapon_change = function () {
    this.attack = this.weapon.attack;
    this.player.battle.addAction(Action.weapon_change(this.id, this.weapon.attack, this.weapon.blood));
};

Hero.prototype.useSkill = function () {
    if (this.skillUsed)
        return;

    this.skill.use(this.player);
    this.skillUsed = true;
};
module.exports = Hero;