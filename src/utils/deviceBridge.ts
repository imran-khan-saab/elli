export interface WorkspaceFile {
  id: string;
  filename: string;
  path: string;
  content: string;
  sizeBytes: number;
  lastModified: string;
  sourceCommand: string;
}

export interface LocalDeviceStatus {
  deviceName: string;
  platform: 'windows' | 'mac' | 'ios' | 'linux';
  bridgeStatus: 'CONNECTED' | 'DISCONNECTED' | 'SYNCING';
  daemonPort: number;
  daemonUrl: string;
  workspaceDir: string;
  lastPingMs: number;
}

const STORAGE_KEYS = {
  DEVICE_STATUS: 'elli_device_status',
  WORKSPACE_FILES: 'elli_workspace_files',
};

const DEFAULT_FILES: WorkspaceFile[] = [
  {
    id: 'file-1',
    filename: 'config.production.json',
    path: './agent_workspace/config.production.json',
    content: JSON.stringify(
      {
        environment: 'production',
        sandboxed: true,
        version: '2.4.0',
        redis: { host: '127.0.0.1', port: 6379, pool: 10 },
        logging: { level: 'info', format: 'json' },
      },
      null,
      2
    ),
    sizeBytes: 198,
    lastModified: new Date().toISOString(),
    sourceCommand: 'create a file config.production.json',
  },
  {
    id: 'file-2',
    filename: 'clean_dataset.py',
    path: './agent_workspace/clean_dataset.py',
    content: `import pandas as pd\nimport sys\n\ndef clean_csv(path: str):\n    df = pd.read_csv(path)\n    df = df.dropna()\n    df['timestamp'] = pd.to_datetime(df['timestamp'])\n    return df\n\nif __name__ == '__main__':\n    print("Dataset cleansing complete.")`,
    sizeBytes: 242,
    lastModified: new Date(Date.now() - 3600000).toISOString(),
    sourceCommand: 'create a file clean_dataset.py',
  },
];

class DeviceBridgeService {
  private load<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch {
      // Ignore
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

  getDeviceStatus(platform: 'windows' | 'mac' | 'ios' | 'linux'): LocalDeviceStatus {
    const platformLabels = {
      windows: 'Windows 11 Workstation Pro',
      mac: 'macOS Apple Silicon (M3 Max)',
      ios: 'iOS Mobile Companion (iPhone)',
      linux: 'Linux Ubuntu Desktop (x86_64)',
    };

    return {
      deviceName: platformLabels[platform] || 'Local Workstation',
      platform,
      bridgeStatus: 'CONNECTED',
      daemonPort: 8741,
      daemonUrl: 'http://127.0.0.1:8741/api/v1',
      workspaceDir: './agent_workspace/',
      lastPingMs: 1.4,
    };
  }

  getWorkspaceFiles(): WorkspaceFile[] {
    return this.load<WorkspaceFile[]>(STORAGE_KEYS.WORKSPACE_FILES, DEFAULT_FILES);
  }

  saveWorkspaceFile(filename: string, content: string, sourceCommand: string): WorkspaceFile {
    const files = this.getWorkspaceFiles();
    const existingIndex = files.findIndex((f) => f.filename === filename);

    const record: WorkspaceFile = {
      id: `file-${Date.now()}`,
      filename,
      path: `./agent_workspace/${filename}`,
      content,
      sizeBytes: new Blob([content]).size,
      lastModified: new Date().toISOString(),
      sourceCommand,
    };

    if (existingIndex >= 0) {
      files[existingIndex] = record;
    } else {
      files.unshift(record);
    }

    this.save(STORAGE_KEYS.WORKSPACE_FILES, files);
    return record;
  }

  deleteWorkspaceFile(filename: string): boolean {
    const files = this.getWorkspaceFiles();
    const filtered = files.filter((f) => f.filename !== filename);
    this.save(STORAGE_KEYS.WORKSPACE_FILES, filtered);
    return filtered.length !== files.length;
  }

  /**
   * Downloads the file directly to the user's local operating system disk.
   */
  downloadToLocalDisk(file: WorkspaceFile): void {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const deviceBridge = new DeviceBridgeService();
