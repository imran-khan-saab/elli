import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Edit3,
  FileCode,
  FolderLock,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { ActionType, validateSandboxPath } from '../utils/rlEngine';

interface GatekeeperModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: ActionType;
  targetPath: string;
  previewContent: string;
  userPrompt: string;
  approvalCount: number;
  onConfirm: (editedPath?: string, editedContent?: string, rememberPattern?: boolean) => void;
  onDeny: () => void;
}

export const GatekeeperModal: React.FC<GatekeeperModalProps> = ({
  isOpen,
  onClose,
  actionType,
  targetPath,
  previewContent,
  userPrompt,
  approvalCount,
  onConfirm,
  onDeny,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPath, setEditedPath] = useState(targetPath);
  const [editedContent, setEditedContent] = useState(previewContent);
  const [rememberPattern, setRememberPattern] = useState(false);

  if (!isOpen) return null;

  const pathValidation = validateSandboxPath(editedPath);

  const handleApprove = () => {
    if (!pathValidation.valid) return;
    onConfirm(
      editedPath !== targetPath ? editedPath : undefined,
      editedContent !== previewContent ? editedContent : undefined,
      rememberPattern
    );
    onClose();
  };

  const handleDeny = () => {
    onDeny();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Gatekeeper Banner */}
        <div className="p-5 bg-gradient-to-r from-orange-600 via-amber-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight">Gatekeeper Intercept</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 uppercase tracking-wider">
                  Human-in-the-Loop
                </span>
              </div>
              <p className="text-xs text-orange-100">
                Action requires explicit confirmation before applying changes to disk
              </p>
            </div>
          </div>

          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-black/25">
            {actionType}
          </span>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* User Prompt Context */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs">
            <span className="font-semibold text-slate-400 block mb-0.5 uppercase tracking-wider text-[10px]">
              Prompt Trigger:
            </span>
            <p className="text-slate-800 dark:text-slate-200 font-medium italic">
              "{userPrompt}"
            </p>
          </div>

          {/* Sandboxed Target Path */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FolderLock className="w-4 h-4 text-blue-500" />
                Target Path (Sandboxed)
              </span>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Path / Content'}</span>
              </button>
            </div>

            {isEditing ? (
              <input
                type="text"
                value={editedPath}
                onChange={(e) => setEditedPath(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-slate-100"
              />
            ) : (
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-blue-700 dark:text-blue-300 flex items-center justify-between">
                <span>{editedPath}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-sans font-semibold">
                  Sandbox Verified
                </span>
              </div>
            )}

            {!pathValidation.valid && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {pathValidation.reason}
              </p>
            )}
          </div>

          {/* Preview Content */}
          <div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Action Content Preview
            </span>
            {isEditing ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={5}
                className="w-full p-3.5 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-700 focus:outline-hidden"
              />
            ) : (
              <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed max-h-48 whitespace-pre-wrap">
                {editedContent}
              </pre>
            )}
          </div>

          {/* Progressive Trust Offer (if approved >= 2 times or on prompt) */}
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/40 space-y-1.5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberPattern}
                onChange={(e) => setRememberPattern(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5 cursor-pointer"
              />
              <div className="text-xs text-blue-900 dark:text-blue-200">
                <span className="font-bold">Progressive Trust (Remember this pattern):</span>
                <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                  You've approved actions like this {approvalCount} times. Enable to allow safe automated execution without pausing for confirmation next time.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
          <button
            onClick={handleDeny}
            className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-medium text-xs flex items-center gap-1.5 transition-colors"
          >
            <XCircle className="w-4 h-4 text-rose-500" />
            <span>[✗ Deny Action] (RL -1)</span>
          </button>

          <button
            onClick={handleApprove}
            disabled={!pathValidation.valid}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>[✓ Yes, Approve & Execute] (RL +1)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
