require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
//const encrypt = require("mongoose-encryption"); keeping for memes
//const md5 = require("md5"); keeping for memes
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

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

// User Schema and Model
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] }); keeping for memes

const User = mongoose.model("User", userSchema);


app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    const { username, password } = req.body;

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (!err) {
            const newUser = new User({
                email: username,
                password: hash
            });
        
            newUser.save((err) => {
                if (!err) {
                    res.render("secrets");
                } else {
                    res.send(err);
                }
            });
        }
    });
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    User.findOne({ email: username }, (err, user) => {
        if (err) {
            res.send(err);
        } else {
            if (user) {
                bcrypt.compare(password, user.password, (err, result) => {
                    if (result === true) {
                        res.render("secrets");
                    }
                });
            }
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});