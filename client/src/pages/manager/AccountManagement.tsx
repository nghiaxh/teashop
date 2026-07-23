import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, Chip, Spinner } from '@heroui/react';
import { Plus, Users, Pencil, Prohibit } from '@phosphor-icons/react';
import api from '../../api/axios';
import type { User } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import Modal from '../../components/ui/Modal';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0 },
};

export default function AccountManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ username: '', password: '', name: '', role: 'staff' as 'staff' | 'manager', phone: '', email: '', gender: '' as '' | 'male' | 'female' | 'other', dateOfBirth: '', hireDate: '' });
  const [editData, setEditData] = useState({ name: '', role: 'staff' as 'staff' | 'manager', phone: '', email: '', gender: '' as '' | 'male' | 'female' | 'other', dateOfBirth: '', hireDate: '' });
  const [formErrors, setFormErrors] = useState<{ username?: string; password?: string; name?: string }>({});
  const { showToast } = useToast();

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data.users || []);
    } catch {
      showToast('Không thể tải danh sách nhân viên', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errors: typeof formErrors = {};
    if (!formData.username.trim()) errors.username = 'Tên đăng nhập không được để trống';
    if (!formData.password.trim()) errors.password = 'Mật khẩu không được để trống';
    if (!formData.name.trim()) errors.name = 'Họ tên không được để trống';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await api.post('/auth/register', formData);
      fetchUsers();
      closeModal();
      showToast('Thêm nhân viên thành công', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Thêm nhân viên thất bại', 'error');
    }
  };

  const handleEdit = async () => {
    if (!editingUser) return;
    if (!editData.name.trim()) {
      setFormErrors({ name: 'Họ tên không được để trống' });
      return;
    }
    try {
      await api.put(`/auth/${editingUser.id}`, editData);
      fetchUsers();
      closeEditModal();
      showToast('Cập nhật nhân viên thành công', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Cập nhật thất bại', 'error');
    }
  };

  const handleDeactivate = async (user: User) => {
    try {
      await api.delete(`/auth/${user.id}`);
      fetchUsers();
      showToast('Đã khóa tài khoản', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Khóa tài khoản thất bại', 'error');
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditData({
      name: user.name,
      role: user.role,
      phone: user.phone || '',
      email: user.email || '',
      gender: user.gender || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
      hireDate: user.hireDate ? user.hireDate.slice(0, 10) : ''
    });
    setFormErrors({});
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditData({ name: '', role: 'staff', phone: '', email: '', gender: '', dateOfBirth: '', hireDate: '' });
    setFormErrors({});
  };

  const closeModal = () => {
    setIsCreating(false);
    setFormData({ username: '', password: '', name: '', role: 'staff', phone: '', email: '', gender: '', dateOfBirth: '', hireDate: '' });
    setFormErrors({});
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
        <h2 className="text-2xl font-semibold tracking-tight">Quản lý Nhân viên</h2>
        <Button
          variant="primary"
          onClick={() => { setIsCreating(true); setFormErrors({}); }}
        >
          <Plus size={16} />
          Thêm nhân viên
        </Button>
      </div>

      {users.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <Users size={40} className="text-foreground/30 mb-3" />
          <p className="text-foreground/50">Chưa có nhân viên nào</p>
        </Card>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-divider">
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Tên</th>
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Tên đăng nhập</th>
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">SĐT</th>
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Email</th>
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Giới tính</th>
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Quyền</th>
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <motion.tr
                      key={user.id}
                      variants={item}
                      className="border-b border-divider/50 last:border-b-0 hover:bg-content2/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{user.name}</td>
                      <td className="px-4 py-3">{user.username}</td>
                      <td className="px-4 py-3 text-sm text-foreground/60">{user.phone || '-'}</td>
                      <td className="px-4 py-3 text-sm text-foreground/60">{user.email || '-'}</td>
                      <td className="px-4 py-3 text-sm text-foreground/60">
                        {user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Chip size="sm" variant="soft" color={user.role === 'manager' ? 'accent' : 'default'}>
                          {user.role === 'manager' ? 'Quản lý' : 'Nhân viên'}
                        </Chip>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditModal(user)}
                            aria-label="Sửa"
                            isDisabled={user.role === 'manager'}
                            className={user.role === 'manager' ? 'opacity-50' : ''}
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="danger-soft"
                            onClick={() => handleDeactivate(user)}
                            aria-label="Khóa"
                            isDisabled={user.role === 'manager'}
                            className={user.role === 'manager' ? 'opacity-50' : ''}
                          >
                            <Prohibit size={14} />
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
        open={isCreating}
        onClose={closeModal}
        title="Thêm nhân viên mới"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Hủy</Button>
            <Button variant="primary" onClick={handleSubmit}>Thêm mới</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Tên đăng nhập <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
            {formErrors.username && <p className="text-xs text-danger mt-1">{formErrors.username}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Mật khẩu <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            {formErrors.password && <p className="text-xs text-danger mt-1">{formErrors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Họ tên <span className="text-danger">*</span>
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
            <label className="block text-sm font-medium text-foreground mb-1.5">Quyền</label>
            <select
              className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'staff' | 'manager' })}
            >
              <option value="staff">Nhân viên</option>
              <option value="manager">Quản lý</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Số điện thoại</label>
              <input
                type="text"
                className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Giới tính</label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as '' | 'male' | 'female' | 'other' })}
              >
                <option value="">--</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Ngày sinh</label>
              <input
                type="date"
                className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Ngày vào làm</label>
              <input
                type="date"
                className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                value={formData.hireDate}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!editingUser}
        onClose={closeEditModal}
        title="Sửa nhân viên"
        footer={
          <>
            <Button variant="outline" onClick={closeEditModal}>Hủy</Button>
            <Button variant="primary" onClick={handleEdit}>Cập nhật</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Họ tên <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            />
            {formErrors.name && <p className="text-xs text-danger mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Quyền</label>
            <select
              className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              value={editData.role}
              onChange={(e) => setEditData({ ...editData, role: e.target.value as 'staff' | 'manager' })}
            >
              <option value="staff">Nhân viên</option>
              <option value="manager">Quản lý</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Số điện thoại</label>
              <input
                type="text"
                className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Giới tính</label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                value={editData.gender}
                onChange={(e) => setEditData({ ...editData, gender: e.target.value as '' | 'male' | 'female' | 'other' })}
              >
                <option value="">--</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Ngày sinh</label>
              <input
                type="date"
                className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                value={editData.dateOfBirth}
                onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Ngày vào làm</label>
              <input
                type="date"
                className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                value={editData.hireDate}
                onChange={(e) => setEditData({ ...editData, hireDate: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
