import { describe, it, expect } from 'vitest';
import { getCurrentTurn } from './draft.js';

const participants = [
  { userId: 100, pickOrder: 1 },
  { userId: 200, pickOrder: 2 },
];

describe('getCurrentTurn', () => {
  it('pick 1 → participant with pickOrder 1', () => {
    const turn = getCurrentTurn(1, participants);
    expect(turn).toEqual({ userId: 100, pickNumber: 1 });
  });

  it('pick 2 → participant with pickOrder 2 (snake)', () => {
    const turn = getCurrentTurn(2, participants);
    expect(turn).toEqual({ userId: 200, pickNumber: 2 });
  });

  it('pick 3 → participant with pickOrder 2 (snake continues)', () => {
    const turn = getCurrentTurn(3, participants);
    expect(turn).toEqual({ userId: 200, pickNumber: 3 });
  });

  it('pick 10 (last pick) → returns correct participant', () => {
    // Snake order pick 10: getPickOrder(10) = 2
    const turn = getCurrentTurn(10, participants);
    expect(turn).toEqual({ userId: 200, pickNumber: 10 });
  });

  it('pick 11 (beyond total picks) → returns null', () => {
    const turn = getCurrentTurn(11, participants);
    expect(turn).toBeNull();
  });

  it('pick 0 → throws (no participant matches getPickOrder(0))', () => {
    expect(() => getCurrentTurn(0, participants)).toThrow();
  });
});
