var crypto = require('crypto');
var User = require('../models/user.js');

function toJson(user) {
    if (user == undefined)
        return null;
    return {
        n:user.name,
        id:user._id
    };
};

var uc = {};
module.exports =uc;

uc.getUser = function (callback, req) {
    callback(null, toJson(req.session.user));
};
uc.regUser = function (n, p, e, callback, req) {
    if (!n || !p || !e) {
        callback("n,p,e有空值！");
        return;
    }

    if(e!="ipinsgisgood")  {
        callback("邀请码不正确！");
        return; 
     }

    var md5 = crypto.createHash('sha1');
    var password = md5.update(p,'utf8').digest('hex');

    User.get(n, function (err, user) {
        if (user) {
            callback("用户已存在！");
            return;
        }
        var u = new User({
            name: n,
            password: password,
            code: e
        });

        u.save(function (err, user) {
            if (err) {
                res.json({ err: err });
                return;
            }
            req.session.user = user;
            callback(null, toJson(user))
        });
    });
};
uc.login = function (n, p, callback, req) {

    var md5 = crypto.createHash("sha1");
    var password = md5.update(p, 'utf8').digest("hex");

    User.get(n, function (err, user) {
        if (!user) {
            callback("用户不存在");
            return;
        }

        if (password != user.password) {
            callback("密码不匹配！");
            return;
        }

        req.session.user = user;
        callback(null, toJson(user));
    });
};
uc.logout = function (callback, req) {
    req.session.user = null;
    callback(null, true);
};

