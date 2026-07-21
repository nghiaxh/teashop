import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

export interface AuthRequest extends Request {
  session: any;
  user?: {
    id: string;
    username: string;
    name: string;
    role: 'staff' | 'manager';
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.session?.userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const user = await User.findById(req.session.userId).select('-password');
  if (!user || !user.isActive) {
    res.status(401).json({ error: 'User not found or inactive' });
    return;
  }

  req.user = {
    id: user._id.toString(),
    username: user.username,
    name: user.name,
    role: user.role
  };

  next();
};

export const requireManager = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'manager') {
    res.status(403).json({ error: 'Manager access required' });
    return;
  }
  next();
};
