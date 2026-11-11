import React, { useState } from 'react';
import {
  Search,
  FileCode,
  FileText,
  Terminal,
  Folder,
  ArrowRight,
  Copy,
  Clock,
  Sparkles,
  Check,
} from 'lucide-react';

interface SearchPageProps {
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  onNavigateToDashboardWithPrompt: (prompt: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  onShowToast,
  onNavigateToDashboardWithPrompt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'files' | 'commands' | 'code' | 'prompts'>('all');

  const allItems = [
    {
      id: 's-1',
      title: 'create a file config.production.json',
      type: 'commands',
      badge: 'Command',
      desc: 'Creates a production JSON configuration with redis connection pooling and log level.',
      path: 'cli://create-file',
      time: '1 hour ago',
    },
    {
      id: 's-2',
      title: 'clean_dataset.py',
      type: 'files',
      badge: 'File',
      desc: 'Python ETL script with pandas null-checking and ISO-8601 normalization.',
      path: '/workspace/scripts/clean_dataset.py',
      time: 'Yesterday',
    },
    {
      id: 's-3',
      title: 'Q3 Revenue Dashboard Analysis & Margin Summary',
      type: 'prompts',
      badge: 'Prompt',
      desc: 'Financial agent prompt summarizing operating metrics, CAC, and ARR metrics.',
      path: 'history://prompt-902',
      time: 'Today, 10:14 AM',
    },
    {
      id: 's-4',
      title: 'summarize /workspace/reports/Q3_analysis.md',
      type: 'commands',
      badge: 'Command',
      desc: 'Parses markdown tokens and generates concise 3-bullet executive summary.',
      path: 'cli://summarize',
      time: '3 hours ago',
    },
    {
      id: 's-5',
      title: 'organize_downloads.sh',
      type: 'code',
      badge: 'Code Script',
      desc: 'Bash automation script to sort ~/Downloads by file extension with safe non-clobber.',
      path: '/scripts/organize_downloads.sh',
      time: '3 days ago',
    },
    {
      id: 's-6',
      title: 'shut down local worker daemons',
      type: 'commands',
      badge: 'System',
      desc: 'Halts active desktop listeners and safely flushes state to encrypted local storage.',
      path: 'cli://shutdown',
      time: 'Nov 4, 2026',
    },
  ];

  const filtered = allItems.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      item.desc.toLowerCase().includes(term) ||
      item.path.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Universal Desktop Search
          </h2>
          <p className="text-xs text-slate-500">
            Instant search across files, command macros, prompts, and past AI responses
          </p>
        </div>

        {/* Big Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type to search e.g. 'clean_dataset', 'summarize', 'revenue'..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm md:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
            autoFocus
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'commands', label: '⚡ Commands' },
            { id: 'files', label: '📂 Files' },
            { id: 'prompts', label: '💬 Prompts' },
            { id: 'code', label: '📝 Code' },
          ].map((flt) => (
            <button
              key={flt.id}
              onClick={() => setFilterType(flt.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                filterType === flt.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {flt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Results ({filtered.length})
          </span>
          <span className="text-xs text-slate-400">
            Indexed 1,842 desktop nodes
          </span>
        </div>

        <div className="space-y-2.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {item.type === 'commands' ? (
                    <Terminal className="w-4 h-4" />
                  ) : item.type === 'files' ? (
                    <Folder className="w-4 h-4" />
                  ) : item.type === 'code' ? (
                    <FileCode className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                  <span className="text-[11px] text-slate-400 font-mono block">
                    {item.path} • {item.time}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(item.title);
                    onShowToast('Copied', 'Item title copied to clipboard', 'info');
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Copy to clipboard"
                  aria-label="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigateToDashboardWithPrompt(item.title)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <span>Run Command</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No matching desktop resources
              </p>
              <p className="text-xs text-slate-400">
                Try searching for general terms like "file", "summarize", or "script".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
