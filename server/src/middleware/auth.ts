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
    res.status(401).json({ error: 'Chưa đăng nhập' });
    return;
  }

  if (req.session.cachedUser) {
    req.user = req.session.cachedUser;
    next();
    return;
  }

  const user = await User.findById(req.session.userId).select('-password');
  if (!user || !user.isActive) {
    res.status(401).json({ error: 'Không tìm thấy người dùng hoặc đã bị khóa' });
    return;
  }

  req.user = {
    id: user._id.toString(),
    username: user.username,
    name: user.name,
    role: user.role
  };

  req.session.cachedUser = req.user;

  next();
};

export const requireManager = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'manager') {
    res.status(403).json({ error: 'Cần quyền quản lý' });
    return;
  }
  next();
};
