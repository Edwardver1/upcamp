const express = require("express");
const router  = express.Router({mergeParams: true});
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middleware = require("../middleware");
const { isLoggedIn } = middleware;

//Comments New
router.get("/new", isLoggedIn, function(req, res){
    // find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
             res.render("comments/new", {campground: campground});
        }
    })
});

//Comments Create
router.post("/", isLoggedIn, function(req, res){
   //lookup campground using ID
   Campground.findById(req.params.id, function(err, campground){
       if(err){
           req.flash("error", err.message);
           res.redirect("/campgrounds");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               res.render("/new",{campground: campground});
           } else {
               //add username and id to comment
            //   comment.author.id = req.user._id;
            //   comment.author.username = req.user.username;
            //   comment.author.avatar = req.user.avatar;
                comment.author = req.user;
               //save comment
               comment.save();
               campground.comments.push(comment);
               campground.save();
               res.json(comment);
           }
        });
       }
   });
});

router.get("/:commentId/edit", isLoggedIn,  function(req, res){
  res.render("comments/edit", {campground_id: req.params.id, comment: req.comment});
});

router.put("/:commentId",  function(req, res){
   req.body.comment.createdAt = Date.now();
    if(req.user.isAdmin === true){
        req.body.comment.adminEdited = true;
    } else {
        req.body.comment.adminEdited = false;
    }
   Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, {new: true}, function(err, comment){
       if(err){
          console.log(err);
           res.render("edit");
       } else {
             res.json(comment);
       }
   }); 
});

//DELETE
router.delete("/:commentId", function(req,res){
    Comment.findByIdAndRemove(req.params.commentId, function(err,comment){
        if(err){
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        } else {
            res.json(comment);
        }
    })
});



module.exports = router;