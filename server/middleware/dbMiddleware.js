import nextConnect from 'next-connect';
import Cors from 'cors';

const cors = Cors({
  origin: '*',
  methods: ['GET', 'HEAD', 'POST', 'PATCH', 'PUT'],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
});

const mongoose = require('mongoose');
const env = require('../../constants/env');

const connection = mongoose.connect(env.MONG_URL, {
  user: env.MONG_USER,
  pass: env.MONG_DB,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log('Connected to DB');

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

async function database(req, res, next) {
  req.connection = connection;
  await runMiddleware(req, res, cors);
  return next();
}

const middleware = nextConnect();

middleware.use(database);

export default middleware;
