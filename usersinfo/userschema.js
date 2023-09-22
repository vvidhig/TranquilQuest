const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const passportLocalMongoose = require('passport-local-mongoose');
var db = "mongodb://127.0.0.1:27017/sminha";
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log("Connection Successful");
})
.catch(err => {
    console.log("Connection Failed 2");
})

const credSchema = new mongoose.Schema({
    name : String,
    age : Number,
    gender : String,
    email : String,
    mobile : String,
    std : Number,
    dob : String,
    state : String,
    username: String,
    password : String
});

credSchema.plugin(passportLocalMongoose);

const user = mongoose.model("User", credSchema);
module.exports = user;