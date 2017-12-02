require('dotenv').config();

var express        = require("express"),
    app            = express(),
    port           = process.env.PORT || 3000,
    bodyParser     = require("body-parser"),
    mongoose       = require("mongoose"),
    flash          = require("connect-flash"),
    passport       = require("passport"),
    methodOverride = require("method-override"),
    User           = require("./models/user");
    

var indexRoutes = require("./routes/index");
var authRoutes = require("./routes/auth");
var campgroundRoutes = require("./routes/campgrounds");

mongoose.connect("mongodb://localhost/upCamp",{useMongoClient: true});
mongoose.Promise = global.Promise;
require("./config/passport");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());


//Auth config
app.use(require("express-session")({
    secret:"superSecretDeliveryCode",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());


app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/",indexRoutes);
app.use("/",authRoutes);
app.use("/campgrounds", campgroundRoutes);



app.listen(port, () => { console.log("Server started... ")
});