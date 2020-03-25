import nextConnect from 'next-connect';

const mongoose = require('mongoose');
const env = require('../constants/env');

const connection = mongoose.connect(env.MONG_URL, {
  user: env.MONG_USER,
  pass: env.MONG_DB,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log('Connected to DB');

async function database(req, res, next) {
  req.connection = connection;
  return next();
}

const middleware = nextConnect();

middleware.use(database);

export default middleware;
