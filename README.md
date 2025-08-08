# glue.js

[![CI](https://github.com/felixflores/glue.js/actions/workflows/ci.yml/badge.svg)](https://github.com/felixflores/glue.js/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/glue.js.svg)](https://badge.fury.io/js/glue.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Coverage Status](https://codecov.io/gh/felixflores/glue.js/branch/master/graph/badge.svg)](https://codecov.io/gh/felixflores/glue.js)
[![Node.js Version](https://img.shields.io/node/v/glue.js.svg)](https://nodejs.org)
[![npm downloads](https://img.shields.io/npm/dm/glue.js.svg)](https://www.npmjs.com/package/glue.js)

> A lightweight key-value observing library for JavaScript that supports both assigned and computed properties in arbitrarily deep object graphs.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
  - [Keys](#keys)
  - [Observers](#observers)
  - [Messages](#messages)
- [API Reference](#api-reference)
  - [Constructor](#constructor)
  - [Observer Methods](#observer-methods)
  - [Property Operations](#property-operations)
  - [Array Operations](#array-operations)
- [Advanced Usage](#advanced-usage)
  - [Array Observation](#array-observation)
  - [Operation Filtering](#operation-filtering)
  - [Context Binding](#context-binding)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Features

- 🔍 **Deep Object Observation** - Monitor changes in nested object properties at any depth
- 🎯 **Granular Control** - Observe specific properties, arrays, or entire objects
- 🔄 **Operation Filtering** - Listen only to specific operations (set, push, pop, etc.)
- 🎨 **Flexible Context Binding** - Execute callbacks in custom contexts
- 📦 **Lightweight** - Zero runtime dependencies
- ⚡ **Chainable API** - All methods return `this` for method chaining

## Installation

```bash
npm install glue.js
```

Or include directly in your HTML:

```html
<script src="path/to/glue.js"></script>
```

## Quick Start

```javascript
const Glue = require('glue.js');

// Create an observable object
const data = { name: 'John', age: 30 };
const glue = new Glue(data);

// Add an observer
glue.addObserver('name', (message) => {
  console.log(`Name changed to: ${message.value}`);
});

// Trigger the observer
glue.set('name', 'Jane'); // Logs: "Name changed to: Jane"
```

## Core Concepts

### Keys

Keys are the foundation of glue.js, defining what properties to observe:

```javascript
const target = {
  user: {
    name: 'Felix',
    contact: {
      email: 'felix@example.com',
      phone: '555-0123'
    }
  },
  settings: {
    theme: 'dark'
  }
};

const glue = new Glue(target);

// Observe everything
glue.addObserver('*', callback);

// Observe specific property
glue.addObserver('user.name', callback);

// Observe nested properties
glue.addObserver('user.contact.email', callback);

// Observe multiple keys
glue.addObserver('user.name, settings.theme', callback);
```

### Observers

Observers are callbacks that execute when observed properties change:

```javascript
// Basic observer
glue.addObserver('user.name', (message) => {
  console.log(`New value: ${message.value}`);
  console.log(`Operation: ${message.operation}`);
});

// Observer with operation filter
glue.addObserver('user.name:set', (message) => {
  // Only triggers on 'set' operations
});

// Observer with custom context
const myContext = { count: 0 };
glue.addObserver('user.name', myContext, function(message) {
  this.count++; // 'this' refers to myContext
});
```

### Messages

Every observer callback receives a message object with details about the change:

```javascript
// Basic message structure
{
  value: 'new value',
  operation: 'set'
}

// Array-specific messages include index
{
  value: 'new value',
  operation: 'push',
  index: 3
}
```

## API Reference

### Constructor

#### `new Glue(target)`

Creates a new Glue instance.

- **target** - The object to observe

```javascript
const glue = new Glue({ name: 'John' });
```

### Observer Methods

#### `addObserver([key], [context], callback)`

Registers an observer for property changes.

- **key** *(optional)* - Property path(s) to observe. Use `*` for all properties
- **context** *(optional)* - Context for callback execution
- **callback** - Function to execute on changes

```javascript
// Observe specific property
glue.addObserver('user.name', callback);

// Observe with context
glue.addObserver('user.name', myContext, callback);

// Observe multiple operations
glue.addObserver('items:push,pop', callback);
```

#### `removeObserver([key], [context])`

Removes observers.

```javascript
// Remove all observers for a key
glue.removeObserver('user.name');

// Remove observers for specific context
glue.removeObserver('user.name', myContext);

// Remove all observers
glue.removeObserver();
```

### Property Operations

#### `set(key, value)`

Sets a property value.

```javascript
glue.set('user.name', 'Jane');
glue.set('user.contact.email', 'jane@example.com');
```

#### `remove(key)`

Removes a property.

```javascript
const removed = glue.remove('user.phone');
```

#### `swap(key1, key2)`

Swaps values between two properties.

```javascript
glue.swap('user.firstName', 'user.lastName');
```

### Array Operations

#### `push([key], value)`

Adds element to array end.

```javascript
const glue = new Glue({ items: [1, 2, 3] });
glue.push('items', 4);

// For root arrays
const glue = new Glue([1, 2, 3]);
glue.push(4);
```

#### `pop([key])`

Removes and returns last array element.

```javascript
const last = glue.pop('items');
```

#### `insert([key], index, value)`

Inserts element at specific index.

```javascript
glue.insert('items', 1, 'inserted');
```

#### `filter([key], iterator)`

Filters array in place.

```javascript
glue.filter('numbers', (n) => n % 2 === 0);
```

#### `sortBy([key], iterator)`

Sorts array in place.

```javascript
glue.sortBy('users', (user) => user.age);
```

## Advanced Usage

### Array Observation

glue.js provides powerful array observation capabilities:

```javascript
const glue = new Glue({ 
  items: [1, 2, 3, 4, 5] 
});

// Observe specific index
glue.addObserver('items[2]', (message) => {
  console.log(`Index 2 changed to: ${message.value}`);
});

// Observe all array elements
glue.addObserver('items[]', (message) => {
  console.log(`Array element ${message.index} changed to: ${message.value}`);
});

// Works with nested arrays
const glue = new Glue({
  data: {
    matrix: [[1, 2], [3, 4]]
  }
});

glue.addObserver('data.matrix[0][]', callback); // Observe all elements in first sub-array
```

### Operation Filtering

Listen only to specific operations:

```javascript
// Single operation
glue.addObserver('items:push', (message) => {
  console.log(`Item added: ${message.value}`);
});

// Multiple operations
glue.addObserver('items:push,pop,insert', (message) => {
  console.log(`Array modified via ${message.operation}`);
});

// Multiple keys and operations
glue.addObserver('items:push, count:set', callback);
```

### Context Binding

Control callback execution context:

```javascript
const viewModel = {
  updateCount: 0,
  handleUpdate: function(message) {
    this.updateCount++;
    console.log(`Update #${this.updateCount}: ${message.value}`);
  }
};

glue.addObserver('*', viewModel, viewModel.handleUpdate);
```

## Examples

### Todo List

```javascript
const todos = {
  items: [],
  completed: 0
};

const glue = new Glue(todos);

// Track additions
glue.addObserver('items:push', (message) => {
  console.log(`New todo: ${message.value.text}`);
});

// Track completions
glue.addObserver('items[]:set', (message) => {
  if (message.value.completed) {
    glue.set('completed', glue.target.completed + 1);
  }
});

// Add todos
glue.push('items', { text: 'Learn glue.js', completed: false });
glue.push('items', { text: 'Build app', completed: false });

// Complete a todo
glue.set('items[0].completed', true);
```

### Form Validation

```javascript
const form = {
  fields: {
    email: '',
    password: ''
  },
  errors: {}
};

const glue = new Glue(form);

// Email validation
glue.addObserver('fields.email', (message) => {
  const email = message.value;
  if (!email.includes('@')) {
    glue.set('errors.email', 'Invalid email address');
  } else {
    glue.remove('errors.email');
  }
});

// Password validation
glue.addObserver('fields.password', (message) => {
  const password = message.value;
  if (password.length < 8) {
    glue.set('errors.password', 'Password must be at least 8 characters');
  } else {
    glue.remove('errors.password');
  }
});
```

### Data Synchronization

```javascript
const model = {
  user: { name: '', email: '' },
  lastSync: null
};

const glue = new Glue(model);

// Auto-save on changes
glue.addObserver('user', _.debounce((message) => {
  fetch('/api/user', {
    method: 'PUT',
    body: JSON.stringify(glue.target.user)
  }).then(() => {
    glue.set('lastSync', new Date().toISOString());
  });
}, 500));
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

## Changelog

### v0.6.0-alpha
- **Breaking**: Removed Underscore.js dependency - now zero runtime dependencies!
- Implemented native JavaScript utilities for better performance
- Maintained 100% backward compatibility with existing API
- Improved sparse array handling in filter operations

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 🐛 [Report bugs](https://github.com/felixflores/glue.js/issues)
- 💡 [Request features](https://github.com/felixflores/glue.js/issues)
- 📖 [Read the docs](https://github.com/felixflores/glue.js#readme)
- ⭐ [Star on GitHub](https://github.com/felixflores/glue.js)