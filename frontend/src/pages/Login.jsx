import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Shield, User, Key, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    const res = await login(email, password);
    if (!res.success) {
      setError(res.error);
    }
    setLoading(false);
  };

  // Demo accounts for instant logging-in
  const demoAccounts = [
    { label: 'Management Admin', email: 'admin@talentai.com' },
    { label: 'HR Recruiter', email: 'recruiter@talentai.com' },
    { label: 'Employee', email: 'employee@talentai.com' },
    { label: 'Candidate', email: 'candidate@talentai.com' }
  ];

  const handleDemoClick = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 font-sans relative px-4">
      {/* Decorative gradient blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-600/20 rounded-2xl text-indigo-400 mb-3 border border-indigo-500/10">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h2>
          <p className="text-slate-400 text-sm mt-1">Sign in to your TalentAI HRMS portal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <User className="h-5 w-5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hr@talentai.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/5 bg-slate-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Key className="h-5 w-5" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/5 bg-slate-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:brightness-110 text-white font-bold transition-all shadow-lg shadow-indigo-500/10 disabled:opacity-50 flex justify-center items-center cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Fast Login */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <p className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Sandbox Access</p>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((account) => (
              <button
                key={account.label}
                onClick={() => handleDemoClick(account.email)}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900/40 border border-white/5 text-slate-300 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all text-left truncate flex items-center space-x-1.5"
              >
                <Shield className="h-3 w-3 text-indigo-400 shrink-0" />
                <span>{account.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
