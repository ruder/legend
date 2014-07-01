var express = require('express')
var path = require('path');
var routes = require('./routes');
var MemcacheStore = require('connect-memcache')(express);

var app = express();

app.configure(function () {
    app.set('port', process.env.PORT);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.compress());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({
        secret: 'k',
        key: 'k',
        cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 },
        store: new MemcacheStore({
            db:'k'
        })
    }));
    //app.use(express.session({secret: 'ipinsgsec'}));
    app.use(app.router);
    app.use(express.errorHandler());
    app.use(express.static(path.join(__dirname, 'public')));
});


routes(app);


 
app.listen(process.env.APP_PORT);