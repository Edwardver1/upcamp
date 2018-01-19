var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
    text : String,
    createdAt: {type: Date, default: Date.now()},
    adminEdited: {type: Boolean, default: false},
    // author: {
    //     id: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'User' 
    //     },
    //     username: String,
    //     avatar: String
    // }
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    }
});

module.exports = mongoose.model("Comment", commentSchema);