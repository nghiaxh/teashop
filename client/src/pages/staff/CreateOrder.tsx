import { useState, useEffect } from 'react';
import api from '../../api/axios';
import type { Product, CategoryType } from '../../types';

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
    return selectedCategory === 'all' || p.category === selectedCategory;
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
    <div className="flex gap-6">
      <div className="flex-1">
        <div className="tabs tabs-boxed mb-4">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              className={`tab ${selectedCategory === key ? 'tab-active' : ''}`}
              onClick={() => setSelectedCategory(key as CategoryType)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <div
              key={product._id}
              className="card bg-base-100 shadow cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleProductClick(product)}
            >
              <div className="card-body p-4">
                <div className="w-full h-24 bg-base-200 rounded flex items-center justify-center mb-2">
                  <span className="text-3xl">🍵</span>
                </div>
                <h3 className="card-title text-sm">{product.name}</h3>
                <p className="text-primary font-semibold">
                  {product.price.toLocaleString('vi-VN')}đ
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-96 bg-base-100 rounded-box shadow p-4 h-fit sticky top-6">
        <h3 className="text-lg font-bold mb-4">Đơn hàng</h3>

        {cart.length === 0 ? (
          <p className="text-base-content/60 text-center py-8">
            Chưa có món nào
          </p>
        ) : (
          <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between items-start p-3 bg-base-200 rounded">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.product.name}</p>
                  <p className="text-xs text-base-content/60">
                    Size {item.size} | Đường {item.sugarLevel}% | Đá {item.iceLevel}%
                  </p>
                  {item.toppings.length > 0 && (
                    <p className="text-xs text-base-content/60">
                      Topping: {item.toppings.map(t => t.name).join(', ')}
                    </p>
                  )}
                  <p className="text-xs text-base-content/60">x{item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">
                    {item.itemTotal.toLocaleString('vi-VN')}đ
                  </p>
                  <button
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => handleRemoveFromCart(index)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="divider"></div>
        <div className="flex justify-between font-bold text-lg">
          <span>Tổng:</span>
          <span className="text-primary">{totalAmount.toLocaleString('vi-VN')}đ</span>
        </div>
        <button
          className="btn btn-primary w-full mt-4"
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

      {selectedProduct && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{selectedProduct.name}</h3>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Size</span>
              </label>
              <div className="flex gap-2">
                {(['S', 'M', 'L'] as const).map(size => (
                  <button
                    key={size}
                    className={`btn ${orderSize === size ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setOrderSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Đường: {orderSugar}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="25"
                value={orderSugar}
                onChange={(e) => setOrderSugar(parseInt(e.target.value))}
                className="range range-primary"
              />
              <div className="flex justify-between text-xs">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Đá: {orderIce}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="25"
                value={orderIce}
                onChange={(e) => setOrderIce(parseInt(e.target.value))}
                className="range range-primary"
              />
              <div className="flex justify-between text-xs">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {selectedProduct.availableToppings.length > 0 && (
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Topping</span>
                </label>
                <div className="space-y-2">
                  {selectedProduct.availableToppings.map(topping => (
                    <label key={topping.name} className="flex items-center gap-2 cursor-pointer">
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
                      <span className="text-sm">{topping.name}</span>
                      <span className="text-xs text-base-content/60">+{topping.price.toLocaleString('vi-VN')}đ</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Số lượng</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-sm"
                  onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                >
                  -
                </button>
                <span className="font-bold">{orderQuantity}</span>
                <button
                  className="btn btn-sm"
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
