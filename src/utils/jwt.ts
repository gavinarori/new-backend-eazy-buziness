import jwt, { Secret, SignOptions, JwtPayload as BaseJwtPayload } from 'jsonwebtoken';
import { StringValue } from 'ms';

type JwtPayload = BaseJwtPayload & { sub: string };

const accessSecret: Secret = process.env.JWT_ACCESS_SECRET || 'default_access_secret';
const refreshSecret: Secret = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret';

export function signAccessToken(payload: JwtPayload) {
  const options: SignOptions = { 
    expiresIn: (process.env.JWT_ACCESS_EXPIRES || '15m') as StringValue 
  };
  return jwt.sign(payload, accessSecret, options);
}

export function signRefreshToken(payload: JwtPayload) {
  const options: SignOptions = { 
    expiresIn: (process.env.JWT_REFRESH_EXPIRES || '7d') as StringValue 
  };
  return jwt.sign(payload, refreshSecret, options);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, accessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, refreshSecret) as JwtPayload;
}
