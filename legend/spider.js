var http = require('http');

function cut(str,prev,end){
    var index1 = str.indexOf(prev);
    if (index1 < 0)
        return "";
    index1 += prev.length;
    var index2 = str.indexOf(end,index1);
    if (index2 < 0)
        index2 = str.length;
    return str.substr(index1, index2-index1);
};

function clear(str){
    str= str.replace(/<[^>]*>/g, "");
    str=str.replace(/\s*/g,"");
    return str;
};

function pad(num, n) {
  len=(""+num).length;
  return Array(n>len?(n-len)+1:0).join(0)+num;
}

var cards = {};
var urls = [];

var cp = function (str) {
    this.str = str;
};

cp.prototype.compute = function () {
    var id = this.cut("<a href=\"/card/", "/");
    var card = cards[id];
    if (!card) {
        card = { id: id };
        cards[id] = card;
    }

    card.name = this.cut("<h2><span></span>", "</h2>");
    card.skill = this.cut("<p>", "</p>");
    card.type = this.cut("卡牌类型：", "</a>");
    card.job = this.cut("职业：", "</li>")
    card.race = this.cut("种族：", "</a>");
    card.rate = this.cut("稀有度：", "</a>");
    card.group = this.cut("所属卡组：", "</a>");
    card.mark = this.cut("<p class=\"cite-text\">", "</p>");
    card.hide = this.cut("<li>可收", "</li>") != "";

    var other = cut(this.str, "<div class=\"cards-cnts\">", "</table>");
    var cs = [];
    var lines = other.split("</tr>");
    this.compute2(lines);
};

cp.prototype.compute2 = function (lines) {
    for (var i = 1; i < lines.length - 1; i++) {
        var ts = lines[i].split("</td>");
        var id = cut(ts[0], "<a href=\"/card/", "/");
        var url = "http://db.h.163.com" + cut(ts[0], "<a href=\"", "\"");
        var hasUrl = false;
        for (var j = 0; j < urls.length; j++) {
            if (urls[j] == url) {
                hasUrl = true;
                break;
            }
        }
        if (!hasUrl)
            urls.push(url);

        var card = cards[id];
        if (!card) {
            card = { id: id };
            cards[id] = card;
        }
        card.name = clear(ts[0]);
        card.cost = clear(ts[3]);
        card.attack = clear(ts[4]);
        card.blood = clear(ts[5]);
    };
}

cp.prototype.cut = function (prev, end) {
    return clear(cut(this.str, prev, end));
};

var Spider = {};

Spider.getCards = function (callback, req) {
    callback(null, cards);
};

Spider.getIndex = function (index, callback, req) {
    Spider.getCard(index, function () {
        callback(null, cards);
    });
};

Spider.start = function (callback, req) {
    var index = -1;

    var g = function () {
        index++;
        cards.index = index;
        if (index >= urls.length) {
            //callback(null, cards);
            return;
        }
        Spider.getCard(urls[index], g);
    };

    g();

    callback(null, true);
};

Spider.getCard = function (url, cb) {

    try {
        http.get(url, function (res) {
            console.log("Got response: " + res.statusCode, res.headers);
            var buffers = [], size = 0;
            res.on('data', function (buffer) {
                buffers.push(buffer);
                size += buffer.length;
            });
            res.on('end', function () {
                var buffer = new Buffer(size), pos = 0;
                for (var i = 0, l = buffers.length; i < l; i++) {
                    buffers[i].copy(buffer, pos);
                    pos += buffers[i].length;
                }
                var sub = cut(buffer.toString(), "<div id=\"card-box\" class=\"card-box\">", "<div class=\"cards\">")
                var p = new cp(sub);
                p.compute();
                cb();
            });
        }).on('error', function (e) {
            console.error(url+e);
            cb();
        });
    }
    catch (ex) {
        console.error(url);
        cb();
    }
};

Spider.getUrls = function (callback) {
    var max = 48; //48
    var index = 0;

    var g = function () {
        index++;
        cards.index = index;
        if (index > max) {
            callback(null, urls);
            return;
        }
        //------------------------
        http.get("http://db.h.163.com/cards/filter?filter=Cost%3Dgte%3A0&page=" + index, function (res) {
            //console.log("Got response: " + res.statusCode, res.headers);
            var buffers = [], size = 0;
            res.on('data', function (buffer) {
                buffers.push(buffer);
                size += buffer.length;
            });
            res.on('end', function () {
                var buffer = new Buffer(size), pos = 0;
                for (var i = 0, l = buffers.length; i < l; i++) {
                    buffers[i].copy(buffer, pos);
                    pos += buffers[i].length;
                }

                var subs = buffer.toString().split("<h2><span></span>");
                for (var i = 1; i < subs.length; i++) {
                    var s = subs[i]
                    var url = cut(s, "href=\"", "\"");
                    urls.push("http://db.h.163.com" + url);
                }
                g();
            });
        });


        //------------------------
    };

    g();

};

module.exports = Spider;


