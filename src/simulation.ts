export type SimulationAction = 'db' | 'api' | 'auth' | 'stripe';

/** These UI examples do not execute or validate generated artifacts. */
export function simulationLog(action: SimulationAction): string[] {
  const descriptions: Record<SimulationAction, string> = {
    db: 'Database schema example selected.',
    api: 'API route example selected.',
    auth: 'Authorization example selected.',
    stripe: 'Payment example selected.',
  };
  return [descriptions[action], 'Simulation only: no code was executed and no checks were performed.'];
}
