var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var Link = require('./link');



var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,

  initialize: function () {
    this.on('creating', this.hashPassword, this);
  },
  link: function() {
    return this.hasMany(Link);
  },
  hashPassword: function (model, attrs, options) {
    // console.log('model: ', model);
    // console.log('attrs: ', attrs);
    // console.log('options: ', options);
    return new Promise(function (resolve, reject) {
      bcrypt.hash(model.attributes.password, null, null, function (err, hash) {
        console.log('hash ', hash);
        if (err) { reject(err); }
        model.set('password', hash);
        resolve(hash);
      });
    });
  }

});

module.exports = User;