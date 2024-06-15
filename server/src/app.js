var express = require('express');
var logger = require('morgan');

var routes = require('./routes');
var broadcast = require('./broadcast');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', routes);

broadcast()

module.exports = app;
