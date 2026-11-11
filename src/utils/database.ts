export interface UserRecord {
  id: string;
  username: string;
  role: 'admin' | 'user';
  name: string;
  email: string;
  createdAt: string;
  lastLogin: string;
}

export interface ChatHistoryRecord {
  id: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sessionId: string;
}

export interface ActionHistoryRecord {
  id: string;
  userId: string;
  actionType: 'CREATE_FILE' | 'UPDATE_FILE' | 'DELETE_FILE' | 'FETCH' | 'SUMMARIZE' | 'SYSTEM';
  targetPath: string;
  cleanName?: string;
  status: 'EXECUTED' | 'DENIED' | 'FAILED' | 'RESTORED';
  previewContent: string;
  userPrompt: string;
  errorMessage?: string;
  createdAt: string;
  rlReward: number; // Reinforcement learning reward assigned to this action
  tags: string[];
}

export interface TrustedPattern {
  id: string;
  patternHash: string;
  actionType: string;
  signature: string;
  approvalCount: number;
  lastApproved: string;
  isActive: boolean;
}

export interface ToolLog {
  id: string;
  actionId: string;
  toolName: string;
  arguments: Record<string, any>;
  resultSummary: string;
  latencyMs: number;
  success: boolean;
  createdAt: string;
}

export interface RLPolicyState {
  rewardScore: number;
  totalEpisodes: number;
  policyConfidence: number; // 0% - 100%
  learnedPatternsCount: number;
  actionWeights: {
    CREATE_FILE: number;
    UPDATE_FILE: number;
    DELETE_FILE: number;
    FETCH: number;
    SUMMARIZE: number;
    SYSTEM: number;
  };
}

const STORAGE_KEYS = {
  USERS: 'elli_db_users',
  CURRENT_USER: 'elli_auth_current_user',
  TOKEN: 'elli_auth_token',
  CHAT_HISTORY: 'elli_db_chat_history',
  ACTION_HISTORY: 'elli_db_action_history',
  TRUSTED_PATTERNS: 'elli_db_trusted_patterns',
  TOOL_LOGS: 'elli_db_tool_logs',
  RL_STATE: 'elli_db_rl_state',
  WORKSPACE_FILES: 'elli_db_workspace_files',
};

// Initial default seed user
const DEFAULT_USERS: UserRecord[] = [
  {
    id: 'user-1',
    username: 'alex',
    role: 'admin',
    name: 'Alex Mercer',
    email: 'alex.mercer@desktop.internal',
    createdAt: '2026-11-01T08:00:00Z',
    lastLogin: new Date().toISOString(),
  },
];

// Initial seed actions
const INITIAL_ACTIONS: ActionHistoryRecord[] = [
  {
    id: 'act-1',
    userId: 'user-1',
    actionType: 'SUMMARIZE',
    targetPath: './agent_workspace/reports/Q3_revenue.md',
    status: 'EXECUTED',
    previewContent: '| Metric | Q2 Actual | Q3 Actual | Delta (%) |\n| ARR | $4.2M | $4.8M | +14.2% |\n| CAC | $320 | $290 | -9.3% |',
    userPrompt: 'Summarize Q3 revenue data and compare gross margin deltas',
    createdAt: '2026-11-10T10:14:00Z',
    rlReward: 2,
    tags: ['Charts', 'Financial Agent', 'Analytics'],
  },
  {
    id: 'act-2',
    userId: 'user-1',
    actionType: 'CREATE_FILE',
    targetPath: './agent_workspace/scripts/clean_dataset.py',
    status: 'EXECUTED',
    previewContent: 'import pandas as pd\ndef clean_data(path):\n    df = pd.read_csv(path)\n    return df.dropna()',
    userPrompt: 'Can you write a python script to cleanse CSV rows and strip null fields',
    createdAt: '2026-11-09T15:20:00Z',
    rlReward: 1,
    tags: ['Python', 'Automation', 'ETL'],
  },
  {
    id: 'act-3',
    userId: 'user-1',
    actionType: 'SYSTEM',
    targetPath: './agent_workspace/logs/daemon_profile.trace',
    status: 'EXECUTED',
    previewContent: 'Thread #4 Memory Trace: Peak Resident Set 88 MB (down from 342 MB). GC optimal.',
    userPrompt: 'Trace memory consumption on desktop daemon thread #4',
    createdAt: '2026-11-09T11:05:00Z',
    rlReward: 1,
    tags: ['Diagnostics', 'Daemon', 'Profiler'],
  },
];

const INITIAL_RL_STATE: RLPolicyState = {
  rewardScore: 42,
  totalEpisodes: 18,
  policyConfidence: 89.4,
  learnedPatternsCount: 3,
  actionWeights: {
    CREATE_FILE: 1.45,
    UPDATE_FILE: 1.20,
    DELETE_FILE: 0.85,
    FETCH: 1.60,
    SUMMARIZE: 1.75,
    SYSTEM: 1.10,
  },
};

/**
 * Universal Local Storage Database Engine
 * Emulates SQLite WAL with deterministic persistence across any OS or browser environment.
 */
class EllieDatabase {
  private load<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch {
      // In SSR or sandboxed environments
    }
    return fallback;
  }

  private save<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore
    }
  }

  // Users & Auth
  getUsers(): UserRecord[] {
    return this.load<UserRecord[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  }

  getUser(username: string): UserRecord | undefined {
    return this.getUsers().find((u) => u.username.toLowerCase() === username.toLowerCase());
  }

  getCurrentUser(): UserRecord | null {
    return this.load<UserRecord | null>(STORAGE_KEYS.CURRENT_USER, DEFAULT_USERS[0]);
  }

  setCurrentUser(user: UserRecord | null, token: string | null): void {
    if (user && token) {
      this.save(STORAGE_KEYS.CURRENT_USER, user);
      this.save(STORAGE_KEYS.TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  }

  isAuthenticated(): boolean {
    const token = this.load<string | null>(STORAGE_KEYS.TOKEN, null);
    const user = this.load<UserRecord | null>(STORAGE_KEYS.CURRENT_USER, null);
    return Boolean(token && user);
  }

  // Action History
  getActionHistory(): ActionHistoryRecord[] {
    return this.load<ActionHistoryRecord[]>(STORAGE_KEYS.ACTION_HISTORY, INITIAL_ACTIONS);
  }

  addAction(record: Omit<ActionHistoryRecord, 'id' | 'createdAt'>): ActionHistoryRecord {
    const actions = this.getActionHistory();
    const newRecord: ActionHistoryRecord = {
      ...record,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newRecord, ...actions];
    this.save(STORAGE_KEYS.ACTION_HISTORY, updated);
    return newRecord;
  }

  // Trusted Patterns (Progressive Trust)
  getTrustedPatterns(): TrustedPattern[] {
    return this.load<TrustedPattern[]>(STORAGE_KEYS.TRUSTED_PATTERNS, [
      {
        id: 'tp-1',
        patternHash: 'hash_create_file_reports',
        actionType: 'CREATE_FILE',
        signature: 'create_file:./agent_workspace/reports/*.md',
        approvalCount: 5,
        lastApproved: '2026-11-10T10:14:00Z',
        isActive: true,
      },
      {
        id: 'tp-2',
        patternHash: 'hash_summarize_workspace',
        actionType: 'SUMMARIZE',
        signature: 'summarize:./agent_workspace/**',
        approvalCount: 7,
        lastApproved: '2026-11-10T09:00:00Z',
        isActive: true,
      },
    ]);
  }

  recordPatternApproval(actionType: string, targetPath: string): { isNowTrusted: boolean; pattern: TrustedPattern } {
    const patterns = this.getTrustedPatterns();
    const signature = `${actionType}:${targetPath.split('/').slice(0, -1).join('/')}/*`;
    const patternHash = `hash_${btoa(signature).replace(/=/g, '').slice(0, 12)}`;

    let existing = patterns.find((p) => p.patternHash === patternHash);
    let isNowTrusted = false;

    if (existing) {
      existing.approvalCount += 1;
      existing.lastApproved = new Date().toISOString();
      if (existing.approvalCount >= 3 && !existing.isActive) {
        existing.isActive = true;
        isNowTrusted = true;
      }
    } else {
      existing = {
        id: `tp-${Date.now()}`,
        patternHash,
        actionType,
        signature,
        approvalCount: 1,
        lastApproved: new Date().toISOString(),
        isActive: false,
      };
      patterns.push(existing);
    }

    this.save(STORAGE_KEYS.TRUSTED_PATTERNS, patterns);
    return { isNowTrusted, pattern: existing };
  }

  // Reinforcement Learning State
  getRLState(): RLPolicyState {
    return this.load<RLPolicyState>(STORAGE_KEYS.RL_STATE, INITIAL_RL_STATE);
  }

  updateRLFeedback(actionType: keyof RLPolicyState['actionWeights'], rewardDelta: number): RLPolicyState {
    const state = this.getRLState();
    state.rewardScore += rewardDelta;
    state.totalEpisodes += 1;

    // Reinforce or dampen action weight
    const currentWeight = state.actionWeights[actionType] || 1.0;
    const newWeight = Math.max(0.1, Math.min(3.0, currentWeight + rewardDelta * 0.05));
    state.actionWeights[actionType] = parseFloat(newWeight.toFixed(2));

    // Dynamic confidence score adapts with consistent positive rewards
    const avgWeight = Object.values(state.actionWeights).reduce((a, b) => a + b, 0) / 6;
    state.policyConfidence = Math.min(99.5, Math.max(50.0, parseFloat((avgWeight * 55).toFixed(1))));

    this.save(STORAGE_KEYS.RL_STATE, state);
    return state;
  }

  // Reset / Clear database for testing
  resetAll(): void {
    localStorage.clear();
  }
}

export const db = new EllieDatabase();
