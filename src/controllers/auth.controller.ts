import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { User } from '../models/User';
import { signAccessToken, signRefreshToken } from '../utils/jwt';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name, role } = req.body as {
      email: string;
      password: string;
      name: string;
      role?: string;
    };
    if (!email || !password || !name) throw createHttpError(400, 'Missing fields');
    const exists = await User.findOne({ email });
    if (exists) throw createHttpError(409, 'Email already in use');
    const user = await User.create({ email, password, name, role });

    const payload = { sub: String(user._id), role: user.role, shopId: user.shopId ? String(user.shopId) : undefined };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      domain: process.env.COOKIE_DOMAIN,
      sameSite: 'lax',
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      domain: process.env.COOKIE_DOMAIN,
      sameSite: 'lax',
    });

    res.status(201).json({ user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await User.findOne({ email });
    if (!user) throw createHttpError(401, 'Invalid credentials');
    const ok = await user.comparePassword(password);
    if (!ok) throw createHttpError(401, 'Invalid credentials');

    const payload = { sub: String(user._id), role: user.role, shopId: user.shopId ? String(user.shopId) : undefined };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      domain: process.env.COOKIE_DOMAIN,
      sameSite: 'lax',
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      domain: process.env.COOKIE_DOMAIN,
      sameSite: 'lax',
    });
    res.json({ user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response) {
  res.json({ user: req.user });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(204).send();
}


