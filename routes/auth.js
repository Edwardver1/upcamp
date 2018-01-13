var express  = require("express"),
    router   = express.Router(),
    middleware = require("../middleware"),
    passport = require("passport"),
    User     = require("../models/user"),
    sgMail   = require("@sendgrid/mail"),
    async   = require("async"),
    crypto = require("crypto"),
    emailExist = require("../config/passport");
    
var { isEnabled, isAdmin } = middleware; // destructuring assignment
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//Register logic
router.get("/register", function(req,res){
    res.render("auth/register");
});

router.post("/register",function(req,res){
    var user = new User({
      email: req.body.email, 
      username: req.body.email.substring(0, req.body.email.lastIndexOf("@")) 
    });
    User.register(user,req.body.password,function(err,newUser){
      if(err){
          req.flash("error", err.message);
          return res.redirect("/register");
      }
      var authenticationURL = process.env.HOSTNAME + "/verify?authToken=" + newUser.authToken;
      var msg = {
          to: newUser.email,
          from: "upcampinc@gmail.com",
          subject: "Welcome to UpCamp! ",
          text: "Thanks for joining UpCamp. You're almost ready to start. \n\n" +
                "Please click on the following link, or paste this into your browser to complete the registration process:\n\n" +
                 authenticationURL + "\n\n" +
                "If you did not request this, please ignore this email.\n"
       
      };
      
    sgMail.send(msg, function(err){
        if(err){
            req.flash("error", "Error, sending you e-mail.");
            return res.redirect("/campgrounds");
        } else{
            req.flash("success", "Email verification sent!");
            res.redirect("/campgrounds");
        }
    });
   
        
    });
});

router.get("/verify", function(req, res) {
  User.verifyEmail(req.query.authToken, function(err, existingAuthToken) {
    if(err){
      req.flash("error","Oops, can't verify your email.");
      res.redirect("/campgrounds");
    } 
    req.flash("success", "Email verified successfully");
    res.redirect("/campgrounds");
  });
});

// Facebook logic
router.get('/login/facebook', passport.authenticate('facebook', { scope : ['email']  }));

router.get('/login/facebook/callback',
	passport.authenticate('facebook', {
		successRedirect : '/campgrounds',
		failureRedirect : '/register',
		failureFlash: "User already exists with such email",
    successFlash: "Email verification sent!"
	}));



//Login logic
router.get("/login",function(req, res) {
    res.render("auth/login");
});

router.post("/login", isEnabled,
    passport.authenticate("local",
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login",
        failureFlash: true,
        successFlash: true
    }) , 
    function(req,res){
});


//Logout 
router.get("/logout",function(req,res){
    req.flash("success", "You are logged out.");
    req.logout();
    res.redirect("/campgrounds");
});

//Forgot password
router.get("/forgot", function(req, res) {
  res.render("auth/forgot");
});

router.post("/forgot", function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString("hex");
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if ( err || !user) {
          req.flash("error", "No account found with such email address.Please try again");
          return res.redirect("/forgot");
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 1800000; // 30min

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
    var resetURL = process.env.HOSTNAME + "/reset/" + token;
     var msg = {
          to: user.email,
          from: "upcampinc@gmail.com",
          subject: "Password reset",
          text: "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
          "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
           resetURL + "\n\n" +
          "If you did not request this, please ignore this email and your password will remain unchanged.\n"
       
      };
      
    sgMail.send(msg, function(err,json){
        if(err){
            req.flash("error", "Error, sending you e-mail.");
            return res.redirect("/forgot");
        } else{
            req.flash("success", "An e-mail has been sent to " + user.email + " with further instructions.");
            done(err, "done");
        }
    });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect("/forgot");
  });
});

router.get("/reset/:token", function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (err || !user) {
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("/forgot");
    }
    res.render("auth/reset", {token: req.params.token});
  });
});

router.post("/reset/:token", function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (err || !user) {
          req.flash("error", "Password reset token is invalid or has expired.");
          return res.redirect("back");
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            if(err){
              req.flash("error","Can't set password");
              return res.redirect("back");
            }
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            user.isAuthenticated = true;

            user.save(function(err) {
              if(err){
                req.flash("error","Error, trying to save the password");
                return res.redirect("back");
              }
              req.flash("success","Password has been changed successfully.")
              return res.redirect("/login");
            });
          });
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect("back");
        }
      });
    },
    function(user, done) {
     var msg = {
          to: user.email,
          from: "upcampinc@gmail.com",
          subject: "Your password has been changed",
          text: "Hello," + (user.name ? user.name : '') + "\n\n" +
          "This is a confirmation that the password for your account " + user.email + " has just been changed.\n"
       
      };
      
    sgMail.send(msg, function(err,json){
        if(err){
            req.flash("error", "Error, sending you e-mail.");
            return res.redirect("/forgot");
        } else{
            req.flash("success", "Success! Your password has been changed.");
            done(err, "done");
        }
    });
    }
  ], function(err) {
    if(err){
      req.flash("error", err.message);
      return res.redirect("/forgot");
    }
    res.redirect("/campgrounds");
  });
});


module.exports = router;