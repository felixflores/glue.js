# Complete API Reference

## Constructor

### `new Glue(target)`

Creates a new Glue instance to observe an object or array.

**Parameters:**
- `target` - The object or array to make observable

**Returns:** A new Glue instance

**Example:**
```javascript
const glue = new Glue({ name: 'John', age: 30 });
const arrayGlue = new Glue([1, 2, 3, 4]);
```

---

## Observer Methods

### `addObserver([key], [context], callback)`

Registers an observer that triggers when specified properties change.

**Parameters:**
- `key` *(string, optional)* - Property path(s) to observe. Defaults to `*` (all properties)
- `context` *(object, optional)* - Context object for callback execution
- `callback` *(function)* - Function to execute when properties change

**Key Syntax:**
- `'*'` - Observe all properties
- `'prop'` - Observe specific property
- `'user.name'` - Observe nested property
- `'items[0]'` - Observe specific array index
- `'items[]'` - Observe all array elements
- `'prop1, prop2'` - Observe multiple properties
- `'items:push'` - Observe specific operations
- `'items:push,pop'` - Observe multiple operations

**Returns:** The Glue instance (chainable)

**Examples:**
```javascript
// Basic observer
glue.addObserver('name', (message) => {
  console.log('Name changed:', message.value);
});

// Observer with context
const ui = { updateCount: 0 };
glue.addObserver('name', ui, function(message) {
  this.updateCount++; // 'this' refers to ui
});

// Multiple properties
glue.addObserver('name, age', (message) => {
  console.log('Person updated');
});

// Operation filtering
glue.addObserver('items:push', (message) => {
  console.log('Item added:', message.value);
});

// Array element observation
glue.addObserver('items[]', (message) => {
  console.log(`Item at index ${message.index} changed`);
});
```

### `removeObserver([key], [context])`

Removes previously registered observers.

**Parameters:**
- `key` *(string, optional)* - Property path(s) to stop observing
- `context` *(object, optional)* - Context object to remove observers for

**Returns:** The Glue instance (chainable)

**Examples:**
```javascript
// Remove all observers for a key
glue.removeObserver('name');

// Remove observers for specific context
glue.removeObserver('name', myContext);

// Remove all observers
glue.removeObserver();
```

---

## Property Operations

### `get([key], [obj])`

Retrieves values from the observed object.

**Parameters:**
- `key` *(string, optional)* - Property path to retrieve. If omitted, returns entire target
- `obj` *(object, optional)* - Object to retrieve from (internal use)

**Returns:** The value at the specified path

**Examples:**
```javascript
const glue = new Glue({ user: { name: 'John', age: 30 } });

glue.get();           // { user: { name: 'John', age: 30 } }
glue.get('user');     // { name: 'John', age: 30 }
glue.get('user.name'); // 'John'
glue.get('user.age');  // 30
```

### `set(key, value)`

Sets a property value and triggers observers.

**Parameters:**
- `key` *(string)* - Property path to set
- `value` *(any)* - Value to assign

**Returns:** The Glue instance (chainable)

**Examples:**
```javascript
glue.set('name', 'Jane');
glue.set('user.age', 31);
glue.set('user.contact.email', 'jane@example.com');

// Chainable
glue.set('name', 'Jane').set('age', 31);
```

### `remove(key)`

Removes a property and triggers observers.

**Parameters:**
- `key` *(string)* - Property path to remove

**Returns:** The removed value

**Examples:**
```javascript
const removed = glue.remove('user.phone');
glue.remove('temporary');
```

### `swap(key1, key2)`

Swaps values between two properties and triggers observers.

**Parameters:**
- `key1` *(string)* - First property path
- `key2` *(string)* - Second property path

**Returns:** The Glue instance (chainable)

**Examples:**
```javascript
glue.swap('user.firstName', 'user.lastName');
glue.swap('items[0]', 'items[5]');
```

---

## Array Operations

### `push([key], value)`

Adds an element to the end of an array and triggers observers.

**Parameters:**
- `key` *(string, optional)* - Array property path. If omitted, operates on root array
- `value` *(any)* - Value to add

**Returns:** The new length of the array

**Examples:**
```javascript
// Object with array property
const glue = new Glue({ items: [1, 2, 3] });
glue.push('items', 4); // items is now [1, 2, 3, 4]

// Root array
const arrayGlue = new Glue([1, 2, 3]);
arrayGlue.push(4); // array is now [1, 2, 3, 4]
```

### `pop([key])`

Removes and returns the last element from an array.

**Parameters:**
- `key` *(string, optional)* - Array property path. If omitted, operates on root array

**Returns:** The removed element

**Examples:**
```javascript
const last = glue.pop('items');
const rootLast = arrayGlue.pop();
```

### `insert([key], index, value)`

Inserts an element at a specific array index.

**Parameters:**
- `key` *(string, optional)* - Array property path. If omitted, operates on root array
- `index` *(number)* - Index at which to insert
- `value` *(any)* - Value to insert

**Returns:** The Glue instance (chainable)

**Examples:**
```javascript
glue.insert('items', 1, 'inserted'); // Insert at index 1
arrayGlue.insert(0, 'first'); // Insert at beginning
```

### `filter([key], iterator)`

Filters array elements in place using an iterator function.

**Parameters:**
- `key` *(string, optional)* - Array property path. If omitted, operates on root array
- `iterator` *(function)* - Function to test each element

**Returns:** The Glue instance (chainable)

**Examples:**
```javascript
// Keep only even numbers
glue.filter('numbers', (n) => n % 2 === 0);

// Filter objects
glue.filter('users', (user) => user.active);

// Root array
arrayGlue.filter((item) => item > 5);
```

### `sortBy([key], iterator)`

Sorts array elements in place using an iterator function.

**Parameters:**
- `key` *(string, optional)* - Array property path. If omitted, operates on root array
- `iterator` *(function)* - Function to extract sort value from each element

**Returns:** The Glue instance (chainable)

**Examples:**
```javascript
// Sort by numeric value
glue.sortBy('numbers', (n) => n);

// Sort objects by property
glue.sortBy('users', (user) => user.age);

// Sort by computed value
glue.sortBy('items', (item) => item.price * item.quantity);
```

---

## Utility Methods

### `destroy()`

Removes all observers and cleans up the Glue instance.

**Returns:** The Glue instance

**Example:**
```javascript
glue.destroy(); // Clean up all observers
```

---

## Message Object

Observer callbacks receive a message object with the following properties:

### Standard Properties
- `value` - The new value that was set
- `operation` - The operation that triggered the observer ('set', 'push', 'pop', etc.)

### Array-Specific Properties
- `index` *(number)* - Array index for generic array observers (`items[]`)

### Example Messages
```javascript
// Set operation
{
  value: 'John',
  operation: 'set'
}

// Array operation
{
  value: 'new item',
  operation: 'push',
  index: 3
}

// Remove operation
{
  value: undefined,
  operation: 'remove'
}
```

---

## Operation Types

The following operations trigger observers:

- `'set'` - Property assignment via `set()`
- `'remove'` - Property removal via `remove()`
- `'swap'` - Property swapping via `swap()`
- `'push'` - Array element addition via `push()`
- `'pop'` - Array element removal via `pop()`
- `'insert'` - Array element insertion via `insert()`
- `'filter'` - Array filtering via `filter()`
- `'sortBy'` - Array sorting via `sortBy()`

---

## Key Path Syntax

Glue.js supports powerful key path syntax for precise observation:

### Property Paths
```javascript
'name'           // Root property
'user.name'      // Nested property
'user.contact.email' // Deep nesting
```

### Array Notation
```javascript
'items[0]'       // Specific array index
'items[]'        // All array elements (generic)
'matrix[1][2]'   // Multi-dimensional arrays
'users[].name'   // Property of array elements
```

### Multiple Keys
```javascript
'name, age'      // Multiple properties
'user.name, user.age, user.email' // Multiple nested
```

### Operation Filtering
```javascript
'items:push'     // Only push operations
'items:push,pop' // Push and pop operations
'name:set'       // Only set operations
'items:push, name:set' // Multiple keys with operations
```

### Global Observation
```javascript
'*'              // All properties and operations
'*:set'          // All set operations
'*:push,pop'     // All array operations
```

---

## Error Handling

Glue.js handles common error scenarios gracefully:

- **Invalid key paths** - Silently ignored
- **Missing properties** - Return `undefined`
- **Type mismatches** - Array operations on non-arrays are ignored
- **Circular references** - Handled in deep cloning operations

For debugging, check the browser console for warnings about invalid operations.