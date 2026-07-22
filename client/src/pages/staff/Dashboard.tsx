import { useState, useEffect } from 'react';
import api from '../../api/axios';
import type { Attendance } from '../../types';

export default function Dashboard() {
  const [todayStats, setTodayStats] = useState({
    orders: 0,
    completed: 0,
    hoursWorked: 0
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
        api.get('/attendance')
      ]);

      const orders = ordersRes.data.orders;
      const today = new Date().toDateString();
      const todayOrders = orders.filter((o: any) =>
        new Date(o.createdAt).toDateString() === today
      );

      setTodayStats({
        orders: todayOrders.length,
        completed: todayOrders.filter((o: any) => o.status === 'completed').length,
        hoursWorked: todayOrders.reduce((sum: number, o: any) => sum + o.totalAmount, 0)
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
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Đơn hôm nay</div>
          <div className="stat-value text-primary">{todayStats.orders}</div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Đã hoàn thành</div>
          <div className="stat-value text-success">{todayStats.completed}</div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Doanh thu</div>
          <div className="stat-value text-secondary">
            {todayStats.hoursWorked.toLocaleString('vi-VN')}đ
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow mb-6">
        <div className="card-body">
          <h3 className="card-title">Chấm Công</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-base-content/60">
                Ca hiện tại: <span className="font-semibold">
                  {new Date().getHours() < 14 ? 'Sáng (06:00-14:00)' : 'Chiều (14:00-22:00)'}
                </span>
              </p>
              <p className="text-sm mt-1">
                Status: {attendance ? (
                  <span className="badge badge-success">Đã check-in</span>
                ) : (
                  <span className="badge badge-warning">Chưa check-in</span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-primary"
                onClick={handleCheckIn}
                disabled={!!attendance || checkInLoading}
              >
                {checkInLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  'Check-in'
                )}
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleCheckOut}
                disabled={!attendance || checkOutLoading}
              >
                {checkOutLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  'Check-out'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h3 className="card-title">Tạo Đơn Hàng Nhanh</h3>
          <a href="/orders/new" className="btn btn-primary">
            Tạo đơn mới →
          </a>
        </div>
      </div>
    </div>
  );
}
