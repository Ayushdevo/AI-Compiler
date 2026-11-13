import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { test } from 'node:test';

async function freePort() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
}

test('simulator validates missing bodies and accepts a prompt', async () => {
  const port = await freePort();
  const child = spawn(process.execPath, ['--import', 'tsx', 'server.ts'], {
    env: { ...process.env, NODE_ENV: 'development', PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('server startup timed out')), 15000);
      child.stdout.on('data', (data) => {
        if (data.toString().includes('Synapse compiler running')) {
          clearTimeout(timeout);
          resolve();
        }
      });
      child.on('exit', (code) => { clearTimeout(timeout); reject(new Error(`server exited: ${code}`)); });
      child.on('error', reject);
    });
    const url = `http://127.0.0.1:${port}/api/simulate`;
    for (const options of [
      { method: 'POST' },
      { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' },
    ]) {
      const response = await fetch(url, options);
      assert.equal(response.status, 400);
      assert.deepEqual(await response.json(), { error: 'Prompt must be a string' });
    }
    const response = await fetch(url, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt: 'Create a Customer application' }),
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).simulated, true);
  } finally {
    child.kill();
  }
});
