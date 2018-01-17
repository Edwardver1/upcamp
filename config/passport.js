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
    User.findOne({email: profile.emails[0].value},function(err,foundUser){
        if (!err && foundUser){
            return done(null,foundUser,{ message: 'Nice to see you again ' + foundUser.username + " !" });
        }
        var user = ({
            email: profile.emails[0].value, 
            username: profile.emails[0].value.substring(0, profile.emails[0].value.lastIndexOf("@")),
            isEnabled: true
        });
        var password = crypto.randomBytes(4).toString('hex');
        User.register(user,password, function(err,newUser) {
        if (err) throw err;
            User.findByIdAndUpdate(newUser._id,{ $set: { isAuthenticated: true }}, { new: true }, function(err,updatedUser){
                if (!err){
                    var authenticationURL = process.env.HOSTNAME + "/verify?authToken=" + newUser.authToken;
                      var msg = {
                          to: newUser.email,
                          from: "upcampinc@gmail.com",
                          subject: "Welcome to UpCamp! ",
                          html: "<p>Thanks for joining UpCamp.</p> " +
                                "<p>Please notice your default password: <strong>" + password + "</strong><p>" +
                                "<p>If you did not request this, please ignore this email.</p>"
                      };
                    sgMail.send(msg,function(err){
                        if(!err) return done(null, updatedUser, { message: 'Welcome to Upcamp!' });
                    });
                } 
            });
        });
    });
  }
));


