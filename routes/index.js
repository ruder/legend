var BattleFactory = require("../legend/battleFactory.js");

function checkLogin(req,res){
    if (!req.session.user) {
        res.redirect('/');
        return false;
    }
    return true;
}

module.exports = function (app) {

    app.get('/', function (req, res) {
        if (req.session.user)
            res.render('index', { user: req.session.user });
        else
            res.render('login', {});
    });
    app.get('/reg', function (req, res) {
        res.render('register', {});
    });
    app.get('/pready', function (req, res) {
        if (!checkLogin(req,res)) 
            return;
        
        res.render('ready', { user: req.session.user,battle:BattleFactory.getUserBattle(req) });
    });
    app.get('/fight', function (req, res) {
        if (!checkLogin(req,res)) 
            return;
        
        res.render('fight', { user: req.session.user,battle:BattleFactory.getUserBattle(req) });
    });
    app.get('/play', function (req, res) {
        if (!checkLogin(req,res)) 
            return;
        res.render('play', {});
    });
    app.post("/excute", function (req, res) {
        try {
            var parmas = req.body.parmas.split(',');

            var pns = parmas[0].split('.');
            var mname = pns.pop();
            var mpath = "../" + pns.join("/") + ".js";

            var m = require(mpath);
            if (!m) {
                res.json({ err: "无法找到指定的模块！" });
                return;
            }
            var mothod = m[mname];
            if (!mothod) {
                res.json({ err: "无法找到指定的操作！" });
                return;
            }

            var callbackfuction = function (err, d) {
                res.json({ err: err, d: d });
            };

            for (var i = 0; i < parmas.length; i++) {
                if (parmas[i] == "callback") {
                    parmas[i] = callbackfuction;
                }
            }

            if (typeof mothod == "function") {
                parmas.splice(0, 1);
                parmas.push(req);
                parmas.push(res);
                var d = mothod.apply(m, parmas);
            }
            else {
                var d = mothod;
                res.json({ err: null, d: d });
            }
        }
        catch (e) {
            throw e;
            res.json({ err: e });
        }
    })

};