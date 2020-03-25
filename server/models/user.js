const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const { Schema } = mongoose;

const userSchema = new Schema({
  username: String,
  password: String,
  email: String,
  accessToken: String,
});

userSchema.pre('save', function onSave() {
  const user = this;
  const salt = bcrypt.genSaltSync(10);
  user.password = bcrypt.hashSync(user.password, salt);
});

module.exports = mongoose.model('User', userSchema);
