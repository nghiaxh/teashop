import { useState, useEffect } from 'react';
import api from '../../api/axios';

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
    <div>
      <h2 className="text-2xl font-bold mb-6">Tổng quan</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Tổng đơn hàng</div>
          <div className="stat-value text-primary">{stats.totalOrders}</div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Tổng doanh thu</div>
          <div className="stat-value text-secondary">
            {stats.totalRevenue.toLocaleString('vi-VN')}đ
          </div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Đang chờ</div>
          <div className="stat-value text-warning">{stats.pendingOrders}</div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Đã hoàn thành</div>
          <div className="stat-value text-success">{stats.completedOrders}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title">Thao tác nhanh</h3>
            <div className="grid grid-cols-2 gap-2">
              <a href="/manager/menu" className="btn btn-outline">Quản lý Menu</a>
              <a href="/manager/inventory" className="btn btn-outline">Quản lý Kho</a>
              <a href="/manager/accounts" className="btn btn-outline">Quản lý Nhân viên</a>
              <a href="/manager/attendance" className="btn btn-outline">Quản lý CC</a>
              <a href="/manager/reports" className="btn btn-outline col-span-2">Báo cáo Doanh thu</a>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title">Hệ thống</h3>
            <div className="space-y-2 text-sm">
              <p>Server: <span className="badge badge-success">Running</span></p>
              <p>Database: <span className="badge badge-success">Connected</span></p>
              <p>Version: 1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
