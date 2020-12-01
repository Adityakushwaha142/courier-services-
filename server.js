const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.set("view engine", "hbs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* Writting Passport Code  */

const session = require("express-session");
const passport = require("passport");
const passportlocalmongoose = require("passport-local-mongoose");

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "our little secret",
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* Making data base part on one side completely  */

mongoose.connect("mongodb://localhost:27017/courierDB", {
  useNewUrlParser: true,
});

const userschema = new mongoose.Schema({
  Name: String,
  Email: String,
  Password: String,
});
userschema.plugin(passportlocalmongoose);

const user = new mongoose.model("user", userschema);
passport.use(user.createStrategy());
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

/* Database completed here  */

app.get("/signup", (req, res) => {
  res.render("signup.hbs");
});

app.post("/signup", (req, res) => {
  user.register(
    { username: req.body.username },
    req.body.password,
    function (err, users) {
      if (err) {
        console.log(err);
        res.redirect("/signup");
      } else {
        passport.authenticate("local")(req, res, function (err, users) {
          res.redirect("/profile");
        });
      }
    }
  );
});

app.get("/profile", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("profile.hbs");
  } else {
    res.redirect("/signup");
  }
});

app.get("/login", (req, res) => {
  res.render("login.hbs");
});

app.post("/login", (req, res) => {
  const user1 = new user({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user1, (err) => {
    if (err) {
      console.log(err);
      res.redirect("/signup");
    } else {
      passport.authenticate("local")(req, res, (err, users) => {
        res.redirect("/profile");
      });
    }
  });
});

app.get("/", (req, res) => {
  res.send("welcome to the index page ");
});

app.listen(2424, () => {
  console.log("server started on http://localhost:2424");
});
