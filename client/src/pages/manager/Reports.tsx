import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, Spinner, Button } from '@heroui/react';
import { ShoppingBag, CurrencyDollar, TrendUp, CheckCircle, XCircle, Download } from '@phosphor-icons/react';
import * as XLSX from 'xlsx';
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

type DateFilter = 'all' | 'today' | 'week' | 'month';

const dateFilterLabels: Record<DateFilter, string> = {
  all: 'Tất cả',
  today: 'Hôm nay',
  week: 'Tuần này',
  month: 'Tháng này',
};

export default function Reports() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  useEffect(() => {
    api.get('/orders?limit=9999').then((res) => {
      setOrders(res.data.orders || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((o) => {
      if (dateFilter === 'all') return true;
      const d = new Date(o.createdAt);
      if (dateFilter === 'today') return d.toDateString() === now.toDateString();
      if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return d >= weekAgo;
      }
      if (dateFilter === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [orders, dateFilter]);

  const stats = useMemo(() => {
    const completed = filteredOrders.filter((o) => o.status === 'completed');
    const pending = filteredOrders.filter((o) => o.status === 'pending');
    const cancelled = filteredOrders.filter((o) => o.status === 'cancelled');
    const totalRevenue = completed.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      totalOrders: filteredOrders.length,
      completedOrders: completed.length,
      pendingOrders: pending.length,
      cancelledOrders: cancelled.length,
      totalRevenue,
      avgOrderValue: completed.length > 0 ? totalRevenue / completed.length : 0,
    };
  }, [filteredOrders]);

  const topProducts = useMemo(() => {
    const productMap = new Map<string, { name: string; count: number; revenue: number }>();
    for (const o of filteredOrders) {
      if (o.status !== 'completed') continue;
      for (const it of o.items) {
        const key = it.productName;
        const existing = productMap.get(key);
        if (existing) {
          existing.count += it.quantity;
          existing.revenue += it.itemTotal;
        } else {
          productMap.set(key, { name: it.productName, count: it.quantity, revenue: it.itemTotal });
        }
      }
    }
    return Array.from(productMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredOrders]);

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

  const exportToExcel = () => {
    const data = filteredOrders.map((o, i) => ({
      'STT': i + 1,
      'Ngày': new Date(o.createdAt).toLocaleDateString('vi-VN'),
      'Nhân viên': o.userId?.name || '',
      'Trạng thái': o.status === 'completed' ? 'Hoàn thành' : o.status === 'pending' ? 'Đang chờ' : 'Đã hủy',
      'Số lượng món': o.items.reduce((s, it) => s + it.quantity, 0),
      'Tổng tiền': o.totalAmount,
    }));

    data.push({
      'STT': '' as any,
      'Ngày': '' as any,
      'Nhân viên': '' as any,
      'Trạng thái': 'TỔNG CỘNG' as any,
      'Số lượng món': data.reduce((s, r) => s + (r['Số lượng món'] as number), 0) as any,
      'Tổng tiền': stats.totalRevenue as any,
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo doanh thu');

    ws['!cols'] = [
      { wch: 5 },
      { wch: 12 },
      { wch: 18 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
    ];

    XLSX.writeFile(wb, `bao-cao-doanh-thu-${dateFilter}.xlsx`);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Báo cáo Doanh thu</h2>
        <div className="flex gap-2">
          {(Object.keys(dateFilterLabels) as DateFilter[]).map((key) => (
            <button
              key={key}
              className={`h-8 px-3 rounded-lg text-sm font-medium transition-colors ${
                dateFilter === key
                  ? 'bg-primary text-white'
                  : 'bg-white border border-divider text-foreground hover:bg-content2'
              }`}
              onClick={() => setDateFilter(key)}
            >
              {dateFilterLabels[key]}
            </button>
          ))}
          <Button
            variant="primary"
            onClick={exportToExcel}
          >
            <Download size={16} />
            Xuất Excel
          </Button>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center">
              <XCircle size={18} className="text-danger" weight="light" />
            </div>
            <div>
              <p className="text-xs text-foreground/50">Đã hủy</p>
              <p className="text-xl font-semibold tracking-tight">{stats.cancelledOrders}</p>
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
              <span className="text-sm text-foreground/60">Tỷ lệ hủy</span>
              <span className="font-medium">{stats.totalOrders > 0 ? Math.round((stats.cancelledOrders / stats.totalOrders) * 100) : 0}%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-content3">
              <span className="text-sm text-foreground/60">Đơn đang chờ</span>
              <span className="font-medium">{stats.pendingOrders}</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {topProducts.length > 0 && (
        <motion.div variants={item}>
          <Card className="p-5">
            <h3 className="font-semibold tracking-tight mb-4">Top sản phẩm bán chạy</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-divider">
                    <th className="text-left px-3 py-2 text-foreground/60 font-medium">#</th>
                    <th className="text-left px-3 py-2 text-foreground/60 font-medium">Sản phẩm</th>
                    <th className="text-right px-3 py-2 text-foreground/60 font-medium">Đã bán</th>
                    <th className="text-right px-3 py-2 text-foreground/60 font-medium">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => (
                    <tr key={i} className="border-b border-divider/50 last:border-b-0">
                      <td className="px-3 py-2 text-foreground/50">{i + 1}</td>
                      <td className="px-3 py-2 font-medium">{p.name}</td>
                      <td className="px-3 py-2 text-right">{p.count}</td>
                      <td className="px-3 py-2 text-right">{p.revenue.toLocaleString('vi-VN')}đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
