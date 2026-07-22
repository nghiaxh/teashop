import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import type { Attendance } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import StatCard from '../../components/ui/StatCard';
import LoadingState from '../../components/ui/LoadingState';
import { Spinner } from '@heroui/react';
import { ShoppingBag, CheckCircle, CurrencyDollar, PlusCircle } from '@phosphor-icons/react';

export default function Dashboard() {
  const [todayStats, setTodayStats] = useState({ orders: 0, completed: 0, revenue: 0 });
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => { fetchDashboardData(); }, []);

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
      showToast('Không thể tải dữ liệu bảng điều khiển', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    try {
      await api.post('/attendance/check-in');
      await fetchDashboardData();
              showToast('Vào ca thành công', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Vào ca thất bại', 'error');
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckOutLoading(true);
    try {
      await api.post('/attendance/check-out');
      await fetchDashboardData();
      showToast('Tan ca thành công', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Tan ca thất bại', 'error');
    } finally {
      setCheckOutLoading(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Bảng điều khiển</h2>
        <Link
          to="/orders/new"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 active:scale-[0.98] transition-all duration-150"
        >
          <PlusCircle size={16} />
          Tạo đơn mới
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<ShoppingBag size={20} />}
          label="Đơn hôm nay"
          value={todayStats.orders}
          color="primary"
        />
        <StatCard
          icon={<CheckCircle size={20} />}
          label="Hoàn thành"
          value={todayStats.completed}
          color="success"
        />
        <StatCard
          icon={<CurrencyDollar size={20} />}
          label="Doanh thu"
          value={`${todayStats.revenue.toLocaleString('vi-VN')}đ`}
          color="secondary"
        />
      </div>

      <div className="bg-content1 rounded-xl border border-divider p-5">
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
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Đã vào ca
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-warning font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                  Chưa vào ca
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 flex items-center justify-center"
              onClick={handleCheckIn}
              disabled={!!attendance || checkInLoading}
            >
              {checkInLoading ? <Spinner size="sm" color="current" /> : 'Vào ca'}
            </button>
            <button
              className="h-9 px-4 rounded-lg border border-divider bg-white text-foreground text-sm font-medium hover:bg-content2 transition-colors disabled:opacity-50 flex items-center justify-center"
              onClick={handleCheckOut}
              disabled={!attendance || checkOutLoading}
            >
              {checkOutLoading ? <Spinner size="sm" /> : 'Tan ca'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
