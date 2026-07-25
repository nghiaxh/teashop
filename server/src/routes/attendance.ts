import { Router, Response } from 'express';
import Attendance from '../models/Attendance';
import { requireAuth, requireManager, AuthRequest } from '../middleware/auth';

const router = Router();

function getCurrentShift(): 'morning' | 'afternoon' {
  const hour = new Date().getHours();
  return hour < 14 ? 'morning' : 'afternoon';
}

function isLateCheckIn(checkIn: Date, shift: 'morning' | 'afternoon'): boolean {
  const hour = checkIn.getHours();
  const minute = checkIn.getMinutes();
  const shiftStart = shift === 'morning' ? 6 : 14;
  return hour > shiftStart || (hour === shiftStart && minute > 5);
}

router.post('/check-in', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const shift = getCurrentShift();

  const existing = await Attendance.findOne({ userId, date, shift });
  if (existing) {
    res.status(400).json({ error: 'Đã điểm danh cho ca này rồi' });
    return;
  }

  const attendance = await Attendance.create({
    userId,
    date,
    shift,
    checkIn: now,
    checkOut: null,
    isLate: isLateCheckIn(now, shift),
    hoursWorked: 0
  });

  res.status(201).json({ attendance });
});

router.post('/check-out', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const shift = getCurrentShift();

  const attendance = await Attendance.findOne({
    userId,
    date,
    shift,
    checkOut: null
  });

  if (!attendance) {
    res.status(400).json({ error: 'Chưa có bản ghi vào ca' });
    return;
  }

  if (!attendance.checkIn) {
    res.status(500).json({ error: 'Bản ghi thiếu giờ vào ca' });
    return;
  }

  attendance.checkOut = now;
  attendance.hoursWorked = Math.round(
    (now.getTime() - attendance.checkIn.getTime()) / (1000 * 60 * 60) * 10
  ) / 10;
  await attendance.save();

  res.json({ attendance });
});

router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId, month, year, page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const filter: any = {};

  if (req.user?.role === 'staff') {
    filter.userId = req.user.id;
  } else if (userId) {
    filter.userId = userId;
  }

  if (month && year) {
    const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
    const endDate = new Date(parseInt(year as string), parseInt(month as string), 0, 23, 59, 59);
    filter.date = { $gte: startDate, $lte: endDate };
  }

  const [attendances, total] = await Promise.all([
    Attendance.find(filter).skip(skip).limit(limitNum).populate('userId', 'name username').sort({ date: -1, checkIn: -1 }),
    Attendance.countDocuments(filter),
  ]);

  res.json({
    attendances,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

router.put('/:id', requireAuth, requireManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const { checkIn, checkOut, shift } = req.body;
  const update: Record<string, any> = {};

  if (checkIn !== undefined) {
    const date = new Date(checkIn);
    if (isNaN(date.getTime())) {
      res.status(400).json({ error: 'Thời gian vào ca không hợp lệ' });
      return;
    }
    update.checkIn = date;
  }

  if (checkOut !== undefined) {
    const date = new Date(checkOut);
    if (isNaN(date.getTime())) {
      res.status(400).json({ error: 'Thời gian ra ca không hợp lệ' });
      return;
    }
    update.checkOut = date;
  }

  if (shift !== undefined) {
    if (!['morning', 'afternoon'].includes(shift)) {
      res.status(400).json({ error: 'Ca làm việc không hợp lệ' });
      return;
    }
    update.shift = shift;
  }

  const existingRecord = await Attendance.findById(req.params.id);
  const finalCheckIn = update.checkIn || existingRecord?.checkIn;
  const finalCheckOut = update.checkOut || existingRecord?.checkOut;

  if (finalCheckIn && finalCheckOut && finalCheckOut <= finalCheckIn) {
    res.status(400).json({ error: 'Giờ ra phải sau giờ vào ca' });
    return;
  }

  if (finalCheckIn && finalCheckOut) {
    update.hoursWorked = Math.round(
      (finalCheckOut.getTime() - finalCheckIn.getTime()) / (1000 * 60 * 60) * 10
    ) / 10;
  }

  if (update.checkIn) {
    const shift = update.shift || existingRecord?.shift;
    if (shift) {
      update.isLate = isLateCheckIn(update.checkIn, shift);
    }
  }

  const attendance = await Attendance.findByIdAndUpdate(
    req.params.id,
    update,
    { new: true }
  );

  if (!attendance) {
    res.status(404).json({ error: 'Không tìm thấy bản ghi chấm công' });
    return;
  }

  res.json({ attendance });
});

export default router;
