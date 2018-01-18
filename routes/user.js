var express = require("express"),
    router  = express.Router(),
    middleware = require("../middleware"),
    User = require("../models/user"),
    multer = require('multer');
    
var { isLoggedIn } = middleware; // destructuring assignment

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
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'upcampinc', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

router.get("/:id", isLoggedIn,  function(req,res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        }
        res.render("./users/settings",{user: foundUser});
    });
        // res.render("./users/settings");
})

router.put("/:id/uploadImage", isLoggedIn, upload.single('avatar'), function(req,res){
    cloudinary.uploader.upload(req.file.path, function(result) {
        req.body.avatar = result.secure_url;
        User.findByIdAndUpdate(req.params.id, {$set: {'avatar' : req.body.avatar }}, {new: true}, function(err, updatedUser){
            if(err){
                req.flash("error", err.message);
                res.redirect("/campgrounds");
            }
            res.redirect("/settings/"+updatedUser._id);
        });
    });
})


module.exports = router;