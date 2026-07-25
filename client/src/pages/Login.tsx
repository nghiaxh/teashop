import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Spinner } from '@heroui/react';
import { Eye, EyeSlash } from '@phosphor-icons/react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<{ username?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('teashop_username');
    if (saved) {
      setUsername(saved);
      setRememberMe(true);
    }
  }, []);

  const validate = () => {
    const errors: typeof formErrors = {};
    if (!username.trim()) errors.username = 'Tên đăng nhập không được để trống';
    if (!password.trim()) errors.password = 'Mật khẩu không được để trống';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setError('');
    setLoading(true);

    try {
      const user = await login(username, password);

      if (rememberMe) {
        localStorage.setItem('teashop_username', username);
      } else {
        localStorage.removeItem('teashop_username');
      }

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
                className={`w-full h-11 px-3 rounded-lg border bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors ${formErrors.username ? 'border-danger' : 'border-divider'}`}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (formErrors.username) setFormErrors((prev) => ({ ...prev, username: undefined }));
                }}
              />
              {formErrors.username && <p className="text-xs text-danger mt-1">{formErrors.username}</p>}
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  className={`w-full h-11 px-3 pr-10 rounded-lg border bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors ${formErrors.password ? 'border-danger' : 'border-divider'}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formErrors.password && <p className="text-xs text-danger mt-1">{formErrors.password}</p>}
            </div>

            <div className="flex items-center gap-2 mb-5">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-divider"
              />
              <label htmlFor="rememberMe" className="text-sm text-foreground/60 cursor-pointer">
                Ghi nhớ đăng nhập
              </label>
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
