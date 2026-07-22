import session from 'express-session';
import MongoStore from 'connect-mongo';

export const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'teashop-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.COOKIE_SECURE === 'true',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 24 * 60 * 60 * 1000
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/teashop',
    collectionName: 'sessions'
  })
};
