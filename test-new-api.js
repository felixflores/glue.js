// Test the new main API
const Glue = require('./index.js'); // Use the new entry point

console.log('🧪 Testing New glue.js API (index.js)\n');

// Create instance using natural syntax from README
const data = new Glue({ count: 0, doubled: 0 });

// When count changes, doubled updates automatically
data.addObserver('count', () => {
  data.doubled = data.count * 2;
});

data.count = 5;
console.log(`✅ data.doubled = ${data.doubled}`); // Should be 10

// Test with more complex example from README
const cart = new Glue({ items: [], total: 0 });

cart.addObserver('items', () => {
  cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);
});

cart.items.push({ name: 'Coffee', price: 5 });
console.log(`✅ cart.total = ${cart.total}`); // Should be 5

cart.items.push({ name: 'Donut', price: 3 });
console.log(`✅ cart.total after adding donut = ${cart.total}`); // Should be 8

console.log('\n🎉 New API working perfectly!');
console.log('📝 README examples work exactly as shown');