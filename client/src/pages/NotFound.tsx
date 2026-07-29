import { Link } from 'react-router';
import { BowlSteam } from '@phosphor-icons/react';

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-content2 px-4">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
          <BowlSteam size={40} weight="bold" className="text-primary" />
        </div>
        <h1 className="text-6xl font-bold text-foreground/10 mb-2">404</h1>
        <p className="text-lg font-medium text-foreground mb-1">Không tìm thấy trang</p>
        <p className="text-sm text-foreground/50 mb-6">Trang bạn tìm không tồn tại hoặc đã bị di chuyển.</p>
        <Link
          to="/"
          className="inline-flex h-10 px-5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 active:scale-[0.98] transition-all duration-150"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
