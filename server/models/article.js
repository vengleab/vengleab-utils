const mongoose = require('mongoose');

const { Schema } = mongoose;

const articleSchema = new Schema({
  title: String,
  imageUrl: String,
  description: String,
});

module.exports = mongoose.model('Article', articleSchema);
