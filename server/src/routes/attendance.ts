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
    res.status(400).json({ error: 'Already checked in for this shift' });
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
    res.status(400).json({ error: 'No active check-in found' });
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
  const attendance = await Attendance.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!attendance) {
    res.status(404).json({ error: 'Attendance record not found' });
    return;
  }

  res.json({ attendance });
});

export default router;
