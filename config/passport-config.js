const passport      = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt        = require('bcrypt');

const UserModel =  require('../models/user0model');


// serializeUser: what to save in the session after logging in
passport.serializeUser((user, done) => {
  done(null, user.id);
});

//deserializeUser: what will become "req.user" on every request
passport.deserializeUser((id, done) => {
  UserMode.findById(
    id, (err, user) => {
      if (err) {
        done(err);
        return;
      }

      done(null, user);
    }
  );
});

//local strategy from passport-local
// log in with username and password

passport.use(
  new LocalStrategy(
    {
      usernameField: 'loginUsername',
      passwordField: 'loginPassword'
    },

    (sentUsername, sentPassword, done) => {
      UserModel.findOne(
        { username: sentUsername },
        ( err, user ) => {
          if (err) {
            done(err);
            return;
          }

          if (!user) {
            // false means login failed
            done(null, false, {message: 'Bad Username'});
            return;
          }

          const isPasswordGood =
            bcrypt.compareSync(sentPassword, user.encryptedPassword);

          if (!isPasswordGood) {
            donw(null, false, { message: 'Bad Password. '});
            return;
          }

          // if we get here log in was successful!
          // user is the logged in user
          done(null, user);
        }
      );
    }
  ) // new LocalStrategy()
);
