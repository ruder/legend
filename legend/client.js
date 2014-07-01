var Battle=require("../legend/battle.js");
var Player = require("../legend/player.js");
var UserControl=require("../legend/usercontrol.js");
var cards=require("../legend/cards/cardheap.js").cards;
var heros=require("../legend/cards/cardheap.js").heros;
var BattleFactory = require("../legend/battleFactory.js");
var CardHeap=require("../legend/cards/cardheap.js");
var util=require("../util.js");

var client = {};

client.getCard = function (name, callback) {
    var card = CardHeap.find(name);

    if (card) {
        var c = {
            imageid:card.imageid,
            name: card.name,
            type:card.type,
            job: card.job,
            rate: card.rate,
            race: card.race || "",
            cost: card.cost,
            attack: card.attack || 0,
            blood: card.blood || 0,
            effects: []
        };
        for (var i = 0; i < card.effects.length; i++) {
            c.effects.push(card.effects[i].name);
            if (card.effects[i].needTarget) {
                c.needTarget = true;
            }
        }
        callback(null, c);
        return;
    }
    callback("无此卡牌！")
};

client.getBattle = function (req) {
    return BattleFactory.getUserBattle(req);
    //else if (req.session.key)
    //    key = req.session.key;
    //else {
    //    key = "t1" + (Math.floor(Math.random() * 1000));
    //    req.session.key = key;
    //}

    //var battle = BattleFactory.get(key);
    //if (!battle) {
    //    battle = BattleFactory.getp2();
    //    if (battle) {
    //        battle.key2 = key;
    //        BattleFactory.add(key, battle);
    //        return battle;
    //    }

    //    battle = client.createbattle();
    //    battle.key1 = key;
    //    BattleFactory.add(key, battle);
    //    battle.start(function (b) {
    //        setTimeout(function () {
    //            BattleFactory.remove(b.key1);
    //            BattleFactory.remove(b.key2);
    //        }, 5000);
    //    });
    //};
    //return battle;
};

client.createbattle = function () {
    var p1 = { cards: [] };
    var p2 = { cards: [] };
    var h1 = util.random(heros);
    var h2 = util.random(heros);

    //随机抽出30张牌
    var c1 = [];
    util.each(cards, function (c) {
        if (c.get &&( c.job == "" || c.job == h1.job)) {
            c1.push(c.name);
        }
    });
    util.each(30, function () {
        p1.cards.push(util.random(c1));
    });
    var c2 = [];
    util.each(cards, function (c) {
        if (c.get &&( c.job == "" || c.job == h2.job)) {
            c2.push(c.name);
        }
    });
    util.each(30, function () {
        p2.cards.push(util.random(c2));
    });


    var player1 = new Player(p1);
    var player2 = new Player(p2);
    h1.use(player1);
    h2.use(player2);

    player1.control = new UserControl(player1);
    player2.control = new UserControl(player2);

    var battle = new Battle(player1, player2);
    return battle;
}

client.getPlayer = function (battle, req) {
    var key = "";

    if (req.session.user)
        key = req.session.user.name;
    else if (req.session.key)
        key = req.session.key;

    if (battle.key1 == key)
        return battle.p1;

    return battle.p2;
}

client.next = function (callback, req) {

    var battle = client.getBattle(req);
    if (!battle) {
        callback(null, false);
        return;
    }
    var p = client.getPlayer(battle, req);
    p.control.next(function () {
        callback(null, true);
    });

};

client.surrender = function (callback, req) {
    var battle = client.getBattle(req);
    if (!battle) {
        callback(null, false);
        return;
    }
    var p = client.getPlayer(battle, req);
    p.control.surrender();
    callback(null, true);
};

client.setChoosedCards = function (card, callback, req) {
    var battle = client.getBattle(req);
    var p = client.getPlayer(battle, req);
    p.control.setChoosedCards([card]);
    callback(null, true);
};

client.userCard = function (cid, target, callback, req) {
    var battle = client.getBattle(req);
    var p = client.getPlayer(battle, req);
    if (battle.on != p) {
        callback("对方回合，不能操作");
        return;
    }
    var card = p.findHandCard(cid);
    if (!card) {
        callback("找不到此卡牌！");
        return;
    }
    if (p.power < card.cost) {
        callback("魔法不够！");
        return;
    }

    if (target) {
        var t = p.control.findTarget(target);
        if (t)
            p.control.setTarget(t);
    }

    p.control.userCard(card, function () {
        callback(null, true);
    });
};

client.userSkill = function (target, callback, req) {
    var battle = client.getBattle(req);
    var p = client.getPlayer(battle, req);
    if (battle.on != p) {
        callback("对方回合，不能操作");
        return;
    }
    if (target) {
        var t = p.control.findTarget(target);
        if (t)
            p.control.setTarget(t);
    }
    p.control.useSkill(function(){
        callback(null, true);
    });
};

client.attack = function (aid, did, callback, req) {
    var battle = client.getBattle(req);
    var p = client.getPlayer(battle, req);
    var ep = p.enemy;
    var attack = p.control.findTarget(aid);
    var defence = ep.control.findTarget(did);
    if (!attack) {
        callback("找不到攻击者！");
        return;
    }
    if (!defence) {
        callback("找不到防御者！");
        return;
    }
    if (attack.attack <= 0) {
        callback(null, false);
        return;
    }

    attack.fire(defence);
    callback(null, true);
};

client.connect = function (callback, req) {
    var battle = client.getBattle(req);
    if (!battle) {
        callback(null, false);
        return;
    }

    var p = client.getPlayer(battle, req);
    p.control.getActions(function (actions) {
        callback(null, actions);
    });
};

client.field = function (callback, req) {
    var battle = client.getBattle(req);
    if (!battle || battle.isEnd()) {
        callback(null, false);
        return;
    }


    var sp = client.getPlayer(battle, req);
    var enemy = sp.enemy;

    sp.control.clearActions();


    var d = {};
    if (battle.isEnd()) {
        d.end = true;
        d.win = battle.winer == sp;
        callback(null, d);
        return;
    }

    d.key = req.session.key;
    d.turn = sp == battle.on;
    d.player = {
        id: sp.hero.id,
        name: sp.name,
        blood: sp.hero.blood,
        guard: sp.hero.guard,
        attack: sp.hero.attack,
        power: sp.power,
        maxpower: sp.maxpower
    };
    d.player.handCards = [];
    for (var i = 0; i < sp.handCards.length; i++)
        d.player.handCards.push({ id: sp.handCards[i].id, name: sp.handCards[i].name });
    d.player.cardsCount = sp.cards.length;
    d.player.minions = [];
    for (var i = 0; i < sp.minions.length; i++) {
        d.player.minions.push(sp.minions[i].json());
    }
    if (sp.hero.weapon)
        d.player.weapon = { name: sp.hero.weapon.name, attack: sp.hero.weapon.attack, blood: sp.hero.weapon.blood };
    if (sp.hero.skill) {
        var skill = sp.hero.skill;
        d.player.skill = { name: skill.name, remark: skill.remark, cost: skill.cost, target: skill.needTarget };
    }


    d.enemy = {
        id: enemy.hero.id,
        name: enemy.name,
        blood: enemy.hero.blood,
        guard: enemy.hero.guard,
        attack: enemy.hero.attack,
        power: enemy.power,
        maxpower: enemy.maxpower
    };
    d.enemy.handCards = [];
    for (var i = 0; i < enemy.handCards.length; i++)
        d.enemy.handCards.push({ id: enemy.handCards[i].id });
    d.enemy.cardsCount = enemy.cards.length;
    d.enemy.minions = [];
    for (var i = 0; i < enemy.minions.length; i++) {
        d.enemy.minions.push(enemy.minions[i].json());
    }
    if (enemy.hero.weapon)
        d.enemy.weapon = { name: enemy.hero.weapon.name, attack: enemy.hero.weapon.attack, blood: enemy.hero.weapon.blood };
    if (enemy.hero.skill) {
        var skill = enemy.hero.skill;
        d.enemy.skill = { name: skill.name, remark: skill.remark, cost: skill.cost, target: skill.needTarget };
    }


    d.trashCards = [];
    for (var i = 0; i < battle.trashCards.length; i++)
        d.trashCards.push({imageid:battle.trashCards[i].imageid,name: battle.trashCards[i].name});

    callback(null, d);
};

module.exports = client;