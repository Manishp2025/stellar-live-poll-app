import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cacheService } from '../src/services/cacheService';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: vi.fn(key => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

describe('CacheService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should store and retrieve data correctly', () => {
    const data = { foo: 'bar' };
    cacheService.set('test', data);
    expect(cacheService.get('test')).toEqual(data);
  });

  it('should return null for expired data', () => {
    const data = { foo: 'bar' };
    // Set with -1ms expiry
    cacheService.set('expired', data, -1);
    expect(cacheService.get('expired')).toBeNull();
  });

  it('should remove items correctly', () => {
    cacheService.set('to_remove', { a: 1 });
    cacheService.remove('to_remove');
    expect(cacheService.get('to_remove')).toBeNull();
  });
});

describe('Poll Logic', () => {
  it('should calculate percentages correctly', () => {
    const votes = [10, 20, 30, 40];
    const total = votes.reduce((a, b) => a + b, 0);
    const percentages = votes.map(v => Math.round((v / total) * 100));
    
    expect(percentages).toEqual([10, 20, 30, 40]);
    expect(percentages.reduce((a, b) => a + b, 0)).toBe(100);
  });
});
