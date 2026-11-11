export type ActionType = 'CREATE_FILE' | 'UPDATE_FILE' | 'DELETE_FILE' | 'FETCH' | 'SUMMARIZE' | 'SYSTEM';

export const SANDBOX_ALLOWED_PREFIXES = ['./agent_workspace/', './.agent_trash/'];

/**
 * Validates that a path is strictly inside the approved sandboxes.
 * Rejects path traversal (e.g. '../', '/etc', 'C:\Windows').
 */
export function validateSandboxPath(path: string): { valid: boolean; reason?: string } {
  const normalized = path.replace(/\\/g, '/').trim();

  if (normalized.includes('../') || normalized.includes('..')) {
    return { valid: false, reason: 'Path traversal attempt detected (.. blocked).' };
  }

  const isAllowed = SANDBOX_ALLOWED_PREFIXES.some((prefix) => normalized.startsWith(prefix));
  if (!isAllowed) {
    return {
      valid: false,
      reason: `Path outside sandbox. Only paths starting with ${SANDBOX_ALLOWED_PREFIXES.join(' or ')} are permitted.`,
    };
  }

  return { valid: true };
}

/**
 * Parses a natural language user prompt into an ActionType and target sandbox path.
 */
export function parseAgentPrompt(prompt: string): {
  actionType: ActionType;
  targetPath: string;
  hasSideEffects: boolean;
  cleanName: string;
} {
  const lower = prompt.toLowerCase();

  if (lower.includes('create a file') || lower.includes('create file') || lower.includes('make a file')) {
    const filenameMatch = prompt.match(/(?:create a file|create file|make a file)\s+([^\s]+)/i);
    const filename = filenameMatch ? filenameMatch[1].replace(/['"]/g, '') : 'new_script.ts';
    return {
      actionType: 'CREATE_FILE',
      targetPath: `./agent_workspace/${filename}`,
      hasSideEffects: true,
      cleanName: filename,
    };
  }

  if (lower.includes('update a file') || lower.includes('update file') || lower.includes('patch')) {
    const filenameMatch = prompt.match(/(?:update a file|update file|patch)\s+([^\s]+)/i);
    const filename = filenameMatch ? filenameMatch[1].replace(/['"]/g, '') : 'config.json';
    return {
      actionType: 'UPDATE_FILE',
      targetPath: `./agent_workspace/${filename}`,
      hasSideEffects: true,
      cleanName: filename,
    };
  }

  if (lower.includes('delete file') || lower.includes('delete a file') || lower.includes('remove file')) {
    const filenameMatch = prompt.match(/(?:delete file|delete a file|remove file)\s+([^\s]+)/i);
    const filename = filenameMatch ? filenameMatch[1].replace(/['"]/g, '') : 'temp.log';
    return {
      actionType: 'DELETE_FILE',
      targetPath: `./agent_workspace/${filename}`,
      hasSideEffects: true,
      cleanName: filename,
    };
  }

  if (lower.includes('fetching') || lower.includes('fetch')) {
    return {
      actionType: 'FETCH',
      targetPath: './agent_workspace/fetched_data.json',
      hasSideEffects: false, // Read only
      cleanName: 'fetched_data.json',
    };
  }

  if (lower.includes('summarize') || lower.includes('summary')) {
    return {
      actionType: 'SUMMARIZE',
      targetPath: './agent_workspace/summary_report.md',
      hasSideEffects: false,
      cleanName: 'summary_report.md',
    };
  }

  if (lower.includes('shut down') || lower.includes('shutdown') || lower.includes('kill')) {
    return {
      actionType: 'SYSTEM',
      targetPath: './agent_workspace/system_session.state',
      hasSideEffects: true,
      cleanName: 'Daemon Shutdown',
    };
  }

  return {
    actionType: 'SYSTEM',
    targetPath: './agent_workspace/task_result.txt',
    hasSideEffects: true,
    cleanName: 'System Automation',
  };
}

/**
 * Calculates Reinforcement Learning reward based on user actions & feedback.
 * - Approved & Executed Gatekeeper Action: +1 reward
 * - Denied Gatekeeper Action: -1 penalty
 * - Positive explicit feedback (Thumbs Up): +2 reward
 * - Negative explicit feedback (Thumbs Down): -2 penalty
 */
export function calculateRLReward(
  event: 'EXECUTE' | 'DENY' | 'FEEDBACK_THUMBS_UP' | 'FEEDBACK_THUMBS_DOWN'
): number {
  switch (event) {
    case 'EXECUTE':
      return 1;
    case 'DENY':
      return -1;
    case 'FEEDBACK_THUMBS_UP':
      return 2;
    case 'FEEDBACK_THUMBS_DOWN':
      return -2;
    default:
      return 0;
  }
}

/**
 * Determines if an action qualifies for Progressive Trust.
 * Per Elli Guardrails: 3 or more approvals of identical pattern allows trusted bypass.
 */
export function isProgressiveTrustEligible(approvalCount: number): boolean {
  return approvalCount >= 3;
}
