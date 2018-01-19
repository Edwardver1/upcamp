var express = require("express"),
    router  = express.Router(),
    middleware = require("../middleware"),
    Campground = require("../models/campground"),
    Price = require("../models/price"),
    Promise = require("bluebird"),
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
        req.body.campground.author = req.user;
        req.body.campground.description = req.sanitize(req.body.campground.description);
        Campground.create(req.body.campground, function(err, campground) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }else {
                //if 1
                if(typeof req.body.price.season === 'string'){
                    var price = {season: req.body.price.season, price: req.body.price.cost, campground: campground};
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
                // if > 1
                if(Array.isArray(req.body.price.season)){
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
                }
                res.redirect('/campgrounds/' + campground._id);
             }
        });
    });
});

//SHOW
router.get("/:id", function(req, res) {
    //find the campground with provided ID
    Campground.findById(req.params.id)
    .populate({
        path: 'comments',
        populate: { path: 'author' }
        
    }).populate("costs")
    .populate("author") 
    .exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash('error', 'Sorry, that campground does not exist!');
            return res.redirect('/campgrounds');
        }
        res.render("campgrounds/show", {campground: foundCampground});
    });
});

//EDIT FORM
router.get("/:id/edit", isLoggedIn, checkUserCampground, function(req,res){
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
router.put("/:id", isLoggedIn, checkUserCampground, function(req,res){
    geocoder.geocode(req.body.campground.location, function (err, data) {
        if (err || data.status === 'ZERO_RESULTS') {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        if(data.results[0]){
            req.flash("success","Successfully Updated!");
            req.body.campground.lat = data.results[0].geometry.location.lat;
            req.body.campground.lng = data.results[0].geometry.location.lng;
            req.body.campground.location = data.results[0].formatted_address;
        }else{
            req.flash("error","Something went wrong! Try change location again");
        }
        if(req.user.isAdmin === true){
            req.body.campground.adminEdited = true;
        } else {
            req.body.campground.adminEdited = false;
        }
        req.body.campground.createdAt = Date.now();
        req.body.campground.images = [];
        req.body.campground.images = req.body.campground.images.concat(req.body.urls);
        req.body.campground.description = req.sanitize(req.body.campground.description);
        Campground.findByIdAndUpdate(req.params.id, {$set: req.body.campground}, function(err,updatedCampground){
            if(err){
                req.flash("error", err.message);
                return res.redirect("back");
            } else {
                //updating exists costs
                // if 1
                if( typeof req.body.price._id === 'string' && typeof req.body.price.season === 'string'){
                 Price.findByIdAndUpdate(req.body.price._id, {$set: {season: req.body.price.season, price: req.body.price.cost}}, function(err,updatedPrice){
                        if(err){
                            console.log(err);
                        } else {
                            console.log('updated');
                            
                        }  
                    })
                }
                // if exists > 1 cost
                if(Array.isArray(req.body.price._id) && req.body.price._id.length > 1 ){
                    for(var i = 0; i < req.body.price._id.length; i++){
                        var price = {season: req.body.price.season[i], price: req.body.price.cost[i]};
                        Price.findByIdAndUpdate(req.body.price._id[i], {$set: price}, function(err,updatedPrice){
                            if(err){
                                console.log(err);
                            } else {
                                console.log('updated');
                                
                            }  
                        })
                    }
                }
                //creating new cost
                if(req.body.price.new){
                    // if camp has 1 or > 1 costs
                  var start = typeof req.body.price._id === 'string' ? 1 : req.body.price._id.length;
                  for(var i = start; i < req.body.price.season.length; i++ ){
                     var newPrice = {season: req.body.price.season[i], price: req.body.price.cost[i], campground: updatedCampground};
                     Price.create(newPrice,function(err,createdPrice){
                            if(!err){
                                Campground.findById(updatedCampground._id,function(err, foundCampground) {
                                    if(!err && foundCampground){
                                        foundCampground.costs.push(createdPrice);
                                        foundCampground.save();
                                    }
                                })
                            }
                        })
                  }   
                }
                res.redirect("/campgrounds/" + updatedCampground._id);
            } 
        });
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
