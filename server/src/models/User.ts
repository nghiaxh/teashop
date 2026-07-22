import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password: string;
  name: string;
  role: 'staff' | 'manager';
  isActive: boolean;
  phone?: string;
  email?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: Date;
  hireDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  role: { type: String, enum: ['staff', 'manager'], default: 'staff' },
  isActive: { type: Boolean, default: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  dateOfBirth: { type: Date },
  hireDate: { type: Date },
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema);
