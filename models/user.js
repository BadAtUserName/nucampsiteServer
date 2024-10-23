const mongoose = require('mongoose'); // Import Mongoose to interact with MongoDB
const passportLocalMongoose = require('passport-local-mongoose'); // Import Passport-Local Mongoose plugin
const { facebook } = require('../config');
const Schema = mongoose.Schema; // Use Schema from Mongoose to create data structure

// Define the User schema with an admin field
const userSchema = new Schema({
  admin: {
    type: Boolean, // The 'admin' field is a Boolean to track admin status
    default: false, // By default, users are not admins
    facebookId: String
  }
});

// Add passport-local-mongoose plugin to the schema
// This plugin adds fields for username and password, and provides authentication methods
userSchema.plugin(passportLocalMongoose);

// Export the User model based on the schema
module.exports = mongoose.model('User', userSchema);

/*const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const passport = require('passport');//is this suppose to be here or in a different file? 

const userSchema = new Schema({
  username: {
      type: String,
      required: true,
      unique: true
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


module.exports = mongoose.model('User', userSchema);*/