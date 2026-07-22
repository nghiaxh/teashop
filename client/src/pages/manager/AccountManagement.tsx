import { useState, useEffect } from 'react';
import api from '../../api/axios';
import type { User } from '../../types';
import { Plus, X } from '@phosphor-icons/react';
import { Spinner } from '@heroui/react';

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
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground">Quản lý Nhân viên</h2>
        <button
          className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1"
          onClick={() => setIsCreating(true)}
        >
          <Plus size={16} />
          Thêm nhân viên
        </button>
      </div>

      <div className="bg-white rounded-xl border border-divider overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider">
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Tên</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Username</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Quyền</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-divider/50 hover:bg-content2/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-sm">{user.name}</td>
                  <td className="px-4 py-3 text-sm">{user.username}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center h-5 px-2 rounded-full text-xs font-medium ${
                      user.role === 'manager' ? 'bg-primary/10 text-primary' : 'border border-divider text-foreground/70'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center h-5 px-2 rounded-full text-xs font-medium bg-success/10 text-success">Hoạt động</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 text-foreground/40">
          Chưa có nhân viên nào
        </div>
      )}

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsCreating(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-foreground">Thêm nhân viên mới</h3>
              <button
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-content2 transition-colors"
                onClick={() => setIsCreating(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Họ tên
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
                  Quyền
                </label>
                <select
                  className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'staff' | 'manager' })}
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                className="h-10 px-4 rounded-lg border border-divider bg-white text-foreground text-sm font-medium hover:bg-content2 transition-colors"
                onClick={() => setIsCreating(false)}
              >
                Hủy
              </button>
              <button
                className="h-10 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                onClick={handleSubmit}
              >
                Thêm mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
