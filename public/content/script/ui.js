if (!r)
    r = {};

r.ui = function () {
    r.ui.p = $("<div class='uip'/>").appendTo($("body"));
};

r.ui.user = function () {
    r.ui.p.empty();
    if (r.cuser.isLogined()) {
        $("<a>" + r.cuser.name + "</a>").appendTo(r.ui.p);
        $("<a>登出</a>").appendTo(r.ui.p).click(function () {
            r.cuser.logout(function () {
                r.ui.user();
            });
        });
    }
    else {
        $("<a>登录</a>").appendTo(r.ui.p).click(function () {
            r.ui.login();
        });
        $("<a>注册</a>").appendTo(r.ui.p).click(function () {
            r.ui.regUser();
        });
    }
};

r.ui.login = function () {
    var div = $("<div class='fm'>" +
        "<div class='fm_r'><span>用户名：</span><input id='uname' /></div>" +
        "<div  class='fm_r'><span>密码：</span><input id='up' type='password' /></div>" +
        "<div  class='fm_r'><input class='btn' id='btn' type='button' value='登陆' /></div>" +
        "</div>").appendTo($("body"));
    div.find("#btn").click(function () {
        var pdiv = $(this).parent().parent();
        var n = pdiv.find("#uname").val();
        var p = pdiv.find("#up").val();

        if (!r.validate("用户名", n, ["noempty"]))
            return;
        if (!r.validate("密码", p, ["noempty"]))
            return;


        r.cuser.login(n, p, function () {
            r.win.close();
            r.ui.user();
        });
    });


    r.win("登陆", div);
};

r.ui.regUser = function () {
    var div = $("<div class='fm'>" +
        "<div class='fm_r'><span>用户名：</span><input id='uname' /></div>" +
        "<div  class='fm_r'><span>密码：</span><input id='up' type='password' /></div>" +
        "<div  class='fm_r'><span>邮箱地址：</span><input id='ue'  /></div>" +
        "<div  class='fm_r'><input class='btn' id='btn' type='button' value='注册' /></div>" +
        "</div>").appendTo($("body"));
    div.find("#btn").click(function () {
        var pdiv = $(this).parent().parent();
        var n = pdiv.find("#uname").val();
        var p = pdiv.find("#up").val();
        var e = pdiv.find("#ue").val();

        if (!r.validate("用户名", n, ["notempty"]))
            return;
        if (!r.validate("密码", p, ["notempty"]))
            return;
        if (!r.validate("邮箱地址", e, ["notempty","email"]))
            return;

        r.cuser.reg(n, p, e, function () {
            r.win.close();
            r.ui.user();
        });
    });


    r.win("注册", div);
};


$(function () {
    r.ui();

    //r.cuser.init(function (u) {
    //    r.ui.user(u);
    //});


    //getcards();

});

//function startgetcard(){
//    server("legend.spider.start", function (d) {
//        alert("开始");
//    });
//};
//function getcards(){
//     server("legend.spider.getCards", function (d) {
//        window.card = d;
//    });
//};

//function getIndex(index){
//     server("legend.spider.getIndex",index, function (d) {
//        window.card = d;
//    });
//};

//function getUrl(index){
//     server("legend.spider.getUrls",function (d) {
//        window.urls = d;
//    });
//};


