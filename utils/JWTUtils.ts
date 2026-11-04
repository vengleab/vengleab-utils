import jwt from 'jsonwebtoken';
import env from '../constants/env';

function secret(): string {
  if (!env.JWT_TOKEN) throw new Error('JWT_TOKEN is not configured');
  return env.JWT_TOKEN;
}

export default class JWTUtils {
  static sign(payload: unknown) {
    return jwt.sign(`${payload}`, secret());
  }

  static extractPayload(token: string) {
    return jwt.verify(token, secret());
  }
}
