export type PageId =
  | 'dashboard'
  | 'search'
  | 'history'
  | 'backup'
  | 'about'
  | 'settings'
  | 'profile';

export type CommandItem = {
  id: string;
  name: string;
  number: string;
  description: string;
  category: 'file' | 'system' | 'ai';
  actionPrompt: string;
  iconName: string;
};

export type HistoryEntry = {
  id: string;
  title: string;
  dateGroup: 'TODAY' | 'YESTERDAY' | 'EARLIER';
  timestamp: string;
  dateIso: string;
  preview: string;
  userPrompt: string;
  aiSummary: string[];
  category: 'code' | 'tables' | 'system' | 'files';
  tags: string[];
  snippet?: string;
  isPinned?: boolean;
};

export type Snapshot = {
  id: string;
  date: string;
  time: string;
  timestamp: number;
  type: 'Auto' | 'Manual';
  contents: string[];
  sizeMb: number;
  isExpired?: boolean; // older than 30 days
};

export type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
};
