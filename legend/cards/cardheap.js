var cardb = require("../../legend/cards/cardsdb.js");
var MinionCard=require("../../legend/cards/minioncard.js");
var SecretCard=require("../../legend/cards/secretcard.js");
var Weaponcard=require("../../legend/cards/weaponcard.js");
var Charge = require("../../legend/effects/charge.js");
var AddBlood=require("../../legend/effects/addblood.js");
var AttackBuff = require("../../legend/effects/attackbuff.js");
var PickCard = require("../../legend/effects/pickcard.js");
var Taunt=require("../../legend/effects/taunt.js");
var Snake = require("../../legend/effects/snake.js");
var Aegis = require("../../legend/effects/aegis.js");
var HeroHurt=require("../../legend/effects/herohurt.js");
var MinionBack=require("../../legend/effects/minionback.js");
var Windfury = require("../../legend/effects/windfury.js");
var Magic = require("../../legend/effects/magic.js");
var ChooseMagic = require("../../legend/effects/choosemagic.js");
var OneRound = require("../../legend/effects/oneround.js");
var Meffect = require("../../legend/effects/meffect.js");
var BuffMeffect = require("../../legend/effects/buffmeffect.js");
var HeroHeap = require("../../legend/cards/heroheap.js");
var Events = require("../../legend/event.js");
var util = require("../../util.js");
var context=require("../../legend/context.js");

var seffects = {};
var CardHeap = {};
CardHeap.cards = [];
CardHeap.heros = HeroHeap;
CardHeap.find = function (name) {
     for (var i = 0; i < CardHeap.cards.length; i++) {
        var card = CardHeap.cards[i];
        if (card.name == name) {
            return util.clone(card);
        }
    }
    return null; 
};
CardHeap.createCard = function (c) {
    var card = undefined;
    var job = c.job == "" ? "中立" : c.job;
    var cost = parseInt(c.cost == "" ? "0" : c.cost);
    var attack = parseInt(c.attack == "" ? "0" : c.attack);
    var blood = parseInt(c.blood == "" ? "0" : c.blood);
    if (c.type == "随从")
        card = new MinionCard(c.name, job, c.rate, c.race, cost, attack, blood, []);
    else if (c.type == "技能")
        card = new SecretCard(c.name, job, c.rate, cost, []);
    else if (c.type == "武器")
        card = new Weaponcard(c.name, job, c.rate, cost, attack, blood, []);
    else
        return null;

    card.get = c.get;
    card.imageid = c.id;

    if (c.skill == "")
        return card;

    if (seffects[c.skill]) {
        card.effects = seffects[c.skill];
        return card;
    }
    return null;

};
//处理require循环引用
context.CardHeap = CardHeap;


var key = "对一个随从造成1点伤害，该随从获得+2攻击力。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.blood_cut(1+obj.add);
    obj.target.attack_add(2);
})];
key = "造成3点伤害，如果你拥有野兽，则改为造成5点伤害。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    var player = obj.player;
    var haspet = false;
    for (var i = 0; i < player.minions.length; i++) {
        var m = player.minions[i];
        if (m.race == "野兽") {
            haspet = true;
            break;
        }
    }
    var v = haspet ? 5 : 3;
    obj.target.blood_cut(v+obj.add);
})];
key = "造成5点伤害，抽1张牌。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    obj.target.blood_cut(5);
    obj.player.card_pick();
})];
key = "对所有敌方随从造成2点伤害。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    var minions = obj.player.enemy.minions;
    for (var i = 0; i < minions.length;i++ )        
        minions[i].blood_cut(2);
})];
key = "消灭一个随从，你的对手抽两张牌。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.remove();
    for (var i = 0; i < 2;i++ )
        obj.player.enemy.card_pick();
})];
key = "将所有随从移回其拥有者的手牌。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    var minions = obj.player.enemy.minions;
    for (var i = 0; i < minions.length; i++)
        minions[i].backToPlayer();
})];
key = "消灭一个攻击力小于或等于3的随从。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    if (obj.target.attack > 3)
        return;
    obj.target.remove();
})];
key = "造成10点伤害。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    obj.target.blood_cut(10+obj.add);
})];
key = "使一个随从的生命值翻倍。";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {    
    obj.target.blood_add(obj.target.blood,true);
})];
key = "随机复制你的对手手牌中的一张牌，将其置入你的手牌。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    var cards = obj.player.enemy.handCards;
    if (cards.length < 0)
        return;
    var card = util.random(cards);
    card = CardHeap.find(card.name);
    obj.player.card_tohand(card);
})];
key = "使一个随从获得+1/+1。";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {    
    obj.target.blood_add(1,true);
    obj.target.attack_add(1);
})];
key = "对所有敌人造成2点伤害。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    var minions = obj.player.enemy.minions;
    for (var i = 0; i < minions.length; i++)
        minions[i].blood_cut(2 + obj.add);
    obj.player.enemy.hero.blood_cut(2 + obj.add);
})];
key = "对所有角色造成3点伤害。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    var ms=[];
    util.add(ms,obj.player.minions);
    util.add(ms,obj.player.hero);
    util.add(ms,obj.player.enemy.minions);
    util.add(ms,obj.player.enemy.hero);
    util.each(ms,function(c){
       c.blood_cut(3+obj.add);
    });
})];
key = "对敌方英雄造成5点伤害。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    obj.player.enemy.hero.blood_cut(5 + obj.add);
})];
key = "对敌方英雄造成2点伤害。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    obj.player.enemy.hero.blood_cut(2 + obj.add);
})];
key = "使你的图腾获得+2生命值。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    var minions = obj.player.minions;
    for (var i = 0; i < minions.length;i++ )
        if(minions[i].race=="图腾")
            minions[i].blood_add(2,true);
})];
key = "对一个随从造成2点伤害，如果该随从是友方恶魔，则改为使其获得+2/+2。";
seffects[key] = [new Magic(key).one().setOper(function (obj) {
    var player = obj.player;
    if (obj.target.player == player && obj.target.race=="恶魔") {
        obj.target.blood_add(2, true);
        obj.target.attack_add(2);        
    }
    else {
        obj.target.blood_cut(2);
    }
})];
key = "在本回合中，你的随从的生命值无法被降到1点以下。抽一张牌。";
seffects[key] = [new OneRound(key).setOper(function (obj) {
    var ms = obj.player.minions;
    for (var i = 0; i < ms.length; i++) {
        ms[i].neverdie = true;
    }
})
.round_end(function(obj){
    var ms = obj.player.minions;
    for (var i = 0; i < ms.length; i++) {
        ms[i].neverdie = false;
    }
})];
key = "造成2点伤害。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    obj.target.blood_cut(2+obj.add);
})];
key = "直到你的下个回合，使所有友方随从获得潜行。";
seffects[key] = [new OneRound(key).setOper(function (obj) {
    var ms = obj.player.minions;
    for (var i = 0; i < ms.length; i++) {
        ms[i].state_sitelevel(-1);
    }
})
.round_begin(function (obj) {
    var ms = obj.player.minions;
    for (var i = 0; i < ms.length; i++) {
        ms[i].state_sitelevel(0);
    }
})];
key = "造成4点伤害；如果你的英雄的生命值小于或等于12点，则改为造成6点伤害。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    if(obj.player.hero.blood<=12){
        obj.target.blood_cut(6+obj.add);
    }
    else
        obj.target.blood_cut(4+obj.add);
})];
key = "为一个随从恢复所有生命值并使其获得嘲讽。";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {
    obj.target.blood_add(100);
    obj.target.state_sitelevel(1);
})];
key = "抽4张牌。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    for (var i = 0; i < 4; i++)
        obj.player.card_pick();
})];
key = "抽3张牌。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    for (var i = 0; i < 3; i++)
        obj.player.card_pick();
})];
key = "抽1张牌。（你最多可以拥有10点法力值。）";
seffects[key] = [new Magic(key).setOper(function (obj) {
        obj.player.card_pick();
})];
key = "战吼：消灭一个具有嘲讽的随从。";
seffects[key] = [new Meffect(key).created(function (obj) {
    var objs = [];
    var ms = obj.player.minions;
    for (var i = 0; i < ms.length; i++) {
        if (ms[i].siteLevel > 0)
            objs.push(ms[i]);
    }
    if (objs.length <= 0) {
        ms = obj.player.enemy.minions;
        for (var i = 0; i < ms.length; i++) {
            if (ms[i].siteLevel > 0)
                objs.push(ms[i]);
        }
    }

    if (objs.length <= 0)
        return;
    var m =util.random(objs);
    m.remove();
})];
key = "战吼：使一个友方随从获得潜行。";
seffects[key] = [new Meffect(key).oneSelf().created(function (obj) {
    if (obj.target.ishero)
        return;

    obj.target.state_sitelevel(-1);
})];
key = "战吼：使相邻的随从获得+1/+1和嘲讽。";
seffects[key] = [new Meffect(key).oneSelf().created(function (obj) {
    if (obj.target.ishero)
        return;
    var ms = obj.player.minions;
    for (var i = 0; i < ms.length; i++) {
        if (ms[i] == obj.target) {
            if(i>0){
                ms[i-1].blood_add(1,true);
                ms[i-1].attack_add(1);
                ms[i-1].state_sitelevel(1);
            }
            if(i<ms.length-1){
                ms[i+1].blood_add(1,true);
                ms[i+1].attack_add(1);
                ms[i+1].state_sitelevel(1);
            }
            break;
        }
    }
})];
key = "战吼：随机从你的牌库中将一张海盗牌置入你的手牌。";
seffects[key] = [new Meffect(key).created(function (obj) {
    var cards = [];

    util.each(obj.player.cards, function (c) {
        if(c.race=="海盗")
            cards.push(c);
    });

    var card = util.random(cards);
    if (!card)
        return;

    util.remove(obj.player.cards, card);

    obj.player.card_tohand(card);

})];
key = "战吼：造成3点伤害。";
seffects[key] = [new Meffect(key).oneEnemy().created(function (obj) {
    obj.target.blood_cut(3+obj.add);
})];
key = "战吼：召唤一个1/1的鱼人斥候。";
seffects[key] = [new Meffect(key).created(function (obj) {
    var card = CardHeap.find("鱼人斥候");
    card.cost = 0;
    card.use(obj.player);
})];
key = "战吼：随机消灭一个攻击力小于或等于2的敌方随从。";
seffects[key] = [new Meffect(key).created(function (obj) {
    var ms = [];
    util.each(obj.player.enemy.minions, function (c) {
        if (c.attack <= 2)
            ms.push(c);
    });

    var m = util.random(ms);
    if (!m)
        return;
    m.remove();

})];
key = "战吼：造成3点伤害，随机分配于其他角色身上。";
seffects[key] = [new Meffect(key).created(function (obj) {
    var ms = [];
    util.each(obj.player.enemy.minions, function (c) {
        ms.push(c);
    });
    ms.push(obj.player.enemy.hero);
    util.each(obj.player.minions, function (c) {
        if (c != obj.minion)
            ms.push(c);
    });
    ms.push(obj.player.hero);

    util.each(3, function () {
        var m = util.random(ms);
        if(m)
            m.blood_cut(1);
    });

})];
key = "战吼：使一个英雄的剩余生命值成为15。";
seffects[key] = [new Meffect(key).one().created(function (obj) {
    if (obj.target.ishero) {
        obj.target = obj.target.player.hero;
    }

    if (obj.target.blood > 15) {
        obj.target.blood_cut(obj.target.blood - 15);
    }
    else{
        obj.target.blood_add(15-obj.target.blood);
    }


})];
key = "战吼：进行一次惊人的发明。";
seffects[key] = [new Meffect(key).created(function (obj) {
    var cns = ["变鸡器", "壮胆机器人3000型", "导航小鸡", "修理机器人"];
    var cname = util.random(cns);
    var card = CardHeap.find(cname);
    if (!card)
        return;
    card.cost = 0;
    card.use(obj.player);

})];
key = "在本回合中，使一个友方角色获得+3攻击力。";
seffects[key] = [new OneRound(key).oneSelf().setOper(function (obj) {
    obj.target.attack_add(3);
})
.round_end(function (obj) {
    obj.target.attack_cut(3);
})];
key = "消灭一个敌方随从。";
seffects[key] = [new Magic(key).setOper(function (obj) {

    var m = util.random(obj.player.enemy.minions);
    if (!m)
        return;

    m.remove();

})];
key = "造成4点伤害，随机弃一张牌。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {

    obj.target.blood_cut(4 + obj.add);
    var card = util.random(obj.player.handCards);
    if (!card)
        return;
    obj.player.card_trash(card);

})];
key = "对所有敌方随从造成1点伤害。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    util.each(obj.player.enemy.minions, function (m) {
        m.blood_cut(1 + obj.add);
    });
})];
key = "对所有敌方随从造成1点伤害，抽一张牌。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    util.each(obj.player.enemy.minions, function (m) {
        m.blood_cut(1 + obj.add);
    });
    obj.player.card_pick();
})];
key = "对所有敌方随从造成2到3点伤害，过载：（2）";
seffects[key] = [new Magic(key).setOper(function (obj) {

    obj.player.overload_add(2);

    var hurts = [2, 3];

    util.each(obj.player.enemy.minions, function (m) {
        var value = util.random(hurts);
        m.blood_cut(value + obj.add);
    });

})];
key = "对所有敌方随从造成2点伤害，并使其冻结。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    util.each(obj.player.enemy.minions, function (m) {
        m.blood_cut(2 + obj.add);
        m.state_freeze(true);
    });
})];
key = "对所有敌方随从造成4点伤害。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    util.each(obj.player.enemy.minions, function (m) {
        m.blood_cut(4 + obj.add);
    });
})];
key = "在本回合中，获得一个法力水晶。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    obj.player.power_add(1);
})];
key = "造成3点伤害，过载：（1）";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {

    obj.target.blood_cut(3 + obj.add);
    obj.player.overload_add(1);

})];
key = "对2个随机敌方随从造成2点伤害，过载：（2）";
seffects[key] = [new Magic(key).setOper(function (obj) {

    obj.player.overload_add(2);

    var ms = [];
    util.each(obj.player.enemy.minions, function (c) {
        ms.push(c);
    });
    var m = util.random(ms);
    if (!m)
        return;
    m.blood_cut(2 + obj.add);

    util.remove(ms, m);
   
    m = util.random(ms);
    if (!m)
        return;
    m.blood_cut(2 + obj.add);

})];
key = "对2个随机敌方随从造成2点伤害。";
seffects[key] = [new Magic(key).setOper(function (obj) {

    var ms = [];
    util.each(obj.player.enemy.minions, function (c) {
        ms.push(c);
    });
    var m = util.random(ms);
    if (!m)
        return;
    m.blood_cut(2 + obj.add);

    util.remove(ms, m);
   
    m = util.random(ms);
    if (!m)
        return;
    m.blood_cut(2 + obj.add);

})];
key = "激怒：+1攻击力并具有风怒";
seffects[key] = [new Meffect(key).bloodCut(function (obj) {
    var m = obj.minion;
    if (m[obj.effect.name])
        return;

    if (m.blood >= m.blood_max)
        return;

    m[obj.effect.name] = true;

    m.attack_add(1);
    m.state_dblfire(true);

})
.bloodAdd(function (obj) {
    var m = obj.minion;
    if (!m[obj.effect.name])
        return;

    if (m.blood < m.blood_max)
        return;

    m[obj.effect.name] = false;
    m.attack_cut(1);
    m.state_dblfire(false);
})];
key = "冲锋，激怒：+6攻击力";
seffects[key] = [new Charge(), new Meffect("激怒：+6攻击力").bloodCut(function (obj) {
    var m = obj.minion;
    if (m[obj.effect.name])
        return;

    if (m.blood >= m.blood_max)
        return;

    m[obj.effect.name] = true;

    m.attack_add(6);
})
.bloodAdd(function (obj) {
    var m = obj.minion;
    if (!m[obj.effect.name])
        return;

    if (m.blood < m.blood_max)
        return;

    m[obj.effect.name] = false;
    m.attack_cut(6);
})];
key = "激怒：+5攻击力。";
seffects[key] = [new Meffect(key).bloodCut(function (obj) {
    var m = obj.minion;
    if (m[obj.effect.name])
        return;

    if (m.blood >= m.blood_max)
        return;

    m[obj.effect.name] = true;

    m.attack_add(5);
})
.bloodAdd(function (obj) {
    var m = obj.minion;
    if (!m[obj.effect.name])
        return;

    if (m.blood < m.blood_max)
        return;

    m[obj.effect.name] = false;
    m.attack_cut(5);
})];
key = "激怒：+3攻击力。";
seffects[key] = [new Meffect(key).bloodCut(function (obj) {
    var m = obj.minion;
    if (m[obj.effect.name])
        return;

    if (m.blood >= m.blood_max)
        return;

    m[obj.effect.name] = true;

    m.attack_add(3);
})
.bloodAdd(function (obj) {
    var m = obj.minion;
    if (!m[obj.effect.name])
        return;

    if (m.blood < m.blood_max)
        return;

    m[obj.effect.name] = false;
    m.attack_cut(3);
})];
key = "嘲讽，激怒：+3攻击力。";
seffects[key] = [new Taunt(), new Meffect("激怒：+3攻击力。").bloodCut(function (obj) {
    var m = obj.minion;
    if (m[obj.effect.name])
        return;

    if (m.blood >= m.blood_max)
        return;

    m[obj.effect.name] = true;

    m.attack_add(3);
})
.bloodAdd(function (obj) {
    var m = obj.minion;
    if (!m[obj.effect.name])
        return;

    if (m.blood < m.blood_max)
        return;

    m[obj.effect.name] = false;
    m.attack_cut(3);
})];
key = "使一个随从移回其拥有者的手牌。";
seffects[key] = [new Meffect(key).created(function (obj) {
    var ms = [];
    util.each(obj.player.minions, function (c) {
        ms.push(c);
    });
    util.each(obj.player.enemy.minions, function (c) {
        ms.push(c);
    });

    var m = util.random(ms);
    if (!m)
        return;
    m.backToPlayer();
})];
key = "恢复8点生命值。";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {
    obj.target.blood_add(8);
})];
key = "恢复5点生命值。";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {
    obj.target.blood_add(5);
})];
key = "对一个敌人造成4点伤害，并对所有其他敌人造成1点伤害。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    var ms = [];
    ms.push(obj.player.enemy.hero);
    util.each(obj.player.enemy.minions, function (c) {
        ms.push(c);
    });
    util.each(ms, function (c) {
        if (c == obj.target) {
            c.blood_cut(4 + obj.add);
        }
        else {
            c.blood_cut(1 + obj.add);
        }
    });
})];
key = "仅在本回合中，获得2个法力水晶。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    obj.player.power_add(2);
})];
key = "消灭一个受过伤害的敌方随从。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    if (obj.target.blood >= obj.target.blood_max)
        return;
    if (obj.target.player == obj.player)
        return;

    obj.target.remove();
})];
key = "随机选择一个随从，消灭除了该随从外的所有其他随从。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    var ms = [];
    util.each(obj, player.enemy.minions, function (c) {
        ms.push(c);
    });
    util.each(obj, player.minions, function (c) {
        ms.push(c);
    });

    var m = util.random(ms);
    util.each(ms, function (c) {
        if (c != m)
            c.remove();
    });
})];
key = "+5生命值并具有嘲讽。";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.blood_add(5, true);
    obj.target.state_sitelevel(1);
})];
key = "+4生命值并具有嘲讽。";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.blood_add(4, true);
    obj.target.state_sitelevel(1);
})];
key = "+2生命值并具有嘲讽。";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.blood_add(2, true);
    obj.target.state_sitelevel(1);
})];
key = "+5攻击力。";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.attack_add(5);
})];
key = "+4攻击力。";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.attack_add(4);
})];
key = "风怒，冲锋，圣盾，嘲讽";
seffects[key] = [new Charge(),new Taunt(),new Windfury(), new Aegis()];
key = "冲锋，圣盾。";
seffects[key] = [new Charge(),new Aegis()];
key = "嘲讽";
seffects[key] = [new Taunt()];
key = "冲锋";
seffects[key] = [new Charge()];
key = "风怒";
seffects[key] = [new Windfury()];
key = "潜行";
seffects[key] = [new Snake()];
key = "圣盾";
seffects[key] = [new Aegis()];
key = "嘲讽，过载：（3）";
seffects[key] = [new Taunt(),new Magic("过载：（3）").oneEnemy().setOper(function (obj) {
    obj.player.overload_add(3);
})];
key = "战吼：消灭该随从两侧的随从，并获得他们的攻击力和生命值。";
seffects[key] = [new Meffect(key).created(function (obj) {
    var ms = obj.player.minions;
    for (var i = 0; i < ms.length; i++) {
        if (ms[i] == obj.target) {
            var attack = 0;
            var blood = 0;
            if (i < ms.length - 1) {
                attack += ms[i + 1].attack;
                blood += ms[i + 1].blood;
                ms[i + 1].remove();
            }
            if (i > 0) {
                attack += ms[i - 1].attack;
                blood += ms[i - 1].blood;
                ms[i - 1].remove();
            }

            ms[i].blood_add(blood, true);
            ms[i].attack_add(attack);
            break;
        }
    }
})];
key = "战吼：使你的对手获得2个香蕉。";
seffects[key] = [new Meffect(key).created(function (obj) {
    var p = obj.player.enemy;
    var c = CardHeap.find("香蕉");
    if (c)
        p.card_tohand(c);
    c = CardHeap.find("香蕉");
    if (c)
        p.card_tohand(c);

})];
key = "战吼：获得一个攻击力小于或等于2的敌方随从的控制权。";
seffects[key] = [new Meffect(key).oneEnemy().created(function (obj) {
    if (obj.target.ishero)
        return;
    if (obj.target.attack > 2)
        return;

    var m = obj.target;
    m.remove();

    obj.player.minion_add(m);
})];
key = "战吼：对你的英雄造成2点伤害。";
seffects[key] = [new Meffect(key).created(function (obj) {
    obj.player.hero.blood_cut(2);   
})];
key = "战吼：对敌方英雄造成3点伤害。";
seffects[key] = [new Meffect(key).created(function (obj) {
    obj.player.enemy.hero.blood_cut(3);   
})];
key = "战吼：对你的英雄造成5点伤害。";
seffects[key] = [new Meffect(key).created(function (obj) {
    obj.player.hero.blood_cut(5);   
})];
key = "战吼：对自身造成4点伤害。";
seffects[key] = [new Meffect(key).created(function (obj) {
    obj.minion.blood_cut(4);   
})];
key = "战吼：消灭所有其他随从，并弃掉你的手牌。";
seffects[key] = [new Meffect(key).created(function (obj) {
    util.each(obj.player.minions, function (c) {
        c.remove();
    });
    util.each(obj.player.enemy.minions, function (c) {
        c.remove();
    });

    var cards = [];
    util.each(obj.player.handCards, function (c) {
        cards.push(c);
    });
    util.each(cards,function (c) {
        util.remove(obj.player.handCards, c);
        obj.player.card_trash(c);
    });
})];
key = "战吼：使一个友方随从从战场上移回你的手牌。";
seffects[key] = [new Meffect(key).oneSelf().created(function (obj) {
    if (obj.target.ishero)
        return;

    obj.target.backToPlayer();
})];
key = "亡语：召唤两个2/2的土狼。";
seffects[key] = [new Meffect(key).distory(function (obj) {

    var card = CardHeap.find("土狼");
    if (!card)
        return;
    card.cost = 0;
    card.use(obj.player);

    card = CardHeap.find("土狼");
    if (!card)
        return;
    card.cost = 0;
    card.use(obj.player)
})];
key = "亡语：控制一个随机敌方随从。";
seffects[key] = [new Meffect(key).distory(function (obj) {
    var m = util.random(obj.player.enemy.minions);
    if (!m)
        return;

    m.remove();
    obj.player.minion_add(m);
})];
key = "亡语：召唤一个2/1的损坏的傀儡。";
seffects[key] = [new Meffect(key).distory(function (obj) {

    var card = CardHeap.find("损坏的傀儡");
    if (!card)
        return;
    card.cost = 0;
    card.use(obj.player);

})];
key = "亡语：抽一张牌。";
seffects[key] = [new Meffect(key).distory(function (obj) {
    obj.player.card_pick();
})];
key = "法术伤害+1，亡语：抽一张牌。";
seffects[key] = [new Meffect(key).created(function (obj) {
    obj.player.magic_add(1);
})
.distory(function (obj) {
    obj.player.magic_add(-1);
    obj.player.card_pick();
})];
key = "法术伤害+1，亡语：抽一张牌。";
seffects[key] = [new Meffect(key).created(function (obj) {
    obj.player.magic_add(1);
    obj.player.card_pick();
})
.distory(function (obj) {
    obj.player.magic_add(-1);    
})];
key = "法术伤害+1";
seffects[key] = [new Meffect(key).created(function (obj) {
    obj.player.magic_add(1);
})
.distory(function (obj) {
    obj.player.magic_add(-1);    
})];
key = "法术伤害+5";
seffects[key] = [new Meffect(key).created(function (obj) {
    obj.player.magic_add(5);
})
.distory(function (obj) {
    obj.player.magic_add(-5);    
})];
key = "亡语：召唤一个4/5的贝恩•血蹄。";
seffects[key] = [new Meffect(key).distory(function (obj) {

    var card = CardHeap.find("贝恩•血蹄");
    if (!card)
        return;
    card.cost = 0;
    card.use(obj.player);

})];
key = "嘲讽，亡语：对所有角色造成2点伤害。";
seffects[key] = [new Taunt(), new Meffect("亡语：对所有角色造成2点伤害。").distory(function (obj) {
    var ms = [];
    ms.push(obj.player.hero);
    ms.push(obj.player.enemy.hero);
    util.each(obj.player.minions, function (c) {
        ms.push(c);
    });
    util.each(obj.player.enemy.minions, function (c) {
        ms.push(c);
    });
    util.each(ms, function (c) {
        c.blood_cut(2);
    });
})];
key = "圣盾，嘲讽，亡语：装备一把5/3的灰烬使者。";
seffects[key] = [new Aegis(),new Taunt(), new Meffect("亡语：装备一把5/3的灰烬使者。").distory(function (obj) {
    var card = CardHeap.find("灰烬使者");
    if (!card)
        return;
    card.cost = 0;
    card.use(obj.player);
})];
key = "亡语：对敌方英雄造成2点伤害。";
seffects[key] = [new Meffect(key).distory(function (obj) {
    obj.player.enemy.hero.blood_cut(2);
})];
key = "亡语：为你的对手召唤1个3/3的芬克•恩霍尔。";
seffects[key] = [new Meffect(key).distory(function (obj) {

    var card = CardHeap.find("芬克•恩霍尔");
    if (!card)
        return;
    card.cost = 0;
    card.use(obj.player.enemy);

})];
key = "将所有随从的生命值变为1。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    util.each(obj.player.minions, function (c) {
        c.blood_cut(c.blood - 1);
    });
    util.each(obj.player.enemy.minions, function (c) {
        c.blood_cut(c.blood - 1);
    });
})];
key = "恢复#6点生命值，抽3张牌。";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {
    obj.target.blood_add(6);
})];
key = "恢复#8点生命值，抽3张牌。";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {
    obj.target.blood_add(8);
    util.each(3, function () {
        obj.player.card_pick();
    });
})];
key = "恢复#8点生命值。";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {
    obj.target.blood_add(8);
})];
key = "每有一个受到伤害的友方角色，便抽一张牌。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    var ms = [];
    util.each(obj.player.minions, function (c) {
        ms.push(c);
    });
    ms.push(obj.player.hero);
    util.each(ms, function (c) {
        if (c.blood < c.blood_max)
            obj.player.card_pick();
    });
})];
key = "随机对敌人发射5枚飞弹，每枚飞弹造成1点伤害。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    var ms = [];
    util.each(obj.player.enemy.minions, function (c) {
        ms.push(c);
    });
    ms.push(obj.player.enemy.hero);

    var time = 5 + obj.add;
    util.each(time, function () {
        var o = util.random(ms);
        if (o) {
            o.blood_cut(1);
        }
    });
})];
key = "对所有随从造成1点伤害。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    var ms = [];
    util.each(obj.player.enemy.minions, function (c) {
        ms.push(c);
    });
    util.each(obj.player.minions, function (c) {
        ms.push(c);
    });
    util.each(ms, function (c) {
        c.blood_cut(1 + obj.add);
    });
})];
key = "造成8点伤害，随机分配给敌方角色。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    var ms = [];
    util.each(obj.player.enemy.minions, function (c) {
        ms.push(c);
    });
    ms.push(obj.player.enemy.hero);

    var maxhurt = 8 + obj.add;
    var h = 0;
    var hurts = [1, 2, 3, 4, 5, 6, 7, 8];
    while (h < maxhurt) {
        var ht = util.random(hurts);
        h += ht;
        var m = util.random(ms);
        if (m) {
            m.blood_cut(ht);
        }
    };

})];
key = "对一个随从造成1点伤害，抽一张牌。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.blood_cut(1 + obj.add);
    obj.player.card_pick();
})];
key = "对一个随从造成1点伤害，如果死亡缠绕将其杀死，抽一张牌。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.blood_cut(1 + obj.add);
    if(obj.target.blood<=0)
        obj.player.card_pick();
})];
key = "对一个随从造成2点伤害，如果它依然存活，则抽一张牌。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.blood_cut(2 + obj.add);
    if(obj.target.blood>0)
        obj.player.card_pick();
})];
key = "对一个随从造成3点伤害。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.blood_cut(3+obj.add);     
})];
key = "对一个随从造成4点伤害。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.blood_cut(4+obj.add);     
})];
key = "对一个随从造成5点伤害。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.blood_cut(5+obj.add);     
})];
key = "对一个随从造成5点伤害，并对其相邻的随从造成2点伤害。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    var bt = null;
    var at = null;
    var ms = obj.player.enemy.minions;
    util.each(ms, function (c, i) {
        if (c == obj.target) {
            if (i > 0)
                bt = ms[i - 1];
            if (i < ms.length - 1)
                at = ms[i + 1];
            return true;
        }
    });
    obj.target.blood_cut(5 + obj.add);

    if (bt)
        bt.blood_cut(2 + obj.add);
    if (at)
        at.blood_cut(2 + obj.add);

})];
key = "对一个随从造成等同于你的英雄攻击力的伤害。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.blood_cut(obj.player.hero.attack+obj.add);     
})];
key = "对一个未受伤害的随从造成2点伤害。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    if (obj.target.blood < obj.target.blood_max)
        return;
    obj.target.blood_cut(2 + obj.add);
})];
key = "战吼：恢复2点生命值。";
seffects[key] = [new Meffect(key).oneSelf().created(function (obj) {
    obj.target.blood_add(2);   
})];
key = "战吼：恢复3点生命值。";
seffects[key] = [new Meffect(key).oneSelf().created(function (obj) {
    obj.target.blood_add(3);   
})];
key = "战吼：所有随从失去圣盾。每有一个随从失去圣盾，便获得+3/+3。";
seffects[key] = [new Meffect(key).oneSelf().created(function (obj) {
    var ms = [];
    util.each(obj.player.enemy.minions, function (c) {
        ms.push(c);
    });
    util.each(obj.player.minions, function (c) {
        ms.push(c);
    });
    var count = 0;
    util.each(ms, function (c) {
        if (ms.aegis) {
            count++;
            c.state_aegis(false);
        }
    });
    if (count == 0)
        return;

    obj.minion.blood_add(3 * count, true);
    obj.minion.attack_add(3 * count);
})];
key = "战吼：冻结一个角色。";
seffects[key] = [new Meffect(key).oneEnemy().created(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.state_freeze(true);
})];
key = "战吼：使一个友方随从获得+1/+1。";
seffects[key] = [new Meffect(key).oneSelf().created(function (obj) {
    if (obj.target.ishero)
        return;
    var m = obj.target;
    m.blood_add(1, true);
    m.attack_add(1);
})];
key = "战吼：召唤一个1/1的野猪。";
seffects[key] = [new Meffect(key).created(function (obj) {
    var card = CardHeap.find("野猪");
    if (!card)
        return;
    card.cost = 0;
    card.use(obj.player);

})];
key = "战吼：使一个友方随从获得圣盾。";
seffects[key] = [new Meffect(key).oneSelf().created(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.state_aegis(true);
    
})];
key = "在本回合中，使一个友方随从获得冲锋。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.state_ready(true);     
})];
key = "将一个敌方随从移回其拥有者的手牌。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    if (obj.target.ishero)
        return;

    obj.target.backToPlayer();    
})];
key = "沉默所有敌方随从，抽一张牌。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    util.each(obj.player.enemy.minions, function (c) {
        c.state_silent();
    });
    obj.player.card_pick();
})];
key = "冻结所有敌方随从。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    util.each(obj.player.enemy.minions, function (c) {
        c.state_freeze(true);
    });
     
})];
key = "抽2张牌。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    obj.player.card_pick();
    obj.player.card_pick();
})];
key = "沉默一个随从。";
seffects[key] = [new Magic(key).one().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.state_silent();

})];
key = "沉默一个随从，然后对其造成1点伤害。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.state_silent();
    obj.target.blood_cut(1+obj.add);
})];
key = "你的其他随从获得+1攻击力。";
seffects[key] = [new AttackBuff(1)];
key = "在你的回合结束时，为所有友方随从恢复1点生命值。";
seffects[key] = [new Meffect(key).roundend(function (obj) {
    util.each(obj.player.minions, function (c) {
        c.blood_add(1);
    });
})];
key = "嘲讽，圣盾。";
seffects[key] = [new Taunt(),new Aegis()];
key = "对一个敌方角色造成1点伤害，并使其冻结。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    obj.target.blood_cut(1 + obj.add);
    if (obj.target.ishero)
        return;
    obj.target.state_freeze(true);

})];
key = "对一个角色造成3点伤害，并使其冻结。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    obj.target.blood_cut(3 + obj.add);
    if (obj.target.ishero)
        return;
    obj.target.state_freeze(true);

})];
key = "对一个角色造成2点伤害，如果末日灾祸杀死该角色，随机召唤一个恶魔。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    obj.target.blood_cut(3 + obj.add);

    if (obj.target.blood > 0)
        return;
    var cards = [];
    util.each(cardb, function (c) {
        if (c.race == "恶魔")
            cards.push(c.name);
    });

    var cname = util.random(cards);
    var card = CardHeap.find(cname);
    card.cost = 0;
    card.use(obj.player);
})];
key = "使一个随从获得+4/+4。（+4攻击力/+4生命值）";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {    
    if(obj.target.ishero)
        return ;
    obj.target.blood_add(4,true);
    obj.target.attack_add(4);
})];
key = "使一个随从获得嘲讽和+2/+2。（+2攻击力/+2生命值）";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.blood_add(2, true);
    obj.target.attack_add(2);
    obj.target.state_sitelevel(1);
})];
key = "使一个随从获得风怒。";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.state_dblfire(true);
})];
key = "使一个随从获得圣盾。";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.state_aegis(true);
})];
key = "使一个友方随从获得+1/+1。（+1攻击力/+1生命值）";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.blood_add(1,true);
    obj.target.attack_add(1);
})];
key = "使一个随从获得+3攻击力。";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.attack_add(3);
})];
key = "使一个随从获得+2生命值。抽一张牌。";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.blood_add(2,true);
    obj.player.card_pick();
})];
key = "使一个随从获得+2攻击力；连击：改为获得+4攻击力。";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    if(obj.player.isDoubleHit)
        obj.target.attack_add(4);
    else
        obj.target.attack_add(3);
})];
key = "使一个随从获得+5/+5，在你的下一个回合开始时，消灭该随从。";
seffects[key] = [new OneRound(key).oneSelf().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.blood_add(5, true);
    obj.target.attack_add(5);
})
.round_begin(function (obj) {
    obj.target.remove();
})];
key = "使一个随从的生命值变为1。";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    if (obj.target.blood <= 1)
        return;
    obj.target.blood_cut(obj.target.blood-1);
})];
key = "使一个随从的攻击力翻倍。";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.attack_add(obj.target.attack);
})];
key = "使一个随从的攻击力等同于其生命值。";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {
    var t = obj.target;
    if (!t.ishero)
        return;
    if (t.attack > t.blood)
        t.attack_cut(t.attack - t.blood);
    else
        t.attack_add(t.blood - t.attack);
})];
key = "使一个随从的攻击力变为1。";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {
    var t = obj.target;
    if (!t.ishero)
        return;
    if (t.attack == 1)
        return;
    if (t.attack > 1)
        t.attack_cut(t.attack - 1);
    else
        t.attack_add(1 - t.attack);
})];
key = "使一个受过伤害的随从获得+3/+3。";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    var t = obj.target;
    if (t.blood >= t.blood_max)
        return;
    t.blood_add(3, true);
    t.attack_add(3);
})];
key = "使一个随从变形成为1/1的绵羊。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    var t = obj.target;
    
    var card = CardHeap.find("绵羊");
    if (!card)
        return;
    t.remove();
    card.cost = 0;
    card.use(t.player, t.index);

})];
key = "使一个随从变形成为一个0/1并具有嘲讽的青蛙。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    var t = obj.target;
    
    var card = CardHeap.find("青蛙");
    if (!card)
        return;
    t.remove();
    card.cost = 0;
    card.use(t.player, t.index);
})];
key = "使一个角色冻结，如果它已经被冻结，则改为对其造成4点伤害。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    var t = obj.target;
    if (!t.freeze)
        t.state_freeze(true);
    else
        t.blood_cut(4);
})];
key = "使一个友方随从移回你的手牌，它的法力值消耗减少（2）点。";
seffects[key] = [new Magic(key).oneSelf().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    var t = obj.target;
    t.card.cost -= 2;
    if (t.card.cost < 0)
        t.card.cost = 0;

    t.backToPlayer();
})];
key = "随机复制对手的牌库中的一张随从牌，并将其置入战场。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    var cards = [];
    util.each(obj.player.enemy.handCards, function (c) {
        if (c.type == "随从")
            cards.push(c);
    });

    var card = util.random(cards);
    if (!card)
        return;

    card = CardHeap.find(card.name);
    card.cost = 0;
    card.use(obj.player);

})];
key = "随机消灭一个敌方随从。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    var m = util.random(obj.player.enemy.minions);
    if (!m)
        return;

    m.remove();

})];
key = "随机召唤一个野兽伙伴。";
seffects[key] = [new Magic(key).setOper(function (obj) {

    var cards = [];
    util.each(cardb, function (c) {
        if (c.race == "野兽")
            cards.push(c.name);
    });
    var cname = util.random(cards);
    var card = CardHeap.find(cname);
    card.cost = 0;
    card.use(obj.player);
})];
key = "为所有随从恢复#4点生命值。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    util.each(obj.player.minions, function (c) {
        c.blood_add(4);
    });
    util.each(obj.player.enemy.minions, function (c) {
        c.blood_add(4);
    });
})];
key = "造成1点伤害，抽一张牌。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    obj.target.blood_cut(1 + obj.add);
    obj.player.card_pick();
})];
key = "造成1点伤害。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    obj.target.blood_cut(1+obj.add);
})];
key = "造成2点伤害，为你的英雄恢复#2点生命值。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    obj.target.blood_cut(2 + obj.add);
    obj.player.hero.blood_add(2);
})];
key = "造成2点伤害；连击：改为造成4点伤害。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    if(obj.player.isDoubleHit())
        obj.target.blood_cut(4 + obj.add);
    else
        obj.target.blood_cut(2 + obj.add);
})];
key = "造成3点伤害，抽一张牌。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    obj.target.blood_cut(3 + obj.add);
    obj.player.card_pick();
})];
key = "造成3点伤害，随机分配给敌方角色。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    var ms = [];
    util.each(obj.player.enemy.minions, function (c) {
        ms.push(c);
    });
    ms.push(obj.player.enemy.hero);
    util.each(3, function () {
        var m = util.random(ms);
        if(m)
            m.blood_cut(1);
    });

})];
key = "造成4点伤害。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    obj.target.blood_cut(4+obj.add);
})];
key = "造成5点伤害，过载：（2）";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    obj.target.blood_cut(5 + obj.add);
    obj.player.overload_add(2);
})];
key = "造成5点伤害。为你的英雄恢复5点生命值。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    obj.target.blood_cut(5 + obj.add);
    obj.player.hero.blood_add(5);
})];
key = "造成6点伤害。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    obj.target.blood_cut(6+obj.add);
})];
key = "战吼：沉默一个随从。";
seffects[key] = [new Meffect(key).one().created(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.silent(2);
})];
key = "战吼：抽一张牌。";
seffects[key] = [new Meffect(key).created(function (obj) {
    obj.player.card_pick();
})];
key = "战吼：摧毁对手的武器，并抽数量等同于其耐久度的牌。";
seffects[key] = [new Meffect(key).created(function (obj) {
    obj.player.enemy.hero.weapon_remove();
    util.each(obj.player.enemy.hero.weapon.blood, function () {
        obj.player.card_pick();
    });
})];
key = "战吼：摧毁你的对手的武器。";
seffects[key] = [new Meffect(key).created(function (obj) {
    obj.player.enemy.hero.weapon_remove();
})];
key = "战吼：对所有其他角色造成1点伤害。";
seffects[key] = [new Meffect(key).created(function (obj) {
    var ms=[];
    util.add(ms,obj.player.minions);
    util.add(ms,obj.player.hero);
    util.add(ms,obj.player.enemy.minions);
    util.add(ms,obj.player.enemy.hero);
    util.each(ms,function(c){
        if(obj.minion!=c)
            c.blood_cut(1);
    });
})];
key = "战吼：对一个随从造成1点伤害，并使其获得+2攻击力。";
seffects[key] = [new Meffect(key).one().created(function (obj) {
    if (obj.target.ishero)
        return;
    obj.target.blood_cut(1);
    obj.target.attack_add(2);
})];
key = "战吼：获得等同于你的武器攻击力的攻击力";
seffects[key] = [new Meffect(key).created(function (obj) {
    if(obj.player.hero.weapon)
        obj.minion.attack_add(obj.player.hero.weapon.attack);
})];
key = "战吼：每个玩家抽2张牌。";
seffects[key] = [new Meffect(key).created(function (obj) {
    util.each(2, function () {
        obj.player.card_pick();
        obj.player.enemy.card_pick();
    });
})];
key = "战吼：你每有一张手牌，便获得+1生命值。";
seffects[key] = [new Meffect(key).created(function (obj) {
    var length = obj.player.handCards.length;
    if (length <= 0)
        return;
    obj.minion.blood_add(length, true);
})];
key = "战吼：扔香蕉。";
seffects[key] = [new Meffect(key).created(function (obj) {
    var card = CardHeap.find("香蕉");
    if (card)
        obj.player.enemy.card_tohand(card);
})];
key = "战吼：如果你的对手拥有4个或者更多随从，随机控制其中一个。";
seffects[key] = [new Meffect(key).created(function (obj) {
    if (obj.player.enemy.minions.length < 4)
        return;

    var m = util.random(obj.player.enemy.minions);
    m.remove();
    obj.player.minion_add(m);
})];
key = "战吼：使对手的武器失去1点耐久度。";
seffects[key] = [new Meffect(key).created(function (obj) {
    if (!obj.player.enemy.hero.weapon)
        return;
    obj.player.enemy.hero.weapon.blood_cut(1);
})];
key = "战吼：使邻近的随从获得嘲讽。";
seffects[key] = [new Meffect(key).created(function (obj) {
    var m = obj.minion;
    var ms = obj.player.minions;
    if (m.index > 0)
        ms[m.index - 1].state_sitelevel(1);
    if(m.index<ms.length-1)
        ms[m.index + 1].state_sitelevel(1);
})];
key = "战吼：使你的武器获得+1/+1。";
seffects[key] = [new Meffect(key).created(function (obj) {
    var w = obj.player.hero.weapon;
    if (!w)
        return;

    w.blood_add(1);
    w.attack_add(1);
})];
key = "战吼：使所有其他鱼人获得+2生命值。";
seffects[key] = [new Meffect(key).created(function (obj) {
    var ms = [];
    util.add(ms, obj.player.minions);
    util.add(ms, obj.player.enemy.minions);
    util.each(ms, function (c) {
        if (c.race == "鱼人")
            c.blood_add(2, true);
    });
})];
key = "战吼：使一个敌方随从的攻击力变为1。";
seffects[key] = [new Meffect(key).oneEnemy().created(function (obj) {
    var m = obj.target;
    if (m.ishero)
        return;

    if (m.attack == 1)
        return;
    if (m.attack > 1)
        m.attack_cut(m.attack - 1);
    else
        m.attack_add(1 - m.attack);
})];
key = "战吼：使一个随从的攻击力和生命值互换。";
seffects[key] = [new Meffect(key).one().created(function (obj) {
    var m = obj.target;
    if (m.ishero)
        return;

    var attack = m.blood;
    if (m.attack > attack)
        m.attack_cut(m.attack - attack);
    else if (m.attack < attack)
        m.attack_add(attack - m.attack);
    var blood = m.attack;
    if (m.blood > blood)
        m.blood_cut(m.blood - blood);
    else if (m.blood < blood)
        m.blood_add(blood - m.blood);
})];
key = "战吼：使一个随从获得+2攻击力。";
seffects[key] = [new Meffect(key).one().created(function (obj) {
    var m = obj.target;
    if (m.ishero)
        return;

    m.attack_add(2);
})];
key = "战吼：使一个随从随机变形成为一个5/5的恐龙或一个1/1的松鼠。";
seffects[key] = [new Meffect(key).one().created(function (obj) {
    var m = obj.target;
    if (m.ishero)
        return;
    var name = util.random(["魔暴龙", "松鼠"]);
    var card = CardHeap.find("name");
    if (!card)
        return;
    m.remove();
    card.cost = 0;
    card.use(m.player,m.index);
})];
key = "战吼：使一个友方随从获得+3生命值。";
seffects[key] = [new Meffect(key).oneSelf().created(function (obj) {
    var m = obj.target;
    if (m.ishero)
        return;

    m.blood_add(3,true);
})];
key = "战吼：使一个友方随从获得风怒。";
seffects[key] = [new Meffect(key).oneSelf().created(function (obj) {
    var m = obj.target;
    if (m.ishero)
        return;

    m.state_dblfire(true);
})];
key = "战吼：使一个友方野兽获得+2/+2并获得嘲讽。";
seffects[key] = [new Meffect(key).oneSelf().created(function (obj) {
    var m = obj.target;
    if (m.ishero)
        return;
    if (m.race != "野兽")
        return;

    m.blood_add(2, true);
    m.attack_add(2);
    m.state_sitelevel(1);
})];
key = "战吼：随机弃一张牌。";
seffects[key] = [new Meffect(key).oneSelf().created(function (obj) {
    var card = util.random(obj.player.handCards);
    if (!card)
        return;
    obj.player.card_trash(card);
})];
key = "战吼：为你的英雄恢复4点生命值。";
seffects[key] = [new Meffect(key).oneSelf().created(function (obj) {
    obj.player.hero.blood_add(4);
})];
key = "战吼：为你的英雄恢复6点生命值。";
seffects[key] = [new Meffect(key).oneSelf().created(function (obj) {
    obj.player.hero.blood_add(6);
})];
key = "战吼：为所有友方角色恢复2点生命值。";
seffects[key] = [new Meffect(key).created(function (obj) {
    var ms = [];
    util.add(ms, obj.player.minions);
    util.add(ms, obj.player.hero);
    util.each(ms, function (c) {
        c.blood_add(2);
    });
})];
key = "战吼：消灭一个攻击力大于或等于7的随从。";
seffects[key] = [new Meffect(key).oneEnemy().created(function (obj) {
    if (obj.target.ishero || obj.target.attack <= 7)
        return;
    obj.target.remove();
})];
key = "战吼：消灭一个鱼人，并获得+2/+2。";
seffects[key] = [new Meffect(key).oneEnemy().created(function (obj) {
    if (obj.target.ishero || obj.target.race != "鱼人")
        return;
    obj.target.blood_add(2, true);
    obj.target.attack_add(2);
})];
key = "战吼：选择一个随从，成为它的复制。";
seffects[key] = [new Meffect(key).one().created(function (obj) {
    if (obj.target.ishero)
        return;

    var card = CardHeap.find(obj.target.card.name);
    if (!card)
        return;

    card.cost = 0;
    card.use(obj.player);
})];
key = "战吼：造成1点伤害。";
seffects[key] = [new Meffect(key).oneEnemy().created(function (obj) {
    obj.target.blood_cut(1);
})];
key = "战吼：造成1点伤害。连击：改为造成2点伤害。";
seffects[key] = [new Meffect(key).oneEnemy().created(function (obj) {
    if(obj.player.isDoubleHit())
    obj.target.blood_cut(2);
    else
    obj.target.blood_cut(1);
})];
key = "战吼：造成2点伤害。";
seffects[key] = [new Meffect(key).oneEnemy().created(function (obj) {
    obj.target.blood_cut(2);
})];
key = "战吼：战场上每有1个其他友方随从，便获得+1/+1。";
seffects[key] = [new Meffect(key).created(function (obj) {
    var count = obj.player.minions.length;
    if (count <= 0)
        return;
    obj.minion.blood_add(count, true);
    obj.minion.attack_add(count);

})];
key = "战吼：召唤数个1/1的雏龙，直到你的随从数量达到上限。";
seffects[key] = [new Meffect(key).created(function (obj) {
    var count = 7 - obj.player.minions.length;
    if (count <= 0)
        return;
    util.each(count, function () {
        var card = CardHeap.find("雏龙");
        if (card) {
            card.cost = 0;
            card.use(obj.player);
        }
    });

})];
key = "战吼：召唤一个2/1的机械幼龙。";
seffects[key] = [new Meffect(key).created(function (obj) {
    var card = CardHeap.find("机械幼龙");
    card.cost = 0;
    card.use(obj.player);
})];
key = "战吼：召唤一个2/2的侍从。";
seffects[key] = [new Meffect(key).created(function (obj) {
    var card = CardHeap.find("侍从");
    card.cost = 0;
    card.use(obj.player);
})];
key = "在每个回合结束时，获得+1/+1。";
seffects[key] = [new Meffect(key).roundend(function (obj) {
    obj.minion.blood_add(1, true);
    obj.minion.attack_add(1);
})];
key = "在你的回合结束时，抽一张牌。";
seffects[key] = [new Meffect(key).roundend(function (obj) {
    obj.player.card_pick();
})];
key = "在你的回合结束时，对该随从造成1点伤害，并召唤一个1/1的小鬼。";
seffects[key] = [new Meffect(key).roundend(function (obj) {
    var t = obj.minion;
    t.blood_cut(1);
    if (t.blood > 0) {
        var c = CardHeap.find("小鬼");
        c.cost = 0;
        c.use(obj.player);
    }
})];
key = "在你的回合结束时，对所有其他角色造成2点伤害。";
seffects[key] = [new Meffect(key).roundend(function (obj) {
       var ms=[];
    util.add(ms,obj.player.minions);
    util.add(ms,obj.player.hero);
    util.add(ms,obj.player.enemy.minions);
    util.add(ms,obj.player.enemy.hero);
    util.each(ms,function(c){
        if(obj.minion!=c)
            c.blood_cut(2);
    });
})];
key = "在你的回合结束时，获得一张梦境牌。";
seffects[key] = [new Meffect(key).roundend(function (obj) {
    var cards = ["欢笑的姐妹", "伊瑟拉苏醒", "梦境", "噩梦","翡翠幼龙"];
    var c = util.random(cards);
    var card = CardHeap.find(c);
    obj.player.card_tohand(card);
})];
key = "在你的回合结束时，你有50%的几率抽一张牌。";
seffects[key] = [new Meffect(key).roundend(function (obj) {
    if (util.random([0, 1]) == 0)
        return;
    obj.player.card_pick();
})];
key = "在你的回合结束时，使另一个随机友方随从获得+1生命值。";
seffects[key] = [new Meffect(key).roundend(function (obj) {
    var ms = [];
    util.each(obj.player.minions, function (c) {
        if (c != obj.minion)
            ms.push(c);
    });

    var m = util.random(ms);
    if (!m)
        return;
    m.blood_add(1, true);
})];
key = "在你的回合结束时，使一个随机随从获得+1/+1。";
seffects[key] = [new Meffect(key).roundend(function (obj) {
    var ms = [];
    util.add(ms, obj.player.minions);
    util.add(ms, obj.player.enemy.minions);

    var m = util.random(ms);
    if (!m)
        return;
    m.blood_add(1, true);
    m.attack_add(1);
})];
key = "在你的回合结束时，随机使另一个友方随从获得+1攻击力。";
seffects[key] = [new Meffect(key).roundend(function (obj) {
    var ms = [];
    util.each(obj.player.minions, function (c) {
        if (c != obj.minion)
            ms.push(c);
    });

    var m = util.random(ms);
    if (!m)
        return;
    m.attack_add(1);
})];
key = "在你的回合结束时，为一个受到伤害的角色恢复6点生命值。";
seffects[key] = [new Meffect(key).roundend(function (obj) {
    var ms = [];
    util.each(obj.player.minions, function (c) {
        if (c.blood < c.blood_max)
            ms.push(c);
    });
    util.each(obj.player.enemy.minions, function (c) {
        if (c.blood < c.blood_max)
            ms.push(c);
    });
    var h = obj.player.hero;
    if (h.blood < h.blood_max)
        ms.push(h);
    h = obj.player.enemy.hero;
    if (h.blood < h.blood_max)
        ms.push(h);


    var m = util.random(ms);
    if (!m)
        return;
    m.blood_add(6);
})];
key = "在你的回合结束时，召唤一个2/2并具有嘲讽的豺狼人。";
seffects[key] = [new Meffect(key).roundend(function (obj) {
    var card = CardHeap.find("豺狼");
    if (!card)
        return;
    card.cost = 0;
    card.use(obj.player);
})];
key = "在你的回合开始时，对1个随机敌人造成2点伤害。";
seffects[key] = [new Meffect(key).roundbegin(function (obj) {
    var ms = [];
    util.add(ms, obj.player.enemy.hero);
    util.add(ms, obj.player.enemy.minions);
    var m = util.random(ms);
    if (!m)
        return;
    m.blood_cut(2);
})];
key = "在你的回合开始时，随机将另一个随从变为1/1的小鸡。";
seffects[key] = [new Meffect(key).roundbegin(function (obj) {
    var ms = [];

    util.add(ms, obj.player.enemy.minions);
    util.each(obj.player.minions, function (c) {
        if (c != obj.minion)
            ms.push(c);
    });
    var m = util.random(ms);
    if (!m)
        return;

    var card = CardHeap.find("小鸡");
    if (!card)
        return;
    m.remove();
    card.cost = 0;
    card.use(obj.player, m.index);
})];
key = "在你的回合开始时，随机将你的手牌中的一张随从牌与该随从交换。";
seffects[key] = [new Meffect(key).roundbegin(function (obj) {
    var cards = [];
    util.each(obj.player.handCards, function (c) {
        if (c.type=="随从")
            ms.push(c);
    });
    var card = util.random(cards);
    if (!card)
        return;
    m.remove();
    card.cost = 0;
    card.use(obj.player, m.index);
})];
key = "在你的回合开始时，随机为一个受到伤害的友方角色恢复3点生命值。";
seffects[key] = [new Meffect(key).roundbegin(function (obj) {
    var ms = [];
    util.each(obj.player.minions, function (c) {
        if (c.blood < c.blood_max)
            ms.push(c);
    });
    var h = obj.player.hero;
    if (h.blood < h.blood_max)
        ms.push(h);

    var m = util.random(ms);
    if (!m)
        return;
    m.blood_add(3);
})];
key = "在你的回合开始时，消灭该随从，并抽3张牌。";
seffects[key] = [new Meffect(key).roundbegin(function (obj) {
    obj.minion.remove();
    util.each(3, function () {
        obj.player.card_pick();
    });
})];
key = "在你的回合开始时，消灭所有随从。";
seffects[key] = [new Meffect(key).roundbegin(function (obj) {
    if (obj.fromplayer != obj.player)
        return;
    util.each(obj.player.minions, function (c) {
        c.remove();
    });
    util.each(obj.player.enemy.minions, function (c) {
        c.remove();
    });
})];
key = "召唤2个2/2并具有嘲讽的树人。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    util.each(2, function () {
        var card = CardHeap.find("嘲讽树人");
        if (card) {
            card.cost = 0;
            card.use(obj.player);
        }
    });

})];
key = "召唤2个2/3并具有嘲讽的幽灵狼。过载：（2）";
seffects[key] = [new Magic(key).setOper(function (obj) {
    obj.player.overload_add(2);
    util.each(2, function () {
        var card = CardHeap.find("幽灵狼");
        if (card) {
            card.cost = 0;
            card.use(obj.player);
        }
    });

})];
key = "召唤3个2/2并具有冲锋的树人，在回合结束时，消灭这些树人。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    util.each(3, function () {
        var card = CardHeap.find("冲锋树人");
        if (card) {
            card.cost = 0;
            card.use(obj.player);
        }
    });

})];
key = "召唤两个0/2，并具有嘲讽的随从。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    util.each(2, function () {
        var card = CardHeap.find("镜像");
        if (card) {
            card.cost = 0;
            card.use(obj.player);
        }
    });

})];
key = "召唤一个3/2的猎豹。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    var card = CardHeap.find("猎豹");
    if (card) {
        card.cost = 0;
        card.use(obj.player);
    }

})];
key = "获得一个敌方随从的控制权。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    if (obj.target.ishero)
        return;
    var m = obj.target;
    m.remove();
    obj.player.minion_add(m);
})];
key = "过载：（1）";
seffects[key] = [new Magic(key).setOper(function (obj) {
    obj.player.overload_add(1);
})];
key = "风怒，过载：（2）";
seffects[key] = [new Windfury(), new Magic("过载：（2）").setOper(function (obj) {
    obj.player.overload_add(2);
})];
key = "嘲讽，战吼：摧毁你的一个法力水晶。";
seffects[key] = [new Taunt(), new Meffect("战吼：摧毁你的一个法力水晶。").created(function (obj) {

    obj.player.power_max_cut(1);

})];
key = "冲锋，在回合结束时，消灭该随从。";
seffects[key] = [new Charge(), new Meffect("在回合结束时，消灭该随从。").roundend(function (obj) {
    obj.minion.remove();
})];
key = "冲锋，战吼：使你的对手获得一个法力水晶。";
seffects[key] = [new Charge(), new Meffect("战吼：使你的对手获得一个法力水晶。").created(function (obj) {
    obj.player.enemy.power_max_add(1);
})];
key = "获得2个法力水晶。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    obj.player.power_max_add(2);
})];
key = "获得一个空的法力水晶。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    obj.player.power_max_add(1);
    obj.player.power_cut(1);
})];
key = "每当你施放一个法术时，便获得+1攻击力。";
seffects[key] = [new Meffect(key).usercard(function (obj) {
    if (obj.fromplayer != obj.player || obj.fromcard.type != "技能")
        return;

    obj.minion.attack_add(1);
})];
key = "每当你施放一个法术时，抽一张牌。";
seffects[key] = [new Meffect(key).usercard(function (obj) {
    if (obj.fromplayer != obj.player || obj.fromcard.type != "技能")
        return;

    obj.player.card_pick();
})];
key = "每当你施放一个法术时，对所有随从造成1点伤害。";
seffects[key] = [new Meffect(key).usercard(function (obj) {
    if (obj.fromplayer != obj.player || obj.fromcard.type != "技能")
        return;

    var ms = [];
    util.add(ms, obj.player.minions);
    util.add(ms, obj.player.enemy.minions);
    util.each(ms, function (c) {
        c.blood_cut(1);
    });
})];
key = "每当你施放一个法术时，将一张“火球术”法术牌置入你的手牌。";
seffects[key] = [new Meffect(key).usercard(function (obj) {
    if (obj.fromplayer != obj.player || obj.fromcard.type != "技能")
        return;

    var card = CardHeap.find("火球术");
    if (card) {
        obj.player.card_tohand(card);
    }
})];
key = "每当你施放一个法术时，召唤一个1/1的紫罗兰学徒。";
seffects[key] = [new Meffect(key).usercard(function (obj) {
    if (obj.fromplayer != obj.player || obj.fromcard.type != "技能")
        return;

    var card = CardHeap.find("紫罗兰学徒");
    if (card) {
        card.cost = 0;
        card.use(obj.player);
    }
})];
key = "每当你使用一张具有过载的牌，便获得+1/+1。";
seffects[key] = [new Meffect(key).usercard(function (obj) {
    if (obj.fromplayer != obj.player)
        return;
    util.each(obj.fromcard.effects, function (e) {
        if (e.name.indexOf("过载：") >= 0) {
            obj.minion.blood_add(1, true);
            obj.minion.attack_add(1);
        }
    });

})];
key = "每当你使用一张牌时，便获得+1/+1。";
seffects[key] = [new Meffect(key).usercard(function (obj) {
    if (obj.fromplayer != obj.player)
        return;
  
    obj.minion.blood_add(1, true);
    obj.minion.attack_add(1);
  

})];
key = "每当你使用一张牌时，召唤一个2/1的埃辛诺斯烈焰。";
seffects[key] = [new Meffect(key).usercard(function (obj) {
    if (obj.fromplayer != obj.player)
        return;
  
    var card = CardHeap.find("埃辛诺斯烈焰");
    if (card) {
        card.cost = 0;
        card.use(obj.player);
    }
  

})];
key = "每当你召唤一个随从时，对一个随机敌方角色造成1点伤害。";
seffects[key] = [new Meffect(key).usercard(function (obj) {
    if (obj.fromplayer != obj.player || obj.fromcard.type != "随从")
        return;

    var ms = [];
    util.add(ms, obj.player.enemy.hero);
    util.add(ms, obj.player.enemy.minions);

    var m = util.random(ms);
    m.blood_cut(1);

})];
key = "每当你召唤一个野兽，抽一张牌。";
seffects[key] = [new Meffect(key).usercard(function (obj) {
    if (obj.fromplayer != obj.player || obj.fromcard.type != "随从" || obj.fromcard.race != "野兽")
        return;

    obj.player.card_pick();

})];
key = "冲锋，战吼：随机弃2张牌。";
seffects[key] = [new Charge(), new Meffect("战吼：随机弃2张牌。").created(function (obj) {
    var cards = obj.player.handCards;
    var card = util.random(cards);
    if (!card)
        return;
    obj.player.card_trash(card);

    card=util.random(cards);
    if (!card)
        return;
    obj.player.card_trash(card);
})];
key = "冲锋，战吼：为你的对手召唤2只1/1的雏龙。";
seffects[key] = [new Charge(), new Meffect("战吼：为你的对手召唤2只1/1的雏龙。").created(function (obj) {
    util.each(2, function () {
        var card = CardHeap.find("雏龙");
        if (card) {
            card.cost = 0;
            card.use(obj.player.enemy);
        }
    });
})];
key = "抽若干数量的牌，直到你的手牌数量等同于你的对手的手牌数量。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    var count = obj.player.handCards.length;
    count = obj.player.enemy.hadCards.length - count;
    if (count <= 0)
        return;
    util.each(count, function () {
        obj.player.card_pick();
    });

})];
key = "抽一张牌，并造成等同于其法力值消耗的伤害。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    var card = obj.player.card_pick();
    var cost = card.cost;
    if (cost <= 0)
        return;

    obj.target.blood_cut(cost);
})];
key = "抽一张牌，该牌的法力值消耗减少（3）点。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    var card = obj.player.card_pick();
    var cost = card.cost - 3;
    if (cost <= 0)
        cost = 3;

    card.cost_set(cost, obj.player);
})];
key = "从你的牌库中随机将2张恶魔牌置入你的手牌。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    var cards = [];

    util.each(obj.player.cards, function (c) {
        if (c.race == "恶魔")
            cards.push(c);
    });

    var card = util.random(cards);
    if (!card)
        return;
    util.remove(obj.player.cards, card);
    obj.player.card_tohand(card);

    util.remove(cards, card);
    card = util.random(cards);
    if (!card)
        return;
    util.remove(obj.player.cards, card);
    obj.player.card_tohand(card);

})];
key = "摧毁你的武器，对所有敌方角色造成等同于其攻击力的伤害。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    if (!obj.player.hero.weapon)
        return;

    var attack = obj.player.hero.weapon.attack;
    obj.player.hero.weapon_remove();

    if (attack <= 0)
        return;

    var ms = [];
    uitl.add(ms, obj.player.enemy.hero);
    util.add(ms, obj.player.enemy.minions);
    util.each(ms, function (c) {
        c.blood_cut(attack + obj.add);
    });
})];
key = "冻结一个随从和其相邻的随从，并对它们造成1点伤害。";
seffects[key] = [new Magic(key).oneEnemy().setOper(function (obj) {
    var t = obj.target;

    if (t.ishero)
        return;
    var ms = [];
    var minions = t.player.minions;
    ms.push(t);
    if (t.index > 0)
        ms.push(minions[t.index - 1]);
    if (t.index < minions.length - 1)
        ms.push(minions[t.index + 1])

    util.each(ms, function (c) {
        c.state_freeze(true);
        c.blood_cut(1);
    });

})];
key = "对除了伊瑟拉之外的所有角色造成5点伤害。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    var ms = [];
    util.add(ms, obj.player.minions);
    util.add(ms, obj.player.hero);
    util.add(ms, obj.player.enemy.minions);
    util.add(ms, obj.player.enemy.hero);

    util.each(ms, function (c) {
        if (c.name != "伊瑟拉")
            c.blood_cut(5 + obj.add);
    });

})];
key = "对两个随机敌方随从造成3点伤害。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    var ms = obj.player.enemy.minions;

    var minion = util.random(ms);
    if (!ms)
        return;

    minion.blood_cut(3 + obj.add);

    util.remove(ms, minion);

    var minion = util.random(ms);
    if (!ms)
        return;

    minion.blood_cut(3 + obj.add);

})];
key = "对所有敌方角色造成2点伤害，为所有友方角色恢复#2点生命值。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    var ms = [];
    util.add(ms, obj.player.minions);
    util.add(ms, obj.player.hero);
    util.each(ms, function (c) {
        c.blood_add(2);
    });

    ms = [];
    util.add(ms, obj.player.enemy.minions);
    util.add(ms, obj.player.enemy.hero);
    util.each(ms, function (c) {
        c.blood_cut(2+obj.add);
    });

})];
key = "复制对手的牌库中的2张牌，并将其置入你的手牌。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    var cards = obj.player.enemy.cards;
    var card = util.random(cards);
    if (!card)
        return;
    card = CardHeap.find(card.name);
    obj.player.card_tohand(card);

    card = util.random(cards);
    if (!card)
        return;
    card = CardHeap.find(card.name);
    obj.player.card_tohand(card);

})];
key = "该随从的攻击力等同于其生命值。";
seffects[key] = [new Meffect(key).bloodAdd(function (obj) {
    var dif = obj.minion.blood - obj.minion.attack;
    if (dif == 0)
        return;
    if (dif > 0)
        obj.minion.attack_add(dif);
    else
        obj.minion.attack_cut(dif);
})
.bloodCut(function (obj) {
    var dif = obj.minion.blood - obj.minion.attack;
    if (dif == 0)
        return;
    if (dif > 0)
        obj.minion.attack_add(dif);
    else
        obj.minion.attack_cut(dif);
})];
key = "激怒：你的武器获得+2攻击力。";
seffects[key] = [new Meffect(key).bloodCut(function (obj) {
    var m = obj.minion;
    if (m[obj.effect.name])
        return;

    if (m.blood >= m.blood_max)
        return;

    if (!obj.player.hero.weapon)
        return;

    m[obj.effect.name] = true;

    obj.player.hero.weapon.attack_add(2);

})
.bloodAdd(function (obj) {
    var m = obj.minion;
    if (!m[obj.effect.name])
        return;

    if (m.blood < m.blood_max)
        return;

    if (!obj.player.hero.weapon)
        return;

    m[obj.effect.name] = false;
    obj.player.hero.weapon.attack_cut(2);
})];
key = "每当一个随从获得治疗时，抽1张牌。";
seffects[key] = [new BuffMeffect(key).bloodAdd(function (obj) {
    obj.player.card_pick();
})];
key = "每当该随从受到伤害时，获得+3攻击力。";
seffects[key] = [new Meffect(key).bloodCut(function (obj) {
    obj.minion.attack_add(3);
})];
key = "在本回合中，使你的英雄获得+4攻击力。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    obj.player.hero.attack_add(4);
})];
key = "你的其他随从获得冲锋。";
seffects[key] = [new BuffMeffect(key).created(function (obj) {
    if (!obj.minion)
        return;
    if (obj.minion == obj.fromminion) {
        util.each(obj.player.minions, function (m) {
            if (m != obj.minion)
                m.state_ready(true);
        });
    }
    else if (obj.fromplayer == obj.player) {
        obj.fromminion.state_ready(true);
    }
})];
key = "使你的英雄获得2点护甲值，并在本回合中获得+2攻击力。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    obj.player.hero.attack_add(2);
    obj.player.hero.guard_add(2);
})];
key = "你的其他野兽获得+1攻击力。";
seffects[key] = [new BuffMeffect(key).created(function (obj) {
    if (!obj.minion)
        return;
    if (obj.minion == obj.fromminion) {
        util.each(obj.player.minions, function (m) {
            if (m != obj.minion && m.race == "野兽")
                m.attack_add(1);
        });
    }
    else if (obj.fromplayer == obj.player) {
        if (obj.fromminion.race == "野兽")
            obj.fromminion.attack_add(1);
    }
})
.distory(function (obj) {
    if (obj.minion == obj.fromminion) {
        util.each(obj.player.minions, function (m) {
            if (m != obj.minion && m.race == "野兽")
                m.attack_cut(1);
        });
    }
})
.whensilent(function (minion) {
    util.each(minion.player.minions, function (m) {
        if (m != minion && m.race == "野兽")
            m.attack_cut(1);
    });
})];
key = "你的其他随从获得+1/+1。";
seffects[key] = [new BuffMeffect(key).created(function (obj) {
    if (!obj.minion)
        return;
    if (obj.minion == obj.fromminion) {
        util.each(obj.player.minions, function (m) {
            if (m != obj.minion) {
                m.attack_add(1);
                m.blood_add(1, true);
            }
        });
    }
    else if (obj.fromplayer == obj.player) {

        obj.fromminion.attack_add(1);
        obj.fromminion.blood_add(1, true);
    }
})
.distory(function (obj) {
    if (obj.minion == obj.fromminion) {
        util.each(obj.player.minions, function (m) {
            if (m != obj.minion) {
                m.attack_cut(1);
                m.blood_cut(1);
            }

        });
    }
})
.whensilent(function (minion) {
    util.each(minion.player.minions, function (m) {
        if (m != minion) {
            m.attack_cut(1);
            m.blood_cut(1);
        }
    });
})];
key = "检视你的牌库顶的3张牌，将1张置入手牌，弃掉其余牌。";
seffects[key] = [new ChooseMagic(key).setOper(function (obj, cb) {
    var selectcards = [];
    var cards = obj.player.cards;
    if (cards.length <= 3)
        selectcards = cards;
    else {
        var tcs = [];
        util.each(cards, function (c) {
            tcs.push(c);
        });

        util.each(3, function () {
            var c = util.random(tcs);
            selectcards.push(c);
            util.remove(tcs, c);
        });
    }

    obj.player.control.chooseCards(selectcards, 1, function (cs) {
        util.each(cs, function (c) {
            util.remove(cards, c);
            obj.player.card_tohand(c);
        });
        cb();
    });
})];
key = "使你的武器获得+2攻击力。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    var w = obj.player.hero.weapon;
    if (w) {
        w.attack_add(2);
    }
})];
key = "对敌方英雄造成3点伤害。";
seffects[key] = [new Magic(key).setOper(function (obj) {
    obj.player.enemy.blood_cut(3 + obj.add);
})];
key = "恢复#6点生命值。";
seffects[key] = [new Magic(key).one().setOper(function (obj) {
    obj.target.blood_add(6);
})];




for (var i in cardb ){
    var c = cardb[i];
    var card = CardHeap.createCard(c);
    if (card)
        CardHeap.cards.push(card);
}

module.exports = CardHeap;
