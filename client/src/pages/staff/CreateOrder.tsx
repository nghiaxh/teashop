import { useState, useEffect } from 'react';
import api from '../../api/axios';
import type { Product, CategoryType } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Trash, Pencil, Coffee, MagnifyingGlass } from '@phosphor-icons/react';
import { Spinner } from '@heroui/react';

interface CartItem {
  product: Product;
  size: 'S' | 'M' | 'L';
  quantity: number;
  toppings: Array<{ name: string; price: number; quantity: number }>;
  sugarLevel: number;
  iceLevel: number;
  itemTotal: number;
}

const categoryLabels: Record<CategoryType, string> = {
  'all': 'Tất cả',
  'tra-sua': 'Trà Sữa',
  'tra-trai-cay': 'Trà Trái Cây',
  'ca-phe': 'Cà Phê',
  'da-xay': 'Đá Xay',
  'topping': 'Topping'
};

export default function CreateOrder() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderSize, setOrderSize] = useState<'S' | 'M' | 'L'>('M');
  const [orderSugar, setOrderSugar] = useState(50);
  const [orderIce, setOrderIce] = useState(50);
  const [orderToppings, setOrderToppings] = useState<Array<{ name: string; price: number }>>([]);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [editingCartIndex, setEditingCartIndex] = useState<number | null>(null);
  const [orderNote, setOrderNote] = useState('');
  const [showOrderConfirm, setShowOrderConfirm] = useState(false);
  const { showToast } = useToast();

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/menu');
      setProducts(res.data.products);
    } catch (error) {
      showToast('Không thể tải danh sách sản phẩm', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setOrderSize('M');
    setOrderSugar(50);
    setOrderIce(50);
    setOrderToppings([]);
    setOrderQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    const basePrice = selectedProduct.price * orderQuantity;
    const toppingPrice = orderToppings.reduce((sum, t) => sum + t.price, 0);
    const itemTotal = basePrice + toppingPrice;

    const newItem: CartItem = {
      product: selectedProduct,
      size: orderSize,
      quantity: orderQuantity,
      toppings: orderToppings.map(t => ({ ...t, quantity: 1 })),
      sugarLevel: orderSugar,
      iceLevel: orderIce,
      itemTotal
    };

    if (editingCartIndex !== null) {
      const updated = [...cart];
      updated[editingCartIndex] = newItem;
      setCart(updated);
    } else {
      setCart([...cart, newItem]);
    }

    setSelectedProduct(null);
    setEditingCartIndex(null);
  };

  const handleEditCartItem = (index: number) => {
    const cartItem = cart[index];
    setSelectedProduct(cartItem.product);
    setOrderSize(cartItem.size);
    setOrderSugar(cartItem.sugarLevel);
    setOrderIce(cartItem.iceLevel);
    setOrderToppings(cartItem.toppings.map(t => ({ name: t.name, price: t.price })));
    setOrderQuantity(cartItem.quantity);
    setEditingCartIndex(index);
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
    if (editingCartIndex === index) {
      setEditingCartIndex(null);
      setSelectedProduct(null);
    } else if (editingCartIndex !== null && editingCartIndex > index) {
      setEditingCartIndex(editingCartIndex - 1);
    }
  };

  const handleCreateOrder = async () => {
    if (cart.length === 0) return;

    setSubmitting(true);
    try {
      const items = cart.map(item => ({
        product: item.product._id,
        size: item.size,
        quantity: item.quantity,
        toppings: item.toppings,
        sugarLevel: item.sugarLevel,
        iceLevel: item.iceLevel
      }));

      await api.post('/orders', { items, note: orderNote || undefined });
      setCart([]);
      setOrderNote('');
      showToast('Tạo đơn hàng thành công', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Tạo đơn hàng thất bại', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.itemTotal, 0);

  if (loading) return <LoadingState />;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 min-w-0">
        <div className="relative mb-4">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            placeholder="Tìm kiếm món..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-divider bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              className={`h-8 px-3 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === key
                  ? 'bg-primary text-white'
                  : 'bg-white border border-divider text-foreground hover:bg-content2'
              }`}
              onClick={() => setSelectedCategory(key as CategoryType)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredProducts.map(product => (
            <div
              key={product._id}
              className="bg-content1 rounded-xl border border-divider p-3 cursor-pointer hover:border-primary/40 hover:shadow-sm hover:shadow-primary/[0.04] active:scale-[0.98] transition-all duration-150"
              onClick={() => handleProductClick(product)}
            >
              <div className="w-full aspect-square bg-content2 rounded-lg overflow-hidden mb-2 relative">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : null}
                <div className={`absolute inset-0 flex items-center justify-center ${product.image ? 'hidden' : ''}`}>
                  <Coffee size={28} className="text-primary/40" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-foreground truncate">{product.name}</h3>
              <p className="text-sm font-semibold text-primary">
                {product.price.toLocaleString('vi-VN')}đ
              </p>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <EmptyState
            icon={<Coffee size={40} />}
            message="Không tìm thấy sản phẩm"
          />
        )}
      </div>

      <div className="w-full lg:w-80 shrink-0">
        <div className="bg-content1 rounded-xl border border-divider p-4 sticky top-0 shadow-sm shadow-black/[0.03]">
          <h3 className="font-semibold text-foreground mb-4">Đơn hàng</h3>

          {cart.length === 0 ? (
            <EmptyState icon={<Coffee size={32} />} message="Chưa có món nào" />
          ) : (
            <div className="space-y-2 mb-4 max-h-80 overflow-y-auto">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-start p-2.5 bg-content2 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.product.name}</p>
                    <p className="text-xs text-foreground/50">
                      Size {item.size} | Đường {item.sugarLevel}% | Đá {item.iceLevel}%
                    </p>
                    {item.toppings.length > 0 && (
                      <p className="text-xs text-foreground/50">
                        Topping: {item.toppings.map(t => t.name).join(', ')}
                      </p>
                    )}
                    <p className="text-xs text-foreground/50">x{item.quantity}</p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-sm font-semibold text-foreground">
                      {item.itemTotal.toLocaleString('vi-VN')}đ
                    </p>
                    <div className="flex gap-1 mt-0.5 justify-end">
                      <button
                        className="h-6 w-6 rounded flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
                        onClick={() => handleEditCartItem(index)}
                        aria-label="Sửa món"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        className="h-6 w-6 rounded flex items-center justify-center text-danger hover:bg-danger/10 transition-colors"
                        onClick={() => handleRemoveFromCart(index)}
                        aria-label="Xóa món"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-divider pt-3">
            <div className="mb-3">
              <textarea
                placeholder="Ghi chú đơn hàng (tùy chọn)"
                className="w-full h-16 px-3 py-2 rounded-lg border border-divider bg-white text-sm text-foreground placeholder-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="flex justify-between font-semibold text-foreground mb-3">
              <span>Tổng:</span>
              <span className="text-primary">{totalAmount.toLocaleString('vi-VN')}đ</span>
            </div>
            <button
              className="w-full h-10 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 flex items-center justify-center"
              onClick={() => setShowOrderConfirm(true)}
              disabled={cart.length === 0 || submitting}
            >
              {submitting ? <Spinner size="sm" color="current" /> : 'Tạo đơn'}
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={!!selectedProduct}
        onClose={() => { setSelectedProduct(null); setEditingCartIndex(null); }}
        title={editingCartIndex !== null ? `Sửa: ${selectedProduct?.name ?? ''}` : selectedProduct?.name ?? ''}
        footer={
          <>
            <button
              className="h-10 px-4 rounded-lg border border-divider bg-white text-foreground text-sm font-medium hover:bg-content2 transition-colors"
              onClick={() => { setSelectedProduct(null); setEditingCartIndex(null); }}
            >
              Hủy
            </button>
            <button
              className="h-10 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 active:scale-[0.98] transition-all duration-150"
              onClick={handleAddToCart}
            >
              {editingCartIndex !== null ? 'Cập nhật' : 'Thêm vào đơn'}
            </button>
          </>
        }
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">Size</label>
          <div className="flex gap-2">
            {(['S', 'M', 'L'] as const).map(size => (
              <button
                key={size}
                className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors ${
                  orderSize === size
                    ? 'bg-primary text-white'
                    : 'bg-white border border-divider text-foreground hover:bg-content2'
                }`}
                onClick={() => setOrderSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Đường: {orderSugar}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="25"
            value={orderSugar}
            onChange={(e) => setOrderSugar(parseInt(e.target.value))}
            className="w-full h-2 bg-content3 rounded-full appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[10px] text-foreground/40 mt-1">
            <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Đá: {orderIce}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="25"
            value={orderIce}
            onChange={(e) => setOrderIce(parseInt(e.target.value))}
            className="w-full h-2 bg-content3 rounded-full appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[10px] text-foreground/40 mt-1">
            <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
          </div>
        </div>

        {selectedProduct && selectedProduct.availableToppings.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">Topping</label>
            <div className="space-y-2">
              {selectedProduct.availableToppings.map(topping => (
                <label key={topping.name} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-content2 transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-divider text-primary focus:ring-primary"
                    checked={orderToppings.some(t => t.name === topping.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setOrderToppings([...orderToppings, topping]);
                      } else {
                        setOrderToppings(orderToppings.filter(t => t.name !== topping.name));
                      }
                    }}
                  />
                  <span className="text-sm flex-1">{topping.name}</span>
                  <span className="text-xs text-foreground/50">+{topping.price.toLocaleString('vi-VN')}đ</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">Số lượng</label>
          <div className="flex items-center gap-3">
            <button
              className="h-9 w-9 rounded-lg border border-divider bg-white text-foreground font-medium hover:bg-content2 transition-colors flex items-center justify-center"
              onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
            >
              -
            </button>
            <span className="font-semibold text-lg w-8 text-center">{orderQuantity}</span>
            <button
              className="h-9 w-9 rounded-lg border border-divider bg-white text-foreground font-medium hover:bg-content2 transition-colors flex items-center justify-center"
              onClick={() => setOrderQuantity(orderQuantity + 1)}
            >
              +
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={showOrderConfirm}
        onClose={() => setShowOrderConfirm(false)}
        onConfirm={() => { setShowOrderConfirm(false); handleCreateOrder(); }}
        title="Xác nhận tạo đơn"
        message={`${cart.length} món — Tổng: ${totalAmount.toLocaleString('vi-VN')}đ`}
        confirmLabel="Tạo đơn"
        confirmColor="bg-primary text-white hover:bg-primary/90"
      />
    </div>
  );
}
