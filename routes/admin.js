var express = require("express"),
    router  = express.Router(),
    middleware = require("../middleware"),
    User = require("../models/user");
    
var { isLoggedIn, isAdmin } = middleware; // destructuring assignment

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//Show users
router.get("/",isLoggedIn, isAdmin, function(req,res){
    if(req.query.search && req.xhr) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        User.find({ username : regex }, function(err, allUsers){
          if(err){
            console.log(err);
          } else {
            res.status(200).json(allUsers);
          }
        });
    } else {
        User.find({},function(err,allUsers){
            if(!err || allUsers){
                if(req.xhr){
                    res.json(allUsers);
                } else{
                    res.render("admin/users" , {allUsers: allUsers, page: "users"});         
                }
            }
        })
    }
});

//Update
router.put("/:id",isLoggedIn, isAdmin, function(req, res){
    
  User.findByIdAndUpdate(req.params.id, req.body.user, {new: true}, function(err, user){
      if(err){
          console.log(err);
          res.redirect("/admin/users");
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