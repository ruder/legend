var Action = {};

Action.MINION_HURT=0;
Action.MINION_CURE=1;
Action.MINION_BORN=2;
Action.MINION_DIE=3;
Action.MINION_ATTACK=4;
Action.MINION_STATE_ADD=5;
Action.MINION_STATE_LOST=6;
Action.CARD_NEW=7;
Action.CARD_LOST=8;
Action.CARD_USE=9;
Action.HERO_GUARD_HURT=10;
Action.HERO_GUARD_CURE=11;
Action.HERO_DIE=12;
Action.HERO_ATTACK = 13;
Action.POWER_CHANGE = 14;
Action.ROUND_CHANGE = 15;
Action.WIN = 16;
Action.ATTACK_CHANGE = 17;
Action.CARD_COST_CHANGE = 18;
Action.WEAPON_ADD = 19;
Action.WEAPON_CHANGE = 20;
Action.WEAPON_REMOVE = 21;

Action.CARD_CHOOSE = 100;


Action.minion_hurt = function (id, count) {
    return {type:Action.MINION_HURT, id: id, count: count };
};
Action.minion_cure = function (id, count) {
    return {type:Action.MINION_CURE, id: id, count: count };
};
Action.minion_born = function (pid,minion) {
    return {type:Action.MINION_BORN,pid:pid, minion:minion };
};
Action.minion_die = function (id) {
    return {type:Action.MINION_DIE, id: id};
};
Action.minion_attack = function (id, tid) {
    return {type:Action.MINION_ATTACK, id: id,tid:tid };
};
Action.minion_state_add = function (id, s) {
    return {type:Action.MINION_STATE_ADD, id: id, s: s };
};
Action.minion_state_lost = function (id, s) {
    return {type:Action.MINION_STATE_LOST, id: id, s: s };
};
Action.card_new = function (pid, cid, cname) {
    return {type:Action.CARD_NEW, pid: pid,cid:cid, cname: cname };
};
Action.card_lost = function (pid, cid) {
    return {type:Action.CARD_LOST, pid: pid, cid: cid };
};
Action.card_use = function (pid, cid,cname,imageid) {
    return {type:Action.CARD_USE, pid: pid, cid: cid, cname: cname,imageid:imageid };
};
Action.hero_guard_hurt = function (id, count) {
    return {type:Action.HERO_GUARD_HURT, id: id, count: count };
};
Action.hero_guard_cure = function (id, count) {
    return {type:Action.HERO_GUARD_CURE, id: id, count: count };
};
Action.hero_die = function (id) {
    return {type:Action.HERO_DIE, id: id};
};
Action.hero_attack = function (id, tid) {
    return {type:Action.HERO_ATTACK, id: id,tid:tid};
};
Action.power_change = function (pid, power, maxpower) {
    power = power || 0;
    maxpower = maxpower || 0;
    return { type: Action.POWER_CHANGE, pid: pid, power: power, max: maxpower };
};
Action.round_change = function (pid) {
    return {type:Action.ROUND_CHANGE, pid: pid};
};
Action.win = function (pid) {
    return {type:Action.WIN, pid: pid};
};
Action.attack_change = function (id, count) {
    return {type:Action.ATTACK_CHANGE, id: id, count: count };
};
Action.card_cost_change = function (id, count) {
    return {type:Action.CARD_COST_CHANGE, id: id, count: count };
};
Action.weapon_add = function (pid,name, attack, blood) {
    return {type:Action.WEAPON_ADD, pid: pid,name:name, attack: attack,blood:blood };
};
Action.weapon_change = function (pid, attack, blood) {
    return {type:Action.WEAPON_CHANGE, pid: pid, attack: attack,blood:blood };
};
Action.weapon_remove = function (pid) {
    return { type: Action.WEAPON_REMOVE, pid: pid };
};
Action.card_choose = function (cardnames,count) {
    return { type: Action.CARD_CHOOSE, cs: cardnames, count: count };
};



module.exports = Action;
   