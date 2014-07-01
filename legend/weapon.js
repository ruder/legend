var Weapon = function (name, attack, blood, effects) {
    this.hero = null;
    this.name = name;
    this.attack = attack;
    this.blood = blood;
    this.effects = effects || [];
    this.cutAttack = false;
};

Weapon.prototype.attacked = function () {
    if (this.cutAttack)
        this.attack_cut(1);
    else
        this.blood_cut(1);
}

Weapon.prototype.blood_add = function (count, andmax) {
    this.blood += count;

    if (this.hero) {
        this.hero.weapon_change();
    }
};
Weapon.prototype.blood_cut = function (count) {
    this.blood -= count;
    if (this.hero) {
        this.hero.weapon_change();
    }
    if (this.blood <= 0) {
        this.remove();
    }
};
Weapon.prototype.remove = function () {
    if (this.hero)
        this.hero.weapon_remove();
};

Weapon.prototype.attack_add = function (count) {
    if (count == 0)
        return;
    this.attack += count;
    if (this.hero) {
        this.hero.weapon_change();
    }
};
Weapon.prototype.attack_cut = function (count) {
    if (count == 0)
        return;
    this.attack -= count;
    if (this.hero) {
        this.hero.weapon_change();
    }
    if (this.attack <= 0) {
        this.remove();
    }
};

module.exports = Weapon;