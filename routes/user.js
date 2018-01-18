var express = require("express"),
    router  = express.Router(),
    middleware = require("../middleware"),
    User = require("../models/user");
    
var { isLoggedIn } = middleware; // destructuring assignment

router.get("/:id",  function(req,res){
    // User.findById(req.params.id, function(err, foundUser){
    //     if(err){
    //         req.flash("error", err.message);
    //         res.redirect("/campgrounds");
    //     }
    //     res.render("./users/settings",{user: foundUser});
    // })
        res.render("./users/settings");
})



module.exports = router;