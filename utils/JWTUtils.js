const jwt = require('jsonwebtoken');
const env = require('../constants/env');

const jwtSecret = env.JWT_TOKEN;

export default class JWTUtils {
  static sign(payload) {
    return jwt.sign(`${payload}`, jwtSecret);
  }

  static extractPayload(token) {
    return jwt.verify(token, jwtSecret);
  }
}
