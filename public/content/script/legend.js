createjs.Sound.registerSound({src:"content/audio/FX_MinionSummon_Drop.ogg", id:"普通随从置入场上"});
createjs.Sound.registerSound({src:"content/audio/FX_MinionSummonMedium_Drop.ogg", id:"中等随从置入场上"});
createjs.Sound.registerSound({src:"content/audio/FX_MinionSummonLarge_Drop.ogg", id:"大型随从置入场上"});
createjs.Sound.registerSound({src:"content/audio/Minion_Death_02.ogg", id:"随从被打碎"});
createjs.Sound.registerSound({src:"content/audio/Minion_Death_04.ogg", id:"随从被打很碎"});
createjs.Sound.registerSound({src:"content/audio/Minion_Death_06.ogg", id:"随从被打非常碎"});
createjs.Sound.registerSound({src:"content/audio/FX_Minion_AttackImpact.ogg", id:"普通随从攻击"});
createjs.Sound.registerSound({src:"content/audio/FX_Minion_AttackImpactMid.ogg", id:"中等随从攻击"});
createjs.Sound.registerSound({src:"content/audio/FX_Minion_AttackImpactLarge.ogg", id:"大型随从攻击"});
createjs.Sound.registerSound({src:"content/audio/hero_portrait_crack_1.ogg", id:"英雄头像裂开"});
createjs.Sound.registerSound({src:"content/audio/hero_portrait_explode_1.ogg", id:"英雄头像炸掉"});
createjs.Sound.registerSound({src:"content/audio/Physical_Targeted_Impact_01.ogg", id:"物理撞击"});
createjs.Sound.registerSound({src:"content/audio/tavern_crowd_play_reaction_quite_positive_5.ogg", id:"围观者反应较强烈"});
createjs.Sound.registerSound({src:"content/audio/tavern_crowd_play_reaction_positive_5.ogg", id:"围观者反应强烈"});
createjs.Sound.registerSound({src:"content/audio/tavern_crowd_play_reaction_very_positive_5.ogg", id:"围观者反应很强烈"});
createjs.Sound.registerSound({src:"content/audio/victory_screen_start.ogg", id:"胜利的欢呼"});


var movies = {};
movies.timeStep = 20;
movies.showTips = function ($dom,classname,text,cb) {
    var $tips=$dom.data('tips');
    if(!$tips){
        $tips=$("<div />").appendTo($dom);
        $dom.data('tips',$tips);
    }
    $tips.prop('className',classname).text(text)
        .delay(40 * movies.timeStep).hide("fade", {}, 10 * movies.timeStep, function () {
        cb();
    });
};

var getCard = function (name, callback) {
    if (!getCard.cards)
        getCard.cards = {};
    if (getCard.cards[name]) {
        callback(getCard.cards[name]);
        return;
    }

    server("legend.client.getCard", name, function (d) {
        getCard.cards[name] = d;
        callback(d);
    });
};
var serverAttack = function (aid, did, callback) {
    server("legend.client.attack", aid, did, function (d) {
        callback(d);
    });
};
var TargetPanel = function (ct) {
    this.$dom = $("<div class='targetpanel'/>").hide().appendTo(ct);
    this.$over = $("<div class='over'/>").appendTo(this.$dom);
    this.$panel = $("<div class='panel'/>").appendTo(this.$dom);
    this.$title = $("<div class='tptitle'/>").appendTo(this.$dom);

    var me = this;
    this.$over.click(function () {
        me.$dom.hide();
        $('.cardpool').css('z-index',9);
        $(".face,.minion").removeClass('glow');
        if (me.cancel)
            me.cancel();
    });
    this.$panel.click(function (e) {
        var $dom = $(e.target);
        if ($dom.attr("class") != "item")
            return;

        var id = $dom.attr("tid");
        me.$dom.hide();
        $('.cardpool').css('z-index',9);
        $(".face,.minion").removeClass('glow');
        if (me.selected){
            me.selected(id);
        }
    });
};
TargetPanel.prototype.show = function (title, selected, cancel) {
    this.$title.text(title);
    this.selected = selected;
    this.cancel = cancel;
    this.$panel.empty();
    var me = this;
    $(".face,.minion").each(function () {
        var item = $(this);
        var pos = item.offset();
        var width = item.outerWidth();
        var height = item.outerHeight();
        var tid = item.attr("id");
        item.addClass('glow');//随从或英雄头像外发光
        $("<div class='item'/>").attr("tid", tid).css({
            left: pos.left, top: pos.top, width: width, height: height
        }).appendTo(me.$panel);
    });
    $('.cardpool').css('z-index',4);
    this.$dom.show();
};

var CardHeap = function ($dom) {
    this.$dom = $("<div class='cardheap' title='剩余牌数'/>").appendTo($dom);
};
CardHeap.prototype.render = function (count) {
    this.count = count;
    this.$dom.text(count);
    if(count>=24){
        this.$dom.addClass('many_cards')
    }else if(count<24 && count>=16){
        this.$dom.removeClass('many_cards')
        this.$dom.addClass('some_cards')
    }else if(count<16 && count >=8){
        this.$dom.removeClass('some_cards')
        this.$dom.addClass('few_cards')
    }else if(count<=0){
        this.$dom.removeClass('few_cards')
        this.$dom.addClass('none_cards')
    }
};

var PowerPanel = function ($dom) {
    this.$dom = $("<div class='powerpanel'/>").appendTo($dom);
};
PowerPanel.prototype.render = function (power, maxpower) {
    this.$dom.empty();
    $("<font></font>").text(power + "/" + maxpower).appendTo(this.$dom);
    for (var i = 0; i < 10; i++) {
        var span = $("<span ></span>").appendTo(this.$dom);
        if (i < power)
            span.addClass("active");
        else if (i < maxpower)
            span.addClass("lost");
    }
};


var Card = function ($dom, pool) {
    this.pool = pool;
    this.$dom = $('<div class="card"/>').appendTo($dom);
    this.$litimg=$('<div class="litimg"><img src="content/images/cards/bg_card_back.png" width="90" /></div>').appendTo(this.$dom);
    this.$detail = $('<div class="detail"/>').appendTo(this.$dom);
    this.d = null;
};
Card.imagePath='http://img6.cache.netease.com/game/hs/db/cards/20140123/medium/';
Card.prototype.render = function (id, d, nomove) {
    this.id = id;
    this.$dom.attr("id", this.id);

    if (!d || d == "")
        return;
    this.name = d;
    var me = this;
    getCard(d, function (c) {
        me.d = c;
        me.$litimg.html("<img src='" + Card.imagePath + c.imageid + ".png' width='100%' />");
        me.$detail.html("<img src='" + Card.imagePath + c.imageid + ".png' width='100%' />"
            +"<h1>" + c.name + "</h1>"
            +"<span class='cost'>" + c.cost + "</span>"
            +"<p>" + c.effects.join("<br/>") + "</p>"
        ).hide();
        if (c.attack > 0 || c.blood > 0) {
            $("<span class='attack'>" + c.attack + "</span><span class='blood'>" + c.blood + "</span>").appendTo(me.$detail);
        }
        if (c.type == "Minion")
            me.$dom.addClass("minioncard");
    });

    this.$litimg.on('mouseenter',function () {
        me.$dom.css('z-index',2);
        $(this).css('opacity','0.1');
        me.$detail.show();
    });
    this.$litimg.on('mouseleave',function () {
        me.$dom.css('z-index',1);
        $(this).css('opacity','1');
        me.$detail.hide();
    });

    if (!nomove) {
        setTimeout(function () {
            r.noSelect(me.$dom);
            me.$dom.draggable({ revert: "invalid" });
        })
    }
};
Card.prototype.cancel = function () {
    var me = this;
    setTimeout(function () {
        me.$dom.css({ left: 0, top: 0 });
    });
};
Card.prototype.use = function () {
    if (!this.d || !this.pool.field.d.turn) {
        this.cancel();
        return;
    }

    var me = this;
    if (this.d.needTarget) {
        targetPanel.show("请选择一个目标", function (tid) {
            //alert(tid);
            me.serverUse(tid);
        }, function () {
            me.cancel();
        });
        return;
    }
    else {
        me.serverUse(null);
    }
};
Card.prototype.serverUse = function (target) {
    var me = this;
    var field = this.pool.field;
    var power = field.d.player.power;
    if (this.d.cost > power) {
        r.error("魔法不足！");
        me.cancel();
        return;
    }

    server("legend.client.userCard", this.id, target, function () {
        //me.pool.remove(me.id);
        //field.sync();
    });


};


var CardPool = function ($dom, self, field) {
    this.field = field;
    this.self = self;
    this.$dom = $("<div class='cardpool'/>").appendTo($dom);
    this.cs = [];
    this.cardWidth = 90;


};
CardPool.prototype.render = function (cs) {
    var list = [];
    for (var i = 0; i < cs.length; i++) {
        var name = cs[i].name||"";

        var findcard = false;
        for (var j = 0; j < this.cs.length; j++) {
            var card = this.cs[j];
            if (card.name == name) {
                list.push(card);
                findcard = true;
                this.cs.splice(j, 1);
                break;
            }
        }
        if (!findcard) {
            var c = new Card(this.$dom, this);
            c.render(cs[i].id,name);
            list.push(c);
        }
    }

    var tempdiv = $("<div/>").append(this.$dom.children());
    for (var i = 0; i < list.length; i++)
        this.$dom.append(list[i].$dom);
    tempdiv.empty();

    this.cs = list;

    this.refreshWidth();

}
CardPool.prototype.remove = function (cid) {
    for (var i = 0; i < this.cs.length; i++) {
        if (this.cs[i].id == cid) {
            this.cs[i].$dom.remove();
            this.cs.splice(i, 1);
            break;
        }
    }
    this.refreshWidth();

};
CardPool.prototype.use = function (cid) {
    for (var i = 0; i < this.cs.length; i++) {
        if (this.cs[i].id == cid) {
            this.cs[i].use();
            break;
        }
    }
};
CardPool.prototype.refreshWidth = function () {
    var width = 90;
    this.$dom.css('width', width * this.cs.length);
    this.$dom.css('margin-left', 0 - width * this.cs.length / 2);
};
CardPool.prototype.add = function (id,name, cb) {
    var c = new Card(this.$dom, this);
    c.render(id,(this.self?name:""));
    this.cs.push(c);
    this.refreshWidth();
    cb();
};
CardPool.prototype.lost = function (cid, cb) {
    this.remove(cid);
    cb();
};

var Minion = function ($dom, self, pool) {
    this.pool = pool;
    this.$dom = $("<div class='minion' />").appendTo($dom);
    this.self = self;
    this.firstrender = true;
};
Minion.prototype.render = function (d) {
    this.d = d;
    this.$dom.attr("id", d.id);
    this.id = d.id;

    this.$dom.empty();
    //this.$dom.attr("title", d.name);
        $('<span title="' + name + '" imageid="'+d.imageid+'" class="curve">' 
            +'<img style="position:absolute; left:-39px; top:-5px;" width=123 src="'+Card.imagePath + d.imageid + '.png" />'
            +'</span>').appendTo(this.$dom);

    //$("<h1>" + d.name + "</h1>").appendTo(this.$dom);
    var div = $("<div class='state'/>").appendTo(this.$dom);
    $("<span class='attack'>" + d.attack + "</span>"
        +"<span class='blood'>" + d.blood + "</span>").appendTo(this.$dom);
    var me = this;


    if (this.self) {
        this.$dom.addClass("attackhelper");
        r.noSelect(this.$dom);
        this.$dom.draggable({
            appendTo: 'body',
            cursor: "default",
            cursorAt: { top: 0, left: 0 },
            helper: function (event) {
                return $("<div class='attack-helper'></div>");
            }
        });
    }
    else if (this.firstrender) {
        this.$dom.droppable({
            accept: ".attackhelper",
            activeClass: "minion-hover",
            hoverClass: "minion-active",
            drop: function (event, ui) {
                var id = ui.draggable.attr("id");
                me.beAttack(id);
            }
        });
    }
    this.firstrender = false;

    this.renderState();

};
Minion.prototype.renderState = function () {
    var div = this.$dom.find(".state");
    div.empty();
    var ready = true;
    var stateClass={
        '嘲讽':'taunt',
        '风怒':'windfury',
        '圣盾':'protection',
        '潜行':'stealth',
        '冻结':'freeze',
        '沉默':'silenced',
        '休息':'rest'
    }
    var stateHtml='<i class="normal"></i>';
    var stateTitle='';
    for (var i = 0; i < this.d.states.length; i++) {
        var s = this.d.states[i];
        if (s == "休息"){
            ready = false;
        }
        stateHtml+='<i class="'+stateClass[s]+'">'+s+'</i>';
        stateTitle+= s+' ';
    };
    $(stateHtml).appendTo(div);
    div.prop('title',stateTitle);
    if (this.self) {
        if (ready)
            this.$dom.draggable("option","cancel","");
        else 
            this.$dom.draggable("option","cancel","#"+this.$dom.attr("id"));
    }
};
Minion.prototype.beAttack = function (id) {
    //alert(id + " attack " + this.d.id);

    serverAttack(id, this.d.id, function (d) {
        if (d != true)
            r.error(d);
        //window.field.sync();
    });
};
Minion.prototype.hurt = function (count, cb) {
    var me = this;
	//按伤害大小输出不同的声音
	if(count>=1 && count <5){
		createjs.Sound.play("普通随从攻击");
	}else if(count>=5 && count <8){
		createjs.Sound.play("中等随从攻击");
	}else if(count>=8){
		createjs.Sound.play("大型随从攻击");
	}
	if(count>=8 && count <11){
		setTimeout(function(){createjs.Sound.play("围观者反应较强烈");},500);
	}else if(count>=11 && count <14){
		setTimeout(function(){createjs.Sound.play("围观者反应强烈");},500);
	}else if(count>=14){
		setTimeout(function(){createjs.Sound.play("围观者反应很强烈");},500);
	}
    movies.showTips(this.$dom, "hurt", 0 - count, function () {
        me.d.blood -= count;
        me.$dom.find(".blood").text(me.d.blood);
        cb();
    });
};
Minion.prototype.cure = function (count, cb) {
    var me = this;
    movies.showTips(this.$dom, "cure", '+'+count, function () {
        me.d.blood += count;
        me.$dom.find(".blood").text(me.d.blood);
        cb();
    });
};
Minion.prototype.die = function (cb) {
    var me = this;
    this.$dom.effect("shake", {}, 20 * movies.timeStep, function () {
		createjs.Sound.play("随从被打碎");
        me.pool.remove(me.id);
        cb();
    });
};
Minion.prototype.changeAttack = function (count) {
    var t = count - this.d.attack;
    var buff = t > 0;
    this.d.attack = count;
    var me = this;
    movies.showTips(this.$dom, buff ? "buff" : "debuff", t, function () {
        me.$dom.find(".attack").text(count);
    });
};
Minion.prototype.addStates = function (states) {
    var ss = this.d.states;
    for (var i = 0; i < states.length; i++) {
        var s = states[i];
        var find = false;
        for (var j = 0; j < ss.length; j++) {
            if (ss[i] == s) {
                find = true;
                break;
            }
        }
        if (!find)
            ss.push(s);
    }
    this.renderState();
};
Minion.prototype.lostStates = function (states) {
    var ss = this.d.states;
    for (var i = ss.length - 1; i >= 0; i--) {
        for (var j = 0; j < states.length; j++) {
            if (states[j] == ss[i]) {
                ss.splice(i, 1);
                break;
            }
        }
    }
    this.renderState();
};

var MinionPool = function ($dom, self) {
    this.$dom = $("<div class='minionpool'/>").appendTo($dom);
    this.minions = [];
    this.self = self;
};
MinionPool.prototype.render = function (ms) {

    var list = [];
    for (var i = 0; i < ms.length; i++) {
        var id = ms[i].id;

        var findcard = false;
        for (var j = 0; j < this.minions.length; j++) {
            var m = this.minions[j];
            if (m.id == id) {
                m.render(ms[i]);
                list.push(m);
                findcard = true;
                this.minions.splice(j, 1);
                break;
            }
        }
        if (!findcard) {
            var c = new Minion(this.$dom, this.self, this);
            c.render(ms[i]);
            list.push(c);
        }
    }

    var tempdiv = $("<div/>").append(this.$dom.children());
    for (var i = 0; i < list.length; i++)
        this.$dom.append(list[i].$dom);
    tempdiv.empty();

    this.minions = list;

    this.refreshWidth();


};
MinionPool.prototype.refreshWidth = function () {
    var width = 90;
    this.$dom.css('width', width * this.minions.length);
    this.$dom.css('margin-left', 0 - width * this.minions.length / 2);
};
MinionPool.prototype.add = function (m) {
    var c = new Minion(this.$dom, this.self, this);
    c.render(m);
    this.minions.push(c);
    this.refreshWidth();
};
MinionPool.prototype.remove=function(id){
    for(var i=0;i<this.minions.length;i++){
        if(this.minions[i].id==id){
            this.minions[i].$dom.remove();
            this.minions.splice(i,1);
            break;
        }
    }
    this.refreshWidth();
};


var HeroPanel = function ($dom, self, field) {
    this.$dom = $("<div class='heropanel'/>").appendTo($dom);
    this.$weapon = $("<div class='weapon'/>").appendTo(this.$dom).css("visibility", "hidden");
    this.$face = $("<div class='face'/>").appendTo(this.$dom);
    this.$skill = $("<div class='skill'/>").appendTo(this.$dom);
    this.self = self;
    this.firstrender = true;

    this.field = field;
};
HeroPanel.prototype.render = function (d) {
    this.attack = d.attack;
    this.id = d.id;
    this.d = d;
    this.d.states = [];
    //weapon
    if (d.weapon) {
        this.$weapon.attr("title", d.weapon.name).empty().css("visibility", "visible");
        $("<span class='attack'>" + d.weapon.attack + "</span>").appendTo(this.$weapon);
        $("<span class='blood'>" + d.weapon.blood + "</span>").appendTo(this.$weapon);
    };

    //face
    this.$face.empty();
    this.$face.attr("id", d.id);

    var html='<div class="curve"><img src="content/images/cards/heros/'+d.imageid+'.png" width="100%" /></div>';
    html+='<div class="state"><i class="normal"></i></div>';
    html+="<h1 class='name'>" + d.name + "</h1>";
    html+="<span class='attack'>" + d.attack + "</span>";
    html+="<span class='guard'>" + d.guard + "</span>";
    html+="<span class='blood'>" + d.blood + "</span>";
    $(html).appendTo(this.$face);

    if (!d.attack || d.attack < 0)
        this.$face.find(".attack").hide();
    if (d.guard <= 0)
        this.$face.find(".guard").hide();

    //skill
    if (d.skill) {
        this.$skill.attr("title", d.skill.remark).empty().css("visibility", "visible");
        $("<span class='cost'>" + d.skill.cost + "</span>").appendTo(this.$skill);

        var skillbtn = $("<p>" + d.skill.name + "</p>").appendTo(this.$skill);
        if (this.self) {
            var me = this;
            this.$skill.addClass("self_skill").click(function () {
                me.useSkill();
            });
        }

    }

    if (this.firstrender) {
        this.firstrender = true;
        var me = this;
        if (this.self) {
            this.$face.addClass("attackhelper");
            this.$face.draggable({
                appendTo: 'body',
                cursor: "default",
                cursorAt: { top: 0, left: 0 },
                helper: function (event) {
                    return $("<div class='attack-helper'></div>");
                }
            });
        }
        else {
            this.$face.droppable({
                accept: ".attackhelper",
                activeClass: "hero-hover",
                hoverClass: "hero-active",
                drop: function (event, ui) {
                    var id = ui.draggable.attr("id");
                    me.beAttack(id);
                }
            });
        }

    }
};
HeroPanel.prototype.beAttack = function (id) {
    //alert(id + " attack " + this.id); 
    serverAttack(id, this.id, function () {
        //window.field.sync();
    });
};

HeroPanel.prototype.hurt = function (count, cb) {
    var me = this;
	//按伤害大小输出不同的声音
	if(count>=1 && count <5){
		createjs.Sound.play("普通随从攻击");
	}else if(count>=5 && count <8){
		createjs.Sound.play("中等随从攻击");
	}else if(count>=8){
		createjs.Sound.play("大型随从攻击");
	}
	if(count>=8 && count <11){
		setTimeout(function(){createjs.Sound.play("围观者反应较强烈");},500);
	}else if(count>=11 && count <14){
		setTimeout(function(){createjs.Sound.play("围观者反应强烈");},500);
	}else if(count>=14){
		setTimeout(function(){createjs.Sound.play("围观者反应很强烈");},500);
	}
    movies.showTips(this.$face, "hurt", 0-count, function () {
        me.d.blood -= count;
        me.$face.find(".blood").text(me.d.blood);
        cb();
    });
};
HeroPanel.prototype.cure = function (count, cb) {
    var me = this;
    movies.showTips(this.$face, "cure", count, function () {
        me.d.blood += count;
        me.$face.find(".blood").text(me.d.blood);
        cb();
    });
};
HeroPanel.prototype.guard_hurt = function (count, cb) {
    var me = this;
    movies.showTips(this.$face, "guard_hurt", 0 - count, function () {
        me.d.guard -= count;
        var $dom = me.$face.find(".guard");
        $dom.text(me.d.guard);
        if (me.d.guard <= 0)
            $dom.hide();

        cb();
    });
};
HeroPanel.prototype.guard_cure = function (count, cb) {
    var me = this;
    movies.showTips(this.$face, "guard_cure", count, function () {
        me.d.guard += count;
        var $dom = me.$face.find(".guard");
        $dom.text(me.d.guard);
        if (me.d.guard > 0)
            $dom.show();
        cb();
    });
};
HeroPanel.prototype.die = function (cb) {
    var me = this;
    this.$face.effect("explode", {}, 20 * movies.timeStep, function () {
        me.$face.show().css("visibility", "hidden");
        cb();
    });
};
HeroPanel.prototype.changeAttack = function (count) {
    var t = count - this.d.attack;
    var buff = t > 0;
    this.d.attack = count;
    var me = this;
    movies.showTips(this.$face, buff ? "buff" : "debuff", t, function () {
        var ad=me.$face.find(".attack");
        ad.text(count);
        if (count > 0)
            ad.show();
        else
            ad.hide();
    });

};
HeroPanel.prototype.addweapon = function (name, attack, blood) {
    this.$weapon.empty().css("visibility","visible");
    this.$weapon.attr("title", name);
    $("<span class='attack'>" + attack + "</span>"
        +"<span class='blood'>" + blood + "</span>").appendTo(this.$weapon);
    this.$face.find(".attack").text(attack).show();
};
HeroPanel.prototype.changeweapon = function (attack, blood) {
    this.$weapon.find(".attack").text(attack);
    this.$weapon.find(".blood").text(blood);
    this.$face.find(".attack").text(attack);
};
HeroPanel.prototype.removeweapon = function () {
    this.$weapon.css("visibility","hidden");
    this.$face.find(".attack").hide();
};
HeroPanel.prototype.showHeroAttack = function (turn) {
    if (!turn) {
        this.$face.find(".attack").hide();
        return;
    }

    var text = this.$face.find(".attack").text();
    var count = parseInt(text);
    if(count>0)
        this.$face.find(".attack").show();
};
HeroPanel.prototype.addStates = function (states) {
    var ss = this.d.states;
    for (var i = 0; i < states.length; i++) {
        var s = states[i];
        var find = false;
        for (var j = 0; j < ss.length; j++) {
            if (ss[i] == s) {
                find = true;
                break;
            }
        }
        if (!find)
            ss.push(s);
    }
    this.renderState();
};
HeroPanel.prototype.lostStates = function (states) {
    var ss = this.d.states;
    for (var i = ss.length - 1; i >= 0; i--) {
        for (var j = 0; j < states.length; j++) {
            if (states[j] == ss[i]) {
                ss.splice(i, 1);
                break;
            }
        }
    }
    this.renderState();
};
HeroPanel.prototype.renderState = function () {
    var div = this.$face.find(".state");
    div.empty();
    var ready = true;
    var stateClass={
        '风怒':'windfury',
        '圣盾':'protection',
        '冻结':'freeze',
        '沉默':'silenced',
        '休息':'rest'
    }
    var stateHtml='<i class="normal"></i>';
    var stateTitle='';
    for (var i = 0; i < this.d.states.length; i++) {
        var s = this.d.states[i];
        if (s == "休息"){
            ready = false;
        }
        stateHtml+='<i class="'+stateClass[s]+'">'+s+'</i>';
        stateTitle+= s+' ';
    };
    $(stateHtml).appendTo(div);
    div.prop('title',stateTitle);

    if (this.self) {
        if (ready)
            this.$face.draggable("option","cancel","");
        else 
            this.$face.draggable("option","cancel","#"+this.$face.attr("id"));
    }
};
HeroPanel.prototype.useSkill = function () {
    var field = this.field;
    if (!field.d.turn)
        return;
    var power = field.d.player.power;
    if (this.d.skill.cost > power) {
        r.error("魔法不足！");
        return;
    }

    var me = this;

    if (this.d.skill.target) {
        targetPanel.show("请选择一个目标", function (tid) {
            server("legend.client.userSkill", tid, function () {
                me.$skill.hide();
            });
        });
    }
    else {
        server("legend.client.userSkill", null, function () {
            me.$skill.hide();
        });
    }


};
HeroPanel.prototype.showSkill = function () {
    this.$skill.show();
}

var PlayerPanel = function ($dom, field) {
    this.self = true;
    this.field = field;
    this.$dom = $("<div class='playerpanel'/>").appendTo($dom);
    this.minionPanel = new MinionPool(this.$dom, true);
    this.heroPanel = new HeroPanel(this.$dom, true,field);
    this.cardPanel = new CardPool(this.$dom, true, field);
    this.powerPanel = new PowerPanel(this.$dom);
    this.cardheap = new CardHeap(this.$dom);
};
PlayerPanel.prototype.render = function (d) {
    this.d = d;
    this.heroPanel.render(d);
    this.minionPanel.render(d.minions);
    this.cardPanel.render(d.handCards);
    this.powerPanel.render(d.power, d.maxpower);
    this.cardheap.render(d.cardsCount);
};

var EnemyPanel = function ($dom) {
    this.self = false;
    this.$dom = $("<div class='enemypanel'/>").appendTo($dom);
    this.minionPanel = new MinionPool(this.$dom,false);
    this.heroPanel = new HeroPanel(this.$dom,false);
    this.cardPanel = new CardPool(this.$dom,false);
    this.powerPanel = new PowerPanel(this.$dom);
    this.cardheap = new CardHeap(this.$dom);
};
EnemyPanel.prototype.render = function (d) {
    this.d = d;
    this.heroPanel.render(d);
    this.minionPanel.render(d.minions);
    this.cardPanel.render(d.handCards);
    this.powerPanel.render(d.power,d.maxpower);
    this.cardheap.render(d.cardsCount);
};
EnemyPanel.prototype.targetRender = function () {
    var minions = this.minionPanel.minions;
    var $face = this.heroPanel.$face;

    var hascharge = false;
    for (var i = 0; i < minions.length; i++) {
        var m = minions[i];
        for (var j = 0; j < m.d.states.length; j++) {
            if (m.d.states[j] == "嘲讽") {
                hascharge = true;
                break;
            }
        }
    }

    if (!hascharge) {
        for (var i = 0; i < minions.length; i++) {
            minions[i].$dom.droppable("option", "accept", ".attackhelper");
        }
        $face.droppable("option", "accept", ".attackhelper");
    } else {
        $face.droppable("option", "accept", "");
        for (var i = 0; i < minions.length; i++) {
            var m = minions[i];
            m.$dom.droppable("option", "accept", "");
            for (var j = 0; j < m.d.states.length; j++) {
                if (m.d.states[j] == "嘲讽") {
                    m.$dom.droppable("option", "accept", ".attackhelper");
                    break;
                }
            }
        }
    }
};

var TrustCardPanel = function ($dom) {
    this.$dom = $("<div class='trustcardpanel' />").appendTo($dom);
    this.$img = $("<img class='trustcardpanelimg' />").appendTo($dom).hide();

    var me = this;

    this.$dom.on('mouseenter','span',function (e) {
        me.$img.show();
        var t = $(e.target);
        var imageid = t.attr("imageid");
        var src = "" + Card.imagePath + imageid + ".png";
        if (me.$img.attr('src') == src)
            return;
        me.$img.attr("src", src);
        
    });
    this.$dom.on('mouseleave',function () {
        me.$img.hide();
    });
};
TrustCardPanel.prototype.render = function (cs) {
    this.$dom.empty();
    for (var i=0,l = cs.length; i <l; i++) {
        var c = cs[i];
        var imageid=c.imageid, name=c.name, self=c.self;
        this.add(imageid, name, self);
    }
};
TrustCardPanel.prototype.add = function (imageid, name, self) {
        $('<span imageid="'+imageid+'" title="' + name + '" class="curve">' 
            +'<img style="position:absolute; left:-15px; top:-5px;" width=70 src="'+Card.imagePath + imageid + '.png" />'
            +'<span imageid="'+imageid+'" class="'+(self?'self':'side')+'">'+ name +'</span>'
            + "</span>").prependTo(this.$dom);
};

var Field = function ($dom) {
    this.action = new Action(this);
    this.$dom = $("<div class='field'/>").hide().appendTo($dom);
    $('<div class="ground"/>'
        +'<div class="groundCorner-1"/>'
        +'<div class="groundCorner-2"/>'
        +'<div class="groundCorner-3"/>'
        +'<div class="groundCorner-4"/>'
        +'<div class="groundCorner-6"/>'
        +'<div class="groundCorner-7"/>'
        +'<div class="groundCorner-8"/>'
        +'<div class="groundCorner-9"/>'    
        +'<div class="frame-1"/>'
        +'<div class="frame-2"/>'
        +'<div class="frame-3"/>'
        +'<div class="frame-4"/>').appendTo(this.$dom);
    this.$area = $("<div class='area'/>").appendTo(this.$dom);

    this.selfp = new PlayerPanel(this.$dom, this);
    this.enemyp = new EnemyPanel(this.$dom);
    this.trustcardpanel = new TrustCardPanel(this.$dom);

    var me = this;
    this.$nextbtn = $("<div class='nextbtn'>结束回合</div>").appendTo(this.$dom).click(function () {
        me.next();
    });
    this.$surrenderbtn=$("<div class='surrenderbtn'>投降</div>").appendTo(this.$dom).click(function () {
        me.surrender();
    });
    r.noSelect(this.$dom);
    this.$area.droppable({
        accept: ".card",
        activeClass: "area-hover",
        hoverClass: "area-active",
        drop: function (event, ui) {
            var id = ui.draggable.attr("id");
            me.selfp.cardPanel.use(id);
        }
    });
};
Field.prototype.next = function () {
    if (!this.d)
        return;
    if (!this.d.turn)
        return;

    var me = this;
    this.d.turn = false;
    this.$nextbtn.removeClass("turnbtn").text("对方回合");
    server("legend.client.next", function () {
        //me.sync();
    });
};
Field.prototype.surrender = function () {
    if (!this.d)
        return;
    var me = this;
    server("legend.client.surrender", function () {
        //me.sync();
    });
};
Field.prototype.sync = function () {
    var me = this;
    server("legend.client.field", function (d) {
        me.d = d;
        if (!d) {
            me.showWaite();
        }
        else {
            me.hideWaite();
            me.render();
            
        }
    });
};
Field.prototype.render = function () {
    if (!this.d.end) {
        this.selfp.render(this.d.player);
        this.enemyp.render(this.d.enemy);
        this.trustcardpanel.render(this.d.trashCards);

        this.renderNextBtn();
        this.hideWeaponSkill(this.d.turn);
        this.action.start();
    }
    else {
        this.action.showWin(this.d.win);
    }
};
Field.prototype.renderNextBtn = function () {
    if (this.d.turn) {
        this.$nextbtn.addClass("turnbtn").text("结束回合");
    }
    else {
        this.$nextbtn.removeClass("turnbtn").text("对方回合");
    }
};
Field.prototype.hideWeaponSkill = function (turn) {
    this.enemyp.heroPanel.showSkill();
    this.selfp.heroPanel.showSkill();
    if (turn) {
        this.enemyp.heroPanel.showHeroAttack(false);
        this.selfp.heroPanel.showHeroAttack(true);
        return;
    }
    this.enemyp.heroPanel.showHeroAttack(true);
    this.selfp.heroPanel.showHeroAttack(false);
};
Field.prototype.showWaite = function () {
    if (!this.$waitepanel) {
        this.$waitepanel = $("<div class='waitepanel'/>").appendTo($("body"));
        var div=$("<div>目前没有正在进行的战局，回去找美女炉石老板去...</div>").appendTo(this.$waitepanel);
        $("<a href='/' class='btn'>返回</a>").appendTo(div);
    }
    this.$waitepanel.show();
    document.title = "等待中";
    var me = this;
    setTimeout(function () {
        me.sync();
    }, 3000)
};
Field.prototype.hideWaite = function () {
    if (this.$waitepanel)
        this.$waitepanel.hide();
    this.$dom.show();
    document.title = "已匹配";
};

var Action = function (field) {
    this.field = field;
    this.connectState = false;
    this.actions = [];
    this.end = false;
};
Action.MINION_HURT = 0;
Action.MINION_CURE = 1;
Action.MINION_BORN = 2;
Action.MINION_DIE = 3;
Action.MINION_ATTACK = 4;
Action.MINION_STATE_ADD = 5;
Action.MINION_STATE_LOST = 6;
Action.CARD_NEW = 7;
Action.CARD_LOST = 8;
Action.CARD_USE = 9;
Action.HERO_GUARD_HURT=10;
Action.HERO_GUARD_CURE=11;
Action.HERO_DIE = 12;
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

Action.prototype.showWin = function (win) {
    var rw=$("<div class='round_win' ></div>").appendTo($("body"));
    var round_win = $("<div class='round_win_panel' ></div>").appendTo(rw);
    if (win) {
 		createjs.Sound.play("胜利的欢呼");
        $("<img src='content/images/actors/Victory.png' />").appendTo(round_win);
    }
    else {
        $("<img src='content/images/actors/Defeat.png' />").appendTo(round_win);
    }
    $("<div  class='round_title round_title_"+(win?"win":"lost")+"'>你" + (win ? "赢" : "输") + "了</div>").appendTo(round_win);
    $("<a href='/' class='btn'>返回</a>").appendTo(round_win);
    this.end = true;
    this.field.$nextbtn.remove();
    Action.$noOperHover.show();
};
Action.prototype.start = function () {
    if (this.connectState)
        return;
    this.connectState = true;
    this._connect();
}
Action.prototype._connect = function () {
    if (this.end)
        return;
    var me = this;
    server("legend.client.connect", function (actions) {
        if (!actions) {
            return;
        };
        me._connect();
        me.doAction(actions);
    }, function () {
        if (!me.errortime)
            me.errortime = 0;
        me.errortime++;
        setTimeout(function () {
            me._connect();
        }, me.errortime * 1000)

    });
};
Action.prototype.doAction = function (actions) {

    for (var i = 0; i < actions.length; i++) {
        this.actions.push(actions[i]);
    }

    var me = this;
    var i = -1;
    var cb = function () {
        i++;
        if (i >= actions.length)
            return;
        var action = actions[i];
        var func = me["action_" + action.type];

        if (func) {
            var parms = [];
            for (var key in action) {
                if (key != "type")
                    parms.push(action[key]);
            }
            parms.push(cb);
            func.apply(me, parms);
        }
        else {
            cb();
        }
    };

    cb();
};
Action.prototype.findmh = function (id) {
    if (this.field.selfp.heroPanel.id == id)
        return this.field.selfp.heroPanel;
    if (this.field.enemyp.heroPanel.id == id)
        return this.field.enemyp.heroPanel;
    var list = this.field.selfp.minionPanel.minions;
    for (var i = 0; i < list.length; i++)
        if (list[i].id == id)
            return list[i];
    list = this.field.enemyp.minionPanel.minions;
    for (var i = 0; i < list.length; i++)
        if (list[i].id == id)
            return list[i];
    return null;
};
Action.prototype.findplayer = function (id) {
    if (this.field.selfp.heroPanel.id == id)
        return this.field.selfp;
    if (this.field.enemyp.heroPanel.id == id)
        return this.field.enemyp;
    return null;
};
Action.prototype["action_" + Action.MINION_HURT] = function (id, count, cb) {
    var mh = this.findmh(id);
    mh.hurt(count, function(){});
    cb();
};
Action.prototype["action_" + Action.MINION_CURE] = function (id, count, cb) {
    var mh = this.findmh(id);
    mh.cure(count, function () { });
    cb();
};
Action.prototype["action_" + Action.MINION_BORN] = function (pid, minion, cb) {
    var player = this.findplayer(pid);
    var mpanel = player.minionPanel;
    mpanel.add(minion);
    setTimeout(function () {
        cb();
    },20*movies.timeStep);
};
Action.prototype["action_" + Action.MINION_DIE] = function (id, cb) {
    var mh = this.findmh(id);
    var me = this;
    mh.die(function () {
        if (!mh.self) {
            me.field.enemyp.targetRender();
        }
        //cb();
    });
    cb();
};
Action.prototype["action_" + Action.MINION_ATTACK] = function (id, tid, cb) {
    setTimeout(function () {
        cb();
    }, 20 * movies.timeStep);
};
Action.prototype["action_" + Action.MINION_STATE_ADD] = function (id, states, cb) {
    var mh = this.findmh(id);
    mh.addStates(states);
    cb();
};
Action.prototype["action_" + Action.MINION_STATE_LOST] = function (id, states, cb) {
    var mh = this.findmh(id);
    mh.lostStates(states);
    cb();
};
Action.prototype["action_" + Action.CARD_NEW] = function (pid, cid, name, cb) {
    var player = this.findplayer(pid);
    if (player.cardheap.count > 0) {
        player.cardheap.render(player.cardheap.count - 1);
    }
    var cpanel = player.cardPanel;
    cpanel.add(cid, name, cb);
};
Action.prototype["action_" + Action.CARD_LOST] = function (pid, cid, cb) {
    var player = this.findplayer(pid);
    var cpanel = player.cardPanel;
    cpanel.lost(cid, cb);
};
Action.prototype["action_" + Action.CARD_USE] = function (pid, cid, name, imageid, cb) {
    var player = this.findplayer(pid);

    this.field.trustcardpanel.add(imageid, name,player.self);
    var $img = $("<img class='cardshow' src='" + Card.imagePath + imageid + ".png'/>").appendTo(this.field.$dom);
    setTimeout(function () {
        cb();
    }, 1000)
    setTimeout(function () {
        $img.remove();
    }, 3000)
};
Action.prototype["action_" + Action.HERO_GUARD_HURT] = function (id, count, cb) {
    var mh = this.findmh(id);
    mh.guard_hurt(count, function () { });
    cb();
};
Action.prototype["action_" + Action.HERO_GUARD_CURE] = function (id, count, cb) {
    var mh = this.findmh(id);
    mh.guard_cure(count, function(){});
    cb();
};
Action.prototype["action_" + Action.HERO_DIE] = function (id, cb) {
    var mh = this.findmh(id);
    mh.die(cb);
};
Action.prototype["action_" + Action.HERO_ATTACK] = function (id, tid, cb) {
    setTimeout(function () {
        cb();
    }, 20 * movies.timeStep);
};
Action.prototype["action_" + Action.POWER_CHANGE] = function (pid, power, maxpower, cb) {

    var player = this.findplayer(pid);
    var panel = player.powerPanel;
    panel.render(power, maxpower);
    player.d.power = power;
    player.d.maxpower = maxpower;
    cb();
};
Action.prototype["action_" + Action.ROUND_CHANGE] = function (pid, cb) {
    var player = this.findplayer(pid);
    this.field.d.turn = player.self;
    this.field.renderNextBtn();
    if (player.self) {
        this.field.enemyp.targetRender();
        var $title = $("<div  class='round_title'>你的回合</div>").appendTo($("body"));
        setTimeout(function () {
            $title.remove();
        }, 1000);
    }
    

    //禁止操作
    if (!Action.$noOperHover) {
        Action.$noOperHover = $("<div class='no_oper_hover'/>").appendTo($("body"));
    }
    if (player.self) {
        Action.$noOperHover.hide();
    }
    else {
        Action.$noOperHover.show();
    }

    this.field.hideWeaponSkill(player.self);

    cb();
};
Action.prototype["action_" + Action.WIN] = function (pid, cb) {
    var player = this.findplayer(pid);
    this.showWin(player.self);
    cb();
};
Action.prototype["action_" + Action.ATTACK_CHANGE] = function (id, count, cb) {
    var mh = this.findmh(id);
    mh.changeAttack(count);
    cb();
};
Action.prototype["action_" + Action.CARD_COST_CHANGE] = function (id, count, cb) {
    cb();
};
Action.prototype["action_" + Action.WEAPON_ADD] = function (pid, name, attack, blood, cb) {
    var player = this.findplayer(pid);
    var heropanel = player.heroPanel;
    heropanel.addweapon(name, attack, blood);
    cb();
};
Action.prototype["action_" + Action.WEAPON_CHANGE] = function (pid, attack,blood, cb) {
    var player = this.findplayer(pid);
    var heropanel = player.heroPanel;
    heropanel.changeweapon(attack, blood);
    cb();
};
Action.prototype["action_" + Action.WEAPON_REMOVE] = function (pid, cb) {
    var player = this.findplayer(pid);
    var heropanel = player.heroPanel;
    heropanel.removeweapon();
    cb();
};
Action.prototype["action_" + Action.CARD_CHOOSE] = function (cs, count, cb) {
    this.$choosepanel = $("<div/>").addClass("choosepanel").appendTo(this.field.$dom);
    $("<h1>请选择一张牌：</h1>").appendTo(this.$choosepanel);
    var d = $("<div class='cardpanel'/>").css("width",cs.length*90).appendTo(this.$choosepanel);
    var me = this;
    for (var i = 0; i < cs.length; i++) {
        var n = cs[i];
        var card = new Card(d, null);
        card.render(r.guid(), n, true);
        card.$dom.attr("name", n);
        card.$dom.click(function () {
            var cardname = $(this).attr("name");
            server("legend.client.setChoosedCards", cardname, function () {
                if (me.$choosepanel) {
                    me.$choosepanel.remove();
                    cb();
                };
            });
        })
    };
};
$(function () {

    window.field = new Field($("body"));
    window.targetPanel = new TargetPanel(window.field.$dom);

    window.field.sync();

});