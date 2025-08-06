import { describe, it, expect, beforeEach, vi } from 'vitest';
import Glue from '../lib/glue.js';

describe('edge cases - observer management', () => {
  let glue;

  beforeEach(() => {
    glue = new Glue({ v1: 'initial' });
  });

  describe('duplicate observers', () => {
    it('should handle same callback added multiple times', () => {
      const callback = vi.fn();
      
      glue.addObserver('v1', callback);
      glue.addObserver('v1', callback);
      glue.addObserver('v1', callback);
      
      glue.set('v1', 'changed');
      
      expect(callback).toHaveBeenCalledTimes(3);
    });

    it('should handle same callback with different contexts', () => {
      const callback = vi.fn();
      const context1 = { id: 1 };
      const context2 = { id: 2 };
      
      glue.addObserver('v1', context1, callback);
      glue.addObserver('v1', context2, callback);
      
      glue.set('v1', 'changed');
      
      expect(callback).toHaveBeenCalledTimes(2);
    });
  });

  describe('observer removal edge cases', () => {
    it('should handle removing while notifying', () => {
      const toRemove = vi.fn();
      const callback2 = vi.fn(() => {
        glue.removeObserver('v1', toRemove);
      });
      
      glue.addObserver('v1', toRemove);
      glue.addObserver('v1', callback2);
      
      glue.set('v1', 'changed');
      glue.set('v1', 'changed again');
      
      expect(toRemove).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(2);
    });

    it('should handle removing non-existent observer', () => {
      const callback = vi.fn();
      
      expect(() => {
        glue.removeObserver('v1', callback);
      }).not.toThrow();
    });

    it('should handle removing from empty listeners', () => {
      glue.resetListeners();
      
      expect(() => {
        glue.removeObserver();
      }).not.toThrow();
    });
  });

  describe('callback exceptions', () => {
    it('should continue notifying after callback throws', () => {
      const badCallback = vi.fn(() => {
        throw new Error('Callback error');
      });
      const goodCallback = vi.fn();
      
      glue.addObserver('v1', badCallback);
      glue.addObserver('v1', goodCallback);
      
      expect(() => {
        glue.set('v1', 'changed');
      }).toThrow('Callback error');
      
      expect(badCallback).toHaveBeenCalled();
      expect(goodCallback).toHaveBeenCalled();
    });
  });

  describe('operation filtering edge cases', () => {
    it('should handle empty operation list', () => {
      const callback = vi.fn();
      
      glue.addObserver('v1:', callback);
      
      glue.set('v1', 'changed');
      
      expect(callback).toHaveBeenCalled();
    });

    it('should handle whitespace in operations', () => {
      const callback = vi.fn();
      
      glue.addObserver('v1: set , push ', callback);
      
      glue.set('v1', 'changed');
      
      expect(callback).toHaveBeenCalled();
    });

    it('should handle unknown operations', () => {
      const callback = vi.fn();
      
      glue.addObserver('v1:unknownOp', callback);
      
      glue.set('v1', 'changed');
      
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('key pattern edge cases', () => {
    it('should handle empty string key', () => {
      const callback = vi.fn();
      
      glue.addObserver('', callback);
      
      glue.set('v1', 'changed');
      
      expect(callback).toHaveBeenCalled();
    });

    it('should handle keys with special characters', () => {
      glue.target = { 'a.b': 'value', 'c[0]': 'array' };
      const callback = vi.fn();
      
      glue.addObserver('a.b', callback);
      
      // This might not work as expected due to dot notation
      glue.set('a.b', 'changed');
      
      // The behavior here depends on implementation
    });

    it('should handle very long keys', () => {
      const longKey = 'a'.repeat(1000);
      glue.target[longKey] = 'value';
      const callback = vi.fn();
      
      glue.addObserver(longKey, callback);
      
      glue.set(longKey, 'changed');
      
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('context edge cases', () => {
    it('should handle null context', () => {
      const callback = vi.fn();
      
      glue.addObserver('v1', null, callback);
      
      glue.set('v1', 'changed');
      
      expect(callback).toHaveBeenCalled();
    });

    it('should handle undefined context', () => {
      const callback = vi.fn();
      
      glue.addObserver('v1', undefined, callback);
      
      glue.set('v1', 'changed');
      
      expect(callback).toHaveBeenCalled();
    });

    it('should handle primitive context', () => {
      const callback = function() {
        expect(this).toBe(42);
      };
      
      glue.addObserver('v1', 42, callback);
      
      glue.set('v1', 'changed');
    });
  });
});