import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { authApi } from '@/services/api';
import { useAuth } from '@/store';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.register({ companyName, firstName, lastName, email, password });
      if (res.token) {
        localStorage.setItem('authToken', res.token);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-indigo-600" style={{ fontSize: 24, fontWeight: 700 }}>TalentSol</span>
        </div>
        <p className="text-gray-500" style={{ fontSize: 14 }}>Create your account</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-gray-900 mb-1" style={{ fontSize: 20, fontWeight: 600 }}>Get started</h2>
        <p className="text-gray-500 mb-6" style={{ fontSize: 13 }}>
          Start your 14-day free trial — no credit card required
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>
              Company Name
            </label>
            <input
              type="text"
              placeholder="Acme Corp"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              style={{ fontSize: 14 }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>
                First Name
              </label>
              <input
                type="text"
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                style={{ fontSize: 14 }}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>
                Last Name
              </label>
              <input
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                style={{ fontSize: 14 }}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>
              Work Email
            </label>
            <input
              type="email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              style={{ fontSize: 14 }}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
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

          {error && (
            <p className="text-red-600 text-center" style={{ fontSize: 13 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg transition-colors"
            style={{ fontSize: 14, fontWeight: 600 }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center mt-5 text-gray-500" style={{ fontSize: 13 }}>
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700" style={{ fontWeight: 500 }}>
            Sign in
          </Link>
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

export default Register;
