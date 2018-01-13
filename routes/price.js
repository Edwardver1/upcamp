const express = require("express");
const router  = express.Router({mergeParams: true});
const Price = require("../models/price");
const middleware = require("../middleware");
const { isLoggedIn } = middleware;

//DELETE
router.delete("/:priceId", function(req,res){
    Price.findByIdAndRemove(req.params.priceId, function(err,price){
        if(err){
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        } else {
            res.json(price);
        }
    })
});



module.exports = router;