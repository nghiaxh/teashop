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
  const { userId, month, year } = req.query;

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

  const attendances = await Attendance.find(filter)
    .populate('userId', 'name username')
    .sort({ date: -1, checkIn: -1 });

  res.json({ attendances });
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

  if (update.checkIn && update.checkOut) {
    update.hoursWorked = Math.round(
      (update.checkOut.getTime() - update.checkIn.getTime()) / (1000 * 60 * 60) * 10
    ) / 10;
  } else if (update.checkIn || update.checkOut) {
    const existing = await Attendance.findById(req.params.id);
    if (existing) {
      const ci = update.checkIn || existing.checkIn;
      const co = update.checkOut || existing.checkOut;
      if (ci && co) {
        update.hoursWorked = Math.round(
          (co.getTime() - ci.getTime()) / (1000 * 60 * 60) * 10
        ) / 10;
      }
    }
  }

  if (update.checkIn) {
    const existing = await Attendance.findById(req.params.id);
    const shift = update.shift || existing?.shift;
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
