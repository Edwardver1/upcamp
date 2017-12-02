var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
   name: String,
   image: String,
   description: String,
   cost: Number,
   createdAt: {type: Date, default: Date.now()},
   author: {
       id: {
           type: mongoose.Schema.Types.ObjectId,
           ref: 'User' 
       },
       username: String
   }
});

module.exports = mongoose.model("Campground",campgroundSchema);