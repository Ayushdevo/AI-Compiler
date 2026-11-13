import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { JsonLines } from '../src/components/JsonLines';

test('generated JSON is rendered as text, not executable HTML', () => {
  const payload = '<img src=x onerror=alert(1)>';
  const html = renderToStaticMarkup(<JsonLines text={JSON.stringify({ value: payload }, null, 2)} />);
  assert.ok(!html.includes('<img'));
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.match(html, /value/);
});
