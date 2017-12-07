var express = require("express"),
    router  = express.Router(),
    middleware = require("../middleware"),
    Campground = require("../models/campground"),
    multer = require('multer');
    
var { isLoggedIn, checkUserCampground } = middleware; // destructuring assignment

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
    
//INDEX
router.get("/",function(req,res){
    Campground.find({},function(err,allCampgrounds){
        if(!err || allCampgrounds){
            if(req.xhr){
                res.json(allCampgrounds);
            } else{
                res.render("campgrounds/index" , {allCampgrounds: allCampgrounds, page: "index"});         
            }
        }
    })
});

//NEW FORM
router.get("/new", isLoggedIn, function(req,res){
  res.render("campgrounds/new"); 
});

//CREATE NEW
router.post("/", isLoggedIn, upload.single('image'), function(req,res){
  cloudinary.uploader.upload(req.file.path, function(result) {
      // add cloudinary url for the image to the campground object under image property
    
      req.body.campground.image = result.secure_url;
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
router.put("/:id", isLoggedIn, checkUserCampground, upload.single('image'),  function(req,res){
    if(req.file  ){
      cloudinary.uploader.upload(req.file.path, function(result) {
          // add cloudinary url for the image to the campground object under image property
          req.body.campground.image = result.secure_url;
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
    } else {
        req.body.campground.description = req.sanitize(req.body.campground.description);
        Campground.findByIdAndUpdate(req.params.id, {$set: req.body.campground}, function(err,updatedCampground){
          if(err){
              req.flash("error", err.message);
              return res.redirect("back");
          } 
          req.flash("success","Successfully Updated!");
          res.redirect("/campgrounds/" + updatedCampground._id);
          
      });
    }
    
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