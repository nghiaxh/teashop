import { useState, useEffect } from 'react';
import api from '../../api/axios';
import type { Ingredient } from '../../types';
import { Plus, X, Pencil } from '@phosphor-icons/react';
import { Spinner } from '@heroui/react';

export default function InventoryManagement() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    unit: 'g',
    quantity: 0,
    reorderLevel: 0
  });

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const res = await api.get('/inventory');
      setIngredients(res.data.ingredients);
    } catch (error) {
      console.error('Failed to fetch ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingIngredient) {
        await api.put(`/inventory/${editingIngredient._id}`, formData);
      } else {
        await api.post('/inventory', formData);
      }
      fetchIngredients();
      setEditingIngredient(null);
      setIsCreating(false);
      setFormData({ name: '', unit: 'g', quantity: 0, reorderLevel: 0 });
    } catch (error) {
      console.error('Failed to save ingredient:', error);
    }
  };

  const startEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setFormData({
      name: ingredient.name,
      unit: ingredient.unit,
      quantity: ingredient.quantity,
      reorderLevel: ingredient.reorderLevel
    });
  };

  const getStockStatus = (quantity: number, reorderLevel: number) => {
    if (quantity <= 0) return { label: 'Hết', color: 'bg-danger/10 text-danger' };
    if (quantity <= reorderLevel) return { label: 'Sắp hết', color: 'bg-warning/10 text-warning' };
    return { label: 'Đủ', color: 'bg-success/10 text-success' };
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground">Quản lý Kho</h2>
        <button
          className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1"
          onClick={() => setIsCreating(true)}
        >
          <Plus size={16} />
          Thêm nguyên liệu
        </button>
      </div>

      <div className="bg-white rounded-xl border border-divider overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider">
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Tên</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Đơn vị</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Tồn kho</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Mức tối thiểu</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Trạng thái</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map(ingredient => {
                const status = getStockStatus(ingredient.quantity, ingredient.reorderLevel);
                const percentage = getStockPercentage(ingredient.quantity, ingredient.reorderLevel);
                return (
                  <tr key={ingredient._id} className="border-b border-divider/50 hover:bg-content2/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-sm">{ingredient.name}</td>
                    <td className="px-4 py-3 text-sm">{ingredient.unit}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{ingredient.quantity.toLocaleString()}</span>
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
                    <td className="px-4 py-3 text-sm">{ingredient.reorderLevel.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center h-5 px-2 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-content2 transition-colors" onClick={() => startEdit(ingredient)}>
                        <Pencil size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {(editingIngredient || isCreating) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setEditingIngredient(null); setIsCreating(false); }} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-foreground">
                {editingIngredient ? 'Sửa nguyên liệu' : 'Thêm nguyên liệu mới'}
              </h3>
              <button
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-content2 transition-colors"
                onClick={() => { setEditingIngredient(null); setIsCreating(false); }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Tên nguyên liệu
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
                  Đơn vị
                </label>
                <select
                  className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                  Số lượng
                </label>
                <input
                  type="number"
                  className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Mức tồn kho tối thiểu
                </label>
                <input
                  type="number"
                  className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                className="h-10 px-4 rounded-lg border border-divider bg-white text-foreground text-sm font-medium hover:bg-content2 transition-colors"
                onClick={() => { setEditingIngredient(null); setIsCreating(false); }}
              >
                Hủy
              </button>
              <button
                className="h-10 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                onClick={handleSubmit}
              >
                {editingIngredient ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
