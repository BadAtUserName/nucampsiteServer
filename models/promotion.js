const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const promotionSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String,
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  cost: {
    type: Currency,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  }
}, {
  timestamps: true // This adds createdAt and updatedAt fields automatically
});

const Promotion = mongoose.model('Promotion', promotionSchema);

//Export the Promotion model
module.exports = Promotion;
