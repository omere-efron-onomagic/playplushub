import { describe, expect, it } from 'vitest';
import { getRoundsForGame, getLevelsForRound } from './linkFourLevelStore.service.js';

describe('linkFourLevelStore (round-based)', () => {
  it('returns 5 rounds for game 1', async () => {
    const byRound = await getRoundsForGame('1');
    expect(byRound.size).toBe(5);
    expect([...byRound.keys()]).toEqual(['round-1', 'round-2', 'round-3', 'round-4', 'round-5']);
  });

  it('each round has 2 levels', async () => {
    const byRound = await getRoundsForGame('1');
    for (const [, levels] of byRound) {
      expect(levels.length).toBe(2);
    }
  });

  it('round-1 has WATER and LIGHT', async () => {
    const levels = await getLevelsForRound('1', 'round-1');
    expect(levels.length).toBe(2);
    const answers = levels.map((l) => l.answer);
    expect(answers).toContain('WATER');
    expect(answers).toContain('LIGHT');
  });

  it('non-round game returns empty rounds', async () => {
    const byRound = await getRoundsForGame('2');
    expect(byRound.size).toBe(0);
  });
});
