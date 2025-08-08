import { describe, test, expect } from 'vitest';

// Native replacements for Underscore functions
const utils = {
  // Type checking
  isString: (val) => typeof val === 'string',
  isArray: (val) => Array.isArray(val),
  isUndefined: (val) => val === undefined,
  isEmpty: (val) => {
    if (val == null) return true;
    if (Array.isArray(val) || typeof val === 'string') return val.length === 0;
    if (typeof val === 'object') return Object.keys(val).length === 0;
    return false;
  },
  
  // Deep equality
  isEqual: (a, b) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.constructor !== b.constructor) return false;
    
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!utils.isEqual(a[i], b[i])) return false;
      }
      return true;
    }
    
    if (typeof a === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      for (let key of keysA) {
        if (!keysB.includes(key)) return false;
        if (!utils.isEqual(a[key], b[key])) return false;
      }
      return true;
    }
    
    return false;
  },
  
  // Array operations
  first: (arr, n) => n === undefined ? arr[0] : arr.slice(0, n),
  rest: (arr, n = 1) => arr.slice(n),
  toArray: (val) => Array.from(val),
  range: (start, stop) => {
    if (stop === undefined) {
      stop = start;
      start = 0;
    }
    return Array.from({ length: stop - start }, (_, i) => start + i);
  },
  
  // Collection operations
  each: (collection, iteratee) => {
    if (Array.isArray(collection)) {
      collection.forEach(iteratee);
    } else if (collection && typeof collection === 'object') {
      Object.entries(collection).forEach(([key, val]) => iteratee(val, key));
    }
  },
  
  map: (collection, iteratee) => {
    if (Array.isArray(collection)) {
      return collection.map(iteratee);
    } else if (collection && typeof collection === 'object') {
      const result = {};
      Object.entries(collection).forEach(([key, val]) => {
        result[key] = iteratee(val, key);
      });
      return result;
    }
    return [];
  },
  
  filter: (collection, predicate) => {
    if (Array.isArray(collection)) {
      return collection.filter(predicate);
    }
    return [];
  },
  
  reject: (collection, predicate) => {
    return utils.filter(collection, (item, index) => !predicate(item, index));
  },
  
  without: (array, ...values) => {
    return array.filter(item => !values.includes(item));
  },
  
  include: (collection, value) => {
    if (Array.isArray(collection)) return collection.includes(value);
    if (typeof collection === 'string') return collection.includes(value);
    if (collection && typeof collection === 'object') {
      return Object.values(collection).includes(value);
    }
    return false;
  },
  
  // Array set operations
  union: (...arrays) => {
    return [...new Set(arrays.flat())];
  },
  
  difference: (array, ...others) => {
    const otherValues = new Set(others.flat());
    return array.filter(val => !otherValues.has(val));
  },
  
  // Object operations
  keys: (obj) => Object.keys(obj || {}),
  
  defaults: (obj, ...defaults) => {
    defaults.forEach(source => {
      if (source) {
        Object.keys(source).forEach(key => {
          if (obj[key] === undefined) {
            obj[key] = source[key];
          }
        });
      }
    });
    return obj;
  },
  
  // Sorting
  sortBy: (collection, iteratee) => {
    return [...collection].sort((a, b) => {
      const valA = typeof iteratee === 'function' ? iteratee(a) : a[iteratee];
      const valB = typeof iteratee === 'function' ? iteratee(b) : b[iteratee];
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });
  },
  
  // Additional utilities
  reduce: (collection, iteratee, memo) => {
    if (Array.isArray(collection)) {
      return memo !== undefined 
        ? collection.reduce(iteratee, memo)
        : collection.reduce(iteratee);
    }
    return memo;
  },
  
  shuffle: (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
};

// Tests to ensure our implementations match Underscore behavior
describe('Native Underscore Replacements', () => {
  describe('Type checking', () => {
    test('isString', () => {
      expect(utils.isString('hello')).toBe(true);
      expect(utils.isString(123)).toBe(false);
      expect(utils.isString(null)).toBe(false);
    });
    
    test('isArray', () => {
      expect(utils.isArray([])).toBe(true);
      expect(utils.isArray([1, 2, 3])).toBe(true);
      expect(utils.isArray('array')).toBe(false);
      expect(utils.isArray({})).toBe(false);
    });
    
    test('isUndefined', () => {
      expect(utils.isUndefined(undefined)).toBe(true);
      expect(utils.isUndefined(null)).toBe(false);
      expect(utils.isUndefined(0)).toBe(false);
    });
    
    test('isEmpty', () => {
      expect(utils.isEmpty([])).toBe(true);
      expect(utils.isEmpty({})).toBe(true);
      expect(utils.isEmpty('')).toBe(true);
      expect(utils.isEmpty(null)).toBe(true);
      expect(utils.isEmpty([1])).toBe(false);
      expect(utils.isEmpty({ a: 1 })).toBe(false);
      expect(utils.isEmpty('a')).toBe(false);
    });
  });
  
  describe('Deep equality', () => {
    test('isEqual with primitives', () => {
      expect(utils.isEqual(1, 1)).toBe(true);
      expect(utils.isEqual('a', 'a')).toBe(true);
      expect(utils.isEqual(1, 2)).toBe(false);
      expect(utils.isEqual(null, undefined)).toBe(false);
    });
    
    test('isEqual with arrays', () => {
      expect(utils.isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(utils.isEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
      expect(utils.isEqual([1, 2], [1, 2, 3])).toBe(false);
    });
    
    test('isEqual with objects', () => {
      expect(utils.isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect(utils.isEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
      expect(utils.isEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });
  });
  
  describe('Array operations', () => {
    test('first', () => {
      expect(utils.first([1, 2, 3])).toBe(1);
      expect(utils.first([1, 2, 3], 2)).toEqual([1, 2]);
      expect(utils.first([])).toBe(undefined);
    });
    
    test('rest', () => {
      expect(utils.rest([1, 2, 3])).toEqual([2, 3]);
      expect(utils.rest([1, 2, 3], 2)).toEqual([3]);
      expect(utils.rest([])).toEqual([]);
    });
    
    test('range', () => {
      expect(utils.range(5)).toEqual([0, 1, 2, 3, 4]);
      expect(utils.range(1, 5)).toEqual([1, 2, 3, 4]);
      expect(utils.range(0, 0)).toEqual([]);
    });
  });
  
  describe('Collection operations', () => {
    test('each with array', () => {
      const result = [];
      utils.each([1, 2, 3], (val, idx) => result.push(val * 2));
      expect(result).toEqual([2, 4, 6]);
    });
    
    test('each with object', () => {
      const result = [];
      utils.each({ a: 1, b: 2 }, (val, key) => result.push(key + val));
      expect(result).toEqual(['a1', 'b2']);
    });
    
    test('filter', () => {
      expect(utils.filter([1, 2, 3, 4], n => n % 2 === 0)).toEqual([2, 4]);
      expect(utils.filter([], n => n)).toEqual([]);
    });
    
    test('reject', () => {
      expect(utils.reject([1, 2, 3, 4], n => n % 2 === 0)).toEqual([1, 3]);
    });
    
    test('without', () => {
      expect(utils.without([1, 2, 3, 4, 2], 2, 3)).toEqual([1, 4]);
      expect(utils.without([1, 2, 3], 4)).toEqual([1, 2, 3]);
    });
    
    test('include', () => {
      expect(utils.include([1, 2, 3], 2)).toBe(true);
      expect(utils.include([1, 2, 3], 4)).toBe(false);
      expect(utils.include('hello', 'ell')).toBe(true);
      expect(utils.include({ a: 1, b: 2 }, 2)).toBe(true);
    });
  });
  
  describe('Set operations', () => {
    test('union', () => {
      expect(utils.union([1, 2], [2, 3], [3, 4])).toEqual([1, 2, 3, 4]);
      expect(utils.union([1], [], [2])).toEqual([1, 2]);
    });
    
    test('difference', () => {
      expect(utils.difference([1, 2, 3], [2], [3])).toEqual([1]);
      expect(utils.difference([1, 2, 3], [4, 5])).toEqual([1, 2, 3]);
    });
  });
  
  describe('Object operations', () => {
    test('keys', () => {
      expect(utils.keys({ a: 1, b: 2 })).toEqual(['a', 'b']);
      expect(utils.keys({})).toEqual([]);
      expect(utils.keys(null)).toEqual([]);
    });
    
    test('defaults', () => {
      const obj = { a: 1 };
      utils.defaults(obj, { a: 2, b: 2 }, { b: 3, c: 3 });
      expect(obj).toEqual({ a: 1, b: 2, c: 3 });
    });
  });
  
  describe('Sorting', () => {
    test('sortBy with function', () => {
      const arr = [{ name: 'c', age: 30 }, { name: 'a', age: 20 }, { name: 'b', age: 25 }];
      const sorted = utils.sortBy(arr, item => item.age);
      expect(sorted.map(i => i.age)).toEqual([20, 25, 30]);
    });
    
    test('sortBy with property', () => {
      const arr = [{ name: 'c' }, { name: 'a' }, { name: 'b' }];
      const sorted = utils.sortBy(arr, 'name');
      expect(sorted.map(i => i.name)).toEqual(['a', 'b', 'c']);
    });
  });
  
  describe('Additional utilities', () => {
    test('reduce', () => {
      const sum = utils.reduce([1, 2, 3], (acc, val) => acc + val, 0);
      expect(sum).toBe(6);
    });
    
    test('shuffle', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = utils.shuffle(arr);
      expect(shuffled).toHaveLength(5);
      expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
      expect(arr).toEqual([1, 2, 3, 4, 5]); // Original unchanged
    });
  });
});

export default utils;