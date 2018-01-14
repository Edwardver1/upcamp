var Campground = require('../models/campground');
var User = require('../models/user');
module.exports = {
  isLoggedIn: function(req, res, next){
      if(req.isAuthenticated()){
          return next();
      }
      req.flash('error', 'You must be signed in to do that!');
      res.redirect('/login');
  },
  checkUserCampground: function(req, res, next){
    Campground.findById(req.params.id, function(err, foundCampground){
      if(err || !foundCampground){
          console.log(err);
          req.flash('error', 'Sorry, that campground does not exist!');
          res.redirect('/campgrounds');
      } else if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
          req.campground = foundCampground;
          next();
      } else {
          req.flash('error', 'You don\'t have permission to do that!');
          res.redirect('/campgrounds/' + req.params.id);
      }
    });
  },
  isAdmin: function(req,res,next){
    if(req.user.isAdmin){
      next()
    } else {
      req.flash('error', 'You don\'t have permissions to do that');
      res.redirect('back');
    }
  },
  isEnabled: function(req,res,next){
    User.find({email: req.body.email},function(err,foundUser){
      if(err || foundUser[0] == null){
        req.flash('error', 'Oops, no user with such email exists!');
        res.redirect('/campgrounds');
      } else {
        if(foundUser[0].isEnabled === false){
          req.flash('error', 'Oops, you have been blocked!');
          res.redirect('/campgrounds');
        } else {
          next()
        }
      }
    })
  }
}