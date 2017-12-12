var express = require("express"),
    router  = express.Router(),
    middleware = require("../middleware"),
    User = require("../models/user");
    
var { isLoggedIn, isAdmin } = middleware; // destructuring assignment

//Show users
router.get("/",isLoggedIn, isAdmin,function(req,res){
    User.find({}, function(err,allUsers){
      if (err) {
          req.flash("error", err.message);
          req.redirect("/campgrounds");
      } else {
          res.render("admin/users", {allUsers: allUsers});
      }
    })
});

//Update
router.put("/:id",isLoggedIn, isAdmin,  function(req, res){
  User.findByIdAndUpdate(req.params.id, req.body.user, {new: true}, function(err, user){
      if(err){
          console.log(err);
          res.redirect("/admin/user");
      } else {
          res.json(user);
      }
  }); 
});

//Delete
router.delete("/:id",isLoggedIn, isAdmin, function(req,res){
    User.findByIdAndRemove(req.params.id, function(err,user){
        if(err){
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        } else {
            res.json(user);
        }
    })
});

module.exports = router;