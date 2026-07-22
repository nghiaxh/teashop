import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BowlSteam } from '@phosphor-icons/react';
import { Spinner } from '@heroui/react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-content2 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <BowlSteam size={32} weight="bold" className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">TeaShop</h1>
          <p className="text-sm text-foreground/50 mt-1">POS Management System</p>
        </div>

        <div className="bg-white rounded-2xl border border-divider p-6 shadow-sm shadow-black/[0.03]">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Username
              </label>
              <input
                type="text"
                placeholder="Nhập username"
                className="w-full h-11 px-3 rounded-lg border border-divider bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="Nhập password"
                className="w-full h-11 px-3 rounded-lg border border-divider bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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

        <div className="mt-6 text-center">
          <p className="text-[11px] text-foreground/40">
            Staff: staff01-15 | Manager: manager01-03 | Pass: 123456
          </p>
        </div>
      </div>
    </div>
  );
}
