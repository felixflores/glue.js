import { describe, it, expect, beforeEach, vi } from 'vitest';
import Glue from '../lib/glue.js';

describe('array operations', () => {
  let glue;

  beforeEach(() => {
    glue = new Glue({ arr: [1, 2, 3, 4, 5] });
  });

  describe('push', () => {
    it('should add element to array', () => {
      glue.push('arr', 6);
      expect(glue.target.arr).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should work on root array', () => {
      glue = new Glue([1, 2, 3]);
      glue.push(4);
      expect(glue.target).toEqual([1, 2, 3, 4]);
    });

    it('should notify observers', () => {
      const callback = vi.fn();
      glue.addObserver('arr', callback);
      
      glue.push('arr', 6);
      
      expect(callback).toHaveBeenCalledWith({
        operation: 'push',
        value: [1, 2, 3, 4, 5, 6]
      });
    });

    it('should return glue instance for chaining', () => {
      const result = glue.push('arr', 6);
      expect(result).toBe(glue);
    });
  });

  describe('pop', () => {
    it('should remove last element from array', () => {
      const value = glue.pop('arr');
      expect(value).toBe(5);
      expect(glue.target.arr).toEqual([1, 2, 3, 4]);
    });

    it('should work on root array', () => {
      glue = new Glue([1, 2, 3]);
      const value = glue.pop();
      expect(value).toBe(3);
      expect(glue.target).toEqual([1, 2]);
    });

    it('should notify observers', () => {
      const callback = vi.fn();
      glue.addObserver('arr', callback);
      
      glue.pop('arr');
      
      expect(callback).toHaveBeenCalledWith({
        operation: 'pop',
        value: [1, 2, 3, 4]
      });
    });

    it('should return popped value', () => {
      const value = glue.pop('arr');
      expect(value).toBe(5);
    });
  });

  describe('insert', () => {
    it('should insert element at index', () => {
      glue.insert('arr', 2, 99);
      expect(glue.target.arr).toEqual([1, 2, 99, 3, 4, 5]);
    });

    it('should work on root array', () => {
      glue = new Glue([1, 2, 3]);
      glue.insert(1, 99);
      expect(glue.target).toEqual([1, 99, 2, 3]);
    });

    it('should notify observers', () => {
      const callback = vi.fn();
      glue.addObserver('arr', callback);
      
      glue.insert('arr', 2, 99);
      
      expect(callback).toHaveBeenCalledWith({
        operation: 'insert',
        value: [1, 2, 99, 3, 4, 5]
      });
    });

    it('should return glue instance for chaining', () => {
      const result = glue.insert('arr', 2, 99);
      expect(result).toBe(glue);
    });
  });

  describe('filter', () => {
    it('should filter array in place', () => {
      glue.filter('arr', n => n % 2 === 0);
      expect(glue.target.arr).toEqual([2, 4]);
    });

    it('should work on root array', () => {
      glue = new Glue([1, 2, 3, 4, 5]);
      glue.filter(n => n > 2);
      expect(glue.target).toEqual([3, 4, 5]);
    });

    it('should notify observers for each removed element', () => {
      const callback = vi.fn();
      glue.addObserver('arr[]', callback);
      
      glue.filter('arr', n => n % 2 === 0);
      
      // Should be called for removing 1, 3, and 5
      const calls = callback.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      expect(calls.every(call => call[0].operation === 'filter')).toBe(true);
    });

    it('should return filtered array', () => {
      const result = glue.filter('arr', n => n % 2 === 0);
      expect(result).toEqual([2, 4]);
    });
  });

  describe('sortBy', () => {
    it('should sort array in place', () => {
      glue.target.arr = [3, 1, 4, 1, 5, 9];
      glue.sortBy('arr', n => n);
      expect(glue.target.arr).toEqual([1, 1, 3, 4, 5, 9]);
    });

    it('should work on root array', () => {
      glue = new Glue(['c', 'a', 'b']);
      glue.sortBy(s => s);
      expect(glue.target).toEqual(['a', 'b', 'c']);
    });

    it('should sort with custom iterator', () => {
      glue.target.arr = ['apple', 'pie', 'zoo', 'me'];
      glue.sortBy('arr', s => s.length);
      expect(glue.target.arr).toEqual(['me', 'pie', 'zoo', 'apple']);
    });

    it('should notify observers', () => {
      const callback = vi.fn();
      glue.addObserver('arr', callback);
      
      glue.target.arr = [3, 1, 2];
      glue.sortBy('arr', n => n);
      
      expect(callback).toHaveBeenCalled();
    });

    it('should return sorted array', () => {
      glue.target.arr = [3, 1, 2];
      const result = glue.sortBy('arr', n => n);
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('remove', () => {
    it('should remove array element at index', () => {
      const removed = glue.remove('arr[2]');
      expect(removed).toBe(3);
      expect(glue.target.arr).toEqual([1, 2, 4, 5]);
    });

    it('should work on root array', () => {
      glue = new Glue([1, 2, 3]);
      const removed = glue.remove('[1]');
      expect(removed).toBe(2);
      expect(glue.target).toEqual([1, 3]);
    });

    it('should remove object property', () => {
      glue.target = { a: 1, b: 2, c: 3 };
      const removed = glue.remove('b');
      expect(removed).toBe(2);
      expect(glue.target).toEqual({ a: 1, c: 3 });
    });

    it('should notify observers', () => {
      const callback = vi.fn();
      glue.addObserver('arr', callback);
      
      glue.remove('arr[2]');
      
      expect(callback).toHaveBeenCalledWith({
        operation: 'remove',
        value: [1, 2, 4, 5]
      });
    });
  });
});