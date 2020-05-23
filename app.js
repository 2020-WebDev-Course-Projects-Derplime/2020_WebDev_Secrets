require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");

// 1. TAKE NOTE OF ORDER
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// 2. Use express session PLACE HERERERERERERE LAST LAST LAST LAST
// Initialized session
app.use(session({
    secret: "ThisIsTHeBestSecretEverrrrrrrrr",
    resave: false,
    saveUninitialized: false
}));

// 3. Initialize passport AFTER express session
// THEN USE SESSION
app.use(passport.initialize());
app.use(passport.session());

// Connection to DB
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};
mongoose.connect("mongodb://localhost:27017/userDB", options, (err) => {
    if (!err) {
        console.log("Connected to MongoDB!");
    }
});
// 6. Fix deprecation warning if happens
mongoose.set("useCreateIndex", true );

// User Schema and Model
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose); // 4. use PLUGIN in SCHEMA

const User = mongoose.model("User", userSchema);

// 5. Create local login strategy and to serialize and deserialize users
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

app.post("/register", (req, res) => {
    const { username, password } = req.body;

    User.register({ username: username }, password, (err, user) => {
        if (err) {
            console.error(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            });
        }
    });
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const user = new User({
        username: username,
        password: password
    });

    req.login(user, (err) => {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
