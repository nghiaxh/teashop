import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  ShoppingBag,
  CurrencyDollar,
  Clock,
  CheckCircle,
  BookOpen,
  Package,
  Users,
  CalendarCheck,
  ChartBar,
} from '@phosphor-icons/react';

export default function ManagerDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/orders');
      const orders = res.data.orders;

      setStats({
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum: number, o: any) => sum + o.totalAmount, 0),
        pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
        completedOrders: orders.filter((o: any) => o.status === 'completed').length
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
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
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-base-content">Tổng quan</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-base-300 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingBag size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-base-content/50">Tổng đơn</p>
              <p className="text-xl font-bold text-base-content">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-base-300 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <CurrencyDollar size={20} className="text-secondary" />
            </div>
            <div>
              <p className="text-xs text-base-content/50">Doanh thu</p>
              <p className="text-xl font-bold text-base-content">
                {stats.totalRevenue.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-base-300 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock size={20} className="text-warning" />
            </div>
            <div>
              <p className="text-xs text-base-content/50">Đang chờ</p>
              <p className="text-xl font-bold text-base-content">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-base-300 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle size={20} className="text-success" />
            </div>
            <div>
              <p className="text-xs text-base-content/50">Hoàn thành</p>
              <p className="text-xl font-bold text-base-content">{stats.completedOrders}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Link to="/manager/menu" className="bg-white rounded-xl border border-base-300 p-4 hover:border-primary/50 transition-colors">
          <BookOpen size={20} className="text-primary mb-2" />
          <p className="text-sm font-medium text-base-content">Quản lý Menu</p>
        </Link>

        <Link to="/manager/inventory" className="bg-white rounded-xl border border-base-300 p-4 hover:border-primary/50 transition-colors">
          <Package size={20} className="text-primary mb-2" />
          <p className="text-sm font-medium text-base-content">Quản lý Kho</p>
        </Link>

        <Link to="/manager/accounts" className="bg-white rounded-xl border border-base-300 p-4 hover:border-primary/50 transition-colors">
          <Users size={20} className="text-primary mb-2" />
          <p className="text-sm font-medium text-base-content">Nhân viên</p>
        </Link>

        <Link to="/manager/attendance" className="bg-white rounded-xl border border-base-300 p-4 hover:border-primary/50 transition-colors">
          <CalendarCheck size={20} className="text-primary mb-2" />
          <p className="text-sm font-medium text-base-content">Chấm công</p>
        </Link>

        <Link to="/manager/reports" className="bg-white rounded-xl border border-base-300 p-4 hover:border-primary/50 transition-colors">
          <ChartBar size={20} className="text-primary mb-2" />
          <p className="text-sm font-medium text-base-content">Báo cáo</p>
        </Link>
      </div>
    </div>
  );
}
