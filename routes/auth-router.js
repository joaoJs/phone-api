const express  = require('express');
const bcrypt   = require('bcrypt');
const passport = require('passport');

const UserModel = require('../models/user0model');

const router = express.Router();

router.post('/process-signup', (req,res,next) => {
  if (!req.body.signupFullName ||
      !req.body.signupUsername ||
      !req.body.signupPassword) {
    res.status(400).json({errorMessage: "We need both username and password."});
    return;
  }

  UserModel.findOne(
    {username: req.body.signupUsername},
    (err, user) => {
      if (err) {
        res.status(500).json({errorMessage: 'Error finding username.'});
        return;
      }

      if (user) {
        res.status(400).json({errorMessage: 'Username was taken.'});
        return;
      }

      const salt     = bcrypt.genSaltSync(10);
      const hashPass = bcrypt.hashSync(req.body.signupPassword, salt);

      const theUser  = new UserModel ({
        fullName: req.body.signupFullName,
        username: req.body.signupUsername,
        encryptedPassword: hashPass
      });

      theUser.save((err) => {
        if (err) {
          res.status(500).json({ errorMessage: 'Error saving user.'});
          return;
        }

        // "req.login" is a Passport method
        req.login(theUser, (err) => {
          if (err) {
            console.log('User auto-login error', err);
            res.status(500).json({errorMessage: 'Error logging in user'});
            return;
          }
        });

        theUser.encryptedPassword = undefined;
        res.status(200).json(theUser);
      });
    }
  );
});

router.post('/process-login', (req,res,next) => {
  const customAuthCallback =
    passport.authenticate('local', (err, user, extraInfo) => {
      if (err) {
      res.status(500).json({ errorMessage: 'Login failed.'});
      return;
    }

      if (!user) {
        res.status(401).json({errorMessage: extraInfo.message});
        return;
      }

      req.login(user, (err) => {
        if (err) {
          res.status(500).json({errorMessage: 'Login Failed'});
          return;
        }

        user.encryptedPassword = undefined;
        res.status(200).json(user);
      });
    }); // passport.authenticate('local')

    customAuthCallback(req,res,next);
}); // POST /api/process-login

router.delete('/logout', (req,res,next) => {
  // "req.logout" is a Passport function
  req.logout();
  res.status(200).json( { successMessage: 'Log out success!'});
});

router.get('/checklogin', (req,res,next) => {
  let amILoggedIn = false;
  if (req.user) {
    req.user.encryptedPassword = undefined;
    amILoggedIn = true;
  }

  res.status(200).json({
    isLoggedIn: amILoggedIn,
    userInfo: req.user
  });
});


module.exports = router;
