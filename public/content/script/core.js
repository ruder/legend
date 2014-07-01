var server = function () {
    var parmas = [];
    var callback = undefined; //只能一个callback
    var fail = r.error;
    for (var i = 0; i < arguments.length; i++) {
        var a = arguments[i];
        if (typeof a == "function") {
            if (!callback) {
                parmas.push("callback")
                callback = a;
            }
            else {
                fail = a;
            }
        }
        else
            parmas.push(a);
    }


    $.ajax({
        url: "/excute",
        type: "POST",
        dataType: "json",
        data: { parmas: parmas.join(",") },
        success: function (d) {
            if (d.err) {
                if (fail)
                    fail(d.err);
                return;
            }
            if (callback)
                callback(d.d);
        },
        error: function (d) {
            if (fail)
                fail("服务出错或无反应，" + d);
        }
    });

};

var r = {};

r.guid = function () {
    if (!r.guid.num) {
        r.guid.num = 0;
    }
    r.guid.num++;
    return "cg" + r.guid.num;
}

r.noSelect = function (dom) {
    $(dom).disableSelection();
    //return $(dom).attr("unselectable", "on")
    //    .css("MozUserSelect", "none")
    //    .bind("selectstart.ui", function () { return false });
};

r.alert = function (msg) {
    if (!r.alertpanel) {
        r.alertpanel = $("<div/>").addClass("alert_panel").hide().appendTo($("body"));
    }
    r.alertpanel.text(msg);
    r.alertpanel.show();

    if (r.alertTimer) {
        clearTimeout(r.alertTimer)
    }

    r.alertTimer = setTimeout(function () {
        r.alertpanel.hide();
    },2000);
};
r.error=function(msg){
    if (!r.errorpanel) {
        r.errorpanel = $("<div/>").addClass("error_panel").hide().appendTo($("body"));
    }
    r.errorpanel.text(msg);
    r.errorpanel.show();

    if (r.errorTimer) {
        clearTimeout(r.errorTimer)
    }

    r.errorTimer = setTimeout(function () {
        r.errorpanel.hide();
    },2000);
};

r.user = function () {
    this.id = "";
    this.name = "";
};
r.user.prototype.isLogined = function () {
    return this.id != "";
};
r.user.prototype.init = function (callback) {
    var me = this;
    server("routes.user.getUser", function (u) {
        if (u) {
            me.id = u.id;
            me.name = u.n;
        }
        callback(me);
    });
};
r.user.prototype.login = function (n, p, callback) {
    var me = this;
    server("routes.user.login", n, p, function (u) {
        if (u) {
            me.id = u.id;
            me.name = u.n;
        }
        callback();
    });
};
r.user.prototype.logout = function (callback) {
    var me = this;
    server("routes.user.logout", function () {
        me.id = "";
        me.name = "";
        callback();
    });
};

r.user.prototype.reg = function (n, p, e,callback) {
    var me = this;
    server("routes.user.regUser",n, p, e, function (u) {
        if (u) {
            me.id = u.id;
            me.name = u.n;
        }
        callback()
    });

};

r.cuser = new r.user();


//ui
r.win = function (title, div) {
    if (r.win.dom == undefined) {
        r.win.dom = $("<div class='win'/>").appendTo($("body"));
        var cp = $("<div class='win_iner'></div>").appendTo(r.win.dom);
        var titlediv = $("<div class='tp'></div>").appendTo(cp);
        var title1 = $("<span>" + title + "</span>").appendTo(titlediv);
        var closebtn = $("<font>X</span>").appendTo(titlediv).click(function () {
            r.win.dom.hide();
        });
        var content = $("<div class='content'></div>").appendTo(cp);
    }
    r.win.dom.find(".tp span").text(title);
    r.win.dom.find(".content").empty().append(div);
    r.win.dom.show();
};
r.win.close = function () {
    r.win.dom.hide();
}



//validate

r.validate = function (name, v, types) {
    for (var i = 0; i < types.length; i++) {
        var t = types[i];
        switch (t) {
            case "notempty":
                {
                    if (!v || $.trim(v) == "") {
                        r.error(name + "不能为空值！");
                        return false;
                    }
                    break;
                }
            case "email":
                {
                    if (!/^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/g.test(v)) {
                        r.error(name + "不正确！");
                        return false;
                    }
                    break;
                }
        }

        return true;
    }
}

