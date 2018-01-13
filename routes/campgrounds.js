var express = require("express"),
    router  = express.Router(),
    middleware = require("../middleware"),
    Campground = require("../models/campground"),
    Price = require("../models/price"),
    geocoder = require('geocoder');
    
var { isLoggedIn, checkUserCampground, isAdmin } = middleware; // destructuring assignment

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
    
//INDEX
router.get("/",function(req,res){
    if(req.query.search && req.xhr) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({ name : regex }, function(err, allCampgrounds){
          if(err){
            console.log(err);
          } else {
            res.status(200).json(allCampgrounds);
          }
        });
    } else {
    Campground.find({},function(err,allCampgrounds){
        if(!err || allCampgrounds){
            if(req.xhr){
                res.json(allCampgrounds);
            } else{
                res.render("campgrounds/index" , {allCampgrounds: allCampgrounds, page: "index"});         
            }
        }
    })
    }
});


//NEW FORM
router.get("/new", isLoggedIn, function(req,res){
  res.render("campgrounds/new"); 
});

//CREATE NEW
router.post("/", isLoggedIn, function(req,res){
    geocoder.geocode(req.body.campground.location, function (err, data) {
        if (err || data.status === 'ZERO_RESULTS') {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        if(data.results[0]){
            req.body.campground.lat = data.results[0].geometry.location.lat;
            req.body.campground.lng = data.results[0].geometry.location.lng;
            req.body.campground.location = data.results[0].formatted_address;
        }else{
            req.flash("error","Something went wrong! Try update location");
        }
        req.body.campground.images = [];
        req.body.campground.images = req.body.campground.images.concat(req.body.urls);
        // add author to campground
        req.body.campground.author = {
          id: req.user._id,
          username: req.user.username
        };
        req.body.campground.description = req.sanitize(req.body.campground.description);
        Campground.create(req.body.campground, function(err, campground) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }else {
                //add season costs to camp
                for(var i = 0; i < req.body.price.season.length; i++){
                    var price = {season: req.body.price.season[i], price: req.body.price.cost[i], campground: campground};
                    Price.create(price,function(err,newPrice){
                        if(err){
                            req.flash('error', err.message);
                            res.redirect('/campgrounds/' + campground._id);
                        } else {
                            Campground.findById(campground._id,function(err, foundCampground) {
                                if(!err && foundCampground){
                                    foundCampground.costs.push(newPrice);
                                    foundCampground.save();
                                }
                            })
                        }
                    })
                }
                res.redirect('/campgrounds/' + campground._id);
             }
        });
    });
});

//SHOW
router.get("/:id", function(req, res) {
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments costs").exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash('error', 'Sorry, that campground does not exist!');
            return res.redirect('/campgrounds');
        }
        res.render("campgrounds/show", {campground: foundCampground});
    });
});

// isLoggedIn, checkUserCampground,
//EDIT FORM
router.get("/:id/edit",  function(req,res){
   Campground.findById(req.params.id).populate("costs").exec(function(err, foundCampground){
       if ( err || !foundCampground){
           req.flash("error", "Sorry, campground doesn't exist");
           res.redirect("/campgrounds");
       } else {
           res.render("campgrounds/edit",{campground : foundCampground});
       }
   }); 
});

//UPDATE 
router.put("/:id",  function(req,res){
    // geocoder.geocode(req.body.campground.location, function (err, data) {
    //     if (err || data.status === 'ZERO_RESULTS') {
    //       req.flash('error', 'Invalid address');
    //       return res.redirect('back');
    //     }
    //     if(data.results[0]){
    //         req.flash("success","Successfully Updated!");
    //         req.body.campground.lat = data.results[0].geometry.location.lat;
    //         req.body.campground.lng = data.results[0].geometry.location.lng;
    //         req.body.campground.location = data.results[0].formatted_address;
    //     }else{
    //         req.flash("error","Something went wrong! Try change location again");
    //     }
    //     req.body.campground.images = [];
    //     req.body.campground.images = req.body.campground.images.concat(req.body.urls);
    //     req.body.campground.description = req.sanitize(req.body.campground.description);
    //     Campground.findByIdAndUpdate(req.params.id, {$set: req.body.campground}, function(err,updatedCampground){
    //         if(err){
    //             req.flash("error", err.message);
    //             return res.redirect("back");
    //         } 
    //         res.redirect("/campgrounds/" + updatedCampground._id);
    //     });
    // });
    
    Campground.findByIdAndUpdate(req.params.id, {$set: req.body.campground}, function(err,updatedCampground){
        if(err){
            req.flash("error", err.message);
            return res.redirect("back");
        } else {
            console.log("outside loop");
            console.log(req.body.price);
            for(var i = 0; i < req.body.price._id.length; i++){
                console.log('in loop ' + i);
                console.log(req.body.price.length);
                var price = {season: req.body.price.season[i], price: req.body.price.cost[i]};
                Price.findByIdAndUpdate(req.body.price._id[i], {$set: price}, function(err,updatedPrice){
                    if(err){
                        console.log(err);
                    } else {
                        console.log('updated');
                        console.log(updatedPrice);
                    }  
                })
            }
            res.redirect("/campgrounds/" + updatedCampground._id);
        } 
        // res.redirect("/campgrounds/" + updatedCampground._id);
    });
    
    
});



//DELETE
router.delete("/:id", isLoggedIn, checkUserCampground, function(req,res){
    Campground.findByIdAndRemove(req.params.id,function(err){
        if(err){
            req.flash('error', err.message);
            return res.redirect('/camgrounds');
        }
        req.flash('error', 'Campground deleted!');
        res.redirect('/campgrounds');
    })
});


module.exports = router;
