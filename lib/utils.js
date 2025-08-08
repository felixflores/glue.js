// Native JavaScript utilities to replace Underscore.js
// MIT License - Copyright (C) 2024 EdgeCase

const utils = {
  // Phase 1 - Direct replacements
  filter: function(arr, fn) {
    // Handle sparse arrays like Underscore does
    const result = [];
    for (let i = 0; i < arr.length; i++) {
      if (i in arr && fn(arr[i], i, arr)) {
        result.push(arr[i]);
      }
    }
    return result;
  },
  map: function(arr, fn) {
    // Handle sparse arrays like Underscore does - call fn for ALL indices
    const result = [];
    for (let i = 0; i < arr.length; i++) {
      // Call fn for every index, even sparse ones (with undefined value)
      result.push(fn(arr[i], i, arr));
    }
    return result;
  },
  isArray: Array.isArray,
  isString: (val) => typeof val === 'string',
  isUndefined: (val) => val === undefined,
  include: (arr, val) => arr.includes(val),
  keys: Object.keys,
  toArray: Array.from,
  rest: (arr, n = 1) => arr.slice(n),
  first: (arr, n) => n === undefined ? arr[0] : arr.slice(0, n),
  
  // Phase 2 - Simple implementations
  defaults: function(obj, ...sources) {
    sources.forEach(source => {
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
  
  reject: (arr, fn) => arr.filter(item => !fn(item)),
  
  each: function(collection, iteratee, context) {
    if (Array.isArray(collection)) {
      collection.forEach(context ? iteratee.bind(context) : iteratee);
    } else if (collection && typeof collection === 'object') {
      Object.entries(collection).forEach(([key, val]) => {
        if (context) {
          iteratee.call(context, val, key);
        } else {
          iteratee(val, key);
        }
      });
    }
  },
  
  // Phase 3 - Medium complexity
  isEmpty: function(val) {
    if (val == null) return true;
    if (Array.isArray(val) || typeof val === 'string') return val.length === 0;
    if (typeof val === 'object') return Object.keys(val).length === 0;
    return false;
  },
  
  range: function(start, stop) {
    if (stop === undefined) {
      stop = start;
      start = 0;
    }
    return Array.from({ length: stop - start }, (_, i) => start + i);
  },
  
  without: function(array, ...values) {
    return array.filter(item => !values.includes(item));
  },
  
  difference: function(array, ...others) {
    const otherValues = new Set(others.flat());
    return array.filter(val => !otherValues.has(val));
  },
  
  union: function(...arrays) {
    return [...new Set(arrays.flat())];
  },
  
  sortBy: function(collection, iteratee) {
    return [...collection].sort((a, b) => {
      const valA = typeof iteratee === 'function' ? iteratee(a) : a[iteratee];
      const valB = typeof iteratee === 'function' ? iteratee(b) : b[iteratee];
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });
  },
  
  // Phase 4 - Complex implementation
  isEqual: function(a, b) {
    if (a === b) return true;
    // Handle NaN case - NaN should equal NaN for our purposes
    if (typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b)) return true;
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
  }
};

module.exports = utils;