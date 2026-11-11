import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  CheckCircle2,
  HardDrive,
  Cpu,
  Smartphone,
  Monitor,
  Apple,
  Sliders,
  Mic,
} from 'lucide-react';
import { PageId } from '../types/index';

interface TopNavProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenMobileMenu: () => void;
  onOpenNotifications?: () => void;
  currentPlatform: 'mac' | 'windows' | 'ios' | 'linux';
  onChangePlatform: (plat: 'mac' | 'windows' | 'ios' | 'linux') => void;
  onStartVoice?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activePage,
  onNavigate,
  isDark,
  onToggleTheme,
  onOpenMobileMenu,
  currentPlatform,
  onChangePlatform,
  onStartVoice,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);

  const getPageTitle = (page: PageId) => {
    switch (page) {
      case 'dashboard':
        return 'System Dashboard';
      case 'search':
        return 'Desktop Universal Search';
      case 'history':
        return 'Command & Prompt History';
      case 'backup':
        return 'Backup & Recovery Settings';
      case 'about':
        return 'About Ellie Assistant';
      case 'settings':
        return 'Application Settings';
      case 'profile':
        return 'User Profile & System Specs';
      default:
        return 'Dashboard';
    }
  };

  const notifications = [
    {
      id: '1',
      title: 'Auto-snapshot created',
      desc: '14.2 MB saved to secure archive',
      time: '10m ago',
      type: 'backup',
    },
    {
      id: '2',
      title: 'File index updated',
      desc: '1,842 desktop files indexed for search',
      time: '1h ago',
      type: 'system',
    },
    {
      id: '3',
      title: 'Ellie engine running',
      desc: 'All local agents active and healthy',
      time: '3h ago',
      type: 'ai',
    },
  ];

  return (
    <header className="h-16 px-4 md:px-6 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 sticky top-0 z-30 transition-colors">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-slate-900 dark:text-slate-100 text-base md:text-lg tracking-tight">
              {getPageTitle(activePage)}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
              Online
            </span>
          </div>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <div
          onClick={() => onNavigate('search')}
          className="relative flex items-center w-full px-3.5 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-sm cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors border border-transparent focus-within:border-blue-500"
        >
          <Search className="w-4 h-4 mr-2.5 text-slate-400 flex-shrink-0" />
          <span className="truncate text-xs md:text-sm">
            Search commands, prompts, or files...
          </span>
          <div className="ml-auto flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-2xs">
              {currentPlatform === 'mac' || currentPlatform === 'ios' ? '⌘' : 'Ctrl'}
            </kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-2xs">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right controls: Voice HUD, Platform Switcher, Notifications, Theme Toggle, User Avatar */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Voice Whisper Button */}
        {onStartVoice && (
          <button
            onClick={onStartVoice}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 transition-colors shadow-2xs"
            title="Speak command with Voice Whisper"
            aria-label="Speak command with Voice Whisper"
          >
            <Mic className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
            <span className="hidden sm:inline">Voice</span>
          </button>
        )}

        {/* Cross-Platform Device Selector */}
        <div className="relative">
          <button
            onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200/60 dark:border-slate-700"
            title="Change active device preview mode"
            aria-label="Device mode selector"
          >
            {currentPlatform === 'windows' && <Monitor className="w-3.5 h-3.5 text-blue-500" />}
            {currentPlatform === 'mac' && <Apple className="w-3.5 h-3.5 text-slate-700 dark:text-slate-200" />}
            {currentPlatform === 'ios' && <Smartphone className="w-3.5 h-3.5 text-indigo-500" />}
            {currentPlatform === 'linux' && <Cpu className="w-3.5 h-3.5 text-amber-500" />}
            <span className="capitalize hidden sm:inline">{currentPlatform}</span>
          </button>

          {showPlatformDropdown && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 z-50">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                Select Device Mode
              </p>
              {[
                { id: 'windows', label: 'Windows 11', icon: Monitor },
                { id: 'mac', label: 'macOS Sonoma', icon: Apple },
                { id: 'ios', label: 'iOS / iPhone', icon: Smartphone },
                { id: 'linux', label: 'Linux (Ubuntu)', icon: Cpu },
              ].map((plat) => {
                const Icon = plat.icon;
                return (
                  <button
                    key={plat.id}
                    onClick={() => {
                      onChangePlatform(plat.id as any);
                      setShowPlatformDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                      currentPlatform === plat.id
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-medium'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" />
                      {plat.label}
                    </span>
                    {currentPlatform === plat.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  System Alerts (3)
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {n.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {n.desc}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {n.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        {/* User Avatar */}
        <button
          onClick={() => onNavigate('profile')}
          className="flex items-center gap-2 p-1 pl-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="User Profile"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-medium text-xs flex items-center justify-center shadow-xs">
            AM
          </div>
        </button>
      </div>
    </header>
  );
};
