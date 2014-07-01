var Battle=require("../legend/battle.js");
var Player = require("../legend/player.js");
var UserControl=require("../legend/usercontrol.js");
var BattleFactory = require("../legend/battleFactory.js");
var cards=require("../legend/cards/cardheap.js").cards;
var heros=require("../legend/cards/cardheap.js").heros;
var CardHeap=require("../legend/cards/cardheap.js");
var util=require("../util.js");

var Paractice = {};
module.exports = Paractice;


Paractice.begin = function (job, enemyjob, callback, req) {
    var battle = BattleFactory.getUserBattle(req);
    if (battle) {
        callback("存在未结束的战局，请打完再开新局！");
        return;
    }

    var p1 = { cards: [] };
    var p2 = { cards: [] };
    var h1 = util.random(heros);
    var h2 = util.random(heros);
    util.each(heros, function (h) {
        if (h.job == job)
            h1 = h;
        if (h.job == enemyjob)
            h2 = h;
    });


    p1.cards = Paractice.getCards(h1.job);
    p2.cards = Paractice.getCards(h2.job);


    var player1 = new Player(p1);
    var player2 = new Player(p2);
    h1.use(player1);
    h2.use(player2);

    player1.control = new UserControl(player1);
    //player2.control = new UserControl(player2);

    var battle = new Battle(player1, player2);
    BattleFactory.setUserBattle(req, battle);


    callback(null, true);
};

Paractice.getCards = function (job) {
    var result = [];
    var bcards = heros.baseCards;
    var cs = bcards[job];
    if (!cs) {
        var c1 = [];
        util.each(cards, function (c) {
            if (c.get && (c.job == "" || c.job == h1.job)) {
                c1.push(c.name);
            }
        });
        util.each(30, function () {
            result.push(util.random(c1));
        });

    }
    else {
        util.each(cs, function (n) {
            result.push(n);
            result.push(n);
        });
    }

    return result;
};

Paractice.checkcards = function (callback, req) {
    var str = "";
    var bcards = heros.baseCards;
    for (var index in bcards) {
        var array = bcards[index];
        for (var i = 0; i < array.length; i++) {
            var cname = array[i];
            var c = CardHeap.find(cname);
            if (!c) {
                str += cname + ",";
            }
        }
    }
    callback(str);
};

var Fight = function () {
    this.keys = [];

    var me = this;
    this.times = setInterval(function () {
        var now = new Date();
        for (var i = me.keys.length - 1; i >= 0; i--) {
            var c = me.keys[i];
            if (now - c.date > 2 * 1000) {
                me.keys.splice(i, 1);
            };

        };

    }, 2000);
};


Fight.prototype.join = function (job, callback, req) {
    var battle = BattleFactory.getUserBattle(req);
    if (battle) {
        callback(null, true);
        return;
    }

    if (!req.session.user) {
        callback("没登陆！");
        return;
    }

    var key = req.session.user.name;

    var str = key + ":"+JSON.stringify(this.keys);
    console.log(str);

    for (var i = 0; i < this.keys.length; i++) {
        var c = this.keys[i];
        if (c.id != key) {

            for (var i = this.keys.length - 1; i >= 0; i--) {
                var c1 = this.keys[i];
                if (c1.id == key || c1.id == c.id) {
                    this.keys.splice(i, 1);
                };
            };



            var job = job;
            var enemyjob = c.job;

            var p1 = { cards: [] };
            var p2 = { cards: [] };
            var h1 = util.random(heros);
            var h2 = util.random(heros);
            util.each(heros, function (h) {
                if (h.job == job)
                    h1 = h;
                if (h.job == enemyjob)
                    h2 = h;
            });


            p1.cards = Paractice.getCards(h1.job);
            p2.cards = Paractice.getCards(h2.job);


            var player1 = new Player(p1);
            var player2 = new Player(p2);
            h1.use(player1);
            h2.use(player2);

            player1.control = new UserControl(player1);
            player2.control = new UserControl(player2);

            var battle = new Battle(player1, player2);
            BattleFactory.setFightBattle(key, c.id, battle);
            callback(null, true);
            return;
        }
    }



    for (var i = 0; i < this.keys.length; i++) {
        var c = this.keys[i];
        if (c.id == key) {
            c.job = job;
            c.date = new Date();
            callback(null, false);
            return;
        }
    }

    this.keys.push({ id: key, job: job, date: new Date() });
    callback(null, false);
};


Paractice.fight = new Fight();

Paractice.beginFight = function (job, callback, req) {
    Paractice.fight.join(job, callback, req);
};