import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Check, FileText } from 'lucide-react';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/documents';
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Registration failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Signup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = formData.password.length >= 8;

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
            Already a member? <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 transition">Sign in</Link>
          </p>
        </div>
      </nav>

      <div className="flex items-center justify-center px-4 py-20 md:py-28 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-custom-900 mb-3">Create Your Account</h1>
            <p className="text-slate-custom-600">Join thousands of teams already collaborating</p>
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
                <label className="block text-sm font-semibold text-slate-custom-900 mb-3">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-3.5 text-slate-custom-400 group-focus-within:text-primary-600 transition" size={20} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-custom-200 bg-slate-custom-50 text-slate-custom-900 placeholder-slate-custom-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white outline-none transition"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-custom-900 mb-3">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 text-slate-custom-400 group-focus-within:text-primary-600 transition" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-custom-200 bg-slate-custom-50 text-slate-custom-900 placeholder-slate-custom-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white outline-none transition"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-custom-900 mb-3">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 text-slate-custom-400 group-focus-within:text-primary-600 transition" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
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
                {formData.password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className={`text-xs font-medium ${passwordStrength ? 'text-accent-600' : 'text-yellow-600'}`}>
                      {passwordStrength ? '✓ Strong password' : 'Medium strength'}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-custom-900 mb-3">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 text-slate-custom-400 group-focus-within:text-primary-600 transition" size={20} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3 rounded-lg border border-slate-custom-200 bg-slate-custom-50 text-slate-custom-900 placeholder-slate-custom-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white outline-none transition"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-3.5 text-slate-custom-400 hover:text-slate-custom-600 transition"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formData.password && formData.confirmPassword === formData.password && (
                  <div className="mt-2 flex items-center gap-2 text-accent-600 text-xs font-medium">
                    <Check size={16} /> Passwords match
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3 pt-2">
                <input type="checkbox" id="terms" className="w-4 h-4 rounded border-slate-custom-200 accent-primary-600 mt-1" />
                <label htmlFor="terms" className="text-sm text-slate-custom-700">
                  I agree to the <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">Terms of Service</a> and <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">Privacy Policy</a>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary justify-center mt-8 text-base py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Account'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-custom-200 text-center">
              <p className="text-sm text-slate-custom-600">
                Already a member? <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 transition">Sign in</Link>
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3 text-sm text-slate-custom-600">
            <div className="flex items-center gap-3">
              <Check size={16} className="text-accent-600 flex-shrink-0" />
              <span>Free forever basic plan</span>
            </div>
            <div className="flex items-center gap-3">
              <Check size={16} className="text-accent-600 flex-shrink-0" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-3">
              <Check size={16} className="text-accent-600 flex-shrink-0" />
              <span>Premium support included</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
