var util = require("../util.js");
var CardHeap = require("../legend/cards/cardheap.js");

var Battle = function (p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
    this.logs = [];
    this.r = 0;

    this.trashCards = [];
    this.on = null;
    this.winer = null;
};

Battle.prototype.start = function (callback) {
    this.log("battle start");

    this.collectCards();

    this.wincallback = callback;
    var me = this;
    var first = this["p" + (1 + Math.floor(Math.random() * 2))];

    this.p1.init(this, this.p2, this.p1 == first);
    this.p2.init(this, this.p1, this.p2 == first);

    
    first.round();
}

Battle.prototype.collectCards = function () {
    var ps = [this.p1, this.p2];
    for (var i = 0; i < ps.length; i++) {
        var p = ps[i];
        var cards = [];
        for (var j = 0; j < p.cards.length; j++) {
            var cname = p.cards[j];

            var card = CardHeap.find(cname);

            if (card) {
                card.id = this.guid();
                cards.push(card);
            }

        }
        p.cards = cards;
    }
};

Battle.prototype.win = function (p) {

    this.log("battle end");

    this.p1.control.win();
    this.p2.control.win();
    this.winer = p;

    if (this.wincallback)
        this.wincallback(this);
};

Battle.prototype.isEnd = function () {
    if (this.p1.hero.blood <= 0)
        return true;
    if (this.p2.hero.blood <= 0)
        return true;
    return false;
};

Battle.prototype.log = function (msg) {
    this.logs.push(msg);
};

Battle.prototype.event = function (obj, callback) {
    var opers = [
        {t:this.p1,oper:this.p1.event}, 
        {t:this.p2,oper:this.p2.event}
    ];
    util.orderExcute(opers, obj, callback);
};

Battle.prototype.guid = function () {
    if (!this.gid)
        this.gid = 0;

    this.gid++;

    return "g" + this.gid;
};

Battle.prototype.addAction = function (action) {
    this.p1.control.addAction(action);
    this.p2.control.addAction(action);
    console.log(action);
};

module.exports = Battle;