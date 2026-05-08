import React, { useState } from 'react';
import { UtensilsCrossed, LogIn, Mail, Lock, User } from 'lucide-react';
import { authService } from '../lib/api';

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        await authService.register(email, password, fullName);
        // After registration, log in automatically or switch to login mode
        const res = await authService.login(email, password);
        onLoginSuccess(res.data.token, { email, displayName: fullName });
      } else {
        const res = await authService.login(email, password);
        onLoginSuccess(res.data.token, { email, displayName: email.split('@')[0] });
      }
    } catch (err: any) {
      setError(err.response?.data || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="w-16 h-16 bg-[#2563eb] rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
          <UtensilsCrossed className="text-white w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">Lake7 Restaurant</h1>
        <p className="text-slate-500 mb-8 text-center">
          {isRegistering ? 'Create an account to manage your restaurant' : 'Sign in to manage your restaurant orders'}
        </p>

        {error ? (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Your Name"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2563eb] text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-70 shadow-md shadow-blue-100"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                {isRegistering ? 'Create Account' : 'Sign In'}
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm font-semibold text-[#2563eb] hover:underline"
          >
            {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
}
