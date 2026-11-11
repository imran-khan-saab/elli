import React, { useState } from 'react';
import {
  HardDriveDownload,
  CheckCircle2,
  Calendar,
  Cloud,
  Database,
  Download,
  RotateCcw,
  Trash2,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  Server,
  FileCheck,
  Clock,
} from 'lucide-react';
import { Snapshot } from '../types/index';
import { isRestoreEligible, formatSizeMb } from '../utils/backupRules';
import { ConfirmModal } from '../components/Modals';

interface BackupPageProps {
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const BackupPage: React.FC<BackupPageProps> = ({ onShowToast }) => {
  const [schedule, setSchedule] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('daily');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState<'cloud' | 's3' | 'local'>('cloud');

  // Data Selector Checkboxes
  const [includeLogs, setIncludeLogs] = useState(true);
  const [includeBases, setIncludeBases] = useState(true);
  const [includePrompts, setIncludePrompts] = useState(false);
  const [includeScripts, setIncludeScripts] = useState(true);

  // Past snapshots
  const [snapshots, setSnapshots] = useState<Snapshot[]>([
    {
      id: 'snap-1',
      date: '2026-11-10',
      time: '10:14 AM',
      timestamp: Date.now() - 3600000 * 2, // 2 hours ago
      type: 'Auto',
      contents: ['💬 History', '📂 Files'],
      sizeMb: 14.2,
    },
    {
      id: 'snap-2',
      date: '2026-11-09',
      time: '08:00 AM',
      timestamp: Date.now() - 86400000 * 1, // 1 day ago
      type: 'Manual',
      contents: ['💬 History'],
      sizeMb: 8.6,
    },
    {
      id: 'snap-3',
      date: '2026-11-04',
      time: '02:30 PM',
      timestamp: Date.now() - 86400000 * 6, // 6 days ago
      type: 'Auto',
      contents: ['💬 History', '📂 Files', '⚙️ System Prompts'],
      sizeMb: 22.4,
    },
    {
      id: 'snap-4',
      date: '2026-10-01',
      time: '09:15 AM',
      timestamp: Date.now() - 86400000 * 40, // 40 days ago (>30 days limit)
      type: 'Auto',
      contents: ['💬 History'],
      sizeMb: 6.1,
      isExpired: true,
    },
  ]);

  // Modal states
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => void;
    variant: 'danger' | 'primary' | 'warning';
    confirmLabel: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    action: () => {},
    variant: 'primary',
    confirmLabel: 'Confirm',
  });

  // Create Manual Backup
  const handleCreateBackup = () => {
    setIsBackingUp(true);
    onShowToast('Creating Backup...', 'Bundling chat history, configs, and file index', 'info');

    setTimeout(() => {
      const now = new Date();
      const newSnapshot: Snapshot = {
        id: `snap-${Date.now()}`,
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        type: 'Manual',
        contents: [
          includeLogs ? '💬 History' : '',
          includeBases ? '📂 Files' : '',
          includePrompts ? '⚙️ System Prompts' : '',
          includeScripts ? '📜 Scripts' : '',
        ].filter(Boolean),
        sizeMb: 15.4,
      };

      setSnapshots((prev) => [newSnapshot, ...prev]);
      setIsBackingUp(false);
      onShowToast('Backup Created', `Snapshot of ${newSnapshot.sizeMb} MB saved successfully`, 'success');
    }, 1000);
  };

  // Restore snapshot handler
  const handleRestoreClick = (snap: Snapshot) => {
    const check = isRestoreEligible(snap.timestamp);
    if (!check.eligible) {
      onShowToast(
        'Restore Unavailable',
        check.reason || 'Snapshots older than 30 days cannot be restored per retention policy.',
        'error'
      );
      return;
    }

    setConfirmModalState({
      isOpen: true,
      title: 'Restore System Snapshot',
      description: `Are you sure you want to restore the snapshot from ${snap.date} at ${snap.time}? Your active workspace state will revert to this exact point.`,
      confirmLabel: 'Proceed with Restore',
      variant: 'primary',
      action: () => {
        onShowToast(
          'Snapshot Restored',
          `Restored workspace state from ${snap.date} (${snap.contents.join(', ')})`,
          'success'
        );
      },
    });
  };

  // Delete snapshot handler
  const handleDeleteClick = (snap: Snapshot) => {
    setConfirmModalState({
      isOpen: true,
      title: 'Delete Backup Snapshot',
      description: `Are you sure you want to permanently delete snapshot ${snap.date} ${snap.time}? This action cannot be reversed.`,
      confirmLabel: 'Delete Snapshot',
      variant: 'danger',
      action: () => {
        setSnapshots((prev) => prev.filter((s) => s.id !== snap.id));
        onShowToast('Snapshot Deleted', `Snapshot from ${snap.date} has been removed.`, 'info');
      },
    });
  };

  // Download local JSON file
  const handleDownloadJson = () => {
    const backupPayload = {
      app: 'Ellie Desktop AI Assistant',
      exportedAt: new Date().toISOString(),
      retentionPolicyDays: 30,
      snapshots: snapshots.map((s) => ({
        id: s.id,
        date: s.date,
        time: s.time,
        type: s.type,
        contents: s.contents,
        sizeMb: s.sizeMb,
      })),
      configurations: {
        schedule,
        selectedStorage,
        includedModules: {
          includeLogs,
          includeBases,
          includePrompts,
          includeScripts,
        },
      },
    };

    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ellie_backup_snapshot_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    onShowToast('Download Started', `Saved ${a.download}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Page Header matching suggestion */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              ⚙️ Backup & Recovery Settings
            </h2>
            <p className="text-xs text-slate-500">
              Manage automatic snapshot scheduling, cloud vaults, and restore points
            </p>
          </div>
        </div>
      </div>

      {/* Prominent Label / Restriction Notice requested by user:
          "show a label where you can write you can restore only one month of cammond" */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
            Retention & Restore Policy
          </h4>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
            You can restore only one month (30 days) of commands, snapshots, and file logs from the secure archive. Older records are automatically pruned for security and storage efficiency.
          </p>
        </div>
      </div>

      {/* CURRENT STATUS matching suggestion diagram */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              CURRENT STATUS
            </span>
            <div className="flex items-center gap-2 text-base font-bold text-emerald-600 dark:text-emerald-400">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              🟢 System Fully Backed Up
            </div>
            <p className="text-xs text-slate-500 font-mono">
              Last snapshot: Today, 10:14 AM | Size: 14.2 MB | Target: Google Drive
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleCreateBackup}
              disabled={isBackingUp}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium text-xs md:text-sm flex items-center gap-2 shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isBackingUp ? 'Creating Backup...' : '[⚡ Create Manual Backup]'}</span>
            </button>

            {/* Schedule Dropdown matching suggestion */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <label htmlFor="backup-schedule-select" className="font-medium whitespace-nowrap">
                Schedule:
              </label>
              <select
                id="backup-schedule-select"
                aria-label="Backup frequency schedule"
                value={schedule}
                onChange={(e) => {
                  setSchedule(e.target.value as any);
                  onShowToast('Schedule Updated', `Backup frequency set to ${e.target.value}`, 'info');
                }}
                className="bg-transparent font-semibold text-blue-600 dark:text-blue-400 focus:outline-hidden cursor-pointer"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily Dropdown v</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Split: DATA SELECTOR & STORAGE TARGET */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DATA SELECTOR matching suggestion */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-100 dark:border-slate-800">
            DATA SELECTOR
          </span>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={includeLogs}
                onChange={(e) => setIncludeLogs(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <span className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                Chat & Prompt Logs
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={includeBases}
                onChange={(e) => setIncludeBases(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <span className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                Uploaded Knowledge Bases & Workspaces
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={includePrompts}
                onChange={(e) => setIncludePrompts(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <span className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                Custom Agent System Prompts
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={includeScripts}
                onChange={(e) => setIncludeScripts(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <span className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                Desktop Automation Scripts & History
              </span>
            </label>
          </div>
        </div>

        {/* STORAGE TARGET matching suggestion */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-100 dark:border-slate-800">
            STORAGE TARGET
          </span>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="storage-target"
                checked={selectedStorage === 'cloud'}
                onChange={() => setSelectedStorage('cloud')}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <span className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                App Secure Cloud (2.1GB Used)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="storage-target"
                checked={selectedStorage === 's3'}
                onChange={() => setSelectedStorage('s3')}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <span className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                Connect AWS S3 Bucket
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="storage-target"
                checked={selectedStorage === 'local'}
                onChange={() => setSelectedStorage('local')}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <span className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                Local Disk Storage (Encrypted Vault)
              </span>
            </label>
          </div>

          <div className="pt-2">
            <button
              onClick={handleDownloadJson}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>[📥 Download Local JSON File]</span>
            </button>
          </div>
        </div>
      </div>

      {/* PAST SNAPSHOTS (RESTORE POINTS) matching suggestion */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            PAST SNAPSHOTS (RESTORE POINTS)
          </span>
          <span className="text-xs text-slate-400">
            {snapshots.length} snapshots recorded
          </span>
        </div>

        <div className="space-y-2.5">
          {snapshots.map((snap) => {
            const check = isRestoreEligible(snap.timestamp);
            const isBlocked = !check.eligible || snap.isExpired;

            return (
              <div
                key={snap.id}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs md:text-sm font-semibold font-mono text-slate-800 dark:text-slate-200">
                        {snap.date} {snap.time}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                          snap.type === 'Auto'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        }`}
                      >
                        [{snap.type}]
                      </span>
                      <span className="text-xs text-slate-500">
                        ({snap.contents.join(', ')})
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Size: {formatSizeMb(snap.sizeMb)} {isBlocked && '• [Expired: >30 days limit]'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleRestoreClick(snap)}
                    disabled={isBlocked}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      isBlocked
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60'
                    }`}
                    title={isBlocked ? 'Cannot restore snapshots older than 30 days' : 'Restore snapshot'}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>[🔄 Restore]</span>
                  </button>

                  <button
                    onClick={() => handleDeleteClick(snap)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5 transition-colors"
                    title="Delete snapshot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>[🗑️ Delete]</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
        title={confirmModalState.title}
        description={confirmModalState.description}
        confirmLabel={confirmModalState.confirmLabel}
        variant={confirmModalState.variant}
        onConfirm={confirmModalState.action}
      />
    </div>
  );
};
