import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BowlSteam } from '@phosphor-icons/react';

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
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary flex items-center justify-center">
            <BowlSteam size={32} weight="bold" className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-base-content">TeaShop</h1>
          <p className="text-sm text-base-content/50 mt-1">POS Management System</p>
        </div>

        <div className="bg-white rounded-2xl border border-base-300 p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-base-content mb-1.5">
                Username
              </label>
              <input
                type="text"
                placeholder="Nhập username"
                className="input input-bordered w-full h-11"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-base-content mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="Nhập password"
                className="input input-bordered w-full h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="alert alert-error mb-4 text-sm py-2">
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className={`btn btn-primary w-full h-11 ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                'Đăng Nhập'
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[11px] text-base-content/40">
            Staff: staff01-15 | Manager: manager01-03 | Pass: 123456
          </p>
        </div>
      </div>
    </div>
  );
}
