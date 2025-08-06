import { describe, it, expect, beforeEach, vi } from 'vitest';
import Glue from '../lib/glue.js';

describe('notify', () => {
  let glue;

  beforeEach(() => {
    glue = new Glue({ v1: 'initial', v2: { nested: 'value' }, arr: [1, 2, 3] });
  });

  describe('basic notifications', () => {
    it('should notify on simple property change', () => {
      const callback = vi.fn();
      glue.addObserver('v1', callback);
      
      glue.set('v1', 'updated');
      
      expect(callback).toHaveBeenCalledWith({
        operation: 'set',
        value: 'updated'
      });
    });

    it('should not notify if value unchanged', () => {
      const callback = vi.fn();
      glue.addObserver('v1', callback);
      
      glue.set('v1', 'initial');
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should notify wildcard observer on any change', () => {
      const callback = vi.fn();
      glue.addObserver('*', callback);
      
      glue.set('v1', 'updated');
      
      expect(callback).toHaveBeenCalledWith({
        operation: 'set',
        value: glue.target
      });
    });

    it('should notify on nested property change', () => {
      const callback = vi.fn();
      glue.addObserver('v2.nested', callback);
      
      glue.set('v2.nested', 'updated');
      
      expect(callback).toHaveBeenCalledWith({
        operation: 'set',
        value: 'updated'
      });
    });
  });

  describe('operation filtering', () => {
    it('should only notify on matching operation', () => {
      const setCallback = vi.fn();
      const pushCallback = vi.fn();
      
      glue.addObserver('arr:set', setCallback);
      glue.addObserver('arr:push', pushCallback);
      
      glue.push('arr', 4);
      
      expect(setCallback).not.toHaveBeenCalled();
      expect(pushCallback).toHaveBeenCalled();
    });

    it('should notify on multiple specified operations', () => {
      const callback = vi.fn();
      glue.addObserver('arr:push,pop', callback);
      
      glue.push('arr', 4);
      expect(callback).toHaveBeenCalledTimes(1);
      
      glue.pop('arr');
      expect(callback).toHaveBeenCalledTimes(2);
      
      glue.set('arr', []);
      expect(callback).toHaveBeenCalledTimes(2); // No additional call
    });
  });

  describe('array notifications', () => {
    it('should notify specific index observer', () => {
      const callback = vi.fn();
      glue.addObserver('arr[1]', callback);
      
      glue.set('arr[1]', 99);
      
      expect(callback).toHaveBeenCalledWith({
        operation: 'set',
        value: 99
      });
    });

    it('should notify generic array observer with index', () => {
      const callback = vi.fn();
      glue.addObserver('arr[]', callback);
      
      glue.set('arr[1]', 99);
      
      expect(callback).toHaveBeenCalledWith({
        operation: 'set',
        value: 99,
        index: 1
      });
    });

    it('should notify on array push', () => {
      const callback = vi.fn();
      glue.addObserver('arr[]', callback);
      
      glue.push('arr', 4);
      
      expect(callback).toHaveBeenCalledWith({
        operation: 'push',
        value: 4,
        index: 3
      });
    });

    it('should notify on array pop', () => {
      const callback = vi.fn();
      glue.addObserver('arr[]', callback);
      
      glue.pop('arr');
      
      expect(callback).toHaveBeenCalledWith({
        operation: 'pop',
        value: undefined,
        index: 2
      });
    });

    it('should notify multiple times on filter', () => {
      const callback = vi.fn();
      glue.addObserver('arr[]', callback);
      
      glue.filter('arr', (n) => n !== 2);
      
      // Filter removes element at index 1 (value 2)
      expect(callback).toHaveBeenCalled();
      const calls = callback.mock.calls;
      expect(calls.some(call => call[0].operation === 'filter')).toBe(true);
    });
  });

  describe('context', () => {
    it('should execute callback in default target context', () => {
      let contextInCallback;
      const callback = function() {
        contextInCallback = this;
      };
      
      glue.addObserver('v1', callback);
      glue.set('v1', 'updated');
      
      expect(contextInCallback).toBe(glue.target);
    });

    it('should execute callback in custom context', () => {
      let contextInCallback;
      const customContext = { custom: true };
      const callback = function() {
        contextInCallback = this;
      };
      
      glue.addObserver('v1', customContext, callback);
      glue.set('v1', 'updated');
      
      expect(contextInCallback).toBe(customContext);
    });
  });

  describe('multiple observers', () => {
    it('should notify all observers for a key', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      glue.addObserver('v1', callback1);
      glue.addObserver('v1', callback2);
      
      glue.set('v1', 'updated');
      
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should notify parent path observers', () => {
      const nestedCallback = vi.fn();
      const parentCallback = vi.fn();
      const rootCallback = vi.fn();
      
      glue.addObserver('v2.nested', nestedCallback);
      glue.addObserver('v2', parentCallback);
      glue.addObserver('*', rootCallback);
      
      glue.set('v2.nested', 'updated');
      
      expect(nestedCallback).toHaveBeenCalled();
      expect(parentCallback).toHaveBeenCalled();
      expect(rootCallback).toHaveBeenCalled();
    });
  });

  describe('complex scenarios', () => {
    it('should handle deeply nested paths', () => {
      glue.target = { a: { b: { c: { d: 'deep' } } } };
      const callback = vi.fn();
      
      glue.addObserver('a.b.c.d', callback);
      glue.set('a.b.c.d', 'deeper');
      
      expect(callback).toHaveBeenCalledWith({
        operation: 'set',
        value: 'deeper'
      });
    });

    it('should handle array of objects', () => {
      glue.target = { items: [{ name: 'item1' }, { name: 'item2' }] };
      const callback = vi.fn();
      
      glue.addObserver('items[0].name', callback);
      glue.set('items[0].name', 'updated');
      
      expect(callback).toHaveBeenCalledWith({
        operation: 'set',
        value: 'updated'
      });
    });

    it('should handle swap operation', () => {
      const callback = vi.fn();
      glue.addObserver('*', callback);
      
      glue.swap('v1', 'v2.nested');
      
      expect(callback).toHaveBeenCalled();
      expect(glue.target.v1).toBe('value');
      expect(glue.target.v2.nested).toBe('initial');
    });
  });
});