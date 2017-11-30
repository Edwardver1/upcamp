

var express        = require("express"),
    app            = express(),
    port           = process.env.PORT || 3000,
    bodyParser     = require("body-parser"),
    mongoose       = require("mongoose"),
    flash          = require("connect-flash"),
    methodOverride = require("method-override");
    
    


    
var indexRoutes = require("./routes/index");


mongoose.connect("mongodb://localhost/upCamp",{useMongoClient: true});
mongoose.Promise = global.Promise;


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());



app.use("/",indexRoutes);




app.listen(port, () => { console.log("Server started... ")
});