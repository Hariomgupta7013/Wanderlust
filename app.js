if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}


const express = require("express");  // Express framework import karna
const app = express();  // Express application banani
const mongoose = require("mongoose");  // Mongoose library import karna MongoDB ke liye
const path = require("path");  // Path module for handling directory paths
const methodOverride = require("method-override");  // HTTP methods override karne ke liye (PUT, DELETE)
const ejsMate = require("ejs-mate");  // EJS templating engine ka layout engine
const ExpressError = require("./utils/ExpressError.js");  // Custom error class
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


const dbUrl = process.env.ATLASDB_URL;


// Database connect karne ke liye async function
async function main() {
 await mongoose.connect(dbUrl);
}

// MongoDB se connect hona
main()
.then(() => {
 console.log("connected to DB");  // Connection successful hone par message
})
.catch((err) => {
 console.log(err);  // Connection error handle karna
});

// Middleware to parse incoming JSON bodies (POST/PUT requests ka data)
app.use(express.json()); // JSON body parsing ke liye zaroori

// Set templating engine to EJS
app.set("view engine", "ejs");

// Views folder ka path set karna (jahaan ejs files stored hain)
app.set("views", path.join(__dirname, "views"));

// Middleware to parse URL encoded form data (form submissions ka data)
app.use(express.urlencoded({extended: true}));

// Method override middleware to support HTTP verbs like PUT and DELETE in forms
app.use(methodOverride("_method"));

// Custom layout engine for EJS
app.engine('ejs', ejsMate);

// Static files serve karne ke liye (CSS, JS, images etc)
app.use(express.static(path.join(__dirname,"/public")));


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 36000,
});

store.on("error", () => {
    console.log("ERROR IN MONGO SESSION STORE", err);
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};


// // Root route
// app.get("/", (req, res) => {
//      res.send("Hi, I am root");  // Server home page par simple text bhejna
// });





app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


// app.get("/demouser", async(req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


app.listen(8080, () => {
    console.log("server is listening to port 8080");
});

// 404 handler
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// Error handler middleware
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("includes/error.ejs", {message});
    // res.status(statusCode).send(message);
});