var mongoose                   = require("mongoose"),
    passportLocalMongooseEmail = require("passport-local-mongoose-email");


var User = new mongoose.Schema({
   
  email: {type:String, unique: true, required: true},
  username: {type:String, unique: true},
  password: String,
  avatar: {type:String, default: "https://res.cloudinary.com/upcampinc/image/upload/v1516263995/profile_rodvmi.png"},
  authToken: String,
  isAuthenticated: {type:Boolean, default: false},
  isEnabled: {type:Boolean, default: true},
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isAdmin: {type: Boolean, default: false}
   
});

User.plugin(passportLocalMongooseEmail,{
  usernameField: "email",
  incorrectUsernameError: "Incorrect email",
  userExistsError: "User already exists with email %s"
});


module.exports = mongoose.model("User", User);