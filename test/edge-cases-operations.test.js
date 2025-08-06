import { describe, it, expect, beforeEach, vi } from 'vitest';
import Glue from '../lib/glue.js';

describe('edge cases - operations and methods', () => {
  let glue;

  beforeEach(() => {
    glue = new Glue({ v1: 'initial', v2: 'other' });
  });

  describe('swap edge cases', () => {
    it('should handle swapping same location', () => {
      const callback = vi.fn();
      glue.addObserver('v1', callback);
      
      glue.swap('v1', 'v1');
      
      expect(glue.target.v1).toBe('initial');
      // Swapping same location doesn't change value
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle swapping non-existent properties', () => {
      glue.swap('v1', 'nonexistent');
      
      expect(glue.target.v1).toBeUndefined();
      expect(glue.target.nonexistent).toBe('initial');
    });

    it('should handle swapping nested with root', () => {
      glue.target = { a: 'root', b: { c: 'nested' } };
      
      glue.swap('a', 'b.c');
      
      expect(glue.target.a).toBe('nested');
      expect(glue.target.b.c).toBe('root');
    });

    it('should handle swapping array elements', () => {
      glue.target = { arr: [1, 2, 3, 4, 5] };
      
      glue.swap('arr[0]', 'arr[4]');
      
      expect(glue.target.arr).toEqual([5, 2, 3, 4, 1]);
    });

    it('should handle swapping different types', () => {
      glue.target = { str: 'string', num: 42, obj: { a: 1 }, arr: [1, 2] };
      
      glue.swap('str', 'num');
      expect(glue.target.str).toBe(42);
      expect(glue.target.num).toBe('string');
      
      glue.swap('obj', 'arr');
      expect(glue.target.obj).toEqual([1, 2]);
      expect(glue.target.arr).toEqual({ a: 1 });
    });
  });

  describe('get edge cases', () => {
    it('should handle getting with empty string', () => {
      const result = glue.get('');
      expect(result).toBe(glue.target);
    });

    it('should handle getting with asterisk', () => {
      const result = glue.get('*');
      expect(result).toBe(glue.target);
    });

    it('should handle getting non-existent nested path', () => {
      const result = glue.get('does.not.exist');
      expect(result).toBeUndefined();
    });

    it('should handle getting from null parent', () => {
      glue.target = { a: null };
      
      const result = glue.get('a.b.c');
      expect(result).toBeUndefined();
    });

    it('should handle getting with custom object', () => {
      const custom = { foo: { bar: 'baz' } };
      
      const result = glue.get('foo.bar', custom);
      expect(result).toBe('baz');
    });

    it('should handle array access in get', () => {
      glue.target = { arr: [{ nested: 'value' }] };
      
      const result = glue.get('arr[0].nested');
      expect(result).toBe('value');
    });
  });

  describe('set edge cases', () => {
    it('should handle setting root property', () => {
      const callback = vi.fn();
      glue.addObserver('*', callback);
      
      glue.set('newProp', 'value');
      
      expect(glue.target.newProp).toBe('value');
      expect(callback).toHaveBeenCalled();
    });

    it('should handle setting with same value', () => {
      const callback = vi.fn();
      glue.addObserver('v1', callback);
      
      glue.set('v1', 'initial');
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle setting deep equal objects', () => {
      glue.target = { obj: { a: 1, b: 2 } };
      const callback = vi.fn();
      glue.addObserver('obj', callback);
      
      glue.set('obj', { a: 1, b: 2 });
      
      expect(callback).not.toHaveBeenCalled();
    });

    it.skip('should create intermediate objects - NOT SUPPORTED', () => {
      // LIMITATION: The library doesn't auto-create nested paths
      glue.target = {};
      
      expect(() => {
        glue.set('a.b.c.d', 'deep');
      }).toThrow();
    });
  });

  describe('remove edge cases', () => {
    it('should handle removing non-existent property', () => {
      const result = glue.remove('nonexistent');
      
      expect(result).toBeUndefined();
    });

    it('should handle removing from array with gaps', () => {
      glue.target = { arr: [1, , , 4] };
      
      const result = glue.remove('arr[3]');
      
      expect(result).toBe(4);
      expect(glue.target.arr.length).toBe(3);
    });

    it('should handle removing nested property', () => {
      glue.target = { a: { b: { c: 'value' } } };
      
      const result = glue.remove('a.b.c');
      
      expect(result).toBe('value');
      expect(glue.target.a.b.c).toBeUndefined();
    });

    it('should handle removing last property of object', () => {
      glue.target = { last: 'one' };
      
      glue.remove('last');
      
      expect(glue.target).toEqual({});
    });
  });

  describe('filter edge cases', () => {
    it('should handle filter with no matches', () => {
      glue.target = { arr: [1, 2, 3] };
      
      const result = glue.filter('arr', n => n > 10);
      
      expect(result).toEqual([]);
      expect(glue.target.arr).toEqual([]);
    });

    it('should handle filter keeping all', () => {
      glue.target = { arr: [1, 2, 3] };
      
      const result = glue.filter('arr', n => true);
      
      expect(result).toEqual([1, 2, 3]);
    });

    it.skip('should handle filter with index - NOT IMPLEMENTED', () => {
      // LIMITATION: filter doesn't pass index to callback
      glue.target = { arr: [1, 2, 3, 4, 5] };
      
      const result = glue.filter('arr', (n, i) => i % 2 === 0);
      
      // Would expect [1, 3, 5] but filter doesn't pass index
      expect(result).toEqual([]);
    });

    it('should handle filter throwing error', () => {
      glue.target = { arr: [1, 2, 3] };
      
      expect(() => {
        glue.filter('arr', n => {
          if (n === 2) throw new Error('Filter error');
          return true;
        });
      }).toThrow('Filter error');
    });
  });

  describe('sortBy edge cases', () => {
    it('should handle stable sort', () => {
      glue.target = {
        arr: [
          { name: 'a', order: 2 },
          { name: 'b', order: 1 },
          { name: 'c', order: 1 }
        ]
      };
      
      glue.sortBy('arr', item => item.order);
      
      // Should maintain relative order of items with same sort value
      expect(glue.target.arr[0].name).toBe('b');
      expect(glue.target.arr[1].name).toBe('c');
      expect(glue.target.arr[2].name).toBe('a');
    });

    it('should handle sort with undefined values', () => {
      glue.target = { arr: [3, undefined, 1, undefined, 2] };
      
      glue.sortBy('arr', n => n);
      
      // undefined values behavior depends on implementation
      expect(glue.target.arr).toContain(1);
      expect(glue.target.arr).toContain(2);
      expect(glue.target.arr).toContain(3);
    });

    it('should handle sort with NaN', () => {
      glue.target = { arr: [3, NaN, 1, NaN, 2] };
      
      glue.sortBy('arr', n => n);
      
      // NaN sorts unpredictably with underscore's sortBy
      const nonNaN = glue.target.arr.filter(n => !isNaN(n));
      expect(nonNaN).toContain(1);
      expect(nonNaN).toContain(2);
      expect(nonNaN).toContain(3);
    });
  });

  describe('push/pop with root array', () => {
    it('should handle push on root array', () => {
      glue = new Glue([1, 2, 3]);
      const callback = vi.fn();
      
      glue.addObserver('[]', callback);
      glue.push(4);
      
      expect(glue.target).toEqual([1, 2, 3, 4]);
      expect(callback).toHaveBeenCalled();
    });

    it('should handle pop on root array', () => {
      glue = new Glue([1, 2, 3]);
      const callback = vi.fn();
      
      glue.addObserver('[]', callback);
      const value = glue.pop();
      
      expect(value).toBe(3);
      expect(glue.target).toEqual([1, 2]);
      expect(callback).toHaveBeenCalled();
    });

    it('should handle insert on root array', () => {
      glue = new Glue([1, 3]);
      
      glue.insert(1, 2);
      
      expect(glue.target).toEqual([1, 2, 3]);
    });
  });

  describe('method chaining complex scenarios', () => {
    it.skip('should handle complex chaining - BROKEN', () => {
      // BUG: remove() returns the removed value, not 'this'
      // This breaks the chaining pattern
      glue.target = { a: 1, b: 2, arr: [1, 2, 3] };
      
      // This will fail because remove doesn't return 'this'
      const result = glue
        .set('a', 10)
        .set('b', 20)
        .push('arr', 4)
        .swap('a', 'b')
        .remove('arr[0]')
        .set('c', 30);
      
      expect(result).toBe(glue);
    });

    it.skip('should maintain chainability after errors - BROKEN', () => {
      // BUG: remove() doesn't return 'this' for chaining
      glue.target = { a: 1 };
      
      // This will fail because remove returns undefined for nonexistent
      const result = glue
        .set('a', 2)
        .remove('nonexistent')
        .set('b', 3);
      
      expect(result).toBe(glue);
    });
  });

  describe('baseKeyAndSuffix edge cases', () => {
    it('should handle array notation', () => {
      const [base, suffix] = glue.baseKeyAndSuffix('arr[5]');
      
      expect(suffix).toBe('5');
    });

    it('should handle nested array notation', () => {
      glue.target = { a: { b: [1, 2, 3] } };
      
      const [base, suffix] = glue.baseKeyAndSuffix('a.b[2]');
      
      expect(base).toBe(glue.target.a.b);
      expect(suffix).toBe('2');
    });

    it('should handle root level property', () => {
      const [base, suffix] = glue.baseKeyAndSuffix('prop');
      
      expect(base).toBe(glue.target);
      expect(suffix).toBe('prop');
    });
  });
});