import { useState, useEffect } from 'react';
import api from '../../api/axios';
import type { Product } from '../../types';
import { Plus, X, Pencil, Trash } from '@phosphor-icons/react';
import { Spinner } from '@heroui/react';

const categoryLabels: Record<string, string> = {
  'tra-sua': 'Trà Sữa',
  'tra-trai-cay': 'Trà Trái Cây',
  'ca-phe': 'Cà Phê',
  'da-xay': 'Đá Xay',
  'topping': 'Topping'
};

export default function MenuManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'tra-sua' as string,
    price: 0
  });

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

  const handleSubmit = async () => {
    try {
      if (editingProduct) {
        await api.put(`/menu/${editingProduct._id}`, formData);
      } else {
        await api.post('/menu', formData);
      }
      fetchProducts();
      setEditingProduct(null);
      setIsCreating(false);
      setFormData({ name: '', category: 'tra-sua', price: 0 });
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    try {
      await api.delete(`/menu/${id}`);
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price
    });
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground">Quản lý Menu</h2>
        <button
          className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1"
          onClick={() => setIsCreating(true)}
        >
          <Plus size={16} />
          Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white rounded-xl border border-divider overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider">
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Tên</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Danh mục</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Giá</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Trạng thái</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id} className="border-b border-divider/50 hover:bg-content2/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-sm">{product.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center h-5 px-2 rounded-full text-xs font-medium border border-divider text-foreground/70">
                      {categoryLabels[product.category] || product.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{product.price.toLocaleString('vi-VN')}đ</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center h-5 px-2 rounded-full text-xs font-medium ${
                      product.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                    }`}>
                      {product.isActive ? 'Đang bán' : 'Ngừng bán'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-content2 transition-colors" onClick={() => startEdit(product)}>
                        <Pencil size={14} />
                      </button>
                      <button className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-danger/10 text-danger transition-colors" onClick={() => handleDelete(product._id)}>
                        <Trash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(editingProduct || isCreating) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setEditingProduct(null); setIsCreating(false); }} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-foreground">
                {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h3>
              <button
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-content2 transition-colors"
                onClick={() => { setEditingProduct(null); setIsCreating(false); }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Danh mục
                </label>
                <select
                  className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="tra-sua">Trà Sữa</option>
                  <option value="tra-trai-cay">Trà Trái Cây</option>
                  <option value="ca-phe">Cà Phê</option>
                  <option value="da-xay">Đá Xay</option>
                  <option value="topping">Topping</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Giá (VNĐ)
                </label>
                <input
                  type="number"
                  className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                className="h-10 px-4 rounded-lg border border-divider bg-white text-foreground text-sm font-medium hover:bg-content2 transition-colors"
                onClick={() => { setEditingProduct(null); setIsCreating(false); }}
              >
                Hủy
              </button>
              <button
                className="h-10 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                onClick={handleSubmit}
              >
                {editingProduct ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
