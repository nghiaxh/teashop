import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import type { Attendance } from '../../types';
import { Spinner } from '@heroui/react';
import {
  ShoppingBag,
  CheckCircle,
  CurrencyDollar,
  PlusCircle,
} from '@phosphor-icons/react';

export default function Dashboard() {
  const [todayStats, setTodayStats] = useState({
    orders: 0,
    completed: 0,
    revenue: 0,
  });
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, attendanceRes] = await Promise.all([
        api.get('/orders'),
        api.get('/attendance'),
      ]);

      const orders = ordersRes.data.orders;
      const today = new Date().toDateString();
      const todayOrders = orders.filter((o: any) =>
        new Date(o.createdAt).toDateString() === today
      );

      setTodayStats({
        orders: todayOrders.length,
        completed: todayOrders.filter((o: any) => o.status === 'completed').length,
        revenue: todayOrders.reduce((sum: number, o: any) => sum + o.totalAmount, 0),
      });

      const attendances = attendanceRes.data.attendances;
      const todayAttendance = attendances.find((a: Attendance) =>
        new Date(a.date).toDateString() === today && !a.checkOut
      );
      setAttendance(todayAttendance || null);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    try {
      await api.post('/attendance/check-in');
      await fetchDashboardData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Check-in failed');
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckOutLoading(true);
    try {
      await api.post('/attendance/check-out');
      await fetchDashboardData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Check-out failed');
    } finally {
      setCheckOutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-divider p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingBag size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-foreground/50">Đơn hôm nay</p>
              <p className="text-xl font-bold text-foreground">{todayStats.orders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-divider p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle size={20} className="text-success" />
            </div>
            <div>
              <p className="text-xs text-foreground/50">Hoàn thành</p>
              <p className="text-xl font-bold text-foreground">{todayStats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-divider p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <CurrencyDollar size={20} className="text-secondary" />
            </div>
            <div>
              <p className="text-xs text-foreground/50">Doanh thu</p>
              <p className="text-xl font-bold text-foreground">
                {todayStats.revenue.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-divider p-5">
        <h3 className="font-semibold text-foreground mb-3">Chấm Công</h3>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-foreground/60">
              Ca hiện tại:{' '}
              <span className="font-medium text-foreground">
                {new Date().getHours() < 14 ? 'Sáng (06:00-14:00)' : 'Chiều (14:00-22:00)'}
              </span>
            </p>
            <p className="text-sm mt-1">
              Trạng thái:{' '}
              {attendance ? (
                <span className="inline-flex items-center gap-1 text-success font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                  Đã check-in
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-warning font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning"></span>
                  Chưa check-in
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center"
              onClick={handleCheckIn}
              disabled={!!attendance || checkInLoading}
            >
              {checkInLoading ? <Spinner size="sm" color="current" /> : 'Check-in'}
            </button>
            <button
              className="h-9 px-4 rounded-lg border border-divider bg-white text-foreground text-sm font-medium hover:bg-content2 transition-colors disabled:opacity-50 flex items-center justify-center"
              onClick={handleCheckOut}
              disabled={!attendance || checkOutLoading}
            >
              {checkOutLoading ? <Spinner size="sm" /> : 'Check-out'}
            </button>
          </div>
        </div>
      </div>

      <Link
        to="/orders/new"
        className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
      >
        <PlusCircle size={18} />
        Tạo đơn mới
      </Link>
    </div>
  );
}
