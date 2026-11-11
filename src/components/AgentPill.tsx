import React, { useState } from 'react';
import {
  Sparkles,
  Cpu,
  ShieldAlert,
  Play,
  X,
  Minimize2,
  Maximize2,
  Zap,
  TrendingUp,
  Terminal,
  Activity,
  CheckCircle2,
  Mic,
} from 'lucide-react';
import { RLPolicyState } from '../utils/database';

export type AgentState = 'IDLE' | 'LISTENING' | 'PLANNING' | 'AWAITING_GATEKEEPER' | 'EXECUTING' | 'COMPLETED';

interface AgentPillProps {
  isActive: boolean;
  onClose: () => void;
  agentState: AgentState;
  currentTask: string;
  rlState: RLPolicyState;
  onSubmitPrompt: (text: string) => void;
  onOpenGatekeeper?: () => void;
  onStartVoice?: () => void;
}

export const AgentPill: React.FC<AgentPillProps> = ({
  isActive,
  onClose,
  agentState,
  currentTask,
  rlState,
  onSubmitPrompt,
  onOpenGatekeeper,
  onStartVoice,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [pillInput, setPillInput] = useState('');

  if (!isActive) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pillInput.trim()) return;
    onSubmitPrompt(pillInput);
    setPillInput('');
  };

  const getStateBadge = () => {
    switch (agentState) {
      case 'LISTENING':
        return {
          text: 'Listening...',
          color: 'bg-emerald-500',
          textColor: 'text-emerald-500',
          border: 'border-emerald-500/30',
        };
      case 'PLANNING':
        return {
          text: 'Planning Tool Call',
          color: 'bg-amber-500',
          textColor: 'text-amber-500',
          border: 'border-amber-500/30',
        };
      case 'AWAITING_GATEKEEPER':
        return {
          text: 'Gatekeeper Confirmation',
          color: 'bg-orange-500',
          textColor: 'text-orange-500',
          border: 'border-orange-500/50',
        };
      case 'EXECUTING':
        return {
          text: 'Executing in Sandbox',
          color: 'bg-blue-500',
          textColor: 'text-blue-500',
          border: 'border-blue-500/30',
        };
      case 'COMPLETED':
        return {
          text: 'Action Complete (RL Reinforced)',
          color: 'bg-indigo-500',
          textColor: 'text-indigo-500',
          border: 'border-indigo-500/30',
        };
      default:
        return {
          text: 'Active & Listening',
          color: 'bg-emerald-500',
          textColor: 'text-emerald-500',
          border: 'border-emerald-500/20',
        };
    }
  };

  const badge = getStateBadge();

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900/95 dark:bg-slate-800/95 text-white border border-blue-500/40 shadow-xl backdrop-blur-md hover:scale-105 transition-transform"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${badge.color} animate-pulse`} />
          </div>
          <span className="text-xs font-semibold">Elli Agent Active</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-600/40 font-mono text-blue-200">
            RL: +{rlState.rewardScore}
          </span>
          <Maximize2 className="w-3.5 h-3.5 text-slate-400 ml-1" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-slide-up">
      <div
        className={`bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-xl text-white border ${badge.border} rounded-3xl p-4 shadow-2xl shadow-blue-900/20 space-y-3 transition-all duration-300`}
      >
        {/* Top Header of Pill */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs tracking-tight">Elli Desktop AI</span>
                <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.color} animate-pulse`} />
                  {badge.text}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* RL Policy Tag */}
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-950/80 border border-blue-800 text-[10px] font-mono text-blue-300">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>RL Score: +{rlState.rewardScore}</span>
              <span className="text-slate-500">•</span>
              <span>{rlState.policyConfidence}% Conf</span>
            </div>

            {/* Minimize & Close */}
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
              title="Minimize pill"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
              title="Stop agent"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Current Active Task readout */}
        {currentTask && (
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300 truncate">
              <Terminal className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span className="truncate">{currentTask}</span>
            </div>

            {agentState === 'AWAITING_GATEKEEPER' && onOpenGatekeeper && (
              <button
                onClick={onOpenGatekeeper}
                className="ml-2 px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-semibold flex items-center gap-1 flex-shrink-0 animate-pulse"
              >
                <ShieldAlert className="w-3 h-3" />
                <span>Review Gatekeeper</span>
              </button>
            )}
          </div>
        )}

        {/* Quick Voice / Text prompt bar inside pill */}
        <form onSubmit={handleSend} className="flex items-center gap-2">
          {onStartVoice && (
            <button
              type="button"
              onClick={onStartVoice}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-blue-600 rounded-xl transition-colors flex-shrink-0"
              title="Speak with Whisper voice"
              aria-label="Speak with Whisper voice"
            >
              <Mic className="w-3.5 h-3.5 text-blue-400" />
            </button>
          )}
          <input
            type="text"
            value={pillInput}
            onChange={(e) => setPillInput(e.target.value)}
            placeholder="Give Elli a desktop command or file action..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500 font-mono"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>Exec</span>
          </button>
        </form>
      </div>
    </div>
  );
};
