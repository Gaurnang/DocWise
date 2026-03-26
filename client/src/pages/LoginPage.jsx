import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, FileText } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/documents';
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid email or password');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-slate-custom-200 sticky top-0 z-50 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center">
              <FileText className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold text-slate-custom-900">DocWise</span>
          </Link>
          <p className="text-slate-custom-600">
            Don't have an account? <Link to="/signup" className="text-primary-600 font-semibold hover:text-primary-700 transition">Create one</Link>
          </p>
        </div>
      </nav>

      <div className="flex items-center justify-center px-4 py-20 md:py-28 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-custom-900 mb-3">Welcome Back</h1>
            <p className="text-slate-custom-600">Sign in to your DocWise account</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-custom-200 p-8 shadow-sm">
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
                <div className="w-1 h-1 bg-red-600 rounded-full" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-custom-900 mb-3">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 text-slate-custom-400 group-focus-within:text-primary-600 transition" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-custom-200 bg-slate-custom-50 text-slate-custom-900 placeholder-slate-custom-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white outline-none transition"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-slate-custom-900">Password</label>
                  <Link to="#" className="text-xs text-primary-600 hover:text-primary-700 transition font-medium">Forgot password?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 text-slate-custom-400 group-focus-within:text-primary-600 transition" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 rounded-lg border border-slate-custom-200 bg-slate-custom-50 text-slate-custom-900 placeholder-slate-custom-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white outline-none transition"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-custom-400 hover:text-slate-custom-600 transition"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-custom-200 accent-primary-600" />
                <label htmlFor="remember" className="text-sm text-slate-custom-700">Remember me</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary justify-center mt-8 text-base py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-custom-200 text-center">
              <p className="text-sm text-slate-custom-600">
                No account yet? <Link to="/signup" className="text-primary-600 font-semibold hover:text-primary-700 transition">Create for free</Link>
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs">
            <div className="p-3 bg-slate-custom-50 rounded-lg border border-slate-custom-200">
              <div className="font-semibold text-slate-custom-900">99.9%</div>
              <div className="text-slate-custom-600 text-xs mt-1">Uptime</div>
            </div>
            <div className="p-3 bg-slate-custom-50 rounded-lg border border-slate-custom-200">
              <div className="font-semibold text-slate-custom-900">256-bit</div>
              <div className="text-slate-custom-600 text-xs mt-1">Encryption</div>
            </div>
            <div className="p-3 bg-slate-custom-50 rounded-lg border border-slate-custom-200">
              <div className="font-semibold text-slate-custom-900">SOC 2</div>
              <div className="text-slate-custom-600 text-xs mt-1">Compliant</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
