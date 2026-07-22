import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId: string;
    role: 'staff' | 'manager';
    cachedUser?: {
      id: string;
      username: string;
      name: string;
      role: 'staff' | 'manager';
    };
  }
}
