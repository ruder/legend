var Events = require("../legend/event.js");
var Action = require("../legend/action.js");
var context=require("../legend/context.js");
var util = require("../util.js");

var Minion = function (name, race, attack, blood, card, player, effects) {
    this.player = player;
    if (this.player.battle)
        this.id = this.player.battle.guid();
    this.card = card;
    this.name = name;
    this.race = race;
    this.attack = attack;
    this.attack_base = attack;
    this.blood = blood;
    this.blood_max = blood;
    this.blood_base = blood;

    this.effects = effects;
    this.ready = false;
    this.siteLevel = 0;
    this.aegis = false;
    this.silent = false;
    this.dblfire = false;
    this.dblfire_mark = false;
    this.neverdie = false;
    this.freeze = false;
};

Minion.prototype.init = function () {
    if (this.freeze) {
        this.state_freeze(false);
        return;
    }
    this.state_ready(true);
    if (this.dblfire)
        this.dblfire_mark = true;

}

Minion.prototype.fire = function (target) {
    if (this.attack <= 0)
        return;
    if (!this.ready)
        return;


    this.attackTarget(target);
    this.player.battle.event({ name: Events.MINION_ATTACK, fromplayer: this.player, fromminion: this }, function () { });

    if (this.blood <= 0)
        return;

    if (this.dblfire_mark) {
        this.dblfire_mark = false;
    }
    else if (this.ready) {
        this.state_ready(false);
    }
};

Minion.prototype.attackTarget = function ( minion) {
    this.player.battle.addAction(Action.minion_attack(this.id,minion.id));

    minion.blood_cut(this.attack);

    if (!minion.ishero) {
        this.blood_cut(minion.attack);
    }

};

Minion.prototype.blood_add = function (count, andmax) {
    if (andmax)
        this.blood_max += count;

    if (count > this.blood_max - this.blood) {
        count = this.blood_max - this.blood;
    }
    this.blood += count;

    if (this.blood > this.blood_max)
        this.blood = this.blood_max;

    if (count <= 0)
        return;
    this.player.battle.addAction(Action.minion_cure(this.id, count, this.blood_max));
    this.player.battle.event({ name: Events.MINION_BLOOD_ADD, fromplayer: this.player, fromminion: this }, function () { });
};
Minion.prototype.blood_cut = function (count) {
    if (this.aegis) {
        this.state_aegis(false);
        return;
    }
    if (this.neverdie && count >= this.blood) {
        count = this.blood - 1;
    }
    this.blood -= count;
    this.player.battle.addAction(Action.minion_hurt(this.id, count));
    this.player.battle.event({ name: Events.MINION_BLOOD_CUT, fromplayer: this.player, fromminion: this }, function () { });
    if (this.blood <= 0) {
        this.remove();
    }
};
Minion.prototype.remove = function () {
    this.player.minion_remove(this);
};

Minion.prototype.attack_add = function (count) {
    if (count == 0)
        return;
    this.attack += count;
    this.player.battle.addAction(Action.attack_change(this.id, this.attack));
};
Minion.prototype.attack_cut = function (count) {
    if (count == 0)
        return;
    this.attack -= count;
    this.player.battle.addAction(Action.attack_change(this.id, this.attack));
};

Minion.prototype.backToPlayer = function () {
    //remove
    this.player.minion_remove(this);

    //get a card to player
    this.player.card_tohand(this.card);

};

Minion.prototype.event = function (obj, callback) {
    if (this.silent) {
        callback();
        return;
    }


    var nobj = {};
    for (var index in obj)
        nobj[index] = obj[index];
    nobj.minion = this;

    var opers = [];
    for (var i = 0; i < this.effects.length; i++) {
        opers.push({ t: this.effects[i], oper: this.effects[i].event });
    }

    util.orderExcute(opers, nobj, callback);
};
Minion.prototype.exist = function (effect) {
    for (var i = 0; i < this.effects.length; i++) {
        if (this.effects[i] == effect)
            return true;
    }
    return false;
};

Minion.prototype.silent = function () {
    this.state_silent();
}

Minion.prototype.json = function () {
    var obj = {
        imageid:this.card.imageid,
        id: this.id,
        index:this.index,
        name: this.name,
        attack: this.attack,
        blood: this.blood,
        states: []
    };
    if (this.sitelevel > 0)
        obj.states.push("嘲讽");
    if (this.sitelevel < 0)
        obj.states.push("潜行");
    if (!this.ready)
        obj.states.push("休息");
    if (this.aegis)
        obj.states.push("圣盾");
    if (this.silent)
        obj.states.push("沉默");
    if (this.dblfire)
        obj.states.push("风怒");

    //for (var i = 0; i < this.effects.length; i++) {
    //    var n = this.effects[i].name;
    //    if(n.length>2)
    //        obj.states.push(n);
    //}

    return obj;
}

Minion.prototype.state_ready = function (v) {
    if (this.ready == v)
        return;
    this.ready = v;

    if (v)
        this.player.battle.addAction(Action.minion_state_lost(this.id, ["休息"]));
    else
        this.player.battle.addAction(Action.minion_state_add(this.id, ["休息"]));

};
Minion.prototype.state_silent = function () {
    if (this.silent)
        return;
    this.silent = true;

    //攻击血量
    if (this.attack > this.attack_base)
        this.attack_cut(this.attack - this.attack_base);
    if (this.blood > this.blood_base)
        this.blood_cut(this.blood - this.blood_base);

    if (this.sitelevel != 0)
        this.state_sitelevel(0);
    if (this.aegis)
        this.state_aegis(false);
    if (this.dblfire)
        this.state_dblfire(false);
    if (this.freeze)
        this.state_freeze(false);


    for (var i = 0; i < this.effects.length; i++) {
        if(this.effects[i].silent)
            this.effects[i].silent(this);
    }

    this.player.battle.addAction(Action.minion_state_add(this.id, ["沉默"]));

};
Minion.prototype.state_sitelevel = function (v) {
    if (this.sitelevel == v)
        return;
    if (this.sitelevel > 0)
        this.player.battle.addAction(Action.minion_state_lost(this.id, ["嘲讽"]));
    else if (this.sitelevel < 0)
        this.player.battle.addAction(Action.minion_state_lost(this.id, ["潜行"]));

    if (v > 0)
        this.player.battle.addAction(Action.minion_state_add(this.id, ["嘲讽"]));
    else if (v < 0)
        this.player.battle.addAction(Action.minion_state_add(this.id, ["潜行"]));

    this.sitelevel = v;
};
Minion.prototype.state_aegis = function (v) {
    if (this.aegis == v)
        return;
    this.aegis = v;

    if (v)
        this.player.battle.addAction(Action.minion_state_add(this.id, ["圣盾"]));
    else
        this.player.battle.addAction(Action.minion_state_lost(this.id, ["圣盾"]));
};
Minion.prototype.state_dblfire = function (v) {
    if (this.dblfire == v)
        return;
    this.dblfire = v;
    this.dblfire_mark = v;

    if (v)
        this.player.battle.addAction(Action.minion_state_add(this.id, ["风怒"]));
    else
        this.player.battle.addAction(Action.minion_state_lost(this.id, ["风怒"]));
};
Minion.prototype.state_freeze = function (v) {
    if (this.freeze == v)
        return;
    this.freeze = v;

    if (v)
        this.player.battle.addAction(Action.minion_state_add(this.id, ["冻结"]));
    else
        this.player.battle.addAction(Action.minion_state_lost(this.id, ["冻结"]));
};

module.exports = Minion;