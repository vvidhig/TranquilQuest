const mongoose = require('mongoose');
// MongoDB connection string
const db = "mongodb://127.0.0.1:27017/sminha";
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connection to MongoDB Successful");
  })
  .catch((err) => {
    console.error("Connection to MongoDB Failed:", err);
  });

// Corrected module path using forward slashes
const User = require("./userschema");
const u = new User ({
    name: 'Vidhi Gupta',
    age: 18,
    gender: 'female',
    email: 'vidhidoesnotreply@gmail.com',
    mobile: '1122334455',
    std: 9,
    dob: "2005-01-31",
    state: 'West Bengal',
    username: 'vvidhig',
    password: '123123123',
})
u.save().then( () => { console.log("Saved successfully");}).catch(() => { console.log("error in saving");});