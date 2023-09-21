const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./usersinfo/userschema");

const { exec } = require('child_process');
const fs = require('fs');
const nodeWebCam = require('node-webcam');

require("dotenv").config();
const app = express();
app.use(express.json());
app.use(methodOverride('_method'));
app.use(bodyParser.json());

const data = require('./data.json')
var urlencodedParser = bodyParser.urlencoded({extended: true});

app.use(session({
  secret: 'itisexclusivetotheuseronly',
  resave: false,
  saveUninitialized: true
}));

app.use(flash());
app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const {isLoggedIn} = require('./middleware.js');

app.use( (req, res, next) => {
  res.locals.currentuser = req.user;
  res.locals.smessage = req.flash('success');
  res.locals.emessage = req.flash('error');
  next();
})

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
var db = "mongodb://127.0.0.1:27017/sminha";
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log("Connection Successful");
})
.catch(err => {
    console.log("Connection Failed 1 error: " + err);
})

//getting the home page
app.get('/home', (req, res) => {
  try{
    res.render("homepage.ejs");
  }catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
//getting the home page


//getting the webpage to work
app.get("/webcam", (req, res) => {
  try{
    res.render("webcam/webcam.ejs");
  }catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
//getting the webpage to work


//getting data from signup page
app.get("/signup", async (req, res) => {
    try {
      res.render("SignUpPage.ejs");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });
  
  app.post("/signup", async (req, res) => {
    try {
      console.log(req.body);
      const currentuser = new User(req.body);
      var pw = currentuser.password;
      var hashpw = await bcrypt.hash(pw, 12);
      currentuser.password = hashpw;
      await currentuser.save();
      console.log("Saved successfully");
      req.flash("success", "Welcome!");
      res.redirect(`myprofile/${currentuser._id}`);
    } catch (error) {
      console.error("Error in saving:", error);
      res.status(500).send("Error in saving user");
    }
  });
  //getting data from signup page


//authentication from login page
app.get("/login", async (req, res) => {
  try {
    res.render("login.ejs");
  }
  catch (error) {
    console.error("Error in Login page", error);
  };
});

app.post("/login", async (req, res) => {
  try {
    console.log(req.body);
    const { username, password } = req.body;
    const current = await User.findOne({ username });
    if (!current) {
      req.flash("error", "User not found. Please check your username.");
      return res.redirect("/login");
    }
    const validPw = await bcrypt.compare(password, current.password);
    if (validPw) {
      req.session.user_id = current._id;
      console.log("Session User ID Set:", req.session.user_id);
      req.flash("success", "Welcome Back!");
      return res.redirect(`/myprofile/${current._id}`);
    } else {
      req.flash("error", "Invalid password. Please try again.");
      return res.redirect("/login");
    }
  } catch (error) {
    console.error("Error in Login page", error);
    req.flash("error", "An error occurred. Please try again later.");
    res.redirect("/login");
  }
});

//authentication from login page


//showing the user information on the my profile page
app.get("/myprofile/:id",  async (req, res) => {
  try {
    const {id} = req.params;
    var currentuser = await User.findById(id);
    res.render("userinfo", { currentuser,  user_id: req.session.user_id });
  }
  catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
  //showing the user information on the my profile page


//editing user information on the my profile page
app.get("/myprofile/:id/edit", async (req, res) => {
  try{
    const {id} = req.params;
    currentuser = await User.findById(id);
    res.render("edituserinfo", { currentuser })
  }catch (error){
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.put("/myprofile/:id", async (req, res) => {
  try {
    const {id} = req.params;
    const currentuser = await User.findByIdAndUpdate(id, {...req.body.currentuser});
    res.redirect(`/myprofile/${currentuser._id}`)
  } catch (error) {
    console.error("Error in PUT request", error);
    res.status(500).send("Internal Server Error");
  }
});
//editing user information on the my profile page

//timer for daily tasks
app.get('/dailytasks', async (req, res) => {
  try{
    res.render("countdown/countdown.ejs");
  }
  catch (error) {
    console.error("Error in PUT request", error);
    res.status(500).send("Internal Server Error");
  }
});
//timer for daily tasks

app.get('/analyze', async (req, res) => {
  try
  {
    res.render("webcam/webcam.ejs");
  }
  catch(error)
  {
    console.error("Error in PUT request", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to send camera data to Python script
app.post('/analyze', (req, res) => {
  const cameraData = req.body.cameraData; // Assuming cameraData is sent as a JSON field
  exec(`python ml-models/facemodeltest.py`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ error: 'An error occurred while running the script.' });
    }
    res.json({ result: stdout });
  });
});


//logout from the website
app.post("/logout", async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session", err);
    }
    res.redirect("/login");
  });
});
//logout from the website


app.get("/secret", async (req, res) => {
  if(!req.session.user_id){
    res.redirect("/login");
  }
  res.send("Confidential");
});
  
  app.use((req, res, next) => {
    console.log("Incoming Request on port 3000");
    next();
  });
  
  app.listen(3000, () => {
    console.log("Listening to port 3000");
  });
