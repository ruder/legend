var Events=require("../legend/event.js");

var Control = function (player) {
    this.player = player;
    
};

Control.TARGET_SCOPE_ALL="all";
Control.TARGET_SCOPE_SELF="self";
Control.TARGET_SCOPE_ANAMY="anamy";
Control.TARGET_SCOPE_ANAMY_ATTACK = "anamy_att";

 
Control.prototype.chooseTarget = function (scope, cb) {

    var ts = this.getTargetList(scope);

    cb(ts[0]);
};

Control.prototype.getTargetList = function (scope) {

    //TODO:
    if (scope == Control.TARGET_SCOPE_ANAMY_ATTACK) {
        var ms = this.player.enemy.minions;
        var maxLevel = 0;
        for (var i = 0; i < ms.length; i++) {
            if (maxLevel < ms[i].siteLevel) {
                maxLevel = ms[i].siteLevel;
            }
        }
        if (maxLevel == 0)
            return this.getTargetList(Control.TARGET_SCOPE_ANAMY);

        var res = [];
        for (var i = 0; i < ms.length; i++) {
            if (ms[i].siteLevel == maxLevel)
                res.push(ms[i]);
        }

        return res;
    }

    if (scope == Control.TARGET_SCOPE_ANAMY) {
        var ms = this.player.enemy.minions;

        var res = [];
        for (var i = 0; i < ms.length; i++) {
            if (ms[i].siteLevel >= 0)
                res.push(ms[i]);
        }
        res.push(this.player.enemy.hero);
        return res;
    }

    if (scope == Control.TARGET_SCOPE_SELF) {
        var ms = this.player.minions;

        var res = [];
        for (var i = 0; i < ms.length; i++) {
            res.push(ms[i]);
        }
        res.push(this.player.hero);
        return res;
    }

    if (scope == Control.TARGET_SCOPE_ALL) {

        var ms = this.player.minions;

        var res = [];
        for (var i = 0; i < ms.length; i++) {
            res.push(ms[i]);
        }
        res.push(this.player.hero);

        ms = this.player.enemy.minions;
        for (var i = 0; i < ms.length; i++) {
            res.push(ms[i]);
        }
        res.push(this.player.enemy.hero);

        return res;
    }

    return [];
};

Control.prototype.findTarget = function (gid) {
    var list = [];
    var battle = this.player.battle;
    list.push(battle.p1.hero);
    list.push(battle.p2.hero);
    for (var i = 0; i < battle.p1.minions.length; i++)
        list.push(battle.p1.minions[i]);
    for (var i = 0; i < battle.p2.minions.length; i++)
        list.push(battle.p2.minions[i]);

    for (var i = 0; i < list.length; i++) {
        if (list[i].id == gid)
            return list[i];
    }
    return null;
};

Control.prototype.onTurn = function (cb) {
    //console.log('Control.prototype.onTurn:' + cb);

    this.nextcb = cb;
    this.cardTimes = 0;
    this.autoUseCard();
    
    //var card = this.player.handCards.pop();
    //var me = this;
    //if (card) {
    //    this.userCard(card, function () {
    //        me.minionFire();
    //        cb();
    //    });
    //    return;
    //}

    //me.minionFire();
    //cb();
}

Control.prototype.autoUseCard = function () {
    var cs = this.player.handCards;
    var power = this.player.power;
    var card = null;
    for (var i = 0; i < cs.length; i++) {
        if (cs[i].cost < power) {
            card = cs[i];
            break;
        }
    }

    if (!card || this.cardTimes > 2) {
        this.minionFire();
        return;
    }

    this.cardTimes++;
    var me = this;
    //console.log("user card :"+card.name);
    this.userCard(card, function () {
        me.autoUseCard();
    });
};

Control.prototype.minionFire = function () {
    for (var i = 0; i < this.player.minions.length; i++) {

        var ts = this.getTargetList(Control.TARGET_SCOPE_ANAMY_ATTACK);
        //console.log("getTargetList:" + ts.length);
        if (ts.length > 0)
            this.player.minions[i].fire(ts[0]);
    }
    if(this.nextcb)
        this.nextcb();
};

Control.prototype.userCard = function (card, cb) {
    var me = this;
    //card.use(me.player);
    this.player.battle.event({ name: Events.CARD_USE, fromcard: card, fromplayer: this.player }, function () {
        //console.log("card use");
        me.player.card_use(card);
        //card.use(me.player);
        if (cb)
            cb();
    });

};

Control.prototype.useSkill = function (cb) {

    this.player.hero.useSkill();

    cb();
}

Control.prototype.win=function(){}

Control.prototype.addAction = function (action) {

};

Control.prototype.chooseCards = function (cards, count, cb) {
    var cs = [];
    for (var i = 0; i < count && i < cards.length; i++)
        cs.push(cards[i]);

    cb(cs);
};

module.exports = Control;
