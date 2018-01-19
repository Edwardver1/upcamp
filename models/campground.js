var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
   name: String,
   images: [String],
   description: String,
   location: String,
   lat: String,
   lng: String,
   adminEdited: {type: Boolean, default: false},
   createdAt: {type: Date, default: Date.now()},
   costs: [ 
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Price'
      }
   ],
   author: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User' 
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

module.exports = mongoose.model("Campground",campgroundSchema);