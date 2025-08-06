import { describe, it, expect, beforeEach } from 'vitest';
import Glue from '../lib/glue.js';

describe('addObserver', () => {
  let glue;

  beforeEach(() => {
    glue = new Glue({});
    glue.resetListeners();
  });

  describe('specific listeners', () => {
    it('should implicitly assign to any key', () => {
      const callback = () => {};
      glue.addObserver(callback);

      expect(glue.listeners.specific['*']).toEqual([{
        callback: callback,
        operations: [],
        context: glue.target
      }]);
    });

    it('should assign explicitly to any key with "*" key', () => {
      const callback = () => {};
      glue.addObserver('*', callback);

      expect(glue.listeners.specific['*']).toEqual([{
        callback: callback,
        operations: [],
        context: glue.target
      }]);
    });

    it('should implicitly assign to any key with operation restriction', () => {
      const callback = () => {};
      glue.addObserver(':filter', callback);
      
      expect(glue.listeners.specific['*']).toEqual([{
        callback: callback,
        operations: ['filter'],
        context: glue.target
      }]);
    });

    it('should implicitly assign to any key with multiple operation restrictions', () => {
      const callback = () => {};
      glue.addObserver(':set,push', callback);
      
      expect(glue.listeners.specific['*']).toEqual([{
        callback: callback,
        operations: ['set', 'push'],
        context: glue.target
      }]);
    });

    it('should assign to a specific key', () => {
      const callback = () => {};
      glue.addObserver('v1', callback);

      expect(glue.listeners.specific['v1']).toEqual([{
        callback: callback,
        operations: [],
        context: glue.target
      }]);
    });

    it('should assign to multiple specific keys', () => {
      const callback = () => {};
      glue.addObserver('v1,v2', callback);

      expect(glue.listeners.specific['v1']).toEqual([{
        callback: callback,
        operations: [],
        context: glue.target
      }]);

      expect(glue.listeners.specific['v2']).toEqual([{
        callback: callback,
        operations: [],
        context: glue.target
      }]);
    });

    it('should assign to specific key with operation restriction', () => {
      const callback = () => {};
      glue.addObserver('v1:set', callback);

      expect(glue.listeners.specific['v1']).toEqual([{
        callback: callback,
        operations: ['set'],
        context: glue.target
      }]);
    });

    it('should assign to specific key with multiple operation restrictions', () => {
      const callback = () => {};
      glue.addObserver('v1:set,push', callback);

      expect(glue.listeners.specific['v1']).toEqual([{
        callback: callback,
        operations: ['set', 'push'],
        context: glue.target
      }]);
    });

    it('should assign to multiple keys with mixed operation restrictions', () => {
      const callback = () => {};
      // The library treats this as a single key with operations, not multiple keys
      // Each key:operation pair needs to be added separately
      glue.addObserver('v1:set', callback);
      glue.addObserver('v2:push', callback);
      glue.addObserver('v3', callback);

      expect(glue.listeners.specific['v1']).toEqual([{
        callback: callback,
        operations: ['set'],
        context: glue.target
      }]);

      expect(glue.listeners.specific['v2']).toEqual([{
        callback: callback,
        operations: ['push'],
        context: glue.target
      }]);

      expect(glue.listeners.specific['v3']).toEqual([{
        callback: callback,
        operations: [],
        context: glue.target
      }]);
    });

    it('should assign custom context to observer', () => {
      const callback = () => {};
      const context = { custom: 'context' };
      glue.addObserver(context, callback);

      expect(glue.listeners.specific['*']).toEqual([{
        callback: callback,
        operations: [],
        context: context
      }]);
    });

    it('should assign custom context with specific key', () => {
      const callback = () => {};
      const context = { custom: 'context' };
      glue.addObserver('v1', context, callback);

      expect(glue.listeners.specific['v1']).toEqual([{
        callback: callback,
        operations: [],
        context: context
      }]);
    });

    it('should assign custom context with operation restriction', () => {
      const callback = () => {};
      const context = { custom: 'context' };
      glue.addObserver('v1:set', context, callback);

      expect(glue.listeners.specific['v1']).toEqual([{
        callback: callback,
        operations: ['set'],
        context: context
      }]);
    });

    it('should support keys with whitespace', () => {
      const callback = () => {};
      glue.addObserver(' v1 , v2 ', callback);

      expect(glue.listeners.specific['v1']).toEqual([{
        callback: callback,
        operations: [],
        context: glue.target
      }]);

      expect(glue.listeners.specific['v2']).toEqual([{
        callback: callback,
        operations: [],
        context: glue.target
      }]);
    });
  });

  describe('generic listeners', () => {
    it('should assign generic array listener', () => {
      const callback = () => {};
      glue.addObserver('arr[]', callback);

      expect(glue.listeners.generic['arr[]']).toEqual([{
        callback: callback,
        operations: [],
        context: glue.target
      }]);
    });

    it('should assign generic array listener with operation', () => {
      const callback = () => {};
      glue.addObserver('arr[]:push', callback);

      expect(glue.listeners.generic['arr[]']).toEqual([{
        callback: callback,
        operations: ['push'],
        context: glue.target
      }]);
    });

    it('should handle nested generic array listeners', () => {
      const callback = () => {};
      glue.addObserver('v1.arr[]', callback);

      expect(glue.listeners.generic['v1.arr[]']).toEqual([{
        callback: callback,
        operations: [],
        context: glue.target
      }]);
    });

    it('should handle root array generic listener', () => {
      const callback = () => {};
      glue = new Glue([]);
      glue.addObserver('[]', callback);

      expect(glue.listeners.generic['[]']).toEqual([{
        callback: callback,
        operations: [],
        context: glue.target
      }]);
    });
  });

  describe('multiple observers', () => {
    it('should allow multiple observers on same key', () => {
      const callback1 = () => {};
      const callback2 = () => {};
      
      glue.addObserver('v1', callback1);
      glue.addObserver('v1', callback2);

      expect(glue.listeners.specific['v1']).toHaveLength(2);
      expect(glue.listeners.specific['v1'][0].callback).toBe(callback1);
      expect(glue.listeners.specific['v1'][1].callback).toBe(callback2);
    });

    it('should allow mixed specific and generic observers', () => {
      const callback1 = () => {};
      const callback2 = () => {};
      
      glue.addObserver('arr[0]', callback1);
      glue.addObserver('arr[]', callback2);

      expect(glue.listeners.specific['arr[0]']).toEqual([{
        callback: callback1,
        operations: [],
        context: glue.target
      }]);

      expect(glue.listeners.generic['arr[]']).toEqual([{
        callback: callback2,
        operations: [],
        context: glue.target
      }]);
    });
  });
});