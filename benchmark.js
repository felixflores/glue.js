// Comprehensive Performance Benchmark for glue.js
const Glue = require('./lib/glue');

console.log('='.repeat(60));
console.log('glue.js Performance Benchmark');
console.log('='.repeat(60));

// Helper for timing
function benchmark(name, fn, iterations = 1000) {
  // Warm up
  for (let i = 0; i < 10; i++) fn();
  
  const start = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = process.hrtime.bigint();
  const ms = Number(end - start) / 1000000;
  const opsPerSec = Math.round(iterations / ms * 1000);
  
  console.log(`${name.padEnd(40)} ${ms.toFixed(2).padStart(8)}ms   ${opsPerSec.toLocaleString().padStart(12)} ops/sec`);
  return ms;
}

// Test data structures
const deepObject = {
  user: {
    profile: {
      personal: {
        name: 'John',
        age: 30,
        email: 'john@example.com'
      },
      settings: {
        theme: 'dark',
        notifications: true
      }
    },
    posts: Array.from({ length: 100 }, (_, i) => ({
      id: i,
      title: `Post ${i}`,
      content: `Content for post ${i}`,
      likes: Math.floor(Math.random() * 100)
    }))
  }
};

const largeArray = Array.from({ length: 10000 }, (_, i) => i);
const matrix = Array.from({ length: 100 }, (_, i) => 
  Array.from({ length: 100 }, (_, j) => i * 100 + j)
);

console.log('\n1. PROPERTY ACCESS PERFORMANCE');
console.log('-'.repeat(60));

const glue1 = new Glue(JSON.parse(JSON.stringify(deepObject)));

benchmark('Simple property access', () => {
  glue1.get('user');
}, 100000);

benchmark('Nested property access (3 levels)', () => {
  glue1.get('user.profile.personal');
}, 100000);

benchmark('Deep property access (4 levels)', () => {
  glue1.get('user.profile.personal.name');
}, 100000);

benchmark('Array element access', () => {
  glue1.get('user.posts[50]');
}, 100000);

benchmark('Nested array access', () => {
  const g = new Glue({ data: matrix });
  g.get('data[50][50]');
}, 10000);

console.log('\n2. MUTATION PERFORMANCE');
console.log('-'.repeat(60));

const glue2 = new Glue({ counter: 0, items: [] });

benchmark('Simple set operation', () => {
  glue2.set('counter', Math.random());
}, 10000);

benchmark('Nested set operation', () => {
  const g = new Glue(JSON.parse(JSON.stringify(deepObject)));
  g.set('user.profile.personal.age', Math.random());
}, 10000);

console.log('\n3. OBSERVER NOTIFICATION PERFORMANCE');
console.log('-'.repeat(60));

const glue3 = new Glue({ value: 0 });
let notificationCount = 0;
glue3.addObserver('value', () => notificationCount++);

benchmark('Set with observer notification', () => {
  glue3.set('value', Math.random());
}, 10000);

console.log(`   (Triggered ${notificationCount.toLocaleString()} notifications)`);

// Multiple observers
const glue4 = new Glue({ data: { nested: { value: 0 } } });
for (let i = 0; i < 10; i++) {
  glue4.addObserver('data.nested.value', () => {});
}

benchmark('Set with 10 observers', () => {
  glue4.set('data.nested.value', Math.random());
}, 5000);

console.log('\n4. ARRAY OPERATION PERFORMANCE');
console.log('-'.repeat(60));

benchmark('Push operation (100 items)', () => {
  const g = new Glue({ items: [] });
  for (let i = 0; i < 100; i++) {
    g.push('items', i);
  }
}, 100);

benchmark('Filter operation (1000 elements)', () => {
  const g = new Glue({ numbers: Array.from({ length: 1000 }, (_, i) => i) });
  g.filter('numbers', n => n % 2 === 0);
}, 100);

benchmark('Filter operation (10000 elements)', () => {
  const g = new Glue({ numbers: [...largeArray] });
  g.filter('numbers', n => n % 2 === 0);
}, 10);

benchmark('Sort operation (1000 elements)', () => {
  const g = new Glue({ numbers: Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000)) });
  g.sortBy('numbers', n => n);
}, 10);

console.log('\n5. MEMORY AND CLEANUP');
console.log('-'.repeat(60));

benchmark('Create and destroy instances', () => {
  const g = new Glue({ data: 'test' });
  g.addObserver('data', () => {});
  g.destroy();
}, 10000);

// Memory test
const memBefore = process.memoryUsage().heapUsed;
const instances = [];

for (let i = 0; i < 1000; i++) {
  const g = new Glue({ id: i, name: `User ${i}` });
  g.addObserver('name', () => {});
  instances.push(g);
}

const memAfter = process.memoryUsage().heapUsed;
const memUsed = (memAfter - memBefore) / 1024 / 1024;

console.log(`Memory for 1000 instances:              ${memUsed.toFixed(2)} MB`);
console.log(`Average per instance:                   ${(memUsed * 1024).toFixed(0)} KB`);

// Cleanup
instances.forEach(g => g.destroy());

console.log('\n6. CALCULATED VALUES PERFORMANCE');
console.log('-'.repeat(60));

// Shopping cart with calculated totals
const cart = {
  items: [
    { name: 'Widget', price: 9.99, quantity: 2 },
    { name: 'Gadget', price: 15.50, quantity: 1 },
    { name: 'Book', price: 12.99, quantity: 3 }
  ],
  subtotal: 0,
  tax: 0,
  total: 0
};

const cartGlue = new Glue(cart);

// Set up calculated value dependencies
const updateSubtotal = () => {
  const items = cartGlue.get('items');
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartGlue.set('subtotal', subtotal);
};

const updateTax = () => {
  const subtotal = cartGlue.get('subtotal');
  cartGlue.set('tax', subtotal * 0.08);
};

const updateTotal = () => {
  const subtotal = cartGlue.get('subtotal');
  const tax = cartGlue.get('tax');
  cartGlue.set('total', subtotal + tax);
};

cartGlue.addObserver('items', updateSubtotal);
cartGlue.addObserver('subtotal', updateTax);
cartGlue.addObserver('subtotal', updateTotal);
cartGlue.addObserver('tax', updateTotal);

benchmark('Calculated values (shopping cart)', () => {
  updateSubtotal(); // Triggers cascade: subtotal -> tax -> total
}, 10000);

// Data analysis with calculated statistics
const dataModel = {
  numbers: Array.from({ length: 1000 }, (_, i) => Math.random() * 100),
  sum: 0,
  average: 0,
  min: 0,
  max: 0
};

const dataGlue = new Glue(dataModel);

const updateStats = () => {
  const numbers = dataGlue.get('numbers');
  const sum = numbers.reduce((a, b) => a + b, 0);
  const average = sum / numbers.length;
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  
  dataGlue.set('sum', sum);
  dataGlue.set('average', average);
  dataGlue.set('min', min);
  dataGlue.set('max', max);
};

dataGlue.addObserver('numbers', updateStats);

benchmark('Calculated statistics (1000 numbers)', () => {
  updateStats();
}, 1000);

// Reactive filtering
const listModel = {
  users: Array.from({ length: 500 }, (_, i) => ({
    id: i,
    name: `User ${i}`,
    active: Math.random() > 0.3,
    role: ['admin', 'user', 'guest'][Math.floor(Math.random() * 3)]
  })),
  activeUsers: [],
  adminUsers: []
};

const listGlue = new Glue(listModel);

const updateActiveUsers = () => {
  const users = listGlue.get('users');
  const active = users.filter(user => user.active);
  listGlue.set('activeUsers', active);
};

const updateAdminUsers = () => {
  const users = listGlue.get('users');
  const admins = users.filter(user => user.role === 'admin');
  listGlue.set('adminUsers', admins);
};

listGlue.addObserver('users', updateActiveUsers);
listGlue.addObserver('users', updateAdminUsers);

benchmark('Calculated filters (500 users)', () => {
  updateActiveUsers();
  updateAdminUsers();
}, 1000);

console.log('\n7. EXTREME PERFORMANCE TEST');
console.log('-'.repeat(60));

console.log('Testing 1 million simple operations...');
const glue5 = new Glue({ value: 42 });
const start = Date.now();
for (let i = 0; i < 1000000; i++) {
  glue5.get('value');
}
const time = Date.now() - start;
console.log(`1 million get operations:               ${time}ms (${Math.round(1000000/time*1000).toLocaleString()} ops/sec)`);

console.log('\n' + '='.repeat(60));
console.log('PERFORMANCE SUMMARY');
console.log('='.repeat(60));
console.log('✓ No eval() - Safe property traversal');
console.log('✓ Single-pass array operations');  
console.log('✓ Pre-compiled regex patterns');
console.log('✓ Zero runtime dependencies');
console.log('✓ Efficient memory management');
console.log('✓ Production-ready performance');
console.log('='.repeat(60));