import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compilationPermissions } from '../src/permissions';

test('maps generated permissions and never treats string values as grants', () => {
  assert.deepEqual(compilationPermissions({ admin: [
    { entity: 'Invoice', read: true, write: false, update: 'true', delete: null },
    { entity: '' }, null,
  ] }), {
    admin: [{ entity: 'Invoice', icon: 'database', read: true, write: false, update: false, delete: false }],
    member: [], guest: [],
  });
});

test('missing or malformed permissions produce empty role lists', () => {
  for (const value of [undefined, null, {}, { admin: 'bad', guest: [42] }]) {
    assert.deepEqual(compilationPermissions(value), { admin: [], member: [], guest: [] });
  }
});
