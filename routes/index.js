var express = require('express');
var router = express.Router();
let mid = require('../middleware');
let User = require('../models/user');

// GET /logout
router.get('/logout', function(req, res, next) {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }

        });
    }

});
// GET /profile

router.get('/profile', mid.requiresLogin, (req, res, next) => {

    User.findById(req.session.userId)
        .exec((error, user) => {
            if (error) {
                return next(error);
            } else {
                return res.render('profile', { title: 'Profile', name: user.name, favorite: user.favoriteBook });
            }
        });
});
// GET /login
router.get('/login', mid.loggedOut, function(req, res, next) {
    return res.render('login', { title: 'Log In' });
});
// GET /login
router.post('/login', function(req, res, next) {
    if (req.body.email && req.body.password) {

        User.authenticate(req.body.email, req.body.password, (error, user) => {
            if (error || !user) {
                let err = new Error('Wrong email or password.');
                err.status = 401;
                return next(err);
            } else {
                req.session.userId = user._id;
                return res.redirect('/profile');
            }
        });




    } else {
        let err = new Error('Email and password required');
        err.status = 401;
        return next(err);
    }

});
// GET /register
router.get('/register', mid.loggedOut, function(req, res, next) {
    return res.render('register', { title: 'Sign Up' });
});

// POST /register
router.post('/register', function(req, res, next) {
    if (req.body.email &&
        req.body.name &&
        req.body.favoriteBook &&
        req.body.password &&
        req.body.confirmPassword) {
        if (req.body.password != req.body.confirmPassword) {
            let err = new Error('Passwords do not match.');
            err.status = 400;

        } else {
            let userData = new User({
                email: req.body.email,
                name: req.body.name,
                favoriteBook: req.body.favoriteBook,
                password: req.body.password
            });

            // userData.save((err, createdUserDataObject) => {
            //     return next(err);
            // });

            User.create(userData, (error, user) => {
                if (error) {
                    return next(error);

                } else {
                    req.session.userId = user._id;
                    return res.redirect('/profile');
                }
            });

        }
    } else {
        let err = new Error('All fields required');
        err.status = 400;

    }

});

// GET /
router.get('/', function(req, res, next) {
    return res.render('index', { title: 'Home' });
});

// GET /about
router.get('/about', function(req, res, next) {
    return res.render('about', { title: 'About' });
});

// GET /contact
router.get('/contact', function(req, res, next) {
    return res.render('contact', { title: 'Contact' });
});

module.exports = router;