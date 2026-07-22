import { useState, useEffect } from 'react';
import api from '../../api/axios';
import type { Order } from '../../types';
import Pagination from '../../components/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { Spinner } from '@heroui/react';

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const {
    currentPage,
    totalPages,
    paginationRange,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    hasNextPage,
    hasPreviousPage
  } = usePagination({ totalItems: total, itemsPerPage: limit });

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orders?page=${currentPage}&limit=${limit}`);
      setOrders(res.data.orders);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center h-5 px-2 rounded-full text-xs font-medium bg-success/10 text-success">Hoàn thành</span>;
      case 'pending':
        return <span className="inline-flex items-center h-5 px-2 rounded-full text-xs font-medium bg-warning/10 text-warning">Đang chờ</span>;
      case 'cancelled':
        return <span className="inline-flex items-center h-5 px-2 rounded-full text-xs font-medium bg-danger/10 text-danger">Đã hủy</span>;
      default:
        return <span className="inline-flex items-center h-5 px-2 rounded-full text-xs font-medium bg-content3 text-foreground/60">{status}</span>;
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Lịch sử đơn hàng</h2>
        {total > 0 && (
          <p className="text-sm text-foreground/50">
            Hiển thị {Math.min((currentPage - 1) * limit + 1, total)}-{Math.min(currentPage * limit, total)} / {total} đơn
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-divider overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider">
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">#</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Món</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Size</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Topping</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Tổng</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Trạng thái</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Ngày</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order._id} className="border-b border-divider/50 hover:bg-content2/50 transition-colors">
                  <td className="px-4 py-3 text-foreground/50">{(currentPage - 1) * limit + index + 1}</td>
                  <td className="px-4 py-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="text-sm">
                        {item.quantity}x {item.productName}
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="text-sm">{item.size}</div>
                    ))}
                  </td>
                  <td className="px-4 py-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="text-sm">
                        {item.toppings.length > 0
                          ? item.toppings.map(t => t.name).join(', ')
                          : '-'}
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-3 font-semibold text-sm">
                    {order.totalAmount.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                  <td className="px-4 py-3 text-sm text-foreground/60">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12 text-foreground/40">
          Chưa có đơn hàng nào
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            paginationRange={paginationRange}
            onPageChange={goToPage}
            onPrevious={goToPreviousPage}
            onNext={goToNextPage}
            hasNext={hasNextPage}
            hasPrevious={hasPreviousPage}
          />
        </div>
      )}
    </div>
  );
}
