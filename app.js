require('dotenv').config();

var express        = require("express"),
    app            = express(),
    port           = process.env.PORT || 3000,
    expressSanitized = require("express-sanitizer"),
    bodyParser     = require("body-parser"),
    mongoose       = require("mongoose"),
    flash          = require("connect-flash"),
    passport       = require("passport"),
    methodOverride = require("method-override"),
    User           = require("./models/user"),
    seedDB      = require("./seeds");
    

var indexRoutes = require("./routes/index"),
    authRoutes = require("./routes/auth"),
    campgroundRoutes = require("./routes/campgrounds"),
    commentRoutes    = require("./routes/comments"),
    userRoutes    = require("./routes/user");

mongoose.connect("mongodb://localhost/upCamp",{useMongoClient: true});
mongoose.Promise = global.Promise;
require("./config/passport");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitized());
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment');
// seedDB();

//Auth config
app.use(require("express-session")({
    secret:"superSecretDeliveryCode",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());

var page ;
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.page = page;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/",indexRoutes);
app.use("/",authRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/admin/user", userRoutes);



app.listen(port, () => { console.log("Server started... ")
});