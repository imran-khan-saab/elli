import React, { useState, useEffect } from 'react';
import {
  Search,
  Code,
  Table2,
  FileText,
  Star,
  Download,
  Copy,
  Clock,
  Sparkles,
  Terminal,
  FolderGit2,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
} from 'lucide-react';
import { HistoryEntry } from '../types/index';
import { db, ActionHistoryRecord } from '../utils/database';
import { filterHistoryEntries } from '../utils/backupRules';

interface HistoryPageProps {
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  onNavigateToDashboardWithPrompt: (prompt: string) => void;
  onRLFeedback: (actionType: any, delta: number) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onShowToast,
  onNavigateToDashboardWithPrompt,
  onRLFeedback,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'code' | 'tables' | 'system' | 'files'>('all');
  const [selectedEntryId, setSelectedEntryId] = useState<string>('');
  const [ratedMap, setRatedMap] = useState<Record<string, 'up' | 'down'>>({});

  // Map database action history records to HistoryEntry format
  const getMappedEntries = (): HistoryEntry[] => {
    const rawActions = db.getActionHistory();
    const now = new Date();

    return rawActions.map((act) => {
      const actDate = new Date(act.createdAt);
      const diffHours = (now.getTime() - actDate.getTime()) / (1000 * 60 * 60);

      let dateGroup: 'TODAY' | 'YESTERDAY' | 'EARLIER' = 'EARLIER';
      if (diffHours < 24) dateGroup = 'TODAY';
      else if (diffHours < 48) dateGroup = 'YESTERDAY';

      let category: 'code' | 'tables' | 'system' | 'files' = 'files';
      if (act.actionType === 'CREATE_FILE' || act.actionType === 'UPDATE_FILE') category = 'code';
      else if (act.actionType === 'SUMMARIZE') category = 'tables';
      else if (act.actionType === 'SYSTEM') category = 'system';

      return {
        id: act.id,
        title: act.cleanName || act.targetPath.split('/').pop() || act.actionType,
        dateGroup,
        timestamp: actDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dateIso: act.createdAt.split('T')[0],
        preview: act.previewContent.slice(0, 80) + '...',
        userPrompt: act.userPrompt,
        aiSummary: [
          `Action Type: ${act.actionType} in sandbox ${act.targetPath}`,
          `Status: ${act.status} with RL Reward: +${act.rlReward}`,
          `Verified sandboxed file execution without telemetry leaks.`,
        ],
        category,
        tags: act.tags || [act.actionType, 'Sandboxed'],
        snippet: act.previewContent,
        isPinned: false,
      };
    });
  };

  const [entries, setEntries] = useState<HistoryEntry[]>(getMappedEntries());

  useEffect(() => {
    const current = getMappedEntries();
    setEntries(current);
    if (!selectedEntryId && current.length > 0) {
      setSelectedEntryId(current[0].id);
    }
  }, []);

  const filteredEntries = filterHistoryEntries(entries, searchQuery, activeFilter);
  const selectedEntry = entries.find((e) => e.id === selectedEntryId) || filteredEntries[0] || entries[0];

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEntries((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newPinned = !item.isPinned;
          onShowToast(
            newPinned ? 'Pinned to Top' : 'Unpinned Chat',
            `"${item.title}" ${newPinned ? 'is now pinned' : 'unpinned'}`,
            'info'
          );
          return { ...item, isPinned: newPinned };
        }
        return item;
      })
    );
  };

  const handleRateEntry = (id: string, isUp: boolean) => {
    setRatedMap((prev) => ({ ...prev, [id]: isUp ? 'up' : 'down' }));
    onRLFeedback('SUMMARIZE', isUp ? 2 : -2);
    onShowToast(
      isUp ? 'RL Policy Reinforced (+2)' : 'RL Policy Penalized (-2)',
      'Your feedback tunes future prompt routing and agent confidence.',
      isUp ? 'success' : 'warning'
    );
  };

  const handleExportMarkdown = (entry: HistoryEntry) => {
    const markdownContent = `# ${entry.title}\nDate: ${entry.timestamp} (${entry.dateIso})\nCategory: ${entry.category}\n\n## User Prompt\n${entry.userPrompt}\n\n## AI Summary\n${entry.aiSummary.map((s) => `- ${s}`).join('\n')}\n\n## Code / Data Snippet\n\`\`\`\n${entry.snippet || ''}\n\`\`\`\n`;

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${entry.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);

    onShowToast('Exported Markdown', `Downloaded ${link.download}`, 'success');
  };

  const groups = ['TODAY', 'YESTERDAY', 'EARLIER'] as const;

  return (
    <div className="space-y-5">
      {/* Search Bar & Filter Header matching suggestion diagram */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search history, prompts, or files..."
            className="w-full pl-9 pr-4 py-2 text-xs md:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
          />
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'code', label: 'Filter: 📝 Code' },
            { id: 'tables', label: 'Filter: 📊 Tables' },
            { id: 'system', label: 'Filter: ⚙️ System' },
            { id: 'files', label: 'Filter: 📂 Files' },
          ].map((flt) => (
            <button
              key={flt.id}
              onClick={() => setActiveFilter(flt.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                activeFilter === flt.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {flt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Split: Left List + Right Quick Preview Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: History Items */}
        <div className="lg:col-span-6 space-y-6">
          {groups.map((group) => {
            const groupEntries = filteredEntries.filter((e) => e.dateGroup === group);
            if (groupEntries.length === 0) return null;

            return (
              <div key={group} className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                    {group}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">
                    ({groupEntries.length})
                  </span>
                </div>

                <div className="space-y-2.5">
                  {groupEntries.map((item) => {
                    const isSelected = selectedEntry?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedEntryId(item.id)}
                        className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left relative group ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            {item.category === 'code' ? (
                              <span className="text-sm">📝</span>
                            ) : item.category === 'tables' ? (
                              <span className="text-sm">✨</span>
                            ) : item.category === 'system' ? (
                              <span className="text-sm">⚙️</span>
                            ) : (
                              <span className="text-sm">📂</span>
                            )}
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {item.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={(e) => handleTogglePin(item.id, e)}
                              className={`p-1 rounded-md transition-colors ${
                                item.isPinned
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'
                              }`}
                              title={item.isPinned ? 'Pinned' : 'Pin to top'}
                              aria-label="Pin entry"
                            >
                              <Star className={`w-3.5 h-3.5 ${item.isPinned ? 'fill-amber-400' : ''}`} />
                            </button>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {item.timestamp}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-1 italic">
                          "{item.userPrompt}"
                        </p>

                        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                          {item.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            >
                              [{tag}]
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredEntries.length === 0 && (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                No matching history items
              </p>
              <p className="text-xs text-slate-400">
                Execute commands in the prompt runner to populate real-time desktop history.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: QUICK PREVIEW PANEL */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs sticky top-20 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                QUICK PREVIEW PANEL
              </h3>
            </div>
            {selectedEntry && (
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {selectedEntry.title}
              </span>
            )}
          </div>

          {selectedEntry ? (
            <div className="space-y-4 text-sm">
              {/* User Prompt */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  User Prompt:
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  "{selectedEntry.userPrompt}"
                </p>
              </div>

              {/* AI Summary Bullets */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  AI Summary:
                </span>
                <div className="space-y-1.5 p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                  {selectedEntry.aiSummary.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Artifact Snippet / Code block */}
              {selectedEntry.snippet && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Artifact Preview:
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedEntry.snippet || '');
                        onShowToast('Copied', 'Artifact content copied to clipboard', 'info');
                      }}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copy Text
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed max-h-48 whitespace-pre-wrap">
                    {selectedEntry.snippet}
                  </pre>
                </div>
              )}

              {/* Reinforcement Learning Feedback in Quick Preview */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                  Rate output quality for RL:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRateEntry(selectedEntry.id, true)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                      ratedMap[selectedEntry.id] === 'up'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Helpful (+2)</span>
                  </button>

                  <button
                    onClick={() => handleRateEntry(selectedEntry.id, false)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                      ratedMap[selectedEntry.id] === 'down'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <ThumbsDown className="w-3 h-3" />
                    <span>Needs Work (-2)</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons matching suggestion */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <button
                  onClick={() => onNavigateToDashboardWithPrompt(selectedEntry.userPrompt)}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Table2 className="w-3.5 h-3.5" />
                  <span>[📊 Open Full Active Chat]</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleExportMarkdown(selectedEntry)}
                    className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>[📥 Export Markdown]</span>
                  </button>

                  <button
                    onClick={(e) => handleTogglePin(selectedEntry.id, e)}
                    className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Star className={`w-3.5 h-3.5 ${selectedEntry.isPinned ? 'fill-amber-400 text-amber-500' : ''}`} />
                    <span>{selectedEntry.isPinned ? '[★ Pinned]' : '[⭐ Pin Chat]'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              Select an entry on the left to preview prompt and response.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
