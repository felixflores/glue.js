import { describe, it, expect, beforeEach, vi } from 'vitest';
import Glue from '../lib/glue.js';

describe('core operations', () => {
  let glue;

  beforeEach(() => {
    glue = new Glue({
      str: 'hello',
      num: 42,
      obj: { nested: 'value' },
      arr: [1, 2, 3]
    });
  });

  describe('set', () => {
    it('should set simple property', () => {
      glue.set('str', 'world');
      expect(glue.target.str).toBe('world');
    });

    it('should set nested property', () => {
      glue.set('obj.nested', 'updated');
      expect(glue.target.obj.nested).toBe('updated');
    });

    it('should set array element', () => {
      glue.set('arr[1]', 99);
      expect(glue.target.arr[1]).toBe(99);
    });

    it('should create new nested properties', () => {
      glue.set('obj.new', 'created');
      expect(glue.target.obj.new).toBe('created');
    });

    it('should return glue instance for chaining', () => {
      const result = glue.set('str', 'world');
      expect(result).toBe(glue);
    });

    it('should handle complex nested paths', () => {
      glue.target = { a: { b: { c: { d: 'deep' } } } };
      glue.set('a.b.c.d', 'deeper');
      expect(glue.target.a.b.c.d).toBe('deeper');
    });
  });

  describe('get', () => {
    it('should get simple property', () => {
      expect(glue.get('str')).toBe('hello');
    });

    it('should get nested property', () => {
      expect(glue.get('obj.nested')).toBe('value');
    });

    it('should get array element', () => {
      expect(glue.get('arr[1]')).toBe(2);
    });

    it('should return undefined for non-existent path', () => {
      expect(glue.get('obj.nonexistent')).toBeUndefined();
    });

    it('should return entire target for empty key', () => {
      expect(glue.get('')).toBe(glue.target);
    });

    it('should return entire target for "*" key', () => {
      expect(glue.get('*')).toBe(glue.target);
    });

    it('should work with custom object parameter', () => {
      const customObj = { foo: 'bar' };
      expect(glue.get('foo', customObj)).toBe('bar');
    });
  });

  describe('remove', () => {
    it('should remove property', () => {
      const removed = glue.remove('str');
      expect(removed).toBe('hello');
      expect(glue.target.str).toBeUndefined();
    });

    it('should remove nested property', () => {
      const removed = glue.remove('obj.nested');
      expect(removed).toBe('value');
      expect(glue.target.obj.nested).toBeUndefined();
    });

    it('should remove array element', () => {
      const removed = glue.remove('arr[1]');
      expect(removed).toBe(2);
      expect(glue.target.arr).toEqual([1, 3]);
    });

    it('should notify observers', () => {
      const callback = vi.fn();
      glue.addObserver('str', callback);
      
      glue.remove('str');
      
      expect(callback).toHaveBeenCalledWith({
        operation: 'remove',
        value: undefined
      });
    });
  });

  describe('swap', () => {
    it('should swap two properties', () => {
      glue.swap('str', 'num');
      expect(glue.target.str).toBe(42);
      expect(glue.target.num).toBe('hello');
    });

    it('should swap nested properties', () => {
      glue.swap('str', 'obj.nested');
      expect(glue.target.str).toBe('value');
      expect(glue.target.obj.nested).toBe('hello');
    });

    it('should swap array elements', () => {
      glue.swap('arr[0]', 'arr[2]');
      expect(glue.target.arr).toEqual([3, 2, 1]);
    });

    it('should notify observers', () => {
      const callback = vi.fn();
      glue.addObserver('*', callback);
      
      glue.swap('str', 'num');
      
      expect(callback).toHaveBeenCalled();
    });

    it('should return glue instance for chaining', () => {
      const result = glue.swap('str', 'num');
      expect(result).toBe(glue);
    });
  });

  describe('chaining', () => {
    it('should support method chaining', () => {
      const callback = vi.fn();
      
      glue
        .addObserver('*', callback)
        .set('str', 'chained')
        .set('num', 100)
        .push('arr', 4)
        .remove('obj.nested');
      
      expect(glue.target.str).toBe('chained');
      expect(glue.target.num).toBe(100);
      expect(glue.target.arr).toEqual([1, 2, 3, 4]);
      expect(glue.target.obj.nested).toBeUndefined();
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle null values', () => {
      glue.set('str', null);
      expect(glue.target.str).toBeNull();
    });

    it('should handle undefined values', () => {
      glue.set('str', undefined);
      expect(glue.target.str).toBeUndefined();
    });

    it('should handle boolean values', () => {
      glue.set('bool', true);
      expect(glue.target.bool).toBe(true);
    });

    it('should handle empty arrays', () => {
      glue.set('arr', []);
      expect(glue.target.arr).toEqual([]);
    });

    it('should handle empty objects', () => {
      glue.set('obj', {});
      expect(glue.target.obj).toEqual({});
    });
  });
});