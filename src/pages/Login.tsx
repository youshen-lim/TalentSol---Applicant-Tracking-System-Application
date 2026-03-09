import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { useAuth } from '@/store';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col items-center justify-center px-4">

      {/* Brand */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-indigo-600" style={{ fontSize: 24, fontWeight: 700 }}>TalentSol</span>
        </div>
        <p className="text-gray-500" style={{ fontSize: 14 }}>Sign in to your account</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-gray-900 mb-1" style={{ fontSize: 20, fontWeight: 600 }}>Login</h2>
        <p className="text-gray-500 mb-6" style={{ fontSize: 13 }}>
          Enter your credentials to access your account
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>
              Email
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              style={{ fontSize: 14 }}
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-gray-700" style={{ fontSize: 13, fontWeight: 500 }}>Password</label>
              <button
                type="button"
                className="text-indigo-600 hover:text-indigo-700 transition-colors"
                style={{ fontSize: 12 }}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 pr-10 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                style={{ fontSize: 14 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 accent-indigo-600"
            />
            <label htmlFor="remember" className="text-gray-600 cursor-pointer" style={{ fontSize: 13 }}>
              Remember me
            </label>
          </div>

          {error && (
            <p className="text-red-600 text-center" style={{ fontSize: 13 }}>{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg transition-colors"
            style={{ fontSize: 14, fontWeight: 600 }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center mt-5 text-gray-500" style={{ fontSize: 13 }}>
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-700" style={{ fontWeight: 500 }}>
            Sign up
          </Link>
        </p>

        <p className="text-center mt-3 text-gray-400" style={{ fontSize: 11 }}>
          By signing in, you agree to our{' '}
          <span className="text-indigo-500 cursor-pointer">Terms of Service</span>
          {' '}and{' '}
          <span className="text-indigo-500 cursor-pointer">Privacy Policy</span>
        </p>
      </div>

      <button
        onClick={() => navigate('/')}
        className="mt-6 text-gray-500 hover:text-gray-700 transition-colors"
        style={{ fontSize: 13 }}
      >
        Back to home
      </button>
    </div>
  );
};

export default Login;
