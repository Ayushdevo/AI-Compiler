import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeCompilationResult } from '../src/App';

test('rejects successful responses without a compilation payload', () => {
  for (const response of [{}, { data: {} }, { data: [] }, { data: { message: 'ok' } }, { data: { ir: {} } }, { data: { pipelineOutputJson: '  ' } }]) {
    assert.equal(normalizeCompilationResult(response), null);
  }
});

test('accepts both backend JSON and structured IR forms', () => {
  assert.equal(normalizeCompilationResult({ data: { pipelineOutputJson: '{"entities":[]}' } })?.pipelineOutputJson, '{"entities":[]}');
  assert.deepEqual(JSON.parse(normalizeCompilationResult({ ir: { entities: [] } })!.pipelineOutputJson), { entities: [] });
});
