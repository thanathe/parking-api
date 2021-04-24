/* jshint node:true */
'use strict';

var path = require('path');
var express = require('express');
var expressPath = require('express-path');
var bodyParser = require('body-parser');
var logger = require('morgan');
var cors = require('cors');
require('dotenv').config()
var libMySQL = require('./lib/v1/mysql-db')
var onResponseEnd = require('./middlewares/response-end').onResponseEnd;

var app = express();

var errStackTrace = function (show) {
    return function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: show ? err : {}
        });
        next();
    };
};

libMySQL.connect();

try {
    app.use(errStackTrace(true));
    app.use(logger('dev'));
} catch(err) {
    console.log('start backend error ENV=', app.get('env'));
}


// Set up global APPDIR for resources to be related to.
// If not set via env, use the directory that holds app.js.
if (process.env.APPDIR)
    global.APPDIR = process.env.APPDIR;
else
    global.APPDIR = __dirname;

app.use(bodyParser.json({
    limit: '1mb'
}));
app.use(bodyParser.urlencoded({
    limit: '1mb',
    extended: true
}));


app.use(onResponseEnd(function () {
    console.log('--- Response ended prematurely.');
    console.log('from', this.req.originalUrl);
}));


var setupRoute = function (app, routePath, routeMap, middlewares) {
    var api = express.Router();
    var routes = require(routeMap);

    if (typeof middlewares === 'function')
        api.use(middlewares);
    else if (typeof (middlewares) === 'object' && middlewares.forEach)
        middlewares.forEach(function (m) {
            api.use(m);
        });

    expressPath(api, routes, {
        verbose: false
    });
    app.use(routePath, api);
};

// Routes configuration
// Main API
setupRoute(app, '/v1', './api/v1/routes', cors());


module.exports = app;
