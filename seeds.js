var mongoose = require("mongoose");
var User = require("./models/user");


function seedDB(){
    var user = new User({
        email: 'admin@gmail.com',
        username: 'admin',
        isEnabled: true,
        isAdmin: true,
        avatar: 'https://res.cloudinary.com/upcampinc/image/upload/v1516263995/profile_rodvmi.png'
    });
    User.remove({email: 'admin@gmail.com'},function(err){
        if(err){
            console.log(err);
        } else {
            User.register(user, 'admin',function(err,admin){
            if(err){
                console.log(err);
            } else {
                User.findByIdAndUpdate(admin._id, {$set: {isAuthenticated: true}}, { new: true }, function(err,updatedAdmin){
                  if(err){
                      console.log(err);
                  } else {
                      console.log(updatedAdmin);
                  }
                })
            }
    })
        }
    })
};

module.exports = seedDB;