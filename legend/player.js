var Minion = require("../legend/minion.js");
var Events=require("../legend/event.js");
var Control=require("../legend/control.js");
var Hero = require("../legend/hero.js");
var Action = require("../legend/action.js");
var util = require("../util.js");

var Player = function (p) {
    //this.hero = new Hero(this, p.hero.name, p.hero.blood);
    this.cards = p.cards;
    this.power = 0;
    this.maxpower = 0;
    this.handCards = [];
    this.trashCards = [];
    this.minions = [];
    this.effects = [];
    this.magic = 0;
    this.overload = 0;

    this.cardUserCountPerRound = 0;

    //this.name = p.hero.name;

    this.control = new Control(this);
};

Player.maxPower = 10;
Player.maxHandCardCount=10;
Player.maxMinionCount = 7;



Player.prototype.init = function (battle, enemy, isfirst) {
    this.battle = battle;
    this.enemy = enemy;
    this.hero.id = this.battle.guid();

    for (var i = 0; i < 3; i++)
        this.card_pick();


    if (!isfirst)
        this.card_pick();
}

Player.prototype.round = function () {
    this.battle.r++;
    if (this.battle.r > 100) {
        this.win();
        return;
    }
    this.battle.on = this;

    this.battle.addAction(Action.round_change(this.hero.id));
    //this.battle.log(this.name + " trun __blood:" + this.hero.blood);

    this.cardUserCountPerRound = 0;
    var me = this;

    var opers = [
        { t: this, oper: this.round_power },
        { t: this, oper: this.round_card_pick },
        { t: this, oper: this.round_begin },
        { t: this, oper: this.round_excute },
        { t: this, oper: this.round_end }
    ];

    util.orderExcute(opers, {}, function () {
        if (me.battle.isEnd())
            return;

        me.enemy.round();
    })
}
Player.prototype.round_power = function (obj, cb) {

    if (this.maxpower < Player.maxPower)
        this.maxpower++;

    //处理过载
    var value = this.maxpower - this.overload;
    this.overload = 0;
    if (value < 0)
        value = 0;

    this.power_set(value);
    this.battle.log(this.name + " init power");

    this.battle.event({ name: Events.ROUND_POWER, fromplayer: this }, cb);
};
Player.prototype.round_card_pick = function (obj, cb) {
    var card=this.card_pick();

    this.battle.event({ name: Events.ROUND_PICKCARD, fromplayer:this,fromcard:card },cb);
};
Player.prototype.round_begin = function (obj, cb) {
    this.battle.log(this.name + " excute begin events");

    for (var i = 0; i < this.minions.length; i++) {
        this.minions[i].init();
    }
    this.hero.init();

    this.battle.event({ name: Events.ROUND_BEGIN, fromplayer: this }, cb);
};
Player.prototype.round_end = function (obj, cb) {
    this.battle.log(this.name + " excute end events");

    if (this.hero.blood < 0) {
        this.enemy.win();
        return;
    }
    this.hero.roundend();

    this.battle.event({ name: Events.ROUND_END, fromplayer:this },cb);
};
Player.prototype.round_excute = function (obj, cb) {

    var me = this;
    this.control.onTurn(function () {
        if (me.enemy.hero.blood <= 0) {
            me.win();
            return;
        }

        cb();
    });


};

Player.prototype.card_pick = function () {

    if (this.cards.length <= 0) {
        return this.card_pick_trash();
    }

    var index = Math.floor(Math.random() * this.cards.length);
    var card = this.cards[index];
    this.cards.splice(index, 1);

    //this.battle.log(this.name + " pick a card(" + card.name + ")");

    if (this.handCards.length < Player.maxHandCardCount) {
        this.card_tohand(card);
    }
    else
        this.card_trash(card);

    return card;
};
Player.prototype.card_pick_trash = function () {
    if (this.picktrashtime == undefined)
        this.picktrashtime = 0;
    this.picktrashtime++;

    this.blood_cut(1);//this.picktrashtime);


    var index = Math.floor(Math.random() * this.trashCards.length);
    var card = this.trashCards[index];
    this.trashCards.splice(index, 1);


    if (this.handCards.length < Player.maxHandCardCount) {
       this.card_tohand(card);
    }
    return card;
};
Player.prototype.card_trash = function (card) {
    var ishandCard = false;
    util.each(this.handCards, function (c) {
        if (c == card)
            ishandCard = true;
    });

    if (ishandCard) {

        util.remove(this.handCards, card);
        this.cardUserCountPerRound++;
        this.trashCards.push(card);
        this.battle.trashCards.push(card);
        this.battle.addAction(Action.card_lost(this.hero.id, card.id));
    }
};
Player.prototype.card_use = function (card) {
    this.battle.addAction(Action.card_use(this.hero.id, card.id,card.name, card.imageid));
    card.use(this);
};
Player.prototype.card_tohand = function (card) {
    if (this.handCards.length >= Player.maxHandCardCount)
        return;
    if (!card.id)
        card.id = this.battle.guid();
    this.handCards.push(card);
    this.battle.addAction(Action.card_new(this.hero.id, card.id, card.name));
}
Player.prototype.findHandCard = function (cid) {
    for (var i = 0; i < this.handCards.length; i++) {
        var card = this.handCards[i];
        if (card.id == cid)
            return card;
    }
    return null;
};

Player.prototype.minion_add = function (minion, index) {
    if (this.minions.length >= Player.maxMinionCount)
        return;

    if (index) {
        this.minions.splice(index, 0, minion);
        minion.index = index;
    }
    else {
        minion.index = this.minions.length;
        this.minions.push(minion);
    }

    util.each(this.minions, function (c, i) {
        c.index = i;
    });

    this.battle.addAction(Action.minion_born(this.hero.id, minion.json()));
    this.battle.event({ name: Events.MINION_CREATE, fromplayer: this, fromminion: minion }, function () { });
};
Player.prototype.minion_remove = function (minion) {

   
    this.battle.event({ name: Events.MINION_DISTORY, fromplayer: this, fromminion: minion }, function () {

    });
     var me = this;
     util.remove(me.minions, minion);

    util.each(me.minions, function (c, i) {
        c.index = i;
    });

    this.battle.addAction(Action.minion_die(minion.id));
}

Player.prototype.power_add = function (count) {
    this.power += count;
    if (this.power > this.maxpower)
        this.power = this.maxpwer;
    this.battle.addAction(Action.power_change(this.hero.id, this.power, this.maxpower));
};
Player.prototype.power_cut = function (count) {
    this.power -= count;
    if (this.power < 0)
        this.power = 0;
    this.battle.addAction(Action.power_change(this.hero.id, this.power, this.maxpower));
};
Player.prototype.power_set = function (count) {
    this.power = count;
    this.battle.addAction(Action.power_change(this.hero.id,this.power,this.maxpower));
};
Player.prototype.power_max_add = function (count) {
    if (this.maxpower >= Player.maxPower)
        return;
    this.maxpower += count;
    if (this.maxpower > Player.maxPower)
        this.maxpower = Player.maxPower;
    this.power_add(count);
}
Player.prototype.power_max_cut = function (count) {
    if (this.maxpower <= 0)
        return;
    this.maxpower -= count;
    if (this.maxpower < 0)
        this.maxpower = 0;
    this.power_cut(count);
}


Player.prototype.blood_add = function (count) {
    this.hero.blood_add(count);
};
Player.prototype.blood_cut = function (count) {
    this.hero.blood_cut(count);   
};

Player.prototype.magic_add = function (count) {
    this.magic += count;
};
Player.prototype.magic_cut = function (count) {
    this.magic -= count;
};

Player.prototype.overload_add = function (count) {
    this.overload += count;
};

Player.prototype.effect_add = function (effect) {
    this.effects.push(effect);
};
Player.prototype.effect_remove = function (effect) {
    for (var i = 0; i < this.effects.length; i++) {
        var ef = this.effects[i];
        if (effect == ef) {
            this.effects.splice(i, 1);
            break;
        }
    }
};

Player.prototype.event = function (obj, callback) {
    obj.player = this;

    var opers = [];
    for (var i = 0; i < this.handCards.length; i++) {
        if (this.handCards[i].event) {
            opers.push({ t: this.handCards[i], oper: this.handCards[i].event });
        }
    }
    for (var i = 0; i < this.minions.length; i++) {
        opers.push({ t: this.minions[i], oper: this.minions[i].event });
    }
    for (var i = 0; i < this.effects.length; i++) {
        opers.push({ t: this.effects[i], oper: this.effects[i].event });
    }
    util.orderExcute(opers, obj, callback);
};
Player.prototype.win = function () {
    this.battle.log(this.name + " win");
    this.battle.addAction(Action.win(this.hero.id));
    this.battle.win(this);

};

Player.prototype.isDoubleHit = function () {
    return this.cardUserCountPerRound >= 1;
};

Player.prototype.setHero = function (hero) {
    this.name = hero.name;
    this.hero = hero;
};

module.exports = Player;