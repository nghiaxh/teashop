import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import connectDB from './config/database';
import { sessionConfig } from './config/session';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import menuRoutes from './routes/menu';
import inventoryRoutes from './routes/inventory';
import ordersRoutes from './routes/orders';
import attendanceRoutes from './routes/attendance';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(session(sessionConfig));

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/attendance', attendanceRoutes);

app.use(errorHandler);

const start = async () => {
  await connectDB();

  const User = (await import('./models/User')).default;
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('No users found, running seed...');
    const { seedDatabase } = await import('./seed');
    await seedDatabase();
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start().catch(console.error);
