var express = require("express"),
    router  = express.Router(),
    middleware = require("../middleware"),
    Campground = require("../models/campground"),
    Promise = require('bluebird'),
    multer = require('multer'),
    geocoder = require('geocoder');
    
var { isLoggedIn, checkUserCampground, isAdmin } = middleware; // destructuring assignment

//Image upload conf
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});
var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'upcampinc', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
router.post("/", isLoggedIn, upload.array('images'), function(req,res){
    geocoder.geocode(req.body.campground.location, function (err, data) {
        if (err || data.status === 'ZERO_RESULTS') {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        req.body.campground.lat = data.results[0].geometry.location.lat;
        req.body.campground.lng = data.results[0].geometry.location.lng;
        req.body.campground.location = data.results[0].formatted_address;
        var promises = [];
        req.files.forEach(function(file){
            promises.push(
                cloudinary.uploader.upload(file.path, function(result) {
                    return result;
                })  
            )
        });
        Promise.all(promises).then(function(results){
            req.body.campground.images = [];
            for(var i = 0; i < results.length; i++){
                req.body.campground.images.push(results[i].secure_url)
            };
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
              }
            res.redirect('/campgrounds/' + campground.id);
            });
        });
    });
});

//SHOW
router.get("/:id", function(req, res) {
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash('error', 'Sorry, that campground does not exist!');
            return res.redirect('/campgrounds');
        }

        res.render("campgrounds/show", {campground: foundCampground});
    });
});

//EDIT FORM
router.get("/:id/edit", isLoggedIn, checkUserCampground, function(req,res){
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
router.put("/:id", isLoggedIn, checkUserCampground, upload.array('images'),  function(req,res){
    geocoder.geocode(req.body.campground.location, function (err, data) {
        if (err || data.status === 'ZERO_RESULTS') {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        req.body.campground.lat = data.results[0].geometry.location.lat;
        req.body.campground.lng = data.results[0].geometry.location.lng;
        req.body.campground.location = data.results[0].formatted_address;
        req.body.campground.images = [];
        req.body.campground.images = req.body.campground.images.concat(req.body.urls);
        var promises = [];
        req.files.forEach(function(file){
            promises.push(
                cloudinary.uploader.upload(file.path, function(result) {
                    return result;
                })  
            )
        });   
        Promise.all(promises).then(function(results){
            for(var i = 0; i < results.length; i++){
                req.body.campground.images.push(results[i].secure_url)
            };
            req.body.campground.description = req.sanitize(req.body.campground.description);
            Campground.findByIdAndUpdate(req.params.id, {$set: req.body.campground}, function(err,updatedCampground){
                if(err){
                    req.flash("error", err.message);
                    return res.redirect("back");
                } 
                req.flash("success","Successfully Updated!");
                res.redirect("/campgrounds/" + updatedCampground._id);
                  
            });
        });
    });
    
});

//DELETE
router.delete("/:id", isLoggedIn, checkUserCampground,  function(req,res){
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