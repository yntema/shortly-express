var request = require('request');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');


exports.getUrlTitle = function(url, cb) {
  request(url, function(err, res, html) {
    if (err) {
      console.log('Error reading url heading: ', err);
      return cb(err);
    } else {
      var tag = /<title>(.*)<\/title>/;
      var match = html.match(tag);
      var title = match ? match[1] : url;
      return cb(err, title);
    }
  });
};

var rValidUrl = /^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i;

exports.isValidUrl = function(url) {
  return url.match(rValidUrl);
};

exports.checkSession = function(req, res, pageOrCallback) {
  if (req.session.username) {
    if (typeof pageOrCallback === 'string') {
      res.render(pageOrCallback);
    } else {
      pageOrCallback(req, res);
    }
  } else {
    res.render('login');
  }
};

/************************************************************/
// Add additional utility functions below
/************************************************************/

// exports.makeHashPromise = function(password) {
//   return new Promise(function (resolve, reject) {
//     bcrypt.hash(password, null, null, function (err, hash) {
//       if (err) { reject(err); }
//       resolve(hash);
//     });
//   });
// };

exports.compareAsync = Promise.promisify(bcrypt.compare);