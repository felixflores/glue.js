import { describe, it, expect, beforeEach, vi } from 'vitest';
import Glue from '../lib/glue.js';

describe('edge cases - performance and memory', () => {
  let glue;

  beforeEach(() => {
    glue = new Glue({});
  });

  describe('large data sets', () => {
    it('should handle large arrays', () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => i);
      glue.target = { data: largeArray };
      
      const callback = vi.fn();
      glue.addObserver('data[]', callback);
      
      glue.push('data', 10000);
      
      expect(callback).toHaveBeenCalled();
      expect(glue.target.data.length).toBe(10001);
    });

    it('should handle many observers', () => {
      const callbacks = [];
      
      // Add 1000 observers
      for (let i = 0; i < 1000; i++) {
        const cb = vi.fn();
        callbacks.push(cb);
        glue.addObserver('v1', cb);
      }
      
      glue.target.v1 = 'initial';
      glue.set('v1', 'changed');
      
      callbacks.forEach(cb => {
        expect(cb).toHaveBeenCalled();
      });
    });

    it('should handle many properties', () => {
      const obj = {};
      for (let i = 0; i < 1000; i++) {
        obj[`prop${i}`] = i;
      }
      glue.target = obj;
      
      const callback = vi.fn();
      glue.addObserver('*', callback);
      
      glue.set('prop500', 'changed');
      
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('circular references', () => {
    it('should handle circular references in target', () => {
      const obj = { a: 'value' };
      obj.self = obj; // circular reference
      
      // This will throw with JSON.stringify used in deepClone
      expect(() => {
        glue = new Glue(obj);
        glue.set('a', 'changed');
      }).toThrow();
    });

    it('should handle circular references in nested objects', () => {
      const child = { name: 'child' };
      const parent = { name: 'parent', child };
      child.parent = parent; // circular
      
      glue.target = { data: parent };
      
      // This will throw when trying to clone
      expect(() => {
        glue.set('data.name', 'changed');
      }).toThrow();
    });

    it('should handle self-referencing arrays', () => {
      const arr = [1, 2, 3];
      arr.push(arr); // self reference
      
      glue.target = { arr };
      
      // This will throw when trying to clone
      expect(() => {
        glue.push('arr', 4);
      }).toThrow();
    });
  });

  describe('memory leaks', () => {
    it('should clean up removed observers', () => {
      const callback = vi.fn();
      
      glue.addObserver('v1', callback);
      glue.removeObserver('v1', callback);
      
      glue.target.v1 = 'value';
      glue.set('v1', 'changed');
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle repeated add/remove cycles', () => {
      const callback = vi.fn();
      
      for (let i = 0; i < 100; i++) {
        glue.addObserver('v1', callback);
        glue.removeObserver('v1', callback);
      }
      
      // Check that listeners are actually removed
      expect(glue.listeners.specific['v1']).toBeUndefined();
    });

    it('should handle resetListeners', () => {
      // Add many observers
      for (let i = 0; i < 100; i++) {
        glue.addObserver(`v${i}`, () => {});
      }
      
      glue.resetListeners();
      
      expect(glue.listeners.specific).toEqual({});
      expect(glue.listeners.generic).toEqual({});
    });
  });

  describe('rapid operations', () => {
    it('should handle rapid successive sets', () => {
      const callback = vi.fn();
      glue.addObserver('v1', callback);
      
      glue.target.v1 = 0;
      
      for (let i = 0; i < 100; i++) {
        glue.set('v1', i);
      }
      
      expect(callback).toHaveBeenCalledTimes(100);
      expect(glue.target.v1).toBe(99);
    });

    it('should handle rapid array operations', () => {
      glue.target = { arr: [] };
      const callback = vi.fn();
      glue.addObserver('arr[]', callback);
      
      for (let i = 0; i < 100; i++) {
        glue.push('arr', i);
      }
      
      expect(glue.target.arr.length).toBe(100);
      expect(callback).toHaveBeenCalledTimes(100);
    });

    it('should handle alternating push/pop', () => {
      glue.target = { arr: [] };
      
      for (let i = 0; i < 50; i++) {
        glue.push('arr', i);
        glue.push('arr', i + 100);
        glue.pop('arr');
      }
      
      expect(glue.target.arr.length).toBe(50);
    });
  });

  describe('deep cloning edge cases', () => {
    it('should handle objects with undefined values', () => {
      // JSON.stringify removes undefined values
      glue.target = { a: undefined, b: 'value' };
      const callback = vi.fn();
      
      glue.addObserver('*', callback);
      glue.set('b', 'changed');
      
      expect(callback).toHaveBeenCalled();
    });

    it('should handle functions in objects', () => {
      // JSON.stringify removes functions
      glue.target = { 
        method: function() { return 'hello'; },
        value: 'data'
      };
      
      const callback = vi.fn();
      glue.addObserver('value', callback);
      
      glue.set('value', 'changed');
      
      expect(callback).toHaveBeenCalled();
      // Function should still exist (not cloned)
      expect(typeof glue.target.method).toBe('function');
    });

    it('should handle symbols', () => {
      const sym = Symbol('test');
      glue.target = { [sym]: 'value' };
      
      // Symbols are not enumerable in JSON.stringify
      const callback = vi.fn();
      glue.addObserver('*', callback);
      
      // This might not work as expected
      glue.set(sym.toString(), 'changed');
      
      // Symbol properties are special
    });

    it('should handle dates', () => {
      const date = new Date('2025-01-01');
      glue.target = { date };
      
      const callback = vi.fn();
      glue.addObserver('date', callback);
      
      // JSON.stringify converts dates to strings
      glue.set('date', new Date('2025-12-31'));
      
      expect(callback).toHaveBeenCalled();
    });

    it('should handle regex', () => {
      glue.target = { pattern: /test/gi };
      
      const callback = vi.fn();
      glue.addObserver('pattern', callback);
      
      // JSON.stringify converts regex to empty object
      glue.set('pattern', /new/gi);
      
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('stack depth', () => {
    it('should handle deeply recursive notifications', () => {
      let depth = 0;
      const maxDepth = 100;
      
      const recursiveCallback = vi.fn(() => {
        depth++;
        if (depth < maxDepth) {
          glue.set('v1', depth);
        }
      });
      
      glue.addObserver('v1', recursiveCallback);
      glue.target.v1 = 0;
      
      glue.set('v1', 1);
      
      expect(depth).toBe(maxDepth);
    });
  });

  describe('concurrent modifications', () => {
    it('should handle modifications during notification', () => {
      glue.target = { a: 1, b: 2 };
      
      const callbackA = vi.fn(() => {
        if (glue.target.b === 2) {
          glue.set('b', 3);
        }
      });
      
      const callbackB = vi.fn();
      
      glue.addObserver('a', callbackA);
      glue.addObserver('b', callbackB);
      
      glue.set('a', 10);
      
      expect(callbackA).toHaveBeenCalled();
      expect(callbackB).toHaveBeenCalled();
      expect(glue.target.b).toBe(3);
    });

    it('should handle adding observers during notification', () => {
      const newCallback = vi.fn();
      
      const callback = vi.fn(() => {
        glue.addObserver('v1', newCallback);
      });
      
      glue.addObserver('v1', callback);
      glue.target.v1 = 'initial';
      
      glue.set('v1', 'first');
      glue.set('v1', 'second');
      
      expect(callback).toHaveBeenCalledTimes(2);
      expect(newCallback).toHaveBeenCalledTimes(1); // Only for second change
    });
  });
});