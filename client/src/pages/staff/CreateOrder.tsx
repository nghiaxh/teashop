import { useState, useEffect } from 'react';
import api from '../../api/axios';
import type { Product, CategoryType } from '../../types';
import { MagnifyingGlass, X, Trash } from '@phosphor-icons/react';

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/menu');
      setProducts(res.data.products);
    } catch (error) {
      console.error('Failed to fetch products:', error);
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

    setCart([...cart, {
      product: selectedProduct,
      size: orderSize,
      quantity: orderQuantity,
      toppings: orderToppings.map(t => ({ ...t, quantity: 1 })),
      sugarLevel: orderSugar,
      iceLevel: orderIce,
      itemTotal
    }]);

    setSelectedProduct(null);
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
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

      await api.post('/orders', { items });
      setCart([]);
      alert('Tạo đơn hàng thành công!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Tạo đơn hàng thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.itemTotal, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 min-w-0">
        <div className="mb-4">
          <div className="relative">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
            <input
              type="text"
              placeholder="Tìm kiếm món..."
              className="input input-bordered w-full pl-9 h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              className={`btn btn-sm whitespace-nowrap ${
                selectedCategory === key ? 'btn-primary' : 'btn-outline'
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
              className="bg-white rounded-xl border border-base-300 p-3 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => handleProductClick(product)}
            >
              <div className="w-full aspect-square bg-base-200 rounded-lg flex items-center justify-center mb-2">
                <span className="text-3xl">🍵</span>
              </div>
              <h3 className="text-sm font-medium text-base-content truncate">{product.name}</h3>
              <p className="text-sm font-semibold text-primary">
                {product.price.toLocaleString('vi-VN')}đ
              </p>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-base-content/40">
            Không tìm thấy sản phẩm
          </div>
        )}
      </div>

      <div className="w-full lg:w-80 shrink-0">
        <div className="bg-white rounded-xl border border-base-300 p-4 sticky top-0">
          <h3 className="font-semibold text-base-content mb-4">Đơn hàng</h3>

          {cart.length === 0 ? (
            <p className="text-sm text-base-content/40 text-center py-8">
              Chưa có món nào
            </p>
          ) : (
            <div className="space-y-2 mb-4 max-h-80 overflow-y-auto">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-start p-2.5 bg-base-200 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-base-content truncate">{item.product.name}</p>
                    <p className="text-xs text-base-content/50">
                      Size {item.size} | Đường {item.sugarLevel}% | Đá {item.iceLevel}%
                    </p>
                    {item.toppings.length > 0 && (
                      <p className="text-xs text-base-content/50">
                        Topping: {item.toppings.map(t => t.name).join(', ')}
                      </p>
                    )}
                    <p className="text-xs text-base-content/50">x{item.quantity}</p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-sm font-semibold text-base-content">
                      {item.itemTotal.toLocaleString('vi-VN')}đ
                    </p>
                    <button
                      className="text-error hover:text-error/80 mt-0.5"
                      onClick={() => handleRemoveFromCart(index)}
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-base-300 pt-3">
            <div className="flex justify-between font-semibold text-base-content mb-3">
              <span>Tổng:</span>
              <span className="text-primary">{totalAmount.toLocaleString('vi-VN')}đ</span>
            </div>
            <button
              className="btn btn-primary w-full"
              onClick={handleCreateOrder}
              disabled={cart.length === 0 || submitting}
            >
              {submitting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                'Tạo đơn'
              )}
            </button>
          </div>
        </div>
      </div>

      {selectedProduct && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{selectedProduct.name}</h3>
              <button
                className="btn btn-ghost btn-sm btn-square"
                onClick={() => setSelectedProduct(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-base-content mb-2">Size</label>
              <div className="flex gap-2">
                {(['S', 'M', 'L'] as const).map(size => (
                  <button
                    key={size}
                    className={`btn btn-sm flex-1 ${
                      orderSize === size ? 'btn-primary' : 'btn-outline'
                    }`}
                    onClick={() => setOrderSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-base-content mb-2">
                Đường: {orderSugar}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="25"
                value={orderSugar}
                onChange={(e) => setOrderSugar(parseInt(e.target.value))}
                className="range range-primary range-sm"
              />
              <div className="flex justify-between text-[10px] text-base-content/40 mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-base-content mb-2">
                Đá: {orderIce}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="25"
                value={orderIce}
                onChange={(e) => setOrderIce(parseInt(e.target.value))}
                className="range range-primary range-sm"
              />
              <div className="flex justify-between text-[10px] text-base-content/40 mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {selectedProduct.availableToppings.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-base-content mb-2">Topping</label>
                <div className="space-y-2">
                  {selectedProduct.availableToppings.map(topping => (
                    <label key={topping.name} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-base-200">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm"
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
                      <span className="text-xs text-base-content/50">+{topping.price.toLocaleString('vi-VN')}đ</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-base-content mb-2">Số lượng</label>
              <div className="flex items-center gap-3">
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                >
                  -
                </button>
                <span className="font-semibold text-lg w-8 text-center">{orderQuantity}</span>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => setOrderQuantity(orderQuantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setSelectedProduct(null)}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleAddToCart}>
                Thêm vào đơn
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setSelectedProduct(null)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
