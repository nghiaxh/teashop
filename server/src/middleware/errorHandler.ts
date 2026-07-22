import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err.stack);

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ error: 'ID không hợp lệ' });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map(e => e.message);
    res.status(400).json({ error: messages.join(', ') });
    return;
  }

  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    res.status(409).json({ error: `Dữ liệu đã tồn tại: ${field}` });
    return;
  }

  res.status(500).json({ error: 'Lỗi máy chủ' });
};
