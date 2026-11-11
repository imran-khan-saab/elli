import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  FilePlus,
  FileEdit,
  Trash2,
  DownloadCloud,
  FileText,
  Power,
  Play,
  Terminal,
  Activity,
  HardDrive,
  Cpu,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Copy,
  ChevronRight,
  Monitor,
  FolderOpen,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  Mic,
  Download,
  RefreshCw,
  Laptop,
  Radio,
} from 'lucide-react';
import { CommandItem } from '../types/index';
import { RLPolicyState } from '../utils/database';
import { deviceBridge, WorkspaceFile } from '../utils/deviceBridge';

interface DashboardPageProps {
  onStartAgentPill: () => void;
  isPillActive: boolean;
  onExecutePrompt: (promptText: string) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  platform: 'mac' | 'windows' | 'ios' | 'linux';
  rlState: RLPolicyState;
  onRLFeedback: (actionType: any, delta: number) => void;
  onStartVoice?: () => void;
  lastExecutionLog: {
    command: string;
    output: string;
    status: 'success' | 'running';
    time: string;
  } | null;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onStartAgentPill,
  isPillActive,
  onExecutePrompt,
  onShowToast,
  platform,
  rlState,
  onRLFeedback,
  onStartVoice,
  lastExecutionLog,
}) => {
  const [activePrompt, setActivePrompt] = useState('create a file config.production.json');
  const [ratedLog, setRatedLog] = useState<'up' | 'down' | null>(null);
  const [workspaceFiles, setWorkspaceFiles] = useState<WorkspaceFile[]>(() => deviceBridge.getWorkspaceFiles());

  useEffect(() => {
    setWorkspaceFiles(deviceBridge.getWorkspaceFiles());
  }, [lastExecutionLog]);

  // The requested commands points 1) to 7)
  const commandsList: CommandItem[] = [
    {
      id: 'cmd-1',
      name: 'create a file',
      number: '1)',
      description: 'Generates new script, markdown, or config template',
      category: 'file',
      actionPrompt: 'create a file auth_middleware.ts with JWT verification',
      iconName: 'FilePlus',
    },
    {
      id: 'cmd-2',
      name: 'update a file',
      number: '2)',
      description: 'Edits, patches or refactors existing code in workspace',
      category: 'file',
      actionPrompt: 'update a file package.json to bump version to 2.4.0',
      iconName: 'FileEdit',
    },
    {
      id: 'cmd-3',
      name: 'delete file',
      number: '3)',
      description: 'Safely moves temporary and deprecated files to trash',
      category: 'file',
      actionPrompt: 'delete file .cache/temp_build_artifacts.log',
      iconName: 'Trash2',
    },
    {
      id: 'cmd-4',
      name: 'fetching',
      number: '4)',
      description: 'Fetches REST APIs, web pages, or server metrics',
      category: 'ai',
      actionPrompt: 'fetching https://api.statuspage.io/v1/metrics and graph response',
      iconName: 'DownloadCloud',
    },
    {
      id: 'cmd-5',
      name: 'summarize',
      number: '5)',
      description: 'Condenses logs, PDF documents, or pull requests',
      category: 'ai',
      actionPrompt: 'summarize /docs/release-notes-v2.md with 3 key takeaways',
      iconName: 'FileText',
    },
    {
      id: 'cmd-6',
      name: 'shut down',
      number: '6)',
      description: 'Safely halts local daemon background tasks & saves session',
      category: 'system',
      actionPrompt: 'shut down local worker processes and save state',
      iconName: 'Power',
    },
    {
      id: 'cmd-7',
      name: 'etc. (system sleep, scan directory, run benchmark)',
      number: '7)',
      description: 'Extended system automations, memory scans, and benchmarks',
      category: 'system',
      actionPrompt: 'scan directory /src for unused exports and optimize bundle',
      iconName: 'Terminal',
    },
  ];

  const handleSelectCommand = (cmd: CommandItem) => {
    setActivePrompt(cmd.actionPrompt);
    onExecutePrompt(cmd.actionPrompt);
  };

  const handleRunSubmit = () => {
    if (!activePrompt.trim()) return;
    onExecutePrompt(activePrompt);
    setRatedLog(null);
  };

  const handleRateOutput = (isUp: boolean) => {
    const delta = isUp ? 2 : -2;
    setRatedLog(isUp ? 'up' : 'down');
    onRLFeedback('SUMMARIZE', delta);
    onShowToast(
      isUp ? 'RL Policy Reinforced (+2)' : 'RL Policy Penalized (-2)',
      `Feedback recorded in reinforcement memory. Model confidence adapted.`,
      isUp ? 'success' : 'warning'
    );
  };

  const getCmdIcon = (iconName: string) => {
    switch (iconName) {
      case 'FilePlus':
        return <FilePlus className="w-4 h-4 text-blue-500" />;
      case 'FileEdit':
        return <FileEdit className="w-4 h-4 text-indigo-500" />;
      case 'Trash2':
        return <Trash2 className="w-4 h-4 text-rose-500" />;
      case 'DownloadCloud':
        return <DownloadCloud className="w-4 h-4 text-cyan-500" />;
      case 'FileText':
        return <FileText className="w-4 h-4 text-emerald-500" />;
      case 'Power':
        return <Power className="w-4 h-4 text-amber-500" />;
      default:
        return <Terminal className="w-4 h-4 text-violet-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Welcome Message & 2. Get Started Button */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white p-6 md:p-8 shadow-lg shadow-blue-500/10">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ellie RL Engine Active • Adaptive Policy v2.4</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, Alex!
            </h2>
            <p className="text-blue-100 text-xs md:text-sm leading-relaxed">
              Ellie is running locally on your workstation. As you execute commands and approve actions, Ellie’s reinforcement learning policy tunes to your desktop patterns.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Get Started Button triggers Floating AI Agent Pill */}
            <button
              onClick={onStartAgentPill}
              className={`px-5 py-3 rounded-2xl font-bold text-xs md:text-sm shadow-md transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 ${
                isPillActive
                  ? 'bg-emerald-500 text-white ring-4 ring-emerald-400/30'
                  : 'bg-white text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{isPillActive ? 'AI Pill Active (HUD Online)' : 'Get Started (Activate AI)'}</span>
            </button>

            <button
              onClick={() => onExecutePrompt('scan directory /agent_workspace and summarize')}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium text-xs md:text-sm backdrop-blur-md transition-colors flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Scan Sandbox</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid: Middle Content + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 4. Middle Main Content Area (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Interactive Desktop AI Prompt Runner */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Desktop Prompt Runner
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Type command or click sidebar points
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={activePrompt}
                  onChange={(e) => setActivePrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRunSubmit();
                  }}
                  placeholder="e.g. create a file index.html or summarize /agent_workspace/notes.txt..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs md:text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                />
              </div>

              {onStartVoice && (
                <button
                  type="button"
                  onClick={onStartVoice}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs md:text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
                  title="Speak command with Whisper voice"
                >
                  <Mic className="w-4 h-4 text-white animate-pulse" />
                  <span>Speak</span>
                </button>
              )}

              <button
                onClick={handleRunSubmit}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Run</span>
              </button>
            </div>

            {/* Quick Suggestions */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 text-xs text-slate-500">
              <span className="flex-shrink-0 text-slate-400 font-medium">Quick Suggestions:</span>
              {[
                'create a file schema.sql',
                'summarize recent commits',
                'fetching weather telemetry',
              ].map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActivePrompt(sug);
                    onExecutePrompt(sug);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 transition-colors whitespace-nowrap text-[11px]"
                >
                  {sug}
                </button>
              ))}
            </div>

            {/* Live Output Panel & RL Feedback */}
            {lastExecutionLog && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-950 text-slate-200 border border-slate-800 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-2">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    STATUS: READY ({lastExecutionLog.time})
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(lastExecutionLog.output);
                        onShowToast('Copied to clipboard', 'Response output copied', 'info');
                      }}
                      className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                </div>

                <div className="text-blue-400 font-semibold">$ ellie --exec "{lastExecutionLog.command}"</div>
                <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">{lastExecutionLog.output}</div>

                {/* Reinforcement Learning feedback buttons */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-sky-400" />
                    Rate this output to train local RL policy:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleRateOutput(true)}
                      className={`px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${
                        ratedLog === 'up'
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3 text-emerald-400" />
                      <span>Good (+2)</span>
                    </button>
                    <button
                      onClick={() => handleRateOutput(false)}
                      className={`px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${
                        ratedLog === 'down'
                          ? 'bg-rose-600 text-white font-bold'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <ThumbsDown className="w-3 h-3 text-rose-400" />
                      <span>Bad (-2)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Workstation Metrics & Live RL Telemetry */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>CPU Load</span>
                <Cpu className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">14.2%</div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-[14%]" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Memory</span>
                <Activity className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">3.8 / 16 GB</div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full w-[24%]" />
              </div>
            </div>

            {/* Live Reinforcement Learning Policy Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span className="font-semibold text-blue-600 dark:text-blue-400">RL Score</span>
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">+{rlState.rewardScore} pts</div>
              <div className="text-[10px] text-slate-400 mt-1">
                {rlState.totalEpisodes} episodes trained
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>RL Confidence</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{rlState.policyConfidence}%</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Adaptive Policy
              </div>
            </div>
          </div>

          {/* Active Desktop Workflows */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Active Desktop Workflows
                </h3>
                <p className="text-xs text-slate-500">Autonomous agents working on your desktop background</p>
              </div>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                3 Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  File Sentinel
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Sandboxed in ./agent_workspace/ with zero-leak protection
                </p>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <DownloadCloud className="w-3.5 h-3.5" />
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Snapshot Sync
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Synchronizes 30-day restore archives across your devices
                </p>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  RL Policy Adapter
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Learns from user confirmations and Gatekeeper choices
                </p>
              </div>
            </div>
          </div>

          {/* Connected Local Device & Workspace Files Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Connected Local Workstation
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Port 8741 Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Station: {deviceBridge.getDeviceStatus(platform).deviceName} • Latency: 1.4ms
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setWorkspaceFiles(deviceBridge.getWorkspaceFiles());
                    onShowToast('Refreshed Files', 'Sandbox directory synchronized', 'info');
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center gap-1 transition-colors"
                  title="Reload files from ./agent_workspace/"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* Sandboxed workspace explanation */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <HardDrive className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>
                  Sandbox Directory: <code className="px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-900 font-mono text-blue-600 dark:text-blue-400 font-bold">./agent_workspace/</code>
                </span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                {workspaceFiles.length} file{workspaceFiles.length === 1 ? '' : 's'} ready
              </span>
            </div>

            {/* Workspace Files List with Download to Local Disk */}
            <div className="space-y-2">
              {workspaceFiles.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No files generated yet. Ask Ellie: "create a file &lt;name&gt;" to start!
                </div>
              ) : (
                workspaceFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-blue-300 dark:hover:border-blue-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono truncate">
                            {file.filename}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                            {file.sizeBytes} B
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          Path: {file.path} • Cmd: "{file.sourceCommand}"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                      <button
                        onClick={() => {
                          deviceBridge.downloadToLocalDisk(file);
                          onShowToast('Downloaded to Local Disk', `Saved ${file.filename} to your computer`, 'success');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                        title="Download file directly to your workstation"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Save to Local Disk</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 3. Right Sidebar: Title "Commands" with points in next line */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
              <span>Commands</span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                Quick Action
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any command to load and run immediately:
            </p>
          </div>

          {/* Points list 1) through 7) */}
          <div className="space-y-2">
            {commandsList.map((cmd) => (
              <button
                key={cmd.id}
                onClick={() => handleSelectCommand(cmd)}
                className="w-full text-left p-3 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 group flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs group-hover:scale-105 transition-transform">
                  {getCmdIcon(cmd.iconName)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {cmd.number}
                    </span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {cmd.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {cmd.description}
                  </p>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Progressive Trust: 3+ approvals</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[10px]">
              Ctrl+Enter
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
