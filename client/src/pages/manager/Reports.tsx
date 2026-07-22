import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Spinner } from '@heroui/react';
import {
  ShoppingBag,
  CurrencyDollar,
  TrendUp,
  CheckCircle,
} from '@phosphor-icons/react';

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
      const totalRevenue = completed.reduce((sum: number, o: any) => sum + o.totalAmount, 0);

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        avgOrderValue: completed.length > 0 ? totalRevenue / completed.length : 0,
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
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Báo cáo Doanh thu</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-divider p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingBag size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-foreground/50">Tổng đơn</p>
              <p className="text-xl font-bold text-foreground">{stats.totalOrders}</p>
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
                {stats.totalRevenue.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-divider p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <TrendUp size={20} className="text-info" />
            </div>
            <div>
              <p className="text-xs text-foreground/50">Trung bình/đơn</p>
              <p className="text-xl font-bold text-foreground">
                {stats.avgOrderValue.toLocaleString('vi-VN')}đ
              </p>
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
              <p className="text-xl font-bold text-foreground">{stats.completedOrders}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-divider p-5">
        <h3 className="font-semibold text-foreground mb-4">Chi tiết</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-content3">
            <span className="text-sm text-foreground/60">Tỷ lệ hoàn thành</span>
            <span className="font-medium text-foreground">
              {stats.totalOrders > 0
                ? Math.round((stats.completedOrders / stats.totalOrders) * 100)
                : 0}%
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-content3">
            <span className="text-sm text-foreground/60">Doanh thu trung bình/ngày</span>
            <span className="font-medium text-foreground">
              {stats.totalRevenue.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
