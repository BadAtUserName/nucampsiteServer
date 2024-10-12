const mongoose = require('mongoose');
const Schema = mongoose.Schema;



// Define the schema for a Partner
const partnerSchema = new Schema ({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  description: {
    type: String, 
    required: true
  }
}, {
  timestamps: true // This adds createdAt and updatedAt fields automatically
});

//Create a modle using the schema
const Partner = mongoose.model('Partner', partnerSchema);

//Export the partner model
module.exports = Partner;