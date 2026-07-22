import { useState, useEffect } from 'react';
import api from '../../api/axios';
import type { Ingredient } from '../../types';
import { Plus, X, Pencil } from '@phosphor-icons/react';

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
    if (quantity <= 0) return { label: 'Hết', color: 'badge-error' };
    if (quantity <= reorderLevel) return { label: 'Sắp hết', color: 'badge-warning' };
    return { label: 'Đủ', color: 'badge-success' };
  };

  const getStockPercentage = (quantity: number, reorderLevel: number) => {
    const max = reorderLevel * 2;
    return Math.min(100, (quantity / max) * 100);
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
        <h2 className="text-xl font-bold text-base-content">Quản lý Kho</h2>
        <button className="btn btn-primary btn-sm gap-1" onClick={() => setIsCreating(true)}>
          <Plus size={16} />
          Thêm nguyên liệu
        </button>
      </div>

      <div className="bg-white rounded-xl border border-base-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th className="text-base-content/60">Tên</th>
                <th className="text-base-content/60">Đơn vị</th>
                <th className="text-base-content/60">Tồn kho</th>
                <th className="text-base-content/60">Mức tối thiểu</th>
                <th className="text-base-content/60">Trạng thái</th>
                <th className="text-base-content/60">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map(ingredient => {
                const status = getStockStatus(ingredient.quantity, ingredient.reorderLevel);
                const percentage = getStockPercentage(ingredient.quantity, ingredient.reorderLevel);
                return (
                  <tr key={ingredient._id} className="hover">
                    <td className="font-medium text-sm">{ingredient.name}</td>
                    <td className="text-sm">{ingredient.unit}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{ingredient.quantity.toLocaleString()}</span>
                        <div className="w-16 h-1.5 bg-base-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              percentage <= 25 ? 'bg-error' : percentage <= 50 ? 'bg-warning' : 'bg-success'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="text-sm">{ingredient.reorderLevel.toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-sm ${status.color}`}>{status.label}</span>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-xs btn-square" onClick={() => startEdit(ingredient)}>
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
        <dialog className="modal modal-open">
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">
                {editingIngredient ? 'Sửa nguyên liệu' : 'Thêm nguyên liệu mới'}
              </h3>
              <button
                className="btn btn-ghost btn-sm btn-square"
                onClick={() => { setEditingIngredient(null); setIsCreating(false); }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-base-content mb-1.5">
                  Tên nguyên liệu
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
                  Đơn vị
                </label>
                <select
                  className="select select-bordered w-full"
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
                <label className="block text-sm font-medium text-base-content mb-1.5">
                  Số lượng
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-base-content mb-1.5">
                  Mức tồn kho tối thiểu
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => { setEditingIngredient(null); setIsCreating(false); }}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                {editingIngredient ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => { setEditingIngredient(null); setIsCreating(false); }}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
