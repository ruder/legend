var Control = require("../legend/control.js");
var Action=require("../legend/action.js");
var util = require("../util.js");

var UserControl = function (player) {
    Control.call(this, player);
    this.actions = [];
};

util.inherits(UserControl, Control);

UserControl.prototype.onTurn = function (cb) {
    this.cb = cb;
    this.turn = true;
    
    if (this.clientcb)
        this.clientcb();
}
UserControl.prototype.next = function (cb) {
    //console.log(this.cb+'-----cb:'+cb);
    this.clientcb = cb;
    this.turn = false;
    if (this.cb) {
        var ccb = this.cb;
        this.cb = null;
        ccb();
    }

    //else {
    //    console.log("this.cb is "+this.cb);
    //    var me = this;
    //    this.player.round_end({}, function () {
    //        me.player.enemy.round();
    //    })
    //}
};
UserControl.prototype.win=function(){
    
}
UserControl.prototype.surrender = function () {
    if (this.player.battle.isEnd())
        return;
    this.player.enemy.win();
};
UserControl.prototype.chooseTarget = function (scope, cb) {

    if (this.target) {
        var target = this.target;
        this.target = null;
        cb(target);
        return;
    }

    this.targetcb = cb;
};
UserControl.prototype.setTarget = function (target) {
    if (this.targetcb) {
        var cb = this.targetcb;
        this.targetcb = null;
        cb(target);
        return;
    }

    this.target = target;

}

UserControl.prototype.addAction = function (action) {
    this.actions.push(action);
    //console.log("UserControl.prototype.addAction");
    this.actionCallback();
};
UserControl.prototype.getActions = function (cb) {
    this.actioncb = cb;

    if (this.actions.length > 0) {
        this.actionCallback()
        return;
    }

    me = this;
    if (this.time) {
        clearTimeout(this.time);
        this.time = null;
    }
    this.time = setTimeout(function () {
        me.actionCallback();
    }, 1000 * 30);

};
UserControl.prototype.actionCallback = function () {
    if (!this.actioncb)
        return;

    var actions = this.actions;
    this.actions = [];
    var cb = this.actioncb;
    this.actioncb = null;
    cb(actions);
};
UserControl.prototype.clearActions = function () {
    this.actions = [];
};



Control.prototype.chooseCards = function (cards, count, cb) {
    this.choose_cards = cards;
    this.choose_count = count;
    this.choose_cb = cb;

    var cs = [];
    util.each(cards, function (c) {
        cs.push(c.name);
    });

    this.addAction(Action.card_choose(cs,count));
};

Control.prototype.setChoosedCards = function (cards) {
    if (!this.choose_cb)
        return;

    var cs = [];
    util.each(this.choose_cards, function (c) {
        util.each(cards, function (name) {
            if (c.name == name)
                cs.push(c);
        });
    });
    this.choose_cb(cs);

    delete this.choose_cb;
    delete this.choose_cards;
    delete this.choose_count;
};

module.exports = UserControl;