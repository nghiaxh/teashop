import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import LoadingState from '../../components/ui/LoadingState';
import { User, Phone, Envelope, GenderMale, Calendar, Briefcase } from '@phosphor-icons/react';

interface ProfileData {
  id: string;
  username: string;
  name: string;
  role: 'staff' | 'manager';
  phone?: string;
  email?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  hireDate?: string;
}

const genderLabels: Record<string, string> = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
};

const roleLabels: Record<string, string> = {
  staff: 'Nhân viên',
  manager: 'Quản lý',
};

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      setProfile(res.data.user);
    } catch {
      showToast('Không thể tải thông tin người dùng', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;

  const fields = [
    { icon: <User size={18} />, label: 'Họ tên', value: profile?.name },
    { icon: <User size={18} />, label: 'Tên đăng nhập', value: profile?.username },
    { icon: <Briefcase size={18} />, label: 'Vai trò', value: profile?.role ? roleLabels[profile.role] : '—' },
    { icon: <Phone size={18} />, label: 'Số điện thoại', value: profile?.phone },
    { icon: <Envelope size={18} />, label: 'Email', value: profile?.email },
    { icon: <GenderMale size={18} />, label: 'Giới tính', value: profile?.gender ? genderLabels[profile.gender] : undefined },
    { icon: <Calendar size={18} />, label: 'Ngày sinh', value: formatDate(profile?.dateOfBirth) },
    { icon: <Calendar size={18} />, label: 'Ngày vào làm', value: formatDate(profile?.hireDate) },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground tracking-tight">Thông tin cá nhân</h2>

      <div className="bg-content1 rounded-xl border border-divider p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-foreground text-primary-foreground flex items-center justify-center">
            <User size={24} weight="fill" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{profile?.name}</h3>
            <p className="text-sm text-foreground/50">@{profile?.username}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={field.label} className="flex items-start gap-3 p-3 rounded-lg bg-content2">
              <span className="text-foreground/40 mt-0.5">{field.icon}</span>
              <div className="min-w-0">
                <p className="text-xs text-foreground/50">{field.label}</p>
                <p className="text-sm font-medium text-foreground truncate">{field.value || '—'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
