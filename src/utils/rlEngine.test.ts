import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateSandboxPath,
  parseAgentPrompt,
  calculateRLReward,
  isProgressiveTrustEligible,
} from './rlEngine';

test('validateSandboxPath accepts approved sandbox directories', () => {
  const validFile = validateSandboxPath('./agent_workspace/script.ts');
  assert.equal(validFile.valid, true);

  const validTrash = validateSandboxPath('./.agent_trash/old_backup.json');
  assert.equal(validTrash.valid, true);
});

test('validateSandboxPath strictly rejects path traversal and outside paths', () => {
  const traversal = validateSandboxPath('./agent_workspace/../../etc/passwd');
  assert.equal(traversal.valid, false);
  assert.match(traversal.reason || '', /Path traversal attempt/);

  const outside = validateSandboxPath('/var/data/secret.txt');
  assert.equal(outside.valid, false);
  assert.match(outside.reason || '', /Path outside sandbox/);
});

test('parseAgentPrompt accurately maps natural language to action types and sandboxed paths', () => {
  const createFile = parseAgentPrompt('create a file auth_middleware.ts with JWT');
  assert.equal(createFile.actionType, 'CREATE_FILE');
  assert.equal(createFile.targetPath, './agent_workspace/auth_middleware.ts');
  assert.equal(createFile.hasSideEffects, true);

  const fetchAction = parseAgentPrompt('fetching https://api.weather.com/data');
  assert.equal(fetchAction.actionType, 'FETCH');
  assert.equal(fetchAction.hasSideEffects, false);

  const shutdownAction = parseAgentPrompt('shut down local daemons');
  assert.equal(shutdownAction.actionType, 'SYSTEM');
  assert.equal(shutdownAction.hasSideEffects, true);
});

test('calculateRLReward assigns correct positive and negative reward signals', () => {
  assert.equal(calculateRLReward('EXECUTE'), 1);
  assert.equal(calculateRLReward('DENY'), -1);
  assert.equal(calculateRLReward('FEEDBACK_THUMBS_UP'), 2);
  assert.equal(calculateRLReward('FEEDBACK_THUMBS_DOWN'), -2);
});

test('isProgressiveTrustEligible requires at least 3 approvals', () => {
  assert.equal(isProgressiveTrustEligible(1), false);
  assert.equal(isProgressiveTrustEligible(2), false);
  assert.equal(isProgressiveTrustEligible(3), true);
  assert.equal(isProgressiveTrustEligible(5), true);
});
