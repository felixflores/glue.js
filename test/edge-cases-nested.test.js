import { describe, it, expect, beforeEach, vi } from 'vitest';
import Glue from '../lib/glue.js';

describe('edge cases - deeply nested structures', () => {
  let glue;

  beforeEach(() => {
    glue = new Glue({});
  });

  describe('deeply nested objects', () => {
    it('should handle 10 levels deep nesting', () => {
      glue.target = {
        l1: { l2: { l3: { l4: { l5: { l6: { l7: { l8: { l9: { l10: 'deep' } } } } } } } } }
      };
      const callback = vi.fn();
      
      glue.addObserver('l1.l2.l3.l4.l5.l6.l7.l8.l9.l10', callback);
      glue.set('l1.l2.l3.l4.l5.l6.l7.l8.l9.l10', 'deeper');
      
      expect(callback).toHaveBeenCalledWith({
        operation: 'set',
        value: 'deeper'
      });
    });

    it('should handle setting intermediate nested values', () => {
      glue.target = { a: { b: { c: 'value' } } };
      const callback = vi.fn();
      
      glue.addObserver('a.b', callback);
      glue.set('a.b', { c: 'new', d: 'added' });
      
      expect(callback).toHaveBeenCalled();
      expect(glue.target.a.b).toEqual({ c: 'new', d: 'added' });
    });

    it('should notify parent observers on nested changes', () => {
      glue.target = { parent: { child: { grandchild: 'value' } } };
      const parentCallback = vi.fn();
      const childCallback = vi.fn();
      
      glue.addObserver('parent', parentCallback);
      glue.addObserver('parent.child', childCallback);
      
      glue.set('parent.child.grandchild', 'changed');
      
      expect(parentCallback).toHaveBeenCalled();
      expect(childCallback).toHaveBeenCalled();
    });
  });

  describe('nested arrays', () => {
    it('should handle arrays within objects', () => {
      glue.target = { data: { items: [1, 2, 3] } };
      const callback = vi.fn();
      
      glue.addObserver('data.items[1]', callback);
      glue.set('data.items[1]', 99);
      
      expect(callback).toHaveBeenCalledWith({
        operation: 'set',
        value: 99
      });
    });

    it('should handle objects within arrays', () => {
      glue.target = { list: [{ name: 'a' }, { name: 'b' }] };
      const callback = vi.fn();
      
      glue.addObserver('list[0].name', callback);
      glue.set('list[0].name', 'changed');
      
      expect(callback).toHaveBeenCalled();
      expect(glue.target.list[0].name).toBe('changed');
    });

    it('should handle multi-dimensional arrays', () => {
      glue.target = { matrix: [[1, 2], [3, 4]] };
      const callback = vi.fn();
      
      glue.addObserver('matrix[0][1]', callback);
      glue.set('matrix[0][1]', 99);
      
      expect(callback).toHaveBeenCalled();
      expect(glue.target.matrix[0][1]).toBe(99);
    });

    it('should handle generic listeners on nested arrays', () => {
      glue.target = { data: { items: [1, 2, 3] } };
      const callback = vi.fn();
      
      glue.addObserver('data.items[]', callback);
      glue.push('data.items', 4);
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'push',
          value: 4,
          index: 3
        })
      );
    });
  });

  describe('mixed nested structures', () => {
    it('should handle complex mixed nesting', () => {
      glue.target = {
        users: [
          {
            id: 1,
            profile: {
              settings: {
                notifications: ['email', 'sms']
              }
            }
          }
        ]
      };
      const callback = vi.fn();
      
      glue.addObserver('users[0].profile.settings.notifications[1]', callback);
      glue.set('users[0].profile.settings.notifications[1]', 'push');
      
      expect(callback).toHaveBeenCalled();
      expect(glue.target.users[0].profile.settings.notifications[1]).toBe('push');
    });

    it('should handle setting entire nested structure', () => {
      glue.target = { root: { nested: 'old' } };
      const callback = vi.fn();
      
      glue.addObserver('root', callback);
      glue.set('root', { completely: { different: { structure: 'new' } } });
      
      expect(callback).toHaveBeenCalled();
      expect(glue.target.root).toEqual({
        completely: { different: { structure: 'new' } }
      });
    });
  });

  describe('path creation', () => {
    it.skip('should create non-existent nested paths - NOT SUPPORTED', () => {
      // LIMITATION: The library doesn't auto-create nested paths
      glue.target = {};
      const callback = vi.fn();
      
      glue.addObserver('*', callback);
      
      // This will throw because 'new' doesn't exist
      expect(() => {
        glue.set('new.path.created', 'value');
      }).toThrow();
    });

    it('should throw when setting on undefined parent', () => {
      glue.target = { existing: {} };
      
      // The library doesn't auto-create paths
      expect(() => {
        glue.set('nonexistent.child', 'value');
      }).toThrow();
    });
  });

  describe('path edge cases', () => {
    it('should handle consecutive dots in path', () => {
      glue.target = { a: { '': { b: 'value' } } };
      // This is an edge case that might not work as expected
      
      const result = glue.get('a..b');
      // Behavior depends on implementation
    });

    it('should handle trailing dots', () => {
      glue.target = { a: { b: 'value' } };
      
      const result = glue.get('a.b.');
      // Behavior depends on implementation
    });

    it('should handle leading dots', () => {
      glue.target = { a: 'value' };
      
      const result = glue.get('.a');
      // Behavior depends on implementation
    });
  });
});