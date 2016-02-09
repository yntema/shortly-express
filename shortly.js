var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var sessions = require('express-session');


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + '/public'));

// possible cookie/sessions stuff
// app.use(express.cookieParser());
app.use(sessions({
  secret: '123456789QWERTY'
}));


app.get('/', function(req, res) {
  util.checkSession(req, res, 'index');
});


app.get('/create', function(req, res) {
  util.checkSession(req, res, 'index');
});

app.get('/links', function(req, res) {
  util.checkSession(req, res,
    function(req, res) {
      Links.reset().fetch().then(function(links) {
        res.send(200, links.models);
      });
    });
});

app.post('/links', function(req, res) {
  util.checkSession(req, res,
    function(req, res) {
      var uri = req.body.url;

      if (!util.isValidUrl(uri)) {
        console.log('Not a valid url: ', uri);
        return res.send(404);
      }
      new Link({
        url: uri /* , userId: current userId */
      }).fetch().then(function(found) {

        if (found) {
          res.send(200, found.attributes);
        } else {
          util.getUrlTitle(uri, function(err, title) {
            if (err) {
              console.log('Error reading URL heading: ', err);
              return res.send(404);
            }

            Links.create({
              url: uri,
              title: title,
              baseUrl: req.headers.origin
            })
            .then(function(newLink) {
              res.send(200, newLink);
            });
          });
        }
      });
    });
});


/************************************************************/
// Write your authentication routes here
/************************************************************/
app.get('/signup', function(req, res) {
  res.render('signup');
});

app.post('/signup', function(req, res) {

  var userObject = {
    username: req.body.username,
    password: req.body.password
  };

  new User(userObject)
    .save()
    .then(function(user) {
      res.render('index');
    });
  // .then(function (hash) {
  //   console.log(hash);
  // });
});

app.get('/login', function(req, res) {
  res.render('login');
});

app.post('/login', function(req, res) {
  // make sure they aren't already logged in
  var userObject = {
    username: req.body.username,
    password: req.body.password
  };

  console.log('username object', userObject);
  // pull in usrnam, passwrd
  // reference the db
  new User({username: userObject.username})
  .fetch()
  .then(function(user) {
    return { savedPassword: user.attributes.password };
  })
  .then(function(passObject) {
    // error because makehashPromise returns a promise
    passObject.enteredPassword = util.makeHashPromise(userObject.password); 
    return passObject;
  })
  .then(function(passObject) {
    console.log('entered password: ', passObject.enteredPassword);
    console.log('saved password: ', passObject.savedPassword);
    return passObject.enteredPassword === passObject.savedPassword;
  })
  .then(function(passwordMatches) {
    console.log('passwordMatches: ', passwordMatches);
    req.session.username = userObject.username;
  })
  .catch(function(err) {
    console.log('Invalid username/password: ', err);
  });
  // if username exists
    // check password?
      // if successful
        // set session.username = username
        // redirect to index
  // else
    // redirect to login?
  res.render('index');
  // somewhere in the callback  req.session.user = req.username;
});

// function to checkUsername exists


/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({
    code: req.params[0]
  }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);