var express = require("express"),
    router  = express.Router(),
    middleware = require("../middleware"),
    Campground = require("../models/campground");
    
var { isLoggedIn } = middleware; // destructuring assignment
    
//INDEX
router.get("/",function(req,res){
    Campground.find({},function(err,allCampgrounds){
        if(!err || allCampgrounds){
            res.render("campgrounds/index" , {allCampgrounds: allCampgrounds, page: "index"});      
        }
    })
});

//NEW FORM
router.get("/new", isLoggedIn, function(req,res){
  res.render("campgrounds/new"); 
});

//CREATE NEW
router.post("/", isLoggedIn, function(req,res){
     // get data from form and add to campgrounds array
  var author = {
      id: req.user._id,
      username: req.user.username || req.user.email
  }
  var newCampground = {name: req.body.name, image: req.body.image, description: req.body.description, author: author, cost: req.body.cost};
  Campground.create(newCampground,function(err,newlyCampground){
      if(err){
          req.flash("error",err.message);
          res.redirect("/campgrounds");
      } else {
          res.redirect("/campgrounds");
      }
  });
    
});

//SHOW
router.get("/:id", isLoggedIn, function(req, res) {
    Campground.findById(req.params.id,function(err,foundCampground){
       if(err || !foundCampground){
           req.flash("error", "Sorry, campground doesn't exist");
           res.redirect("/campgrounds");
       } else {
           res.render("campgrounds/show", {campground: foundCampground});    
       }
    });
});

//EDIT FORM
router.get("/:id/edit", isLoggedIn, function(req,res){
   Campground.findById(req.params.id,function(err,foundCampground){
       if ( err || !foundCampground){
           req.flash("error", "Sorry, campground doesn't exist");
           res.redirect("/campgrounds");
       } else {
           res.render("campgrounds/edit",{campground : foundCampground});
       }
   }); 
});

//UPDATE 
router.put("/:id", isLoggedIn, function(req,res){
   var newData = {name: req.body.name, image: req.body.image, description: req.body.description, cost: req.body.cost, createdAt: Date.now()};
   Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err,updatedCampground){
       if(err){
           req.flash("error", err.message);
           res.redirect("back");
       } else {
           res.render("campgrounds/show", {campground: updatedCampground});
       }
   }); 
});

//DELETE
router.delete("/:id", isLoggedIn, function(req,res){
    Campground.findByIdAndRemove(req.params.id,function(err){
        if(err){
            req.flash('error', err.message);
            return res.redirect('/camgrounds');
        }
        req.flash('error', 'Campground deleted!');
        res.redirect('/campgrounds');
    })
})


module.exports = router;