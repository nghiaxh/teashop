import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Product, CategoryType } from '../../types';

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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản lý Menu</h2>
        <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
          + Thêm sản phẩm
        </button>
      </div>

      <div className="overflow-x-auto bg-base-100 rounded-box shadow">
        <table className="table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td className="font-medium">{product.name}</td>
                <td>
                  <span className="badge badge-outline">
                    {categoryLabels[product.category] || product.category}
                  </span>
                </td>
                <td>{product.price.toLocaleString('vi-VN')}đ</td>
                <td>
                  <span className={`badge ${product.isActive ? 'badge-success' : 'badge-error'}`}>
                    {product.isActive ? 'Đang bán' : 'Ngừng bán'}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-ghost btn-xs" onClick={() => startEdit(product)}>
                      Sửa
                    </button>
                    <button className="btn btn-ghost btn-xs text-error" onClick={() => handleDelete(product._id)}>
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(editingProduct || isCreating) && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h3>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Tên sản phẩm</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Danh mục</span>
              </label>
              <select
                className="select select-bordered"
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
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Giá (VNĐ)</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
              />
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
