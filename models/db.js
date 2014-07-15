
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var db_name = 'LsnJeQhWzSfDoGidpuXC';                  // 数据库名，从云平台获取
var db_host = process.env.BAE_ENV_ADDR_MONGO_IP || '127.0.0.1';      // 数据库地址
var db_port = +process.env.BAE_ENV_ADDR_MONGO_PORT || 27017 ;   // 数据库端口
var username = process.env.BAE_ENV_AK || 'sa';                 // 用户名
var password = process.env.BAE_ENV_SK || 'sa';                 // 密码    





function dbc(){
    this.db = new Db(db_name, new Server(db_host, db_port, {}), { w: 1 });
};

dbc.prototype.open = function (collectionName, callback) {
    this.db.open(function (err, db) {
        var dbclose = function () {
            db.close();
        };
        db.authenticate(username, password, function (err, result) {
            if (!result || err) {
                dbclose();
                callback(err);
                return;
            }
            db.collection(collectionName, function (err, collection) {
                if (err) {
                    dbclose();
                    callback(err);
                    return;
                }
                callback(null, dbclose, collection);
            });
        });
    });
};



module.exports = new dbc();
