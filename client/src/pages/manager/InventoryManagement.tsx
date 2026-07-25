import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, Chip, Spinner } from '@heroui/react';
import { Plus, Pencil, Package } from '@phosphor-icons/react';
import api from '../../api/axios';
import type { Ingredient } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/Pagination';
import { usePagination } from '../../hooks/usePagination';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0 },
};

export default function InventoryManagement() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', unit: 'g', quantity: 0, reorderLevel: 0 });
  const [formErrors, setFormErrors] = useState<{ name?: string; quantity?: string; reorderLevel?: string }>({});
  const [totalItems, setTotalItems] = useState(0);
  const { showToast } = useToast();
  const { currentPage, totalPages, paginationRange, goToPage, goToNextPage, goToPreviousPage, hasNextPage, hasPreviousPage } = usePagination({ totalItems, itemsPerPage: 20 });

  useEffect(() => { fetchIngredients(); }, [currentPage]);

  const fetchIngredients = async () => {
    try {
      const res = await api.get('/inventory', { params: { page: currentPage, limit: 20 } });
      setIngredients(res.data.ingredients);
      setTotalItems(res.data.total || 0);
    } catch {
      showToast('Không thể tải danh sách nguyên liệu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errors: typeof formErrors = {};
    if (!formData.name.trim()) errors.name = 'Tên nguyên liệu không được để trống';
    if (formData.quantity < 0) errors.quantity = 'Số lượng không được âm';
    if (formData.reorderLevel < 0) errors.reorderLevel = 'Mức tối thiểu không được âm';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (editingIngredient) {
        await api.put(`/inventory/${editingIngredient._id}`, formData);
        showToast('Cập nhật nguyên liệu thành công', 'success');
      } else {
        await api.post('/inventory', formData);
        showToast('Thêm nguyên liệu thành công', 'success');
      }
      fetchIngredients();
      closeModal();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Lưu nguyên liệu thất bại', 'error');
    }
  };

  const startEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setFormData({ name: ingredient.name, unit: ingredient.unit, quantity: ingredient.quantity, reorderLevel: ingredient.reorderLevel });
    setFormErrors({});
  };

  const closeModal = () => {
    setEditingIngredient(null);
    setIsCreating(false);
    setFormData({ name: '', unit: 'g', quantity: 0, reorderLevel: 0 });
    setFormErrors({});
  };

  const getStockStatus = (quantity: number, reorderLevel: number) => {
    if (quantity <= 0) return { label: 'Hết', color: 'danger' as const };
    if (quantity <= reorderLevel) return { label: 'Sắp hết', color: 'warning' as const };
    return { label: 'Đủ', color: 'success' as const };
  };

  const getStockPercentage = (quantity: number, reorderLevel: number) => {
    const max = reorderLevel * 2;
    return Math.min(100, (quantity / max) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const modalOpen = !!editingIngredient || isCreating;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Quản lý Kho</h2>
        <Button
          variant="primary"
          onClick={() => { setIsCreating(true); setFormErrors({}); }}
        >
          <Plus size={16} />
          Thêm nguyên liệu
        </Button>
      </div>

      {ingredients.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <Package size={40} className="text-foreground/30 mb-3" />
          <p className="text-foreground/50">Chưa có nguyên liệu nào</p>
        </Card>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-divider">
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Tên</th>
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Đơn vị</th>
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Tồn kho</th>
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Mức tối thiểu</th>
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Trạng thái</th>
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ingredient) => {
                    const status = getStockStatus(ingredient.quantity, ingredient.reorderLevel);
                    const percentage = getStockPercentage(ingredient.quantity, ingredient.reorderLevel);
                    return (
                      <motion.tr
                        key={ingredient._id}
                        variants={item}
                        className="border-b border-divider/50 last:border-b-0 hover:bg-content2/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium">{ingredient.name}</td>
                        <td className="px-4 py-3">{ingredient.unit}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{ingredient.quantity.toLocaleString()}</span>
                            <div className="w-16 h-1.5 bg-content3 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  percentage <= 25 ? 'bg-danger' : percentage <= 50 ? 'bg-warning' : 'bg-success'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{ingredient.reorderLevel.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <Chip size="sm" variant="soft" color={status.color}>{status.label}</Chip>
                        </td>
                        <td className="px-4 py-3">
                          <Button isIconOnly size="sm" variant="ghost" onClick={() => startEdit(ingredient)} aria-label="Sửa">
                            <Pencil size={14} />
                          </Button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

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

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingIngredient ? 'Sửa nguyên liệu' : 'Thêm nguyên liệu mới'}
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Hủy</Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingIngredient ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Tên nguyên liệu <span className="text-danger">*</span>
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
            <label className="block text-sm font-medium text-foreground mb-1.5">Đơn vị</label>
            <select
              className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            >
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="ml">ml</option>
              <option value="l">l</option>
              <option value="pcs">cái</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Số lượng <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
            />
            {formErrors.quantity && <p className="text-xs text-danger mt-1">{formErrors.quantity}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Mức tồn kho tối thiểu <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              value={formData.reorderLevel}
              onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })}
            />
            {formErrors.reorderLevel && <p className="text-xs text-danger mt-1">{formErrors.reorderLevel}</p>}
          </div>
        </div>
      </Modal>
    </div>
  );
}
