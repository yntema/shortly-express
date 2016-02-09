var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var Link = require('./link');
var util = require('../../lib/utility');





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
    // util.makeHashPromise(model.attributes.password)
    return new Promise(function (resolve, reject) {
      bcrypt.hash(model.attributes.password, null, null, function (err, hash) {
        if (err) { reject(err); }
        console.log('hash ', hash);
        model.set('password', hash);
        resolve(hash);
      });
    });
    // .then(function(hash) {
    //   model.set('password', hash);
    // })
    // .catch(function(err) {
    //   console.log('database error: ', err);
    // });
  }
});

module.exports = User;