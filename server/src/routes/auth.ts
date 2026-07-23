import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User, { IUser } from '../models/User';
import { requireAuth, requireManager, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Đăng nhập thất bại' });
    return;
  }

  const user = await User.findOne({ username });
  if (!user) {
    res.status(401).json({ error: 'Đăng nhập thất bại' });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401).json({ error: 'Đăng nhập thất bại' });
    return;
  }

  req.session.userId = user._id.toString();
  req.session.role = user.role;
  req.session.cachedUser = {
    id: user._id.toString(),
    username: user.username,
    name: user.name,
    role: user.role
  };

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
      res.status(500).json({ error: 'Đăng xuất thất bại' });
      return;
    }
    res.clearCookie('connect.sid', {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax' as const
    });
    res.json({ message: 'Đăng xuất thành công' });
  });
});

router.get('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({ user: req.user });
});

router.get('/profile', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user?.id).select('-password');
  if (!user) {
    res.status(404).json({ error: 'Không tìm thấy người dùng' });
    return;
  }
  res.json({ user });
});

router.get('/users', requireAuth, requireManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ users });
});

router.put('/:id', requireAuth, requireManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, role, isActive, phone, email, gender, dateOfBirth, hireDate } = req.body;
  const update: Record<string, any> = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'Tên không được để trống' });
      return;
    }
    update.name = name.trim();
  }

  if (role !== undefined) {
    if (!['staff', 'manager'].includes(role)) {
      res.status(400).json({ error: 'Quyền không hợp lệ' });
      return;
    }
    update.role = role;
  }

  if (isActive !== undefined) {
    update.isActive = !!isActive;
  }

  if (phone !== undefined) update.phone = phone || undefined;
  if (email !== undefined) update.email = email || undefined;
  if (gender !== undefined) {
    if (gender && !['male', 'female', 'other'].includes(gender)) {
      res.status(400).json({ error: 'Giới tính không hợp lệ' });
      return;
    }
    update.gender = gender || undefined;
  }
  if (dateOfBirth !== undefined) update.dateOfBirth = dateOfBirth || undefined;
  if (hireDate !== undefined) update.hireDate = hireDate || undefined;

  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
  if (!user) {
    res.status(404).json({ error: 'Không tìm thấy người dùng' });
    return;
  }

  if (req.params.id === req.user?.id && req.session.cachedUser) {
    req.session.cachedUser = {
      id: user._id.toString(),
      username: user.username,
      name: user.name,
      role: user.role
    };
  }

  res.json({ user });
});

router.delete('/:id', requireAuth, requireManager, async (req: AuthRequest, res: Response): Promise<void> => {
  if (req.params.id === req.user?.id) {
    res.status(400).json({ error: 'Không thể khóa tài khoản của chính mình' });
    return;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  ).select('-password');

  if (!user) {
    res.status(404).json({ error: 'Không tìm thấy người dùng' });
    return;
  }

  res.json({ user });
});

router.post('/register', requireAuth, requireManager, async (req: Request, res: Response): Promise<void> => {
  const { username, password, name, role, phone, email, gender, dateOfBirth, hireDate } = req.body;

  if (!username || !password || !name) {
    res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
    return;
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    res.status(409).json({ error: 'Tên đăng nhập đã tồn tại' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    password: hashedPassword,
    name,
    role: role || 'staff',
    phone: phone || undefined,
    email: email || undefined,
    gender: gender || undefined,
    dateOfBirth: dateOfBirth || undefined,
    hireDate: hireDate || undefined
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
