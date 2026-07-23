import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Spinner } from '@heroui/react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(username, password);
      navigate(user.role === 'manager' ? '/manager' : '/');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Đăng nhập thất bại';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-content2 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-divider p-6 shadow-sm shadow-black/3">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Tên đăng nhập
              </label>
              <input
                type="text"
                placeholder="Nhập tên đăng nhập"
                className="w-full h-11 px-3 rounded-lg border border-divider bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Mật khẩu
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                className="w-full h-11 px-3 rounded-lg border border-divider bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-danger/10 text-danger text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full h-11 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <Spinner size="sm" color="current" />
              ) : (
                'Đăng Nhập'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
