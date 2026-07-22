import { useState, useEffect } from 'react';
import api from '../../api/axios';
import type { Product } from '../../types';
import { Plus, X, Pencil, Trash } from '@phosphor-icons/react';

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
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-base-content">Quản lý Menu</h2>
        <button className="btn btn-primary btn-sm gap-1" onClick={() => setIsCreating(true)}>
          <Plus size={16} />
          Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white rounded-xl border border-base-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th className="text-base-content/60">Tên</th>
                <th className="text-base-content/60">Danh mục</th>
                <th className="text-base-content/60">Giá</th>
                <th className="text-base-content/60">Trạng thái</th>
                <th className="text-base-content/60">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id} className="hover">
                  <td className="font-medium text-sm">{product.name}</td>
                  <td>
                    <span className="badge badge-outline badge-sm">
                      {categoryLabels[product.category] || product.category}
                    </span>
                  </td>
                  <td className="text-sm">{product.price.toLocaleString('vi-VN')}đ</td>
                  <td>
                    <span className={`badge badge-sm ${product.isActive ? 'badge-success' : 'badge-error'}`}>
                      {product.isActive ? 'Đang bán' : 'Ngừng bán'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-xs btn-square" onClick={() => startEdit(product)}>
                        <Pencil size={14} />
                      </button>
                      <button className="btn btn-ghost btn-xs btn-square text-error" onClick={() => handleDelete(product._id)}>
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
        <dialog className="modal modal-open">
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">
                {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h3>
              <button
                className="btn btn-ghost btn-sm btn-square"
                onClick={() => { setEditingProduct(null); setIsCreating(false); }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-base-content mb-1.5">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-base-content mb-1.5">
                  Danh mục
                </label>
                <select
                  className="select select-bordered w-full"
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
                <label className="block text-sm font-medium text-base-content mb-1.5">
                  Giá (VNĐ)
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => { setEditingProduct(null); setIsCreating(false); }}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                {editingProduct ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => { setEditingProduct(null); setIsCreating(false); }}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
