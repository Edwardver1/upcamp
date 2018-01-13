var mongoose = require("mongoose");

var priceSchema = new mongoose.Schema({
    season : String,
    price: Number,
    campground: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campground' 
    }
});

module.exports = mongoose.model("Price", priceSchema);