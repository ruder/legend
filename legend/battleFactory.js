var BattleFactory = function () {
    this.datas = {};
    var me = this;
    this.timer = setInterval(function () {
        me.clear();
    }, 5 * 60 * 1000);
};

BattleFactory.prototype.add = function (key, battle) {
    battle.bdate = new Date();
    this.datas[key] = battle;
};

BattleFactory.prototype.get = function (key) {
    var battle = this.datas[key];
    if (!battle)
        return null;
    return battle;
};

BattleFactory.prototype.getp2 = function () {
    for (var index in this.datas) {
        var b = this.datas[index];
        if (b.isEnd())
            continue;
        if (b.key2)
            continue;
        return b;
    }

    return null;
};

BattleFactory.prototype.remove = function (key) {
    delete (this.datas[key]);
};

BattleFactory.prototype.clear = function () {
    var d = new Date();
    for (var index in this.datas) {
        var b = this.datas[index];
        if (b.isEnd()) {
            this.remove(index);
            continue;
        }

        if (d - b.bdate > 30 * 60 * 1000)
            this.remove(index);
    }
};

BattleFactory.prototype.getUserBattle = function (req) {
    if (!req.session.user)
        return null;
    var key = req.session.user.name;
    return this.get(key);
};

BattleFactory.prototype.setUserBattle = function (req, battle) {
    if (!req.session.user)
        return null;
    var key = req.session.user.name;
    this.add(key, battle);
    battle.key1 = key;
    var me = this;
    battle.start(function (b) {
        setTimeout(function () {
            me.remove(key);
        }, 2*1000);
    });
};

BattleFactory.prototype.setFightBattle = function (uid, uid2, battle) {
    this.add(uid, battle);
    this.add(uid2, battle);
    battle.key1 = uid;
    battle.key2 = uid2;
    var me = this;
    battle.start(function (b) {
        setTimeout(function () {
            me.remove(b.key1);
            me.remove(b.key2);
        }, 2*1000);
    });
};

module.exports =new BattleFactory();

