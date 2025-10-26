'use client';

import { useState } from 'react';
import { Zap, Eye, EyeOff, Sparkles, ArrowLeft, LogIn } from 'lucide-react';
import Link from 'next/link';
import { setUserSession } from '@/lib/auth';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/users?email=${encodeURIComponent(formData.email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.user) {
        // Simple password check (in production, use proper hashing)
        if (result.user.password === formData.password) {
          // Store user data with persistent login
          setUserSession(result.user, rememberMe);
          
          // Redirect to dashboard after successful login
          window.location.href = '/dashboard';
        } else {
          setErrors({ submit: 'Invalid email or password' });
        }
      } else {
        setErrors({ submit: 'User not found' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <span className="text-gray-600 font-medium">Back</span>
            </Link>
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="p-1.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">WordyFy</span>
              </div>
            </div>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      {/* Login Content */}
      <main className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-xl">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Sign in to continue your learning journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                errors.email ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="your@email.com"
              autoComplete="email"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-4 py-3 pr-12 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  errors.password ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm text-gray-700">Remember me</span>
            </label>
            <Link href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Forgot password?
            </Link>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Sign In</span>
                <LogIn className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Actions */}
        <div className="mt-8 space-y-4">
          <div className="text-center">
            <Link
              href="/signup"
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
            >
              Don't have an account? Create one
            </Link>
          </div>

          <div className="text-center">
            <button className="text-gray-500 hover:text-gray-700 text-sm">
              Forgot your password?
            </button>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 text-center">What you'll get:</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-gray-100">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-xs font-medium text-gray-900">Smart Learning</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-gray-100">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Zap className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-xs font-medium text-gray-900">Instant Quiz</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}