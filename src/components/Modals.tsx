import React from 'react';
import { X, AlertTriangle, HelpCircle, LogOut, Sparkles, Command, ShieldCheck, Check } from 'lucide-react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Help & Support Modal
export const HelpModal: React.FC<BaseModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                Help & Support
              </h3>
              <p className="text-xs text-slate-500">Ellie Desktop AI Assistant v2.4</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Popular Desktop Commands
            </h4>
            <div className="space-y-2 text-sm">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  create a file &lt;filename&gt;
                </span>
                <span className="text-xs text-slate-500">Generates code or document</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  summarize &lt;path&gt;
                </span>
                <span className="text-xs text-slate-500">Analyzes and bullets content</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  fetching &lt;url/query&gt;
                </span>
                <span className="text-xs text-slate-500">Pulls data into workspace</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Cross-Platform Keyboard Shortcuts
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/60 dark:border-slate-800 flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Quick Prompt</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-[10px] text-slate-700 dark:text-slate-300">
                  Ctrl / ⌘ + K
                </kbd>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/60 dark:border-slate-800 flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Summon Ellie</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-[10px] text-slate-700 dark:text-slate-300">
                  Alt + Space
                </kbd>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/60 dark:border-slate-800 flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Toggle Sidebar</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-[10px] text-slate-700 dark:text-slate-300">
                  Ctrl / ⌘ + B
                </kbd>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/60 dark:border-slate-800 flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Trigger Backup</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-[10px] text-slate-700 dark:text-slate-300">
                  Ctrl / ⌘ + S
                </kbd>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
            <span>
              <strong>Cross-Device Compatibility:</strong> Ellie is architected to run seamlessly on Windows 10/11, macOS, iPadOS, iOS, Linux, and modern web browsers with unified cloud snapshot backup.
            </span>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-xs transition-colors"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal (Generic for Restore, Delete, etc.)
interface ConfirmModalProps extends BaseModalProps {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'warning';
  onConfirm: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  variant = 'primary',
  onConfirm,
}) => {
  if (!isOpen) return null;

  let btnColor = 'bg-blue-600 hover:bg-blue-700 text-white';
  let Icon = Sparkles;
  let iconBg = 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400';

  if (variant === 'danger') {
    btnColor = 'bg-rose-600 hover:bg-rose-700 text-white';
    Icon = AlertTriangle;
    iconBg = 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400';
  } else if (variant === 'warning') {
    btnColor = 'bg-amber-600 hover:bg-amber-700 text-white';
    Icon = AlertTriangle;
    iconBg = 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
              {title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-xs ${btnColor}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// Guided "Get Started" Walkthrough Modal
export const GetStartedModal: React.FC<BaseModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 text-white">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">Welcome to Ellie</h2>
          <p className="text-sm text-blue-100 mt-1">
            The Personal Desktop AI Assistant built for Windows, macOS, and iOS.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Execute Natural Language Desktop Commands
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Type or select from the right-hand Command bar to create files, update configs, fetch data, or summarize workspaces.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Review History & Prompt Previews
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect past tasks in the interactive History view with quick preview panel, code snippets, and instant export.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Automated 30-Day Safe Backups
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Create scheduled snapshots and restore system states within the strict 1-month retention window.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-xs transition-colors"
          >
            Let's Get Started
          </button>
        </div>
      </div>
    </div>
  );
};
