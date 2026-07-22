import { useState, useEffect } from 'react';
import api from '../../api/axios';
import type { Order } from '../../types';
import Pagination from '../../components/Pagination';
import { usePagination } from '../../hooks/usePagination';

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
        return <span className="badge badge-success badge-sm">Hoàn thành</span>;
      case 'pending':
        return <span className="badge badge-warning badge-sm">Đang chờ</span>;
      case 'cancelled':
        return <span className="badge badge-error badge-sm">Đã hủy</span>;
      default:
        return <span className="badge badge-sm">{status}</span>;
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-base-content">Lịch sử đơn hàng</h2>
        {total > 0 && (
          <p className="text-sm text-base-content/50">
            Hiển thị {Math.min((currentPage - 1) * limit + 1, total)}-{Math.min(currentPage * limit, total)} / {total} đơn
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-base-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th className="text-base-content/60">#</th>
                <th className="text-base-content/60">Món</th>
                <th className="text-base-content/60">Size</th>
                <th className="text-base-content/60">Topping</th>
                <th className="text-base-content/60">Tổng</th>
                <th className="text-base-content/60">Trạng thái</th>
                <th className="text-base-content/60">Ngày</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order._id} className="hover">
                  <td className="text-base-content/50">{(currentPage - 1) * limit + index + 1}</td>
                  <td>
                    {order.items.map((item, i) => (
                      <div key={i} className="text-sm">
                        {item.quantity}x {item.productName}
                      </div>
                    ))}
                  </td>
                  <td>
                    {order.items.map((item, i) => (
                      <div key={i} className="text-sm">{item.size}</div>
                    ))}
                  </td>
                  <td>
                    {order.items.map((item, i) => (
                      <div key={i} className="text-sm">
                        {item.toppings.length > 0
                          ? item.toppings.map(t => t.name).join(', ')
                          : '-'}
                      </div>
                    ))}
                  </td>
                  <td className="font-semibold text-sm">
                    {order.totalAmount.toLocaleString('vi-VN')}đ
                  </td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td className="text-sm text-base-content/60">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12 text-base-content/40">
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
