import { useState, useEffect } from 'react';
import api from '../../api/axios';
import type { Order } from '../../types';

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success">Hoàn thành</span>;
      case 'pending':
        return <span className="badge badge-warning">Đang chờ</span>;
      case 'cancelled':
        return <span className="badge badge-error">Đã hủy</span>;
      default:
        return <span className="badge">{status}</span>;
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
      <h2 className="text-2xl font-bold mb-6">Lịch sử đơn hàng</h2>

      <div className="overflow-x-auto bg-base-100 rounded-box shadow">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Món</th>
              <th>Size</th>
              <th>Topping</th>
              <th>Tổng</th>
              <th>Trạng thái</th>
              <th>Ngày</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order._id}>
                <th>{index + 1}</th>
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
                <td className="font-semibold">
                  {order.totalAmount.toLocaleString('vi-VN')}đ
                </td>
                <td>{getStatusBadge(order.status)}</td>
                <td>
                  {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-8 text-base-content/60">
          Chưa có đơn hàng nào
        </div>
      )}
    </div>
  );
}
