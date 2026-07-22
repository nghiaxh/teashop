import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Spinner } from '@heroui/react';
import { ShoppingBag, CurrencyDollar, TrendUp, CheckCircle } from '@phosphor-icons/react';
import api from '../../api/axios';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export default function Reports() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then((res) => {
      const orders = res.data.orders;
      const completed = orders.filter((o: any) => o.status === 'completed');
      const totalRevenue = completed.reduce((sum: number, o: any) => sum + o.totalAmount, 0);
      setStats({
        totalOrders: orders.length,
        totalRevenue,
        avgOrderValue: completed.length > 0 ? totalRevenue / completed.length : 0,
        completedOrders: completed.length,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const completionRate = stats.totalOrders > 0
    ? Math.round((stats.completedOrders / stats.totalOrders) * 100)
    : 0;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h2 className="text-2xl font-semibold tracking-tight">Báo cáo Doanh thu</h2>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
              <ShoppingBag size={18} weight="light" />
            </div>
            <div>
              <p className="text-xs text-foreground/50">Tổng đơn</p>
              <p className="text-xl font-semibold tracking-tight">{stats.totalOrders}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <CurrencyDollar size={18} className="text-success" weight="light" />
            </div>
            <div>
              <p className="text-xs text-foreground/50">Doanh thu</p>
              <p className="text-xl font-semibold tracking-tight">{stats.totalRevenue.toLocaleString('vi-VN')}đ</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <TrendUp size={18} className="text-accent" weight="light" />
            </div>
            <div>
              <p className="text-xs text-foreground/50">Trung bình/đơn</p>
              <p className="text-xl font-semibold tracking-tight">{stats.avgOrderValue.toLocaleString('vi-VN')}đ</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle size={18} className="text-success" weight="light" />
            </div>
            <div>
              <p className="text-xs text-foreground/50">Hoàn thành</p>
              <p className="text-xl font-semibold tracking-tight">{stats.completedOrders}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="p-5">
          <h3 className="font-semibold tracking-tight mb-4">Chi tiết</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-content3">
              <span className="text-sm text-foreground/60">Tỷ lệ hoàn thành</span>
              <span className="font-medium">{completionRate}%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-content3">
              <span className="text-sm text-foreground/60">Doanh thu trung bình/đơn</span>
              <span className="font-medium">{stats.avgOrderValue.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
