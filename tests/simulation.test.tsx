import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import SchemaScreen from '../src/components/SchemaScreen';
import { GOLD_TEMPLATES } from '../src/types';
import { simulationLog, type SimulationAction } from '../src/simulation';

test('every example identifies itself as a non-executing simulation', () => {
  for (const action of ['db', 'api', 'auth', 'stripe'] as SimulationAction[]) {
    assert.match(simulationLog(action).join(' '), /no code was executed and no checks were performed/i);
  }
});

test('schema screen labels the examples without claiming live execution', () => {
  const html = renderToStaticMarkup(<SchemaScreen selectedTemplate={GOLD_TEMPLATES.crm} setTemplate={() => {}} />);
  assert.match(html, /These examples do not execute generated code/);
  assert.doesNotMatch(html, /100% SECURE|PUSH ACTIVE CONFIG TO RUNTIME|live server memory context/);
});
