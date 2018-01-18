var express = require("express"),
    router  = express.Router(),
    middleware = require("../middleware"),
    User = require("../models/user"),
    multer = require('multer'),
    Promise   = require("bluebird");
    
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

router.get("/:id", isLoggedIn, function(req,res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        }
        res.render("./users/settings",{user: foundUser});
    });
})

router.put("/:id", isLoggedIn, upload.single('avatar'), function(req,res){
    var promises = [];
    if(req.file){
    promises.push(
        cloudinary.uploader.upload(req.file.path, function(result) {
            return result;
        })
    )
    }
    Promise.all(promises).then(function(results){
        User.findById(req.params.id, function(err, foundUser){
            if(!err && foundUser){
                foundUser.username = req.body.username;
                // check new image provided
                if(results.length > 0){
                    foundUser.avatar = results[0].secure_url;
                }
                // check password provided
                if (req.body.password.length === 0 || req.body.password.trim()){
                    foundUser.setPassword(req.body.password, function(err){
                        if(!err){
                            foundUser.isAuthenticated = true;
                            foundUser.save(function(err){
                                if(err){
                                    req.flash('error', err.message);
                                    return res.redirect("/settings/"+foundUser._id);
                                } else {
                                    req.flash('success', 'Account successfully updated!');
                                    return res.redirect("/settings/"+foundUser._id);
                                }
                            });
                        };
                    });
                };
                foundUser.save(function(err){
                    if(err){
                        req.flash('error', err.message);
                        return res.redirect("/settings/"+foundUser._id);
                    } else {
                        req.flash('success', 'Account successfully updated!');
                        return res.redirect("/settings/"+foundUser._id);
                    }
                });
            }
        })
    });
});


module.exports = router;