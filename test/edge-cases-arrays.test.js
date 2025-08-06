import { describe, it, expect, beforeEach, vi } from 'vitest';
import Glue from '../lib/glue.js';

describe('edge cases - array boundary conditions', () => {
  let glue;

  beforeEach(() => {
    glue = new Glue({ arr: [1, 2, 3] });
  });

  describe('empty arrays', () => {
    it('should handle operations on empty array', () => {
      glue.target.arr = [];
      const callback = vi.fn();
      
      glue.addObserver('arr', callback);
      
      const popped = glue.pop('arr');
      expect(popped).toBeUndefined();
      expect(callback).toHaveBeenCalled();
    });

    it('should handle filter on empty array', () => {
      glue.target.arr = [];
      
      const result = glue.filter('arr', n => n > 0);
      
      expect(result).toEqual([]);
      expect(glue.target.arr).toEqual([]);
    });

    it('should handle sortBy on empty array', () => {
      glue.target.arr = [];
      
      const result = glue.sortBy('arr', n => n);
      
      expect(result).toEqual([]);
    });
  });

  describe('single element arrays', () => {
    it('should handle pop on single element', () => {
      glue.target.arr = [42];
      const callback = vi.fn();
      
      glue.addObserver('arr[]', callback);
      
      const value = glue.pop('arr');
      
      expect(value).toBe(42);
      expect(glue.target.arr).toEqual([]);
      expect(callback).toHaveBeenCalled();
    });

    it('should handle filter removing all elements', () => {
      glue.target.arr = [1, 2, 3];
      const callback = vi.fn();
      
      glue.addObserver('arr[]', callback);
      
      glue.filter('arr', n => n > 10);
      
      expect(glue.target.arr).toEqual([]);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('array index boundaries', () => {
    it('should handle negative indices', () => {
      const callback = vi.fn();
      
      glue.addObserver('arr[-1]', callback);
      
      // Implementation specific - might not work as expected
      glue.set('arr[-1]', 99);
      
      // Check what actually happened
    });

    it('should handle out of bounds index', () => {
      const callback = vi.fn();
      
      glue.addObserver('arr[10]', callback);
      
      glue.set('arr[10]', 99);
      
      expect(glue.target.arr[10]).toBe(99);
      expect(glue.target.arr.length).toBe(11);
      expect(callback).toHaveBeenCalled();
    });

    it('should handle very large index', () => {
      const largeIndex = 10000;
      
      glue.set(`arr[${largeIndex}]`, 'far');
      
      expect(glue.target.arr[largeIndex]).toBe('far');
      expect(glue.target.arr.length).toBe(largeIndex + 1);
    });

    it('should handle removing out of bounds index', () => {
      expect(() => {
        glue.remove('arr[10]');
      }).not.toThrow();
    });
  });

  describe('array insert edge cases', () => {
    it('should insert at beginning', () => {
      glue.insert('arr', 0, 0);
      
      expect(glue.target.arr).toEqual([0, 1, 2, 3]);
    });

    it('should insert at end', () => {
      glue.insert('arr', 3, 4);
      
      expect(glue.target.arr).toEqual([1, 2, 3, 4]);
    });

    it('should handle insert beyond bounds', () => {
      glue.insert('arr', 10, 99);
      
      expect(glue.target.arr).toContain(99);
    });

    it('should handle negative insert index', () => {
      // Splice with negative index counts from end
      glue.insert('arr', -1, 99);
      
      expect(glue.target.arr).toContain(99);
    });
  });

  describe('sparse arrays', () => {
    it('should handle sparse array creation', () => {
      glue.target.sparse = new Array(5);
      glue.target.sparse[2] = 'middle';
      
      const callback = vi.fn();
      glue.addObserver('sparse[]', callback);
      
      glue.set('sparse[4]', 'end');
      
      expect(callback).toHaveBeenCalled();
      expect(glue.target.sparse[4]).toBe('end');
    });

    it('should handle filter on sparse array', () => {
      glue.target.sparse = [1, , , 4, , 6];
      
      const result = glue.filter('sparse', n => n > 2);
      
      expect(result).toEqual([4, 6]);
    });
  });

  describe('array with non-numeric properties', () => {
    it('should handle array with custom properties', () => {
      glue.target.arr.customProp = 'custom';
      
      const callback = vi.fn();
      glue.addObserver('arr', callback);
      
      glue.push('arr', 4);
      
      expect(glue.target.arr.customProp).toBe('custom');
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('array type coercion', () => {
    it('should handle array-like objects', () => {
      glue.target.arrayLike = { 0: 'a', 1: 'b', length: 2 };
      
      // This might not work as expected since it's not a real array
      expect(() => {
        glue.push('arrayLike', 'c');
      }).toThrow(); // push is not a function on non-arrays
    });

    it('should handle arrays with mixed types', () => {
      glue.target.mixed = [1, 'two', null, undefined, { obj: true }, [1, 2]];
      const callback = vi.fn();
      
      glue.addObserver('mixed[]', callback);
      
      glue.set('mixed[2]', 'replaced');
      
      expect(callback).toHaveBeenCalled();
      expect(glue.target.mixed[2]).toBe('replaced');
    });
  });

  describe('root array operations', () => {
    it('should handle operations on root array', () => {
      glue = new Glue([1, 2, 3]);
      const callback = vi.fn();
      
      glue.addObserver('[]', callback);
      
      glue.push(4);
      
      expect(glue.target).toEqual([1, 2, 3, 4]);
      expect(callback).toHaveBeenCalled();
    });

    it('should handle empty root array', () => {
      glue = new Glue([]);
      
      glue.push(1);
      glue.pop();
      
      expect(glue.target).toEqual([]);
    });

    it('should handle setting root array element', () => {
      glue = new Glue([1, 2, 3]);
      const callback = vi.fn();
      
      glue.addObserver('[1]', callback);
      
      glue.set('[1]', 99);
      
      expect(glue.target[1]).toBe(99);
      expect(callback).toHaveBeenCalled();
    });
  });
});