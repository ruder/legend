var util = require("../../util.js");
var Hero = require("../../legend/hero.js");
var Weapon = require("../../legend/weapon.js");
var Skill = require("../../legend/skill.js");

var HeroCard = function(id, name, job, race, blood, weapon, skill, imageid) {
    this.id = id;
    this.name = name;
    this.job = job;
    this.race = race;
    this.blood = blood;
    this.skill = skill;
    this.weapon = weapon;
    this.imageid = imageid || this.id;
};

HeroCard.prototype.use = function(player) {
    var hero = new Hero(player, this.name, this.blood, this.race,
	    this.weapon, this.skill, this.imageid);
    player.setHero(hero);
};

module.exports = HeroCard;