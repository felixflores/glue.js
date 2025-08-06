import { describe, it, expect, beforeEach, vi } from 'vitest';
import Glue from '../lib/glue.js';

describe('edge cases - special values', () => {
  let glue;

  beforeEach(() => {
    glue = new Glue({});
  });

  describe('null values', () => {
    it('should handle null as target', () => {
      glue = new Glue(null);
      const callback = vi.fn();
      
      glue.addObserver('*', callback);
      
      // Operations on null target might fail
      expect(glue.target).toBeNull();
    });

    it('should handle setting to null', () => {
      glue.target = { v1: 'value' };
      const callback = vi.fn();
      
      glue.addObserver('v1', callback);
      glue.set('v1', null);
      
      expect(glue.target.v1).toBeNull();
      expect(callback).toHaveBeenCalledWith({
        operation: 'set',
        value: null
      });
    });

    it('should handle null in nested structures', () => {
      glue.target = { a: { b: null } };
      const callback = vi.fn();
      
      glue.addObserver('a.b', callback);
      glue.set('a.b', 'not null');
      
      expect(callback).toHaveBeenCalled();
    });

    it('should handle null in arrays', () => {
      glue.target = { arr: [1, null, 3] };
      const callback = vi.fn();
      
      glue.addObserver('arr[1]', callback);
      glue.set('arr[1]', 2);
      
      expect(callback).toHaveBeenCalled();
      expect(glue.target.arr[1]).toBe(2);
    });
  });

  describe('undefined values', () => {
    it('should handle undefined as target', () => {
      glue = new Glue(undefined);
      
      expect(glue.target).toBeUndefined();
    });

    it('should handle setting to undefined', () => {
      glue.target = { v1: 'value' };
      const callback = vi.fn();
      
      glue.addObserver('v1', callback);
      glue.set('v1', undefined);
      
      expect(glue.target.v1).toBeUndefined();
      expect(callback).toHaveBeenCalledWith({
        operation: 'set',
        value: undefined
      });
    });

    it('should distinguish undefined from non-existent', () => {
      glue.target = { defined: undefined };
      
      expect(glue.get('defined')).toBeUndefined();
      expect(glue.get('nonexistent')).toBeUndefined();
      
      expect('defined' in glue.target).toBe(true);
      expect('nonexistent' in glue.target).toBe(false);
    });

    it('should handle undefined in arrays', () => {
      glue.target = { arr: [1, undefined, 3] };
      
      const result = glue.filter('arr', v => v !== undefined);
      
      expect(result).toEqual([1, 3]);
    });
  });

  describe('NaN values', () => {
    it('should handle NaN values', () => {
      glue.target = { num: NaN };
      const callback = vi.fn();
      
      glue.addObserver('num', callback);
      glue.set('num', NaN);
      
      // NaN !== NaN, so this might always trigger
      expect(callback).toHaveBeenCalled();
    });

    it('should handle NaN in calculations', () => {
      glue.target = { a: NaN, b: 5 };
      
      // This would need custom logic to handle NaN
      const sum = glue.get('a') + glue.get('b');
      
      expect(sum).toBeNaN();
    });

    it('should handle NaN in arrays', () => {
      glue.target = { arr: [1, NaN, 3] };
      
      const result = glue.filter('arr', v => !isNaN(v));
      
      expect(result).toEqual([1, 3]);
    });
  });

  describe('Infinity values', () => {
    it('should handle Infinity', () => {
      glue.target = { inf: Infinity };
      const callback = vi.fn();
      
      glue.addObserver('inf', callback);
      glue.set('inf', -Infinity);
      
      expect(glue.target.inf).toBe(-Infinity);
      expect(callback).toHaveBeenCalled();
    });

    it('should handle Infinity in arrays', () => {
      glue.target = { arr: [1, Infinity, -Infinity, 2] };
      
      const result = glue.filter('arr', v => isFinite(v));
      
      expect(result).toEqual([1, 2]);
    });
  });

  describe('boolean values', () => {
    it('should handle false vs undefined', () => {
      glue.target = { bool: false };
      const callback = vi.fn();
      
      glue.addObserver('bool', callback);
      
      // false is a valid value, not absence of value
      expect(glue.get('bool')).toBe(false);
      
      glue.set('bool', true);
      expect(callback).toHaveBeenCalled();
    });

    it('should handle boolean in conditions', () => {
      glue.target = { flags: [true, false, true] };
      
      const result = glue.filter('flags', v => v);
      
      expect(result).toEqual([true, true]);
    });
  });

  describe('string edge cases', () => {
    it('should handle empty string', () => {
      glue.target = { str: '' };
      const callback = vi.fn();
      
      glue.addObserver('str', callback);
      glue.set('str', 'not empty');
      
      expect(callback).toHaveBeenCalled();
    });

    it('should handle very long strings', () => {
      const longString = 'x'.repeat(100000);
      glue.target = { str: longString };
      
      const callback = vi.fn();
      glue.addObserver('str', callback);
      
      glue.set('str', 'short');
      
      expect(callback).toHaveBeenCalled();
    });

    it('should handle special characters in strings', () => {
      glue.target = { str: '\\n\\t\\r\\0' };
      const callback = vi.fn();
      
      glue.addObserver('str', callback);
      glue.set('str', '🚀 emoji');
      
      expect(glue.target.str).toBe('🚀 emoji');
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('number edge cases', () => {
    it('should handle very small numbers', () => {
      glue.target = { tiny: Number.MIN_VALUE };
      const callback = vi.fn();
      
      glue.addObserver('tiny', callback);
      glue.set('tiny', 0);
      
      expect(callback).toHaveBeenCalled();
    });

    it('should handle very large numbers', () => {
      glue.target = { huge: Number.MAX_VALUE };
      const callback = vi.fn();
      
      glue.addObserver('huge', callback);
      glue.set('huge', Number.MAX_SAFE_INTEGER);
      
      expect(callback).toHaveBeenCalled();
    });

    it('should handle negative zero', () => {
      glue.target = { zero: -0 };
      const callback = vi.fn();
      
      glue.addObserver('zero', callback);
      glue.set('zero', 0);
      
      // -0 === 0 in JavaScript
      expect(Object.is(glue.target.zero, 0)).toBe(true);
    });
  });

  describe('type changes', () => {
    it('should handle type changes', () => {
      glue.target = { v: 'string' };
      const callback = vi.fn();
      
      glue.addObserver('v', callback);
      
      glue.set('v', 42);
      expect(glue.target.v).toBe(42);
      
      glue.set('v', true);
      expect(glue.target.v).toBe(true);
      
      glue.set('v', { obj: true });
      expect(glue.target.v).toEqual({ obj: true });
      
      glue.set('v', [1, 2, 3]);
      expect(glue.target.v).toEqual([1, 2, 3]);
      
      expect(callback).toHaveBeenCalledTimes(4);
    });

    it('should handle changing from primitive to object', () => {
      glue.target = { v: 42 };
      const callback = vi.fn();
      
      glue.addObserver('v', callback);
      glue.set('v', { nested: { deep: 'value' } });
      
      expect(callback).toHaveBeenCalled();
      expect(glue.target.v).toEqual({ nested: { deep: 'value' } });
    });

    it('should handle changing from object to primitive', () => {
      glue.target = { v: { complex: 'object' } };
      const callback = vi.fn();
      
      glue.addObserver('v', callback);
      glue.set('v', 'simple');
      
      expect(callback).toHaveBeenCalled();
      expect(glue.target.v).toBe('simple');
    });
  });
});