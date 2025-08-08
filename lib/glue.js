// MIT License
// Copyright (C) 2012 EdgeCase
// Copyright (C) 2025 Felix Flores
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var utils = require('./utils');

// Performance optimization: Pre-compiled regexes
var REGEX_CACHE = {
  arrayIndex: /\[(\d+)\]$/,
  genericArray: /\[\]$/,
  normalizeSpace: /\s/g,
  digitIndex: /\d*(?=\]$)/
};

var Glue = function(target) {
  this.target = target;
  this.resetListeners();
  this.objID = Glue.nextObjectID();
};

Glue.version = '0.6.0-alpha';

Glue._objID = 0;

Glue.nextObjectID = function() {
  return ++Glue._objID;
};

Glue.events = {};

Glue.prototype.addListener = function(event, callback){
  utils.defaults([], Glue.events[event]);

  Glue.events[event].push({
    objID: this.objID,
    callback: callback
  });
};

Glue.prototype.removeListener = function(event, callback) {
  if (!Glue.events[event]) return;
  
  Glue.events[event] = utils.filter(Glue.events[event], function(e) {
    var toFilter = false;

    if (callback) toFilter = e.callback === callback;
    toFilter = e.objID === this.objID;

    return toFilter;
  });
};

Glue.prototype.emit = function(event) {
  utils.each(Glue.events[event], function(e) {
    e.callback(utils.rest(utils.toArray(arguments)));
  });
};

Glue.prototype.resetListeners = function() {
  this.listeners = {specific: {}, generic: {}};
};

// Deep clone using JSON method for compatibility
Glue.deepClone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};

Glue.normalizeKey = function(key) {
  return key.replace(REGEX_CACHE.normalizeSpace, '');
};

Glue.permutateKey = function (key) {
  var keys = [],
      segments = key.split('.');

  utils.each(segments, function(segment, i) {
    var k        = utils.first(segments, i+1).join('.'),
        regIndex = /\d*(?=\]$)/;

    if (k.match(regIndex)) {
      keys.push({
        specific: k,
        generic:  k.replace(regIndex, ''),
        index:    parseInt(k.match(regIndex)[0])
      });
    }
  });

  return keys;
};

Glue.keysAndOperations = function(ko) {
  if (arguments.length === 0) return [[], []];

  var k = Glue.normalizeKey(ko).split(':'),
      keys = utils.isEmpty(k[0]) ? [''] : k[0].split(','),
      operations = utils.isEmpty(k[1]) ? [] : k[1].split(',');

  return [keys, operations];
};

// Usage:
// glue.addObserver([key(s):operation(s)], [context], callback)

Glue.prototype.addObserver = function() {
  var self = this,
      a    = arguments;

  if (a.length === 1) {
    add('*', a[0], this.target);
  } else if (a.length === 2) {
    utils.isString(a[0]) ? add(a[0], a[1], this.target) : add('*', a[1], a[0]);
  } else {
    add(a[0], a[2], a[1]);
  }

  function add(k, callback, context) {
    var ko         = Glue.keysAndOperations(k),
        keys       = utils.isEqual(ko[0], ['']) ? ['*'] : ko[0],
        operations = ko[1];

    utils.each(keys, function(key) {
      var type = key.match(REGEX_CACHE.genericArray) ? 'generic' : 'specific';

      self.listeners[type][key] = self.listeners[type][key] || [];

      self.listeners[type][key].push({
        callback: callback, operations: operations, context: context
      });
    });
  }
  
  return this;
};

// Usage:
// glue.removeObserver((key(s):operation(s)), [context]);
Glue.prototype.removeObserver = function() {
  var self = this,
      a    = arguments;

  if(a.length === 0) {
    remove('');
  } else if (a.length === 1) {
    utils.isString(a[0]) ? remove(Glue.normalizeKey(a[0])) : remove('', a[0]);
  } else if (a.length === 2) {
    remove(Glue.normalizeKey(a[0]), a[1]);
  }

  function remove(k, context) {
    var ko         = Glue.keysAndOperations(k),
        operations = ko[1],
        keys;

    if (utils.isEqual(ko[0], [''])) {
      keys = utils.union(utils.keys(self.listeners.specific), utils.keys(self.listeners.generic));
    } else {
      keys = ko[0];
    }

    utils.each(keys, function(key) {
      var type = key.match(REGEX_CACHE.genericArray) ? 'generic' : 'specific';
      
      // Check if listeners exist for this key
      if (!self.listeners[type][key]) return;

      if(!utils.isEmpty(operations)) {
        utils.each(self.listeners[type][key], function(listener) {
          listener.operations = utils.difference(listener.operations, operations);
        });
      }

      self.listeners[type][key] = utils.reject(self.listeners[type][key], function(listener) {
        if (!utils.isEmpty(operations) && context) {
          return utils.isEmpty(listener.operations) && listener.context === context;
        } else if (context) {
          return listener.context === context;
        } else if (!utils.isEmpty(operations)) {
          return utils.isEmpty(listener.operations);
        } else {
          return true;
        }
      });

      if (utils.isEmpty(self.listeners[type][key])) delete self.listeners[type][key];
    });
  };
};

// Not in the public API.
Glue.prototype.notify = function(operation, key, oldTargetClone, reverse) {
  var self               = this,
      currentTargetClone = Glue.deepClone(this.target);

  utils.each(this.listeners.specific, function(listeners, k) {
    var currentValue      = self.get(k),
        currentValueClone = self.get(k, currentTargetClone),
        oldValueClone     = self.get(k, oldTargetClone);

      utils.each(listeners, function(listener) {
        invoke(operation, listener, currentValue, oldValueClone, currentValueClone);
     });
  });

  invokeGeneric();

  function invokeGeneric() {
    var keysAndIndices = Glue.permutateKey(key);

    utils.each(keysAndIndices, function(keyAndIndex) {
      utils.each(self.listeners.generic[keyAndIndex.generic], function(listener) {
        var currentValue      = self.get(keyAndIndex.specific),
            currentValueClone = self.get(keyAndIndex.specific, currentTargetClone),
            oldValueClone     = self.get(keyAndIndex.specific, oldTargetClone);

        invoke(operation, listener, currentValue, oldValueClone, currentValueClone, keyAndIndex.index);
      });
    });

    var affectedGenericChildren = {},
        keyMatcher       = new RegExp("^" + key.replace('[', '\\\[').replace(']', '\\\]'));

    utils.each(self.listeners.generic, function(listeners, k) {
      if (k.match(keyMatcher)) affectedGenericChildren[k] = listeners;
    });

    utils.each(affectedGenericChildren, function(listeners, k) {
      var base              = k.replace(/\[[^\[]*\]$/, ''),
          currentArray      = self.get(base),
          currentArrayClone = self.get(base, currentTargetClone),
          oldArrayClone     = self.get(base, oldTargetClone),
          maxRange;

      if (oldArrayClone.length > currentArrayClone.length) {
        maxRange = oldArrayClone.length;
      } else {
        maxRange = currentArrayClone.length;
      }

      var range = reverse ? utils.range(0, maxRange).reverse() : utils.range(0, maxRange);

      utils.each(range, function(index) {
        var currentValue      = currentArray[index],
            currentValueClone = currentArrayClone[index],
            oldValueClone     = oldArrayClone[index];

        utils.each(listeners, function(listener) {
          invoke(operation, listener, currentValue, oldValueClone, currentValueClone, index);
        });
      });
    });
  };

  function invoke(operation, listener, currentValue, oldValueClone, currentValueClone, index) {
    if (!utils.isEqual(currentValueClone, oldValueClone)) {
      var message = {
        operation: operation,
        value: currentValue
      };

      if (!utils.isUndefined(index)) message.index = index;

      if (!utils.isEmpty(listener.operations)) {
        if (utils.include(listener.operations, operation)) callListener(listener, message);
      } else {
        callListener(listener, message);
      }
    }
  };

  function callListener(listener, message) {
    listener.callback.call(listener.context, message);
  };
};

// Not in the public API. It is more performant to access
// values directly through glue.target. However, one should never
// modify the values of a target object obtain directly from
// glue.target.
//
// Usage:
// glue.get([key], [obj]);

Glue.prototype.get = function(key, obj) {
  if (key === '' || key === '*') return obj || this.target;
  
  var target = obj || this.target;
  var normalizedKey = Glue.normalizeKey(key);
  
  // Handle array-only notation
  if (utils.isArray(target) && !normalizedKey.includes('.')) {
    var match = normalizedKey.match(/^\[(\d+)\]$/);
    if (match) {
      return target[parseInt(match[1])];
    }
  }
  
  // Traverse object path safely without eval
  var segments = normalizedKey.split('.');
  var current = target;
  
  for (var i = 0; i < segments.length; i++) {
    if (current == null) return undefined;
    
    var segment = segments[i];
    
    // Handle multiple array notations like "prop[0][1]"
    var remaining = segment;
    while (remaining) {
      // Check for property with array notation
      var propArrayMatch = remaining.match(/^([^[]+)\[(\d+)\]/);
      if (propArrayMatch) {
        var prop = propArrayMatch[1];
        var index = propArrayMatch[2];
        current = current[prop];
        if (current != null) {
          current = current[parseInt(index)];
        }
        remaining = remaining.slice(propArrayMatch[0].length);
      }
      // Check for simple array notation
      else {
        var simpleArrayMatch = remaining.match(/^\[(\d+)\]/);
        if (simpleArrayMatch) {
          var idx = simpleArrayMatch[1];
          current = current[parseInt(idx)];
          remaining = remaining.slice(simpleArrayMatch[0].length);
        } else {
          // Regular property
          current = current[remaining];
          break;
        }
      }
      
      if (current == null) return undefined;
    }
  }
  
  return current;
};

// Usage:
// glue.set(key, value);
Glue.prototype.set = function(key, value) {
  var oldTargetClone = Glue.deepClone(this.target)
    , lastDot     = key.lastIndexOf(".")
    , lastBracket = key.lastIndexOf("[")
    , index       = lastBracket > lastDot ? lastBracket : lastDot
    , keySuffix   = key.substring(index+1).replace(/\]/g, '');

  var base = this.get(key.substring(0, index));
  base[keySuffix] = value;

  this.notify('set', key, oldTargetClone);

  return this;
};

// Usage
// glue.remove([key]);

Glue.prototype.remove = function(key){
  var oldTargetClone = Glue.deepClone(this.target),
      match = key.match(REGEX_CACHE.arrayIndex),
      removed;

  if (match) {
    var index           = match[1]
      , suffixLastIndex = key.lastIndexOf(match[0]);

    if (suffixLastIndex === 0) {
      removed = this.target.splice(index, 1)[0];
    } else {
      removed = this.get(key.substr(0, suffixLastIndex)).splice(index, 1)[0];
    }
  } else {
    key = key.split('.');

    if (key.length > 1) {
      var top = key.pop();
      removed = this.get(key.join('.'))[top];
      delete this.get(key.join('.'))[top];
    } else {
      removed = this.target[key[0]];
      delete this.target[key[0]];
    }

    key = key.join('.');
  }

  this.notify("remove", key, oldTargetClone);

  return removed;
};

// Usage
// topic.push([key], value);
Glue.prototype.push = function() {
  var oldTargetClone = Glue.deepClone(this.target),
      self = this,
      a = arguments;

  if (a.length === 1) {
    push('', this.target, a[0]);
  } else {
    push(a[0], self.get(a[0]), a[1]);
  }

  function push(key, collection, item) {
    collection.push(item);
    self.notify("push", key, oldTargetClone);
  };

  return this;
};

// Usage
// glue.pop([key]);
Glue.prototype.pop = function(key){
  var oldTargetClone = Glue.deepClone(this.target),
      key = key || '',
      collection = this.get(key),
      value = collection.pop();

  this.notify("pop", key, oldTargetClone);

  return value;
};

// Usage
// glue.insert([key], index, value);
Glue.prototype.insert = function() {
  var oldTargetClone = Glue.deepClone(this.target),
      key = key || '',
      i = 0, a = arguments;

  var key   = a.length < 3 ?  '' : a[i++],
      index = a[i++],
      value = a[i++];

  this.get(key).splice(index, 0, value);
  this.notify('insert', key, oldTargetClone);

  return this;
};

// Usage
// glue.filter([key], filterBy);

Glue.prototype.filter = function() {
  var oldTargetClone = Glue.deepClone(this.target),
      self     = this,
      i        = 0,
      a        = arguments,
      key      = a.length < 2 ?  '' : a[i++],
      filterBy = a[i++];

  var collection = key === '' ? this.target : self.get(key);
  
  // Optimized: Single-pass backwards iteration for in-place filtering
  for (var idx = collection.length - 1; idx >= 0; idx--) {
    if (!filterBy(collection[idx], idx)) {
      collection.splice(idx, 1);
    }
  }

  self.notify("filter", key, oldTargetClone, true);

  return this.get(Glue.baseKey(key));
};

Glue.baseKey = function(key) {
  return key.replace(/\[[^\[]*\]$/, '');
};

Glue.prototype.baseKeyAndSuffix = function(key) {
  var lastDot     = key.lastIndexOf(".")
    , lastBracket = key.lastIndexOf("[")
    , index       = lastBracket > lastDot ? lastBracket : lastDot
    , keySuffix   = key.substring(index+1).replace(/\]/g, '');

  return [this.get(key.substring(0, index)), keySuffix];
};

// Usage
// glue.sort([key], sortBy);

Glue.prototype.sortBy = function() {
  var oldTargetClone = Glue.deepClone(this.target),
      self = this,
      i = 0, a = arguments,
      key    = a.length < 2 ?  '' : a[i++],
      sortBy = a[i++],
      collectionWithIndex;

  collectionWithIndex = utils.map(this.get(key), function(val, index) {
    return [val, index];
  });

  var sortedWithIndex = utils.sortBy(collectionWithIndex, function(elem) {
    return sortBy(elem[0]);
  });

  var sorted = utils.map(sortedWithIndex, function(elem) { return elem[0] });

  if (key === '') {
    this.target = sorted;
  } else {
    var bs = this.baseKeyAndSuffix(key);
    bs[0][bs[1]] = sorted;
  };

  var indices = utils.map(sortedWithIndex, function(elem) {
    return elem[1];
  });

  this.notify("filter", key, oldTargetClone, true);

  return sorted;
};

// Usage
// glue.swap(loc1, loc2);
Glue.prototype.swap = function(loc1, loc2) {
  // IMPORTANT: Clone BEFORE making changes
  var oldTargetClone = Glue.deepClone(this.target),
      self = this,
      value1 = this.get(loc1),
      value2 = this.get(loc2),
      bs1 = this.baseKeyAndSuffix(loc1),
      bs2 = this.baseKeyAndSuffix(loc2);

  // Now swap the values
  bs1[0][bs1[1]] = value2;
  bs2[0][bs2[1]] = value1;

  // Notify for the specific locations that changed
  self.notify("swap", loc1, oldTargetClone);
  if (loc1 !== loc2) {
    self.notify("swap", loc2, oldTargetClone);
  }

  return this;
};

// Add cleanup method to prevent memory leaks
Glue.prototype.destroy = function() {
  this.resetListeners();
  
  // Clean global events for this instance
  var self = this;
  utils.each(utils.keys(Glue.events), function(event) {
    Glue.events[event] = utils.filter(Glue.events[event], function(e) {
      return e.objID !== self.objID;
    });
    if (utils.isEmpty(Glue.events[event])) {
      delete Glue.events[event];
    }
  });
};

module.exports = Glue;
