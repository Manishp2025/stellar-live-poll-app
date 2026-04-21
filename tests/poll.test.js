import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cacheService } from '../src/services/cacheService.js';
import { calculatePercentage, getWinnerIndex, formatAddress } from '../src/utils/pollUtils.js';

// ─── Mock localStorage ────────────────────────────────────────────────────────
const createLocalStorageMock = () => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
};

// ─── Test Suite 1: CacheService ──────────────────────────────────────────────
describe('CacheService', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock());
  });

  it('stores and retrieves data correctly', () => {
    const payload = { question: 'Test?', options: ['A', 'B'], votes: [10, 20] };
    cacheService.set('poll_data', payload);
    expect(cacheService.get('poll_data')).toEqual(payload);
  });

  it('returns null for expired cache entries', () => {
    cacheService.set('stale_key', { foo: 'bar' }, -1); // negative TTL = already expired
    expect(cacheService.get('stale_key')).toBeNull();
  });

  it('removes an item and returns null afterward', () => {
    cacheService.set('to_remove', { a: 1 });
    cacheService.remove('to_remove');
    expect(cacheService.get('to_remove')).toBeNull();
  });
});

// ─── Test Suite 2: calculatePercentage ───────────────────────────────────────
describe('calculatePercentage', () => {
  it('calculates correct percentages that sum to 100', () => {
    const votes = [10, 20, 30, 40];
    const total = 100;
    const pcts = calculatePercentage(votes, total);
    expect(pcts).toEqual([10, 20, 30, 40]);
    expect(pcts.reduce((a, b) => a + b, 0)).toBe(100);
  });

  it('returns all-zero percentages when total is 0', () => {
    expect(calculatePercentage([0, 0, 0], 0)).toEqual([0, 0, 0]);
  });

  it('handles a dominant single option', () => {
    const pcts = calculatePercentage([0, 0, 100, 0], 100);
    expect(pcts).toEqual([0, 0, 100, 0]);
  });
});

// ─── Test Suite 3: Helpers ───────────────────────────────────────────────────
describe('getWinnerIndex', () => {
  it('returns index of option with most votes', () => {
    expect(getWinnerIndex([5, 42, 10, 3])).toBe(1);
  });

  it('returns -1 when no votes exist', () => {
    expect(getWinnerIndex([0, 0, 0])).toBe(-1);
  });
});

describe('formatAddress', () => {
  it('truncates a Stellar address to first 4 and last 4 chars', () => {
    const addr = 'GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ';
    expect(formatAddress(addr)).toBe('GDRX...UJUJ');
  });
});
