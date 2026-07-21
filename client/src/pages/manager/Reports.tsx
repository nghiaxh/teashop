import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function Reports() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
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
      const completed = orders.filter((o: any) => o.status === 'completed');
      const revenue = completed.reduce((sum: number, o: any) => sum + o.totalAmount, 0);

      setStats({
        totalOrders: orders.length,
        totalRevenue: revenue,
        avgOrderValue: completed.length > 0 ? Math.round(revenue / completed.length) : 0,
        completedOrders: completed.length
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
      <h2 className="text-2xl font-bold mb-6">Báo cáo Doanh thu</h2>

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
          <div className="stat-title">Giá trị TB/đơn</div>
          <div className="stat-value text-accent">
            {stats.avgOrderValue.toLocaleString('vi-VN')}đ
          </div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Đơn hoàn thành</div>
          <div className="stat-value text-success">{stats.completedOrders}</div>
        </div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h3 className="card-title">Thống kê chi tiết</h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Chỉ số</th>
                  <th>Giá trị</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Tỷ lệ hoàn thành</td>
                  <td>
                    {stats.totalOrders > 0
                      ? Math.round((stats.completedOrders / stats.totalOrders) * 100)
                      : 0}%
                  </td>
                </tr>
                <tr>
                  <td>Doanh thu trung bình/ngày</td>
                  <td>{Math.round(stats.totalRevenue / 30).toLocaleString('vi-VN')}đ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
