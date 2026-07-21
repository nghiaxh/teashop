import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { User } from '../../types';

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
      const res = await api.get('/auth/me');
      const currentUser = res.data.user;
      setUsers([currentUser]);
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản lý Nhân viên</h2>
        <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
          + Thêm nhân viên
        </button>
      </div>

      <div className="overflow-x-auto bg-base-100 rounded-box shadow">
        <table className="table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Username</th>
              <th>Quyền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="font-medium">{user.name}</td>
                <td>{user.username}</td>
                <td>
                  <span className={`badge ${user.role === 'manager' ? 'badge-primary' : 'badge-outline'}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className="badge badge-success">Hoạt động</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isCreating && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Thêm nhân viên mới</h3>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                className="input input-bordered"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Họ tên</span>
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
                <span className="label-text">Quyền</span>
              </label>
              <select
                className="select select-bordered"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'staff' | 'manager' })}
              >
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
              </select>
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
