import jwt from 'jsonwebtoken';

type JwtPayload = Record<string, unknown> & { sub: string };

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });
}

export function signRefreshToken(payload: JwtPayload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as JwtPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as JwtPayload;
}


