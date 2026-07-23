import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, Chip, Spinner } from '@heroui/react';
import { Plus, Pencil, Trash, Package, Image } from '@phosphor-icons/react';
import api from '../../api/axios';
import type { Product } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import Modal from '../../components/ui/Modal';

const categoryLabels: Record<string, string> = {
  'tra-sua': 'Trà Sữa',
  'tra-trai-cay': 'Trà Trái Cây',
  'ca-phe': 'Cà Phê',
  'da-xay': 'Đá Xay',
  'topping': 'Topping',
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0 },
};

export default function MenuManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: 'tra-sua' as string, price: 0, image: '' });
  const [formErrors, setFormErrors] = useState<{ name?: string; price?: string }>({});
  const { showToast } = useToast();

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/menu');
      setProducts(res.data.products);
    } catch {
      showToast('Không thể tải danh sách sản phẩm', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errors: typeof formErrors = {};
    if (!formData.name.trim()) errors.name = 'Tên sản phẩm không được để trống';
    if (formData.price <= 0) errors.price = 'Giá phải lớn hơn 0';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (editingProduct) {
        await api.put(`/menu/${editingProduct._id}`, formData);
        showToast('Cập nhật sản phẩm thành công', 'success');
      } else {
        await api.post('/menu', formData);
        showToast('Thêm sản phẩm thành công', 'success');
      }
      fetchProducts();
      closeModal();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Lưu sản phẩm thất bại', 'error');
    }
  };

  const handleDelete = async (product: Product) => {
    try {
      await api.delete(`/menu/${product._id}`);
      fetchProducts();
      showToast('Xóa sản phẩm thành công', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Xóa sản phẩm thất bại', 'error');
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({ name: product.name, category: product.category, price: product.price, image: product.image || '' });
    setFormErrors({});
  };

  const closeModal = () => {
    setEditingProduct(null);
    setIsCreating(false);
    setFormData({ name: '', category: 'tra-sua', price: 0, image: '' });
    setFormErrors({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const modalOpen = !!editingProduct || isCreating;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Quản lý Menu</h2>
        <Button
          variant="primary"
          onClick={() => { setIsCreating(true); setFormErrors({}); }}
        >
          <Plus size={16} />
          Thêm sản phẩm
        </Button>
      </div>

      {products.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <Package size={40} className="text-foreground/30 mb-3" />
          <p className="text-foreground/50">Chưa có sản phẩm nào</p>
        </Card>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-divider">
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Tên</th>
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Ảnh</th>
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Danh mục</th>
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Giá</th>
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Trạng thái</th>
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <motion.tr
                      key={product._id}
                      variants={item}
                      className="border-b border-divider/50 last:border-b-0 hover:bg-content2/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-content2 flex items-center justify-center">
                            <Image size={16} className="text-foreground/30" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Chip size="sm" variant="soft" color="default">
                          {categoryLabels[product.category] || product.category}
                        </Chip>
                      </td>
                      <td className="px-4 py-3">{product.price.toLocaleString('vi-VN')}đ</td>
                      <td className="px-4 py-3">
                        <Chip size="sm" variant="soft" color={product.isActive ? 'success' : 'danger'}>
                          {product.isActive ? 'Đang bán' : 'Ngừng bán'}
                        </Chip>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button isIconOnly size="sm" variant="ghost" onClick={() => startEdit(product)} aria-label="Sửa">
                            <Pencil size={14} />
                          </Button>
                          <Button isIconOnly size="sm" variant="danger-soft" onClick={() => handleDelete(product)} aria-label="Xóa">
                            <Trash size={14} />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Hủy</Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingProduct ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Tên sản phẩm <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {formErrors.name && <p className="text-xs text-danger mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Danh mục</label>
            <select
              className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
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
              Giá (VNĐ) <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
            />
            {formErrors.price && <p className="text-xs text-danger mt-1">{formErrors.price}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Ảnh sản phẩm (URL)
            </label>
            <input
              type="text"
              className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              placeholder="https://..."
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            />
            {formData.image && (
              <img
                src={formData.image}
                alt="Preview"
                className="mt-2 w-16 h-16 rounded-lg object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'block'; }}
              />
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
