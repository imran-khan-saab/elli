import React from 'react';
import {
  LayoutDashboard,
  Search,
  History,
  HardDriveDownload,
  Info,
  Settings,
  User,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Laptop,
} from 'lucide-react';
import { PageId } from '../types/index';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenHelp: () => void;
  onOpenLogout: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  onOpenHelp,
  onOpenLogout,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard' as PageId, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'search' as PageId, label: 'Search', icon: Search },
    { id: 'history' as PageId, label: 'History', icon: History },
    { id: 'backup' as PageId, label: 'Back-Up', icon: HardDriveDownload },
    { id: 'about' as PageId, label: 'About', icon: Info },
    { id: 'settings' as PageId, label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id: PageId) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo & Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer group overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0 transition-opacity duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-base tracking-tight truncate">
                    Ellie
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-md">
                    Desktop
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Personal AI Assistant
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {!isCollapsed && (
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Menu
            </p>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`}
                />

                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}

                {isActive && (
                  <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Section: Profile, Help, Logout */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
          {/* User Profile item */}
          <button
            onClick={() => handleNavClick('profile')}
            className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors group ${
              activePage === 'profile'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isCollapsed ? 'User Profile: Alex Mercer' : undefined}
          >
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-semibold text-xs flex items-center justify-center shadow-xs">
                AM
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  Alex Mercer
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Systems Lead
                </p>
              </div>
            )}
          </button>

          {/* Help & Support */}
          <button
            onClick={onOpenHelp}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            title={isCollapsed ? 'Help & Support' : undefined}
          >
            <HelpCircle className="w-4 h-4 flex-shrink-0 text-slate-400" />
            {!isCollapsed && <span>Help and Support</span>}
          </button>

          {/* Logout */}
          <button
            onClick={onOpenLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
