import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { User } from '../models/User';
import { signAccessToken, signRefreshToken } from '../utils/jwt';

/**
 * REGISTER USER
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name, role } = req.body as {
      email: string;
      password: string;
      name: string;
      role?: string;
    };

    if (!email || !password || !name) {
      throw createHttpError(400, 'Missing required fields');
    }

    const exists = await User.findOne({ email });
    if (exists) throw createHttpError(409, 'Email already in use');

    const userDoc = await User.create({ email, password, name, role });

    const payload = {
      sub: String(userDoc._id),
      role: userDoc.role,
      shopId: userDoc.shopId ? String(userDoc.shopId) : undefined,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const { password: _, ...userData } = userDoc.toObject();

    // 👇 Return tokens in JSON (frontend stores them in localStorage)
    res.status(201).json({
      user: userData,
      tokens: { accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * LOGIN USER
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const userDoc = await User.findOne({ email }).populate('shopId');
    if (!userDoc) throw createHttpError(401, 'Invalid credentials');

    const ok = await userDoc.comparePassword(password);
    if (!ok) throw createHttpError(401, 'Invalid credentials');

    const payload = {
      sub: String(userDoc._id),
      role: userDoc.role,
      shopId: userDoc.shopId ? String(userDoc.shopId._id) : undefined,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const { password: _, ...userData } = userDoc.toObject();

    res.json({
      user: userData,
      tokens: { accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET AUTHENTICATED USER
 */
export async function me(req: Request, res: Response) {
  res.json({ user: req.user });
}

/**
 * LOGOUT USER
 */
export async function logout(_req: Request, res: Response) {
  // no cookies to clear now — just send 204
  res.status(204).send();
}
