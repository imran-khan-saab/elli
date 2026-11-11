import React, { useState } from 'react';
import {
  Sliders,
  Globe,
  UserCheck,
  ShieldCheck,
  Moon,
  Sun,
  Laptop,
  Check,
  Bell,
  HardDrive,
  Key,
  Save,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface SettingsPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  isDark,
  onToggleTheme,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'language' | 'account' | 'privacy'>('general');

  // General Settings state
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(isDark ? 'dark' : 'light');
  const [exportFormat, setExportFormat] = useState<'markdown' | 'json' | 'csv' | 'pdf'>('markdown');
  const [launchAtStartup, setLaunchAtStartup] = useState(true);
  const [windowSnapping, setWindowSnapping] = useState(true);

  // Language Preferences state
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [voiceModel, setVoiceModel] = useState('whisper-local-fast');
  const [spellCheck, setSpellCheck] = useState(true);

  // Account Settings state
  const [fullName, setFullName] = useState('Alex Mercer');
  const [email, setEmail] = useState('alex.mercer@desktop.internal');
  const [notifyOnBackup, setNotifyOnBackup] = useState(true);
  const [notifyOnCommandFail, setNotifyOnCommandFail] = useState(true);

  // Privacy Settings state
  const [localOnlyMode, setLocalOnlyMode] = useState(true);
  const [telemetryEnabled, setTelemetryEnabled] = useState(false);
  const [autoPurge30Days, setAutoPurge30Days] = useState(true);
  const [encryptionKey] = useState('ellie_sec_9942a_aes256_gcm');
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    onShowToast('Settings Saved', 'Your configuration changes have been applied to this workstation.', 'success');
  };

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    if ((mode === 'dark' && !isDark) || (mode === 'light' && isDark)) {
      onToggleTheme();
    }
    onShowToast('Theme Changed', `Switched theme preference to ${mode}`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'general', label: '1. General Settings', icon: Sliders },
          { id: 'language', label: '2. Language Preferences', icon: Globe },
          { id: 'account', label: '3. Account Settings', icon: UserCheck },
          { id: 'privacy', label: '4. Privacy Settings', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. General Settings Section */}
      {activeTab === 'general' && (
        <div className="space-y-5 animate-fade-in">
          {/* Theme Selection Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Interface Theme
              </h3>
              <p className="text-xs text-slate-500">
                Select your preferred visual style across all desktop windows
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'light', label: 'Light Mode', icon: Sun, desc: 'Clean white background & soft shadows' },
                { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Midnight slate, high contrast for night' },
                { id: 'system', label: 'System Auto', icon: Laptop, desc: 'Syncs automatically with OS settings' },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = themeMode === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id as any)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                        : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <p className="text-xs font-bold">{t.label}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      {t.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export & Startup Preferences */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Desktop Behavior & Defaults
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                  Default Export Format
                </label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs md:text-sm text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="markdown">Markdown (.md) - Recommended</option>
                  <option value="json">Raw Structured JSON (.json)</option>
                  <option value="csv">Comma Separated Values (.csv)</option>
                  <option value="pdf">Formatted Document (.pdf)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                  Global Assistant Hotkey
                </label>
                <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-700 dark:text-slate-300">Alt + Space</span>
                  <span className="text-[10px] text-blue-600 uppercase font-semibold">Ready</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <label className="flex items-center justify-between cursor-pointer py-1">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Launch Ellie on System Login
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Automatically starts background daemon and tray icon on computer startup
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={launchAtStartup}
                  onChange={(e) => setLaunchAtStartup(e.target.checked)}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Native Desktop Window Snapping
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Dock Ellie assistant side-by-side with IDEs and document editors
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={windowSnapping}
                  onChange={(e) => setWindowSnapping(e.target.checked)}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 2. Language Preferences Section */}
      {activeTab === 'language' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 animate-fade-in">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Language & Regional Localization
            </h3>
            <p className="text-xs text-slate-500">
              Configure speech synthesis dialects and interface localization
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                Interface Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs md:text-sm text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="en-US">English (United States)</option>
                <option value="en-GB">English (United Kingdom)</option>
                <option value="es-ES">Español (Spanish)</option>
                <option value="fr-FR">Français (French)</option>
                <option value="de-DE">Deutsch (German)</option>
                <option value="ja-JP">日本語 (Japanese)</option>
                <option value="hi-IN">हिन्दी (Hindi)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                Voice Input Recognition Model
              </label>
              <select
                value={voiceModel}
                onChange={(e) => setVoiceModel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs md:text-sm text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="whisper-local-fast">Whisper Local Fast (English & Multilingual)</option>
                <option value="whisper-large-v3">Whisper Large v3 (High Precision)</option>
                <option value="native-speech-engine">Native OS Speech Engine</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center justify-between cursor-pointer py-1">
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Automatic Command Spellcheck & Correction
                </p>
                <p className="text-[11px] text-slate-500">
                  Fix typos in shell flags, path names, and command parameters before execution
                </p>
              </div>
              <input
                type="checkbox"
                checked={spellCheck}
                onChange={(e) => setSpellCheck(e.target.checked)}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>
          </div>
        </div>
      )}

      {/* 3. Account Settings Section */}
      {activeTab === 'account' && (
        <div className="space-y-5 animate-fade-in">
          {/* Profile information */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Profile & Workstation Identity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs md:text-sm text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Internal Desktop Account Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs md:text-sm text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Storage Quota & Storage Preferences */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Storage Quota & Preferences
                </h3>
                <p className="text-xs text-slate-500">
                  Local cache and secure encrypted cloud snapshot allocation
                </p>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                2.1 GB / 10.0 GB (21% Used)
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full w-[21%]" />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Snapshots: 142 MB</span>
              <span>Vector Indexes: 680 MB</span>
              <span>Free Space: 7.9 GB</span>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Desktop Notifications
            </h3>

            <div className="space-y-2">
              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="text-xs text-slate-700 dark:text-slate-300">
                  Alert me when scheduled auto-backups finish successfully
                </span>
                <input
                  type="checkbox"
                  checked={notifyOnBackup}
                  onChange={(e) => setNotifyOnBackup(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="text-xs text-slate-700 dark:text-slate-300">
                  Notify immediately if a background command fails or times out
                </span>
                <input
                  type="checkbox"
                  checked={notifyOnCommandFail}
                  onChange={(e) => setNotifyOnCommandFail(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 4. Privacy Settings Section */}
      {activeTab === 'privacy' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 animate-fade-in">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Privacy & Zero-Knowledge Security
            </h3>
            <p className="text-xs text-slate-500">
              Ellie is engineered with desktop sandboxing and strict 30-day retention guards
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Local-Only Isolation Mode
                </p>
                <p className="text-[11px] text-slate-500">
                  Execute prompts and file scripts strictly within the local device memory sandbox
                </p>
              </div>
              <input
                type="checkbox"
                checked={localOnlyMode}
                onChange={(e) => setLocalOnlyMode(e.target.checked)}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Strict 30-Day Auto-Purge
                </p>
                <p className="text-[11px] text-slate-500">
                  Automatically erase command history and backup points older than 1 month
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoPurge30Days}
                onChange={(e) => setAutoPurge30Days(e.target.checked)}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Anonymous Telemetry & Crash Reports
                </p>
                <p className="text-[11px] text-slate-500">
                  Share anonymized diagnostic traces to help refine performance
                </p>
              </div>
              <input
                type="checkbox"
                checked={telemetryEnabled}
                onChange={(e) => setTelemetryEnabled(e.target.checked)}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>
          </div>

          {/* Encryption Key preview */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-600" />
                Workstation Encryption Key (AES-256)
              </span>
              <button
                onClick={() => setShowKey(!showKey)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {showKey ? 'Hide Key' : 'Reveal Key'}
              </button>
            </div>
            <p className="font-mono text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
              {showKey ? encryptionKey : '••••••••••••••••••••••••••••••••'}
            </p>
          </div>
        </div>
      )}

      {/* Save Button Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800">
        <button
          onClick={() => onShowToast('Reset Defaults', 'Restored default settings', 'info')}
          className="px-4 py-2 text-xs md:text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          Reset Defaults
        </button>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs md:text-sm rounded-xl flex items-center gap-2 shadow-xs transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
};
