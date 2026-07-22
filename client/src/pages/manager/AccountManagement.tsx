import { useState, useEffect } from 'react';
import api from '../../api/axios';
import type { User } from '../../types';
import { Plus, X } from '@phosphor-icons/react';

export default function AccountManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'staff' as 'staff' | 'manager'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await api.post('/auth/register', formData);
      fetchUsers();
      setIsCreating(false);
      setFormData({ username: '', password: '', name: '', role: 'staff' });
    } catch (error) {
      console.error('Failed to create user:', error);
    }
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
        <h2 className="text-xl font-bold text-base-content">Quản lý Nhân viên</h2>
        <button className="btn btn-primary btn-sm gap-1" onClick={() => setIsCreating(true)}>
          <Plus size={16} />
          Thêm nhân viên
        </button>
      </div>

      <div className="bg-white rounded-xl border border-base-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th className="text-base-content/60">Tên</th>
                <th className="text-base-content/60">Username</th>
                <th className="text-base-content/60">Quyền</th>
                <th className="text-base-content/60">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="hover">
                  <td className="font-medium text-sm">{user.name}</td>
                  <td className="text-sm">{user.username}</td>
                  <td>
                    <span className={`badge badge-sm ${user.role === 'manager' ? 'badge-primary' : 'badge-outline'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-success badge-sm">Hoạt động</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 text-base-content/40">
          Chưa có nhân viên nào
        </div>
      )}

      {isCreating && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Thêm nhân viên mới</h3>
              <button
                className="btn btn-ghost btn-sm btn-square"
                onClick={() => setIsCreating(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-base-content mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-base-content mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-base-content mb-1.5">
                  Họ tên
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
                  Quyền
                </label>
                <select
                  className="select select-bordered w-full"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'staff' | 'manager' })}
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
            </div>

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setIsCreating(false)}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                Thêm mới
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setIsCreating(false)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
