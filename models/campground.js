var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
   name: String,
   images: [String],
   description: String,
   location: String,
   lat: String,
   lng: String,
   createdAt: {type: Date, default: Date.now()},
   cost: [ 
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Price'
      }
   ],
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User' 
      },
      username: String
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

module.exports = mongoose.model("Campground",campgroundSchema);