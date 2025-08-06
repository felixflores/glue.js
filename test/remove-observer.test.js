import { describe, it, expect, beforeEach, vi } from 'vitest';
import Glue from '../lib/glue.js';

describe('removeObserver', () => {
  let glue;
  let callback1, callback2, callback3;
  let context1, context2;

  beforeEach(() => {
    glue = new Glue({ v1: 'a', v2: 'b', arr: [1, 2, 3] });
    callback1 = vi.fn();
    callback2 = vi.fn();
    callback3 = vi.fn();
    context1 = { name: 'context1' };
    context2 = { name: 'context2' };
  });

  describe('removing all observers', () => {
    it('should remove all observers when called without arguments', () => {
      glue.addObserver('v1', callback1);
      glue.addObserver('v2', callback2);
      glue.addObserver('arr[]', callback3);
      
      glue.removeObserver();
      
      glue.set('v1', 'changed');
      glue.set('v2', 'changed');
      glue.push('arr', 4);
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
      expect(callback3).not.toHaveBeenCalled();
    });
  });

  describe('removing by key', () => {
    it('should remove all observers for a specific key', () => {
      glue.addObserver('v1', callback1);
      glue.addObserver('v1', callback2);
      glue.addObserver('v2', callback3);
      
      glue.removeObserver('v1');
      
      glue.set('v1', 'changed');
      glue.set('v2', 'changed');
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
      expect(callback3).toHaveBeenCalled();
    });

    it('should remove observers for multiple keys', () => {
      glue.addObserver('v1', callback1);
      glue.addObserver('v2', callback2);
      
      glue.removeObserver('v1,v2');
      
      glue.set('v1', 'changed');
      glue.set('v2', 'changed');
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });

    it('should remove generic array observers', () => {
      glue.addObserver('arr[]', callback1);
      
      glue.removeObserver('arr[]');
      
      glue.push('arr', 4);
      
      expect(callback1).not.toHaveBeenCalled();
    });
  });

  describe('removing by operation', () => {
    it('should remove observers for specific operation', () => {
      glue.addObserver('arr:push', callback1);
      glue.addObserver('arr:pop', callback2);
      
      glue.removeObserver(':push');
      
      glue.push('arr', 4);
      glue.pop('arr');
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should remove specific operation from observer', () => {
      glue.addObserver('arr:push,pop', callback1);
      
      glue.removeObserver('arr:push');
      
      glue.push('arr', 4);
      glue.pop('arr');
      
      expect(callback1).toHaveBeenCalledTimes(1); // Only for pop
    });
  });

  describe('removing by context', () => {
    it('should remove observers with specific context', () => {
      glue.addObserver('v1', context1, callback1);
      glue.addObserver('v1', context2, callback2);
      glue.addObserver('v1', callback3);
      
      glue.removeObserver('', context1);
      
      glue.set('v1', 'changed');
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
      expect(callback3).toHaveBeenCalled();
    });

    it('should remove observers with specific key and context', () => {
      glue.addObserver('v1', context1, callback1);
      glue.addObserver('v1', context2, callback2);
      glue.addObserver('v2', context1, callback3);
      
      glue.removeObserver('v1', context1);
      
      glue.set('v1', 'changed');
      glue.set('v2', 'changed');
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
      expect(callback3).toHaveBeenCalled();
    });
  });

  describe('removing with combined criteria', () => {
    it('should remove by key and operation', () => {
      glue.addObserver('arr:push', callback1);
      glue.addObserver('arr:pop', callback2);
      glue.addObserver('v1:set', callback3);
      
      glue.removeObserver('arr:push');
      
      glue.push('arr', 4);
      glue.pop('arr');
      glue.set('v1', 'changed');
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
      expect(callback3).toHaveBeenCalled();
    });

    it('should remove by operation and context', () => {
      glue.addObserver('arr:push', context1, callback1);
      glue.addObserver('arr:push', context2, callback2);
      
      glue.removeObserver(':push', context1);
      
      glue.push('arr', 4);
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should handle complex removal patterns', () => {
      glue.addObserver('v1:set,push', context1, callback1);
      glue.addObserver('v1:set', context2, callback2);
      glue.addObserver('v2:set', context1, callback3);
      
      glue.removeObserver('v1:set', context1);
      
      glue.set('v1', 'changed');
      glue.set('v2', 'changed');
      
      // callback1 should still have 'push' operation
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
      expect(callback3).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle removing non-existent observers', () => {
      expect(() => {
        glue.removeObserver('nonexistent');
      }).not.toThrow();
    });

    it('should handle whitespace in keys', () => {
      glue.addObserver(' v1 ', callback1);
      glue.removeObserver(' v1 ');
      
      glue.set('v1', 'changed');
      
      expect(callback1).not.toHaveBeenCalled();
    });

    it('should not affect other observers when removing specific ones', () => {
      glue.addObserver('v1', callback1);
      glue.addObserver('v2', callback2);
      glue.addObserver('*', callback3);
      
      glue.removeObserver('v1');
      
      glue.set('v1', 'changed');
      glue.set('v2', 'changed');
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
      expect(callback3).toHaveBeenCalled();
    });
  });
});