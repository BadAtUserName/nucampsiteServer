const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passport = require('passport');//is this suppose to be here or in a different file? 

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  }, 
  password: {
    type: String,
    required: true
  }, 
  admin: {
    type: Boolean,
    default: false
  }
});
module.exports = mongoose.model('User', userSchema)

