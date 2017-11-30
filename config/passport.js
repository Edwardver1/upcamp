var passport = require("passport"),
    User = require("../models/user"),
    FacebookStrategy = require("passport-facebook").Strategy,
    sgMail   = require("@sendgrid/mail"),
    crypto = require("crypto");
    
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    profileFields   : ['emails'],
    callbackURL: process.env.FACEBOOK_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
        // check user table for anyone with a facebook ID of profile.id
        User.findOne({
            'facebook.id': profile.id 
        }, function(err, user) {
            if (err) {
                return done(err);
            }
                if (user) {
                    return done(null, user); 
                } else {
                    // if email exists in db
                    User.findOne({email: profile.emails[0].value},function(err,foundUser){
                        if (!err && foundUser){
                            return done(err);
                        }
                        user = new User({email: profile.emails[0].value});
                        var password = crypto.randomBytes(4).toString('hex');
                        User.register(user,password, function(err,newUser) {
                        if (err) throw err;
                           
                            var authenticationURL = process.env.HOSTNAME + "/verify?authToken=" + newUser.authToken;
                              var msg = {
                                  to: newUser.email,
                                  from: "upcampinc@gmail.com",
                                  subject: "Welcome to UpCamp! ",
                                  html: "<p>Thanks for joining UpCamp. You're almost ready to start.</p> " +
                                        "<p>Please notice your default password: <strong>" + password + "</strong><p>" +
                                        "<p>Please click on the following link, or paste this into your browser to complete the registration process:</p>" +
                                        "<p>" + authenticationURL + "</p>" +
                                        "<p>If you did not request this, please ignore this email.</p>"
                              };
                            sgMail.send(msg,function(err){
                                if(!err) return done(null, newUser);
                            });
                        });
                    });
                }
        });
    }
));


