const mongoose = require('mongoose');
const Campsite = require('./campsite');
const Schema = mongoose.Schema;

//Define the favoriteSchema
const favoriteSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Reference to the User model
    required: true
  },

  campsites: [ {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campsite' // Reference to the Campsite model
  }
  ]
}, {
  timestamps: true //Auto adds createdAt and updatedAd fields
});

//Create the export the Favorite model
const Favorite = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorite;