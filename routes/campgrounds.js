var express = require("express"),
    router  = express.Router(),
    middleware = require("../middleware"),
    Campground = require("../models/campground");
    
var { isLoggedIn } = middleware; // destructuring assignment
    

router.get("/",function(req,res){
    Campground.find({},function(err,allCampgrounds){
        if(!err || allCampgrounds){
            res.render("campgrounds/index" , {allCampgrounds: allCampgrounds, page: "index"});      
        }
    })
});

router.get("/new", isLoggedIn, function(req,res){
  res.render("campgrounds/new"); 
});

router.post("/", isLoggedIn, function(req,res){
     // get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username || req.user.email
  }
  var cost = req.body.cost;
  var newCampground = {name: name, image: image, description: desc, author: author, cost: cost};
  Campground.create(newCampground,function(err,newlyCampground){
      if(err){
          req.flash("error",err.message);
          res.redirect("/");
      } else {
          res.redirect("/");
      }
  });
    
});

router.get("/:id", isLoggedIn, function(req, res) {
    Campground.findById(req.params.id,function(err,foundCampground){
       if(err){
           req.flash("error", "Sorry, campground doesn't exist");
           res.redirect("/");
       } else {
           res.render("campgrounds/show", {campground: foundCampground});    
       }
    });
});


module.exports = router;