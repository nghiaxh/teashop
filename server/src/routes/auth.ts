import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User, { IUser } from '../models/User';
import { requireAuth, requireManager, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }

  const user = await User.findOne({ username });
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ error: 'Account is inactive' });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  req.session.userId = user._id;
  req.session.role = user.role;

  res.json({
    user: {
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role
    }
  });
});

router.post('/logout', (req: Request, res: Response): void => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to logout' });
      return;
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

router.get('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({ user: req.user });
});

router.post('/register', requireAuth, requireManager, async (req: Request, res: Response): Promise<void> => {
  const { username, password, name, role } = req.body;

  if (!username || !password || !name) {
    res.status(400).json({ error: 'Username, password, and name required' });
    return;
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    res.status(409).json({ error: 'Username already exists' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    password: hashedPassword,
    name,
    role: role || 'staff'
  });

  res.status(201).json({
    user: {
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role
    }
  });
});

export default router;
