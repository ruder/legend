var db = require("./db");
var crypto = require("crypto");

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.code = user.code;
};

module.exports = User;

User.prototype.save = function (callback) {
    var u = {
        name: this.name,
        password: this.password,
        code: this.code
    }

    db.open("users", function (err, dbclose, collection) {
        if (err) {
            callback(err);
            dbclose();
            return;
        }
        collection.insert(u, { safe: true }, function (err, user) {
            if (err) {
                callback(err);
                dbclose();
                return;
            }
            dbclose();
            callback(null, user[0]);            
        });
    });
};

User.get = function (name, callback) {
    db.open("users", function (err, dbclose, collection) {
        if (err) {
            callback(err);
            dbclose();
            return;
        }
        collection.findOne({ name: name }, function (err, user) {
            if (err) {
                callback(err);
                dbclose();
                return;
            }
            dbclose();
            callback(null,user);
        });
    });
};


