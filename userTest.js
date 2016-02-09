var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var Promise = require('bluebird');


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

new User({username: 'dayman', password: 'nightman'})
.save() 
.then(function(model) {
  console.log(model); // password = '$2a$10$YDc3uqPpMo9yKTfQDL2DAeTH6Hme2w1GZTI2bl0qxmp3vptm99Ax2'
  new User({username: 'dayman'})
  .fetch()
  .then(function(found) {
    console.log(found);
  });
});