import test from 'node:test';
import assert from 'node:assert/strict';
import { voiceService } from './voiceService';

test('normalizeSpokenCommand cleans conversational prefixes and filler', () => {
  const result1 = voiceService.normalizeSpokenCommand('Hey Ellie please create a file auth.ts');
  assert.equal(result1, 'create a file auth.ts');

  const result2 = voiceService.normalizeSpokenCommand('can you summarize recent logs');
  assert.equal(result2, 'summarize recent logs');

  const result3 = voiceService.normalizeSpokenCommand('could you make a file package.json');
  assert.equal(result3, 'create a file package.json');
});

test('normalizeSpokenCommand handles deletion and fetch speech patterns', () => {
  const del = voiceService.normalizeSpokenCommand('remove file old_cache.log');
  assert.equal(del, 'delete file old_cache.log');

  const fetchCmd = voiceService.normalizeSpokenCommand('fetch data https://api.status.io');
  assert.equal(fetchCmd, 'fetching https://api.status.io');
});
