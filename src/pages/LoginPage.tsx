import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Monitor,
  Zap,
} from 'lucide-react';
import { db } from '../utils/database';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onShowToast }) => {
  const [username, setUsername] = useState('alex');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const performLogin = (u: string, p: string) => {
    if (!u.trim() || !p.trim()) {
      setErrorMessage('Please enter username and password.');
      return;
    }

    setIsLoading(true);
    let user = db.getUser(u);
    if (!user) {
      user = {
        id: `user-${Date.now()}`,
        username: u.toLowerCase(),
        role: 'user',
        name: u.charAt(0).toUpperCase() + u.slice(1),
        email: `${u.toLowerCase()}@desktop.internal`,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
    } else {
      user.lastLogin = new Date().toISOString();
    }

    const token = `jwt_token_${btoa(u + ':' + Date.now())}`;
    db.setCurrentUser(user, token);

    setTimeout(() => {
      setIsLoading(false);
      onShowToast('Session Authenticated', `Welcome back, ${user!.name}! Ellie Agent loaded.`, 'success');
      onLoginSuccess();
    }, 150);
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    performLogin(username, password);
  };

  const handleQuickDemoLogin = () => {
    setUsername('alex');
    setPassword('password123');
    performLogin('alex', 'password123');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/15 via-indigo-500/10 to-sky-400/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 text-white shadow-lg shadow-blue-500/25 mb-1 animate-pulse">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Ellie
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            The Personal Desktop AI Assistant
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/40 text-[11px] font-medium text-blue-700 dark:text-blue-300">
            <Monitor className="w-3.5 h-3.5" />
            <span>Universal Desktop Container (Windows • macOS • iOS)</span>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Workstation Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. alex"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Master Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>Remember session</span>
            </label>
            <span className="text-slate-400 text-[11px]">Local SQLite Auth</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all duration-200 transform active:scale-98"
          >
            {isLoading ? (
              <>
                <Cpu className="w-4 h-4 animate-spin" />
                <span>Initializing Ellie...</span>
              </>
            ) : (
              <>
                <span>Sign In to Workstation</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Option */}
        <div className="pt-2">
          <button
            onClick={handleQuickDemoLogin}
            type="button"
            className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors border border-slate-200/80 dark:border-slate-700"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Login as Alex (Lead Systems Admin)</span>
          </button>
        </div>

        {/* Feature Badges Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500 dark:text-slate-400">
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Sandboxed Files</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Cpu className="w-4 h-4 text-blue-500" />
            <span>RL Policy Engine</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
            <span>Gatekeeper Safe</span>
          </div>
        </div>
      </div>
    </div>
  );
};
