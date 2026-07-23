import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, Spinner } from '@heroui/react';
import { BookOpen, Package, Users, CalendarCheck, ChartBar, ShoppingBag, CurrencyDollar, Clock, CheckCircle } from '@phosphor-icons/react';
import api from '../../api/axios';
import type { Order } from '../../types';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

const navLinks = [
  { to: '/manager/menu', label: 'Quản lý Menu', icon: BookOpen },
  { to: '/manager/inventory', label: 'Quản lý Kho', icon: Package },
  { to: '/manager/accounts', label: 'Quản lý Nhân viên', icon: Users },
  { to: '/manager/attendance', label: 'Quản lý Chấm công', icon: CalendarCheck },
  { to: '/manager/reports', label: 'Báo cáo', icon: ChartBar },
];

export default function ManagerDashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0, completedOrders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then((res) => {
      const orders: Order[] = res.data.orders || [];
      setStats({
        totalOrders: orders.filter((o) => o.status !== 'cancelled').length,
        totalRevenue: orders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.totalAmount, 0),
        pendingOrders: orders.filter((o) => o.status === 'pending').length,
        completedOrders: orders.filter((o) => o.status === 'completed').length,
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

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={item}>
        <h1 className="text-2xl font-semibold tracking-tight">Tổng quan</h1>
        <p className="text-sm text-foreground/50 mt-1">Quản lý cửa hàng của bạn</p>
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
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock size={18} className="text-warning" weight="light" />
            </div>
            <div>
              <p className="text-xs text-foreground/50">Chờ xử lý</p>
              <p className="text-xl font-semibold tracking-tight">{stats.pendingOrders}</p>
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
        <h2 className="text-lg font-semibold tracking-tight mb-4">Truy cập nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {navLinks.map((link) => (
            <Card key={link.to} className="p-4 hover:border-primary/50 transition-colors">
              <Link to={link.to} className="flex items-center gap-3 w-full h-auto py-1">
                <link.icon size={18} weight="light" />
                <span className="font-medium text-sm">{link.label}</span>
              </Link>
            </Card>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
