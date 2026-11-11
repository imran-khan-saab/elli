import React, { useState } from 'react';
import {
  User,
  Laptop,
  Smartphone,
  ShieldCheck,
  Activity,
  Terminal,
  HardDrive,
  Clock,
  Sparkles,
  Key,
  CheckCircle2,
  Edit3,
} from 'lucide-react';

interface ProfilePageProps {
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  platform: 'mac' | 'windows' | 'ios' | 'linux';
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onShowToast, platform }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Alex Mercer',
    title: 'Lead Systems Architect & DevOps',
    email: 'alex.mercer@desktop.internal',
    location: 'San Francisco, CA (PST)',
    bio: 'Power user automating local workflows with Ellie Personal Desktop Assistant.',
  });

  const handleSaveProfile = () => {
    setIsEditing(false);
    onShowToast('Profile Updated', 'User profile details successfully synchronized.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-l from-blue-500/10 via-indigo-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                AM
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {profile.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  Pro Desktop Tier
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-500">{profile.title}</p>
              <p className="text-xs text-slate-400 font-mono">{profile.email}</p>
            </div>
          </div>

          <div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4 text-slate-500" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>

        {/* In-line Edit Form */}
        {isEditing && (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Role Title
              </label>
              <input
                type="text"
                value={profile.title}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium"
              >
                Save Profile
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lifetime Activity Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-400 block mb-1">Commands Executed</span>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100">1,429</div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            +18% this month
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-400 block mb-1">Files Managed</span>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100">312</div>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
            Safe file sandboxing
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-400 block mb-1">Storage Optimized</span>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100">4.8 GB</div>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
            Via compression
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-400 block mb-1">System Uptime</span>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100">99.98%</div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            Daemon Active
          </span>
        </div>
      </div>

      {/* Connected Workstation & Devices */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Connected Workstations & Sync Nodes
          </h3>
          <p className="text-xs text-slate-500">
            Devices authorized with your end-to-end Ellie token
          </p>
        </div>

        <div className="space-y-3">
          <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Laptop className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Primary Station (macOS Sonoma / M3 Max)
                  </p>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
                    This Machine
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Last active: Just now • IP: 192.168.1.104
                </p>
              </div>
            </div>
            <button
              onClick={() => onShowToast('Synced', 'Local socket verified', 'info')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Verify
            </button>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Laptop className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Windows 11 Desktop Pro (Studio Rig)
                </p>
                <p className="text-[11px] text-slate-400">
                  Last active: 4 hours ago • IP: 10.0.0.15
                </p>
              </div>
            </div>
            <span className="text-[11px] text-slate-400">Connected</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  iPhone 16 Pro (iOS PWA Companion)
                </p>
                <p className="text-[11px] text-slate-400">
                  Last active: Yesterday • Push Notifications Active
                </p>
              </div>
            </div>
            <span className="text-[11px] text-slate-400">Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
