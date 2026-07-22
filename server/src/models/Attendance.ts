import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  shift: 'morning' | 'afternoon';
  checkIn: Date;
  checkOut: Date | null;
  isLate: boolean;
  hoursWorked: number;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  shift: { type: String, enum: ['morning', 'afternoon'], required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, default: null },
  isLate: { type: Boolean, default: false },
  hoursWorked: { type: Number, default: 0 }
}, { timestamps: true });

attendanceSchema.index({ userId: 1, date: 1, shift: 1 }, { unique: true });

export default mongoose.model<IAttendance>('Attendance', attendanceSchema);
