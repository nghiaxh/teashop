import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Ingredient } from '../../types';

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
        <h2 className="text-2xl font-bold">Quản lý Kho</h2>
        <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
          + Thêm nguyên liệu
        </button>
      </div>

      <div className="overflow-x-auto bg-base-100 rounded-box shadow">
        <table className="table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Đơn vị</th>
              <th>Số lượng</th>
              <th>Mức tối thiểu</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map(ingredient => (
              <tr key={ingredient._id}>
                <td className="font-medium">{ingredient.name}</td>
                <td>{ingredient.unit}</td>
                <td>{ingredient.quantity.toLocaleString()}</td>
                <td>{ingredient.reorderLevel.toLocaleString()}</td>
                <td>
                  {ingredient.quantity <= ingredient.reorderLevel ? (
                    <span className="badge badge-warning">Sắp hết</span>
                  ) : (
                    <span className="badge badge-success">Đủ</span>
                  )}
                </td>
                <td>
                  <button className="btn btn-ghost btn-xs" onClick={() => startEdit(ingredient)}>
                    Sửa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(editingIngredient || isCreating) && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              {editingIngredient ? 'Sửa nguyên liệu' : 'Thêm nguyên liệu mới'}
            </h3>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Tên nguyên liệu</span>
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
                <span className="label-text">Đơn vị</span>
              </label>
              <select
                className="select select-bordered"
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
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Số lượng</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Mức tồn kho tối thiểu</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })}
              />
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
