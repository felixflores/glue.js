# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

glue.js is a key-value observing library for JavaScript that supports assigned and computed properties in arbitrarily deep object graphs. It implements an observer pattern for managing object state changes and notifying listeners when properties are modified.

Version: 0.6.0-alpha

## Testing

Tests are written using Vitest, a modern testing framework. To run tests:
```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests for CI (with coverage)
npm run test:ci
```

### Legacy Tests
The original Vows tests are still available in the `spec/` directory but are being migrated to Vitest in the `test/` directory.

## Build Commands

```bash
# Minify the library (requires a minification tool)
# Creates glue.min.js from lib/glue.js
```

## Continuous Integration

GitHub Actions runs on every push and pull request to master/main/develop branches:
- Tests across Node.js versions 18.x, 20.x, and 22.x
- Code coverage reporting to Codecov
- Dependency verification
- Library import validation

## Architecture

### Core Components

**Glue Class** (lib/glue.js:23-502)
- Main controller that manages object state and observer notifications
- Maintains two types of listeners:
  - `specific`: Observers for specific properties/indices
  - `generic`: Observers for array elements using `[]` notation
- Includes global event bus for all Glue instances

### Key Methods

#### Observer Management
- **addObserver([key:operation], [context], callback)**: Register observers with optional operation filters
- **removeObserver([key:operation], [context])**: Unregister observers

#### Property Operations
- **set(key, value)**: Update properties and notify observers
- **get([key], [obj])**: Retrieve values from nested object paths (internal use)
- **remove(key)**: Remove properties or array elements
- **swap(key1, key2)**: Exchange values between two locations

#### Array Operations
- **push([key], value)**: Add elements to arrays
- **pop([key])**: Remove last element from arrays
- **insert([key], index, value)**: Insert elements at specific indices
- **filter([key], iterator)**: Filter array elements in place
- **sortBy([key], iterator)**: Sort array elements in place

### Key Notation

- Dot notation for nested properties: `"v1.v2"`
- Array index notation: `"arr[0]"` or `"[0]"` for root arrays
- Generic array notation: `"arr[]"` to observe all array elements
- Multiple keys: `"v1, v2"`
- Operation filters: `"key:set"` or `"key:push,pop"`

### Observer Messages

Callbacks receive a message object containing:
- `operation`: The operation that triggered the notification
- `value`: The new value
- `index`: Array index (for generic array observers)

### Testing Structure

Tests in `spec/` directory validate:
- Observer registration and notification
- Operation-specific filtering
- Nested property changes
- Array operations
- Deep cloning functionality
- Key permutation and normalization

## Development Notes

- The library uses Underscore.js for utility functions
- All public methods return `this` for method chaining
- Callbacks execute in the specified context (default: target object)
- Deep cloning via JSON serialization for change detection
- Global event bus available via `Glue.events`