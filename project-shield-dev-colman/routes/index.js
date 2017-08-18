var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'SHIELD' });
});

/* GET calendar page. */
router.get('/calendar', function(req, res, next) {
  res.render('calendar', { title: 'SHIELD calendar' });
});

router.get('/chat', function(req, res, next) {
  res.render('chat', { title: 'SHIELD chat' });
});

router.get('/chatAll', function(req, res, next) {
  res.render('chatAll', { title: 'SHIELD chat ver2' });
});

router.get('/tag', function(req, res, next) {
  res.render('tag', { title: 'SHIELD tag' });
});
router.get('/history', function(req, res, next) {
  res.render('history', { title: 'SHIELD history' });
});

//authentication
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});
router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'Register' });
});

router.get('/ticket', function(req, res, next) {
  res.render('ticket', { title: 'SHIELD support' });
});

router.get('/tform', function(req, res, next) {
  res.render('ticketForm', { title: 'SHIELD Form' });
});

router.get('/message_overview', function(req, res, next) {
  res.render('message_overview', { title: 'SHIELD message' });
});
router.get('/profile', function(req, res, next) {
  res.render('profile', { title: 'Profile' });
});


module.exports = router;
