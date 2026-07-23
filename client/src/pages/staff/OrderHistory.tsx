import { useState, useEffect } from 'react';
import api from '../../api/axios';
import type { Order } from '../../types';
import Badge from '../../components/ui/Badge';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { Eye } from '@phosphor-icons/react';
import { Button } from '@heroui/react';

const statusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  completed: { label: 'Hoàn thành', variant: 'success' },
  pending: { label: 'Đang chờ', variant: 'warning' },
  cancelled: { label: 'Đã hủy', variant: 'danger' },
};

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetail = async (orderId: string) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/orders/${orderId}`);
      setSelectedOrder(res.data.order);
    } catch (error) {
      console.error('Failed to fetch order detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const info = statusMap[status];
    if (info) return <Badge variant={info.variant}>{info.label}</Badge>;
    return <Badge>{status}</Badge>;
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Lịch sử đơn hàng</h2>
      </div>

      {orders.length === 0 ? (
        <EmptyState message="Chưa có đơn hàng nào" />
      ) : (
        <div className="bg-content1 rounded-xl border border-divider overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-divider">
                  <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">#</th>
                  <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Món</th>
                  <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Size</th>
                  <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Topping</th>
                  <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Tổng</th>
                  <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Ghi chú</th>
                  <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Trạng thái</th>
                  <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Ngày</th>
                  <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={order._id} className="border-b border-divider/50 last:border-b-0 hover:bg-content2/50 transition-colors">
                    <td className="px-4 py-3 text-foreground/50">{index + 1}</td>
                    <td className="px-4 py-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="text-sm">{item.quantity}x {item.productName}</div>
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
                          {item.toppings.length > 0 ? item.toppings.map(t => t.name).join(', ') : '-'}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3 font-semibold text-sm">
                      {order.totalAmount.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground/60 max-w-[120px] truncate" title={order.note}>
                      {order.note || '-'}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                    <td className="px-4 py-3 text-sm text-foreground/60">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        onClick={() => fetchOrderDetail(order._id)}
                        aria-label="Xem chi tiết"
                      >
                        <Eye size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={!!selectedOrder || detailLoading}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Đơn hàng #${selectedOrder._id.slice(-6).toUpperCase()}` : 'Chi tiết đơn hàng'}
        maxWidth="sm:max-w-lg"
      >
        {detailLoading && !selectedOrder ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : selectedOrder ? (
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-foreground/50">Ngày đặt:</span>
              <span>{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-foreground/50">Nhân viên:</span>
              <span>{selectedOrder.userId.name}</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-foreground/50">Trạng thái:</span>
              {getStatusBadge(selectedOrder.status)}
            </div>
            {selectedOrder.note && (
              <div className="text-sm">
                <span className="text-foreground/50">Ghi chú: </span>
                <span>{selectedOrder.note}</span>
              </div>
            )}

            <div className="border-t border-divider pt-3">
              <p className="text-sm font-medium text-foreground mb-2">Chi tiết món:</p>
              <div className="space-y-2">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="p-2.5 bg-content2 rounded-lg text-sm">
                    <div className="flex justify-between font-medium">
                      <span>{item.quantity}x {item.productName}</span>
                      <span>{item.itemTotal.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <p className="text-foreground/50 mt-1">
                      Size {item.size} | Đường {item.sugarLevel}% | Đá {item.iceLevel}%
                    </p>
                    {item.toppings.length > 0 && (
                      <p className="text-foreground/50">
                        Topping: {item.toppings.map(t => `${t.name} (+${t.price.toLocaleString('vi-VN')}đ)`).join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-divider pt-3 flex justify-between font-semibold">
              <span>Tổng cộng:</span>
              <span className="text-primary">{selectedOrder.totalAmount.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
